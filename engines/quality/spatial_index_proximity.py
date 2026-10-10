"""G3.12 CPU-only spatially coincident/near-coincident DIFFERENT indexed vertices.

This is an anomaly candidate screen, not a mesh welding/repair operation.
Separate vertex indices may deliberately occupy identical XYZ (e.g. UV seams).
Cross-component vertex proximity can suggest touching shells but cannot prove
surface intersection, nor can its absence exclude face-interior shell contacts.
Distances use the unknown GLB object's bounding-box diagonal, NOT millimeters.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import time

import numpy as np
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh

SCHEMA = "local3d.g3.12.spatial-index-proximity-screen.v1"
MAX_VERTICES = 100000
MAX_FACES = 75000
MAX_NEIGHBORS = 32
MAX_PAIRS = 200000
MAX_SECONDS = 35.0
NEAR_REL_DIAGONAL = 1e-7
PRIVATE_EXAMPLES = 5


def screen_spatial_indices(v, f, *, near_rel=NEAR_REL_DIAGONAL,
                           max_neighbors=MAX_NEIGHBORS,
                           max_pairs=MAX_PAIRS, max_seconds=MAX_SECONDS):
    """Find all within-radius different-ID vertex pairs ONLY if caps permit."""
    started = time.perf_counter()
    raw_v = np.asarray(v)
    raw_f = np.asarray(f)
    if raw_v.ndim != 2 or raw_v.shape[1] != 3 or raw_f.ndim != 2 or raw_f.shape[1] != 3:
        raise QAError("Invalid indexed geometry array shapes")
    if not np.issubdtype(raw_f.dtype, np.integer) or np.issubdtype(raw_f.dtype, np.bool_):
        raise QAError("Face indices must be integers, not coerced from floats")
    if not (3 <= len(raw_v) <= MAX_VERTICES and 1 <= len(raw_f) <= MAX_FACES):
        raise QAError("Spatial diagnostic geometry exceeds resource budget")
    if not (0 < near_rel <= 1e-5 and 2 <= max_neighbors <= MAX_NEIGHBORS and
            1 <= max_pairs <= MAX_PAIRS and 0 < max_seconds <= MAX_SECONDS):
        raise QAError("Unsafe/invalid proximity tolerance or resource budget")
    vertices = np.asarray(raw_v, dtype=np.float64)
    faces = np.asarray(raw_f, dtype=np.int64)
    if (not np.isfinite(vertices).all() or
            int(faces.min()) < 0 or int(faces.max()) >= len(vertices)):
        raise QAError("Nonfinite vertices or invalid indexed references")
    if (np.any(faces[:, 0] == faces[:, 1]) or
            np.any(faces[:, 1] == faces[:, 2]) or
            np.any(faces[:, 0] == faces[:, 2])):
        raise QAError("Repeated vertex index inside one triangle")
    if len(np.unique(faces)) != len(vertices):
        raise QAError("Unreferenced vertices would distort spatial census")
    diag = float(np.linalg.norm(vertices.max(axis=0) - vertices.min(axis=0)))
    if not np.isfinite(diag) or diag <= 1e-12:
        raise QAError("Degenerate model scale")
    tri = vertices[faces]
    double_area = np.linalg.norm(
        np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    if np.any(~np.isfinite(double_area)) or np.any(
            double_area <= max(1e-20, diag ** 2 * 1e-15)):
        raise QAError("Degenerate geometric triangle")
    tolerance = diag * near_rel

    # Connected components use ONLY indexed triangle edges, never geometric
    # nearest points. A spatial touch does not merge topology.
    r = faces[:, [0, 1, 2]].reshape(-1)
    c = faces[:, [1, 2, 0]].reshape(-1)
    graph = coo_matrix((np.ones(len(r), dtype=np.uint8), (r, c)),
                       shape=(len(vertices), len(vertices))).tocsr()
    component_count, components = connected_components(graph, directed=False)
    if time.perf_counter() - started > max_seconds:
        raise QAError("Spatial component census exceeded CPU time budget")

    # kNN with a sentinel neighbor limits memory/CPU on dense clusters.
    # The first neighbor is self; one extra beyond the explicit cap proves
    # incomplete enumeration and returns INDETERMINATE, never false clearance.
    k = max_neighbors + 2
    distance, indices = cKDTree(vertices).query(
        vertices, k=k,
        distance_upper_bound=float(np.nextafter(tolerance, np.inf)),
        workers=1)
    if time.perf_counter() - started > max_seconds:
        raise QAError("Spatial neighborhood query exceeded CPU time budget")
    overflow = bool(np.isfinite(distance[:, max_neighbors + 1]).any())
    pairs = set()
    if not overflow:
        for i in range(len(vertices)):
            for j, dist in zip(indices[i], distance[i]):
                if not np.isfinite(dist) or j >= len(vertices) or j == i:
                    continue
                a, b = (i, int(j)) if i < j else (int(j), i)
                pairs.add((a, b))
                if len(pairs) > max_pairs:
                    overflow = True
                    break
            if overflow:
                break
            if i % 4096 == 0 and time.perf_counter() - started > max_seconds:
                raise QAError("Spatial pair enumeration exceeded CPU time budget")

    if overflow:
        return {
            "schema": SCHEMA,
            "status": "INDETERMINATE_DENSE_NEIGHBOR_OR_PAIR_BUDGET",
            "completeDifferentIndexProximityCensus": False,
            "incompleteReason": "NEIGHBOR_OR_PAIR_BUDGET",
            "vertexCount": int(len(vertices)), "triangleCount": int(len(faces)),
            "indexedConnectedComponents": int(component_count),
            "proximityPairsEnumerated": None,
            "exactCoincidentDifferentIndexPairs": None,
            "nearCoincidentDifferentIndexPairs": None,
            "acrossIndexedComponentsPairs": None,
            "acrossIndexedComponentsExactPairs": None,
            "acrossIndexedComponentsNearPairs": None,
            "componentPairsWithVertexProximity": None,
            "privateExampleVertexPairs": [],
            "boundingBoxDiagonalArbitraryUnits": round(diag, 10),
            "nearToleranceRelativeToDiagonal": near_rel,
            "nearToleranceArbitraryUnits": float(tolerance),
            "resourceCaps": {"maxVertices": MAX_VERTICES, "maxTriangles": MAX_FACES,
                             "maxNeighborsPerVertex": max_neighbors,
                             "maxPairs": max_pairs, "maxSeconds": max_seconds},
            "indexedTopologyIsNotSpatialEquivalence": True,
            "spatiallyCoincidentVerticesCanBeIntentional": True,
            "crossComponentVertexProximityDoesNotCertifySurfaceIntersection": True,
            "absenceCannotExcludeFaceInteriorShellContact": True,
            "globalSelfIntersectionFreeCertified": False,
            "disconnectedShellsContactFreeCertified": False,
            "wallThicknessTested": False, "physicalMillimeterScale": "UNKNOWN_UNCALIBRATED",
            "printQualified": False, "approvedForPrinter": False,
            "fabricationAction": "NONE", "newAiInference": False
        }

    unique = sorted(pairs)
    if unique:
        ids = np.asarray(unique, dtype=np.int64)
        # Recompute true float64 distances: cKDTree is for bounded candidate
        # enumeration only. Exactly equal XYZ is distinct from small distance.
        exact = np.all(vertices[ids[:, 0]] == vertices[ids[:, 1]], axis=1)
        cross = components[ids[:, 0]] != components[ids[:, 1]]
        across = {
            tuple(sorted((int(components[a]), int(components[b]))))
            for a, b in unique if components[a] != components[b]
        }
        exact_count, cross_count = int(exact.sum()), int(cross.sum())
        cross_exact = int((exact & cross).sum())
    else:
        exact_count = cross_count = cross_exact = 0
        across = set()
    total = len(unique)
    return {
        "schema": SCHEMA,
        "status": ("CROSS_COMPONENT_VERTEX_PROXIMITY_CANDIDATES" if cross_count else
                   "SAME_COMPONENT_SPATIAL_INDEX_DUPLICATES_OR_NEAR_MATCHES" if total else
                   "NO_DIFFERENT_INDEX_VERTEX_PROXIMITY_WITHIN_NUMERICAL_TOLERANCE"),
        "completeDifferentIndexProximityCensus": True,
        "incompleteReason": None,
        "vertexCount": int(len(vertices)), "triangleCount": int(len(faces)),
        "indexedConnectedComponents": int(component_count),
        "proximityPairsEnumerated": total,
        "exactCoincidentDifferentIndexPairs": exact_count,
        "nearCoincidentDifferentIndexPairs": total - exact_count,
        "acrossIndexedComponentsPairs": cross_count,
        "acrossIndexedComponentsExactPairs": cross_exact,
        "acrossIndexedComponentsNearPairs": cross_count - cross_exact,
        "componentPairsWithVertexProximity": len(across),
        "privateExampleVertexPairs": [list(x) for x in unique[:PRIVATE_EXAMPLES]],
        "boundingBoxDiagonalArbitraryUnits": round(diag, 10),
        "nearToleranceRelativeToDiagonal": near_rel,
        "nearToleranceArbitraryUnits": float(tolerance),
        "resourceCaps": {"maxVertices": MAX_VERTICES, "maxTriangles": MAX_FACES,
                         "maxNeighborsPerVertex": max_neighbors,
                         "maxPairs": max_pairs, "maxSeconds": max_seconds},
        "indexedTopologyIsNotSpatialEquivalence": True,
        "spatiallyCoincidentVerticesCanBeIntentional": True,
        "crossComponentVertexProximityDoesNotCertifySurfaceIntersection": True,
        "absenceCannotExcludeFaceInteriorShellContact": True,
        "globalSelfIntersectionFreeCertified": False,
        "disconnectedShellsContactFreeCertified": False,
        "wallThicknessTested": False, "physicalMillimeterScale": "UNKNOWN_UNCALIBRATED",
        "printQualified": False, "approvedForPrinter": False,
        "fabricationAction": "NONE", "newAiInference": False
    }


def screen_glb(model):
    model = Path(model)
    if model.is_symlink():
        raise QAError("Symlinked input model forbidden")
    qa = inspect_glb(model)
    topology = qa["topology"]
    if (qa["geometryObjectCount"] != 1 or
            topology["everyObjectWatertight"] is not True or
            topology["everyObjectWindingConsistent"] is not True or
            topology["boundaryEdges"] != 0 or
            topology["nonManifoldEdges"] != 0 or
            topology["zeroAreaFaces"] != 0 or
            topology["duplicateFaceTriples"] != 0):
        raise QAError("Single GLB mesh with valid, wound, closed indexed shells required")
    mesh = _mesh(model)
    result = screen_spatial_indices(mesh.vertices, mesh.faces)
    result["modelSha256"] = qa["modelSha256"]
    result["modelBytes"] = qa["modelBytes"]
    result["signedVolumeArbitraryUnitsCubed"] = qa["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    if result["indexedConnectedComponents"] != topology["componentCount"]:
        raise QAError("Indexed shell census disagrees with independent topology QA")
    return result


def write_immutable(path, report):
    path = Path(path)
    if path.is_symlink():
        raise QAError("Symlinked evidence path forbidden")
    raw = json.dumps(report, indent=2, sort_keys=True) + "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_text(encoding="utf-8") != raw:
            raise QAError("Existing evidence differs; refusing overwrite")
    else:
        path.write_text(raw, encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    args = p.parse_args()
    report = screen_glb(args.model)
    write_immutable(args.out, report)
    print("G3_12_DIFFERENT_INDEX_SPATIAL_CPU " + json.dumps({
        "modelSha": report["modelSha256"],
        "status": report["status"],
        "pairs": report["proximityPairsEnumerated"],
        "crossComponentPairs": report["acrossIndexedComponentsPairs"],
        "complete": report["completeDifferentIndexProximityCensus"],
        "printQualified": False
    }))


if __name__ == "__main__":
    try:
        main()
    except (QAError, OSError, ValueError, TypeError, MemoryError) as exc:
        print("G3_12_SPATIAL_CPU_FAILED " + type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
