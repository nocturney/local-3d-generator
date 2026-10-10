"""Read-only G3.9 CPU replay of previously generated genuine orb and GT.

No CUDA, model loading, model execution, network calls or files written.
The local completed job ID is required only to fetch existing private model.
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
from adjacent_face_angles import audit_glb

sha={
"original":"f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
"corrected":"ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
"reference":"c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749"}
PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PATHS={
"corrected":PRIVATE/"orb-positive-winding.glb",
"reference":ROOT/"benchmarks"/"g3"/"fixtures"/"01-orb-alpha"/"ground-truth.glb"}
REPORTS={
"original":PRIVATE/"original-edge-angle.json",
"corrected":PRIVATE/"corrected-edge-angle.json",
"reference":PRIVATE/"reference-edge-angle.json"}


def verify(job_uuid:str):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",
                        job_uuid,re.I):
        raise QAError("Completed job identifier must be UUID")
    folder=ROOT/"runtime"/"data-g2-manual"/"jobs"/job_uuid
    if folder.is_symlink() or folder.resolve(strict=True)!=folder.absolute():
        raise QAError("Job folder must be the expected local directory")
    manifest=json.loads((folder/"job.json").read_text(encoding="utf-8"))
    if manifest.get("id")!=job_uuid or manifest.get("providerId")!="triposr-local" or \
       manifest.get("status")!="completed" or manifest.get("simulation") is not False:
        raise QAError("Only completed real local TripoSR job is accepted")
    PATHS["original"]=folder/"output.glb"
    for case,file in PATHS.items():
        if file.is_symlink() or not file.is_file() or digest(file)!=sha[case]:
            raise QAError("Pinned model/reference file is missing or modified")
        stored=json.loads(REPORTS[case].read_text(encoding="utf-8"))
        recalculated=audit_glb(file)
        if stored!=recalculated:
            raise QAError("G3.9 face-angle CPU reproduction mismatch: "+case)
        if recalculated["printQualified"] is not False or \
           recalculated["doesNotProveNoFaceFoldover"] is not True:
            raise QAError("Misrepresented CPU foldover safety")
    original=json.loads(REPORTS["original"].read_text(encoding="utf-8"))
    corrected=json.loads(REPORTS["corrected"].read_text(encoding="utf-8"))
    if original["angleDegrees"]!=corrected["angleDegrees"] or \
       original["edgeCountsOverAngleThreshold"]!=corrected["edgeCountsOverAngleThreshold"]:
        raise QAError("Winding-only derivative changed adjacent normal differences")
    print("G3_9_PRIVATE_READONLY_CPU_REPLAY_PASS "+json.dumps({
        "originalModelSha256":sha["original"],
        "threeRealAndReferenceReportsRecomputed":True,
        "edgeAdjacentPairCount":original["edgeAdjacentFacePairs"],
        "actualP95Degrees":original["angleDegrees"]["p95"],
        "zeroGpuRuns":True,
        "printQualified":False
    }))


if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--job-id",required=True)
        verify(parser.parse_args().job_id)
    except (QAError,OSError,ValueError,KeyError) as error:
        print("G3_9_CPU_REPLAY_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
