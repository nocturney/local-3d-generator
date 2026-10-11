"""G3.38 READ ONLY real Python distribution metadata + synthetic rollback dry-run.

Uses Python stdlib only. Never runs pip install/uninstall, Torch, CUDA or model;
no network/OS privileges, no production venv writes or customer data.
"""
from __future__ import annotations
import hashlib
from importlib import metadata
import json
import os
from pathlib import Path
import re
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
RUNTIME=(ROOT/"runtime/engines/triposr/venv").resolve()
REQUIREMENTS=ROOT/"engines/triposr/requirements-resolved-win-py311.txt"
SHADOW_WHEEL=ROOT/"runtime/qa/g3/pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl"
WHEEL_SHA="8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a"
MANIFEST_SHA="887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7"
PRIVATE=ROOT/"runtime/qa/g3/g338-production-readonly-rollback-rehearsal.json"
OFFLINE_DIRS=[
 ROOT/"runtime/qa/g3/pillow-shadow/wheels",
 ROOT/"runtime/wheels",
 ROOT/"runtime/downloads",
 ROOT/"engines/triposr/wheels"
]

def sha(data:bytes)->str:
 return hashlib.sha256(data).hexdigest()

def safe_file(file:Path,limit:int)->bytes:
 if file.is_symlink() or not file.is_file() or file.stat().st_size<10 or file.stat().st_size>limit:
  raise ValueError("G338 bad pinned file type/size/symlink")
 return file.read_bytes()

def parse_manifest(raw:bytes):
 lines=raw.decode("utf8").strip().splitlines()
 if len(lines)!=34:raise ValueError("G338 unexpected requirements count")
 out={}
 for line in lines:
  m=re.fullmatch(r"([A-Za-z0-9_.-]+)==([A-Za-z0-9.!+_-]+)",line)
  if not m:raise ValueError("G338 malformed pinned line")
  name,version=m.groups()
  key=re.sub(r"[-_.]+","-",name).lower()
  if key in out:raise ValueError("G338 duplicate normalized requirement")
  out[key]=(name,version)
 if out.get("pillow")!=("Pillow","10.1.0") or out.get("torch")!=("torch","2.5.1+cu121") or out.get("transformers")!=("transformers","4.35.0"):
  raise ValueError("G338 frozen production critical versions drift")
 return out

def compare_installed(requirements):
 mismatches=[]
 for key,(original,version) in requirements.items():
  try: observed=metadata.version(original)
  except metadata.PackageNotFoundError: observed=None
  if observed!=version:mismatches.append(key)
 return sorted(mismatches)

def wheel_inventory():
 checks=0; rollback=[]
 for folder in OFFLINE_DIRS:
  if not folder.is_dir() or folder.is_symlink():continue
  checks+=1
  for candidate in folder.iterdir():
   name=candidate.name.lower()
   if re.fullmatch(r"pillow[-_]10[.]1[.]0[-_].+[.]whl",name):
    if candidate.is_file() and not candidate.is_symlink() and 1000000<=candidate.stat().st_size<=30000000:
     rollback.append(sha(safe_file(candidate,30000000)))
 return checks, sorted(rollback)

def rollback_rehearsal(raw:bytes):
 # Use *only* a safe temporary owned folder in ignored runtime/qa/g3.
 # Simulate a manifest change; this is not real pip/site-packages rollback.
 rehearsal_dir=ROOT/"runtime/qa/g3"
 rehearsal_dir.mkdir(parents=True,exist_ok=True)
 scenarios=[]
 with tempfile.TemporaryDirectory(prefix="g338-synthetic-rollback-",dir=rehearsal_dir) as folder:
  loc=Path(folder)
  baseline=loc/"baseline.txt"
  staged=loc/"staged.txt"
  receipt=loc/"candidate.txt"
  baseline.write_bytes(raw)
  staged.write_bytes(raw.replace(b"Pillow==10.1.0",b"Pillow==12.3.0"))
  if sha(baseline.read_bytes())!=MANIFEST_SHA or b"Pillow==12.3.0" not in staged.read_bytes():
   raise ValueError("G338 synthetic stage incorrect")
  os.replace(staged,receipt)
  if sha(receipt.read_bytes())==MANIFEST_SHA:
   raise ValueError("G338 simulated candidate cannot equal baseline")
  # Apply a controlled synthetic rollback from the protected baseline snapshot.
  restored=loc/"restore.txt"
  restored.write_bytes(baseline.read_bytes())
  os.replace(restored,receipt)
  if sha(receipt.read_bytes())!=MANIFEST_SHA:
   raise ValueError("G338 rollback SHA did not match")
  scenarios.append("STAGED_DIFFERENT_VERSION_THEN_BASELINE_SHA_RESTORED")
  # Simulate tampering: refuse to proceed, then restore from baseline.
  receipt.write_bytes(b"tampered candidate not trusted")
  if sha(receipt.read_bytes())==MANIFEST_SHA:
   raise ValueError("G338 tamper must be detected")
  restored=loc/"restore-after-tamper.txt"
  restored.write_bytes(baseline.read_bytes())
  os.replace(restored,receipt)
  if sha(receipt.read_bytes())!=MANIFEST_SHA:
   raise ValueError("G338 tamper-path restore SHA mismatch")
  scenarios.append("TAMPER_DETECTED_AND_ORIGINAL_SHA_RESTORED")
 return scenarios

def main():
 if sys.platform!="win32" or sys.version_info[:2]!=(3,11):
  raise ValueError("G338 requires existing Windows Python3.11")
 exe=Path(sys.executable).resolve(strict=True)
 if not exe.is_relative_to(RUNTIME) or not str(exe).lower().endswith("python.exe"):
  raise ValueError("G338 MUST execute only in pinned production interpreter, without modifying it")
 if os.environ.get("L3D_ENABLE_TRIPOSR")=="1":raise ValueError("G338 refuses G2 active opt-in")
 raw=safe_file(REQUIREMENTS,12000)
 if sha(raw)!=MANIFEST_SHA:raise ValueError("G338 production lock manifest changed")
 packages=parse_manifest(raw)
 mismatches=compare_installed(packages)
 if mismatches:raise ValueError("G338 production installed dependency inventory no longer matches pinned lock")
 wheel=safe_file(SHADOW_WHEEL,30000000)
 if sha(wheel)!=WHEEL_SHA:raise ValueError("G338 existing 12.3 shadow wheel SHA differs")
 existing_count,backups=wheel_inventory()
 scenarios=rollback_rehearsal(raw)
 # NOT a release, no actual package backup exists in this restricted scan.
 output={
  "schema":"local3d.g338.pinned-python-readonly-rollback-dryrun.v1",
  "date":"2026-10-11",
  "windowsPy311ProductionInterpreterVerified":True,
  "exactFrozenRequirementsSHA256":MANIFEST_SHA,
  "requirementCount":len(packages),
  "installedRequirementsMatched":34,
  "criticalProductionVersions":{"pillow":"10.1.0","torch":"2.5.1+cu121","transformers":"4.35.0"},
  "existingPillow12_3ShadowWheelVerifiedSHA256":WHEEL_SHA,
  "scopedLocalWheelDirectoriesChecked":existing_count,
  "pinnedPillow10_1OfflineWheelFoundInCheckedDirs":len(backups)>0,
  "matchedOfflineRollbackWheelSha256":backups,
  "syntheticRehearsalOutcomes":scenarios,
  "syntheticRehearsalRestoredOriginalManifestSHA256":MANIFEST_SHA,
  "productionInstallOrRollbackActuallyPerformed":False,
  "realProductionPackageBackupVerified":False,
  "productionVenvPackagesChanged":False,
  "newDownloadOrNetworkRequest":False,
  "gpuOrModelRuns":0,
  "nativeDecoderSandboxEstablished":False,
  "productionUpgradeAuthorized":False,
  "deploymentReadiness":"BLOCKED_NO_APPROVED_ROLLBACK_OR_GPU_SECURITY_CLEARANCE",
  "printQualified":False
 }
 PRIVATE.parent.mkdir(parents=True,exist_ok=True)
 payload=(json.dumps(output,sort_keys=True,indent=2)+"\n").encode()
 if PRIVATE.exists() or PRIVATE.is_symlink():
  if safe_file(PRIVATE,30000)!=payload:raise ValueError("G338 immutable private report drift")
 else:
  with PRIVATE.open("xb") as f:f.write(payload)
 print("G338_READONLY_PROD_AND_SYNTHETIC_ROLLBACK_PASS "+json.dumps({
  "requirementsMatched":len(packages),
  "scopedWheelDirs":existing_count,
  "originalOfflineRollbackWheelFound":bool(backups),
  "syntheticRollbackScenarios":len(scenarios),
  "productionUnchanged":True,
  "gpu":0,"reportSha256":sha(payload)
 }))
if __name__=="__main__":main()
