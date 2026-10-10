"""LOCAL3D G3.13: exact binary-float triangle PAIR predicates, CPU-only.

This is a narrowly reusable exact-rational *pair* classifier. It does NOT
enumerate all face pairs in a mesh, nor certify full self-intersection freedom.
Every signed determinant operates on exact Fraction representations of the
IEEE-754 coordinates already DECODED from GLB. That is not true physical CAD
precision: GLB float quantization has already occurred.

Cases: strictly transverse edge-through-triangle crossing; coplanar positive
overlap area; exact coplanar boundary-only/disjoint; definite plane-separated;
otherwise conservative unresolved/boundary. No mesh surgery, model or printer.
"""
from __future__ import annotations

from fractions import Fraction
import math
import time
import numpy as np

from geometry_qa import QAError

SCHEMA = "local3d.g3.13.exact-binary-float-triangle-pair.v1"
MAX_ABS_INPUT = 1e9
MAX_EXACT_PAIRS = 256
MAX_SECONDS = 15.0


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def signed_tetra(a, b, c, d):
    return dot(cross(sub(b, a), sub(c, a)), sub(d, a))


def cross2(a, b, c):
    return ((b[0] - a[0]) * (c[1] - a[1])
            - (b[1] - a[1]) * (c[0] - a[0]))


def _triangle(data):
    coords = np.asarray(data)
    if coords.shape != (3, 3) or not (
            np.issubdtype(coords.dtype, np.integer) or
            np.issubdtype(coords.dtype, np.floating)):
        raise QAError("Expected a finite 3x3 triangle")
    values = np.asarray(coords, dtype=np.float64)
    if not np.isfinite(values).all() or np.max(np.abs(values)) > MAX_ABS_INPUT:
        raise QAError("Invalid/nonfinite/oversized exact-predicate coordinates")
    points = tuple(tuple(Fraction.from_float(float(x)) for x in row)
                   for row in values)
    if cross(sub(points[1], points[0]), sub(points[2], points[0])) == (0, 0, 0):
        raise QAError("Exact degenerate triangle cannot be classified")
    return points


def _strict_segment_piercing(p, q, tri):
    """One exact segment pierces the STRICT interior of a separate triangle.

    Returns (strict, boundary_like). Zero signs NEVER become strict hits.
    This test is symmetric through checking all six edges in pair().
    """
    a, b, c = tri
    s0 = signed_tetra(a, b, c, p)
    s1 = signed_tetra(a, b, c, q)
    if s0 == 0 or s1 == 0:
        return False, True
    if (s0 > 0) == (s1 > 0):
        return False, False
    sides = (signed_tetra(p, q, a, b),
             signed_tetra(p, q, b, c),
             signed_tetra(p, q, c, a))
    if 0 in sides:
        return False, True
    return (all(x > 0 for x in sides) or all(x < 0 for x in sides)), False


def _clip_polygon(subject, clipper):
    """Exact convex polygon intersection in 2D rational coordinates."""
    orientation = cross2(clipper[0], clipper[1], clipper[2])
    if orientation == 0:
        raise QAError("Unexpected degenerate coplanar projection")
    orient = 1 if orientation > 0 else -1
    polygon = list(subject)
    for k in range(3):
        a, b = clipper[k], clipper[(k + 1) % 3]
        if not polygon:
            return []
        old = polygon
        polygon = []
        prev = old[-1]
        prev_signed = orient * cross2(a, b, prev)
        for current in old:
            signed = orient * cross2(a, b, current)
            inside = signed >= 0
            before_inside = prev_signed >= 0
            if inside != before_inside:
                # Cross2 is affine on this segment, so exact rational
                # intersection is prior + lambda * (current-prior).
                t = prev_signed / (prev_signed - signed)
                intersection = (
                    prev[0] + t * (current[0] - prev[0]),
                    prev[1] + t * (current[1] - prev[1]))
                polygon.append(intersection)
            if inside:
                polygon.append(current)
            prev, prev_signed = current, signed
    return polygon


def _coplanar_overlap(a, b):
    n = cross(sub(a[1], a[0]), sub(a[2], a[0]))
    drop = max(range(3), key=lambda j: abs(n[j]))
    axes = tuple(j for j in range(3) if j != drop)
    aa = [tuple(p[j] for j in axes) for p in a]
    bb = [tuple(p[j] for j in axes) for p in b]
    polygon = _clip_polygon(aa, bb)
    if not polygon:
        return "EXACT_COPLANAR_DISJOINT"
    if len(polygon) < 2:
        return "EXACT_COPLANAR_ZERO_AREA_BOUNDARY_TOUCH"
    doubled_area = abs(sum(
        polygon[i][0] * polygon[(i + 1) % len(polygon)][1] -
        polygon[i][1] * polygon[(i + 1) % len(polygon)][0]
        for i in range(len(polygon))
    ))
    if doubled_area > 0:
        return "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"
    return "EXACT_COPLANAR_ZERO_AREA_BOUNDARY_TOUCH"


def classify_pair(first, second):
    """Classify 2 standalone indexed triangle coordinate triplets, exactly."""
    a, b = _triangle(first), _triangle(second)
    # Exact signed plane side tests can prove immediate separation.
    a_side = [signed_tetra(*b, x) for x in a]
    b_side = [signed_tetra(*a, x) for x in b]
    if all(x == 0 for x in b_side) and all(x == 0 for x in a_side):
        return _coplanar_overlap(a, b)
    if (all(x > 0 for x in a_side) or all(x < 0 for x in a_side) or
            all(x > 0 for x in b_side) or all(x < 0 for x in b_side)):
        return "EXACT_STRICT_PLANE_SEPARATION"
    borderline = False
    for src, target in ((a, b), (b, a)):
        for k in range(3):
            hit, boundary = _strict_segment_piercing(src[k], src[(k+1) % 3], target)
            if hit:
                return "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE"
            borderline |= boundary
    if borderline:
        return "UNRESOLVED_EXACT_BOUNDARY_OR_PARTIAL_COINCIDENCE"
    # No strict noncoplanar piercing is found. Exact predicate on THIS pair
    # detects no strict interior crossing, but boundary/overlap semantics
    # of all possible 3D cases are not certified here.
    return "NO_STRICT_TRANSVERSE_PIERCE_DETECTED_FOR_THIS_PAIR"


def classify_selected_pairs(v, f, selected_pairs, *, max_pairs=MAX_EXACT_PAIRS,
                            max_seconds=MAX_SECONDS):
    """Explicit, bounded chosen face pair list. NOT a global mesh census."""
    vertices = np.asarray(v, dtype=np.float64)
    faces = np.asarray(f)
    pairs = np.asarray(selected_pairs)
    if (vertices.ndim != 2 or vertices.shape[1] != 3 or
            faces.ndim != 2 or faces.shape[1] != 3 or
            pairs.ndim != 2 or pairs.shape[1] != 2):
        raise QAError("Malformed pair-classifier array shapes")
    if (not np.issubdtype(faces.dtype, np.integer) or
            not np.issubdtype(pairs.dtype, np.integer) or
            np.issubdtype(faces.dtype, np.bool_) or
            np.issubdtype(pairs.dtype, np.bool_)):
        raise QAError("Face IDs and candidate pairs must be integers")
    if (len(pairs) < 1 or len(pairs) > max_pairs or
            max_pairs > MAX_EXACT_PAIRS or
            not (0 < max_seconds <= MAX_SECONDS)):
        raise QAError("Unsafe exact predicate pair/time limits")
    if (len(vertices) < 3 or len(vertices) > 100000 or
            len(faces) < 2 or len(faces) > 75000 or
            not np.isfinite(vertices).all() or
            faces.min() < 0 or faces.max() >= len(vertices) or
            pairs.min() < 0 or pairs.max() >= len(faces) or
            np.any(pairs[:, 0] == pairs[:, 1]) or
            np.any(pairs[:, 0] > pairs[:, 1])):
        raise QAError("Invalid exact triangle pair references")
    begin = time.perf_counter()
    statuses = {}
    private_examples = {}
    processed = 0
    for i, j in pairs:
        if time.perf_counter() - begin >= max_seconds:
            return _report("INDETERMINATE_CPU_TIME_BUDGET", processed, len(pairs),
                           statuses, private_examples, False)
        label = classify_pair(vertices[faces[i]], vertices[faces[j]])
        statuses[label] = statuses.get(label, 0) + 1
        private_examples.setdefault(label, [])
        if len(private_examples[label]) < 3:
            private_examples[label].append([int(i), int(j)])
        processed += 1
    return _report("SELECTED_PAIRS_EXACTLY_CLASSIFIED_NOT_GLOBAL_SCAN",
                   processed, len(pairs), statuses, private_examples, True)


def _report(status, processed, chosen, summary, examples, complete):
    return {
        "schema": SCHEMA, "status": status,
        "selectedPairCount": chosen,
        "selectedPairsClassified": processed,
        "completeSelectedPairClassification": complete,
        "classificationCounts": summary,
        "privateExampleFacePairs": examples,
        "exactnessScope": "IEEE754_GLTF_DECODED_COORDINATES_FOR_THESE_EXPLICIT_PAIRS",
        "notAnExhaustiveMeshPairEnumeration": True,
        "notPhysicallyCalibratedMillimeters": True,
        "globalSelfIntersectionFreeCertified": False,
        "approvedForPrinter": False,
        "printQualified": False,
        "fabricationAction": "NONE",
        "newAiInference": False
    }
