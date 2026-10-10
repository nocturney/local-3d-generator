"""Read-only reproduction of G3.8 CPU diagnostics for a completed local orb job.

Zero AI inference, CUDA, GPU reservation, slicer, network or output writes.
The per-job UUID is supplied privately via CLI; public evidence omits it.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import sys

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["PYTHONNOUSERSITE"]="1"

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))

from geometry_qa import QAError, digest
from triangle_contact_screen import screen_glb
from orb_radial_irregularity import compare_real_orb

EXPECTED_SHA={
    "source":"f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
    "derivative":"ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
    "reference":"c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749"
}
PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
REFERENCE=ROOT/"benchmarks"/"g3"/"fixtures"/"01-orb-alpha"/"ground-truth.glb"
DERIVATIVE=PRIVATE/"orb-positive-winding.glb"
IGNORE_NUMERIC_VOLATILE=frozenset({"cpuElapsedSeconds"})

def verified_raw(path:Path):
    if path.is_symlink() or not path.is_file():
        raise QAError("Untrusted private artifact")
    return path.read_bytes()

def check_record(expected:dict,actual:dict):
    for key,value in expected.items():
        if key in IGNORE_NUMERIC_VOLATILE:
            continue
        if key not in actual or value!=actual[key]:
            raise QAError("G3.8 reproduced diagnostic differs in field "+key)
    if set(expected)!=set(actual):
        raise QAError("Reproduced diagnostic field set differs")

def verify(job_id:str):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",job_id,re.I):
        raise QAError("Only completed-job UUID may be supplied")
    jobdir=ROOT/"runtime"/"data-g2-manual"/"jobs"/job_id
    if jobdir.is_symlink() or jobdir.resolve(strict=True)!=jobdir.absolute():
        raise QAError("Job path has unexpected link")
    job=json.loads(verified_raw(jobdir/"job.json"))
    if job.get("id")!=job_id or job.get("status")!="completed" or \
       job.get("providerId")!="triposr-local" or job.get("simulation") is not False:
        raise QAError("Reproduction requires genuine completed local model")
    models={
        "source":jobdir/"output.glb",
        "derivative":DERIVATIVE,
        "reference":REFERENCE
    }
    for name,path in models.items():
        verified_raw(path)
        if digest(path)!=EXPECTED_SHA[name]:
            raise QAError("Pinned real G3 source or derivative digest mismatch")
    report_paths={
        "source":PRIVATE/"original-contact-screen.json",
        "derivative":PRIVATE/"contact-screen-cpu.json",
        "reference":PRIVATE/"ground-truth-contact-screen.json"
    }
    for name,p in report_paths.items():
        expected=json.loads(verified_raw(p))
        actual=screen_glb(models[name])
        check_record(expected,actual)
        if actual["completeBroadphaseAndSATForEligiblePairs"] is not True or \
           actual["selfIntersectionFreeCertified"] is not False or \
           actual["printQualified"] is not False:
            raise QAError("Unexpected actual CPU-contact report safety flags")
    stored_radial=json.loads(verified_raw(PRIVATE/"orb-radial-cpu.json"))
    regenerated=compare_real_orb(REFERENCE,models["source"],DERIVATIVE)
    if regenerated!=stored_radial:
        raise QAError("Radial CPU diagnostic not reproducible")
    print("G3_8_CPU_ONLY_FULL_REPLAY_PASS "+json.dumps({
        "triangles":40352,
        "realModelSha256":EXPECTED_SHA["source"],
        "orientationDerivativeSha256":EXPECTED_SHA["derivative"],
        "reproducedContactScans":3,
        "reproducedRadialFit":True,
        "noGpuAiRuns":True,
        "printQualified":False}))

if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--job-id",required=True)
        args=parser.parse_args()
        verify(args.job_id)
    except (QAError,OSError,ValueError,KeyError,TypeError) as exc:
        print("G3_8_CPU_REPLAY_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
