"""G3.17: four existing SHA-verified GLBs, CPU exact NO-INDEX AABB pair proof.

Uses the G3.15 trusted source-rights and completed G2 asset-verifier. Zero
new inference, no new model, no GPU, no printer. Every private face pair
index and job UUID remains in gitignored local runtime only.
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
from exact_nonindexed_contact import screen_glb,write_immutable

spec=importlib.util.spec_from_file_location(
    "g315_private_validated_sources",
    ROOT/"scripts"/"g3-15-edge-replay.py")
if spec is None or spec.loader is None:
    raise QAError("Previous G3.15 rights/asset manifest verifier missing")
prior_validator=importlib.util.module_from_spec(spec)
spec.loader.exec_module(prior_validator)

PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PUBLIC=ROOT/"docs"/"evidence"/"g3"/"orb-01-g317-exact-noindex-aabb-pairs.json"
OLD_314=ROOT/"docs"/"evidence"/"g3"/"orb-01-g314-full-aabb-census.json"
OLD_315=ROOT/"docs"/"evidence"/"g3"/"orb-01-g315-exact-indexed-edge.json"
OLD_316=ROOT/"docs"/"evidence"/"g3"/"orb-01-g316-exact-indexed-vertex-only.json"

LANES={
    "original":("realTripoSR","realTripoSR","realTripoSR"),
    "derivative":("unchangedWindingOnlyCopy","sameSurfaceWindingOnlyCopy",
                  "sameSurfaceWindingOnlyCopy"),
    "reference":("projectOriginalGT","originalProceduralGT","proceduralReferenceGT"),
    "chair":("historicalChair","historicalChair","historicalLicensedChair"),
}


def summarized(r):
    c=r["exactClassificationCounts"]
    return {
        "faces":r["triangleCount"],
        "sphereBroadphasePairs":r["independentlyEnumeratedSphereCandidates"],
        "allAabbOverlapCandidates":r["independentlyEnumeratedAllAabbOverlapPairs"],
        "indexedFullEdgeAabbPairCount":r["indexedSharedEdgeAabbPairsNotRetestedHere"],
        "indexedVertexOnlyAabbPairCount":r["indexedSingleVertexAabbPairsNotRetestedHere"],
        "nonindexedAabbExactCandidateCount":r["zeroSharedIndexAabbCandidatePairs"],
        "exactNoIndexPairsExamined":r["exactZeroIndexCandidatesExamined"],
        "exactDisjointPairs":c.get("EXACT_DISJOINT",0),
        "exactPointBoundaryContactPairs":c.get("EXACT_SINGLE_POINT_BOUNDARY_CONTACT",0),
        "exactNoncoplanarPositiveLengthPairContacts":c.get(
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION",0),
        "exactCoplanarPositiveLengthBoundaryPairs":c.get(
            "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT",0),
        "exactCoplanarPositiveAreaPairs":c.get(
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP",0),
        "totalExactCandidateContacts":r["exactAllTypesOfContactAmongCandidates"],
        "completeForNumericallySelectedAabbCandidates":r[
            "completeNumericalCandidateEnumerationAndExactNarrowphase"],
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
    }


def replay(private_id,*,prepare_private=False,write_public=False):
    source,old314=prior_validator.historical_models(private_id)
    old315=prior_validator.getjson(OLD_315)
    old316=prior_validator.getjson(OLD_316)
    for key,expected in (
        ("originalRealModelSha256",prior_validator.SHA["original"]),
        ("sameGeometryWindingDerivativeSha256",prior_validator.SHA["derivative"]),
        ("proceduralGroundTruthSha256",prior_validator.SHA["reference"]),
        ("historicalChairDerivativeSha256",prior_validator.SHA["chair"]),
    ):
        if old315.get(key)!=expected:
            raise QAError("G3.15 source SHA provenance diverged")
    if (old316.get("realPreviouslyGeneratedTripoSRModelSha256")!=
            prior_validator.SHA["original"] or
            old316.get("proceduralReferenceGTGLBSha256")!=
            prior_validator.SHA["reference"] or
            old316.get("fullyExactCensusOfEveryOneIndexedVertexOnlyFacePair") is not True or
            old316.get("printQualified") is not False):
        raise QAError("G3.16 exact-vertex prior evidence not trustworthy")

    all_results={}
    for kind,filename in source.items():
        r=screen_glb(filename)
        g314,g315,g316=LANES[kind]
        old=old314[g314]
        if (r["modelSha256"]!=prior_validator.SHA[kind] or
                r["independentlyEnumeratedAllAabbOverlapPairs"]!=
                  old["aabbOverlappingFacePairs"] or
                r["indexedSharedEdgeAabbPairsNotRetestedHere"]!=
                  old["pairsSharingIndexedEdge"] or
                r["indexedSingleVertexAabbPairsNotRetestedHere"]!=
                  old["pairsSharingExactlyOneIndexedVertex"] or
                r["zeroSharedIndexAabbCandidatePairs"]!=
                  old["pairsSharingNoIndexedVertex"] or
                r["exactZeroIndexCandidatesExamined"]!=
                  old["pairsSharingNoIndexedVertex"] or
                sum(r["exactClassificationCounts"].values())!=
                  old["pairsSharingNoIndexedVertex"] or
                r["completeNumericalCandidateEnumerationAndExactNarrowphase"] is not True or
                old315[g315]["allIndexedSharedEdgePairs"]!=
                  old["pairsSharingIndexedEdge"] or
                old316[g316]["allOriginalIndexSingleVertexFacePairs"]!=
                  old["pairsSharingExactlyOneIndexedVertex"] or
                r["globalSelfIntersectionFreeCertified"] is not False or
                r["printQualified"] is not False):
            raise QAError("G3.17 exact no-index census incomplete/changed: "+kind)
        private=PRIVATE/(kind+"-g317-exact-noindex.json")
        if prepare_private:
            write_immutable(private,r)
        if prior_validator.getjson(private)!=r:
            raise QAError("G3.17 private immutable SHA replay differed: "+kind)
        all_results[kind]=r

    excluded=("modelSha256","modelBytes")
    original={k:v for k,v in all_results["original"].items()
              if k not in excluded}
    derivative={k:v for k,v in all_results["derivative"].items()
                if k not in excluded}
    if original!=derivative:
        raise QAError("G3.7 winding-only copy changed exact contact results")

    public={
        "schema":"local3d.g3.17.exact-noindex-all-numerical-aabb-pairs-four-models.v1",
        "sourceFixtureId":"01-orb-alpha",
        "sourceImageRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "originalImageSha256":prior_validator.IMAGE_SHA,
        "realHistoricTripoSRModelSha256":prior_validator.SHA["original"],
        "sameGeometryWindingDerivativeSha256":prior_validator.SHA["derivative"],
        "proceduralGroundTruthSha256":prior_validator.SHA["reference"],
        "historicLicensedChairSha256":prior_validator.SHA["chair"],
        "sameHistoricallyLicensedInputAssetsNoNewAI":True,
        "exactNarrowphaseOnEveryNumericalNoIndexAabbCandidate":True,
        "numericalBroadphaseConservativeBBoxEnclosingSphere":True,
        "reproducedPriorG314IndependentIndexPairPartitions":True,
        "g315FullEdgeIndexedPairsExactSeparate":True,
        "g316OneVertexIndexedPairsExactSeparate":True,
        "notFormalArbitraryPrecisionGlobalMeshContactProof":True,
        "decodedIEEE754CoordinatesNotOriginalCADPhysicalMillimeters":True,
        "realTripoSR":summarized(all_results["original"]),
        "windingOnlySameSurface":summarized(all_results["derivative"]),
        "originalProceduralGT":summarized(all_results["reference"]),
        "historicLicensedChair":summarized(all_results["chair"]),
        "originalAndWindingDerivativeCountsIdentical":True,
        "printerDimensionalCalibration":"NOT_PERFORMED",
        "wallThickness":"NOT_TESTED",
        "physicalPrintPartIntegrity":"NOT_TESTED",
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "privateJobIdImageBinaryAndFacePairExamplesExcluded":True,
    }
    raw=json.dumps(public,sort_keys=True,indent=2)+"\n"
    if private_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",raw,re.I):
        raise QAError("Private G2 job UUID in sanitized public G3.17 report")
    if write_public:
        write_immutable(PUBLIC,public)
    if prior_validator.getjson(PUBLIC)!=public:
        raise QAError("G3.17 public sanitized evidence SHA replay mismatch")
    print("G3_17_FOUR_PRIOR_GLB_EXACT_NOINDEX_CPU_PASS "+json.dumps({
        "realOrbAabbPairs":all_results["original"][
            "independentlyEnumeratedAllAabbOverlapPairs"],
        "realOrbNoIndexedVertexExactPairs":all_results["original"][
            "exactZeroIndexCandidatesExamined"],
        "realOrbExactCandidateContacts":all_results["original"][
            "exactAllTypesOfContactAmongCandidates"],
        "validatedAllFourSourceAndPriorEvidenceHashes":True,
        "noGpuInference":True,
        "printQualified":False,
    }))


if __name__=="__main__":
    try:
        ap=argparse.ArgumentParser()
        ap.add_argument("--job-id",required=True)
        ap.add_argument("--prepare-private",action="store_true")
        ap.add_argument("--write-public",action="store_true")
        args=ap.parse_args()
        replay(args.job_id,prepare_private=args.prepare_private,
               write_public=args.write_public)
    except (QAError,OSError,ValueError,KeyError,TypeError,MemoryError) as e:
        print("G3_17_PROOF_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
