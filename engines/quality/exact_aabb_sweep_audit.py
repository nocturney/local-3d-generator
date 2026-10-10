"""LOCAL3D G3.18 — independent exact-axis AABB sweep vs G3.17 numeric KD-tree.

The sorted-X sweep never queries cKDTree. For already decoded IEEE-754
coordinates, all min/max endpoints are themselves exactly representable
as rational binary floats. For every X-range pair, outward-rounded vector
Y/Z prefilters only REJECT provably out-of-range pairs; final inclusion
uses Fraction exact comparisons with the declared (also binary-float)
AABB margin. Zero-margin strict AABB is checked separately.

The resulting EXACT tolerance/strict no-index candidate sets are checked
against the separately implemented G3.17 bounded KDTree AABB pair list.
Any missed exact AABB candidate => INDETERMINATE, no clearance.
No model inference, GPU, network, repair, printer or print certification.
"""
from __future__ import annotations

from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import time

import numpy as np

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh
from aabb_pair_census import _input
from exact_nonindexed_contact import _candidate_pairs

SCHEMA="local3d.g3.18.exact-3d-aabb-sorted-x-sweep-v1"
MAX_FACES=75000
MAX_VERTICES=100000
MAX_X_PAIRS=30000000
MAX_EXACT_BOX_PAIRS=750000
MAX_NOINDEX_PAIRS=300000
MAX_SECONDS=105.0
MAX_COORD_ABS=1e9


def _f(row):
    return tuple(Fraction.from_float(float(x)) for x in row)


def audit_exact_aabb_sweep(vertices,faces, *,
                           max_x_pairs=MAX_X_PAIRS,
                           max_exact_boxes=MAX_EXACT_BOX_PAIRS,
                           max_noindex=MAX_NOINDEX_PAIRS,
                           max_seconds=MAX_SECONDS):
    if (not (1<=max_x_pairs<=MAX_X_PAIRS) or
            not (1<=max_exact_boxes<=MAX_EXACT_BOX_PAIRS) or
            not (1<=max_noindex<=MAX_NOINDEX_PAIRS) or
            not (0<max_seconds<=MAX_SECONDS)):
        raise QAError("G3.18 unsafe exact sweep budget")
    # Shared validation with G3.14 but INDEPENDENT spatial enumeration.
    v,f,tri,diagonal=_input(vertices,faces)
    if np.max(np.abs(v))>MAX_COORD_ABS:
        raise QAError("G3.18 oversized coordinate refused")
    begin=time.perf_counter()
    tol=max(1e-12,diagonal*1e-9)
    tol_exact=Fraction.from_float(float(tol))
    lo=np.min(tri,axis=1)
    hi=np.max(tri,axis=1)
    n=len(f)
    sort_order=np.argsort(lo[:,0],kind="stable")
    sorted_left=lo[sort_order,0]
    sorted_right=hi[sort_order,0]
    # IEEE-754 addition correctly rounds to nearest, so a + b cannot
    # exceed nextafter(fl(a+b), +inf) for finite floats a,b.
    sorted_max=np.nextafter(sorted_right+tol, np.inf)
    next_index=np.searchsorted(sorted_left,sorted_max,side="right")
    x_pos=np.arange(n,dtype=np.int64)
    x_count=int(np.maximum(0,next_index-x_pos-1).sum(dtype=np.int64))
    counts={"xOnlyConservativePairs":x_count,
            "exactTolerancedBoxPairs":0,"exactStrictBoxPairs":0,
            "toleranceSharedEdge":0,"toleranceOneVertex":0,
            "toleranceNoSharedIndex":0,
            "strictSharedEdge":0,"strictOneVertex":0,"strictNoSharedIndex":0}
    exact_zero_ids=set()
    strict_zero_ids=set()
    reason="X_AXIS_PAIR_BUDGET" if x_count>max_x_pairs else None
    if reason is None and time.perf_counter()-begin>=max_seconds:
        reason="CPU_TIME_BUDGET_AFTER_X_SORT"

    def result(why,num=None):
        num=num or {"numericAabbPairs":None,"numericNoindexPairs":None,
                    "numericMissingExactToleranceNoindex":None,
                    "numericMissingStrictNoindex":None,
                    "numericExtraOnlyToleranceNoindex":None,
                    "exactNoindexPairIdsEqualNumerical":False}
        match=(why is None and
               num["numericMissingExactToleranceNoindex"]==0 and
               num["numericMissingStrictNoindex"]==0)
        return {
            "schema":SCHEMA,
            "status":("INDETERMINATE_SPATIAL_OR_CPU_BUDGET" if why
                      else "INDEPENDENT_EXACT_AABB_COVERAGE_CROSSCHECK_PASS"),
            "incompleteReason":why,
            "faceCount":n,
            "vertexCount":len(v),
            "exactAxisComparisonOnAlreadyDecodedBinaryFloatXYZ":True,
            "fixedMarginBinaryFloatRational":True,
            "marginArbitraryGLBUnits":float(tol),
            "xSortedSweepIndependentOfKDTree":True,
            "outwardRoundedNumericAxisPrefilterHasExactRationalFinalTest":True,
            "numericalKDTreeStageReadOnlyRecomputedForMembershipCheck":True,
            "allStrictAabbOverlapPairsMathematicallyCoveredForDecodedFiniteXYZ":
                match and counts["exactStrictBoxPairs"]<=counts["exactTolerancedBoxPairs"],
            "allExactToleranceNoindexPairsAccountedForByG317NumericalStage":match,
            "completeIndependentExactAabbAndNumericalCrosscheck":match,
            "sweep":counts,
            "comparison":num,
            "scope":"CANDIDATE_AABB_COVERAGE_FOR_ALREADY_DECODED_IEEE754_GLTF_TRIANGLES",
            "notEvidenceOfOriginalCADGeometricPrecision":True,
            "globalSelfIntersectionFreeCertified":False,
            "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
            "wallThickness":"NOT_TESTED",
            "printQualified":False,
            "approvedForPrinter":False,
            "fabricationAction":"NONE",
            "newAiInference":False,
            "resourceCaps":{
                "maxVertices":MAX_VERTICES,"maxFaces":MAX_FACES,
                "maxXAxisPairs":max_x_pairs,"maxExactAabbPairs":max_exact_boxes,
                "maxZeroIndexExactPairs":max_noindex,"maxSeconds":max_seconds,
            },
        }
    if reason is not None:
        return result(reason)
    float_lo=tuple(_f(row) for row in lo)
    float_hi=tuple(_f(row) for row in hi)
    for position,idx in enumerate(sort_order):
        if position%64==0 and time.perf_counter()-begin>=max_seconds:
            return result("CPU_TIME_BUDGET_EXACT_SWEEP")
        i=int(idx)
        stop=int(next_index[position])
        if stop<=position+1:
            continue
        js=sort_order[position+1:stop]
        # Both axis comparisons are conservatively rounded OUTWARDS:
        # false positives allowed, exact rational final check below.
        y=(
          (lo[i,1]<=np.nextafter(hi[js,1]+tol,np.inf)) &
          (lo[js,1]<=np.nextafter(hi[i,1]+tol,np.inf))
        )
        z=(
          (lo[i,2]<=np.nextafter(hi[js,2]+tol,np.inf)) &
          (lo[js,2]<=np.nextafter(hi[i,2]+tol,np.inf))
        )
        js=js[y&z]
        fa=set(map(int,f[i]))
        al,ah=float_lo[i],float_hi[i]
        for j0 in js:
            j=int(j0)
            bl,bh=float_lo[j],float_hi[j]
            if not all(al[k]<=bh[k]+tol_exact and
                       bl[k]<=ah[k]+tol_exact for k in range(3)):
                continue
            counts["exactTolerancedBoxPairs"]+=1
            if counts["exactTolerancedBoxPairs"]>max_exact_boxes:
                return result("EXACT_AABB_PAIR_BUDGET")
            shared=len(fa & set(map(int,f[j])))
            if shared>2:
                raise QAError("Duplicate-indexed triangle slipped validation")
            name=("SharedEdge" if shared==2 else
                  "OneVertex" if shared==1 else "NoSharedIndex")
            counts["tolerance"+name]+=1
            canonical_a=min(i,j)
            canonical_b=max(i,j)
            encoded=canonical_a*n+canonical_b
            if shared==0:
                exact_zero_ids.add(encoded)
                if len(exact_zero_ids)>max_noindex:
                    return result("EXACT_NO_INDEX_PAIR_BUDGET")
            if all(al[k]<=bh[k] and bl[k]<=ah[k] for k in range(3)):
                counts["exactStrictBoxPairs"]+=1
                counts["strict"+name]+=1
                if shared==0:
                    strict_zero_ids.add(encoded)
    if counts["exactTolerancedBoxPairs"]!=sum(counts["tolerance"+k]
                       for k in ("SharedEdge","OneVertex","NoSharedIndex")):
        raise QAError("G3.18 exact 0/1/2 AABB tally invariant failed")
    if counts["exactStrictBoxPairs"]!=sum(counts["strict"+k]
                       for k in ("SharedEdge","OneVertex","NoSharedIndex")):
        raise QAError("G3.18 strict 0/1/2 AABB tally invariant failed")
    if time.perf_counter()-begin>=max_seconds:
        return result("CPU_TIME_BUDGET_BEFORE_NUMERIC_CROSSCHECK")
    numeric, ncounters, nreason, _ = _candidate_pairs(
        v,f,tri,diagonal,max_sphere=2000000,
        max_aabb=750000,max_noindex=300000,
        deadline_started=begin,max_seconds=max_seconds)
    if nreason is not None:
        return result("NUMERIC_G317_"+nreason)
    numerical_ids={int(i)*n+int(j) for i,j in numeric}
    if len(numerical_ids)!=len(numeric):
        raise QAError("G3.17 duplicate no-index candidate pair")
    omitted=exact_zero_ids-numerical_ids
    omitted_strict=strict_zero_ids-numerical_ids
    extra=numerical_ids-exact_zero_ids
    compare={
        "numericAabbPairs":ncounters["aabbPairs"],
        "numericIndexedEdgePairs":ncounters["sharedEdgePairs"],
        "numericIndexedVertexPairs":ncounters["oneVertexPairs"],
        "numericNoindexPairs":len(numerical_ids),
        "numericMissingExactToleranceNoindex":len(omitted),
        "numericMissingStrictNoindex":len(omitted_strict),
        "numericExtraOnlyToleranceNoindex":len(extra),
        "exactNoindexPairIdsEqualNumerical":not omitted and not extra,
    }
    why=("MISSING_EXACT_TOLERANCE_NOINDEX_IN_G317" if omitted else
         "MISSING_EXACT_STRICT_NOINDEX_IN_G317" if omitted_strict else
         None)
    if time.perf_counter()-begin>=max_seconds:
        why="CPU_TIME_BUDGET_AFTER_COMPARISON"
    return result(why,compare)


def screen_glb(path):
    model=Path(path)
    if model.is_symlink():
        raise QAError("G3.18 symlinked GLB refused")
    qa=inspect_glb(model)
    topo=qa["topology"]
    if (qa["geometryObjectCount"]!=1 or topo["componentCount"]!=1 or
            topo["everyObjectWatertight"] is not True or
            topo["everyObjectWindingConsistent"] is not True or
            topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or
            topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0):
        raise QAError("G3.18 only SHA/rights preverified closed connected GLB")
    mesh=_mesh(model)
    out=audit_exact_aabb_sweep(mesh.vertices,mesh.faces)
    out["modelSha256"]=qa["modelSha256"]
    out["modelBytes"]=qa["modelBytes"]
    return out


def write_immutable(path,data):
    target=Path(path)
    if target.is_symlink():
        raise QAError("G3.18 symlinked evidence refused")
    raw=json.dumps(data,sort_keys=True,indent=2)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=raw:
            raise QAError("G3.18 immutable evidence cannot be replaced")
    else:
        target.write_text(raw,encoding="utf-8")
