# Licensed, user-approved G2 staging. Download model and DINO config; never run inference here.
$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'runtime\engines\triposr'
$weights = Join-Path $root 'weights'
$cache = Join-Path $root 'hf-cache'
New-Item -ItemType Directory -Path $weights,$cache -Force | Out-Null
$revision = '5b521936b01fbe1890f6f9baed0254ab6351c04a'
$expectedSha = '429e2c6b22a0923967459de24d67f05962b235f79cde6b032aa7ed2ffcd970ee'
$expectedBytes = [long]1677246742
$uri = "https://huggingface.co/stabilityai/TripoSR/resolve/$revision/model.ckpt?download=true"
$dest = Join-Path $weights 'model.ckpt'
$partial = $dest + '.part'
function VerifyCheckpoint([string]$file) {
    if (-not (Test-Path -LiteralPath $file)) { return $false }
    $actualBytes = (Get-Item -LiteralPath $file).Length
    Write-Output "WEIGHTS_BYTES=$actualBytes"
    if ($actualBytes -ne $expectedBytes) { return $false }
    $actualSha = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Output "WEIGHTS_SHA256=$actualSha"
    return ($actualSha -eq $expectedSha)
}
if (-not (VerifyCheckpoint $dest)) {
    Write-Output "DOWNLOADING_TRIPOSR_MODEL_PARTIAL=$partial"
    & curl.exe -f -L -S -s --retry 5 --retry-delay 6 --connect-timeout 30 -C - -o $partial $uri
    if ($LASTEXITCODE -ne 0) { throw "Checkpoint download failed curl=$LASTEXITCODE, partial retained for resume" }
    if (-not (VerifyCheckpoint $partial)) { throw 'Checkpoint size/hash mismatch, abort without promoting file' }
    Move-Item -LiteralPath $partial -Destination $dest -Force
}
Write-Output 'MODEL_CHECKPOINT_VERIFIED'
$configDest = Join-Path $weights 'config.yaml'
if (-not (Test-Path $configDest) -or (Get-Item $configDest).Length -ne 987) {
    & curl.exe -f -L -S -s --retry 3 --connect-timeout 30 -o ($configDest+'.part') "https://huggingface.co/stabilityai/TripoSR/resolve/$revision/config.yaml?download=true"
    if ($LASTEXITCODE -ne 0) { throw 'Failed downloading pinned config.yaml' }
    if ((Get-Item ($configDest+'.part')).Length -ne 987) { throw 'Incorrect config.yaml size' }
    Move-Item -LiteralPath ($configDest+'.part') -Destination $configDest -Force
}
Write-Output ('TRIPOSR_CONFIG_SHA256=' + (Get-FileHash $configDest -Algorithm SHA256).Hash.ToLowerInvariant())
Write-Output 'WEIGHTS_STAGED_AND_VERIFIED'
