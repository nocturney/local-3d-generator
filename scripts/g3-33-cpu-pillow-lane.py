"""G3.33 CPU-only Pillow 10.1 / existing 12.3 shadow preprocessing comparison.

Trusted project-original + licensed upstream public image fixtures ONLY.
No model imports, torch, GPU, network, installs, OS changes or customer images.
"""
from __future__ import annotations
import argparse
import base64
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"benchmarks/g3/fixtures/manifest.json"
SYNTHETIC=ROOT/"tests/fixtures/g327-synthetic-images.json"
OUTPUT=ROOT/"runtime/qa/g3/g333-pillow-lanes"
OVERLAY=ROOT/"runtime/qa/g3/pillow-shadow/overlay"
WHEEL=ROOT/"runtime/qa/g3/pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl"
PINNED_WHEEL_SHA="8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a"
SYNTHETIC_SHAS={
 "PNG":"d56708bc91a3e8a17b97c0abdf4cccbf886f7c608ebd7a427382e52c36f3d5eb",
 "JPEG":"4530bce5b2d096b8fb97183ddfddf291d347efb98738da087446f774f8b449dd",
 "WEBP":"7c80680b4cae2db5072515663f3fc760c9d0078e2861cd2b3e50f848c477bd64",
}
def digest(raw:bytes)->str:
 return sha256(raw).hexdigest()
def file_digest(path:Path)->str:
 h=sha256()
 with path.open("rb") as stream:
  for block in iter(lambda:stream.read(1024*1024),b""):h.update(block)
 return h.hexdigest()
def safe(path:Path,limit:int)->bytes:
 if path.is_symlink() or not path.is_file() or not (12<=path.stat().st_size<=limit):
  raise ValueError("G333 untrusted file type, size, symlink or path")
 return path.read_bytes()
def source_record(image,picture,processing,source_id,rights):
 if picture.mode!="RGB" or not (64<=picture.width<=16384 and 64<=picture.height<=16384) or picture.width*picture.height>16000000:
  raise ValueError("G333 invalid preprocessed image dimensions or mode")
 return {
  "publicSourceId":source_id,"publicSourceSha256":digest(image),
  "sourceRights":rights,"resultSize":[picture.width,picture.height],
  "resultMode":"RGB","resultRgbBytesSha256":digest(picture.tobytes()),
  "alphaCompositeApplied":"mid-gray" in processing
 }
def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--lane",required=True,choices=("production","shadow"))
 args=ap.parse_args()
 if sys.version_info[:2]!=(3,11):raise ValueError("G333 requires pinned Python 3.11")
 import PIL
 from PIL import Image,ImageOps
 sys.path.insert(0,str(ROOT))
 from engines.triposr.worker import prepare_image
 expected="10.1.0" if args.lane=="production" else "12.3.0"
 pil_file=Path(PIL.__file__).resolve(strict=True)
 if PIL.__version__!=expected or pil_file.is_relative_to(OVERLAY.resolve())!=(args.lane=="shadow"):
  raise ValueError("G333 incorrect process-local Pillow version or import path")
 if file_digest(WHEEL)!=PINNED_WHEEL_SHA:
  raise ValueError("G333 existing shadow wheel hash changed")
 manifest_raw=safe(CATALOG,100000)
 manifest=json.loads(manifest_raw)
 if manifest.get("schema")!="local3d.g3.fixture-catalog.v1" or len(manifest.get("fixtures",[]))!=9:
  raise ValueError("G333 unexpected public fixture manifest")
 rows=[]
 for entry in manifest["fixtures"]:
  rights=entry["sourceRights"]
  if rights=="PROJECT_ORIGINAL_PROCEDURAL":
   origin=ROOT/"benchmarks/g3/fixtures"
  elif rights=="UPSTREAM_TRIPOSR_MIT_SAMPLE" and entry["id"]=="09-upstream-chair":
   origin=ROOT
  else:raise ValueError("G333 unapproved fixture rights")
  image=(origin/entry["files"]["image"]).resolve(strict=True)
  if not image.is_relative_to(ROOT.resolve()) or image.suffix.lower() not in (".png",".jpg",".jpeg",".webp"):
   raise ValueError("G333 untrusted image file path")
  raw=safe(image,8*1024*1024)
  if digest(raw)!=entry["imageSha256"]:raise ValueError("G333 image license/SHA drift")
  prepped,processing=prepare_image(image)
  rows.append(source_record(raw,prepped,processing,entry["id"],rights))
  if file_digest(image)!=entry["imageSha256"]:raise ValueError("G333 input changed")
 synthetic_raw=safe(SYNTHETIC,16000)
 synthetic=json.loads(synthetic_raw)
 if synthetic["schema"]!="local3d.g327.trusted-generated-image-fixtures.v1" or len(synthetic["images"])!=3:
  raise ValueError("G333 synthetic identities changed")
 for item in synthetic["images"]:
  kind=item["format"]
  if kind not in SYNTHETIC_SHAS or item["sha256"]!=SYNTHETIC_SHAS[kind]:
   raise ValueError("G333 unapproved synthetic identity")
  raw=base64.b64decode(item["base64"],validate=True)
  if digest(raw)!=SYNTHETIC_SHAS[kind] or len(raw)>2048:raise ValueError("G333 synthetic SHA mismatch")
  with Image.open(BytesIO(raw)) as src:
   if src.format!=kind or src.size!=(64,64):raise ValueError("G333 synthetic parse mismatch")
   src.load()
   oriented=ImageOps.exif_transpose(src)
   if "A" in oriented.getbands() or "transparency" in oriented.info:
    rgba=oriented.convert("RGBA")
    gray=Image.new("RGBA",rgba.size,(128,128,128,255))
    picture=Image.alpha_composite(gray,rgba).convert("RGB")
    prep="mid-gray"
   else:
    picture=oriented.convert("RGB")
    prep="original"
  rows.append(source_record(raw,picture,prep,"trusted-synthetic-"+kind,"PROJECT_ORIGINAL_GENERATED"))
 report={
  "schema":"local3d.g333.cpu-pillow-lane-public-fixtures-only.v1",
  "lane":args.lane,"pillowVersion":PIL.__version__,
  "pillowFromSeparateShadowOverlay":args.lane=="shadow",
  "shadowWheelPinnedSha256":PINNED_WHEEL_SHA,
  "catalogSha256":digest(manifest_raw),
  "syntheticCatalogSha256":digest(synthetic_raw),
  "rows":rows,"fixtureCount":len(rows),
  "allInputsTrustedOrLicensed":True,
  "cpuOnly":True,"gpuInferenceRuns":0,"modelWeightsLoaded":False,
  "productionPythonEnvironmentMutated":False,
  "untrustedCustomerMediaProcessed":False,
  "printQualified":False,"securityCertified":False
 }
 if len(rows)!=12:raise ValueError("G333 require exactly twelve trusted cases")
 OUTPUT.mkdir(parents=True,exist_ok=True)
 out=OUTPUT/(args.lane+".json")
 bytes_=(json.dumps(report,indent=2,sort_keys=True)+"\n").encode("utf8")
 if out.exists() or out.is_symlink():
  if safe(out,20000)!=bytes_:raise ValueError("G333 immutable lane output changed")
 else:
  with out.open("xb") as fp:fp.write(bytes_)
 print("G333_CPU_PINNED_PILLOW_LANE_PASS "+json.dumps({
  "lane":args.lane,"pillow":PIL.__version__,
  "trustedInputs":len(rows),"resultSha256":digest(bytes_),"gpuRuns":0
 }))
if __name__=="__main__":main()
