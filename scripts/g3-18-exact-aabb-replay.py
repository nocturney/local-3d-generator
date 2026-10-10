"""G3.18 independent exact decoded-float AABB sweep: four prior SHA source replay.

Four previously licensed GLBs only; G3.15 verified historic genuine source
image/G2 source asset checks; G3.14/15/16/17 prior source proof ancestry.
Numerical G3.17 and exact G3.18 no-index pair MEMBERSHIP comparison,
not merely matching pair counts. Immutable private report per source.
Sanitized public proof has aggregate numbers and source SHA only, no face IDs,
private job UUID, source image binary or model GLB.
"""
from __future__ import annotations
import argparse
import importlib.util
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
from geometry_qa import QAError
from exact_aabb_sweep_audit import screen_glb,write_immutable

spec=importlib.util.spec_from_file_location(
    "g315_prior_source_provenance",ROOT/"scripts"/"g3-15-edge-replay.py")
if spec is None or spec.loader is None:
    raise QAError("Historic rights and SHA verifier unavailable")
old=importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)

PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PUBLIC=ROOT/"docs"/"evidence"/"g3"/"orb-01-g318-exact-axis-sweep-proof.json"
P317=ROOT/"docs"/"evidence"/"g3"/"orb-01-g317-exact-noindex-aabb-pairs.json"
P316=ROOT/"docs"/"evidence"/"g3"/"orb-01-g316-exact-indexed-vertex-only.json"
P315=ROOT/"docs"/"evidence"/"g3"/"orb-01-g315-exact-indexed-edge.json"
LANES={
    "original":("realTripoSR","realTripoSR","realTripoSR"),
    "derivative":("unchangedWindingOnlyCopy","windingOnlySameSurface",
                  "sameSurfaceWindingOnlyCopy"),
    "reference":("projectOriginalGT","originalProceduralGT",
                 "proceduralReferenceGT"),
    "chair":("historicalChair","historicLicensedChair","historicalLicensedChair"),
}


def aggregate(r):
    s=r["sweep"]
    c=r["comparison"]
    return {
        "faces":r["faceCount"],
        "xAxisConservativelyConsideredPairs":s["xOnlyConservativePairs"],
        "rationalExactToleranceAabbPairs":s["exactTolerancedBoxPairs"],
        "rationalExactStrictAabbPairs":s["exactStrictBoxPairs"],
        "exactToleranceSharedIndexedEdge":s["toleranceSharedEdge"],
        "exactToleranceOneIndexedVertex":s["toleranceOneVertex"],
        "exactToleranceNoSharedIndex":s["toleranceNoSharedIndex"],
        "exactStrictSharedIndexedEdge":s["strictSharedEdge"],
        "exactStrictOneIndexedVertex":s["strictOneVertex"],
        "exactStrictNoSharedIndex":s["strictNoSharedIndex"],
        "G317NumericAabbPairs":c["numericAabbPairs"],
        "G317NumericNoIndexPairs":c["numericNoindexPairs"],
        "exactToleranceNoIndexCandidatesMissingInG317":c[
            "numericMissingExactToleranceNoindex"],
        "exactStrictNoIndexCandidatesMissingInG317":c[
            "numericMissingStrictNoindex"],
        "numericalOnlyNoIndexAabbConservativeExtras":c[
            "numericExtraOnlyToleranceNoindex"],
        "exactNoIndexCandidateSetIdenticalToG317":c[
            "exactNoindexPairIdsEqualNumerical"],
        "completeAndNotAborted":r[
            "completeIndependentExactAabbAndNumericalCrosscheck"],
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
    }


def replay(job_id,*,prepare_private=False,write_public=False):
    sources,prior314=old.historical_models(job_id)
    p317=old.getjson(P317)
    p316=old.getjson(P316)
    p315=old.getjson(P315)
    if (p317.get("schema")!=
            "local3d.g3.17.exact-noindex-all-numerical-aabb-pairs-four-models.v1" or
            p317.get("realHistoricTripoSRModelSha256")!=old.SHA["original"] or
            p317.get("historicLicensedChairSha256")!=old.SHA["chair"] or
            p317.get("originalImageSha256")!=old.IMAGE_SHA or
            p317.get("exactNarrowphaseOnEveryNumericalNoIndexAabbCandidate") is not True or
            p317.get("globalSelfIntersectionFreeCertified") is not False or
            p315.get("originalRealModelSha256")!=old.SHA["original"] or
            p316.get("realPreviouslyGeneratedTripoSRModelSha256")!=old.SHA["original"] or
            p316.get("printQualified") is not False):
        raise QAError("Prior G3.15/16/17 exact model provenance drift")

    reports={}
    for kind,model in sources.items():
        result=screen_glb(model)
        k314,k317,k316=LANES[kind]
        prior=prior314[k314]
        old_exact=p317[k317]
        s=result["sweep"]
        c=result["comparison"]
        if (result["modelSha256"]!=old.SHA[kind] or
            result["completeIndependentExactAabbAndNumericalCrosscheck"] is not True or
            result["allStrictAabbOverlapPairsMathematicallyCoveredForDecodedFiniteXYZ"] is not True or
            result["allExactToleranceNoindexPairsAccountedForByG317NumericalStage"] is not True or
            s["exactTolerancedBoxPairs"]!=prior["aabbOverlappingFacePairs"] or
            s["toleranceSharedEdge"]!=prior["pairsSharingIndexedEdge"] or
            s["toleranceOneVertex"]!=prior["pairsSharingExactlyOneIndexedVertex"] or
            s["toleranceNoSharedIndex"]!=prior["pairsSharingNoIndexedVertex"] or
            c["numericAabbPairs"]!=old_exact["allAabbOverlapCandidates"] or
            c["numericNoindexPairs"]!=old_exact["nonindexedAabbExactCandidateCount"] or
            c["numericMissingExactToleranceNoindex"]!=0 or
            c["numericMissingStrictNoindex"]!=0 or
            c["numericExtraOnlyToleranceNoindex"]!=0 or
            c["exactNoindexPairIdsEqualNumerical"] is not True or
            old_exact["exactNoIndexPairsExamined"]!=
                old_exact["nonindexedAabbExactCandidateCount"] or
            old_exact["totalExactCandidateContacts"]!=0 or
            p316[k316]["allOriginalIndexSingleVertexFacePairs"]!=
                prior["pairsSharingExactlyOneIndexedVertex"] or
            result["globalSelfIntersectionFreeCertified"] is not False or
            result["printQualified"] is not False):
            raise QAError("G3.18 independent exact AABB vs prior proof failed: "+kind)
        location=PRIVATE/(kind+"-g318-exact-aabb-sweep.json")
        if prepare_private:
            write_immutable(location,result)
        if old.getjson(location)!=result:
            raise QAError("G3.18 private SHA-immutable exact sweep divergence: "+kind)
        reports[kind]=result

    exclude=("modelSha256","modelBytes")
    a={k:v for k,v in reports["original"].items() if k not in exclude}
    b={k:v for k,v in reports["derivative"].items() if k not in exclude}
    if a!=b:
        raise QAError("G3.7 unchanged-surface winding copy exact sweep results diverged")
    public={
        "schema":"local3d.g3.18.exact-aabb-axis-sweep-four-licensed-sources.v1",
        "scope":"FINITE_IEEE754_GLB_EXACT_AABB_CANDIDATE_SUPERSET_VERIFICATION",
        "fixtureId":"01-orb-alpha",
        "sourceRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "priorSourceImageSha256":old.IMAGE_SHA,
        "previousRealTripoSRModelSha256":old.SHA["original"],
        "previousWindingOnlyModelSha256":old.SHA["derivative"],
        "previousProceduralGTModelSha256":old.SHA["reference"],
        "previousLicensedChairModelSha256":old.SHA["chair"],
        "allFourHistoricalGLBShaAndOriginalCompletedJobAssetsVerified":True,
        "noNewModelInference":True,
        "method":"INDEPENDENT_SORTED_X_SWEEP_OUTWARD_FLOAT_PREFILTER_EXACT_BINARY_RATIONAL_AABB_FINAL",
        "noKDTreeUsedForIndependentExactSweep":True,
        "zeroIndexCandidatePairIdentityComparedNotOnlyCounts":True,
        "allStrictDecodedCoordinateAabbNoIndexPairsPresentInPriorExactG317":True,
        "allExactToleranceDecodedCoordinateAabbNoIndexPairsPresentInG317":True,
        "notOriginalCADQuantizationOrPhysicalGeometryProof":True,
        "realTripoSR":aggregate(reports["original"]),
        "sameSurfaceWindingOnlyDerivative":aggregate(reports["derivative"]),
        "originalProceduralGT":aggregate(reports["reference"]),
        "previousLicensedChair":aggregate(reports["chair"]),
        "originalAndDerivativeResultsIdentical":True,
        "globalSelfIntersectionFreeCertified":False,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "slicerPrinterMaterialValidation":"NOT_TESTED",
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "privateJobUUIDRawModelAndPerFacePairIdsNotPublished":True,
    }
    raw=json.dumps(public,sort_keys=True,indent=2)+"\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",raw,re.I):
        raise QAError("Private G3.18 job ID would leak to sanitized proof")
    if write_public:
        write_immutable(PUBLIC,public)
    if old.getjson(PUBLIC)!=public:
        raise QAError("G3.18 public sanitized immutable proof differs")
    print("G3_18_INDEPENDENT_EXACT_AABB_SWEEP_FOUR_SOURCE_PASS "+json.dumps({
        "realOrbAabbCandidatePairs":reports["original"]["sweep"][
            "exactTolerancedBoxPairs"],
        "realOrbStrictAabbPairs":reports["original"]["sweep"][
            "exactStrictBoxPairs"],
        "realOrbNoIndexExactAabbPairMembershipMatched":True,
        "realOrbNoIndexPairs":reports["original"]["sweep"][
            "toleranceNoSharedIndex"],
        "allFourPriorLicensedShaAssetsChecked":True,
        "newInference":False,
        "printQualified":False,
    }))


if __name__=="__main__":
    try:
        p=argparse.ArgumentParser()
        p.add_argument("--job-id",required=True)
        p.add_argument("--prepare-private",action="store_true")
        p.add_argument("--write-public",action="store_true")
        a=p.parse_args()
        replay(a.job_id,prepare_private=a.prepare_private,
               write_public=a.write_public)
    except (QAError,OSError,ValueError,TypeError,KeyError,MemoryError) as exc:
        print("G3_18_CPU_REPLAY_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
