# G3.43: host-storage read-only inventory. Never creates/copies a backup or changes BitLocker.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = 'D'
$candidate = 'C'
$sourcePartition = Get-Partition -DriveLetter $source -ErrorAction Stop | Select-Object -First 1
$candidatePartition = Get-Partition -DriveLetter $candidate -ErrorAction Stop | Select-Object -First 1
$sourceDisk = Get-Disk -Number $sourcePartition.DiskNumber -ErrorAction Stop
$candidateDisk = Get-Disk -Number $candidatePartition.DiskNumber -ErrorAction Stop
$candidateVolume = Get-Volume -DriveLetter $candidate -ErrorAction Stop
$srcProtection = 'UNKNOWN'
$dstProtection = 'UNKNOWN'
try {
  $srcProtection = [string](Get-BitLockerVolume -MountPoint ($source + ':') -ErrorAction Stop).ProtectionStatus
  $dstProtection = [string](Get-BitLockerVolume -MountPoint ($candidate + ':') -ErrorAction Stop).ProtectionStatus
} catch {
  # Unknown encryption status is a blocker, never a successful encryption proof.
  $srcProtection = 'UNKNOWN'
  $dstProtection = 'UNKNOWN'
}
$shareCount = -1
try {
  $shareCount = @((Get-SmbMapping -ErrorAction Stop) | Where-Object { $_.Status -eq 'OK' }).Count
} catch {
  # -1 means not observed, not 'none'.
  $shareCount = -1
}
$usbCount = -1
try {
  $usbCount = @((Get-Disk -ErrorAction Stop) | Where-Object { $_.BusType -eq 'USB' -and $_.OperationalStatus -eq 'Online' }).Count
} catch {
  $usbCount = -1
}
$originalBackup = Join-Path $root 'runtime\qa\g3\venv-recovery\production-py311-pillow101-complete-packages'
$originalManifest = Join-Path $root 'runtime\qa\g3\venv-recovery\production-py311-pillow101-complete-packages-manifest.json'
$observation = [ordered]@{
  schema = 'local3d.g343.readonly-backup-destination-inventory.v1'
  observedDate = (Get-Date).ToString('yyyy-MM-dd')
  sourceDriveRole = 'LOCAL_PRIVATE_G341_BACKUP'
  candidateDriveRole = 'OTHER_INTERNAL_WINDOWS_DISK'
  sourceDriveLetter = $source
  candidateDriveLetter = $candidate
  sourceDiskNumber = [int]$sourcePartition.DiskNumber
  candidateDiskNumber = [int]$candidatePartition.DiskNumber
  physicalDisksAreDistinct = ([int]$sourcePartition.DiskNumber -ne [int]$candidatePartition.DiskNumber)
  sourceDiskBusType = [string]$sourceDisk.BusType
  candidateDiskBusType = [string]$candidateDisk.BusType
  candidateFreeBytes = [int64]$candidateVolume.SizeRemaining
  expectedPrivateBackupBytes = [int64]5086619721
  originalPrivateBackupFolderExists = [bool](Test-Path -LiteralPath $originalBackup -PathType Container)
  originalPrivateManifestFileExists = [bool](Test-Path -LiteralPath $originalManifest -PathType Leaf)
  sourceProtectionState = $srcProtection
  candidateProtectionState = $dstProtection
  mappedConnectedSmbShareCount = [int]$shareCount
  attachedOnlineUsbDiskCount = [int]$usbCount
  externalOrOffHostEncryptedDestinationValidated = $false
  operatorScopedReplicationApprovalRecorded = $false
  escrowAndRecoveryKeyCustodyVerified = $false
  independentDestinationRestoreReadbackCompleted = $false
  thisProbeCopiedBackupBytes = $false
  thisProbeChangedOsSecurityOrEncryption = $false
  thisProbeInstalledServiceOrStartedG1 = $false
  thisProbeRanGpuOrModel = $false
  thisProbeModifiedOfficeOrPrinter = $false
}
$observation | ConvertTo-Json -Depth 4
