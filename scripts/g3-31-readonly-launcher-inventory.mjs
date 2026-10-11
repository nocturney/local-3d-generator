const ps="$ErrorActionPreference='Stop'\n$os=Get-CimInstance Win32_OperatingSystem\n$sys=Get-CimInstance Win32_ComputerSystem\nfunction EnabledFeature([string]$name) {\n try { return ((Get-WindowsOptionalFeature -Online -FeatureName $name -ErrorAction Stop).State.ToString() -eq 'Enabled') } catch {return $false}\n}\n$cli=($null -ne (Get-Command 'wsb.exe' -ErrorAction SilentlyContinue)) -or ($null -ne (Get-Command 'wsb' -ErrorAction SilentlyContinue))\n$legacy=($null -ne (Get-Command 'WindowsSandbox.exe' -ErrorAction SilentlyContinue)) -or ($null -ne (Get-Command 'WindowsSandboxClient.exe' -ErrorAction SilentlyContinue))\n$legacySystem32=Test-Path -LiteralPath (Join-Path $env:WINDIR 'System32\\WindowsSandbox.exe') -PathType Leaf\n$alias=Test-Path -LiteralPath (Join-Path $env:LOCALAPPDATA 'Microsoft\\WindowsApps\\wsb.exe') -PathType Leaf\nfunction Test-SandboxAppx([scriptblock]$cmd) {\n try {\n  $a=@(& $cmd | Where-Object { $_.Name -match 'WindowsSandbox|Windows\\.Sandbox|Sandbox' -or $_.DisplayName -match 'WindowsSandbox|Windows\\.Sandbox|Sandbox' })\n  return [pscustomobject]@{status='OK';matches=[int]$a.Count}\n } catch {\n  return [pscustomobject]@{status='UNAVAILABLE';matches=0}\n }\n}\n$cur=Test-SandboxAppx { Get-AppxPackage -Name '*Sandbox*' -ErrorAction Stop }\n$all=Test-SandboxAppx { Get-AppxPackage -AllUsers -Name '*Sandbox*' -ErrorAction Stop }\n$prov=Test-SandboxAppx { Get-AppxProvisionedPackage -Online -ErrorAction Stop }\ntry {\n $s=@(Get-StartApps -ErrorAction Stop | Where-Object {$_.Name -match 'Windows Sandbox'})\n $start=[pscustomobject]@{status='OK';matches=[int]$s.Count}\n} catch {\n $start=[pscustomobject]@{status='UNAVAILABLE';matches=0}\n}\ntry {\n $sysApps=@(Get-ChildItem -LiteralPath (Join-Path $env:WINDIR 'SystemApps') -Directory -Filter '*Sandbox*' -ErrorAction Stop)\n $sysApp=[pscustomobject]@{status='OK';matches=[int]$sysApps.Count}\n} catch {\n $sysApp=[pscustomobject]@{status='UNAVAILABLE';matches=0}\n}\n$hostSession=0\ntry {$hostSession=[int](Get-Process -Id $PID -ErrorAction Stop).SessionId} catch {$hostSession=0}\n$obj=[ordered]@{\n schema='local3d.g331.launch-route-inventory-readonly.v1'\n probeReadOnly=$true\n windowsHost=[bool]($os.Caption -match 'Windows')\n osBuild=[int]$os.BuildNumber\n sandboxOptionalFeatureEnabled=[bool](EnabledFeature 'Containers-DisposableClientVM')\n virtualMachinePlatformEnabled=[bool](EnabledFeature 'VirtualMachinePlatform')\n hyperVHypervisorFeatureEnabled=[bool](EnabledFeature 'Microsoft-Hyper-V-Hypervisor')\n hypervisorPresent=[bool]$sys.HypervisorPresent\n wsbCliCommandResolvable=[bool]$cli\n legacyWindowsSandboxCommandResolvable=[bool]$legacy\n legacySystem32LauncherFileFound=[bool]$legacySystem32\n currentUserWsbAliasFileFound=[bool]$alias\n currentUserAppx=$cur\n allUsersAppx=$all\n provisionedAppx=$prov\n startMenuApps=$start\n systemAppDirectories=$sysApp\n probeRunningInSessionZero=[bool]($hostSession -eq 0)\n}\n$obj | ConvertTo-Json -Depth 5 -Compress";

/**
 * LOCAL3D G3.31 Windows Sandbox launcher and package registration inventory.
 * READ-ONLY: CIM, Get-Command, Appx registry queries, optional-feature STATE.
 * NO wsb start/list/exec/share, guest launch, package install, OS changes.
 */
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export function probeWindowsSandboxLaunchRoutes(){
 if(process.platform!=='win32')
  throw new Error('G3.31 requires authorized Windows host for read-only inventory');
 const stdout=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{
  timeout:55000,maxBuffer:16000,windowsHide:true,encoding:'utf8'
 });
 if(Buffer.byteLength(stdout)>9500)throw new Error('G3.31 unexpected oversized inventory');
 const lines=stdout.trim().split(/\r?\n/);
 if(lines.length!==1)throw new Error('G3.31 invalid one-line inventory JSON');
 return JSON.parse(lines[0]);
}
if(process.argv[1] && process.argv[1].endsWith('g3-31-readonly-launcher-inventory.mjs')){
 console.log('G3_31_READONLY_HOST_INVENTORY '+JSON.stringify(probeWindowsSandboxLaunchRoutes()));
}
