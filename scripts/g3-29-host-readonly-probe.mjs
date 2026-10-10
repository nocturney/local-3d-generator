/**
 * LOCAL3D G3.29 CPU-only Windows host capability inventory.
 *
 * Queries CIM, existing optional-feature state and command discovery.
 * No feature changes, Sandbox launch, VM creation, PowerShell policy edits,
 * networking, Python model startup or private file inspections.
 */
import {execFileSync} from 'node:child_process';
import {decideIsolatedDecodeReadiness,validateOfflineSandboxProfile,WSB_CANDIDATE_PROFILE} from '../server/isolation-readiness-contract.js';
const ps=[
 "$ErrorActionPreference='Stop'",
 "$os=Get-CimInstance Win32_OperatingSystem",
 "$sys=Get-CimInstance Win32_ComputerSystem",
 "$feature='Unknown'",
 "try { $feature=(Get-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM -ErrorAction Stop).State.ToString() } catch { $feature='Unknown' }",
 "$launcher=( @(Get-Command WindowsSandbox.exe,WindowsSandboxClient.exe -ErrorAction SilentlyContinue) | Measure-Object ).Count -gt 0",
 "$cap=[ordered]@{ schema='local3d.g329.host-capability-readonly.v1';probeReadOnly=$true;hostOsWindows=($os.Caption -match 'Windows');hostBuild=[int]$os.BuildNumber;optionalFeatureState=$feature;hypervisorPresent=[bool]$sys.HypervisorPresent;clientLauncherResolvable=[bool]$launcher }",
 "$cap | ConvertTo-Json -Compress -Depth 3"
].join('; ');
export function probeWindowsHostReadOnly(){
 if(process.platform!=='win32')throw new Error('G3.29 requires Windows host for live probe');
 const stdout=execFileSync('powershell.exe',[
 '-NoProfile','-NonInteractive','-Command',ps
 ],{encoding:'utf8',maxBuffer:4096,timeout:25000,windowsHide:true});
 if(stdout.length>2500)throw new Error('G3.29 host probe yielded oversized results');
 const lines=stdout.trim().split(/\r?\n/);
 if(lines.length!==1)throw new Error('G3.29 unexpected host probe stdout');
 const snapshot=JSON.parse(lines[0]);
 // Schema and values are checked here; do not trust host self-description
 // as a claim of OS-enforced sandbox and egress verification.
 const decision=decideIsolatedDecodeReadiness(
  snapshot,validateOfflineSandboxProfile(WSB_CANDIDATE_PROFILE));
 if(decision.readinessForUntrustedCustomerImages!==false)
  throw new Error('G3.29 forbidden sandbox readiness escalation');
 return snapshot;
}
if(process.argv[1]&&import.meta.url==='file:///'+process.argv[1].replace(/\\/g,'/').replace(/^([a-z]):/i,(_,drive)=>drive.toUpperCase()+':')){
 const result=probeWindowsHostReadOnly();
 const resultOfAssessment=decideIsolatedDecodeReadiness(result,
  validateOfflineSandboxProfile(WSB_CANDIDATE_PROFILE));
 console.log('G3_29_HOST_CAPABILITY_ONLY '+JSON.stringify({
  host:result,assessment:resultOfAssessment
 }));
}
