"""LOCAL3D G3.17: exact contact classification for ALL no-shared-INDEX AABB pairs.

G3.14-style independent, conservative NUMERICAL bounding-BOX-sphere
broadphase enumerates ALL AABB candidate unordered face pairs, regardless
of indexed adjacency. Every ZERO-shared-INDEX AABB candidate then receives
an EXACT rational plane/triangle intersection classifier:
  disjoint; single point; positive-length 3D line segment;
  coplanar positive-length boundary segment; coplanar positive-area overlap.

Exactness is for the SELECTED digital already-decoded IEEE754 GLB triangles.
The broadphase uses declared floating 3D AABB tolerance, so this is NOT
a formal universal global mesh self-intersection or print certificate.
Never launches a model, GPU, network request or printer.
"""
from __future__ import annotations

from fractions import Fraction
import json
import math
from pathlib import Path
import sys
import time

import numpy as np
from scipy.spatial import cKDTree

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh
from aabb_pair_census import _input
from exact_triangle_predicates import (
    sub, cross, dot, _clip_polygon,
)

SCHEMA="local3d.g3.17.exact-all-no-shared-index-aabb-candidates.v1"
MAX_VERTICES=100000
MAX_FACES=75000
MAX_SPHERE_CANDIDATES=2000000
MAX_AABB_PAIRS=750000
MAX_NOINDEX_PAIRS=300000
MAX_SECONDS=120.0
MAX_ABS_COORD=1e9
CHUNK=128


def _plane_triangle_section(tri, plane_origin, plane_normal):
    """Exact polygon triangle intersection with a distinct support plane.

    For noncoplanar triangle/plane, returns 0, 1, or 2 unique exact
    points. Up to two points delimit a segment. Never extrapolates beyond
    triangle edges.
    """
    h=[dot(plane_normal,sub(pt,plane_origin)) for pt in tri]
    if all(x==0 for x in h):
        raise QAError("G3.17 unexpected coplanar section of noncoplanar supports")
    points=set(pt for pt,signed in zip(tri,h) if signed==0)
    for i in range(3):
        j=(i+1)%3
        if (h[i]>0 and h[j]<0) or (h[i]<0 and h[j]>0):
            den=h[j]-h[i]
            hit=tuple((h[j]*tri[i][k]-h[i]*tri[j][k])/den
                      for k in range(3))
            points.add(hit)
    if len(points)>2:
        raise QAError("G3.17 impossible >2 exact plane-section endpoints")
    return tuple(points)


def _coplanar_polygon_class(a,b,n):
    drop=max(range(3),key=lambda axis:abs(n[axis]))
    keep=tuple(axis for axis in range(3) if axis!=drop)
    aa=[tuple(pt[axis] for axis in keep) for pt in a]
    bb=[tuple(pt[axis] for axis in keep) for pt in b]
    poly=_clip_polygon(aa,bb)
    if not poly:
        return "EXACT_DISJOINT"
    twice_area=sum(poly[k][0]*poly[(k+1)%len(poly)][1]-
                   poly[k][1]*poly[(k+1)%len(poly)][0]
                   for k in range(len(poly)))
    if twice_area!=0:
        return "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"
    if len(set(poly))>=2:
        return "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT"
    return "EXACT_SINGLE_POINT_BOUNDARY_CONTACT"


def _exact_two_triangles(a,b,na,nb):
    line=cross(na,nb)
    if line==(0,0,0):
        if dot(na,sub(b[0],a[0]))!=0:
            return "EXACT_DISJOINT"
        return _coplanar_polygon_class(a,b,na)
    first=_plane_triangle_section(a,b[0],nb)
    if not first:
        return "EXACT_DISJOINT"
    second=_plane_triangle_section(b,a[0],na)
    if not second:
        return "EXACT_DISJOINT"
    x=[dot(line,point) for point in first]
    y=[dot(line,point) for point in second]
    left=max(min(x),min(y))
    right=min(max(x),max(y))
    if left>right:
        return "EXACT_DISJOINT"
    if left==right:
        return "EXACT_SINGLE_POINT_BOUNDARY_CONTACT"
    return "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION"


def classify_two_exact(first,second):
    """Standalone exact classification of nondegenerate triangle coordinates."""
    from exact_triangle_predicates import _triangle
    a=_triangle(first)
    b=_triangle(second)
    na=cross(sub(a[1],a[0]),sub(a[2],a[0]))
    nb=cross(sub(b[1],b[0]),sub(b[2],b[0]))
    return _exact_two_triangles(a,b,na,nb)


def _candidate_pairs(v,f,tri,diag,*,max_sphere,max_aabb,max_noindex,
                     deadline_started,max_seconds):
    """Conservatively enumerate no-SHARED-INDEX AABB candidate pairs.

    This is a separate implementation consuming the same input face array
    but NOT modifying or relying on G3.14's count-only implementation.
    Audit must confirm its indexed 0/1/2 partition vs prior G3.14 proof.
    """
    tol=max(1e-12,diag*1e-9)
    lo,hi=tri.min(axis=1),tri.max(axis=1)
    centers=(lo*.5+hi*.5)
    rad=np.linalg.norm((hi-lo)*.5,axis=1)
    guard=math.sqrt(3)*tol+np.finfo(float).eps*diag*64
    tree=cKDTree(centers)
    maximum=float(rad.max())
    counters={"spherePairs":0,"aabbPairs":0,"sharedEdgePairs":0,
              "oneVertexPairs":0,"noIndexPairs":0}
    candidate=[]
    reason=None
    for start in range(0,len(f),CHUNK):
        if time.perf_counter()-deadline_started>=max_seconds:
            reason="CPU_TIME_BUDGET_BROADPHASE"
            break
        stop=min(len(f),start+CHUNK)
        neighbors=tree.query_ball_point(
            centers[start:stop],
            r=rad[start:stop]+maximum+guard,
            eps=0.,workers=1)
        for offset,neighborhood in enumerate(neighbors):
            if time.perf_counter()-deadline_started>=max_seconds:
                reason="CPU_TIME_BUDGET_BROADPHASE"
                break
            i=start+offset
            js=np.asarray(neighborhood,dtype=np.int64)
            js=js[js>i]
            counters["spherePairs"]+=len(js)
            if counters["spherePairs"]>max_sphere:
                reason="SPHERE_PAIR_CAP"
                break
            if not len(js):
                continue
            box_ok=np.all((lo[i]<=hi[js]+tol) &
                          (lo[js]<=hi[i]+tol),axis=1)
            js=js[box_ok]
            counters["aabbPairs"]+=len(js)
            if counters["aabbPairs"]>max_aabb:
                reason="AABB_PAIR_CAP"
                break
            if not len(js):
                continue
            common=np.isin(f[js],f[i]).sum(axis=1)
            if np.any(common>2):
                raise QAError("G3.17 unexpected exact duplicate indexed face")
            counters["sharedEdgePairs"]+=int(np.count_nonzero(common==2))
            counters["oneVertexPairs"]+=int(np.count_nonzero(common==1))
            selected=js[common==0]
            counters["noIndexPairs"]+=len(selected)
            if counters["noIndexPairs"]>max_noindex:
                reason="NOINDEX_EXACT_PAIR_CAP"
                break
            candidate.extend((i,int(j)) for j in selected)
        if reason is not None:
            break
    if reason is None:
        if (len(candidate)!=counters["noIndexPairs"] or
                counters["aabbPairs"]!=
                  counters["sharedEdgePairs"]+
                  counters["oneVertexPairs"]+
                  counters["noIndexPairs"]):
            raise QAError("G3.17 no-index indexed-AABB census partition mismatch")
    return candidate,counters,reason,tol


def exact_nonindexed_census(vertices,faces,*,max_sphere=MAX_SPHERE_CANDIDATES,
                            max_aabb=MAX_AABB_PAIRS,
                            max_noindex=MAX_NOINDEX_PAIRS,
                            max_seconds=MAX_SECONDS):
    if (not (1<=max_sphere<=MAX_SPHERE_CANDIDATES) or
            not (1<=max_aabb<=MAX_AABB_PAIRS) or
            not (1<=max_noindex<=MAX_NOINDEX_PAIRS) or
            not (0<max_seconds<=MAX_SECONDS)):
        raise QAError("G3.17 invalid/unsafe CPU resource budget")
    v,f,tri,diag=_input(vertices,faces)
    if np.max(np.abs(v))>MAX_ABS_COORD:
        raise QAError("G3.17 excessively large exact coordinate")
    start=time.perf_counter()
    selected,counters,reason,tol=_candidate_pairs(
        v,f,tri,diag,max_sphere=max_sphere,max_aabb=max_aabb,
        max_noindex=max_noindex,deadline_started=start,max_seconds=max_seconds)
    result={
        "schema":SCHEMA,
        "triangleCount":int(len(f)),
        "vertexCount":int(len(v)),
        "numericalAabbToleranceArbitraryUnits":float(tol),
        "aabbToleranceRelativeToDiagonal":1e-9,
        "independentlyEnumeratedSphereCandidates":counters["spherePairs"],
        "independentlyEnumeratedAllAabbOverlapPairs":counters["aabbPairs"],
        "indexedSharedEdgeAabbPairsNotRetestedHere":counters["sharedEdgePairs"],
        "indexedSingleVertexAabbPairsNotRetestedHere":counters["oneVertexPairs"],
        "zeroSharedIndexAabbCandidatePairs":counters["noIndexPairs"],
        "exactZeroIndexCandidatesExamined":0,
        "exactClassificationCounts":{},
        "privateExampleFacePairsByContactType":{},
        "numericAabbCandidateCensusUsesBoxEnclosingSpheres":True,
        "exactNarrowphaseForEachEnumeratedNoIndexCandidate":False,
        "completeNumericalCandidateEnumerationAndExactNarrowphase":False,
        "geometricExactnessScope":"IEEE754_DECODED_GLTF_SELECTED_NOINDEX_AABB_PAIRS",
        "candidateBroadphaseIsNumericalNotUniversalFormalProof":True,
        "realCADCoordinateScaleOrQuantizationReversible":False,
        "globalSelfIntersectionFreeCertified":False,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
        "resourceCaps":{
            "maxTriangleFaces":MAX_FACES,
            "maxVertices":MAX_VERTICES,
            "maxSpherePairCandidates":max_sphere,
            "maxAabbOverlaps":max_aabb,
            "maxZeroIndexExactPairs":max_noindex,
            "maxSeconds":max_seconds,
        }
    }
    def finalize(why):
        counts=result["exactClassificationCounts"]
        total_contact=sum(counts.get(k,0) for k in (
            "EXACT_SINGLE_POINT_BOUNDARY_CONTACT",
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION",
            "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT",
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"))
        penetration=sum(counts.get(k,0) for k in (
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION",
            "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT",
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"))
        result.update({
            "status":("INDETERMINATE_CPU_BUDGET" if why else
                      "EXACT_NOINDEX_CONTACT_CANDIDATES_DETECTED" if total_contact else
                      "NO_EXACT_CONTACT_AMONG_ENUMERATED_ZERO_INDEX_AABB_PAIRS"),
            "incompleteReason":why,
            "completeNumericalCandidateEnumerationAndExactNarrowphase":why is None,
            "exactNarrowphaseForEachEnumeratedNoIndexCandidate":why is None,
            "exactBoundaryPointContactsAmongCandidates":counts.get(
                "EXACT_SINGLE_POINT_BOUNDARY_CONTACT",0),
            "exactPositiveLengthOrAreaContactsAmongCandidates":penetration,
            "exactAllTypesOfContactAmongCandidates":total_contact,
        })
        return result
    if reason is not None:
        return finalize(reason)
    if time.perf_counter()-start>=max_seconds:
        return finalize("CPU_TIME_BUDGET_BEFORE_EXACT")
    points=[tuple(Fraction.from_float(float(x)) for x in row) for row in v]
    normals=[]
    for row in f:
        a,b,c=(points[int(row[0])],points[int(row[1])],
               points[int(row[2])])
        normal=cross(sub(b,a),sub(c,a))
        if normal==(0,0,0):
            raise QAError("G3.17 exact-degenerate face rejected")
        normals.append(normal)
    counts=result["exactClassificationCounts"]
    examples=result["privateExampleFacePairsByContactType"]
    for at,(i,j) in enumerate(selected):
        if at%128==0 and time.perf_counter()-start>=max_seconds:
            return finalize("CPU_TIME_BUDGET_EXACT_RATIONAL")
        a=tuple(points[int(idx)] for idx in f[i])
        b=tuple(points[int(idx)] for idx in f[j])
        label=_exact_two_triangles(a,b,normals[i],normals[j])
        counts[label]=counts.get(label,0)+1
        if label!="EXACT_DISJOINT":
            examples.setdefault(label,[])
            if len(examples[label])<5:
                examples[label].append([i,j])
        result["exactZeroIndexCandidatesExamined"]+=1
    if time.perf_counter()-start>=max_seconds:
        return finalize("CPU_TIME_BUDGET_AFTER_EXACT")
    if (result["exactZeroIndexCandidatesExamined"]!=counters["noIndexPairs"] or
            sum(counts.values())!=counters["noIndexPairs"]):
        raise QAError("G3.17 exact nonindexed candidate coverage mismatch")
    return finalize(None)


def screen_glb(model):
    p=Path(model)
    if p.is_symlink():
        raise QAError("G3.17 symlinked GLB refused")
    qa=inspect_glb(p)
    topo=qa["topology"]
    if (qa["geometryObjectCount"]!=1 or topo["componentCount"]!=1 or
            topo["everyObjectWatertight"] is not True or
            topo["everyObjectWindingConsistent"] is not True or
            topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or
            topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0):
        raise QAError("G3.17 only pre-verified single connected manifold GLBs")
    mesh=_mesh(p)
    result=exact_nonindexed_census(mesh.vertices,mesh.faces)
    result["modelSha256"]=qa["modelSha256"]
    result["modelBytes"]=qa["modelBytes"]
    return result


def write_immutable(path,data):
    p=Path(path)
    if p.is_symlink():
        raise QAError("G3.17 symlinked evidence target refused")
    raw=json.dumps(data,sort_keys=True,indent=2)+"\n"
    p.parent.mkdir(parents=True,exist_ok=True)
    if p.exists():
        if p.read_text(encoding="utf-8")!=raw:
            raise QAError("G3.17 immutable evidence change refused")
    else:
        p.write_text(raw,encoding="utf-8")


if __name__=="__main__":
    import argparse
    try:
        ap=argparse.ArgumentParser()
        ap.add_argument("--model",type=Path,required=True)
        ap.add_argument("--out",type=Path,required=True)
        args=ap.parse_args()
        rep=screen_glb(args.model)
        write_immutable(args.out,rep)
        print("G3_17_EXACT_NOINDEX_CPU "+json.dumps({
            "sourceSha256":rep["modelSha256"],
            "aabbPairs":rep["independentlyEnumeratedAllAabbOverlapPairs"],
            "noIndexCandidates":rep["zeroSharedIndexAabbCandidatePairs"],
            "exactExamined":rep["exactZeroIndexCandidatesExamined"],
            "exactContacts":rep["exactAllTypesOfContactAmongCandidates"],
            "complete":rep["completeNumericalCandidateEnumerationAndExactNarrowphase"],
            "printQualified":False,
        }))
    except (QAError,OSError,ValueError,TypeError,MemoryError) as e:
        print("G3_17_CPU_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
