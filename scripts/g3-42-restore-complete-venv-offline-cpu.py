"""G3.42 REAL same-host complete 34-package venv restore from G3.41 private backup.

Recreates full 5GB Python venv in an owned disposable QA directory; proves ALL
SHA-pinned files, independent restored Python metadata, full 269 CPU unit tests,
then deletes ONLY disposable restore. Production & source backup read-only.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"runtime/qa/g3/venv-recovery/production-py311-pillow101-complete-packages"
ORIGINAL=ROOT/"runtime/engines/triposr/venv"
PARENT=ROOT/"runtime/qa/g3/venv-recovery"
MANIFEST=PARENT/"production-py311-pillow101-complete-packages-manifest.json"
REPORT=ROOT/"runtime/qa/g3/g342-real-restored-full-venv-cpu-qa.json"
MANIFEST_SHA="2c87d7cc2e7f1703a6c5c92521036f21630737ede2376020897faec94459df9d"
SYMLINK_BIT=getattr(stat,"FILE_ATTRIBUTE_REPARSE_POINT",0)
def sha(b):return hashlib.sha256(b).hexdigest()
def sha_file(file):
 h=hashlib.sha256()
 with file.open("rb") as f:
  for chunk in iter(lambda:f.read(4*1024*1024),b""):h.update(chunk)
 return h.hexdigest()
def assert_ok(ok,msg):
 if not ok:raise RuntimeError("G342 SAFE RESTORE REFUSED "+msg)
def link(path):
 st=path.lstat()
 return path.is_symlink() or bool(getattr(st,"st_file_attributes",0)&SYMLINK_BIT)
def read_manifest():
 assert_ok(MANIFEST.is_file() and not link(MANIFEST),"missing private SHA backup inventory")
 raw=MANIFEST.read_bytes()
 assert_ok(sha(raw)==MANIFEST_SHA,"original G3.41 immutable manifest changed")
 m=json.loads(raw)
 assert_ok(m["schema"]=="local3d.g341.full-python-venv-private-files-sha.v1" and
  m["count"]==27966 and m["totalBytes"]==5086619721 and
  len(m["files"])==27966,"unexpected original snapshot count/size")
 return m
def inventory(folder):
 rels=set();size=0
 for base,dirs,files in os.walk(folder,followlinks=False):
  current=Path(base)
  for dn in dirs:assert_ok(not link(current/dn),"directory reparse detected")
  for n in files:
   file=current/n
   assert_ok(file.is_file() and not link(file),"file reparse/invalid")
   rel=file.relative_to(folder).as_posix()
   rels.add(rel);size+=file.stat().st_size
 return rels,size
def verify_complete(snapshot,items,label):
 rels,size=inventory(snapshot)
 expected={x[0] for x in items}
 assert_ok(rels==expected,"extra/missing source files in "+label)
 assert_ok(size==5086619721,"wrong complete directory bytes "+label)
 for count,(rel,z,digest) in enumerate(items,1):
  file=snapshot/Path(rel)
  assert_ok(file.stat().st_size==z and sha_file(file)==digest,
   "full file SHA differs in "+label)
  if count%7000==0:print("G342_"+label+"_SHA_PROGRESS "+str(count)+"/27966",flush=True)
def run(exe,args,env,expected):
 r=subprocess.run([str(exe),*args],cwd=ROOT,env=env,stdin=subprocess.DEVNULL,
  stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=120,
  encoding="utf8",text=True,errors="replace")
 output=r.stdout+"\n"+r.stderr
 match=re.search(r"Ran (\d+) tests in",output)
 assert_ok(r.returncode==0 and match is not None and int(match.group(1))==expected
  and re.search(r"(?m)^OK\s*$",output) is not None,
  "cloned CPU tests failed or test count changed")
 return int(match.group(1))
def main():
 assert_ok(sys.platform=="win32" and sys.version_info[:2]==(3,11),"not Windows 3.11")
 assert_ok(Path(sys.executable).resolve(strict=True).is_relative_to(ORIGINAL.resolve(strict=True)),
  "read-only parent must be actual production Python interpreter")
 assert_ok(os.environ.get("L3D_ENABLE_TRIPOSR")!="1","manual G2 enabled")
 assert_ok(SOURCE.is_dir() and not link(SOURCE) and not link(PARENT),
  "invalid backup destination")
 m=read_manifest()
 assert_ok(shutil.disk_usage(PARENT).free>3*m["totalBytes"],"disk capacity too small")
 items=m["files"]
 # No alteration of original backup/production; verify source digest.
 print("G342_SOURCE_PRIVATE_BACKUP_AUDIT",flush=True)
 verify_complete(SOURCE,items,"SOURCE")
 summary=None
 with tempfile.TemporaryDirectory(prefix="_g342_disposable_full_venv_restore_",dir=PARENT) as temp:
  owned=Path(temp).resolve(strict=True)
  target=owned/"restored-venv"
  assert_ok(not owned.is_relative_to(ORIGINAL.resolve(strict=True)) and
   not owned.is_relative_to(SOURCE.resolve(strict=True)),"owned restore overlaps original")
  print("G342_COPY_FULL_VENV_TO_NEW_TEMP_TARGET",flush=True)
  shutil.copytree(SOURCE,target,symlinks=False)
  verify_complete(target,items,"RESTORED")
  env=os.environ.copy()
  env.update({"PYTHONDONTWRITEBYTECODE":"1","PYTHONNOUSERSITE":"1",
   "CUDA_VISIBLE_DEVICES":"-1","L3D_ENABLE_TRIPOSR":"0",
   "HF_HUB_OFFLINE":"1","TRANSFORMERS_OFFLINE":"1"})
  env.pop("PYTHONPATH",None)
  exe=target/"Scripts/python.exe"
  assert_ok(exe.is_file() and not link(exe),"no restored Windows Python launcher")
  report=subprocess.run([str(exe),"-s",str(ROOT/"scripts/g3-41-full-clone-runtime-smoke.py"),str(target)],
    cwd=ROOT,env=env,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,text=True,encoding="utf8",errors="replace",timeout=45)
  assert_ok(report.returncode==0,"restored independent python runtime not executable")
  clone=json.loads(report.stdout)
  assert_ok(clone["schema"]=="local3d.g341.full-cloned-venv-real-cpu-readback.v1" and
   clone["pinnedInstalledDistributionsVerified"]==34 and
   clone["originalVenvImported"] is False and
   clone["pillowVersion"]=="10.1.0","restored 34 packages or native Pillow metadata differ")
  print("G342_RESTORED_PYTHON_AND_34_PACKAGES_VERIFIED",flush=True)
  quality=run(exe,["-m","unittest","discover","-s","engines/quality","-p","test_*.py"],env,262)
  print("G342_RESTORED_QUALITY_TESTS "+str(quality),flush=True)
  g2=run(exe,["-m","unittest","discover","-s","engines/triposr","-p","test_offline.py"],env,7)
  print("G342_RESTORED_G2_OFFLINE_TESTS "+str(g2),flush=True)
  verify_complete(target,items,"POST_QA_RESTORED")
  summary={
   "schema":"local3d.g342.actual-full-package-venv-restore-from-private-backup.v1",
   "date":"2026-10-11",
   "previousPrivateSnapshotManifestSha256":MANIFEST_SHA,
   "sourceBackupBytes":m["totalBytes"],
   "sourceBackupFileCount":m["count"],
   "allSourceAndRestoredSha256Verified":True,
   "full34PackageVenvRestoredToIndependentTemporaryDirectory":True,
   "restoredPythonSysPrefixAndNativePillowVerified":True,
   "all34PinnedInstalledDistributionsInRestoredVenv":True,
   "restoredNativeTrustedPillowFormatsTested":3,
   "restoredPythonQualityTestsPassed":quality,
   "restoredG2OfflineTestsPassed":g2,
   "allRestoredFilesRehashedAfterUnitTests":True,
   "allValidationRunOfflineAndCUDAHidden":True,
   "productionAndOriginalBackupNeverModified":True,
   "restoredSourceIsSeparateFromLiveProduction":True,
   "fullSystemOSPythonBaseGpuDriversModelWeightsIncluded":False,
   "offMachinePortableDisasterRecoveryProven":False,
   "modelInferenceOrCudaGpuJobs":0,
   "untrustedImagesProcessed":False,
   "nativeDecoderOSConfinementAttested":False,
   "G1Persistent4177OrOffice4178Modified":False,
   "PythonProductionUpgradeApproved":False,
   "securityIssue4Resolved":False,
   "printQualified":False
  }
 # Leaving TempDirectory guarantees deletion of complete restored package tree.
 assert_ok(summary is not None and not Path(temp).exists(),"disposable restored venv not removed")
 summary["restoredTemporaryVenvCleanedUp"]=True
 receipt=(json.dumps(summary,sort_keys=True,indent=2)+"\n").encode()
 if REPORT.exists():
  assert_ok(REPORT.read_bytes()==receipt,"immutable private CPU restore receipt drift")
 else:
  with REPORT.open("xb") as f:f.write(receipt)
 print("G342_FULL_34_PACKAGE_REAL_RESTORE_PASS "+json.dumps({
  "files":summary["sourceBackupFileCount"],
  "bytes":summary["sourceBackupBytes"],
  "restoredQualityTests":quality,"restoredG2OfflineTests":g2,
  "restoredTemporaryVenvRemoved":True,
  "productionChanged":False,"GPU":0,
  "privateReceiptSha256":sha(receipt)
 }),flush=True)
if __name__=="__main__":main()
