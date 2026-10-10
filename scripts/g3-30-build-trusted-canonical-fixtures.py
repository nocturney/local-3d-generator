"""G3.30: TRUSTED original synthetic-only PIL conversion into canonical PNG.

HOST CPU ONLY, NOT Windows Sandbox and NOT a safe decoder for hostile media.
Three exact SHA-locked generated 64x64 images; no jobs, uploads or models.
"""
from __future__ import annotations
import argparse
import base64
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageOps, __version__ as pillow_version

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"tests/fixtures/g327-synthetic-images.json"
OUT=ROOT/"tests/fixtures/g330-trusted-canonical-output.json"
TRUSTED={
 "PNG":("image/png","d56708bc91a3e8a17b97c0abdf4cccbf886f7c608ebd7a427382e52c36f3d5eb"),
 "JPEG":("image/jpeg","4530bce5b2d096b8fb97183ddfddf291d347efb98738da087446f774f8b449dd"),
 "WEBP":("image/webp","7c80680b4cae2db5072515663f3fc760c9d0078e2861cd2b3e50f848c477bd64"),
}

def safe_read(path:Path,max_size:int)->bytes:
    st=path.lstat()
    if path.is_symlink() or not path.is_file() or st.st_size>max_size or st.st_size<12:
        raise ValueError("G3.30 missing, symlinked or unexpectedly sized public fixture")
    return path.read_bytes()

def build():
    if pillow_version!="10.1.0":
        raise ValueError("G3.30 pinned-only trusted Pillow runtime changed")
    parent= safe_read(SOURCE,16384)
    prior=json.loads(parent)
    if prior.get("schema")!="local3d.g327.trusted-generated-image-fixtures.v1" or \
       prior.get("originalSyntheticOnly") is not True or \
       len(prior.get("images",[]))!=3:
        raise ValueError("G3.30 source is not original safe synthetic fixture set")
    sample=[]
    for entry in prior["images"]:
        fmt=entry["format"]
        if fmt not in TRUSTED:raise ValueError("G3.30 unexpected format")
        mime,expected=TRUSTED[fmt]
        if entry["mime"]!=mime or entry["sha256"]!=expected:
            raise ValueError("G3.30 input identity mismatch")
        original=base64.b64decode(entry["base64"],validate=True)
        if sha256(original).hexdigest()!=expected or len(original)>2048:
            raise ValueError("G3.30 trusted input bytes not SHA pinned")
        with Image.open(BytesIO(original)) as src:
            if src.format!=fmt or src.size!=(64,64):raise ValueError("G3.30 unexpected source")
            src.load()
            flat=ImageOps.exif_transpose(src).convert("RGB")
            if flat.size!=(64,64):raise ValueError("G3.30 post-EXIF size change")
            result=BytesIO()
            flat.save(result,format="PNG",optimize=False)
        raw=result.getvalue()
        if len(raw)>65536:raise ValueError("G3.30 synthetic output size budget")
        with Image.open(BytesIO(raw)) as check:
            check.load()
            if check.format!="PNG" or check.mode!="RGB" or check.size!=(64,64):
                raise ValueError("G3.30 canonical PNG roundtrip failed")
        sample.append({
            "sourceFormat":fmt,
            "sourceMime":mime,
            "sourceSHA256":expected,
            "outputMime":"image/png",
            "outputMode":"RGB",
            "outputWidth":64,"outputHeight":64,
            "outputSHA256":sha256(raw).hexdigest(),
            "outputBytes":len(raw),
            "outputBase64":base64.b64encode(raw).decode("ascii")
        })
    return {
      "schema":"local3d.g330.trusted-host-cpu-canonical-fixtures-not-guest-output.v1",
      "pillowVersion":pillow_version,
      "sourceFixtureSetSHA256":sha256(parent).hexdigest(),
      "trustedOriginalGeneratedOnly":True,
      "executionEnvironment":"HOST_PINNED_PILLOW_TRUSTED_CPU_FIXTURE_ONLY",
      "sandboxVMExecuted":False,
      "networkEgressIsolated":False,
      "untrustedUploadProcessed":False,
      "guestDecoderProven":False,
      "productionGpuOrPrinterReady":False,
      "samples":sample
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--write-public",action="store_true")
    args=p.parse_args()
    report=build()
    raw=(json.dumps(report,ensure_ascii=True,indent=2)+"\n").encode("utf-8")
    if len(raw)>20000:raise ValueError("G3.30 report size budget")
    if OUT.exists() or OUT.is_symlink():
        if safe_read(OUT,20000)!=raw:raise ValueError("G3.30 immutable fixture output drift")
    else:
        if not args.write_public:raise ValueError("G3.30 first fixture creation needs explicit --write-public")
        with OUT.open("xb") as f:f.write(raw)
    print("G3_30_TRUSTED_CANONICAL_FIXTURE_PASS "+json.dumps({
      "trustedOnly":True,"sourceFormats":[x["sourceFormat"] for x in report["samples"]],
      "pngOutputs":len(report["samples"]),
      "sourceSetSHA256":report["sourceFixtureSetSHA256"],
      "outputProofSHA256":sha256(raw).hexdigest(),
      "guestRun":False,"gpuRuns":0
    }))

if __name__=="__main__":
    main()
