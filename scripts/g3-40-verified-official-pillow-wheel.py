"""G3.40 fetch and verify a single historical upstream Pillow wheel as recovery input.

Only downloads the explicitly pinned PyPI Windows Python3.11 Pillow10.1.0 wheel
to ignored LOCAL3D QA. NEVER installs/uninstalls into production, executes
wheel binaries, contacts arbitrary hosts or reads customer/private files.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import sys
import urllib.request
from urllib.parse import urlsplit
from zipfile import ZipFile

ROOT=Path(__file__).resolve().parents[1]
WHEEL="Pillow-10.1.0-cp311-cp311-win_amd64.whl"
SHA="0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a"
API="https://pypi.org/pypi/Pillow/10.1.0/json"
DEST=ROOT/"runtime/qa/g3/rollback-wheelhouse"
MAX_JSON=2_000_000
MAX_WHEEL=4_000_000
def sum_file(file):
 h=hashlib.sha256()
 with file.open("rb") as f:
  for piece in iter(lambda:f.read(1048576),b""):h.update(piece)
 return h.hexdigest()
def official_entry():
 req=urllib.request.Request(API,headers={"Accept":"application/json","User-Agent":"LOCAL3D-G340-approved-roll-back-readiness/1"})
 with urllib.request.urlopen(req,timeout=20) as response:
  if response.geturl()!=API:raise RuntimeError("Unexpected release metadata redirect")
  data=response.read(MAX_JSON+1)
  if len(data)>MAX_JSON:raise RuntimeError("Release metadata oversized")
 r=json.loads(data)
 candidates=[f for f in r.get("urls",[]) if f.get("filename")==WHEEL and f.get("packagetype")=="bdist_wheel"]
 if len(candidates)!=1:raise RuntimeError("Specific upstream wheel entry missing or ambiguous")
 entry=candidates[0]
 link=entry.get("url","")
 parsed=urlsplit(link)
 if (parsed.scheme!="https" or parsed.hostname!="files.pythonhosted.org" or
    parsed.username or parsed.password or parsed.query or parsed.fragment or
    not parsed.path.startswith("/packages/")):
  raise RuntimeError("Untrusted upstream artifact hostname/path")
 if entry.get("digests",{}).get("sha256")!=SHA or not(2_000_000<=entry.get("size",0)<=MAX_WHEEL):
  raise RuntimeError("Official PyPI artifact SHA/size mismatch")
 return link,entry["size"]
def check_wheel(file):
 if sum_file(file)!=SHA:raise RuntimeError("Wheel checksum differs from pinned official SHA")
 with ZipFile(file) as z:
  names=set(z.namelist())
  prefix="Pillow-10.1.0.dist-info/"
  if not (prefix+"WHEEL" in names and prefix+"METADATA" in names):raise RuntimeError("Missing wheel metadata")
  wheel=z.read(prefix+"WHEEL").decode("utf8","strict")
  meta=z.read(prefix+"METADATA").decode("utf8","strict").replace("\r\n","\n")
  if "Tag: cp311-cp311-win_amd64" not in wheel:
   raise RuntimeError("Python/Windows wheel tag mismatch")
  if "\nVersion: 10.1.0\n" not in "\n"+meta+"\n" or "\nname: pillow\n" not in "\n"+meta.lower()+"\n":
   raise RuntimeError("Package name/version mismatch")
  if len(names)>300:raise RuntimeError("Unexpected archive complexity")
def main():
 if sys.platform!="win32" or sys.version_info[:2]!=(3,11):raise RuntimeError("Requires existing Windows CPython3.11")
 if not (ROOT/"engines/triposr/requirements-resolved-win-py311.txt").read_text(encoding="utf8").count("Pillow==10.1.0")==1:
  raise RuntimeError("Pinned project baseline requirement no longer matches")
 if os.environ.get("L3D_ENABLE_TRIPOSR")=="1":raise RuntimeError("Do not fetch with G2 opt in")
 if DEST.is_symlink():raise RuntimeError("Recovery folder symlink forbidden")
 DEST.mkdir(parents=True,exist_ok=True)
 wheel_file=DEST/WHEEL
 if wheel_file.is_symlink():raise RuntimeError("Wheel symlink forbidden")
 if wheel_file.is_file():
  check_wheel(wheel_file)
  print("G340_OFFICIAL_BACKUP_WHEEL_VERIFIED "+json.dumps({"version":"10.1.0","bytes":wheel_file.stat().st_size,"sha256":SHA,"freshDownload":False,"productionModified":False}))
  return
 link,size=official_entry()
 temp=DEST/(WHEEL+".download-incomplete")
 if temp.exists() or temp.is_symlink():raise RuntimeError("Another download temp file exists")
 try:
  with urllib.request.urlopen(urllib.request.Request(link,headers={"User-Agent":"LOCAL3D-G340-recovery/1"}),timeout=30) as response:
   if urlsplit(response.geturl()).hostname!="files.pythonhosted.org":
    raise RuntimeError("Artifact redirected to another host")
   total=0
   h=hashlib.sha256()
   with temp.open("xb") as f:
    while True:
     block=response.read(256*1024)
     if not block:break
     total+=len(block)
     if total>MAX_WHEEL:raise RuntimeError("Wheel exceeds expected file size limit")
     f.write(block);h.update(block)
  if total!=size or h.hexdigest()!=SHA:raise RuntimeError("Upstream SHA/size check failed")
  check_wheel(temp)
  os.replace(temp,wheel_file)
 finally:
  if temp.exists():temp.unlink()
 print("G340_OFFICIAL_BACKUP_WHEEL_VERIFIED "+json.dumps({"version":"10.1.0","bytes":size,"sha256":SHA,"freshDownload":True,"productionModified":False}))
if __name__=="__main__":main()
