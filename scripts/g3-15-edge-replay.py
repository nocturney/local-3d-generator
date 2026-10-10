"""G3.15 four licensed GLB exact indexed-edge CPU replay + sanitized proof.

Previous real model UUID is an operator-only local CLI input. Never copied
to docs/Git. No source/model modifications, GPU, cloud or printer calls.
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
from exact_indexed_edge_contact import screen_glb,immutable

SHA={
    "original":"f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
    "derivative":"ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
    "reference":"c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
    "chair":"48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec",
}
IMAGE_SHA="9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a"
P=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PUB=ROOT/"docs"/"evidence"/"g3"/"orb-01-g315-exact-indexed-edge.json"


def regular(path,budget=64*1024*1024):
    p=Path(path)
    if p.is_symlink() or not p.is_file() or not (0<p.stat().st_size<=budget):
        raise QAError("Private or evidence source missing/linked/oversized")
    return p


def getjson(path):
    return json.loads(regular(path,1024*1024).read_text(encoding="utf-8"))


def historical_models(job_id):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",job_id,re.I):
        raise QAError("Only private UUID of previously completed model permitted")
    jobdir=ROOT/"runtime"/"data-g2-manual"/"jobs"/job_id
    if jobdir.is_symlink() or jobdir.resolve(strict=True)!=jobdir.absolute():
        raise QAError("Noncanonical private job")
    job=getjson(jobdir/"job.json")
    if (job.get("id")!=job_id or job.get("status")!="completed" or
            job.get("simulation") is not False or
            job.get("providerId")!="triposr-local" or
            not isinstance(job.get("assets"),list)):
        raise QAError("Previous genuinely completed TripoSR job required")
    catalog=getjson(ROOT/"benchmarks"/"g3"/"fixtures"/"manifest.json")
    source=next((x for x in catalog["fixtures"] if x.get("id")=="01-orb-alpha"),None)
    if (source is None or source.get("sourceRights")!="PROJECT_ORIGINAL_PROCEDURAL" or
            source.get("imageSha256")!=IMAGE_SHA or
            source.get("groundTruthSha256")!=SHA["reference"]):
        raise QAError("Original licensed source fixture changed")
    for asset_id,name,pinned in (
        ("source-image","input.png",IMAGE_SHA),
        ("preview-glb","output.glb",SHA["original"]),
        ("qa-report","qa-report.json",None),
        ("geometry-qa","geometry-qa.json",None),
        ("benchmark-shape","benchmark-shape.json",None),
    ):
        asset=next((x for x in job["assets"] if x.get("id")==asset_id),None)
        path=regular(jobdir/name)
        if (asset is None or asset.get("sha256")!=digest(path) or
                asset.get("bytes")!=path.stat().st_size or
                (pinned is not None and digest(path)!=pinned)):
            raise QAError("Historical private job asset hash changed: "+asset_id)
    models={
        "original":jobdir/"output.glb",
        "derivative":P/"orb-positive-winding.glb",
        "reference":ROOT/"benchmarks"/"g3"/"fixtures"/"01-orb-alpha"/"ground-truth.glb",
        "chair":ROOT/"docs"/"evidence"/"g3"/"chair-positive-winding.glb",
    }
    for key,file in models.items():
        if digest(regular(file))!=SHA[key]:
            raise QAError("Pinned historical model SHA mismatch "+key)
    prior=getjson(ROOT/"docs"/"evidence"/"g3"/"orb-01-g314-full-aabb-census.json")
    if (prior.get("priorRealTripoSRModelSha256")!=SHA["original"] or
            prior.get("sameGeometryWindingDerivativeSha256")!=SHA["derivative"] or
            prior.get("originalProceduralGroundTruthSha256")!=SHA["reference"] or
            prior.get("historicalChairDerivativeSha256")!=SHA["chair"] or
            prior.get("printQualified") is not False):
        raise QAError("Previous G3.14 real model provenance changed")
    return models,prior


def safe(r):
    return {
        "triangleCount":r["triangleCount"],
        "vertexCount":r["vertexCount"],
        "allIndexedSharedEdgePairs":r["allProvidedIndexedSharedEdgePairs"],
        "exactPairsExamined":r["pairsExaminedByExactBinaryFloatArithmetic"],
        "everyIndexedEdgeClassified":r["completeIndexedSharedEdgePairClassification"],
        "noncoplanarExpectedEdgeOnlyPairs":r["exactNoncoplanarOnlySharedEdgePairs"],
        "coplanarOppositeSideExpectedEdgeOnlyPairs":r["exactCoplanarOppositeSideOnlySharedEdgePairs"],
        "coplanarSameSidePositiveAreaOverlapPairs":r["exactCoplanarSameSidePositiveAreaOverlapPairs"],
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
    }


def replay(job_id,*,prepare_private=False,write_public=False):
    models,prior=historical_models(job_id)
    reports={}
    for kind,model in models.items():
        current=screen_glb(model)
        if (current["modelSha256"]!=SHA[kind] or
                not current["completeIndexedSharedEdgePairClassification"] or
                current["allProvidedIndexedSharedEdgePairs"]!=
                    current["pairsExaminedByExactBinaryFloatArithmetic"] or
                current["pairsExaminedByExactBinaryFloatArithmetic"]!=
                    current["exactNoncoplanarOnlySharedEdgePairs"]+
                    current["exactCoplanarOppositeSideOnlySharedEdgePairs"]+
                    current["exactCoplanarSameSidePositiveAreaOverlapPairs"] or
                current["globalSelfIntersectionFreeCertified"] is not False or
                current["printQualified"] is not False):
            raise QAError("Incomplete/unsafe G3.15 exact source classification: "+kind)
        private=P/(kind+"-g315-exact-edge.json")
        if prepare_private:
            immutable(private,current)
        if getjson(private)!=current:
            raise QAError("Private immutable exact-edge replay divergence: "+kind)
        reports[kind]=current
    baseline={k:v for k,v in reports["original"].items()
              if k not in ("modelSha256","modelBytes")}
    derivative={k:v for k,v in reports["derivative"].items()
                if k not in ("modelSha256","modelBytes")}
    if baseline!=derivative:
        raise QAError("Unchanged-surface winding reversed exact-edge conclusions")
    paired={
        "original":"realTripoSR",
        "derivative":"sameSurfaceWindingOnlyCopy",
        "reference":"originalProceduralGT",
        "chair":"historicalChair",
    }
    for kind,public_key in paired.items():
        prior_key={
            "original":"realTripoSR",
            "derivative":"unchangedWindingOnlyCopy",
            "reference":"projectOriginalGT",
            "chair":"historicalChair",
        }[kind]
        if (reports[kind]["allProvidedIndexedSharedEdgePairs"]!=
                prior[prior_key]["pairsSharingIndexedEdge"]):
            raise QAError("G3.14 prior adjacency source census differs: "+kind)
    result={
        "schema":"local3d.g3.15.exact-real-indexed-edge-geometry.v1",
        "fixtureId":"01-orb-alpha",
        "sourceRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "originalImageSha256":IMAGE_SHA,
        "originalRealModelSha256":SHA["original"],
        "sameGeometryWindingDerivativeSha256":SHA["derivative"],
        "proceduralGroundTruthSha256":SHA["reference"],
        "historicalChairDerivativeSha256":SHA["chair"],
        "sourceDataFromPreviouslyCompletedRealModelOnly":True,
        "newAiInference":False,
        "exactnessScope":"ONLY_DECODED_IEEE754_INDEXED_FULL_EDGE_ADJACENT_FACE_PAIRS",
        "allIndexedSharedEdgePairsAcrossEachModelClassified":True,
        "edgeAdjacentExtraAreaOverlapCheckIsNotGlobalMeshCollisionClearance":True,
        "indexedVertexOnlyPairsRemainUnresolvedByThisExactTest":True,
        "noSharedIndexPairsNotReclassifiedHere":True,
        "realTripoSR":safe(reports["original"]),
        "sameSurfaceWindingOnlyCopy":safe(reports["derivative"]),
        "originalProceduralGT":safe(reports["reference"]),
        "historicalChair":safe(reports["chair"]),
        "originalCopyExactEdgeStatisticsIdentical":True,
        "metricIsNotMillimeterCalibrated":True,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,"approvedForPrinter":False,
        "fabricationAction":"NONE",
        "privateUUIDAndRawIndexedFacePairExamplesNotPublished":True,
    }
    raw=json.dumps(result,sort_keys=True,indent=2)+"\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",raw,re.I):
        raise QAError("G3.15 private job UUID leaked")
    if write_public:
        immutable(PUB,result)
    if getjson(PUB)!=result:
        raise QAError("G3.15 sanitized public proof differs")
    print("G3_15_FOUR_MODEL_EXACT_EDGE_REPLAY_PASS "+json.dumps({
        "realOrbSharedEdgePairs":reports["original"]["allProvidedIndexedSharedEdgePairs"],
        "realOrbExactCoplanarAreaOverlapPairs":reports["original"][
            "exactCoplanarSameSidePositiveAreaOverlapPairs"],
        "originalAndWindingCopyEqual":True,
        "allFourSHAProvenanceValidated":True,
        "noNewGpuInference":True,
        "printQualified":False,
    }))


if __name__=="__main__":
    try:
        p=argparse.ArgumentParser()
        p.add_argument("--job-id",required=True)
        p.add_argument("--prepare-private",action="store_true")
        p.add_argument("--write-public",action="store_true")
        a=p.parse_args()
        replay(a.job_id,prepare_private=a.prepare_private,write_public=a.write_public)
    except (QAError,OSError,ValueError,KeyError,TypeError,MemoryError) as e:
        print("G3_15_CPU_REPLAY_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
