"""G3.40 trusted-only Pillow wheel check inside a fresh, empty Python venv.

Called by g3-40 isolated offline rollback. Not an inference worker.
"""
from __future__ import annotations
import base64
import hashlib
import io
import json
import sys
from pathlib import Path

if len(sys.argv)!=4:raise SystemExit("Need isolated package root, expected version, trusted manifest")
target=Path(sys.argv[1]).resolve(strict=True)
expected=sys.argv[2]
manifest=Path(sys.argv[3]).resolve(strict=True)
if expected not in ("10.1.0","12.3.0"):raise SystemExit("Unexpected Pillow version")
from PIL import Image
import PIL
actual=Path(PIL.__file__).resolve(strict=True)
if PIL.__version__!=expected or not actual.is_relative_to(target):
 raise SystemExit("Pillow was NOT loaded from independent isolated package root")
payload=manifest.read_bytes()
if hashlib.sha256(payload).hexdigest()!="171c9b8cc010cd8f05620a70617122a5c97ec074c951cc0ef27ad35ccf1cdbdb":
 raise SystemExit("Original synthetic manifest SHA differs")
fixture=json.loads(payload)
if fixture["schema"]!="local3d.g327.trusted-generated-image-fixtures.v1" or len(fixture["images"])!=3:
 raise SystemExit("Expected exactly three already-authored safe samples")
samples=[]
for row in fixture["images"]:
 raw=base64.b64decode(row["base64"],validate=True)
 if hashlib.sha256(raw).hexdigest()!=row["sha256"]:raise SystemExit("Original image SHA differs")
 with Image.open(io.BytesIO(raw)) as img:
  img.load()
  if img.size!=(64,64) or img.format!=row["format"]:
   raise SystemExit("Pillow native decoder format mismatch")
  rgb=img.convert("RGB")
  samples.append({"format":row["format"],"sourceSha256":row["sha256"],
                  "pixelSha256":hashlib.sha256(rgb.tobytes()).hexdigest(),
                  "width":rgb.width,"height":rgb.height,"mode":rgb.mode})
if len({x["format"] for x in samples})!=3 or {x["format"] for x in samples}!={"PNG","JPEG","WEBP"}:
 raise SystemExit("Synthetic source coverage changed")
print(json.dumps({"pillowVersion":PIL.__version__,"trustedThreeSamples":samples,"isolatedTargetImport":True}))
