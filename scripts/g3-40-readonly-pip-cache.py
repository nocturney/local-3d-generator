"""G3.40 read-only bounded pip HTTP cache wheel inventory (not install).

Matches cached Windows CPython3.11 Pillow10.1.0 against historical PyPI
official SHA and verifies wheel METADATA/WHEEL without extraction.
"""
from pathlib import Path
import hashlib
import json
import os
import sys
from zipfile import ZipFile, BadZipFile, is_zipfile

ROOT=Path(__file__).resolve().parents[1]
EXPECTED_SHA="0f7c276c05a9767e877a0b4c5050c8bee6a6d960d7f0c11ebda6b99746068c2a"
CACHED=Path(os.environ.get("LOCALAPPDATA",""))/"pip/Cache/http-v2"
MAX_FILES=6000
MAX_BYTES=35_000_000
OUT=ROOT/"runtime/qa/g3/g340-pip-cache-pillow-10-1-inventory.json"
def sha_file(file):
 h=hashlib.sha256()
 with file.open("rb") as f:
  for data in iter(lambda:f.read(4*1024*1024),b""):h.update(data)
 return h.hexdigest()
def scan():
 if sys.platform!="win32" or not CACHED.is_dir() or CACHED.is_symlink():
  raise RuntimeError("G340 read-only cache root unavailable")
 visited=0
 zip_candidates=0
 matching=[]
 rootpath=CACHED.resolve()
 for base,dirs,files in os.walk(CACHED,followlinks=False):
  dirs[:]=[x for x in dirs if not (Path(base)/x).is_symlink()]
  for name in files:
   if not name.endswith(".body"):continue
   visited+=1
   if visited>MAX_FILES:raise RuntimeError("G340 cache inventory exceeded safety bound")
   file=Path(base)/name
   if file.is_symlink() or not file.is_file():continue
   if not file.resolve().is_relative_to(rootpath):continue
   size=file.stat().st_size
   if not (2_000_000<=size<=MAX_BYTES):continue
   try:
    if not is_zipfile(file):continue
    with ZipFile(file) as z:
     info=z.infolist()
     if len(info)>2500:continue
     names={x.filename for x in info if len(x.filename)<256}
     prefix="Pillow-10.1.0.dist-info/"
     if not (prefix+"WHEEL" in names and prefix+"METADATA" in names):
      continue
     if any(x.file_size>3_000_000 for x in info if x.filename in (prefix+"WHEEL",prefix+"METADATA")):continue
     wheel=z.read(prefix+"WHEEL",pwd=None).decode("utf8","replace")
     meta=z.read(prefix+"METADATA",pwd=None).decode("utf8","replace")
     if not ("Tag: cp311-cp311-win_amd64" in wheel and
             "\nVersion: 10.1.0\n" in "\n"+meta+"\n" and
             "\nName: pillow\n" in "\n"+meta.lower()+"\n"):
      continue
     zip_candidates+=1
     digest=sha_file(file)
     matching.append({"opaqueCachedBodySha256":digest,"fileBytes":size,"matchesOfficialPyPiSha256":digest==EXPECTED_SHA,
                       "privateCacheRelativeKey":str(file.relative_to(CACHED))})
   except (OSError,BadZipFile,ValueError,RuntimeError):
    continue
 return visited,zip_candidates,matching
def main():
 n,c,matching=scan()
 record={"schema":"local3d.g340.pip-http-cache-pillow101-offline-wheel-scan.v1",
         "date":"2026-10-11","officialPyPIWheelSha256":EXPECTED_SHA,
         "scannedCachedHttpBodyFiles":n,"matchedPillow101WindowsCp311Wheels":c,
         "verifiedOfficialPyPiWheelInCacheCount":sum(bool(x["matchesOfficialPyPiSha256"]) for x in matching),
         "matchingPrivateCacheSources":matching,
         "productionPackagesModified":False,"pipInstallOrNetworkDownloadPerformed":False,
         "gpuOrModelRuns":0}
 OUT.parent.mkdir(parents=True,exist_ok=True)
 payload=json.dumps(record,sort_keys=True,indent=2)+"\n"
 if OUT.exists():
  if json.loads(OUT.read_text(encoding="utf8"))!=record:
   raise RuntimeError("G340 previously frozen private cache observation differs")
 else:
  with OUT.open("x",encoding="utf8") as f:f.write(payload)
 print("G340_READONLY_PIP_CACHE "+json.dumps({k:record[k] for k in (
  "scannedCachedHttpBodyFiles","matchedPillow101WindowsCp311Wheels",
  "verifiedOfficialPyPiWheelInCacheCount","productionPackagesModified")}))
if __name__=="__main__":main()
