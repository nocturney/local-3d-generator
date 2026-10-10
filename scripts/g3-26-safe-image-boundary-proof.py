"""G3.26 immutable CPU-only proof over synthetic in-memory Pillow images.

Inputs: previous sanitized G3.25 proof and tracked source bytes. No private
files, untrusted paths, GPU, new provider or OS/security changes.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from engines.quality.safe_image_fixture_probe import build_safe_probe

FILES = {
    "g325": ROOT / "docs/evidence/g3/g3-25-pillow-format-review.json",
    "server": ROOT / "server/index.js",
    "worker": ROOT / "engines/triposr/worker.py",
    "probe": ROOT / "engines/quality/safe_image_fixture_probe.py",
}
OUT = ROOT / "docs/evidence/g3/g3-26-harmless-image-boundary.json"

def sha(path: Path) -> str:
    s=path.lstat()
    if not path.is_file() or path.is_symlink() or s.st_size<10 or s.st_size>750000:
        raise ValueError("G3.26 refuses invalid, symlinked or oversized public/source file")
    return hashlib.sha256(path.read_bytes()).hexdigest()

def report() -> dict:
    hashes={k:sha(v) for k,v in FILES.items()}
    prior=json.loads(FILES["g325"].read_text(encoding="utf-8"))
    if prior.get("schema") != "local3d.g3.25.pillow-format-and-api-triage-not-clearance.v1" or \
       prior.get("livePillowVersion") != "10.1.0" or \
       prior.get("publicPillowRecordsAccountedFor") != 32 or \
       prior.get("perAdvisoryActualReachabilityCertified") != 0 or \
       prior.get("securityIssue4Resolved") is not False or \
       prior.get("newUntrustedUserFilesApproved") is not False or \
       prior.get("printQualified") is not False or \
       prior.get("inputSourceNodeSha256") != hashes["server"] or \
       prior.get("inputSourcePythonSha256") != hashes["worker"]:
        raise ValueError("G3.26 previous source lineage or safety flags changed")
    d=build_safe_probe()
    if len(d["results"]) != 3 or {x["format"] for x in d["results"]} != {"PNG","JPEG","WEBP"}:
        raise RuntimeError("G3.26 harmless image fixture formats incomplete")
    return {
        "schema":"local3d.g3.26.cpu-synthetic-pillow-boundary-not-security-clearance.v1",
        "createdOn":"2026-10-10",
        "previousG325SanitizedProofSha256":hashes["g325"],
        "trackedSourceSha256":{
            "serverIndex":hashes["server"],
            "worker":hashes["worker"],
            "inMemoryProbe":hashes["probe"]
        },
        "pillowSourceTests":d,
        "sourceImagesTrustedSyntheticOnly":True,
        "workerAndApiIntegrationNotCertifiedByInMemoryPillowProbe":True,
        "headerCheckNotFullImageValidation":True,
        "all32PillowAdvisoryApplicabilityUnresolved":True,
        "securityIssue4Resolved":False,
        "manufacturingIssue3Resolved":False,
        "newUntrustedUploadsAllowed":False,
        "nativeParserOSConfinementVerified":False,
        "packagesInstalled":0,
        "gpuInferenceRuns":0,
        "modelExecutions":0,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE"
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--write-public",action="store_true")
    args=parser.parse_args()
    result=report()
    raw=(json.dumps(result,indent=2,ensure_ascii=True)+"\n").encode("utf-8")
    if len(raw)>24000: raise ValueError("G3.26 public evidence budget")
    if OUT.exists() or OUT.is_symlink():
        if sha(OUT) != hashlib.sha256(raw).hexdigest() or OUT.read_bytes()!=raw:
            raise RuntimeError("G3.26 immutable public proof changed")
    else:
        if not args.write_public:
            raise RuntimeError("G3.26 no-flag read-only replay requires existing evidence")
        with OUT.open("xb") as stream:
            stream.write(raw)
    print("G3_26_SYNTHETIC_PILLOW_BOUNDARY_PASS "+json.dumps({
        "formats":[x["format"] for x in result["pillowSourceTests"]["results"]],
        "generatedTrustedOnly":True,
        "pillowVersion":result["pillowSourceTests"]["pillowVersion"],
        "sha256":hashlib.sha256(raw).hexdigest(),
        "untrustedUploadsPermitted":False,"GPUInferenceRuns":0
    }))

if __name__=="__main__":
    main()
