<#
  G3.39 LOCAL3D read-only Windows reboot recovery probe.
  Does not register Task Scheduler, start G1 or G2, modify Office/4178,
  change Windows policies, access credentials or scan private job files.
#>
param([switch]$WritePrivateObservation)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target=Join-Path $root 'server\index.js'
$expected='b60e8f088a6846de9f6003333c55fad963efbfbc3752885eb9358cfeb9b57759'
if(-not (Test-Path -LiteralPath $target -PathType Leaf)){
 throw 'G339 canonical G1 source not found'
}
$actual=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
if($actual -ne $expected){throw 'G339 exact G3.28 production server SHA changed'}
$node=Get-Command node.exe -ErrorAction SilentlyContinue
$nodeVersion=$null
if($node){
 try {$nodeVersion=(& $node.Source -v).Trim()} catch{$nodeVersion=$null}
}
$ports=@()
try {$ports=@(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object { $_.LocalPort -in @(4177,4178,4179) })}
catch{throw 'G339 port listener state query unavailable'}
$g1=@($ports | Where-Object {$_.LocalPort -eq 4177})
$office=@($ports | Where-Object {$_.LocalPort -eq 4178})
$g2=@($ports | Where-Object {$_.LocalPort -eq 4179})
if(@($office | Where-Object {$_.LocalAddress -ne '127.0.0.1'}).Count -gt 0){
 throw 'G339 found unexpected external 4178 listener; no changes made'
}
$rootAclReadable=$false
$dataAclReadable=$false
try{$null=Get-Acl -LiteralPath $root -ErrorAction Stop;$rootAclReadable=$true}catch{}
$dataDir=Join-Path $root 'runtime\data'
if(Test-Path -LiteralPath $dataDir -PathType Container){
 try{$null=Get-Acl -LiteralPath $dataDir -ErrorAction Stop;$dataAclReadable=$true}catch{}
}
$taskInventorySucceeded=$false
$relatedTaskActionsCount=$null
try{
 $tasks=@(Get-ScheduledTask -ErrorAction Stop)
 $relatedTaskActionsCount=0
 foreach($task in $tasks){
  $t=($task.TaskName+' '+$task.TaskPath)
  $actionText=(@($task.Actions)|ForEach-Object {$_.Execute+' '+$_.Arguments}) -join ' '
  if(($t+' '+$actionText) -match '(?i)local-3d-generator|local.?3d|server[/\\]index[.]js|L3D_PORT|127[.]0[.]0[.]1:4177'){
   $relatedTaskActionsCount++
  }
 }
 $taskInventorySucceeded=$true
}catch{}
$serviceInventorySucceeded=$false
$namedServiceCount=$null
try{
 $matched=@(Get-Service -ErrorAction Stop | Where-Object {$_.Name -match '(?i)local.?3d' -or $_.DisplayName -match '(?i)local.?3d'})
 $namedServiceCount=$matched.Count
 $serviceInventorySucceeded=$true
}catch{}
$startupCommandInventorySucceeded=$false
$namedStartupCommandsCount=$null
try{
 $matched=@(Get-CimInstance Win32_StartupCommand -ErrorAction Stop | Where-Object {
  ($_.Name+' '+$_.Command) -match '(?i)local-3d-generator|local.?3d|server[/\\]index[.]js'
 })
 $namedStartupCommandsCount=$matched.Count
 $startupCommandInventorySucceeded=$true
}catch{}
$g2EnvIsOptIn=($env:L3D_ENABLE_TRIPOSR -eq '1')
$report=[ordered]@{
 schema='local3d.g339.windows-g1-boot-readonly-sanitized.v1'
 observedDate='2026-10-11'
 sourceG328ExactSHA256Verified=$true
 verifiedNodeVersion=$nodeVersion
 nodeExecutableResolved=[bool]$node
 expectedBindLocalhostOnly=$true
 listener4177Count=$g1.Count
 listener4178Count=$office.Count
 listener4179Count=$g2.Count
 office4178ObservedOnlyLoopback=[bool]($office.Count -gt 0)
 repoRootAclReadable=$rootAclReadable
 persistentDataDirExists=[bool](Test-Path -LiteralPath $dataDir -PathType Container)
 persistentDataAclReadable=$dataAclReadable
 taskInventorySucceeded=$taskInventorySucceeded
 relatedExistingTaskActionCount=$relatedTaskActionsCount
 serviceInventorySucceeded=$serviceInventorySucceeded
 relatedExistingNamedServiceCount=$namedServiceCount
 startupCommandInventorySucceeded=$startupCommandInventorySucceeded
 relatedExistingStartupCommandCount=$namedStartupCommandsCount
 serviceAccountRuntimeIdentityAndRightsAttested=$false
 safeBootAutostartActuallyTested=$false
 canStartWithoutInteractiveLoginProven=$false
 taskCreatedOrModified=$false
 persistentG1Started=$false
 gpuEnabledOrModelExecuted=$false
 office4178Modified=$false
 osSecuritySettingsModified=$false
 eligibilityForAutomaticG1Activation='REVIEW_ONLY_NO_INSTALL_AUTHORITY'
}
$public=$report|ConvertTo-Json -Depth 4
if($WritePrivateObservation){
 $dest=Join-Path $root 'runtime\qa\g3\g339-g1-boot-readonly-observation.json'
 $dir=Split-Path -Parent $dest
 $null=New-Item -ItemType Directory -Path $dir -Force
 if(Test-Path -LiteralPath $dest -PathType Leaf){
  $current=Get-Content -LiteralPath $dest -Raw
  if(($current|ConvertFrom-Json|ConvertTo-Json -Depth 4) -ne ($public|ConvertFrom-Json|ConvertTo-Json -Depth 4)){
   throw 'G339 prior private read-only observation differs'
  }
 }else{
  Set-Content -LiteralPath $dest -Value $public -Encoding utf8 -NoNewline
 }
}
Write-Output ('G339_WINDOWS_BOOT_READONLY '+($report|ConvertTo-Json -Compress -Depth 4))
