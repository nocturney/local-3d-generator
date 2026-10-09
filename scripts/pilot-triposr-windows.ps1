# User-authorized one-time local GPU pilot, isolated from Office / without print.
# Hard stops: no loaded Ollama model, >= 10GB available VRAM before start,
# <= 65% current GPU utilization, max 8.5GB additional VRAM use and 240s time.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$engine = Join-Path $root 'runtime\engines\triposr'
$python = Join-Path $engine 'venv\Scripts\python.exe'
$worker = Join-Path $root 'engines\triposr\worker.py'
$source = Join-Path $engine 'src\examples\chair.png'
if (-not (Test-Path $python) -or -not (Test-Path $worker) -or -not (Test-Path $source)) {
    throw 'Missing isolated model dependencies or licensed fixture'
}
function Read-Gpu {
    $line = & nvidia-smi --query-gpu=memory.used,memory.free,utilization.gpu --format=csv,noheader,nounits 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'NVIDIA metrics unavailable; do not allocate CUDA' }
    $cols = [string]$line -split ','
    if ($cols.Count -ne 3) { throw 'Unexpected GPU metrics' }
    return [pscustomobject]@{used=[int]$cols[0].Trim(); free=[int]$cols[1].Trim(); utilization=[int]$cols[2].Trim()}
}
function Check-OfficeModel {
    try {
        $response = Invoke-RestMethod -Uri 'http://127.0.0.1:11555/api/ps' -TimeoutSec 3
        $models = @($response.models) | Where-Object { $_ -ne $null }
        if ($models.Count -gt 0) { throw ('Office Ollama has '+$models.Count+' model(s) resident') }
    } catch {
        throw ('Cannot establish independent Office-model idle status: '+$_.Exception.Message)
    }
}
Write-Output 'TRIPOSR_GPU_GATE_BEGIN'
$observations = @()
foreach ($i in 1..3) {
    Check-OfficeModel
    $gpu = Read-Gpu
    $observations += $gpu
    Write-Output ('BASELINE_'+$i+'='+($gpu | ConvertTo-Json -Compress))
    if ($gpu.free -lt 10000) { throw 'GPU_CONFLICT: free VRAM below 10000 MiB' }
    if ($gpu.utilization -gt 65) { throw 'GPU_CONFLICT: sustained active GPU over 65 percent' }
    if ($i -lt 3) { Start-Sleep -Seconds 2 }
}
$initial = $observations[-1]
Write-Output 'GPU_GATE_PASS: no loaded Office Ollama model, free VRAM and bounded utilization'
$pilotRoot = Join-Path $root 'runtime\pilots'
$logRoot = Join-Path $root 'runtime\pilot-logs'
New-Item -ItemType Directory -Path $pilotRoot,$logRoot -Force | Out-Null
$id = 'tripo-' + (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfff') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$output = Join-Path $pilotRoot $id
$stdout = Join-Path $logRoot ($id+'.out.log')
$stderr = Join-Path $logRoot ($id+'.err.log')
$manifest = Join-Path $logRoot ($id+'.guard.json')
$record = @{
    schema='local3d.g2.gpu-guard.v1'
    pilot=$id
    startedAt=(Get-Date).ToUniversalTime().ToString('o')
    initialFreeMiB=$initial.free
    initialUsedMiB=$initial.used
    initialUtilizationPct=$initial.utilization
    officeOllamaModels=0
    gpuMaxAdditionalUsedMiB=8500
    gpuMinFreeMiB=2500
    maxRuntimeSeconds=240
    model='TripoSR image-only licensed fixture'
    status='STARTING'
}
$record | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifest -Encoding UTF8
$proc = Start-Process -FilePath $python -ArgumentList @(
    $worker,'--image',$source,'--output-dir',$output,'--resolution','128','--chunk-size','2048'
) -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
$clock = [Diagnostics.Stopwatch]::StartNew()
$guardState = 'PASS'
try {
    while (-not $proc.HasExited) {
        Start-Sleep -Seconds 3
        $proc.Refresh()
        if ($proc.HasExited) { break }
        if ($clock.Elapsed.TotalSeconds -gt 240) { $guardState='TIMEOUT_240S'; break }
        $gpu = Read-Gpu
        if ($gpu.free -lt 2500) { $guardState='FREE_VRAM_BELOW_2500'; break }
        if ($gpu.used -gt ($initial.used + 8500)) { $guardState='EXCEEDED_DELTA_VRAM_8500'; break }
        try { Check-OfficeModel } catch { $guardState='OFFICE_MODEL_CONFLICT'; break }
    }
    if ($guardState -ne 'PASS') {
        & taskkill.exe /PID $proc.Id /T /F 2>&1 | Select-Object -First 4 | Out-String | Write-Output
        throw ('GPU_PILOT_ABORTED: '+$guardState)
    }
    $proc.WaitForExit()
    $proc.Refresh()
    $record.exitCode = $proc.ExitCode
    # Remote PowerShell Start-Process can yield a null ExitCode for fast children.
    # Never equate null to failure or success: verify positive worker completion
    # AND the independent GLB/QA artifacts before recording success.
    $workerLog = if (Test-Path $stdout) { Get-Content $stdout -Raw } else { '' }
    if (($null -ne $proc.ExitCode -and $proc.ExitCode -ne 0) -or -not $workerLog.Contains('TRIPOSR_PILOT_SUCCESS ')) {
        Write-Output 'WORKER_STDERR:'
        if (Test-Path $stderr) { Get-Content $stderr -Tail 35 }
        throw ('TripoSR worker completion not verified. Exit code='+$proc.ExitCode)
    }
    if (-not (Test-Path (Join-Path $output 'qa-report.json'))) { throw 'No real inference QA report' }
    $report = Get-Content (Join-Path $output 'qa-report.json') -Raw | ConvertFrom-Json
    $modelPath = Join-Path $output 'model.glb'
    if ($report.simulation -ne $false -or $report.mode -ne 'LOCAL_REAL_INFERENCE' -or
        $report.status -ne 'DRAFT' -or $report.printQualified -ne $false -or
        -not (Test-Path $modelPath) -or $report.faces -le 0 -or $report.vertices -le 0) {
        throw 'Output is missing, fabricated or lacks DRAFT geometry evidence'
    }
    $modelHash = (Get-FileHash -LiteralPath $modelPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($modelHash -ne $report.artifactSha256) { throw 'Model GLB SHA256 does not match report' }
    $record.status = 'COMPLETED_REAL_INFERENCE_DRAFT'
    $record.output = $output
    $record.peakCudaReservedMiB = $report.peakCudaReservedMiB
    $record.elapsedSeconds = $report.elapsedSeconds
    Write-Output ('TRIPOSR_REAL_PILOT_SUCCESS=' + $output)
    $report | ConvertTo-Json -Depth 6
} catch {
    $record.status = 'FAILED_OR_GUARD_ABORTED'
    $record.guardState = $guardState
    throw
} finally {
    $record.finishedAt=(Get-Date).ToUniversalTime().ToString('o')
    $record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifest -Encoding UTF8
    Write-Output ('PILOT_GUARD_MANIFEST='+$manifest)
    Write-Output ('PILOT_STDOUT='+$stdout)
    Write-Output ('PILOT_STDERR='+$stderr)
}
