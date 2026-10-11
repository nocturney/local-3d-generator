/** G3.43: pure fail-closed review of read-only Windows backup destination facts.
 *  This module has NO filesystem, network, encryption, service or backup actions. */
export class BackupReviewError extends Error {
  constructor(message) {
    super(message); this.name = 'BackupReviewError'; this.code = 'G343_BACKUP_REVIEW_BLOCKED';
  }
}
function check(ok, message) { if (!ok) throw new BackupReviewError(message); }
const allowedKeys = [
  'schema','observedDate','sourceDriveRole','candidateDriveRole',
  'sourceDriveLetter','candidateDriveLetter','sourceDiskNumber','candidateDiskNumber',
  'physicalDisksAreDistinct','sourceDiskBusType','candidateDiskBusType',
  'candidateFreeBytes','expectedPrivateBackupBytes','originalPrivateBackupFolderExists',
  'originalPrivateManifestFileExists','sourceProtectionState','candidateProtectionState',
  'mappedConnectedSmbShareCount','attachedOnlineUsbDiskCount',
  'externalOrOffHostEncryptedDestinationValidated','operatorScopedReplicationApprovalRecorded',
  'escrowAndRecoveryKeyCustodyVerified','independentDestinationRestoreReadbackCompleted',
  'thisProbeCopiedBackupBytes','thisProbeChangedOsSecurityOrEncryption',
  'thisProbeInstalledServiceOrStartedG1','thisProbeRanGpuOrModel',
  'thisProbeModifiedOfficeOrPrinter'
].sort();
const forbiddenTrue = [
  'externalOrOffHostEncryptedDestinationValidated','operatorScopedReplicationApprovalRecorded',
  'escrowAndRecoveryKeyCustodyVerified','independentDestinationRestoreReadbackCompleted',
  'thisProbeCopiedBackupBytes','thisProbeChangedOsSecurityOrEncryption',
  'thisProbeInstalledServiceOrStartedG1','thisProbeRanGpuOrModel',
  'thisProbeModifiedOfficeOrPrinter'
];
export function reviewBackupTargetObservation(obs, g342, g339) {
  check(obs && typeof obs === 'object' && !Array.isArray(obs), 'missing observation');
  check(JSON.stringify(Object.keys(obs).sort()) === JSON.stringify(allowedKeys),
    'extra, missing or sensitive inventory fields');
  check(obs.schema === 'local3d.g343.readonly-backup-destination-inventory.v1',
    'wrong observation schema');
  check(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(obs.observedDate), 'invalid observation date');
  check(obs.sourceDriveRole === 'LOCAL_PRIVATE_G341_BACKUP' &&
    obs.candidateDriveRole === 'OTHER_INTERNAL_WINDOWS_DISK' &&
    obs.sourceDriveLetter === 'D' && obs.candidateDriveLetter === 'C',
    'unverified source or target roles');
  for (const k of ['sourceDiskNumber','candidateDiskNumber','candidateFreeBytes',
    'expectedPrivateBackupBytes','mappedConnectedSmbShareCount','attachedOnlineUsbDiskCount'])
    check(Number.isSafeInteger(obs[k]), 'invalid count or size: ' + k);
  check(obs.sourceDiskNumber >= 0 && obs.candidateDiskNumber >= 0 &&
    obs.candidateFreeBytes >= 0 && obs.mappedConnectedSmbShareCount >= -1 &&
    obs.attachedOnlineUsbDiskCount >= -1, 'negative disk/space/count');
  check(obs.physicalDisksAreDistinct === (obs.sourceDiskNumber !== obs.candidateDiskNumber),
    'false physical-disk separation');
  check(['NVMe','SATA','USB','SAS','RAID','Unknown'].includes(obs.sourceDiskBusType) &&
    ['NVMe','SATA','USB','SAS','RAID','Unknown'].includes(obs.candidateDiskBusType),
    'invalid disk bus metadata');
  check(['On','Off','UNKNOWN'].includes(obs.sourceProtectionState) &&
    ['On','Off','UNKNOWN'].includes(obs.candidateProtectionState),
    'unknown encryption represented as approved');
  check(obs.expectedPrivateBackupBytes === 5086619721, 'historical backup bytes mismatch');
  check(typeof obs.originalPrivateBackupFolderExists === 'boolean' &&
    typeof obs.originalPrivateManifestFileExists === 'boolean',
    'backup presence needs verified booleans');
  for (const k of forbiddenTrue) check(obs[k] === false, 'falsified action/approval: ' + k);
  check(g342?.schema === 'local3d.g342.source-audited-full-python-venv-restored-and-269-cpu-tested.v1' &&
    g342.realSecondFullPythonVenvRestorationExecuted === true &&
    g342.completeRestoredPython269CpuTestsPassed === true &&
    g342.noFullOSOrNewMachinePortabilityProven === true &&
    g342.sourceBackupNotPublishedToGitHub === true &&
    g342.originalPrivateWholeFileManifestSha256 ===
      '2c87d7cc2e7f1703a6c5c92521036f21630737ede2376020897faec94459df9d',
    'G3.42 provenance failure');
  check(g339?.schema === 'local3d.g339.actual-readonly-g1-boot-discovery-disabled-task-proposal.v1' &&
    g339.noScheduledTaskXmlRegistered === true &&
    g339.noG1PersistentStartupPerformed === true &&
    g339.g1OperationalIssue5StillOpen === true, 'G3.39 G1 gate was bypassed');

  // C: is on the SAME HOST even if DiskNumber is different: it is never off-host DR.
  return Object.freeze({
    schema: 'local3d.g343.offdisk-backup-preflight-decision.v1',
    prior34PackageSameHostVenvRestoreVerified: true,
    sourceBackupFolderAndManifestPresent:
      obs.originalPrivateBackupFolderExists && obs.originalPrivateManifestFileExists,
    localAlternativeUsesDifferentPhysicalDisk: obs.physicalDisksAreDistinct,
    localAlternativeHasAtLeastDoubleBackupBytesFree:
      obs.candidateFreeBytes >= 2 * obs.expectedPrivateBackupBytes,
    localAlternativeEncryptionVerified: obs.candidateProtectionState === 'On',
    mappedSmbAndUsbInventoryComplete:
      obs.mappedConnectedSmbShareCount >= 0 && obs.attachedOnlineUsbDiskCount >= 0,
    offHostEncryptedTargetValidated: false,
    operatorAuthorizedReplication: false,
    encryptionKeyCustodyVerified: false,
    backupTransferredToAnotherDiskOrHost: false,
    independentOffHostRestoreVerified: false,
    crossMachineOsPythonCudaWeightsRecovered: false,
    productionPythonOrOffice4178Modified: false,
    persistentG1Port4177StartedOrTaskRegistered: false,
    modelOrGpuRuns: 0,
    printQualified: false, approvedForPrinter: false, fabricationAction: 'NONE',
    issue3Open: true, issue4Open: true, issue5Open: true,
    decision: 'BLOCKED_NO_APPROVED_ENCRYPTED_OFFHOST_RECOVERY',
    requirements: Object.freeze([
      'OPERATOR_APPROVES_EXACT_DESTINATION_AND_PACKAGE_ONLY_DATASET',
      'PROVE_ENCRYPTION_AT_REST_AND_RECOVERY_KEY_CUSTODY',
      'PROVE_INDEPENDENT_HOST_OR_FAILURE_DOMAIN',
      'CHECK_DESTINATION_ACCESS_CONTROLS_AND_FREE_SPACE',
      'COPY_PRIVATE_DATA_ONLY_UNDER_SEPARATE_SCOPED_AUTHORIZATION',
      'VERIFY_ALL_BACKUP_FILE_HASHES_ON_INDEPENDENT_DESTINATION',
      'PERFORM_AUTHORIZED_INDEPENDENT_RESTORE_READBACK',
      'PLAN_OS_BASE_PYTHON_GPU_DRIVERS_MODEL_WEIGHTS_SEPARATELY',
      'KEEP_G1_AUTOBOOT_DISABLED_UNTIL_ISSUE_5_AUTHORIZATION'
    ])
  });
}
