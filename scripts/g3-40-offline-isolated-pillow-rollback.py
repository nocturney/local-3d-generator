"""G3.40 actual OFFLINE Pillow wheel reinstall in disposable CLEAN virtualenv.

Three stages on ONLY a new owned temporary target: original Pillow10.1,
candidate Pillow12.3, then original Pillow10.1 restored from verified wheel.
The real TripoSR Python3.11 venv (all 34 packages) is NEVER modified.
"""
from __future__ import annotations
import hashlib
from importlib import metadata
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import venv
ROOT=Path(__file__).resolve().parents[1]
PROD=(ROOT/"runtime/engines/triposr/venv").resolve()
QA=(ROOT/"runtime/qa/g3").resolve()
W101=QA/"rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl"
W123=QA/"pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl"
S101="0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a"
S123="8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a"
MANIFEST=ROOT/"tests/fixtures/g327-synthetic-images.json"
BASELINE=ROOT/"engines/triposr/requirements-resolved-win-py311.txt"
REPORT=QA/"g340-pillow-isolated-offline-rollback.json"
def sha(path):
 if not path.is_file() or path.is_symlink():raise ValueError("Missing actual trusted wheel")
 h=hashlib.sha256()
 with path.open("rb") as f:
  for block in iter(lambda:f.read(1048576),b""):h.update(block)
 return h.hexdigest()
def require(ok,m):
 if not ok:raise RuntimeError("G340 refused: "+m)
def run(argv,env=None,timeout=90,expect_ok=True):
 r=subprocess.run(argv,cwd=str(ROOT),env=env,stdin=subprocess.DEVNULL,
   stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout,
   text=True,encoding="utf8",errors="replace")
 if expect_ok and r.returncode!=0:
  raise RuntimeError("G340 isolated child subprocess failed at "+Path(argv[0]).name+" code "+str(r.returncode))
 return r
def audit_clean_python(executable):
 r=run([str(executable),"-s","-c","import importlib.util,sys; print(bool(importlib.util.find_spec('PIL')),bool(importlib.util.find_spec('torch')),sys.prefix)"])
 entries=r.stdout.strip().split(" ")
 require(len(entries)>=3 and entries[0]=="False" and entries[1]=="False",
    "clean virtualenv had Pillow or PyTorch already available")
def installed_runtime_hash():
 import PIL
 from PIL import Image
 return (metadata.version("Pillow"),sha(Path(Image.__file__).resolve(strict=True)))
def install_only_to_isolated_target(target,wheel,env):
 require(target.resolve().parent==Path(env["G340_TEMP_ROOT"]).resolve(),"target outside owned temp")
 if not target.exists():target.mkdir()
 cmd=[sys.executable,"-s","-m","pip","install","--no-index","--no-deps",
  "--disable-pip-version-check","--no-cache-dir","--no-compile",
  "--target",str(target),str(wheel)]
 r=run(cmd,env=env,timeout=90)
 require("Successfully installed" in r.stdout,"offline wheel staged but pip did not confirm install")
def report_stage(python,target,version,env):
 childenv=env.copy()
 childenv["PYTHONPATH"]=str(target)
 childenv["PYTHONNOUSERSITE"]="1"
 childenv["CUDA_VISIBLE_DEVICES"]="-1"
 childenv["HF_HUB_OFFLINE"]="1"
 childenv["TRANSFORMERS_OFFLINE"]="1"
 childenv["L3D_ENABLE_TRIPOSR"]="0"
 r=run([str(python),"-s",str(ROOT/"scripts/g3-40-clean-isolated-pillow-check.py"),
  str(target),version,str(MANIFEST)],env=childenv,timeout=30)
 value=json.loads(r.stdout)
 require(value["pillowVersion"]==version and value["isolatedTargetImport"] is True and
   len(value["trustedThreeSamples"])==3,"untrusted isolated subprocess output")
 return value
def main():
 require(sys.platform=="win32" and sys.version_info[:2]==(3,11),"requires Win Python3.11")
 require(Path(sys.executable).resolve(strict=True).is_relative_to(PROD),"source Python not production venv")
 require(os.environ.get("L3D_ENABLE_TRIPOSR")!="1","G2 opt in")
 require(sha(W101)==S101 and sha(W123)==S123,"original and candidate official wheels not SHA pinned")
 require(sha(MANIFEST)=="171c9b8cc010cd8f05620a70617122a5c97ec074c951cc0ef27ad35ccf1cdbdb","trusted fixture drift")
 require(sha(BASELINE)=="887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7","production requirements drift")
 baseline=installed_runtime_hash()
 require(baseline[0]=="10.1.0","production Pillow unexpectedly changed")
 QA.mkdir(parents=True,exist_ok=True)
 results=[]
 with tempfile.TemporaryDirectory(prefix="g340-full-isolated-wheel-rollback-",dir=QA) as tmp:
  temp=Path(tmp).resolve(strict=True)
  venvpath=temp/"cleanvenv"
  venv.EnvBuilder(with_pip=False,system_site_packages=False,symlinks=False).create(venvpath)
  exe=venvpath/"Scripts/python.exe"
  require(exe.is_file() and exe.resolve().is_relative_to(temp),"clean venv invalid path")
  audit_clean_python(exe)
  target=temp/"isolated-site-packages"
  env=os.environ.copy()
  env["G340_TEMP_ROOT"]=str(temp)
  env["PIP_NO_INDEX"]="1"
  env["PIP_DISABLE_PIP_VERSION_CHECK"]="1"
  env["PIP_NO_CACHE_DIR"]="1"
  env["PYTHONPATH"]=""
  for label,wheel,version in [
   ("BASELINE_ISOLATED",W101,"10.1.0"),
   ("CANDIDATE_ISOLATED",W123,"12.3.0"),
   ("RESTORED_BASELINE_ISOLATED",W101,"10.1.0")
  ]:
   if target.exists():
    require(not target.is_symlink() and target.resolve().parent==temp,"target no longer owned")
    shutil.rmtree(target)
   install_only_to_isolated_target(target,wheel,env)
   check=report_stage(exe,target,version,env)
   results.append({"stage":label,"pillowVersion":version,
    "pixelSha256ByFormat":{row["format"]:row["pixelSha256"] for row in check["trustedThreeSamples"]},
    "isolatedCleanPython":True,
    "actualWheelPackageFilesInstalledOnlyInOwnedTemp":True})
  require(results[0]["pixelSha256ByFormat"]==results[1]["pixelSha256ByFormat"]==
    results[2]["pixelSha256ByFormat"],"real native decode RGB disparity on trusted original samples")
 require(installed_runtime_hash()==baseline,"PRODUCTION PILLOW UNEXPECTEDLY ALTERED")
 receipt={
  "schema":"local3d.g340.real-isolated-pillow-wheel-rollback-only.v1",
  "date":"2026-10-11",
  "trustedOriginalSyntheticFixtureSha256":sha(MANIFEST),
  "productionRequirementsSha256":sha(BASELINE),
  "pillow101OfficialPyPiSha256":S101,
  "pillow123OfficialShadowSha256":S123,
  "productionPillowUnchanged":"10.1.0",
  "productionPillowImagePyUnchangedSha256":baseline[1],
  "cleanIndependentVenvCreated":True,
  "isolatedWheelStages":results,
  "realPillowNativeDecoderStagesPassed":3,
  "threeTrustedOriginalFormatsPixelShaMatchAcrossStages":True,
  "offlineWheelRestorePerformedInDisposableVenv":True,
  "full34PackageTripoSRVenvCopiedOrRestored":False,
  "productionPipInstallOrUninstall":False,
  "productionPythonModified":False,
  "networkAccessOrDownloadDuringRestore":False,
  "gpuOrModelInferenceRuns":0,
  "osNativeDecoderSandboxVerified":False,
  "untrustedMediaProcessed":False,
  "productionPillowUpgradeAuthorized":False,
  "printerApproved":False
 }
 data=(json.dumps(receipt,indent=2,sort_keys=True)+"\n").encode()
 if REPORT.exists():
  require(REPORT.read_bytes()==data,"private immutable real-rollback receipt drift")
 else:
  with REPORT.open("xb") as f:f.write(data)
 print("G340_REAL_ISOLATED_PILLOW_WHEEL_ROLLBACK_PASS "+json.dumps({
  "stages":3,"trustedRGBFormatComparisons":3,
  "pillow10_1RestoredInIsolatedEnvironment":True,
  "fullProductionVenvRestored":False,
  "productionChanged":False,
  "gpu":0,"receiptSHA256":hashlib.sha256(data).hexdigest()
 }))
if __name__=="__main__":main()
