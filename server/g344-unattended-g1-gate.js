/** G3.44: pure CPU G1 Windows noninteractive boot-readiness review.
 * NO Task Scheduler, service, filesystem write, network or process execution.
 * An ACL READ under the current probe user NEVER attests a future principal.
 */
export class UnattendedG1ReviewError extends Error {
  constructor(message) { super(message); this.name='UnattendedG1ReviewError';
    this.code='G344_UNATTENDED_G1_REVIEW_BLOCKED'; }
}
const check=(ok,msg)=>{if(!ok)throw new UnattendedG1ReviewError(msg);};
const keys=[
 'schema','observedDate','windowsLastBootDate','exactG339ServerSourceSha256Verified',
 'processContextNodeResolved','processContextNodeVersion','processContextNodeBinarySha256',
 'nodeExecutableNotReparsePoint','nodeExecutableDirectoryAclReadableAsCurrentProbeUser',
 'nodeExecutableDirectoryPresentInMachinePath',
 'repoSourceDataJobsAuditAclMetadataReadableAsCurrentProbeUser',
 'repoSourceDataJobsAuditNoDirectReparsePoint','persistentG1DataDirectoryExists',
 'persistentG1JobsDirectoryExists','persistentG1AuditDirectoryExists',
 'listener4177Count','listener4178Count','office4178OnlyLoopback','listener4179Count',
 'scheduledTasksInventoryComplete','allScheduledTasksSeenCount','scopedMatchedScheduledTasksCount',
 'servicesCimInventoryComplete','allServicesSeenCount','scopedMatchedServicesCount',
 'startupCommandsInventoryComplete','allStartupCommandsSeenCount','scopedMatchedStartupCommandsCount',
 'hasVerifiedIntendedLowPrivilegePrincipal','hasVerifiedNoninteractiveLogonForIntendedPrincipal',
 'hasTestedFilesystemRightsAsIntendedPrincipal',
 'hasVerifiedMachineBootPathUnderIntendedPrincipal','hasApprovedServiceInstallOrBootRestart',
 'hasActuallyTestedG1WithoutLogin','hasActuallyTestedG1AfterReboot',
 'hasVerifiedUnattendedStopAndRollback','thisProbeRegisteredOrModifiedWindowsTask',
 'thisProbeStartedPersistentG1','thisProbeChangedOffice4178',
 'thisProbeChangedOsAclFirewallUacOrDefender','thisProbeExecutedGpuOrModel',
 'thisProbeModifiedPythonOrPrinter','eligibility'
].sort();
const unproved=[
 'hasVerifiedIntendedLowPrivilegePrincipal','hasVerifiedNoninteractiveLogonForIntendedPrincipal',
 'hasTestedFilesystemRightsAsIntendedPrincipal',
 'hasVerifiedMachineBootPathUnderIntendedPrincipal','hasApprovedServiceInstallOrBootRestart',
 'hasActuallyTestedG1WithoutLogin','hasActuallyTestedG1AfterReboot',
 'hasVerifiedUnattendedStopAndRollback','thisProbeRegisteredOrModifiedWindowsTask',
 'thisProbeStartedPersistentG1','thisProbeChangedOffice4178',
 'thisProbeChangedOsAclFirewallUacOrDefender','thisProbeExecutedGpuOrModel',
 'thisProbeModifiedPythonOrPrinter'
];
const verified=[
 'exactG339ServerSourceSha256Verified','processContextNodeResolved',
 'nodeExecutableNotReparsePoint','nodeExecutableDirectoryAclReadableAsCurrentProbeUser',
 'nodeExecutableDirectoryPresentInMachinePath',
 'repoSourceDataJobsAuditAclMetadataReadableAsCurrentProbeUser',
 'repoSourceDataJobsAuditNoDirectReparsePoint',
 'persistentG1DataDirectoryExists','persistentG1JobsDirectoryExists',
 'persistentG1AuditDirectoryExists','office4178OnlyLoopback',
 'scheduledTasksInventoryComplete','servicesCimInventoryComplete',
 'startupCommandsInventoryComplete'
];
export function assessUnattendedG1Observation(obs,g339,g343,draft) {
  check(obs&&typeof obs==='object'&&!Array.isArray(obs),'observation missing');
  check(JSON.stringify(Object.keys(obs).sort())===JSON.stringify(keys),
    'missing, additional or potentially private fields');
  check(obs.schema==='local3d.g344.actual-readonly-unattended-g1-host-constraints.v1',
    'wrong read-only host inventory schema');
  for(const k of ['observedDate','windowsLastBootDate'])
    check(typeof obs[k]==='string'&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(obs[k])&&
      !Number.isNaN(Date.parse(obs[k])),'invalid date '+k);
  check(obs.windowsLastBootDate<=obs.observedDate &&
    obs.observedDate>='2026-10-11','untrusted/reversed Windows boot chronology');
  for(const k of verified)check(obs[k]===true,'missing CURRENT PROBE context observation: '+k);
  for(const k of unproved)check(obs[k]===false,'forged future service right or operation: '+k);
  check(obs.processContextNodeVersion==='v24.19.0'&&
    /^[a-f0-9]{64}$/.test(obs.processContextNodeBinarySha256),
    'unknown Node executable or binary SHA');
  for(const k of [
    'listener4177Count','listener4178Count','listener4179Count',
    'allScheduledTasksSeenCount','scopedMatchedScheduledTasksCount',
    'allServicesSeenCount','scopedMatchedServicesCount',
    'allStartupCommandsSeenCount','scopedMatchedStartupCommandsCount'
  ])check(Number.isSafeInteger(obs[k])&&obs[k]>=0,'invalid count '+k);
  check(obs.listener4177Count===0&&obs.listener4178Count===1&&
    obs.listener4179Count===0,'port ownership changed or G1 started');
  for(const [total,matched] of [
    ['allScheduledTasksSeenCount','scopedMatchedScheduledTasksCount'],
    ['allServicesSeenCount','scopedMatchedServicesCount'],
    ['allStartupCommandsSeenCount','scopedMatchedStartupCommandsCount']
  ])check(obs[total]>0&&obs[matched]===0,
    'incomplete inventory or existing matching unattended launcher: '+matched);
  check(obs.eligibility==='BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL',
    'probe improperly asserted deployment eligibility');

  check(g339?.schema==='local3d.g339.actual-readonly-g1-boot-discovery-disabled-task-proposal.v1'&&
    g339.noScheduledTaskXmlRegistered===true&&
    g339.noG1PersistentStartupPerformed===true&&
    g339.g1OperationalIssue5StillOpen===true&&
    g339.review?.candidateRegistered===false&&
    g339.review?.canInstallScheduledTaskAutomatically===false,
    'G3.39 historical G1 noninstallable gate not preserved');
  check(g343?.schema==='local3d.g343.actual-readonly-independent-backup-preflight-not-replication.v1'&&
    g343.G1Port4177BootActivated===false&&
    g343.office4178Modified===false&&
    g343.modelGpuInferenceCount===0&&
    g343.G1OperationalIssue5Open===true,
    'G3.43 historical boot/GPU/Office gate bypassed');
  check(draft?.schema==='local3d.g339.g1-windows-startup-proposed-disabled.v1'&&
    draft.enabled===false&&draft.registrationState==='NOT_REGISTERED_DRAFT_ONLY'&&
    draft.taskXmlCanBeRegisteredAsIs===false&&
    draft.taskInstallExecutionActions==='NONE'&&
    draft.taskSchedulerPrincipal==='UNRESOLVED_STANDARD_USER_OR_APPROVED_LOW_PRIVILEGE_SERVICE_ACCOUNT'&&
    draft.logonType==='UNRESOLVED_REQUIRES_NONINTERACTIVE_RUNTIME_PROOF'&&
    draft.runLevel==='LIMITED'&&
    draft.environmentRules?.L3D_ENABLE_TRIPOSR==='0'&&
    draft.environmentRules?.L3D_PORT==='4177'&&
    draft.bindHost==='127.0.0.1'&&
    draft.humanOperatorActivationApproved===false&&
    draft.safeRollbackAndStopApproved===false&&
    draft.startupWithoutLoggedInUserVerified===false,
    'G3.39 draft changed into executable or claims fake privilege approval');
  return Object.freeze({
    schema:'local3d.g344.unattended-g1-activation-gate-deny.v1',
    scheduledTasksReadOnlyEnumerated:obs.allScheduledTasksSeenCount,
    servicesReadOnlyEnumerated:obs.allServicesSeenCount,
    startupCommandsReadOnlyEnumerated:obs.allStartupCommandsSeenCount,
    exactKnownG1SourceIntact:true,
    executableNode24InCurrentAndMachinePath:true,
    currentProbeAclMetadataAvailableNotEffectiveRights:true,
    inspectedDirectPathsHaveNoReparsePoint:true,
    scopedTaskServiceStartupMatches:0,
    independentOffice4178LoopbackUntouched:true,
    g1Port4177StillOff:true,
    g2Port4179Off:true,
    intendedLeastPrivilegePrincipalSelected:false,
    intendedPrincipalNoninteractiveLogonVerified:false,
    effectiveWriteRightsAsIntendedPrincipalVerified:false,
    nonInteractiveBootG1HealthG2DisabledAnd422Observed:false,
    bootWithoutLoginAndRollbackProven:false,
    taskRegistered:false, taskEnabled:false,
    installAuthorized:false,
    allowPersistentG1:false, allowGpuOrModel:false,
    allowPrint:false, printQualified:false, approvedForPrinter:false,
    fabricationAction:'NONE',
    issue3Open:true,issue4Open:true,issue5Open:true,
    decision:'BLOCKED_UNATTESTED_NONINTERACTIVE_PRINCIPAL',
    nextRequiredProofs:Object.freeze([
      'IDENTIFY_OPERATOR_APPROVED_LOW_PRIVILEGE_WINDOWS_PRINCIPAL',
      'PROVE_NONINTERACTIVE_LOGON_POLICY_FOR_THE_EXACT_PRINCIPAL',
      'VERIFY_EXACT_NODE_BINARY_PATH_HASH_AND_RUNTIME_ENV_FOR_BOOT',
      'TEST_REAL_DATA_JOB_AUDIT_READ_WRITE_WITH_THAT_PRINCIPAL',
      'AUTHORIZE_AND_REVIEW_AN_ACTUALLY_INSTALLABLE_DISABLED_TASK',
      'VERIFY_FRESH_4177_VACANT_AND_4178_OFFICE_UNCHANGED',
      'AUTHORIZE_FIXTURE_ONLY_G1_START_AND_4177_HEALTH_G2_DISABLED_422',
      'AUTHORIZE_SEPARATE_CONTROLLED_REBOOT_WITHOUT_LOGIN',
      'VALIDATE_STOP_SINGLE_INSTANCE_NO_GPU_AND_ROLLBACK'
    ])
  });
}
