"""LOCAL3D G3.16: exact rational EXTRA contact for ALL indexed vertex-only face pairs.

The two nondegenerate triangles have EXACTLY ONE original indexed vertex V
in common. Their intersection contains V, which alone is not a defect.

Noncoplanar support planes meet on a line through V. Each triangular
half-plane section is either {V} or a finite ray segment from V. Test
EXACT signed endpoints and ray directions; same nonzero ray sign for both
means an additional positive-length intersection, otherwise V only.

Coplanar faces use exact rational polygon clipping. Positive-area overlap
and zero-area positive-length edge contact beyond V are separate from
ordinary vertex-only touching.

All conclusions apply ONLY to coordinates already decoded from GLB's
IEEE754 representation, not ideal CAD/mm-scale physical surfaces.
No printing, model generation, CUDA/GPU or untrusted-input clearance.
"""
from __future__ import annotations

import argparse
from fractions import Fraction
import json
from pathlib import Path
import sys
import time

import numpy as np

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh
from exact_triangle_predicates import sub, cross, dot, cross2, _clip_polygon

SCHEMA = "local3d.g3.16.exact-indexed-vertex-only-contacts.v1"
MAX_VERTICES = 100000
MAX_FACES = 75000
MAX_INCIDENT_PAIR_VISITS = 1000000
MAX_VERTEX_ONLY_PAIRS = 280000
MAX_SECONDS = 90.0
MAX_COORD_ABS = 1e9


def _sign(v):
    return (v > 0) - (v < 0)


def _nonzero_section_ray_sign(edge1, edge2, support_normal, direction):
    """Sign of the triangle's nonzero section ray against OTHER plane.

    If the plane through shared point V misses triangular cone except at V,
    returns 0. Otherwise intersection is [V, P], and sign of d·(P-V) is
    returned, with no floating-point or rational division.
    """
    h1 = dot(support_normal, edge1)
    h2 = dot(support_normal, edge2)
    if h1 == 0 and h2 == 0:
        raise QAError("Inconsistent G3.16 noncoplanar plane section")
    if h1 == 0:
        s = _sign(dot(direction, edge1))
    elif h2 == 0:
        s = _sign(dot(direction, edge2))
    elif _sign(h1) == _sign(h2):
        return 0
    else:
        # P = (h1*edge2 - h2*edge1)/(h1-h2).
        numerator = tuple(h1*y - h2*x for x, y in zip(edge1, edge2))
        s = _sign(dot(direction, numerator)) * _sign(h1-h2)
    if s == 0:
        raise QAError("G3.16 unexpected zero nonzero section ray")
    return s


def _coplanar_vertex_contacts(a, b, na):
    """Classify finite convex polygon intersection in exact 2D projection."""
    drop = max(range(3), key=lambda j: abs(na[j]))
    axes = tuple(j for j in range(3) if j != drop)
    aa = [tuple(pt[k] for k in axes) for pt in a]
    bb = [tuple(pt[k] for k in axes) for pt in b]
    polygon = _clip_polygon(aa, bb)
    if not polygon:
        return "EXACT_VERTEX_ONLY_CONTACT"
    signed_double_area = sum(
        polygon[i][0] * polygon[(i + 1) % len(polygon)][1] -
        polygon[i][1] * polygon[(i + 1) % len(polygon)][0]
        for i in range(len(polygon)))
    if signed_double_area != 0:
        return "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"
    if len(set(polygon)) >= 2:
        return "EXACT_COPLANAR_POSITIVE_LENGTH_EDGE_CONTACT"
    return "EXACT_VERTEX_ONLY_CONTACT"


def _classify_one(points, faces, normals, a, b, shared_index):
    fa, fb = faces[a], faces[b]
    oa = [int(x) for x in fa if x != shared_index]
    ob = [int(x) for x in fb if x != shared_index]
    if len(oa) != 2 or len(ob) != 2:
        raise QAError("G3.16 pair missing exact single shared original vertex")
    origin = points[shared_index]
    aa = tuple(points[int(x)] for x in fa)
    bb = tuple(points[int(x)] for x in fb)
    na, nb = normals[a], normals[b]
    direction = cross(na, nb)
    if direction == (0, 0, 0):
        # Both valid planes contain origin; parallel => identical plane.
        return _coplanar_vertex_contacts(aa, bb, na)
    ea1, ea2 = sub(points[oa[0]], origin), sub(points[oa[1]], origin)
    eb1, eb2 = sub(points[ob[0]], origin), sub(points[ob[1]], origin)
    raya = _nonzero_section_ray_sign(ea1, ea2, nb, direction)
    if raya == 0:
        return "EXACT_VERTEX_ONLY_CONTACT"
    rayb = _nonzero_section_ray_sign(eb1, eb2, na, direction)
    if rayb != 0 and raya == rayb:
        return "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION"
    return "EXACT_VERTEX_ONLY_CONTACT"


def _enumerate_vertex_only_pairs(f, vertex_count, visit_limit, pair_limit):
    """Topology-complete by original index incidence, independent of G3.14.

    A pair sharing exactly one index is generated once, from that shared
    index's incident-face list. A shared-edge pair is visited twice but
    excluded both times. Duplicate face triples are already rejected.
    """
    incident = [[] for _ in range(vertex_count)]
    for i, face in enumerate(f):
        for vertex in face:
            incident[int(vertex)].append(i)
    upper = sum(len(rows)*(len(rows)-1)//2 for rows in incident)
    if upper > visit_limit:
        return None, upper, "INCIDENCE_VISIT_BUDGET_EXCEEDED"
    pairs = []
    for vertex, rows in enumerate(incident):
        for at in range(len(rows)):
            i = rows[at]
            first = f[i]
            for j in rows[at + 1:]:
                # There is already one known common vertex. Exclude full
                # shared EDGE with an additional indexed vertex.
                if (first[0] in f[j] and first[0] != vertex or
                        first[1] in f[j] and first[1] != vertex or
                        first[2] in f[j] and first[2] != vertex):
                    continue
                pairs.append((i, j, vertex))
                if len(pairs) > pair_limit:
                    return None, upper, "VERTEX_ONLY_PAIR_BUDGET_EXCEEDED"
    return pairs, upper, None


def exact_vertex_only_census(vertices, faces, *,
                             max_incident_pair_visits=MAX_INCIDENT_PAIR_VISITS,
                             max_vertex_only_pairs=MAX_VERTEX_ONLY_PAIRS,
                             max_seconds=MAX_SECONDS):
    if (not (1 <= max_incident_pair_visits <= MAX_INCIDENT_PAIR_VISITS)
            or not (1 <= max_vertex_only_pairs <= MAX_VERTEX_ONLY_PAIRS)
            or not (0 < max_seconds <= MAX_SECONDS)):
        raise QAError("Invalid/unsafe G3.16 CPU resource budgets")
    v0, f0 = np.asarray(vertices), np.asarray(faces)
    if (v0.ndim != 2 or v0.shape[1] != 3 or
            f0.ndim != 2 or f0.shape[1] != 3 or
            not np.issubdtype(v0.dtype, np.number) or
            np.issubdtype(v0.dtype, np.bool_) or
            not np.issubdtype(f0.dtype, np.integer) or
            np.issubdtype(f0.dtype, np.bool_) or
            not (4 <= len(v0) <= MAX_VERTICES) or
            not (2 <= len(f0) <= MAX_FACES)):
        raise QAError("G3.16 invalid bounded triangle/index inputs")
    v = np.asarray(v0, dtype=np.float64)
    f = np.asarray(f0, dtype=np.int64)
    if (not np.isfinite(v).all() or
            np.max(np.abs(v)) > MAX_COORD_ABS or
            f.min() < 0 or f.max() >= len(v)):
        raise QAError("G3.16 nonfinite/out-of-bounds coordinate/index")
    if (np.any(f[:,0] == f[:,1]) or
            np.any(f[:,1] == f[:,2]) or
            np.any(f[:,0] == f[:,2]) or
            np.unique(np.sort(f, axis=1), axis=0).shape[0] != len(f)):
        raise QAError("G3.16 duplicate/degenerate indexed face")
    diagonal = float(np.linalg.norm(v.max(axis=0)-v.min(axis=0)))
    if not np.isfinite(diagonal) or diagonal <= 1e-12:
        raise QAError("G3.16 invalid numeric model scale")
    xyz = v[f]
    double_area = np.linalg.norm(np.cross(xyz[:,1]-xyz[:,0],
                                          xyz[:,2]-xyz[:,0]), axis=1)
    if np.any(~np.isfinite(double_area)) or np.any(
            double_area <= max(1e-20, diagonal*diagonal*1e-15)):
        raise QAError("G3.16 numerically degenerate triangle input")

    started = time.perf_counter()
    pairs, incidence_upper, reason = _enumerate_vertex_only_pairs(
        f, len(v), max_incident_pair_visits, max_vertex_only_pairs)
    base = {
        "schema": SCHEMA,
        "triangleCount": int(len(f)),
        "vertexCount": int(len(v)),
        "totalPerVertexIncidentFacePairVisitsUpperBound": int(incidence_upper),
        "enumerationIndependentOfG314BoundingBoxBroadphase": True,
        "allVertexOnlyPairsFromOriginalIndexedIncidenceEnumerated": reason is None,
        "totalUniqueIndexedVertexOnlyFacePairs": 0 if pairs is None else len(pairs),
        "pairsExaminedByExactRationalGeometry": 0,
        "classificationCounts": {},
        "privateExampleIndexedFacePairs": {},
        "exactnessScope": "IEEE754_DECODED_GLTF_ORIGINAL_INDEXED_VERTEX_ONLY_PAIRS",
        "allExactGeometryConclusionsApplyOnlyToDigitalDecodedCoordinates": True,
        "positiveLengthExtraContactIsNotAutomaticallyAManufacturingDefect": True,
        "originalCADCoordinatePrecisionPreserved": False,
        "indexedSharedEdgePairsNotExaminedHere": True,
        "zeroSharedIndexPairContactsNotExaminedHere": True,
        "globalSelfIntersectionFreeCertified": False,
        "physicalMillimeterScale": "UNKNOWN_UNCALIBRATED",
        "wallThickness": "NOT_TESTED",
        "printQualified": False,
        "approvedForPrinter": False,
        "fabricationAction": "NONE",
        "newAiInference": False,
        "resourceCaps": {
            "maxVertices": MAX_VERTICES, "maxFaces": MAX_FACES,
            "maxIncidencePairVisits": max_incident_pair_visits,
            "maxIndexedVertexOnlyPairs": max_vertex_only_pairs,
            "maxSeconds": max_seconds,
        },
    }
    def final(why):
        complete = why is None
        totals = base["classificationCounts"]
        flagged = sum(totals.get(x, 0) for x in (
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION",
            "EXACT_COPLANAR_POSITIVE_LENGTH_EDGE_CONTACT",
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"))
        base.update({
            "status": (
                "INDETERMINATE_CPU_BUDGET" if not complete else
                "EXACT_VERTEX_ONLY_EXTRA_CONTACT_DETECTED" if flagged else
                "ALL_INDEXED_VERTEX_ONLY_PAIRS_EXACT_VERTEX_CONTACT_ONLY"),
            "completeVertexOnlyExactContactCensus": complete,
            "incompleteReason": why,
            "exactExtraContactBeyondSharedVertexPairCount": flagged,
        })
        return base

    if reason is not None:
        return final(reason)
    if time.perf_counter() - started >= max_seconds:
        return final("CPU_TIME_BUDGET_EXCEEDED_PRECOMPUTE")

    # Compute Fraction normals once per triangle. Pairwise comparisons
    # thereafter are pure exact sign arithmetic, never floating SAT.
    points = [tuple(Fraction.from_float(float(x)) for x in row) for row in v]
    normals = []
    for face in f:
        a, b, c = (points[int(face[0])], points[int(face[1])],
                   points[int(face[2])])
        n = cross(sub(b,a), sub(c,a))
        if n == (0,0,0):
            raise QAError("G3.16 EXACT degenerate triangle")
        normals.append(n)
    counts = base["classificationCounts"]
    examples = base["privateExampleIndexedFacePairs"]
    for k, (i, j, common) in enumerate(pairs):
        if k % 128 == 0 and time.perf_counter() - started >= max_seconds:
            return final("EXACT_RATIONAL_CPU_TIME_BUDGET_EXCEEDED")
        label = _classify_one(points, f, normals, i, j, common)
        counts[label] = counts.get(label, 0) + 1
        if label != "EXACT_VERTEX_ONLY_CONTACT":
            examples.setdefault(label, [])
            if len(examples[label]) < 5:
                examples[label].append([int(i), int(j)])
        base["pairsExaminedByExactRationalGeometry"] += 1
    if time.perf_counter() - started >= max_seconds:
        return final("CPU_TIME_BUDGET_EXCEEDED_POST_SCAN")
    if base["pairsExaminedByExactRationalGeometry"] != len(pairs):
        raise QAError("G3.16 topology count / exact predicate mismatch")
    return final(None)


def screen_glb(source):
    path = Path(source)
    if path.is_symlink():
        raise QAError("G3.16 symlink GLB refused")
    qa = inspect_glb(path)
    t = qa["topology"]
    if (qa["geometryObjectCount"] != 1 or t["componentCount"] != 1 or
            t["everyObjectWatertight"] is not True or
            t["everyObjectWindingConsistent"] is not True or
            t["boundaryEdges"] != 0 or t["nonManifoldEdges"] != 0 or
            t["zeroAreaFaces"] != 0 or t["duplicateFaceTriples"] != 0):
        raise QAError("G3.16 requires one valid closed indexed connected GLB")
    mesh = _mesh(path)
    result = exact_vertex_only_census(mesh.vertices, mesh.faces)
    result["modelSha256"] = qa["modelSha256"]
    result["modelBytes"] = qa["modelBytes"]
    return result


def immutable_write(path, report):
    dest = Path(path)
    if dest.is_symlink():
        raise QAError("G3.16 symlinked evidence refused")
    raw = json.dumps(report, sort_keys=True, indent=2) + "\n"
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        if dest.read_text(encoding="utf-8") != raw:
            raise QAError("G3.16 immutable evidence diverged; refusing overwrite")
    else:
        dest.write_text(raw, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    report = screen_glb(args.model)
    immutable_write(args.out, report)
    print("G3_16_EXACT_VERTEX_ONLY_CPU " + json.dumps({
        "sourceSha256": report["modelSha256"],
        "pairs": report["totalUniqueIndexedVertexOnlyFacePairs"],
        "examined": report["pairsExaminedByExactRationalGeometry"],
        "flaggedExtraContacts": report["exactExtraContactBeyondSharedVertexPairCount"],
        "complete": report["completeVertexOnlyExactContactCensus"],
        "printQualified": False,
    }))


if __name__ == "__main__":
    try:
        main()
    except (QAError, OSError, ValueError, TypeError, MemoryError) as e:
        print("G3_16_EXACT_VERTEX_CPU_FAILED " +
              type(e).__name__ + ": " + str(e), file=sys.stderr)
        sys.exit(1)
