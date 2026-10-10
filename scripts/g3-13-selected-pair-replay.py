"""G3.13 source-locked CPU-only EXACT selected-pair demo on prior licensed GLBs.

Selects exactly 24 distinct already-indexed edge-adjacent face pairs from EACH
of four SHA-verified existing GLBs, NOT a whole-mesh collision scan.
Only a sanitized source-hash/counter report can be written to Git.
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

import numpy as np
from exact_triangle_predicates import classify_selected_pairs
from geometry_qa import QAError, digest, inspect_glb
from winding_equivalence import _mesh

SHA = {
    "original": "f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
    "derivative": "ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
    "reference": "c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
    "chair": "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec",
}
SAMPLES = 24
PUBLIC = ROOT / "docs" / "evidence" / "g3" / "orb-01-g313-selected-exact-pair-predicate.json"


def run(job_id, *, write_public=False):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", job_id, re.I):
        raise QAError("Prior genuine TripoSR job UUID required only as local input")
    jobdir = ROOT / "runtime" / "data-g2-manual" / "jobs" / job_id
    if jobdir.is_symlink() or jobdir.resolve(strict=True) != jobdir.absolute():
        raise QAError("Noncanonical previous job folder")
    record = jobdir / "job.json"
    if record.is_symlink():
        raise QAError("Symlinked job record")
    job = json.loads(record.read_text(encoding="utf-8"))
    if (job.get("id") != job_id or job.get("status") != "completed" or
            job.get("simulation") is not False or
            job.get("providerId") != "triposr-local"):
        raise QAError("Actual completed prior model required")
    private = ROOT / "runtime" / "qa" / "g3" / "orb-01-positive-winding"
    models = {
        "original": jobdir / "output.glb",
        "derivative": private / "orb-positive-winding.glb",
        "reference": ROOT / "benchmarks" / "g3" / "fixtures" / "01-orb-alpha" / "ground-truth.glb",
        "chair": ROOT / "docs" / "evidence" / "g3" / "chair-positive-winding.glb",
    }
    reports = {}
    for kind, file in models.items():
        if file.is_symlink() or not file.is_file() or digest(file) != SHA[kind]:
            raise QAError("Pinned existing GLB SHA mismatch: " + kind)
        qa = inspect_glb(file)
        if qa["modelSha256"] != SHA[kind] or qa["geometryObjectCount"] != 1 or (
                qa["printQualified"] is not False):
            raise QAError("Unqualified source topology or provenance")
        mesh = _mesh(file)
        pairs = np.unique(np.sort(
            np.asarray(mesh.face_adjacency, dtype=np.int64), axis=1), axis=0)
        pairs = pairs[:SAMPLES]
        if len(pairs) != SAMPLES or np.any(pairs[:, 0] >= pairs[:, 1]):
            raise QAError("Insufficient distinct indexed-adjacent face pairs")
        partial = classify_selected_pairs(mesh.vertices, mesh.faces, pairs)
        if (not partial["completeSelectedPairClassification"] or
                partial["selectedPairCount"] != SAMPLES or
                partial["selectedPairsClassified"] != SAMPLES or
                partial["printQualified"] is not False or
                partial["globalSelfIntersectionFreeCertified"] is not False):
            raise QAError("Unexpected selected-pair diagnostic qualification")
        reports[kind] = {
            "sourceModelSha256": SHA[kind],
            "sourceTriangleCount": int(len(mesh.faces)),
            "totalIndexedEdgeAdjacentPairsNotAllScreened": int(len(mesh.face_adjacency)),
            "selectedIndexedSharedEdgePairs": SAMPLES,
            "selectedPairClassifications": partial["classificationCounts"],
            "fullModelIntersectionCensusComplete": False,
            "printQualified": False,
        }
    a = dict(reports["original"]); b = dict(reports["derivative"])
    a.pop("sourceModelSha256"); b.pop("sourceModelSha256")
    if a != b:
        raise QAError("Winding-only copy has nonidentical deterministic pair-screen")
    report = {
        "schema": "local3d.g3.13.exact-predicate-selected-real-model-pairs.v1",
        "fixtureId": "01-orb-alpha",
        "rights": "PROJECT_ORIGINAL_PROCEDURAL",
        "existingRealModelSource": "PREVIOUSLY_COMPLETED_MANUAL_TRIPOSR_JOB",
        "selectedPairsMethod": "FIRST_24_LEXICOGRAPHIC_INDEXED_SHARED_EDGE_FACE_PAIRS_PER_GLTF_MESH",
        "onlySelectedPairsNotWholeMesh": True,
        "reducedModelSelectionIsNotAStatisticalSample": True,
        "exactNumberBasis": "EXACT_RATIONALS_FROM_PREVIOUSLY_DECODED_IEEE754_VERTEX_COORDINATES_ONLY",
        "notTrueCADOrManufacturingPrecision": True,
        "notCrossFaceGlobalSelfIntersectionExhaustion": True,
        "original": reports["original"],
        "orientationOnlyDerivative": reports["derivative"],
        "proceduralReference": reports["reference"],
        "historicChair": reports["chair"],
        "windingOnlyPairClassificationsIdentical": True,
        "newAiInference": False,
        "physicalScaleUnits": "UNKNOWN_UNCALIBRATED",
        "wallThickness": "NOT_TESTED",
        "completeGlobalSelfIntersectionFreeCertified": False,
        "printQualified": False, "approvedForPrinter": False,
        "fabricationAction": "NONE",
        "privateJobIdsOrFaceIndicesPublished": False,
    }
    raw = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", raw, re.I):
        raise QAError("Private job UUID leak")
    if write_public:
        if PUBLIC.is_symlink():
            raise QAError("Symlinked public evidence")
        if PUBLIC.exists():
            if PUBLIC.read_text(encoding="utf-8") != raw:
                raise QAError("Existing G3.13 public evidence differs, refusing overwrite")
        else:
            PUBLIC.parent.mkdir(parents=True, exist_ok=True)
            PUBLIC.write_text(raw, encoding="utf-8")
    elif not PUBLIC.is_file() or PUBLIC.read_text(encoding="utf-8") != raw:
        raise QAError("Read-only G3.13 public proof missing or divergent")
    print("G3_13_EXACT_BINARY_FLOAT_SELECTED_PAIRS_PASS " + json.dumps({
        "selectedPairsPerExistingModel": SAMPLES,
        "sourceModelsSHAValidated": 4,
        "realOrbClassificationCounts": reports["original"]["selectedPairClassifications"],
        "noNewInference": True, "fullMeshSelfIntersectionCertified": False,
        "printQualified": False,
    }))


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--job-id", required=True)
        parser.add_argument("--write-public", action="store_true")
        a = parser.parse_args()
        run(a.job_id, write_public=a.write_public)
    except (QAError, OSError, TypeError, ValueError, KeyError, MemoryError) as exc:
        print("G3_13_SELECTED_CPU_PROOF_FAILED " + type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
