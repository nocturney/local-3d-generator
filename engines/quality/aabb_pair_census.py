"""LOCAL3D G3.14: all conservative AABB-overlap candidate PAIRS, CPU only.

Independent bounding-BOX-sphere broadphase (not G3.8 triangle-centroid
sphere). Counts exact indexed-adjacency categories for *every* enumerated
AABB-overlapping face pair. Numerically screens ALL no-shared-index AABB
candidates using the established conservative floating-point SAT; exact
IEEE754-rational pair refinement is limited to flagged pairs (<=64).
This is NOT an exact whole-mesh collision-free test. All indexed-adjacent
face-pair geometric contacts remain explicitly unresolved by this module.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import sys
import time

import numpy as np
from scipy.spatial import cKDTree

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh
from triangle_contact_screen import _sat_potential_contacts
from exact_triangle_predicates import classify_selected_pairs

SCHEMA = "local3d.g3.14.exhaustive-aabb-adjacency-census.v1"
MAX_FACES = 75000
MAX_VERTICES = 100000
MAX_BROADPHASE = 2000000
MAX_AABB_PAIRS = 750000
MAX_SAT = 300000
MAX_EXACT = 64
MAX_SECONDS = 45.0
CHUNK = 128
SAT_CHUNK = 1024


def _input(vertices, faces):
    v0, f0 = np.asarray(vertices), np.asarray(faces)
    if v0.ndim != 2 or v0.shape[1] != 3 or f0.ndim != 2 or f0.shape[1] != 3:
        raise QAError("Malformed indexed 3D face arrays")
    if (not np.issubdtype(f0.dtype, np.integer) or
            np.issubdtype(f0.dtype, np.bool_)):
        raise QAError("Face IDs must be integer indices")
    if (not (3 <= len(v0) <= MAX_VERTICES) or
            not (2 <= len(f0) <= MAX_FACES)):
        raise QAError("Unsafe broadphase geometry dimensions")
    v, f = np.asarray(v0, dtype=np.float64), np.asarray(f0, dtype=np.int64)
    if not np.isfinite(v).all() or f.min() < 0 or f.max() >= len(v):
        raise QAError("Invalid indexed geometry coordinates or IDs")
    if (np.any(f[:, 0] == f[:, 1]) or np.any(f[:, 1] == f[:, 2]) or
            np.any(f[:, 0] == f[:, 2])):
        raise QAError("Repeated face vertex index")
    # Fail closed on identical indexed triangle triples.
    if np.unique(np.sort(f, axis=1), axis=0).shape[0] != len(f):
        raise QAError("Duplicated indexed face triples")
    extents = v.max(axis=0) - v.min(axis=0)
    diagonal = float(np.linalg.norm(extents))
    if not np.isfinite(diagonal) or diagonal <= 1e-12:
        raise QAError("Invalid object scale")
    tri = v[f]
    double_areas = np.linalg.norm(
        np.cross(tri[:, 1] - tri[:, 0],
                 tri[:, 2] - tri[:, 0]), axis=1)
    if np.any(~np.isfinite(double_areas)) or np.any(
            double_areas <= max(1e-20, diagonal ** 2 * 1e-15)):
        raise QAError("Geometrically degenerate face in broadphase")
    return v, f, tri, diagonal


def _result(count, diag, tol, limits, totals, *, reason=None, refinement=None):
    complete = reason is None
    if complete:
        if totals["satPotentialNonindexedPairs"] > 0:
            status = "NUMERICAL_NONINDEXED_CONTACT_CANDIDATES"
        else:
            status = "NO_NONINDEXED_SAT_CANDIDATES_WITHIN_NUMERICAL_TOLERANCE"
    else:
        status = "INDETERMINATE_BUDGET_OR_TIME"
    out = {
        "schema": SCHEMA, "status": status,
        "completeAabbOverlappingFacePairCensus": complete,
        "completeNumericalSATForNoSharedIndexPairs": complete,
        "incompleteReason": reason,
        "triangleCount": count,
        "allPossibleUnorderedFacePairs": count * (count - 1) // 2,
        "sphereBroadphaseCandidatesEnumerated": totals["spherePairs"],
        "aabbOverlappingPairs": totals["aabbPairs"],
        "indexedSharedEdgePairsWithinAabb": totals["edgePairs"],
        "indexedSharedOnlyOneVertexPairsWithinAabb": totals["vertexPairs"],
        "noSharedIndexPairsWithinAabb": totals["nonindexedPairs"],
        "noSharedIndexPairsCheckedByNumericalSAT": totals["satPairs"],
        "numericalSATPotentialNonindexedPairs": totals["satPotentialNonindexedPairs"],
        "exactFlaggedPairRefinement": refinement,
        "allIndexedAdjacentFacePairsExactGeometricClearance": False,
        "candidateAabbCompletenessScope":
            "DECODED_IEEE754_TRIANGLES_NUMERICAL_BBOX_TOLERANCE_ONLY",
        "aabbSphereEnclosureArgument":
            "ALL_BBOXES_ARE_ENCLOSED_BY_CENTER_HALF_DIAGONAL_SPHERES",
        "independentFromG38TriangleCentroidSphereBroadphase": True,
        "numericalSatIsNotAnExactProofOfNonIntersection": True,
        "ordinaryIndexedAdjacencyIsNotItselfACollisionDefect": True,
        "potentialContactsAreNotNecessarilyPenetrations": True,
        "globalSelfIntersectionFreeCertified": False,
        "wallThicknessTested": False,
        "physicalMillimeterScale": "UNKNOWN_UNCALIBRATED",
        "printQualified": False, "approvedForPrinter": False,
        "fabricationAction": "NONE", "newAiInference": False,
        "boundingBoxDiagonalArbitraryUnits": round(diag, 10),
        "aabbToleranceArbitraryUnits": float(tol),
        "aabbToleranceRelativeToDiagonal": 1e-9,
        "resourceCaps": limits,
    }
    return out


def census_all_aabb_pairs(vertices, faces, *,
                          max_broadphase=MAX_BROADPHASE,
                          max_aabb=MAX_AABB_PAIRS,
                          max_sat=MAX_SAT,
                          max_exact=MAX_EXACT,
                          max_seconds=MAX_SECONDS):
    if (not (1 <= max_broadphase <= MAX_BROADPHASE) or
            not (1 <= max_aabb <= MAX_AABB_PAIRS) or
            not (1 <= max_sat <= MAX_SAT) or
            not (1 <= max_exact <= MAX_EXACT) or
            not (0 < max_seconds <= MAX_SECONDS)):
        raise QAError("Invalid/unsafe G3.14 CPU budget")
    v, f, tri, diag = _input(vertices, faces)
    tol = max(1e-12, diag * 1e-9)
    low, high = tri.min(axis=1), tri.max(axis=1)
    # For *any* two overlapping AABBs, the distance between AABB centers
    # is bounded by sum of enclosing half-diagonal radii. For axis-wise
    # +tol AABB overlap, add sqrt(3)*tol and a finite float guard.
    centers = (low * 0.5 + high * 0.5)
    radius = np.linalg.norm((high - low) * 0.5, axis=1)
    epsilon = math.sqrt(3) * tol + np.finfo(float).eps * diag * 64
    max_radius = float(radius.max())
    tree = cKDTree(centers)
    began = time.perf_counter()
    totals = {key: 0 for key in (
        "spherePairs", "aabbPairs", "edgePairs", "vertexPairs",
        "nonindexedPairs", "satPairs", "satPotentialNonindexedPairs"
    )}
    caps = {
        "maxFaces": MAX_FACES, "maxVertices": MAX_VERTICES,
        "maxSphereBroadphasePairs": max_broadphase,
        "maxAabbPairs": max_aabb,
        "maxNumericalSatPairs": max_sat,
        "maxExactFlaggedRefinementPairs": max_exact,
        "maxSeconds": max_seconds,
    }
    flagged = []
    reason = None
    for start in range(0, len(f), CHUNK):
        if time.perf_counter() - began >= max_seconds:
            reason = "CPU_TIME_BUDGET_EXCEEDED"
            break
        stop = min(len(f), start + CHUNK)
        neighboring = tree.query_ball_point(
            centers[start:stop],
            r=radius[start:stop] + max_radius + epsilon,
            eps=0., workers=1)
        for offset, near in enumerate(neighboring):
            if time.perf_counter() - began >= max_seconds:
                reason = "CPU_TIME_BUDGET_EXCEEDED"
                break
            idx = start + offset
            cand = np.asarray(near, dtype=np.int64)
            cand = cand[cand > idx]
            totals["spherePairs"] += len(cand)
            if totals["spherePairs"] > max_broadphase:
                reason = "SPHERE_BROADPHASE_PAIR_BUDGET_EXCEEDED"
                break
            if len(cand) == 0:
                continue
            within = np.all(
                (low[idx] <= high[cand] + tol) &
                (low[cand] <= high[idx] + tol), axis=1)
            cand = cand[within]
            totals["aabbPairs"] += len(cand)
            if totals["aabbPairs"] > max_aabb:
                reason = "AABB_PAIR_BUDGET_EXCEEDED"
                break
            if len(cand) == 0:
                continue
            # Each pair counted ONCE, and each has 0, 1, or 2 shared
            # original vertex INDICES. Duplicate triples were refused.
            shared = np.isin(f[cand], f[idx]).sum(axis=1)
            if np.any(shared > 2):
                raise QAError("Undetected exact indexed duplicate face")
            totals["edgePairs"] += int(np.count_nonzero(shared == 2))
            totals["vertexPairs"] += int(np.count_nonzero(shared == 1))
            ni = cand[shared == 0]
            totals["nonindexedPairs"] += len(ni)
            if totals["satPairs"] + len(ni) > max_sat:
                reason = "NONINDEXED_SAT_PAIR_BUDGET_EXCEEDED"
                break
            for off in range(0, len(ni), SAT_CHUNK):
                j = ni[off:off + SAT_CHUNK]
                match = _sat_potential_contacts(
                    np.broadcast_to(tri[idx], (len(j), 3, 3)),
                    tri[j], tol)
                totals["satPairs"] += len(j)
                found = j[match]
                totals["satPotentialNonindexedPairs"] += len(found)
                if len(flagged) + len(found) > max_exact:
                    reason = "EXACT_FLAGGED_PAIR_BUDGET_EXCEEDED"
                    break
                flagged.extend((idx, int(x)) for x in found)
            if reason is not None:
                break
        if reason is not None:
            break
    if reason is None and time.perf_counter() - began >= max_seconds:
        reason = "CPU_TIME_BUDGET_EXCEEDED_POST_SCAN"
    if reason is not None:
        return _result(len(f), diag, tol, caps, totals, reason=reason)

    if totals["aabbPairs"] != (totals["edgePairs"] +
                               totals["vertexPairs"] +
                               totals["nonindexedPairs"]) or (
            totals["satPairs"] != totals["nonindexedPairs"]):
        raise QAError("AABB adjacency partition/census is inconsistent")
    exact = {
        "trigger": "ONLY_NUMERICAL_SAT_FLAGGED_NO_SHARED_INDEX_PAIRS",
        "selectedPairCount": len(flagged),
        "allFlaggedPairsRefined": True,
        "classificationCounts": {},
        "notGlobalAllPairExactClassification": True,
    }
    if flagged:
        remaining = max_seconds - (time.perf_counter() - began)
        if remaining <= 0:
            return _result(len(f), diag, tol, caps, totals,
                           reason="EXACT_REFINEMENT_CPU_TIME_BUDGET")
        refined = classify_selected_pairs(
            v, f, np.asarray(flagged, dtype=np.int64),
            max_pairs=max_exact,
            max_seconds=min(remaining, 15.0))
        if not refined["completeSelectedPairClassification"]:
            return _result(len(f), diag, tol, caps, totals,
                           reason="EXACT_REFINEMENT_INCOMPLETE")
        exact["classificationCounts"] = refined["classificationCounts"]
    return _result(len(f), diag, tol, caps, totals, refinement=exact)


def screen_glb(model):
    file = Path(model)
    if file.is_symlink():
        raise QAError("Symlinked GLB forbidden")
    qa = inspect_glb(file)
    topo = qa["topology"]
    if (qa["geometryObjectCount"] != 1 or
            topo["everyObjectWatertight"] is not True or
            topo["everyObjectWindingConsistent"] is not True or
            topo["boundaryEdges"] != 0 or topo["nonManifoldEdges"] != 0 or
            topo["zeroAreaFaces"] != 0 or topo["duplicateFaceTriples"] != 0):
        raise QAError("Requires one closed valid indexed-mesh GLB")
    mesh = _mesh(file)
    result = census_all_aabb_pairs(mesh.vertices, mesh.faces)
    result["modelSha256"] = qa["modelSha256"]
    result["modelBytes"] = qa["modelBytes"]
    return result


def write_immutable(out, report):
    p = Path(out)
    if p.is_symlink():
        raise QAError("Symlink evidence output forbidden")
    raw = json.dumps(report, sort_keys=True, indent=2) + "\n"
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        if p.read_text(encoding="utf-8") != raw:
            raise QAError("Refusing changed immutable report overwrite")
    else:
        p.write_text(raw, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    report = screen_glb(args.model)
    write_immutable(args.out, report)
    print("G3_14_CPU_AABB_CENSUS " + json.dumps({
        "modelSha256": report["modelSha256"],
        "status": report["status"],
        "complete": report["completeAabbOverlappingFacePairCensus"],
        "aabbPairs": report["aabbOverlappingPairs"],
        "edgePairs": report["indexedSharedEdgePairsWithinAabb"],
        "vertexPairs": report["indexedSharedOnlyOneVertexPairsWithinAabb"],
        "noIndexPairs": report["noSharedIndexPairsWithinAabb"],
        "satPotential": report["numericalSATPotentialNonindexedPairs"],
        "printQualified": False, "newInference": False,
    }))


if __name__ == "__main__":
    try:
        main()
    except (QAError, OSError, ValueError, TypeError, MemoryError) as e:
        print("G3_14_AABB_CENSUS_FAILED " +
              type(e).__name__ + ": " + str(e), file=sys.stderr)
        sys.exit(1)
