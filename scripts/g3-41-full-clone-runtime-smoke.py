"""G3.41 smoke for a copied FULL 34-package Python venv: metadata + safe RGB.

Run only from the ACTUAL clone python.exe, never from production or model worker.
"""
from pathlib import Path
import base64
import hashlib
import importlib.metadata as metadata
import io
import json
import sys
ROOT=Path(__file__).resolve().parents[1]
ORIGINAL=(ROOT/"runtime/engines/triposr/venv").resolve()
if len(sys.argv)!=2:raise SystemExit("Pass owned clone root")
CLONE=Path(sys.argv[1]).resolve(strict=True)
if Path(sys.prefix).resolve()!=CLONE or Path(sys.executable).resolve().is_relative_to(ORIGINAL):
 raise SystemExit("Execution not isolated to expected cloned Python prefix")
from PIL import Image
import PIL
if not Path(PIL.__file__).resolve(strict=True).is_relative_to(CLONE):
 raise SystemExit("Pillow resolved to original production not clone")
if sys.version_info[:2]!=(3,11) or PIL.__version__!="10.1.0":
 raise SystemExit("Clone Python / Pillow version mismatch")
if any(str(ORIGINAL).lower() in str(x).lower() for x in sys.path):
 raise SystemExit("Clone sys.path still contains production site packages")
manifest=ROOT/"engines/triposr/requirements-resolved-win-py311.txt"
if hashlib.sha256(manifest.read_bytes()).hexdigest()!="887970cf973af2a619bfa6d09ab5a28bf6cd9cc3f24867eefaf35e73f72c21a7":
 raise SystemExit("G341 baseline lock changed")
reqs={}
for line in manifest.read_text(encoding="utf8").splitlines():
 n,version=line.split("==",1)
 reqs[n]=version
if len(reqs)!=34:raise SystemExit("Expected 34 installed pinned packages")
for name,version in reqs.items():
 if metadata.version(name)!=version:
  raise SystemExit("Clone pinned metadata differs: "+name)
 dist=metadata.distribution(name)
 folder=Path(dist.locate_file("")).resolve(strict=True)
 if not folder.is_relative_to(CLONE):
  raise SystemExit("Distribution outside clone: "+name)
source=ROOT/"tests/fixtures/g327-synthetic-images.json"
if hashlib.sha256(source.read_bytes()).hexdigest()!="171c9b8cc010cd8f05620a70617122a5c97ec074c951cc0ef27ad35ccf1cdbdb":
 raise SystemExit("G341 trusted source hash changed")
doc=json.loads(source.read_bytes())
samples=[]
for row in doc["images"]:
 raw=base64.b64decode(row["base64"],validate=True)
 if hashlib.sha256(raw).hexdigest()!=row["sha256"]:raise SystemExit("G341 unsafe/modified fixture")
 with Image.open(io.BytesIO(raw)) as im:
  im.load()
  if im.size!=(64,64) or im.format!=row["format"]:raise SystemExit("Wrong image")
  samples.append((row["format"],hashlib.sha256(im.convert("RGB").tobytes()).hexdigest()))
print(json.dumps({"schema":"local3d.g341.full-cloned-venv-real-cpu-readback.v1",
 "cloneInterpreterProven":True,"originalVenvImported":False,
 "pinnedInstalledDistributionsVerified":len(reqs),
 "pillowVersion":"10.1.0","originalThreeTrustedRgbSamples":dict(samples),
 "GPUModelExecution":False}))
