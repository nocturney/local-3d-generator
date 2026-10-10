# LOCAL3D G2 Manual Session — never auto-starts or schedules inference.
# Launch deliberately from a user PowerShell window, stop with Ctrl+C.
# Dedicated port and data directory prevent collision with active G1 4177.
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 4179
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$venv = Join-Path $root 'runtime\engines\triposr\venv\Scripts\python.exe'
$checkpoint = Join-Path $root 'runtime\engines\triposr\weights\model.ckpt'
if (-not (Test-Path -LiteralPath $venv) -or -not (Test-Path -LiteralPath $checkpoint)) {
    throw 'TripoSR isolated runtime not found. G2 manual mode must not start without its installed model.'
}
$usedPort = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($usedPort) { throw "Port $Port already in use; refusing to alter or terminate its owner" }
$data = Join-Path $root 'runtime\data-g2-manual'
New-Item -ItemType Directory -Path $data -Force | Out-Null
$previous = @{}
foreach ($name in @('L3D_ENABLE_TRIPOSR','L3D_PORT','L3D_DATA_DIR')) {
    $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
    $env:L3D_ENABLE_TRIPOSR = '1'
    $env:L3D_PORT = [string]$Port
    $env:L3D_DATA_DIR = $data
    $node = (Get-Command node -ErrorAction Stop).Source
    Write-Output ('G2_MANUAL_SESSION http://127.0.0.1:' + $Port)
    Write-Output 'Manual GPU confirmation is required separately for each image job.'
    Write-Output 'No printer/cloud, no background GPU queue, no Office integration, no autostart.'
    Set-Location $root
    & $node 'server/index.js'
} finally {
    foreach ($name in $previous.Keys) {
        [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process')
    }
    Write-Output 'G2_MANUAL_SESSION_CLOSED; process environment restored.'
}
