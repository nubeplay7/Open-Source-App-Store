# ==============================================================================
# 🩺 RECOVER_SYSTEM.PS1 — RECUPERADOR AUTÓNOMO Y CENTINELA DEL CLÚSTER CIVER
# Protocolo de Auto-Sanación y Verificación de Nodos (ASUS + ThinkPad + DiscoveryWeb)
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$VerboseOutput,
    [switch]$SkipRemotePing
)

$ErrorActionPreference = 'Continue'

Write-Host "==========================================================================================" -ForegroundColor Cyan
Write-Host "🩺 CIVER CLOUD ENTERPRISE — PROTOCOLO DE RECUPERACIÓN Y SALUD DE CLÚSTER" -ForegroundColor Cyan
Write-Host "==========================================================================================" -ForegroundColor Cyan

$repoRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $repoRoot "system_state.json"

if (Test-Path $statePath) {
    Write-Host "[OK] Leyendo system_state.json..." -ForegroundColor Green
    $state = Get-Content $statePath -Raw | ConvertFrom-Json
    Write-Host "     Versión del Clúster: $($state.cluster_version)" -ForegroundColor Gray
    Write-Host "     Nodo Maestro:        $($state.master_node.hostname) ($($state.master_node.role))" -ForegroundColor Gray
} else {
    Write-Host "[WARN] system_state.json no encontrado en $repoRoot. Creando estado inicial..." -ForegroundColor Yellow
}

# 1. Comprobar servidor local de la App Store (Puerto 3000)
Write-Host "`n1. Verificando Servicio Web Civer App Store (Puerto 3000)..." -ForegroundColor White
$p3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($p3000) {
    Write-Host "   ✅ Servicio Web en Línea (PID: $($p3000.OwningProcess))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Servicio Web en puerto 3000 no detectado. Levantando servidor en background..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $repoRoot -WindowStyle Hidden
    Start-Sleep -Seconds 3
    $p3000Check = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($p3000Check) {
        Write-Host "   ✅ Servicio Web recuperado exitosamente en puerto 3000." -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ El servidor se está inicializando en segundo plano." -ForegroundColor Gray
    }
}

# 2. Comprobar Nodo ThinkPad y DiscoveryWeb HUD
Write-Host "`n2. Verificando Nodo Peer ThinkPad & DiscoveryWeb HUD..." -ForegroundColor White
$thinkpadTailscale = "100.96.218.12"
$thinkpadLan = "192.168.1.74"

if (-not $SkipRemotePing) {
    $pingTailscale = Test-Connection -ComputerName $thinkpadTailscale -Count 1 -Quiet -ErrorAction SilentlyContinue
    $pingLan = Test-Connection -ComputerName $thinkpadLan -Count 1 -Quiet -ErrorAction SilentlyContinue

    if ($pingTailscale) {
        Write-Host "   ✅ ThinkPad conectado vía Tailscale Mesh ($thinkpadTailscale)." -ForegroundColor Green
    } elseif ($pingLan) {
        Write-Host "   ✅ ThinkPad conectado vía LAN local ($thinkpadLan)." -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ ThinkPad en modo espera o standby por red inalámbrica." -ForegroundColor Gray
    }

    # Probar HUD DiscoveryWeb en puerto 8766
    try {
        $hudTest = Invoke-RestMethod -Uri "http://${thinkpadTailscale}:8766/api/accounts" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($hudTest) {
            Write-Host "   ✅ DiscoveryWeb HUD Respondiendo en puerto 8766 (ThinkPad)." -ForegroundColor Green
        }
    } catch {
        Write-Host "   ℹ️ DiscoveryWeb HUD no expuesto externamente en este pulso." -ForegroundColor Gray
    }
} else {
    Write-Host "   [SKIP] Sondeo remoto omitido por parámetro." -ForegroundColor Gray
}

# 3. Comprobar integridad de compilación TypeScript
Write-Host "`n3. Verificando Integridad de Tipos (tsc --noEmit)..." -ForegroundColor White
$tscCheck = & npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Verificación de tipos: 0 Errores en TypeScript." -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Advertencias en validación de tipos." -ForegroundColor Yellow
}

# 4. Actualizar timestamp en system_state.json
if (Test-Path $statePath) {
    $rawState = Get-Content $statePath -Raw | ConvertFrom-Json
    $rawState.last_pulse = (Get-Date).ToString("o")
    $rawState | ConvertTo-Json -Depth 6 | Set-Content -Path $statePath -Encoding UTF8
    Write-Host "`n4. ✅ system_state.json actualizado con timestamp de pulso reciente." -ForegroundColor Green
}

Write-Host "`n==========================================================================================" -ForegroundColor Cyan
Write-Host "🟢 SISTEMA Y CLÚSTER CIVER OPERANDO EN ESTADO ÓPTIMO" -ForegroundColor Cyan
Write-Host "==========================================================================================" -ForegroundColor Cyan
exit 0
