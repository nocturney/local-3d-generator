<# G3.44: read-only Windows G1 noninteractive startup prerequisites.
   Prints ONLY a fixed allowlist of aggregate facts. NO account details,
   task XML, ACL ACE/SID, full executable paths or private data.
   Never registers tasks, runs G1, changes ACLs/OS, copies files or reboots.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$g1Source = Join-Path $root 'server\index.js'
$expectedSourceSha = 'b60e8f088a6846de9f6003333c55fad963efbfbc3752885eb9358cfeb9b57759'
if (-not (Test-Path -LiteralPath $g1Source -PathType Leaf)) { throw 'G344 G1 source not found' }
$sourceMatches = ((Get-FileHash -LiteralPath $g1Source -Algorithm SHA256).Hash.ToLowerInvariant() -eq $expectedSourceSha)
if (-not $sourceMatches) { throw 'G344 G1 source deviates from frozen G3.39 reference' }

$node = Get-Command node.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1
$nodeFile = Get-Item -LiteralPath $node.Source -ErrorAction Stop
if ($nodeFile.PSIsContainer -or (($nodeFile.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)) {
  throw 'G344 Node path not a regular local executable'
}
$nodeVersion = (& $node.Source --version).Trim()
$nodeSha = (Get-FileHash -LiteralPath $node.Source -Algorithm SHA256).Hash.ToLowerInvariant()
function HasAcl([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { return $false }
  try { $null = Get-Acl -LiteralPath $p -ErrorAction Stop; return $true } catch { return $false }
}
function IsOrdinaryPath([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { return $false }
  try {
    $item = Get-Item -LiteralPath $p -ErrorAction Stop
    return (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -eq 0)
  } catch { return $false }
}
$data = Join-Path $root 'runtime\data'
$jobs = Join-Path $data 'jobs'
$audit = Join-Path $data 'audit'
$paths = @($root,$g1Source,$data,$jobs,$audit)
$nonReparse = [bool](@($paths | Where-Object { -not (IsOrdinaryPath $_) }).Count -eq 0)
$pathAclRead = [bool](@($paths | Where-Object { -not (HasAcl $_) }).Count -eq 0)
$nodeParentAclRead = HasAcl (Split-Path -Parent $node.Source)
$machinePath = [Environment]::GetEnvironmentVariable('Path','Machine')
$nodeParent = [IO.Path]::GetFullPath((Split-Path -Parent $node.Source)).TrimEnd('\').ToLowerInvariant()
$nodeOnMachinePath = $false
if ($machinePath) {
 foreach ($part in @($machinePath -split ';')) {
  if ([string]::IsNullOrWhiteSpace($part)) { continue }
  try {
   $expanded=[Environment]::ExpandEnvironmentVariables($part.Trim('"').Trim())
   $resolved=[IO.Path]::GetFullPath($expanded).TrimEnd('\').ToLowerInvariant()
   if ($resolved -eq $nodeParent) { $nodeOnMachinePath=$true; break }
  } catch { }
 }
}
$ports = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object { $_.LocalPort -in @(4177,4178,4179) })
$g1 = @($ports | Where-Object { $_.LocalPort -eq 4177 })
$office = @($ports | Where-Object { $_.LocalPort -eq 4178 })
$g2 = @($ports | Where-Object { $_.LocalPort -eq 4179 })
$officeLoopback = [bool]($office.Count -gt 0 -and @($office | Where-Object { $_.LocalAddress -notin @('127.0.0.1','::1') }).Count -eq 0)
$pattern='(?i)local-3d-generator|local.?3d|server[/\\]index[.]js|L3D_PORT|127[.]0[.]0[.]1:4177'
$tasks = @(Get-ScheduledTask -ErrorAction Stop)
$taskActionsMatched = @($tasks | Where-Object {
 $job = $_
 $bits = @($job.Actions | Where-Object { $null -ne $_ } | ForEach-Object {
  $action = $_
  $exe = if ($null -ne $action.PSObject.Properties['Execute']) { [string]$action.Execute } else { '' }
  $args = if ($null -ne $action.PSObject.Properties['Arguments']) { [string]$action.Arguments } else { '' }
  $exe + ' ' + $args
 })
 $text = $job.TaskName+' '+$job.TaskPath+' '+($bits -join ' ')
 $text -match $pattern
}).Count
$services = @(Get-CimInstance Win32_Service -ErrorAction Stop)
$serviceActionsMatched = @($services | Where-Object {
 ($_.Name+' '+$_.DisplayName+' '+$_.PathName) -match $pattern
}).Count
$startups = @(Get-CimInstance Win32_StartupCommand -ErrorAction Stop)
$startupActionsMatched = @($startups | Where-Object {
 ($_.Name+' '+$_.Command) -match $pattern
}).Count
$boot = (Get-CimInstance Win32_OperatingSystem -ErrorAction Stop).LastBootUpTime
$observed = [ordered]@{
 schema='local3d.g344.actual-readonly-unattended-g1-host-constraints.v1'
 observedDate=(Get-Date).ToString('yyyy-MM-dd')
 windowsLastBootDate=$boot.ToString('yyyy-MM-dd')
 exactG339ServerSourceSha256Verified=$sourceMatches
 processContextNodeResolved=$true
 processContextNodeVersion=$nodeVersion
 processContextNodeBinarySha256=$nodeSha
 nodeExecutableNotReparsePoint=$true
 nodeExecutableDirectoryAclReadableAsCurrentProbeUser=[bool]$nodeParentAclRead
 nodeExecutableDirectoryPresentInMachinePath=[bool]$nodeOnMachinePath
 repoSourceDataJobsAuditAclMetadataReadableAsCurrentProbeUser=[bool]$pathAclRead
 repoSourceDataJobsAuditNoDirectReparsePoint=[bool]$nonReparse
 persistentG1DataDirectoryExists=[bool](Test-Path -LiteralPath $data -PathType Container)
 persistentG1JobsDirectoryExists=[bool](Test-Path -LiteralPath $jobs -PathType Container)
 persistentG1AuditDirectoryExists=[bool](Test-Path -LiteralPath $audit -PathType Container)
 listener4177Count=[int]$g1.Count
 listener4178Count=[int]$office.Count
 office4178OnlyLoopback=[bool]$officeLoopback
 listener4179Count=[int]$g2.Count
 scheduledTasksInventoryComplete=$true
 allScheduledTasksSeenCount=[int]$tasks.Count
 scopedMatchedScheduledTasksCount=[int]$taskActionsMatched
 servicesCimInventoryComplete=$true
 allServicesSeenCount=[int]$services.Count
 scopedMatchedServicesCount=[int]$serviceActionsMatched
 startupCommandsInventoryComplete=$true
 allStartupCommandsSeenCount=[int]$startups.Count
 scopedMatchedStartupCommandsCount=[int]$startupActionsMatched
 hasVerifiedIntendedLowPrivilegePrincipal=$false
 hasVerifiedNoninteractiveLogonForIntendedPrincipal=$false
 hasTestedFilesystemRightsAsIntendedPrincipal=$false
 hasVerifiedMachineBootPathUnderIntendedPrincipal=$false
 hasApprovedServiceInstallOrBootRestart=$false
 hasActuallyTestedG1WithoutLogin=$false
 hasActuallyTestedG1AfterReboot=$false
 hasVerifiedUnattendedStopAndRollback=$false
 thisProbeRegisteredOrModifiedWindowsTask=$false
 thisProbeStartedPersistentG1=$false
 thisProbeChangedOffice4178=$false
 thisProbeChangedOsAclFirewallUacOrDefender=$false
 thisProbeExecutedGpuOrModel=$false
 thisProbeModifiedPythonOrPrinter=$false
 eligibility='BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL'
}
$observed | ConvertTo-Json -Depth 4
