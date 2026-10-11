/**
 * LOCAL3D G3.31 conservative client-discovery/readiness decision.
 * No command invocation, no VM, no elevated policy changes.
 */
export class LaunchRouteContractError extends Error {
 constructor(){super('G3.31 untrusted/malformed Windows Sandbox launcher inventory');this.name='LaunchRouteContractError';this.code='G331_FAIL_CLOSED';}
}
const fail=()=>{throw new LaunchRouteContractError();};
const statuses=['OK','UNAVAILABLE'];
const countNames=['currentUserAppx','allUsersAppx','provisionedAppx','startMenuApps','systemAppDirectories'];
const boolNames=[
 'probeReadOnly','windowsHost','sandboxOptionalFeatureEnabled',
 'virtualMachinePlatformEnabled','hyperVHypervisorFeatureEnabled',
 'hypervisorPresent','wsbCliCommandResolvable',
 'legacyWindowsSandboxCommandResolvable','legacySystem32LauncherFileFound',
 'currentUserWsbAliasFileFound','probeRunningInSessionZero'
];
function exact(obj,keys){
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||
    Object.keys(obj).sort().join('|')!==keys.slice().sort().join('|'))fail();
}
export function assessWindowsSandboxLaunchRouteInventory(snapshot) {
 const keys=['schema','osBuild',...boolNames,...countNames];
 exact(snapshot,keys);
 if(snapshot.schema!=='local3d.g331.launch-route-inventory-readonly.v1'||
    snapshot.probeReadOnly!==true||
    !Number.isInteger(snapshot.osBuild)||
    snapshot.osBuild<0||snapshot.osBuild>100000||
    boolNames.some(k=>typeof snapshot[k]!=='boolean'))fail();
 for(const key of countNames){
  const v=snapshot[key];
  exact(v,['status','matches']);
  if(!statuses.includes(v.status)||!Number.isInteger(v.matches)||v.matches<0||
     v.matches>1000||v.status==='UNAVAILABLE'&&v.matches!==0)fail();
 }
 const commandRoute=snapshot.wsbCliCommandResolvable ||
  snapshot.legacyWindowsSandboxCommandResolvable ||
  snapshot.legacySystem32LauncherFileFound ||
  snapshot.currentUserWsbAliasFileFound;
 const registeredRoute=countNames.some(k=>snapshot[k].status==='OK'&&snapshot[k].matches>0);
 const incompleteRegistryAudit=countNames.some(k=>snapshot[k].status==='UNAVAILABLE');
 const inServiceContext=snapshot.probeRunningInSessionZero;
 const prerequisites=snapshot.windowsHost&&snapshot.osBuild>=19041&&
   snapshot.sandboxOptionalFeatureEnabled&&snapshot.hypervisorPresent;
 const blockers=[
  ...(!prerequisites?['WINDOWS_SANDBOX_BASE_PREREQUISITES_UNCONFIRMED']:[]),
  ...(!commandRoute?['NO_SANDBOX_LAUNCH_COMMAND_OR_ALIAS_RESOLVED_IN_THIS_PROBE_CONTEXT']:[]),
  ...(!registeredRoute?['NO_SANDBOX_APP_REGISTRATION_VISIBLE_IN_THIS_PROBE_CONTEXT']:[]),
  ...(incompleteRegistryAudit?['SOME_APP_REGISTRATION_QUERIES_UNAVAILABLE']:[]),
  ...(inServiceContext?['SESSION_ZERO_DOES_NOT_PROVE_INTERACTIVE_USER_APP_REGISTRATION']:[]),
  'MICROSOFT_STORE_CLIENT_VERSION_AND_INTERACTIVE_LAUNCH_UNVERIFIED',
  'LIVE_SANDBOX_GUEST_LAUNCH_TEARDOWN_UNVERIFIED',
  'EFFECTIVE_NETWORK_EGRESS_FILE_AND_CLIPBOARD_BOUNDARIES_UNVERIFIED',
  'SAFE_ONE_WAY_IMAGE_TRANSFER_AND_GUEST_PROVENANCE_UNVERIFIED',
  'NATIVE_PILLOW_DECODER_HARDENING_AND_DEPENDENCY_FIXES_UNRESOLVED'
 ];
 return Object.freeze({
  schema:'local3d.g331.sandbox-launch-route-readiness-not-runtime-clearance.v1',
  documentedWindowsSandbox24H2CliName:'wsb',
  osFeatureAndHypervisorObserved:prerequisites,
  anyLauncherOrAliasVisibleToProbe:commandRoute,
  anyRegisteredAppVisibleToProbe:registeredRoute,
  someRegistrationQueriesUnavailable:incompleteRegistryAudit,
  probeSessionZero:inServiceContext,
  classification:(!commandRoute&&!registeredRoute)?
   'NOT_FOUND_IN_CURRENT_READ_ONLY_PROBE_SCOPE':
   'CANDIDATE_ROUTE_DISCOVERED_NOT_TESTED',
  osSandboxLaunchActuallyAttempted:false,
  interactiveClientAvailabilityProven:false,
  osIsolationAttested:false,
  canUseGuestForTrustedSyntheticCPU:false,
  canAcceptUntrustedCustomerImages:false,
  canActivateG2OrGPU:false,
  securityIssue4Resolved:false,
  printQualified:false,
  nextAction:'INSPECT_WSB_OR_WINDOWS_SANDBOX_STORE_CLIENT_REGISTRATION_IN_INTERACTIVE_USER_SESSION_WITHOUT_LAUNCH',
  blockers:Object.freeze(blockers)
 });
}
