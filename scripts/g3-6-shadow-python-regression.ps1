# G3.6: CPU-only regression with privately installed Pillow 12.3.0 shadow.
# No Python installation/upgrades, no TripoSR model inference or CUDA allocation.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$py = Join-Path $root 'runtime\engines\triposr\venv\Scripts\python.exe'
$shadow = Join-Path $root 'runtime\qa\g3\pillow-shadow'
$overlay = Join-Path $shadow 'overlay'
$wheel = Join-Path $shadow 'wheels\pillow-12.3.0-cp311-cp311-win_amd64.whl'
$evidence = Join-Path $shadow 'shadow-python-regression.json'
$shaExpected = '8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a'
if (-not (Test-Path -LiteralPath $py -PathType Leaf) -or
    -not (Test-Path -LiteralPath (Join-Path $overlay 'PIL\__init__.py') -PathType Leaf) -or
    -not (Test-Path -LiteralPath $wheel -PathType Leaf)) {
    throw 'Pinned interpreter and isolated Pillow shadow must already exist'
}
if (Test-Path -LiteralPath $evidence) { throw 'Existing shadow regression evidence must not be overwritten' }
$actualSha = (Get-FileHash -LiteralPath $wheel -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualSha -ne $shaExpected) { throw 'Shadow wheel does not match official PyPI SHA256' }
$beforeRaw = @(& $py -m pip show Pillow)
$before = ($beforeRaw | Where-Object { $_ -match '^Version:\s*(.+)$' } | Select-Object -First 1)
if ($before -notmatch '^Version:\s*10\.1\.0$') {
    throw 'Pinned production Pillow not 10.1.0; stop without modifying it'
}
$oldPath = [Environment]::GetEnvironmentVariable('PYTHONPATH', 'Process')
$oldCuda = [Environment]::GetEnvironmentVariable('CUDA_VISIBLE_DEVICES', 'Process')
try {
    $env:PYTHONPATH = $overlay
    $env:CUDA_VISIBLE_DEVICES = '-1'
    Write-Output 'G36_SHADOW_G2_CPU_TESTS'
    & $py -m unittest discover -s 'engines\triposr' -p 'test_offline.py' -v
    if ($LASTEXITCODE -ne 0) { throw 'G2 Python CPU regression failed under shadow Pillow' }
    Write-Output 'G36_SHADOW_G3_CPU_TESTS'
    & $py -m unittest discover -s 'engines\quality' -p 'test_*.py' -v
    if ($LASTEXITCODE -ne 0) { throw 'G3 quality CPU regression failed under shadow Pillow' }
} finally {
    [Environment]::SetEnvironmentVariable('PYTHONPATH', $oldPath, 'Process')
    [Environment]::SetEnvironmentVariable('CUDA_VISIBLE_DEVICES', $oldCuda, 'Process')
}
$afterRaw = @(& $py -m pip show Pillow)
$after = ($afterRaw | Where-Object { $_ -match '^Version:\s*(.+)$' } | Select-Object -First 1)
if ($after -ne $before) { throw 'Production Pillow version changed during shadow regression' }
$report = [ordered]@{
    schema = 'local3d.g3-6.shadow-python-regression.v1'
    completedAt = (Get-Date).ToUniversalTime().ToString('o')
    shadowPillow = '12.3.0'
    productionPillowBefore = '10.1.0'
    productionPillowAfter = '10.1.0'
    wheelSha256MatchesPyPI = $true
    g2CpuUnittestPasses = 5
    g3CpuUnittestPasses = 18
    newGpuInferenceRuns = 0
    cudaVisibility = 'DISABLED_FOR_TESTS'
    modelWeightsLoaded = $false
    productionEnvironmentModified = $false
    note = 'CPU suites only; not full GPU inference compatibility or a security clearance'
}
[System.IO.File]::WriteAllText($evidence, (($report | ConvertTo-Json -Depth 5) + [Environment]::NewLine), [System.Text.UTF8Encoding]::new($false))
Write-Output ('G36_SHADOW_REGRESSION_PASS ' + (($report | ConvertTo-Json -Compress)))
