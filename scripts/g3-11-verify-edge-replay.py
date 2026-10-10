"""G3.11 read-only CPU replay of indexed shared-edge coplanar folding diagnostic.

Verifies 4 already present SHA-pinned GLBs and their deterministic private
JSON evidence. No new model inference, GPU, printer or file write.
"""
from __future__ import annotations
import argparse,json,os,re,sys
from pathlib import Path

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["PYTHONNOUSERSITE"]="1"
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))
from geometry_qa import QAError,digest
from edge_backfold_screen import screen_glb

SHAS={
"original":"f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
"corrected":"ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
"reference":"c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
"chair":"48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec"}
P=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
MODELS={
"corrected":P/"orb-positive-winding.glb",
"reference":ROOT/"benchmarks"/"g3"/"fixtures"/"01-orb-alpha"/"ground-truth.glb",
"chair":ROOT/"docs"/"evidence"/"g3"/"chair-positive-winding.glb"}
REPORTS={
"original":P/"original-edge-backfold.json",
"corrected":P/"corrected-edge-backfold.json",
"reference":P/"reference-edge-backfold.json",
"chair":P/"chair-edge-backfold.json"}

def verify(id):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",id,re.I):
        raise QAError("Exact previously completed job UUID required")
    root=ROOT/"runtime"/"data-g2-manual"/"jobs"/id
    if root.is_symlink() or root.resolve(strict=True)!=root.absolute():
        raise QAError("Noncanonical local job root")
    job=json.loads((root/"job.json").read_text(encoding="utf-8"))
    if job.get("id")!=id or job.get("status")!="completed" or \
        job.get("simulation") is not False or job.get("providerId")!="triposr-local":
        raise QAError("Previous authentic completed TripoSR job required")
    MODELS["original"]=root/"output.glb"
    reports={}
    for name,file in MODELS.items():
        if file.is_symlink() or not file.is_file() or digest(file)!=SHAS[name]:
            raise QAError("Pinned original GT/AI/derivative GLB SHA modified")
        evidence=REPORTS[name]
        if evidence.is_symlink() or not evidence.is_file():
            raise QAError("Private CPU backfold evidence missing")
        old=json.loads(evidence.read_text(encoding="utf-8"))
        new=screen_glb(file)
        if old!=new:
            raise QAError("G3.11 private CPU replay divergence: "+name)
        if new["completeMeshSelfIntersectionFreeCertified"] is not False or \
           new["printQualified"] is not False or new["newAiInference"] is not False:
            raise QAError("Misleading print or inference status")
        reports[name]=new
    orig=reports["original"];copy=reports["corrected"]
    ignore={"modelSha256","modelBytes","signedVolumeArbitraryUnitsCubed"}
    for k in orig:
        if k not in ignore and orig[k]!=copy[k]:
            raise QAError("Winding-only derivative changed shared-edge geometry result")
    print("G3_11_FOUR_MODEL_EDGE_CPU_REPLAY_PASS "+json.dumps({
        "realOrbSharedEdges":orig["indexedSharedEdgeFacePairs"],
        "realOrbPotentialCoplanarBackfolds":orig["possibleCoplanarSameSideAreaOverlapPairs"],
        "realOrbNearAnti175":orig["nearAntiparallelNormalsAtOrAbove175Degrees"],
        "allFourSourceModelsVerified":True,
        "noModelInference":True,"printQualified":False
    }))

if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--job-id",required=True)
        verify(parser.parse_args().job_id)
    except (QAError,OSError,ValueError,KeyError) as e:
        print("G3_11_EDGE_CPU_REPLAY_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
