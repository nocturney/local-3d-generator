"""LOCAL3D G3.14 existing GLB four-source CPU replay and sanitized proof.

--prepare-private writes only immutable ignored per-model reports.
--write-public creates/verifies only a fixed sanitized counts-and-SHA JSON.
No model inference, GPU, printer, cloud, source image regeneration or upload.
"""
from __future__ import annotations

import argparse
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
from geometry_qa import QAError, digest
from aabb_pair_census import screen_glb, write_immutable

MODEL_SHA = {
    "original": "f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
    "derivative": "ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
    "reference": "c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
    "chair": "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec",
}
IMAGE_SHA = "9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a"
PRIVATE = ROOT / "runtime" / "qa" / "g3" / "orb-01-positive-winding"
PUBLIC = ROOT / "docs" / "evidence" / "g3" / "orb-01-g314-full-aabb-census.json"


def _regular(path, budget=64 * 1024 * 1024):
    path = Path(path)
    if path.is_symlink() or not path.is_file() or not (0 < path.stat().st_size <= budget):
        raise QAError("Invalid, linked or oversized local source")
    return path


def _json(path):
    return json.loads(_regular(path, 1024 * 1024).read_text(encoding="utf-8"))


def _model_list(job_id):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", job_id, re.I):
        raise QAError("Genuine completed prior private job UUID required")
    jobdir = ROOT / "runtime" / "data-g2-manual" / "jobs" / job_id
    if jobdir.is_symlink() or jobdir.resolve(strict=True) != jobdir.absolute():
        raise QAError("Noncanonical private job folder")
    job = _json(jobdir / "job.json")
    if (job.get("id") != job_id or job.get("status") != "completed" or
            job.get("simulation") is not False or
            job.get("providerId") != "triposr-local" or
            not isinstance(job.get("assets"), list)):
        raise QAError("Not previously genuinely completed local model job")
    catalog = _json(ROOT / "benchmarks" / "g3" / "fixtures" / "manifest.json")
    source = next((x for x in catalog["fixtures"] if x.get("id") == "01-orb-alpha"), None)
    if (source is None or source.get("sourceRights") != "PROJECT_ORIGINAL_PROCEDURAL" or
            source.get("imageSha256") != IMAGE_SHA or
            source.get("groundTruthSha256") != MODEL_SHA["reference"]):
        raise QAError("Prior project-original fixture/rights manifest changed")
    for asset_id, filename, expected_sha in (
        ("source-image", "input.png", IMAGE_SHA),
        ("preview-glb", "output.glb", MODEL_SHA["original"]),
        ("qa-report", "qa-report.json", None),
        ("geometry-qa", "geometry-qa.json", None),
        ("benchmark-shape", "benchmark-shape.json", None),
    ):
        path = _regular(jobdir / filename)
        asset = next((a for a in job["assets"] if a.get("id") == asset_id), None)
        if (asset is None or asset.get("sha256") != digest(path) or
                asset.get("bytes") != path.stat().st_size or
                (expected_sha is not None and digest(path) != expected_sha)):
            raise QAError("Previous private job asset provenance changed: " + asset_id)

    models = {
        "original": jobdir / "output.glb",
        "derivative": PRIVATE / "orb-positive-winding.glb",
        "reference": ROOT / "benchmarks" / "g3" / "fixtures" / "01-orb-alpha" / "ground-truth.glb",
        "chair": ROOT / "docs" / "evidence" / "g3" / "chair-positive-winding.glb",
    }
    for key, path in models.items():
        if digest(_regular(path)) != MODEL_SHA[key]:
            raise QAError("Prior source model changed: " + key)
    prior = _json(ROOT / "docs" / "evidence" / "g3" /
                  "orb-01-g313-selected-exact-pair-predicate.json")
    if (prior.get("original", {}).get("sourceModelSha256") != MODEL_SHA["original"] or
            prior.get("orientationOnlyDerivative", {}).get("sourceModelSha256") != MODEL_SHA["derivative"] or
            prior.get("proceduralReference", {}).get("sourceModelSha256") != MODEL_SHA["reference"] or
            prior.get("historicChair", {}).get("sourceModelSha256") != MODEL_SHA["chair"] or
            prior.get("printQualified") is not False):
        raise QAError("Existing G3.13 SHA evidence lineage differs")
    return models


def _summary(report):
    return {
        "triangleCount": report["triangleCount"],
        "sphereBroadphaseCandidates": report["sphereBroadphaseCandidatesEnumerated"],
        "everyPotentialAabbOverlapNumericallyEnumerated": report[
            "completeAabbOverlappingFacePairCensus"],
        "allNumericalSATNoIndexPairsExamined": report[
            "completeNumericalSATForNoSharedIndexPairs"],
        "aabbOverlappingFacePairs": report["aabbOverlappingPairs"],
        "pairsSharingIndexedEdge": report["indexedSharedEdgePairsWithinAabb"],
        "pairsSharingExactlyOneIndexedVertex": report[
            "indexedSharedOnlyOneVertexPairsWithinAabb"],
        "pairsSharingNoIndexedVertex": report["noSharedIndexPairsWithinAabb"],
        "noIndexPairsCheckedByConservativeNumericalSAT": report[
            "noSharedIndexPairsCheckedByNumericalSAT"],
        "possibleNonindexNumericalContactPairs": report[
            "numericalSATPotentialNonindexedPairs"],
        "possibleNonindexContactsExactRefined": report[
            "exactFlaggedPairRefinement"]["allFlaggedPairsRefined"],
        "aabbRelativeTolerance": report["aabbToleranceRelativeToDiagonal"],
        "aabbToleranceArbitraryModelUnits": report[
            "aabbToleranceArbitraryUnits"],
        "noPrintQualification": report["printQualified"] is False,
    }


def _public_report(reports):
    old = _json(ROOT / "docs" / "evidence" / "g3" /
                "orb-01-g38-cpu-risk-screen.json")
    # The previous screen filtered triangle centroid-sphere neighbors BEFORE
    # reporting AABBs. G3.14 independently uses AABB-enclosing spheres.
    # The delta does NOT prove previously missed actual 3D intersections.
    if (old.get("schema") != "local3d.g3.8.real-orb-cpu-risk-diagnostic.v1" or
            old.get("sourceImageSha256") != IMAGE_SHA or
            old.get("realOriginalOutputSha256") != MODEL_SHA["original"] or
            old.get("previousOrientationOnlyDerivativeSha256") != MODEL_SHA["derivative"] or
            old.get("originalGroundTruthSha256") != MODEL_SHA["reference"] or
            old.get("contacts", {}).get("original", {}).get("aabbPairs") != 294413 or
            old.get("contacts", {}).get("original", {}).get("conservativeSatPairChecks") != 43025 or
            old.get("contacts", {}).get("originalProceduralGroundTruth", {}).get("aabbPairs") != 7650 or
            old.get("printQualified") is not False):
        raise QAError("Historical G3.8 comparison provenance or counts changed")
    a, b = reports["original"], reports["derivative"]
    without_provenance = ("modelSha256", "modelBytes")
    if any(a[key] != b[key] for key in a if key not in without_provenance):
        raise QAError("G3.7 exact-winding derivative unexpectedly changed AABB census")
    previous_g38_aabb_real = 294413
    previous_g38_sat_real = 43025
    if a["aabbOverlappingPairs"] < previous_g38_aabb_real or (
            a["noSharedIndexPairsWithinAabb"] < previous_g38_sat_real):
        raise QAError("Unexpected independent broadphase vs prior numerical census")
    return {
        "schema": "local3d.g3.14.real-model-exhaustive-numerical-aabb-census.v1",
        "scope": "COMPLETE_CONSERVATIVE_AABB_CANDIDATE_CENSUS_NOT_FULL_EXACT_MESH_CONTACT",
        "fixtureId": "01-orb-alpha",
        "sourceRights": "PROJECT_ORIGINAL_PROCEDURAL",
        "originalFixtureImageSha256": IMAGE_SHA,
        "priorRealTripoSRModelSha256": MODEL_SHA["original"],
        "sameGeometryWindingDerivativeSha256": MODEL_SHA["derivative"],
        "originalProceduralGroundTruthSha256": MODEL_SHA["reference"],
        "historicalChairDerivativeSha256": MODEL_SHA["chair"],
        "previouslyCompletedRealModelOnly": True,
        "additionalGpuInferenceThisMilestone": False,
        "realTripoSR": _summary(a),
        "unchangedWindingOnlyCopy": _summary(b),
        "projectOriginalGT": _summary(reports["reference"]),
        "historicalChair": _summary(reports["chair"]),
        "originalAndDerivativeCensusesIdentical": True,
        "historicalG38RealAabbPairsAfterItsCentroidSphereFilter": previous_g38_aabb_real,
        "historicalG38RealNoIndexNumericalSatPairs": previous_g38_sat_real,
        "g314AdditionalConservativeAabbPairsOverG38": (
            a["aabbOverlappingPairs"] - previous_g38_aabb_real),
        "g314AdditionalNoIndexedVertexAabbPairsOverG38": (
            a["noSharedIndexPairsWithinAabb"] - previous_g38_sat_real),
        "comparisonCaveat": (
            "G38_CENTROID_TRIANGLE_SPHERES_VS_G314_BBOX_ENCLOSING_SPHERES;"
            "NEW_AABB_PAIRS_NOT_AUTOMATIC_REAL_SURFACE_INTERSECTIONS"),
        "exactPredicateApplication": "ONLY_NUMERICAL_SAT_POSITIVE_NO_INDEX_PAIR_SUBSET",
        "indexedEdgeAndVertexTouchingNotExactGloballyResolved": True,
        "numericalSatCannotCertifyNoSmallIntersections": True,
        "notTrueGlobalSelfIntersectionFreeCertification": True,
        "physicalMillimeterScale": "UNKNOWN_UNCALIBRATED",
        "wallThickness": "NOT_TESTED",
        "mechanicalAndSlicerPrintQA": "NOT_TESTED",
        "allModelsDraft": True, "printQualified": False,
        "approvedForPrinter": False,
        "fabricationAction": "NONE",
        "privateUUIDImagesAndFacePairIDsNotPublished": True,
    }


def verify(job_id, *, prepare_private=False, write_public=False):
    models = _model_list(job_id)
    reports = {}
    for kind, path in models.items():
        current = screen_glb(path)
        if (current["modelSha256"] != MODEL_SHA[kind] or
                not current["completeAabbOverlappingFacePairCensus"] or
                not current["completeNumericalSATForNoSharedIndexPairs"] or
                current["status"] == "INDETERMINATE_BUDGET_OR_TIME" or
                current["printQualified"] is not False or
                current["globalSelfIntersectionFreeCertified"] is not False):
            raise QAError("G3.14 incomplete source CPU census: " + kind)
        saved = PRIVATE / (kind + "-g314-full-aabb-census.json")
        if prepare_private:
            write_immutable(saved, current)
        if _json(saved) != current:
            raise QAError("Immutable G3.14 private CPU evidence divergence: " + kind)
        reports[kind] = current
    public = _public_report(reports)
    raw = json.dumps(public, sort_keys=True, indent=2) + "\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", raw, re.I):
        raise QAError("Private UUID in public proof")
    if write_public:
        write_immutable(PUBLIC, public)
    if _json(PUBLIC) != public:
        raise QAError("G3.14 public sanitized SHA evidence differs")
    print("G3_14_FOUR_MODEL_COMPLETE_CPU_AABB_REPLAY_PASS " + json.dumps({
        "realOrbFaces": reports["original"]["triangleCount"],
        "realOrbAabbPairs": reports["original"]["aabbOverlappingPairs"],
        "realOrbNoIndexPairs": reports["original"]["noSharedIndexPairsWithinAabb"],
        "realOrbNumericalSATPotential": reports["original"][
            "numericalSATPotentialNonindexedPairs"],
        "extraAabbCandidatesVsG38": public[
            "g314AdditionalConservativeAabbPairsOverG38"],
        "fourPriorLicensedSHAProvenancesValidated": True,
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
        verify(args.job_id, prepare_private=args.prepare_private,
               write_public=args.write_public)
    except (QAError, OSError, ValueError, KeyError, TypeError, MemoryError) as e:
        print("G3_14_CPU_REPLAY_FAILED " + type(e).__name__ +
              ": " + str(e), file=sys.stderr)
        sys.exit(1)
