"""LOCAL3D G3.34: CPU-only exact-SHA existing safe edge-case Pillow preprocessing.

Reads four locally generated historical G3.6 trusted samples only.
No model, GPU, Sandbox, customer files, installs or network access.
"""
from __future__ import annotations
import argparse
from hashlib import sha256
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
INPUTS=ROOT/"runtime/qa/g3/pillow-shadow/samples"
OUTPUT=ROOT/"runtime/qa/g3/g334-pillow-safe-edge-cases"
SHADOW=ROOT/"runtime/qa/g3/pillow-shadow/overlay"
TRUSTED={
 "alpha.png":(121,"d7c52161972333112d95d374c8477257d536ae437d1103cc5b2799d50b184a56"),
 "exif-rotation.jpg":(784,"55c343c1f17b7991a58171eac5029b7367804a0b3969aa5a6d1466ed86404bb3"),
 "webp-alpha.webp":(48,"e865cf82125ac46bc94e7a88be934bf611b11042285e0ff51a9d53111e1c289a"),
 "corrupted.png":(15,"35bbe6e0f47476fd614b7825eebce1477b7a479445768c6a43c9a43a24d28d17"),
}
def hash_bytes(data):
 return sha256(data).hexdigest()
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--lane",required=True,choices=["production","shadow"])
 args=p.parse_args()
 if sys.version_info[:2]!=(3,11):raise ValueError("G334 expected Python3.11")
 import PIL
 expected="10.1.0" if args.lane=="production" else "12.3.0"
 file=Path(PIL.__file__).resolve(strict=True)
 if PIL.__version__!=expected or file.is_relative_to(SHADOW.resolve())!=(args.lane=="shadow"):
  raise ValueError("G334 pinned Pillow lane mismatched")
 sys.path.insert(0,str(ROOT))
 from engines.triposr.worker import prepare_image
 source=ROOT/"scripts/g3-6-pillow-shadow-check.py"
 script=source.read_text(encoding="utf8")
 if not all(marker in script for marker in ("alpha.png","exif-rotation.jpg","webp-alpha.webp","corrupted.png")):
  raise ValueError("G334 missing provenance in G3.6 original synthetic test source")
 rows=[]
 for name,(size,expected_sha) in TRUSTED.items():
  source_path=INPUTS/name
  if source_path.is_symlink() or not source_path.is_file() or source_path.stat().st_size!=size:
   raise ValueError("G334 unexpected source path/type/size")
  raw=source_path.read_bytes()
  if hash_bytes(raw)!=expected_sha:raise ValueError("G334 original sample SHA changed")
  try:
   processed,description=prepare_image(source_path)
   if name=="corrupted.png":raise ValueError("G334 corrupt image wrongly accepted")
   if processed.mode!="RGB":raise ValueError("G334 output mode not RGB")
   if name=="exif-rotation.jpg":
    if processed.size!=(80,96):raise ValueError("G334 EXIF orientation not applied")
   elif processed.size!=(96,80):
    raise ValueError("G334 unexpected alpha test size")
   if name in ("alpha.png","webp-alpha.webp") and "mid-gray" not in description:
    raise ValueError("G334 expected gray alpha compositing")
   rows.append({
    "caseId":name.split(".")[0],
    "trustedInputSha256":expected_sha,
    "status":"ACCEPTED_TRUSTED_KNOWN_GOOD",
    "size":[processed.width,processed.height],
    "mode":processed.mode,
    "rgbPixelSha256":hash_bytes(processed.tobytes()),
    "alphaComposite":"mid-gray" in description
   })
  except (OSError,ValueError) as error:
   if name!="corrupted.png":raise
   if str(error)=="G334 corrupt image wrongly accepted":raise
   rows.append({
    "caseId":"corrupted",
    "trustedInputSha256":expected_sha,
    "status":"REJECTED_CORRUPT_BY_PILLOW",
    "errorClass":type(error).__name__,
    "messageExposed":False
   })
  if hash_bytes(source_path.read_bytes())!=expected_sha:
   raise ValueError("G334 original safe sample changed while parsing")
 report={
  "schema":"local3d.g334.trusted-existing-pillow-edge-cases-cpu.v1",
  "lane":args.lane,"pillowVersion":PIL.__version__,
  "originalHistoricalSourceScriptSha256":hash_bytes(source.read_bytes()),
  "cases":rows,"trustedCasesCount":4,
  "hostCpuOnly":True,"productionEnvChanged":False,
  "untrustedFilesProcessed":False,"sandboxGuestLaunched":False,
  "modelsLoaded":False,"inferenceRuns":0,"printQualified":False
 }
 OUTPUT.mkdir(parents=True,exist_ok=True)
 out=OUTPUT/(args.lane+".json")
 buf=(json.dumps(report,sort_keys=True,indent=2)+"\n").encode("utf8")
 if out.exists() or out.is_symlink():
  if out.read_bytes()!=buf:raise ValueError("G334 immutable lane report drift")
 else:
  with out.open("xb") as f:f.write(buf)
 print("G334_SAFE_PILLOW_LANE_PASS "+json.dumps({
  "lane":args.lane,"version":PIL.__version__,
  "cases":len(rows),"corruptRejected":rows[-1]["status"]=="REJECTED_CORRUPT_BY_PILLOW",
  "reportSHA256":hash_bytes(buf),"gpuRuns":0
 }))
if __name__=="__main__":
 main()
