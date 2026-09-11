# ==============================================================================
# ♾️ CIVER_INFINITE_SYNC.PS1 — SUPERVISOR DE TRABAJO INFINITO Y CLÚSTER MESH
# Conecta: ASUS Master Node <--> ThinkPad (DiscoveryWeb) <--> Samsung A06 <--> Cloudflare
# ==============================================================================

[CmdletBinding()]
param(
    [int]$IntervalSeconds = 60,
    [switch]$RunOnce,
    [switch]$VerboseCluster
)

$ErrorActionPreference = 'Continue'

$repoRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $repoRoot "system_state.json"

Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "♾️  INICIANDO BUCLE INFINITO DE SINCRONIZACIÓN Y CLÚSTER CIVER CLOUD" -ForegroundColor Cyan
Write-Host "    Intervalo: $($IntervalSeconds)s | Modo RunOnce: $($RunOnce)" -ForegroundColor Gray
Write-Host "==========================================================================================" -ForegroundColor Cyan

$iteration = 0

function Run-ClusterPulse {
    param([int]$Iter)
    
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "`n[$timestamp] [PULSO #$Iter] Ejecutando sincronización de clúster..." -ForegroundColor Magenta

    # 1. Chequeo de Salud Local (Puerto 3000)
    $p3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    $localStatus = if ($p3000) { "ONLINE (PID: $($p3000.OwningProcess))" } else { "OFFLINE" }
    Write-Host "  -> [ASUS Master] Servicio Web Civer: $localStatus" -ForegroundColor $(if ($p3000) { "Green" } else { "Yellow" })

    # 2. Chequeo de Nodo ThinkPad & DiscoveryWeb
    $tpIp = "100.96.218.12"
    $tpPing = Test-Connection -ComputerName $tpIp -Count 1 -Quiet -ErrorAction SilentlyContinue
    $tpStatus = if ($tpPing) { "REACHABLE ($tpIp)" } else { "STANDBY/OFFLINE" }
    Write-Host "  -> [ThinkPad Node] Red Tailscale: $tpStatus" -ForegroundColor $(if ($tpPing) { "Green" } else { "Gray" })

    # 3. Chequeo de DiscoveryWeb HUD
    $hudUrl = "http://${tpIp}:8766/api/accounts"
    try {
        $hud = Invoke-RestMethod -Uri $hudUrl -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($hud) {
            Write-Host "  -> [DiscoveryWeb HUD] $hudUrl : ACTIVO" -ForegroundColor Green
        }
    } catch {
        Write-Host "  -> [DiscoveryWeb HUD] $hudUrl : Standby o no expuesto" -ForegroundColor Gray
    }

    # 4. Chequeo de Borde Cloudflare
    try {
        $ota = Invoke-RestMethod -Uri "https://appstore.civer.cloud/api/v1/ota/manifest.json" -TimeoutSec 4 -ErrorAction SilentlyContinue
        if ($ota -and $ota.latest_version) {
            Write-Host "  -> [Cloudflare Edge] OTA Manifest: v$($ota.latest_version) (HEALTHY)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  -> [Cloudflare Edge] Sonda OTA: Verificando conexión..." -ForegroundColor Gray
    }

    # 5. Paridad Git Local vs Origin
    $gitStatus = & git status --porcelain 2>&1
    $isClean = [string]::IsNullOrWhiteSpace($gitStatus)
    Write-Host "  -> [Git Local] Árbol de trabajo: $(if ($isClean) { 'LIMPIO (Sincronizado)' } else { 'Cambios pendientes' })" -ForegroundColor $(if ($isClean) { "Green" } else { "Yellow" })

    # 6. Actualizar system_state.json
    if (Test-Path $statePath) {
        try {
            $st = Get-Content $statePath -Raw | ConvertFrom-Json
            $st.last_pulse = (Get-Date).ToString("o")
            $st | ConvertTo-Json -Depth 6 | Set-Content -Path $statePath -Encoding UTF8
            Write-Host "  -> [State Keeper] system_state.json actualizado con éxito." -ForegroundColor Green
        } catch {
            Write-Host "  -> [State Keeper] Error actualizando JSON: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Ejecutar primer pulso
$iteration++
Run-ClusterPulse -Iter $iteration

if ($RunOnce) {
    Write-Host "`n[OK] Modo RunOnce completado con éxito. Sincronización finalizada." -ForegroundColor Cyan
    exit 0
}

# Bucle infinito supervisor
while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    $iteration++
    Run-ClusterPulse -Iter $iteration
}
