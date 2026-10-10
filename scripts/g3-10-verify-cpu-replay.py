"""G3.10 private, READ-ONLY CPU replay for four already pinned model GLBs.

The existing job UUID stays local. This verifies source SHA and re-computes
every deterministic vertex-only ray classification field except elapsed time.
It never loads the neural model, allocates CUDA, prints, or writes a GLB.
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
from geometry_qa import QAError,digest
from vertex_only_ray_screen import screen_existing_glb

EXPECTED={
"original":"f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
"corrected":"ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
"reference":"c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
"chair":"48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec"}
PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
FILES={
"corrected":PRIVATE/"orb-positive-winding.glb",
"reference":ROOT/"benchmarks"/"g3"/"fixtures"/"01-orb-alpha"/"ground-truth.glb",
"chair":ROOT/"docs"/"evidence"/"g3"/"chair-positive-winding.glb"}
PROOFS={
"original":PRIVATE/"original-vertex-ray-screen.json",
"corrected":PRIVATE/"corrected-vertex-ray-screen.json",
"reference":PRIVATE/"reference-vertex-ray-screen.json",
"chair":PRIVATE/"historic-chair-vertex-ray-screen.json"}

def verify(job_id):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",job_id,re.I):
        raise QAError("Existing job UUID expected")
    folder=ROOT/"runtime"/"data-g2-manual"/"jobs"/job_id
    if folder.is_symlink() or folder.resolve(strict=True)!=folder.absolute():
        raise QAError("Job folder has unexpected link")
    job=json.loads((folder/"job.json").read_text(encoding="utf-8"))
    if job.get("id")!=job_id or job.get("status")!="completed" or \
       job.get("providerId")!="triposr-local" or job.get("simulation") is not False:
        raise QAError("Only previously completed genuine TripoSR job allowed")
    FILES["original"]=folder/"output.glb"
    records={}
    for name,file in FILES.items():
        if file.is_symlink() or not file.is_file() or digest(file)!=EXPECTED[name]:
            raise QAError("SHA-pinned original, derivative or GT model mismatch")
        proof=PROOFS[name]
        if proof.is_symlink() or not proof.is_file():
            raise QAError("Expected private local CPU evidence is absent")
        old=json.loads(proof.read_text(encoding="utf-8"))
        now=screen_existing_glb(file)
        old.pop("secondsCpu",None)
        now.pop("secondsCpu",None)
        if old!=now:
            raise QAError("G3.10 replay diverged for "+name)
        if not now["completeVertexOnlyPairClassification"] or \
           now["trueSelfIntersectionFreeCertified"] is not False or \
           now["printQualified"] is not False or \
           now["newAiInference"] is not False:
            raise QAError("Unexpected G3.10 safety gate")
        records[name]=now
    actual=records["original"]
    corrected=records["corrected"]
    for k in ("vertexOnlyPairsEnumerated","vertexOnlyPairsExamined",
              "fullEdgePairDoubleIncidencesSkipped",
              "classification","status"):
        if actual[k]!=corrected[k]:
            raise QAError("Pure winding reversal changed vertex-only contact topology")
    print("G3_10_PRIVATE_CPU_REPLAY_PASS "+json.dumps({
        "shaOriginal":EXPECTED["original"],
        "shaCorrected":EXPECTED["corrected"],
        "actualVertexOnlyPairs":actual["vertexOnlyPairsExamined"],
        "candidateExtraContactRays":
            actual["classification"]["potentialExtraContactAlongNonzeroCommonRay"],
        "replayedOriginalDerivativeReferenceAndChair":True,
        "newGpuInference":False,
        "printQualified":False}))

if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--job-id",required=True)
        verify(parser.parse_args().job_id)
    except (QAError,OSError,ValueError,KeyError) as e:
        print("G3_10_CPU_REPLAY_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
