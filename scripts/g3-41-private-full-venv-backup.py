"""G3.41 actual full 34-package Python venv filesystem backup with SHA auditing.

Copies ONLY the authorized LOCAL3D Python venv (no models/customer data) to
private ignored QA. Source is strictly read-only. No pip/CUDA/G2/OS actions.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
PROD=(ROOT/"runtime/engines/triposr/venv").resolve()
PARENT=ROOT/"runtime/qa/g3/venv-recovery"
SNAP=PARENT/"production-py311-pillow101-complete-packages"
MANIFEST=PARENT/"production-py311-pillow101-complete-packages-manifest.json"
REPORT=ROOT/"runtime/qa/g3/g341-real-full-venv-backup.json"
WHEEL=ROOT/"runtime/qa/g3/rollback-wheelhouse/Pillow-10.1.0-cp311-cp311-win_amd64.whl"
WHEEL_HASH="0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a"
REQ=ROOT/"engines/triposr/requirements-resolved-win-py311.txt"
REQ_HASH="887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7"
SYMLINK_BIT=getattr(stat,"FILE_ATTRIBUTE_REPARSE_POINT",0)
def sha_bytes(b):return hashlib.sha256(b).hexdigest()
def sha(path):
 h=hashlib.sha256()
 with path.open("rb") as f:
  for part in iter(lambda:f.read(4*1024*1024),b""):h.update(part)
 return h.hexdigest()
def require(valid,msg):
 if not valid:raise RuntimeError("G341 refused: "+msg)
def is_link(path):
 st=path.lstat()
 return path.is_symlink() or bool(getattr(st,"st_file_attributes",0)&SYMLINK_BIT)
def source_inventory():
 expected={"Include","Lib","Scripts","share","pyvenv.cfg"}
 require({p.name for p in PROD.iterdir()}==expected,"unexpected root top-level content")
 count=0;size=0;source=[]
 for dirname,dirs,files in os.walk(PROD,followlinks=False):
  current=Path(dirname)
  dirs.sort();files.sort()
  for dn in dirs:
   require(not is_link(current/dn),"live source directory reparsepoint forbidden")
  for name in files:
   file=current/name
   require(not is_link(file) and file.is_file(),"nonregular source file")
   require(name.lower() not in {".env",".pypirc",".netrc","pip.ini","credentials.json","id_rsa","id_ed25519"},
    "private configuration file discovered inside production venv")
   rel=file.relative_to(PROD).as_posix()
   z=file.stat().st_size
   require(z>=0 and z<4*1024*1024*1024,"unexpected single file size")
   source.append((rel,z))
   count+=1;size+=z
   require(count<=60000 and size<=9*1024**3,"source bounds exceeded")
 require(25000<=count<=35000 and 4*1024**3<size<7*1024**3,"source size/count changed unexpectedly")
 return source,count,size
def verify_against_manifest(dest,rows):
 count=0;num=0
 for rel,z,expected in rows:
  file=dest/Path(rel)
  require(file.is_file() and not is_link(file),"snapshot missing or symlinked file "+rel)
  require(file.stat().st_size==z and sha(file)==expected,"snapshot SHA mismatch "+rel)
  count+=1;num+=z
 require(count==len(rows),"snapshot count mismatch")
 return count,num
def run_cloned_python():
 python=SNAP/"Scripts/python.exe"
 require(python.is_file() and not is_link(python),"cloned Python exe missing")
 env=os.environ.copy()
 env.update({"L3D_ENABLE_TRIPOSR":"0","CUDA_VISIBLE_DEVICES":"-1",
   "HF_HUB_OFFLINE":"1","TRANSFORMERS_OFFLINE":"1","PYTHONNOUSERSITE":"1"})
 env.pop("PYTHONPATH",None)
 command=[str(python),"-s",str(ROOT/"scripts/g3-41-full-clone-runtime-smoke.py"),str(SNAP)]
 p=subprocess.run(command,cwd=ROOT,env=env,stdin=subprocess.DEVNULL,
  stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding="utf8",
  errors="replace",timeout=120)
 if p.returncode!=0:
  raise RuntimeError("G341 cloned Python failed independent CPU metadata/decode check code "+str(p.returncode))
 value=json.loads(p.stdout)
 require(value["schema"]=="local3d.g341.full-cloned-venv-real-cpu-readback.v1" and
  value["pinnedInstalledDistributionsVerified"]==34 and
  value["cloneInterpreterProven"] is True and
  value["originalVenvImported"] is False and
  value["pillowVersion"]=="10.1.0","clone CPU validation changed")
 return value
def main():
 require(sys.platform=="win32" and sys.version_info[:2]==(3,11),"Windows Python3.11 required")
 require(Path(sys.executable).resolve(strict=True).is_relative_to(PROD),"must use production interpreter read-only")
 require(os.environ.get("L3D_ENABLE_TRIPOSR")!="1","G2 opt-in forbidden")
 require(sha(REQ)==REQ_HASH and sha(WHEEL)==WHEEL_HASH,"source requirements or original recovery wheel drift")
 require(not is_link(PROD) and PROD.is_dir(),"production source not a plain directory")
 PARENT.mkdir(parents=True,exist_ok=True)
 require(not is_link(PARENT),"private destination reparsepoint")
 if SNAP.exists():
  require(MANIFEST.is_file() and not is_link(MANIFEST),"existing snapshot missing manifest")
  m=json.loads(MANIFEST.read_text(encoding="utf8"))
  require(m["schema"]=="local3d.g341.full-python-venv-private-files-sha.v1","manifest schema")
  rows=m["files"]
  require(m["count"]==len(rows) and m["totalBytes"]==sum(x[1] for x in rows),
   "snapshot manifest count/size inconsistency")
  checked,byt=verify_against_manifest(SNAP,rows)
  created=False
 else:
  require(not MANIFEST.exists(),"stale manifest with no validated snapshot")
  sources,count,total=source_inventory()
  free=shutil.disk_usage(PARENT).free
  require(free>max(20*1024**3,total*3),"not enough free D drive space for safe copy")
  print("G341_BACKUP_PREFLIGHT "+json.dumps({
   "files":count,"gib":round(total/1024**3,2),"freeGib":round(free/1024**3,1),
   "productionWrite":False}),flush=True)
  with tempfile.TemporaryDirectory(prefix="_g341_owned_staging_",dir=PARENT) as tmp:
   folder=Path(tmp).resolve(strict=True)
   staging=folder/"copiedvenv"
   require(staging!=PROD and not staging.is_relative_to(PROD),"destination overlaps prod")
   shutil.copytree(PROD,staging,symlinks=False)
   rows=[]
   for i,(rel,z) in enumerate(sources,1):
    original=PROD/Path(rel)
    copy=staging/Path(rel)
    require(copy.is_file() and copy.stat().st_size==z,"post-copy file differs")
    original_hash=sha(original)
    require(sha(copy)==original_hash,"post-copy complete file SHA differs "+rel)
    rows.append([rel,z,original_hash])
    if i%6000==0:print("G341_BACKUP_SHA_PROGRESS "+str(i)+"/"+str(count),flush=True)
   more,total_after=source_inventory()[0],source_inventory()[2]
   require(more==sources and total_after==total,"source added/removed/changed during backup")
   content={"schema":"local3d.g341.full-python-venv-private-files-sha.v1",
    "date":"2026-10-11","count":len(rows),"totalBytes":total,"files":rows}
   manbytes=(json.dumps(content,separators=(',',':'),ensure_ascii=True)+"\n").encode()
   local_manifest=folder/"manifest.json"
   local_manifest.write_bytes(manbytes)
   os.replace(staging,SNAP)
   os.replace(local_manifest,MANIFEST)
  checked,byt=count,total
  created=True
 runtime=run_cloned_python()
 require(runtime["originalThreeTrustedRgbSamples"].keys()=={"PNG","JPEG","WEBP"},
  "clone original 3 format decoded image set unexpected")
 # Manifest SHA is a fingerprint of the whole full-venv inventory, never publish filenames.
 digest=sha(MANIFEST)
 receipt={
  "schema":"local3d.g341.actual-private-full-python-venv-snapshot.v1",
  "date":"2026-10-11",
  "snapshotCreatedThisRun":created,
  "allSourceSnapshotFilesHashVerified":True,
  "totalSnapshotFileCount":checked,
  "totalSnapshotFileBytes":byt,
  "snapshotPrivateFileManifestSHA256":digest,
  "snapshotSourceRequirementsSHA256":REQ_HASH,
  "originalOfficialPillowRecoveryWheelSHA256":WHEEL_HASH,
  "isolatedClonedInterpreterChecks":runtime,
  "all34PinnedDistributionsAccessibleFromClone":True,
  "modelWeightsOrCustomerDataIncluded":False,
  "productionVenvFilesModifiedOrReinstalled":False,
  "snapshotIsOfflineMachineLocalOnly":True,
  "snapshotContainsFullPythonVenvPackages":True,
  "backupACLAndHardwarePortabilityFullyQualified":False,
  "actualCompleteOSDisasterRecoveryQualified":False,
  "productionPillowUpgradeAuthorized":False,
  "gpuOrModelRuns":0,
  "nativeDecoderOSSandboxAttested":False,
  "printQualified":False
 }
 # This frozen private receipt describes a completed snapshot, not whether a
 # later verifier needed to copy it again. 'created' is diagnostic stdout only.
 receipt.pop("snapshotCreatedThisRun")
 payload=(json.dumps(receipt,sort_keys=True,indent=2)+"\n").encode()
 if REPORT.exists() or REPORT.is_symlink():
  require(REPORT.read_bytes()==payload,"private snapshot receipt changed")
 else:
  with REPORT.open("xb") as f:f.write(payload)
 print("G341_FULL_VENV_PRIVATE_SNAPSHOT_SHA_VERIFIED "+json.dumps({
  "files":checked,"bytes":byt,"manifestSHA256":digest,
  "clone34PinnedDistributionsPassed":True,
  "clonedNativePillow3FormatsPassed":True,
  "createdNow":created,"productionChanged":False,"gpu":0
 }),flush=True)
if __name__=="__main__":main()
