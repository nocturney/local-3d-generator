"""LOCAL3D G3.16 four prior SHA-verified GLB exact vertex-only CPU replay.

Uses the G3.15 already audited historic source provenance reader; it checks
existing private successful G2 job and every preexisting image/model asset
SHA. This script creates no neural model, cannot print, has no GPU ops.
Private UUID and exact indexed face pair examples NEVER enter Git evidence.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import sys

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["PYTHONNOUSERSITE"] = "1"

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "engines" / "quality"))
from geometry_qa import QAError
from exact_indexed_vertex_contact import screen_glb, immutable_write

# Reuse the complete earlier source-rights and prior verified real G2 job
# manifest validation, instead of silently weakening the ownership gate.
spec = importlib.util.spec_from_file_location(
    "local3d_g315_historic_source_verifier",
    ROOT / "scripts" / "g3-15-edge-replay.py")
if spec is None or spec.loader is None:
    raise QAError("G3.15 provenance verifier missing")
g315 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g315)

PRIVATE_DIR = ROOT / "runtime" / "qa" / "g3" / "orb-01-positive-winding"
PUBLIC_PROOF = (ROOT / "docs" / "evidence" / "g3" /
                "orb-01-g316-exact-indexed-vertex-only.json")
PRIOR_315 = (ROOT / "docs" / "evidence" / "g3" /
             "orb-01-g315-exact-indexed-edge.json")
PRIOR_314 = (ROOT / "docs" / "evidence" / "g3" /
             "orb-01-g314-full-aabb-census.json")
LANES = {
    "original": ("realTripoSR", "realTripoSR"),
    "derivative": ("unchangedWindingOnlyCopy", "sameSurfaceWindingOnlyCopy"),
    "reference": ("projectOriginalGT", "originalProceduralGT"),
    "chair": ("historicalChair", "historicalChair"),
}


def summarized(r):
    return {
        "triangleCount": r["triangleCount"],
        "vertexCount": r["vertexCount"],
        "sharedOriginalIndexIncidencePairVisits": r[
            "totalPerVertexIncidentFacePairVisitsUpperBound"],
        "allOriginalIndexSingleVertexFacePairs": r[
            "totalUniqueIndexedVertexOnlyFacePairs"],
        "exactRationalPairsClassified": r["pairsExaminedByExactRationalGeometry"],
        "completeExactIndexedSingleVertexCensus": r[
            "completeVertexOnlyExactContactCensus"],
        "exactOnlySharedVertexContactPairs": r[
            "classificationCounts"].get("EXACT_VERTEX_ONLY_CONTACT", 0),
        "exactNoncoplanarExtraLineContactPairs": r[
            "classificationCounts"].get(
                "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION", 0),
        "exactCoplanarExtraLineContactPairs": r[
            "classificationCounts"].get(
                "EXACT_COPLANAR_POSITIVE_LENGTH_EDGE_CONTACT", 0),
        "exactCoplanarPositiveAreaOverlapPairs": r[
            "classificationCounts"].get(
                "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP", 0),
        "anyExactExtraBeyondVertexContactPairs": r[
            "exactExtraContactBeyondSharedVertexPairCount"],
        "printQualified": False,
    }


def replay(private_job_id, *, prepare_private=False, write_public=False):
    sources, g314 = g315.historical_models(private_job_id)
    g315_public = g315.getjson(PRIOR_315)
    for required, expected in (
        ("originalImageSha256", g315.IMAGE_SHA),
        ("originalRealModelSha256", g315.SHA["original"]),
        ("sameGeometryWindingDerivativeSha256", g315.SHA["derivative"]),
        ("proceduralGroundTruthSha256", g315.SHA["reference"]),
        ("historicalChairDerivativeSha256", g315.SHA["chair"]),
    ):
        if g315_public.get(required) != expected:
            raise QAError("Previous G3.15 SHA provenance changed: " + required)
    if (g315_public.get("allIndexedSharedEdgePairsAcrossEachModelClassified")
            is not True or
            g315_public.get("globalSelfIntersectionFreeCertified") is not False or
            g315_public.get("printQualified") is not False):
        raise QAError("G3.15 cannot be trusted as preexisting model evidence")

    reports = {}
    for kind, model in sources.items():
        current = screen_glb(model)
        g314_key, g315_key = LANES[kind]
        expected_count = g314[g314_key]["pairsSharingExactlyOneIndexedVertex"]
        if (current["modelSha256"] != g315.SHA[kind] or
                current["totalUniqueIndexedVertexOnlyFacePairs"] != expected_count or
                not current["completeVertexOnlyExactContactCensus"] or
                current["pairsExaminedByExactRationalGeometry"] != expected_count or
                sum(current["classificationCounts"].values()) != expected_count or
                current["exactExtraContactBeyondSharedVertexPairCount"] > expected_count or
                g315_public[g315_key]["allIndexedSharedEdgePairs"] !=
                  g314[g314_key]["pairsSharingIndexedEdge"] or
                current["globalSelfIntersectionFreeCertified"] is not False or
                current["printQualified"] is not False):
            raise QAError("G3.16 per-model exact source evidence incomplete: " + kind)
        private_report = PRIVATE_DIR / (kind+"-g316-exact-vertex-only.json")
        if prepare_private:
            immutable_write(private_report, current)
        if g315.getjson(private_report) != current:
            raise QAError("Private G3.16 immutable replay mismatch: " + kind)
        reports[kind] = current

    no_ids = ("modelSha256", "modelBytes")
    first = {k: v for k, v in reports["original"].items() if k not in no_ids}
    derivative = {k: v for k, v in reports["derivative"].items()
                  if k not in no_ids}
    if first != derivative:
        raise QAError("G3.7 winding-only exact-vertex stats changed unexpectedly")

    result = {
        "schema": "local3d.g3.16.four-model-exact-indexed-single-vertex-proof.v1",
        "fixtureId": "01-orb-alpha",
        "sourceRights": "PROJECT_ORIGINAL_PROCEDURAL",
        "sourceImageSha256": g315.IMAGE_SHA,
        "realPreviouslyGeneratedTripoSRModelSha256": g315.SHA["original"],
        "sameSurfaceWindingOnlyGLBSha256": g315.SHA["derivative"],
        "proceduralReferenceGTGLBSha256": g315.SHA["reference"],
        "historicalLicensedChairGLBSha256": g315.SHA["chair"],
        "allModelsPreviousSourcesOnly": True,
        "newAiInference": False,
        "independentIndexTopologyEnumeration": True,
        "exactnessScope": "DECODED_IEEE754_GLTF_FACE_PAIRS_SHARING_EXACTLY_ONE_VERTEX_INDEX",
        "fullyExactCensusOfEveryOneIndexedVertexOnlyFacePair": True,
        "notAnExactAllFacePairsGlobalIntersectionCertificate": True,
        "G315FullSharedEdgeExactClassificationSeparate": True,
        "G314NoIndexNumericalSatNotGlobalExactProof": True,
        "realTripoSR": summarized(reports["original"]),
        "sameSurfaceWindingOnlyCopy": summarized(reports["derivative"]),
        "proceduralReferenceGT": summarized(reports["reference"]),
        "historicalLicensedChair": summarized(reports["chair"]),
        "realAndWindingDerivativeExactContactCountsIdentical": True,
        "mmPhysicalScale": "UNKNOWN_UNCALIBRATED",
        "wallThickness": "NOT_TESTED",
        "partIntegrity": "NOT_TESTED",
        "printerValidation": "NOT_PERFORMED",
        "globalSelfIntersectionFreeCertified": False,
        "printQualified": False,
        "approvedForPrinter": False,
        "fabricationAction": "NONE",
        "privateJobUUIDAndExactFacePairIndicesNotPublished": True,
    }
    raw = json.dumps(result, sort_keys=True, indent=2) + "\n"
    if private_job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", raw, re.I):
        raise QAError("G3.16 public evidence accidentally contains private UUID")
    if write_public:
        immutable_write(PUBLIC_PROOF, result)
    if g315.getjson(PUBLIC_PROOF) != result:
        raise QAError("G3.16 sanitized public evidence replay divergence")
    print("G3_16_FOUR_PRIOR_SHA_GLB_EXACT_VERTEX_CPU_PASS " + json.dumps({
        "realOrbFaceCount": reports["original"]["triangleCount"],
        "realOrbIndexedVertexOnlyFacePairs": reports["original"][
            "totalUniqueIndexedVertexOnlyFacePairs"],
        "realOrbExactExtraContacts": reports["original"][
            "exactExtraContactBeyondSharedVertexPairCount"],
        "allFourHistoricSourcesSHAAndExactlyClassified": True,
        "newGpuInference": False,
        "printQualified": False,
    }))


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--job-id", required=True)
        parser.add_argument("--prepare-private", action="store_true")
        parser.add_argument("--write-public", action="store_true")
        args = parser.parse_args()
        replay(args.job_id, prepare_private=args.prepare_private,
               write_public=args.write_public)
    except (QAError, OSError, ValueError, KeyError, TypeError, MemoryError) as exc:
        print("G3_16_EXACT_VERTEX_REPLAY_FAILED " +
              type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
