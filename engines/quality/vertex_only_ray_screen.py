"""G3.10 CPU-only vertex-only triangle-pair common-ray risk SCREEN.

Two triangles sharing exactly one indexed vertex necessarily touch at that
vertex. That contact is normal mesh topology, *not an intersection defect*.

For NON-coplanar triangle planes passing through the shared vertex, their
intersection (if any) lies on the common plane-intersection line. We test
whether a non-zero ray from that shared vertex lies inside BOTH triangular
tangent sectors. Such rays are flagged as potential EXTRA contact away from
the shared point.

For parallel/coplanar or numerically ill-conditioned pairs the result is
UNRESOLVED; no false negative "no contact" is awarded. A found ray is
not robust proof of actual penetration vs geometric coincidence/contact.
The result never certifies the absence of any mesh self-intersection, and
does not assess edge-adjacent folds, mm dimensions, material or thickness.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import time

import numpy as np

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh

SCHEMA="local3d.g3.10.shared-one-vertex-ray-screen.v1"
MAX_FACES=75000
MAX_VERTICES=100000
MAX_VERTEX_ONLY_PAIRS=600000
MAX_VALENCE=64
MAX_SECONDS=35
BATCH=4096
PARALLEL_SINE_TOL=1e-7
BARY_SIGN_TOL=1e-8
MIN_PHYSICAL_RAY_REL_DIAGONAL=1e-7


def _validate(v: np.ndarray, f: np.ndarray):
    if v.ndim!=2 or v.shape[1]!=3 or f.ndim!=2 or f.shape[1]!=3:
        raise QAError("Invalid vertex/triangle array shape")
    if not (3<=len(v)<=MAX_VERTICES and 1<=len(f)<=MAX_FACES):
        raise QAError("Vertex/triangle budget exceeded")
    if not np.isfinite(v).all() or np.min(f)<0 or np.max(f)>=len(v):
        raise QAError("Invalid coordinates or face indices")
    if np.any(f[:,0]==f[:,1]) or np.any(f[:,1]==f[:,2]) or \
       np.any(f[:,0]==f[:,2]):
        raise QAError("Degenerate indexed faces")
    bounds=v.max(axis=0)-v.min(axis=0)
    scale=float(np.linalg.norm(bounds))
    if not np.isfinite(scale) or scale<=1e-12:
        raise QAError("Degenerate mesh extents")
    xyz=v[f]
    area_twice=np.linalg.norm(np.cross(xyz[:,1]-xyz[:,0],
                                       xyz[:,2]-xyz[:,0]),axis=1)
    if np.any(~np.isfinite(area_twice)) or \
       np.any(area_twice<=max(1e-20,scale**2*1e-15)):
        raise QAError("Degenerate geometric faces")
    return scale


def _vertex_only_pairs(f,vertex_count,max_pairs,deadline):
    """Unique vertex-sharing-only face pairs; edge-sharing is excluded."""
    from collections import defaultdict
    incidence=[[] for _ in range(vertex_count)]
    for idx,tri in enumerate(f):
        for vertex in tri:
            incidence[int(vertex)].append(idx)
    i=[];j=[];common=[]
    edge_pair_incidence=0
    max_valence=0
    overbudget=None
    processed_vertices=0
    for vertex,faces in enumerate(incidence):
        if vertex%256==0 and time.perf_counter()>deadline:
            overbudget="CPU_TIME_BUDGET_EXCEEDED_ENUMERATION"
            break
        valence=len(faces)
        max_valence=max(max_valence,valence)
        if valence>MAX_VALENCE:
            overbudget="VERTEX_VALENCE_BUDGET_EXCEEDED"
            break
        if valence<2:
            processed_vertices+=1
            continue
        for a in range(valence):
            first=faces[a]
            for b in range(a+1,valence):
                second=faces[b]
                if len(set(f[first])&set(f[second]))>=2:
                    # Every full-edge adjacent triangle appears in two
                    # distinct vertex incidence buckets.
                    edge_pair_incidence+=1
                    continue
                i.append(first);j.append(second);common.append(vertex)
                if len(i)>max_pairs:
                    overbudget="VERTEX_ONLY_PAIR_BUDGET_EXCEEDED"
                    break
            if overbudget:
                break
        if overbudget:
            break
        processed_vertices+=1
    return (np.asarray(i,dtype=np.int64),
            np.asarray(j,dtype=np.int64),
            np.asarray(common,dtype=np.int64),
            edge_pair_incidence,max_valence,processed_vertices,
            overbudget)


def _direction_in_face_sector(unit_direction,uv,scale):
    """Express unit 3D direction as alpha*U + beta*V.

    Returns accepts, borderline and a maximum line extent in 3D units.
    Candidate acceptance with borderline coefficients is an UNCERTAIN
    contact; no certification allowed regardless of outcome.
    """
    u=uv[:,0,:];v=uv[:,1,:]
    uu=np.einsum("ij,ij->i",u,u)
    vv=np.einsum("ij,ij->i",v,v)
    uv_dot=np.einsum("ij,ij->i",u,v)
    det=uu*vv-uv_dot**2
    if np.any(det<=1e-26):
        raise QAError("Ill-conditioned triangles cannot be analyzed")
    dot_u=np.einsum("ij,ij->i",unit_direction,u)
    dot_v=np.einsum("ij,ij->i",unit_direction,v)
    a=(dot_u*vv-dot_v*uv_dot)/det
    b=(dot_v*uu-dot_u*uv_dot)/det
    if not (np.isfinite(a).all() and np.isfinite(b).all()):
        raise QAError("Nonfinite barycentric ray coefficients")
    magnitude=np.maximum(np.abs(a)+np.abs(b),1.0/scale)
    eps=BARY_SIGN_TOL*magnitude
    inside=(a>=-eps)&(b>=-eps)&((a+b)>eps)
    borderline=(
        (np.abs(a)<=eps)|(np.abs(b)<=eps)|
        ((a<0)&(a>=-eps))|((b<0)&(b>=-eps))
    )
    positive_sum=np.maximum(a+b,1e-30)
    max_extent=1.0/positive_sum
    return inside,borderline,max_extent


def _candidate_rays(v,f,pairs_i,pairs_j,shared,scale):
    """Read-only batched candidate classification; no geometry modification."""
    count=len(shared)
    potential=0
    near_coplanar=0
    unresolved_edge_alignment=0
    short_segment_ambiguous=0
    no_ray=0
    examples=[]
    for start in range(0,count,BATCH):
        end=min(count,start+BATCH)
        pi=pairs_i[start:end]
        pj=pairs_j[start:end]
        o=shared[start:end]
        pa=f[pi];pb=f[pj]
        a_others=pa[pa!=o[:,None]].reshape(-1,2)
        b_others=pb[pb!=o[:,None]].reshape(-1,2)
        ao=v[a_others]-v[o,None,:]
        bo=v[b_others]-v[o,None,:]
        na=np.cross(ao[:,0,:],ao[:,1,:])
        nb=np.cross(bo[:,0,:],bo[:,1,:])
        na_m=np.linalg.norm(na,axis=1)
        nb_m=np.linalg.norm(nb,axis=1)
        directions=np.cross(na,nb)
        dm=np.linalg.norm(directions,axis=1)
        sinang=dm/(na_m*nb_m)
        nearly_parallel=sinang<=PARALLEL_SINE_TOL
        near_coplanar+=int(nearly_parallel.sum())
        idx=np.flatnonzero(~nearly_parallel)
        if not len(idx):
            continue
        oa=ao[idx];ob=bo[idx]
        axis=directions[idx]/dm[idx,None]
        ray_detected=np.zeros(len(idx),dtype=bool)
        ray_uncertain=np.zeros(len(idx),dtype=bool)
        ray_short=np.zeros(len(idx),dtype=bool)
        for sign in (1.,-1.):
            direct=axis*sign
            a_ok,a_edge,a_extent=_direction_in_face_sector(direct,oa,scale)
            b_ok,b_edge,b_extent=_direction_in_face_sector(direct,ob,scale)
            eligible=a_ok&b_ok
            # A nonzero shared line segment is geometrically more than the
            # common indexed vertex, provided it exceeds the tolerance.
            extent=np.minimum(a_extent,b_extent)
            long_enough=extent>MIN_PHYSICAL_RAY_REL_DIAGONAL*scale
            ray_detected |= eligible&long_enough
            ray_uncertain |= eligible & (a_edge|b_edge)
            ray_short |= eligible &~long_enough
        confident=ray_detected&~ray_uncertain
        # A potential intersecting ray means "possible additional contact",
        # NOT proof of penetration or an already broken physical object.
        potential+=int(confident.sum())
        unresolved_edge_alignment+=int((ray_detected&ray_uncertain).sum())
        short_segment_ambiguous+=int((~ray_detected&ray_short).sum())
        no_ray+=int((~ray_detected&~ray_short).sum())
        if len(examples)<5:
            found=np.flatnonzero(confident)[:5-len(examples)]
            for k in found:
                off=int(idx[k])
                examples.append([int(pi[off]),int(pj[off]),int(o[off])])
    return {
        "potentialExtraContactAlongNonzeroCommonRay":potential,
        "nearParallelOrCoplanarUnresolvedPairs":near_coplanar,
        "edgeAlignedRayUncertainPairs":unresolved_edge_alignment,
        "nearZeroLengthRayUncertainPairs":short_segment_ambiguous,
        "separatedRaySectorsWithinNumericalTolerance":no_ray,
        "privatePotentialExampleFaceAndVertexIndices":examples
    }


def screen_vertex_only(v,f,*,max_pairs=MAX_VERTEX_ONLY_PAIRS,
                       max_seconds=MAX_SECONDS):
    if not (1<=max_pairs<=MAX_VERTEX_ONLY_PAIRS) or not(0<max_seconds<=MAX_SECONDS):
        raise QAError("Untrusted CPU resource budget")
    vertices=np.asarray(v,dtype=np.float64)
    faces=np.asarray(f,dtype=np.int64)
    scale=_validate(vertices,faces)
    begin=time.perf_counter()
    found=_vertex_only_pairs(
        faces,len(vertices),max_pairs,begin+max_seconds)
    fi,fj,shared,edge_incidence,max_valence,processed,overbudget=found
    examined=0
    classified=None
    if overbudget is None and time.perf_counter()-begin<max_seconds:
        classified=_candidate_rays(vertices,faces,fi,fj,shared,scale)
        examined=len(shared)
        if time.perf_counter()-begin>max_seconds:
            overbudget="CPU_TIME_BUDGET_EXCEEDED_CLASSIFICATION"
    elif overbudget is None:
        overbudget="CPU_TIME_BUDGET_EXCEEDED_BEFORE_CLASSIFICATION"
    elapsed=round(time.perf_counter()-begin,3)
    if classified is None:
        classified={
            "potentialExtraContactAlongNonzeroCommonRay":0,
            "nearParallelOrCoplanarUnresolvedPairs":0,
            "edgeAlignedRayUncertainPairs":0,
            "nearZeroLengthRayUncertainPairs":0,
            "separatedRaySectorsWithinNumericalTolerance":0,
            "privatePotentialExampleFaceAndVertexIndices":[]
        }
    flagged=classified["potentialExtraContactAlongNonzeroCommonRay"]>0
    ambiguous=(
        classified["nearParallelOrCoplanarUnresolvedPairs"]>0 or
        classified["edgeAlignedRayUncertainPairs"]>0 or
        classified["nearZeroLengthRayUncertainPairs"]>0)
    status=(
        "INDETERMINATE_CPU_BUDGET" if overbudget else
        "POTENTIAL_EXTRA_VERTEX_CONTACT_RAYS" if flagged else
        "UNRESOLVED_NEAR_COPLANAR_OR_BORDERLINE_VERTEX_PAIRS"
            if ambiguous else
        "NO_EXTRA_NONCOPLANAR_COMMON_RAYS_FOUND_IN_VERTEX_ONLY_PAIRS"
    )
    return {
        "schema":SCHEMA,
        "status":status,
        "completeVertexOnlyPairClassification":overbudget is None,
        "incompleteReason":overbudget,
        "triangleCount":int(len(faces)),
        "vertexCount":int(len(vertices)),
        "vertexIncidenceBucketsProcessed":processed,
        "vertexOnlyPairsEnumerated":int(len(shared)),
        "fullEdgePairDoubleIncidencesSkipped":int(edge_incidence),
        "vertexOnlyPairsExamined":int(examined),
        "maxObservedIndexedVertexValence":int(max_valence),
        "classification":classified,
        "globalBoundingBoxDiagonalArbitraryUnits":round(scale,8),
        "nearParallelSineThreshold":PARALLEL_SINE_TOL,
        "rayMinRelativeToObjectDiagonal":MIN_PHYSICAL_RAY_REL_DIAGONAL,
        "secondsCpu":elapsed,
        "resourceCaps":{"maxTriangles":MAX_FACES,"maxVertices":MAX_VERTICES,
                        "maxValence":MAX_VALENCE,
                        "maxVertexOnlyPairs":max_pairs,
                        "maxSeconds":max_seconds},
        "criticalLimitations":[
            "All eligible triangles share exactly one indexed vertex: ordinary common-vertex touching is NOT a defect",
            "Positive common-ray candidate is possible additional geometric contact, not a proof of crossing or print failure",
            "Nearly parallel/coplanar and barycentric-boundary cases remain UNRESOLVED",
            "Floating-point orientation and extremely short rays may escape numerical tolerances",
            "Edge-adjacent pairs are not checked for geometric intersections here",
            "This cannot certify the whole mesh self-intersection-free, material/physical dimensions or wall thickness"
        ],
        "trueSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False
    }


def screen_existing_glb(path:Path,**kwargs):
    path=Path(path)
    if path.is_symlink():
        raise QAError("Symlinked model path forbidden")
    qa=inspect_glb(path)
    topology=qa["topology"]
    if qa["geometryObjectCount"]!=1 or \
       topology["componentCount"]!=1 or \
       topology["everyObjectWatertight"] is not True or \
       topology["everyObjectWindingConsistent"] is not True or \
       topology["boundaryEdges"]!=0 or topology["nonManifoldEdges"]!=0 or \
       topology["zeroAreaFaces"]!=0 or topology["duplicateFaceTriples"]!=0:
        raise QAError("G3.10 requires one clean connected, closed consistent GLB")
    mesh=_mesh(path)
    report=screen_vertex_only(mesh.vertices,mesh.faces,**kwargs)
    report["modelSha256"]=qa["modelSha256"]
    report["modelBytes"]=qa["modelBytes"]
    report["signedVolumeArbitraryUnitsCubed"]=qa["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    return report


def immutable_report(path:Path,report:dict):
    path=Path(path)
    if path.is_symlink():
        raise QAError("Symlink evidence output forbidden")
    raw=json.dumps(report,sort_keys=True,indent=2)+"\n"
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists():
        if path.read_text(encoding="utf-8")!=raw:
            raise QAError("Existing CPU report differs; refusing overwrite")
        return
    path.write_text(raw,encoding="utf-8")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    result=screen_existing_glb(a.model)
    immutable_report(a.out,result)
    c=result["classification"]
    print("G3_10_SHARED_VERTEX_RAY_CPU_DIAGNOSTIC "+json.dumps({
        "sha":result["modelSha256"],
        "triangles":result["triangleCount"],
        "vertexOnlyPairs":result["vertexOnlyPairsEnumerated"],
        "examined":result["vertexOnlyPairsExamined"],
        "status":result["status"],
        "potentialExtraRayPairs":c["potentialExtraContactAlongNonzeroCommonRay"],
        "nearCoplanarUnresolved":c["nearParallelOrCoplanarUnresolvedPairs"],
        "borderlineUnresolved":c["edgeAlignedRayUncertainPairs"],
        "complete":result["completeVertexOnlyPairClassification"],
        "printQualified":False
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,MemoryError) as exc:
        print("G3_10_VERTEX_ONLY_CPU_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
