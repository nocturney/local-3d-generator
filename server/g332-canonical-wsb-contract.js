/**
 * G3.32 canonical Microsoft sample .wsb vocabulary, all deny values explicit.
 * Exact byte candidate only, never run Windows Sandbox or apply OS policy.
 */
export const CANONICAL_G332_WSB_PROFILE=[
 '<Configuration>',
 '  <VGpu>Disable</VGpu>',
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
export class CanonicalWsbPolicyError extends Error {
 constructor(){super('G3.32 invalid canonical offline Windows Sandbox candidate');this.name='CanonicalWsbPolicyError';this.code='G332_WSB_POLICY_DENIED';}
}
export function validateCanonicalOfflineWsb(xml) {
 if(typeof xml!=='string'||Buffer.byteLength(xml,'utf8')>1300||
    xml!==CANONICAL_G332_WSB_PROFILE)
  throw new CanonicalWsbPolicyError();
 return Object.freeze({
  schema:'local3d.g332.canonical-wsb-exact-static-contract.v1',
  canonicalGpuElementCase:'VGpu',
  expectedRoot:'Configuration',
  childElementsCount:8,
  networking:'Disable',
  virtualizedGPU:'Disable',
  audioInput:'Disable',
  videoInput:'Disable',
  protectedClient:'Enable',
  printerRedirection:'Disable',
  clipboardRedirection:'Disable',
  memoryMB:4096,
  mappedHostFolders:0,
  logonCommands:0,
  hostPathsOrScriptsAllowed:false,
  containsDtdEntityOrNamespace:false,
  formatOnlyProof:true,
  effectiveGuestPolicyProven:false,
  actualWindowsSandboxGuestLaunched:false,
  safeUntrustedFileRelease:false,
  productionG2RuntimeIsolated:false,
  enableRealGpu:false,
  printQualified:false
 });
}
