<#
.SYNOPSIS
    tools/setup_infinite_service.ps1
    Instalador y Administrador del Servicio de Sincronización Infinita de Clúster
    para Civer Cloud Enterprise (Windows Task Scheduler).

.DESCRIPTION
    Registra, consulta o desinstala la tarea programada 'CiverInfiniteClusterSync'
    para garantizar que el bucle de sincronización (civer_infinite_sync.ps1) y el
    centinela canario (health_canary_daemon.cjs) se ejecuten en segundo plano de
    forma desatendida y se reactiven tras reinicios.
#>

param (
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status
)

$TaskName = "CiverInfiniteClusterSync"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
$SyncScript = Join-Path $ScriptDir "civer_infinite_sync.ps1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GESTOR DE SERVICIO INFINITO CIVER CLOUD ENTERPRISE     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($Uninstall) {
    Write-Host "[SERVICIO] Desinstalando tarea programada: $TaskName..." -ForegroundColor Yellow
    schtasks.exe /Delete /TN $TaskName /F 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tarea programada $TaskName eliminada con éxito." -ForegroundColor Green
    } else {
        Write-Host "⚠️ La tarea no estaba registrada previamente." -ForegroundColor Gray
    }
    exit 0
}

if ($Install) {
    Write-Host "[SERVICIO] Registrando tarea programada: $TaskName..." -ForegroundColor Cyan
    Write-Host "Directorio del Proyecto: $ProjectDir" -ForegroundColor Gray
    Write-Host "Script de Sincronización: $SyncScript" -ForegroundColor Gray

    # Comando de ejecución oculta desatendida
    $ActionCmd = "powershell.exe"
    $ActionArgs = "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command ""Set-Location '$ProjectDir'; & '$SyncScript'"""

    # Registrar mediante schtasks para máxima compatibilidad
    schtasks.exe /Create /TN $TaskName /TR "$ActionCmd $ActionArgs" /SC ONLOGON /RL HIGHEST /F

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tarea $TaskName instalada exitosamente con permisos de Administrador." -ForegroundColor Green
        Write-Host "Iniciando tarea inmediatamente..." -ForegroundColor Cyan
        schtasks.exe /Run /TN $TaskName
    } else {
        Write-Host "❌ Error al registrar la tarea programada." -ForegroundColor Red
        exit 1
    }
    exit 0
}

# Por defecto: Consultar Estado
Write-Host "[ESTADO] Consultando tarea programada: $TaskName..." -ForegroundColor Cyan
$Query = schtasks.exe /Query /TN $TaskName /FO LIST 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tarea $TaskName está REGISTRADA y ACTIVA:" -ForegroundColor Green
    $Query | Out-String | Write-Host -ForegroundColor Gray
} else {
    Write-Host "ℹ️ La tarea $TaskName no está registrada en el Programador de Tareas." -ForegroundColor Yellow
    Write-Host "Para instalarla ejecuta: .\tools\setup_infinite_service.ps1 -Install" -ForegroundColor Cyan
}

exit 0
