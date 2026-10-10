"""G3.8 bounded CPU-only triangle contact SCREEN, not print clearance.

Checks pairs of non-topologically-adjacent triangles only. Uses an exhaustive
centroid circumsphere query, exact 3D AABB broadphase and a conservative
separating-axis candidate screen. SAT can include geometric touching/contact,
and floating point tolerance can conceal tiny intersections; never interpret
NO_DETECTED_CONTACTS as a formal proof of no self-intersection. Adjacent
triangles are excluded (shared vertex index), including potential folds.
On limits/timeouts, state INDETERMINATE rather than PASS.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import sys
import time

import numpy as np
from scipy.spatial import cKDTree
from geometry_qa import QAError, inspect_glb, digest
from winding_equivalence import _mesh

SCHEMA="local3d.g3.8.nonadjacent-triangle-contact-screen.v1"
MAX_FACES=75000
MAX_BROADPHASE_PAIRS=1_500_000
MAX_SAT_PAIRS=500_000
MAX_SECONDS=35
MAX_REPORTED_CONTACTS=32
CHUNK=512
SAT_CHUNK=1024


def _sat_potential_contacts(tris_a: np.ndarray, tris_b: np.ndarray, tol: float):
    """Conservative triangle-vs-triangle SAT including coplanar in-plane axes.

    Does NOT distinguish tangency from true crossing and is NOT an exact
    predicate robust to all floating point degeneracies.
    """
    if len(tris_a)!=len(tris_b):
        raise QAError("Triangle batch size mismatch")
    if len(tris_a)==0:
        return np.zeros((0,),dtype=bool)
    a=np.asarray(tris_a,dtype=np.float64)
    b=np.asarray(tris_b,dtype=np.float64)
    ea=np.roll(a,-1,axis=1)-a
    eb=np.roll(b,-1,axis=1)-b
    na=np.cross(ea[:,0,:],ea[:,1,:])
    nb=np.cross(eb[:,0,:],eb[:,1,:])
    axes=[na,nb]
    axes += [np.cross(ea[:,i,:],eb[:,j,:])
             for i in range(3) for j in range(3)]
    # In-plane edge normals are essential for coplanar triangles.
    axes += [np.cross(na,ea[:,i,:]) for i in range(3)]
    axes += [np.cross(nb,eb[:,i,:]) for i in range(3)]
    potential=np.ones(len(a),dtype=bool)
    for axis in axes:
        magnitude=np.linalg.norm(axis,axis=1)
        use=magnitude>1e-17
        if not np.any(use & potential):
            continue
        unit=axis/np.where(use,magnitude,1.)[:,None]
        pa=np.einsum("nij,nj->ni",a,unit)
        pb=np.einsum("nij,nj->ni",b,unit)
        separate=((pa.max(axis=1)<pb.min(axis=1)-tol)|
                  (pb.max(axis=1)<pa.min(axis=1)-tol)) & use
        potential&=~separate
        if not potential.any():
            break
    return potential


def contact_screen(vertices: np.ndarray, faces: np.ndarray,
                   *, max_candidates=MAX_BROADPHASE_PAIRS,
                   max_sat=MAX_SAT_PAIRS,max_seconds=MAX_SECONDS,
                   contact_limit=MAX_REPORTED_CONTACTS):
    """Budgeted screen. No result says 'print safe' or zero true intersections."""
    if max_candidates<1 or max_sat<1 or max_seconds<=0 or contact_limit<1:
        raise QAError("Unsafe/nonpositive CPU screen budget")
    v=np.asarray(vertices,dtype=np.float64)
    f=np.asarray(faces,dtype=np.int64)
    if v.ndim!=2 or v.shape[1]!=3 or f.ndim!=2 or f.shape[1]!=3:
        raise QAError("Malformed indexed triangle arrays")
    if not len(f) or len(f)>MAX_FACES or len(v)>100000:
        raise QAError("CPU self-contact screen mesh budget exceeded")
    if not np.isfinite(v).all() or f.min()<0 or f.max()>=len(v):
        raise QAError("Unsafe/invalid triangle coordinates")
    tri=v[f]
    low=tri.min(axis=1)
    high=tri.max(axis=1)
    centers=tri.mean(axis=1)
    radii=np.linalg.norm(tri-centers[:,None,:],axis=2).max(axis=1)
    if not np.isfinite(radii).all():
        raise QAError("Invalid triangle circumsphere")
    bounds=v.max(axis=0)-v.min(axis=0)
    scale=float(np.linalg.norm(bounds))
    if scale<=1e-12 or not np.isfinite(scale):
        raise QAError("Degenerate mesh bounds")
    twice_areas=np.linalg.norm(np.cross(
        tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1)
    if np.any(twice_areas <= max(1e-20, scale*scale*1e-15)):
        raise QAError("Degenerate triangle face; cannot trust SAT screen")
    # Geometric tolerance relative to overall bbox, not physical mm.
    tol=max(1e-12,scale*1e-9)
    tree=cKDTree(centers)
    max_radius=float(radii.max())
    broadphase_pairs=0
    aabb_pairs=0
    skipped_adjacency=0
    narrow_pairs=0
    contact_count=0
    examples=[]
    complete=True
    incomplete_reason=None
    began=time.perf_counter()
    for start in range(0,len(f),CHUNK):
        if time.perf_counter()-began>max_seconds:
            complete=False
            incomplete_reason="CPU_TIME_BUDGET_EXCEEDED"
            break
        stop=min(start+CHUNK,len(f))
        neighbors=tree.query_ball_point(
            centers[start:stop],r=radii[start:stop]+max_radius,
            workers=1)
        selected_i=[]
        selected_j=[]
        for offset,near in enumerate(neighbors):
            idx=start+offset
            j=np.asarray(near,dtype=np.int64)
            j=j[j>idx]
            broadphase_pairs+=len(j)
            if broadphase_pairs>max_candidates:
                complete=False
                incomplete_reason="BROADPHASE_CANDIDATE_BUDGET_EXCEEDED"
                break
            if not len(j):
                continue
            close=np.all((low[idx]<=high[j]+tol)&
                         (low[j]<=high[idx]+tol),axis=1)
            j=j[close]
            aabb_pairs+=len(j)
            if not len(j):
                continue
            adjacent=np.any(f[idx,None,:,None]==f[j,None,:],axis=(1,2))
            skipped_adjacency+=int(adjacent.sum())
            j=j[~adjacent]
            if len(j):
                selected_i.append(np.full(len(j),idx,dtype=np.int64))
                selected_j.append(j)
        if not complete:
            break
        if not selected_i:
            continue
        pairs_i=np.concatenate(selected_i)
        pairs_j=np.concatenate(selected_j)
        if narrow_pairs+len(pairs_i)>max_sat:
            # Do NOT silently analyze just the first part and claim complete.
            complete=False
            incomplete_reason="NARROWPHASE_PAIR_BUDGET_EXCEEDED"
            break
        for off in range(0,len(pairs_i),SAT_CHUNK):
            q_i=pairs_i[off:off+SAT_CHUNK]
            q_j=pairs_j[off:off+SAT_CHUNK]
            flagged=_sat_potential_contacts(tri[q_i],tri[q_j],tol)
            narrow_pairs+=len(q_i)
            found=np.flatnonzero(flagged)
            contact_count+=len(found)
            if found.size:
                for k in found[:max(0, min(len(found),5-len(examples)))]:
                    examples.append([int(q_i[k]),int(q_j[k])])
            if contact_count>=contact_limit:
                complete=False
                incomplete_reason="EARLY_STOP_AFTER_POTENTIAL_CONTACTS"
                break
        if not complete:
            break
    elapsed=round(time.perf_counter()-began,3)
    if contact_count:
        status="POTENTIAL_NONADJACENT_CONTACTS_DETECTED"
    elif not complete:
        status="INDETERMINATE_BUDGET_OR_TIME"
    else:
        status="NO_NONADJACENT_CONTACTS_DETECTED_WITHIN_NUMERICAL_TOLERANCE"
    return {
        "screen":status,
        "completeBroadphaseAndSATForEligiblePairs":bool(complete),
        "incompleteReason":incomplete_reason,
        "triangleCount":len(f),
        "allTrianglesExamined":bool(complete),
        "candidatePairsBeforeAabb":int(broadphase_pairs),
        "aabbOverlappingPairs":int(aabb_pairs),
        "skippedPairsSharingAnyVertexIndex":int(skipped_adjacency),
        "pairsExaminedByConservativeSAT":int(narrow_pairs),
        "potentialNonadjacentContactCountLowerBound":int(contact_count),
        "samplePotentialContactFaceIndices":examples,
        "geometricToleranceArbitraryUnits":float(round(tol,12)),
        "cpuElapsedSeconds":elapsed,
        "boundedCaps":{"maxTriangles":MAX_FACES,"maxBroadphasePairs":max_candidates,
                       "maxNarrowPairs":max_sat,"maxSeconds":max_seconds,
                       "contactStopLimit":contact_limit},
        "limitations":[
            "Floating-point SAT screen, not an exact geometric predicate",
            "Touching or near-coplanar triangles can be flagged as contacts",
            "Pairs sharing any vertex index are excluded and can still self-fold",
            "A zero finding cannot prove absence of all self-intersections",
            "No physical dimensions, wall thickness or printer certification"
        ],
        "selfIntersectionFreeCertified":False,
        "printQualified":False,"approvedForPrinter":False,
        "fabricationAction":"NONE","modelInferenceExecuted":False
    }


def screen_glb(path: Path, **options):
    path=Path(path)
    if path.is_symlink():
        raise QAError("Symlink GLB forbidden")
    qa=inspect_glb(path)
    if qa["geometryObjectCount"]!=1:
        raise QAError("G3.8 requires single-mesh scene")
    mesh=_mesh(path)
    result=contact_screen(mesh.vertices,mesh.faces,**options)
    result.update({"schema":SCHEMA,"modelSha256":qa["modelSha256"],
                   "modelBytes":qa["modelBytes"],
                   "inputIsWatertight":qa["topology"]["everyObjectWatertight"],
                   "inputPositiveVolume":qa["topology"]["everyObjectPositiveVolume"]})
    return result


def write_immutable(path: Path,report: dict):
    target=Path(path)
    if target.is_symlink():
        raise QAError("Symlink output forbidden")
    raw=json.dumps(report,indent=2,sort_keys=True)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=raw:
            raise QAError("Existing report differs; refusing overwrite")
    else:
        target.write_text(raw,encoding="utf-8")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    args=p.parse_args()
    result=screen_glb(args.model)
    write_immutable(args.out,result)
    print("G3_8_CONSERVATIVE_CONTACT_SCREEN "+json.dumps({
        "modelSha256":result["modelSha256"],
        "status":result["screen"],
        "complete":result["completeBroadphaseAndSATForEligiblePairs"],
        "foundLowerBound":result["potentialNonadjacentContactCountLowerBound"],
        "testedPairs":result["pairsExaminedByConservativeSAT"],
        "elapsedSeconds":result["cpuElapsedSeconds"],
        "printQualified":False}))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,MemoryError) as exc:
        print("G3_8_CONTACT_SCREEN_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
