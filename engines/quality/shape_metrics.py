"""G3.3 reproducible CPU-only synthetic-reference 3D surface comparison.

Assesses SHAPE resemblance to original procedural source geometry. Models
with unknown physical size/orientation are independently normalized by AABB
diagonal and center; candidate yaw is optimized post-hoc over a fixed grid.
Thus this is an *optimistic, uncalibrated shape diagnostic*, NOT dimensional
accuracy, printer qualification, or independent proof of AI inference.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

import numpy as np
from scipy.spatial import cKDTree
import trimesh

from geometry_qa import QAError, inspect_glb
from silhouette import ROOT, FIXTURES, file_hash, load_catalog, verified_reference

SAMPLES = 1536
YAW_DEGREES = tuple(range(0, 360, 45))
PRECISION_THRESHOLDS = (0.02, 0.05)
MAX_MESH_OBJECTS = 64
METRIC_VERSION = "local3d.g3.shape-metrics.v1"


class ShapeMetricError(ValueError):
    pass


def sha_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def load_pinned_mesh(file: Path, required_sha: str | None = None):
    file = Path(file)
    if file.is_symlink():
        raise ShapeMetricError("Symlink GLB not accepted")
    evidence = inspect_glb(file)
    if required_sha is not None and evidence["modelSha256"] != required_sha:
        raise ShapeMetricError("GLB differs from pinned SHA256")
    scene = trimesh.load(file, file_type="glb", force="scene", process=False)
    meshes = scene.dump(concatenate=False)
    meshes = [meshes] if hasattr(meshes, "faces") else list(meshes)
    if not meshes or len(meshes) > MAX_MESH_OBJECTS:
        raise ShapeMetricError("Unsupported GLB scene complexity")
    vertices = []
    faces = []
    n = 0
    for mesh in meshes:
        v = np.asarray(mesh.vertices, dtype=np.float64)
        f = np.asarray(mesh.faces, dtype=np.int64)
        if len(v) == 0 or len(f) == 0:
            raise ShapeMetricError("Empty mesh object")
        vertices.append(v)
        faces.append(f + n)
        n += len(v)
    points = np.vstack(vertices)
    triangle_indices = np.vstack(faces)
    if not np.isfinite(points).all() or not len(triangle_indices):
        raise ShapeMetricError("Invalid surface coordinates")
    return points, triangle_indices, evidence


def uniform_surface_sample(vertices, faces, *, n_samples=SAMPLES, seed=20261010):
    if n_samples < 128 or n_samples > 8192:
        raise ShapeMetricError("Unsafe sample count")
    xyz = vertices[faces]
    areas = 0.5 * np.linalg.norm(
        np.cross(xyz[:, 1] - xyz[:, 0], xyz[:, 2] - xyz[:, 0]),
        axis=1
    )
    total = float(areas.sum())
    if not np.isfinite(total) or total <= 1e-12:
        raise ShapeMetricError("Mesh has no finite positive surface area")
    rng = np.random.default_rng(seed)
    choices = rng.choice(len(faces), size=n_samples, p=areas / total)
    tri = xyz[choices]
    a = rng.random(n_samples)
    b = rng.random(n_samples)
    root = np.sqrt(a)
    u = 1 - root
    v = root * (1 - b)
    w = root * b
    surface = (
        tri[:, 0] * u[:, None] +
        tri[:, 1] * v[:, None] +
        tri[:, 2] * w[:, None]
    )
    if not np.isfinite(surface).all():
        raise ShapeMetricError("Invalid surface sample")
    center = 0.5 * (vertices.max(axis=0) + vertices.min(axis=0))
    diagonal = float(np.linalg.norm(vertices.max(axis=0) - vertices.min(axis=0)))
    if diagonal < 1e-10 or not math.isfinite(diagonal):
        raise ShapeMetricError("Degenerate global bounds")
    return (surface - center) / diagonal, diagonal


def rotate_y(samples: np.ndarray, angle: int):
    rad = np.deg2rad(angle)
    c, s = np.cos(rad), np.sin(rad)
    matrix = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return samples @ matrix.T


def nearest_metrics(ref: np.ndarray, pred: np.ndarray, ref_tree: cKDTree):
    # Approximation for a fixed deterministic finite surface sample.
    # Not Hausdorff, not a signed distance, and not a watertightness check.
    pred_to_ref = ref_tree.query(pred, k=1, workers=1)[0]
    pred_tree = cKDTree(pred)
    ref_to_pred = pred_tree.query(ref, k=1, workers=1)[0]
    symmetric_chamfer = 0.5 * (pred_to_ref.mean() + ref_to_pred.mean())
    return {
        "chamferL1Normalized": round(float(symmetric_chamfer), 8),
        "precisionAt2Pct": round(float(np.mean(pred_to_ref <= .02)), 7),
        "recallAt2Pct": round(float(np.mean(ref_to_pred <= .02)), 7),
        "precisionAt5Pct": round(float(np.mean(pred_to_ref <= .05)), 7),
        "recallAt5Pct": round(float(np.mean(ref_to_pred <= .05)), 7)
    }


def evaluate_surfaces(reference_path: Path, candidate_path: Path, *,
                      required_reference_sha: str | None = None, samples=SAMPLES):
    v_ref, f_ref, q_ref = load_pinned_mesh(reference_path, required_reference_sha)
    v_cand, f_cand, q_cand = load_pinned_mesh(candidate_path)
    ref, ref_scale = uniform_surface_sample(v_ref, f_ref, n_samples=samples)
    pred, pred_scale = uniform_surface_sample(v_cand, f_cand, n_samples=samples)
    tree = cKDTree(ref)
    all_views = []
    for yaw in YAW_DEGREES:
        metrics = nearest_metrics(ref, rotate_y(pred, yaw), tree)
        all_views.append({"candidateYawDegrees": yaw, **metrics})
    best = min(all_views, key=lambda x: (x["chamferL1Normalized"], x["candidateYawDegrees"]))
    precision = best["precisionAt2Pct"]
    recall = best["recallAt2Pct"]
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "referenceSha256": q_ref["modelSha256"],
        "candidateSha256": q_cand["modelSha256"],
        "referenceVertices": q_ref["totalVertices"],
        "candidateVertices": q_cand["totalVertices"],
        "referenceTriangles": q_ref["totalTriangles"],
        "candidateTriangles": q_cand["totalTriangles"],
        "referenceConnectedComponents": q_ref["topology"]["componentCount"],
        "candidateConnectedComponents": q_cand["topology"]["componentCount"],
        "sameInputBinary": q_ref["modelSha256"] == q_cand["modelSha256"],
        "sampleCountPerSurface": samples,
        "testedYawAnglesDegrees": list(YAW_DEGREES),
        "selectionPolicy": "MIN_CHAMFER_OVER_POST_HOC_YAW_SEARCH",
        "scalePolicy": "EACH_AABB_DIAGONAL_NORMALIZED_TO_ONE_INDEPENDENTLY",
        "referenceAabbDiagonalArbitraryUnits": round(ref_scale, 7),
        "candidateAabbDiagonalArbitraryUnits": round(pred_scale, 7),
        "bestView": {**best, "f1At2Pct": round(f1, 7)},
        "referenceSelfSimilarityOnly": False,
        "measuresAbsoluteScale": False,
        "physicalDimensions": "UNKNOWN_UNCALIBRATED",
        "printQualified": False
    }


def pinned_original_reference(fixture_id):
    catalog = load_catalog()
    entries = {x["id"]: x for x in catalog["fixtures"]}
    if fixture_id not in entries:
        raise ShapeMetricError("Unknown licensed reference fixture")
    entry = entries[fixture_id]
    if entry["sourceRights"] != "PROJECT_ORIGINAL_PROCEDURAL":
        raise ShapeMetricError("This fixture has NO ground-truth 3D")
    # Verify source image, mask, original model and catalog identity.
    verified_reference(entry)
    ref = FIXTURES / entry["files"]["groundTruth"]
    if ref.is_symlink() or not ref.resolve(strict=True).is_relative_to(FIXTURES.resolve()):
        raise ShapeMetricError("Reference GLB path is untrusted")
    if file_hash(ref) != entry["groundTruthSha256"]:
        raise ShapeMetricError("Original reference geometry differs from pinned hash")
    return entry, ref


def report_one(fixture_id, candidate: Path, *, lane, samples=SAMPLES):
    entry, gt = pinned_original_reference(fixture_id)
    shape = evaluate_surfaces(gt, candidate,
                              required_reference_sha=entry["groundTruthSha256"],
                              samples=samples)
    shape["referenceSelfSimilarityOnly"] = lane == "ORIGINAL_REFERENCE_SELF_CHECK"
    return {
        "schema": METRIC_VERSION,
        "fixtureId": fixture_id,
        "sourceRights": entry["sourceRights"],
        "imageSha256": entry["imageSha256"],
        "referenceClassification": "ORIGINAL_PROCEDURAL_3D_NOT_AN_AI_OUTPUT",
        "candidateEvidenceLane": lane,
        "diagnosticOnly": True,
        "shape": shape,
        "interpretation": [
            "Post-hoc best-of-eight Y-axis rotations is optimistic and not a fixed-camera assessment",
            "Both geometries are independently normalized, hiding absolute-scale errors",
            "Finite surface samples approximate a 3D shape-distance metric, not point correspondence",
            "Precision/recall at 2% and 5% refer to each independently normalized AABB diagonal",
            "Mesh component counts are separate topology measurements, not a repair guarantee",
            "This does not measure texture, original photograph similarity or appearance",
            "This does not establish millimeters, wall thickness, self-intersections, strength or printability"
        ],
        "printQualified": False,
        "approvedForPrinter": False,
        "fabricationAction": "NONE"
    }


def write_immutable_report(file: Path, content: dict):
    file = Path(file)
    if file.is_symlink():
        raise ShapeMetricError("Symlink output not accepted")
    raw = json.dumps(content, indent=2, ensure_ascii=False, sort_keys=True) + "\n"
    file.parent.mkdir(parents=True, exist_ok=True)
    if file.exists():
        if file.read_text(encoding="utf-8") != raw:
            raise ShapeMetricError("Existing quality evidence differs, refusing overwrite")
        return
    file.write_text(raw, encoding="utf-8")


def main():
    p = argparse.ArgumentParser(description="Offline G3.3 non-fabrication surface diagnostics")
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--positive-controls", action="store_true")
    group.add_argument("--negative-controls", action="store_true")
    group.add_argument("--fixture")
    p.add_argument("--candidate", type=Path)
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    catalog = load_catalog()
    if args.positive_controls or args.negative_controls:
        if args.candidate:
            p.error("Control mode cannot accept a candidate model")
        inputs = [e["id"] for e in catalog["fixtures"]
                  if e["sourceRights"] == "PROJECT_ORIGINAL_PROCEDURAL"]
        if args.positive_controls:
            pairs = [(id_, id_) for id_ in inputs]
            lane = "ORIGINAL_REFERENCE_SELF_CHECK"
        else:
            pairs = [
                ("01-orb-alpha", "04-torus-hole"),
                ("04-torus-hole", "01-orb-alpha"),
                ("05-disconnected-pair", "01-orb-alpha"),
                ("06-thin-chair", "07-gear-opaque")
            ]
            lane = "DELIBERATELY_WRONG_ORIGINAL_CONTROL_NOT_AN_AI_RESULT"
        reports = []
        for fixture_id, candidate_id in pairs:
            _, candidate = pinned_original_reference(candidate_id)
            item = report_one(fixture_id, candidate, lane=lane)
            item["controlCandidateReferenceId"] = candidate_id
            reports.append(item)
        result = {
            "schema":"local3d.g3.shape-control-set.v1",
            "controls": "positive" if args.positive_controls else "negative",
            "noAiInference": True,
            "count": len(reports),
            "reports": reports,
            "printQualified": False
        }
    else:
        if not args.candidate:
            p.error("--fixture requires --candidate")
        result = report_one(
            args.fixture, args.candidate,
            lane="UNATTESTED_STANDALONE_CANDIDATE_NOT_VERIFIED_AI_EXECUTION"
        )
    write_immutable_report(args.output, result)
    if "count" in result:
        scores = [x["shape"]["bestView"]["chamferL1Normalized"] for x in result["reports"]]
        print("G3_SHAPE_CONTROLS " + json.dumps({
            "lane":result["controls"],"count":len(scores),
            "min":min(scores),"max":max(scores),
            "newGpuInference":False,"printQualified":False
        }))
    else:
        print("G3_SHAPE_UNATTESTED_DIAGNOSTIC " + json.dumps({
            "fixture":result["fixtureId"],
            "chamferL1Normalized":result["shape"]["bestView"]["chamferL1Normalized"],
            "newGpuInference":False,"printQualified":False
        }))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, QAError, ShapeMetricError) as e:
        print("G3_SHAPE_FAILED " + str(e), file=sys.stderr)
        sys.exit(1)
