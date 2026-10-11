/**
 * G3.39 strict offline acceptance of proposed, DISABLED Windows G1 startup.
 * This has no Task Scheduler bindings, subprocess or runtime side effects.
 */
export class BootReviewError extends Error{
 constructor(message){super(message);this.name='BootReviewError';this.code='G339_BOOT_REVIEW_UNSAFE';}
}
const fail=m=>{throw new BootReviewError(m);};
const check=(value,message)=>{if(!value)fail(message);};
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
export function reviewDisabledBootCandidate(candidate,obs,earlierG336){
 check(candidate?.schema==='local3d.g339.g1-windows-startup-proposed-disabled.v1','candidate schema invalid');
 check(candidate?.enabled===false&&candidate?.registrationState==='NOT_REGISTERED_DRAFT_ONLY'&&
   candidate?.taskInstallExecutionActions==='NONE'&&candidate?.taskXmlCanBeRegisteredAsIs===false,
   'candidate must remain disabled and non-runnable');
 check(candidate?.desiredTrigger==='AT_SYSTEM_STARTUP'&&
  candidate?.taskSchedulerPrincipal==='UNRESOLVED_STANDARD_USER_OR_APPROVED_LOW_PRIVILEGE_SERVICE_ACCOUNT'&&
  candidate?.logonType==='UNRESOLVED_REQUIRES_NONINTERACTIVE_RUNTIME_PROOF'&&
  candidate?.runLevel==='LIMITED','unsafe privileged principal or claimed logon mode');
 check(candidate?.executableCandidate==='node.exe'&&eq(candidate?.argvCandidate,['server/index.js'])&&
  candidate?.workingDirectory==='RESOLVE_CANONICAL_REPO_BY_AUTHORIZED_OPERATOR',
  'unverified binary or working directory');
 check(eq(candidate?.environmentRules,{L3D_ENABLE_TRIPOSR:'0',L3D_PORT:'4177'})&&
   candidate?.gpuEngine==='DISABLED'&&candidate?.modelInference===false&&
   candidate?.simulatorOnly===true&&candidate?.bindHost==='127.0.0.1',
   'G2/GPU/network exposure not allowed');
 check(candidate?.independentPort4178MustRemainUntouched===true&&
   candidate?.healthMustReturn==='G1_DEMO'&&candidate?.providerG2MustReport==='STAGED_DISABLED'&&
   candidate?.rejectTruncatedImageWith==='422 BAD_IMAGE_STRUCTURE',
   'missing live post-start gates');
 for(const key of [
  'storageAclUnderIntendedPrincipalVerified','startupWithoutLoggedInUserVerified',
  'restartPersistenceVerified','safeRollbackAndStopApproved',
  'humanOperatorActivationApproved','physicalPrinterRelease'
 ])check(candidate[key]===false,'unauthorized candidate claim '+key);
 for(const key of ['securityIssue4Open','operationalIssue5Open','manufacturingIssue3Open',
   'executableAndRepositorySourceSHARequired','freshCheck4177BeforeStartupRequired'])
 check(candidate[key]===true,'missing safety gate '+key);
 check(obs?.schema==='local3d.g339.windows-g1-boot-readonly-sanitized.v1'&&
   obs?.sourceG328ExactSHA256Verified===true&&
   obs?.nodeExecutableResolved===true&&obs?.verifiedNodeVersion==='v24.19.0'&&
   obs?.listener4177Count===0&&obs?.listener4178Count===1&&
   obs?.listener4179Count===0&&obs?.office4178ObservedOnlyLoopback===true&&
   obs?.repoRootAclReadable===true&&obs?.persistentDataDirExists===true&&
   obs?.persistentDataAclReadable===true,
   'read-only host prerequisites changed, do not infer readiness');
 for(const [prefix,count] of [
   ['taskInventorySucceeded','relatedExistingTaskActionCount'],
   ['serviceInventorySucceeded','relatedExistingNamedServiceCount'],
   ['startupCommandInventorySucceeded','relatedExistingStartupCommandCount']
 ])check(obs[prefix]===true&&obs[count]===0,'read-only startup inventory not fully observed');
 for(const key of [
  'serviceAccountRuntimeIdentityAndRightsAttested','safeBootAutostartActuallyTested',
  'canStartWithoutInteractiveLoginProven','taskCreatedOrModified',
  'persistentG1Started','gpuEnabledOrModelExecuted','office4178Modified',
  'osSecuritySettingsModified'
 ])check(obs[key]===false,'unsafe host assertion '+key);
 check(obs.eligibilityForAutomaticG1Activation==='REVIEW_ONLY_NO_INSTALL_AUTHORITY',
   'read-only host granted activation unexpectedly');
 check(earlierG336?.schema==='local3d.g336.fixture-only-g1-post-reboot-smoke-not-service-restoration.v1'&&
   earlierG336?.observation?.malformedInput422BeforeJobCount===9&&
   earlierG336?.observation?.completeOriginalSyntheticFixture201Count===3&&
   earlierG336?.existingG1Port4177ReopenedByMilestone===false&&
   earlierG336?.permanentAutostartInstalled===false,
   'earlier temporary G1 evidence not trusted');
 return Object.freeze({
  schema:'local3d.g339.g1-disabled-autostart-review-only.v1',
  observationScope:'WINDOWS_CHRIS_CURRENT_READONLY_SESSION_ONLY',
  candidateStatus:'SAFE_TO_REVIEW_NOT_INSTALLABLE',
  sourceExactCurrentServer:true,
  nodeExecutableAvailable:true,
  loopbackG1Port4177CurrentlyNoListener:true,
  independentOffice4178ListenerMustNeverBeRebound:true,
  G2Port4179NoListener:true,
  unknownTaskOwnersOrOtherNamesMayStillExist:true,
  inspectedRepoAclOnlyNotIntendedServiceAccount:true,
  resolvedServicePrincipalOrNoninteractiveRights:false,
  verifiedG1ServiceBootAfterLogout:false,
  candidateRegistered:false,
  canInstallScheduledTaskAutomatically:false,
  canLaunchPersistent4177Automatically:false,
  canEnableG2Automatically:false,
  canCloseIssue5:false,
  canCloseIssue4:false,
  canApprovePrinter:false,
  preActivationRequirements:Object.freeze([
   'EXPLICIT_OPERATOR_APPROVAL_FOR_PERSISTENT_G1_CHANGE',
   'RESOLVE_LEAST_PRIVILEGE_ACCOUNT_AND_NONINTERACTIVE_LOGON',
   'PROVE_G1_DATA_DIR_READ_WRITE_FOR_THAT_ACCOUNT',
   'APPROVE_REAL_NODE_PATH_AND_PRIVATE_PROCESS_ENV_RUNNER',
   'RECONFIRM_PORT4177_EMPTY_AND_OFFICE4178_UNCHANGED',
   'INSTALL_ONE_DISABLED_TASK_THEN_OPERATOR_ENABLE_ONLY_AFTER_REVIEW',
   'TEST_POST_BOOT_LIVE_LOOPBACK_G1_HEALTH_AND_G2_DISABLED',
   'VERIFY_422_INVALID_MEDIA_AND_NO_NEW_JOBS',
   'TEST_NO_LOGIN_RESTART_AND_CLEAN_STOP_ROLLBACK'
  ])
 });
}
