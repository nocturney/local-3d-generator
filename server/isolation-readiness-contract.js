/**
 * LOCAL3D G3.29 - Windows Sandbox candidate policy (static only).
 *
 * A .wsb XML candidate does not attest that ANY Windows Sandbox VM was
 * launched or that a native image decoder was contained. No host changes.
 * Deliberately NO mapped host paths or logon scripts; synthetic smoke only.
 */
export const WSB_CANDIDATE_PROFILE=[
  '<Configuration>',
  '  <vGPU>Disable</vGPU>',
  '  <Networking>Disable</Networking>',
  '  <AudioInput>Disable</AudioInput>',
  '  <VideoInput>Disable</VideoInput>',
  '  <ProtectedClient>Enable</ProtectedClient>',
  '  <PrinterRedirection>Disable</PrinterRedirection>',
  '  <ClipboardRedirection>Disable</ClipboardRedirection>',
  '  <MemoryInMB>4096</MemoryInMB>',
  '</Configuration>',
  ''
].join('\n');
export class SandboxPolicyError extends Error {
 constructor(message='G3.29 invalid candidate policy') {
  super(message);
  this.name='SandboxPolicyError';
  this.code='G329_FAIL_CLOSED';
 }
}
/**
 * Exact allowlisted XML byte string: no XML parser, interpolation, entities,
 * host-folder mappings, guest commands, default network or secret exposure.
 */
export function validateOfflineSandboxProfile(xml) {
 if(typeof xml!=='string'||Buffer.byteLength(xml,'utf8')>1600||
    xml!==WSB_CANDIDATE_PROFILE)
  throw new SandboxPolicyError();
 return Object.freeze({
  candidateConfigSyntax:'STATIC_KNOWN_EXACT_MICROSOFT_WSB_XML',
  networking:'Disable',
  virtualizedGPU:'Disable',
  protectedClient:'Enable',
  microphone:'Disable',
  webcam:'Disable',
  clipboard:'Disable',
  printer:'Disable',
  hostMappedFolderCount:0,
  guestLogonCommandCount:0,
  memoryLimitRequestedMB:4096,
  osEnforcedIsolationActuallyObserved:false,
  guestLaunchAttempted:false,
  nativeDecoderContained:false,
  trustedSyntheticImageParserTestInGuest:false,
  untrustedInputAllowed:false
 });
}
export function decideIsolatedDecodeReadiness(capability,profile) {
 const bad=()=>{throw new SandboxPolicyError('G3.29 host snapshot or profile invalid');};
 if(!capability||typeof capability!=='object'||
    Object.keys(capability).sort().join(',')!==
    ['clientLauncherResolvable','hypervisorPresent','hostBuild','hostOsWindows','optionalFeatureState','probeReadOnly','schema'].sort().join(',')||
    capability.schema!=='local3d.g329.host-capability-readonly.v1'||
    capability.probeReadOnly!==true||
    typeof capability.hostOsWindows!=='boolean'||
    !Number.isInteger(capability.hostBuild)||
    capability.hostBuild<0||capability.hostBuild>100000||
    !['Enabled','Disabled','Unknown','EnablePending','DisablePending'].includes(capability.optionalFeatureState)||
    typeof capability.hypervisorPresent!=='boolean'||
    typeof capability.clientLauncherResolvable!=='boolean')bad();
 if(!profile||profile.osEnforcedIsolationActuallyObserved!==false||
    profile.guestLaunchAttempted!==false||profile.hostMappedFolderCount!==0||
    profile.networking!=='Disable'||profile.virtualizedGPU!=='Disable'||
    profile.protectedClient!=='Enable'||profile.clipboard!=='Disable')bad();
 const eligibilityObserved=capability.hostOsWindows&&capability.hostBuild>=19041&&
   capability.optionalFeatureState==='Enabled'&&capability.hypervisorPresent;
 const missing=[
  ...(!capability.hostOsWindows?['WINDOWS_HOST_NOT_VERIFIED']:[]),
  ...(capability.optionalFeatureState!=='Enabled'?['SANDBOX_OPTIONAL_FEATURE_NOT_ENABLED']:[]),
  ...(!capability.hypervisorPresent?['HYPERVISOR_NOT_OBSERVED']:[]),
  ...(!capability.clientLauncherResolvable?['CLIENT_LAUNCHER_NOT_RESOLVED']:[]),
  'ACTUAL_GUEST_START_AND_TEARDOWN_UNVERIFIED',
  'EFFECTIVE_GUEST_NETWORK_EGRESS_UNVERIFIED',
  'HOST_FILE_MAPPING_AND_CLIPBOARD_BOUNDARY_UNVERIFIED',
  'GUEST_NATIVE_DECODER_CPU_TEST_UNVERIFIED',
  'TRUSTED_INGRESS_AND_ONE_WAY_OUTPUT_CHANNEL_NOT_DESIGNED',
  'PRODUCTION_G2_GPU_WORKER_NOT_CONFINED',
  'DEPENDENCY_ADVISORY_PATCH_COMPATIBILITY_UNVERIFIED'
 ];
 return Object.freeze({
  schema:'local3d.g329.isolation-readiness-decision.v1',
  capabilityOnlyCandidate:eligibilityObserved,
  result:'BLOCKED_NO_RUNTIME_OS_ATTESTATION',
  allRequiredRuntimeSecurityGatesMet:false,
  readinessForTrustedSyntheticGuestExperiment:false,
  readinessForUntrustedCustomerImages:false,
  canEnableG2ImageInferenceAutomatically:false,
  canSetSecurityIssue4Resolved:false,
  canSetPrintQualified:false,
  nextWorkItem:'MANUAL_SEPARATE_WINDOWS_SANDBOX_CPU_SMOKE_WITH_SCRUBBED_FIXTURE_AND_EXPLICIT_APPROVAL',
  blockers:Object.freeze(missing)
 });
}
