"""G3.11 CPU-only indexed-SHARED-EDGE near-coplanar backfold diagnostic.

Two distinct triangles sharing an entire indexed edge already meet along
that edge. If their supporting planes are genuinely different, the two
planes intersect ONLY along the shared line. Extra surface overlap beyond
the shared edge therefore requires planar/near-planar overlap. These
possible overlap/backtracking cases are flagged conservatively; a large
normal dihedral alone is not a defect.

No exact 3D collision predicate or print/millimeter clearance is claimed.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import numpy as np
from geometry_qa import QAError,inspect_glb
from winding_equivalence import _mesh

SCHEMA="local3d.g3.11.edge-coplanar-backfold-screen.v1"
MAX_FACES=75000
MAX_VERTICES=100000
MAX_EDGES=120000
ANGLE_NEAR_ANTIPARALLEL_DEGREES=175.
ANGLE_HIGH_BACKTURN_DEGREES=150.
DIST_TOL_REL_DIAGONAL=1e-8
MAX_PRIVATE_EXAMPLES=5


def edge_pair_backfold(v,f,pairs):
    """Screen EXACT indexed shared-edge pairs, bounded, fully vectorized.

    Low-level tests may use two isolated triangles. A real-GLB wrapper
    additionally requires closed, consistent, nondegenerate topology.
    """
    vertices=np.asarray(v,dtype=np.float64)
    faces=np.asarray(f,dtype=np.int64)
    adjacent=np.asarray(pairs,dtype=np.int64)
    if vertices.ndim!=2 or vertices.shape[1]!=3 or \
       faces.ndim!=2 or faces.shape[1]!=3 or \
       adjacent.ndim!=2 or adjacent.shape[1]!=2 or \
       len(faces)<2 or len(faces)>MAX_FACES or \
       len(vertices)<4 or len(vertices)>MAX_VERTICES or \
       len(adjacent)<1 or len(adjacent)>MAX_EDGES:
        raise QAError("Invalid edge-adjacency scan geometry/budgets")
    if not np.isfinite(vertices).all() or np.min(faces)<0 or \
       np.max(faces)>=len(vertices) or np.min(adjacent)<0 or \
       np.max(adjacent)>=len(faces) or \
       np.any(adjacent[:,0]==adjacent[:,1]):
        raise QAError("Nonfinite coordinates or illegal face/edge indices")
    if np.any(faces[:,0]==faces[:,1]) or \
       np.any(faces[:,1]==faces[:,2]) or \
       np.any(faces[:,0]==faces[:,2]):
        raise QAError("Duplicated vertex indexes within a triangle")
    spans=vertices.max(axis=0)-vertices.min(axis=0)
    scale=float(np.linalg.norm(spans))
    if not np.isfinite(scale) or scale<=1e-12:
        raise QAError("Degenerate bounds")
    tri=vertices[faces]
    norms=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
    area_twice=np.linalg.norm(norms,axis=1)
    if np.any(~np.isfinite(area_twice)) or np.any(
       area_twice<=max(1e-20,scale*scale*1e-15)):
        raise QAError("Degenerate face invalidates edge-fold analysis")
    face_normals=norms/area_twice[:,None]
    a=faces[adjacent[:,0]]
    b=faces[adjacent[:,1]]
    shared_a=np.any(a[:,:,None]==b[:,None,:],axis=2)
    shared_b=np.any(b[:,:,None]==a[:,None,:],axis=2)
    if np.any(shared_a.sum(axis=1)!=2) or np.any(shared_b.sum(axis=1)!=2):
        raise QAError("Edge adjacency must share EXACTLY two indexed vertices")
    edge=a[shared_a].reshape(-1,2)
    third_a=a[~shared_a].reshape(-1)
    third_b=b[~shared_b].reshape(-1)
    u=vertices[edge[:,0]]
    e=vertices[edge[:,1]]-u
    lengths=np.linalg.norm(e,axis=1)
    if np.any(lengths<=max(1e-12,scale*1e-10)):
        raise QAError("Degenerate shared indexed edge")
    e_unit=e/lengths[:,None]
    c=vertices[third_a]
    other=vertices[third_b]
    na=face_normals[adjacent[:,0]]
    nb=face_normals[adjacent[:,1]]
    dot=np.clip(np.einsum("ij,ij->i",na,nb),-1,1)
    normal_angle=np.degrees(np.arccos(dot))
    # Oriented lateral coordinate of the two third vertices relative to
    # the common edge in the plane defined by triangle A.
    lateral=np.cross(na,e_unit)
    side_a=np.einsum("ij,ij->i",c-u,lateral)
    side_b=np.einsum("ij,ij->i",other-u,lateral)
    epsilon=max(1e-12,scale*DIST_TOL_REL_DIAGONAL)
    borderline_side=(np.abs(side_a)<=epsilon)|(np.abs(side_b)<=epsilon)
    same_side=(
        ((side_a>epsilon)&(side_b>epsilon))|
        ((side_a< -epsilon)&(side_b< -epsilon))
    )
    signed_distance=np.abs(np.einsum("ij,ij->i",other-u,na))
    near_plane=signed_distance<=epsilon
    nearly_anti=normal_angle>=ANGLE_NEAR_ANTIPARALLEL_DEGREES
    high_backturn=normal_angle>=ANGLE_HIGH_BACKTURN_DEGREES
    # If two triangles share the same complete edge and their third
    # vertices lie on the same lateral side in the SAME plane, their
    # interiors can overlap (not just the shared edge). Nearly antiparallel
    # normals are an extra consistency check for a plausible backfold.
    possible_coplanar_overlap=same_side&near_plane&nearly_anti
    near_backtracking=same_side&high_backturn
    near_plane_but_uncertain=near_plane&borderline_side
    # For real controlled meshes, all 60k indexed-edge pairs must be tested.
    return {
        "schema":SCHEMA,
        "faceCount":int(len(faces)),
        "indexedSharedEdgeFacePairs":int(len(adjacent)),
        "allProvidedIndexedSharedEdgePairsExamined":True,
        "nearAntiparallelNormalsAtOrAbove175Degrees":int(np.count_nonzero(nearly_anti)),
        "backturnPairsSameSideAbove150Degrees":int(np.count_nonzero(near_backtracking)),
        "possibleCoplanarSameSideAreaOverlapPairs":int(np.count_nonzero(possible_coplanar_overlap)),
        "nearCoplanarBorderlineLateralSidePairsUnresolved":int(np.count_nonzero(near_plane_but_uncertain)),
        "facePairsWithThirdVerticesOnSameLateralSide":int(np.count_nonzero(same_side)),
        "facePairsWithThirdVerticesOnOppositeLateralSides":int(np.count_nonzero(
            (side_a>epsilon)&(side_b< -epsilon)|
            (side_a< -epsilon)&(side_b>epsilon))),
        "maxFaceNormalAngleDegrees":round(float(normal_angle.max()),6),
        "coplanarityToleranceArbitraryUnits":round(epsilon,12),
        "maxFaceCount":MAX_FACES,
        "maxEdgePairCount":MAX_EDGES,
        "privateExamplePossibleOverlapFaceIndices":
            adjacent[np.flatnonzero(possible_coplanar_overlap)[:MAX_PRIVATE_EXAMPLES]].tolist(),
        "interpretation":"SHARED_INDEXED_EDGE_NEAR_COPLANAR_SAME_SIDE_POTENTIAL_OVERLAP_ONLY",
        "numericalCaveat":"Floating-point dot products, NOT exact coplanarity or robust intersection predicates",
        "highNormalAngleCanBeIntentionalDesign":True,
        "edgeSharedGeometryCertifiedNoBackfold":False,
        "completeMeshSelfIntersectionFreeCertified":False,
        "wallThicknessNotTested":True,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False
    }


def screen_glb(model):
    model=Path(model)
    if model.is_symlink():
        raise QAError("Symlink model refused")
    qa=inspect_glb(model)
    topo=qa["topology"]
    if qa["geometryObjectCount"]!=1 or topo["componentCount"]!=1 or \
       not topo["everyObjectWatertight"] or \
       not topo["everyObjectWindingConsistent"] or \
       topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or \
       topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0:
        raise QAError("Requires one connected, consistently wound, nondegenerate manifold GLB")
    mesh=_mesh(model)
    result=edge_pair_backfold(mesh.vertices,mesh.faces,mesh.face_adjacency)
    if result["indexedSharedEdgeFacePairs"]!=result["faceCount"]*3//2:
        raise QAError("Mesh indexed shared-edge enumeration is incomplete")
    result["modelSha256"]=qa["modelSha256"]
    result["modelBytes"]=qa["modelBytes"]
    result["signedVolumeArbitraryUnitsCubed"]=qa["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    return result


def write_immutable(file:Path,data:dict):
    file=Path(file)
    if file.is_symlink():
        raise QAError("Symlink report output refused")
    raw=json.dumps(data,indent=2,sort_keys=True)+"\n"
    file.parent.mkdir(parents=True,exist_ok=True)
    if file.exists():
        if file.read_text(encoding="utf-8")!=raw:
            raise QAError("Existing report modified; refusing overwrite")
        return
    file.write_text(raw,encoding="utf-8")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    args=p.parse_args()
    result=screen_glb(args.model)
    write_immutable(args.out,result)
    print("G3_11_SHARED_EDGE_COPLANAR_BACKFOLD_CPU "+json.dumps({
        "modelSha":result["modelSha256"],
        "sharedEdges":result["indexedSharedEdgeFacePairs"],
        "potentialSameSideCoplanar":result["possibleCoplanarSameSideAreaOverlapPairs"],
        "nearAnti175":result["nearAntiparallelNormalsAtOrAbove175Degrees"],
        "highBackturn150":result["backturnPairsSameSideAbove150Degrees"],
        "ambiguousNearPlanar":result["nearCoplanarBorderlineLateralSidePairsUnresolved"],
        "printQualified":False,"newGpu":False
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,TypeError,MemoryError) as error:
        print("G3_11_EDGE_BACKFOLD_CPU_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
