"""G3.15 exact-binary-float classification of ALL INDEXED SHARED-EDGE pairs.

Every pair already meets along the same indexed edge. For nondegenerate
triangles, distinct support planes intersect ONLY on that shared line.
If the planes are EXACTLY coplanar in decoded GLB IEEE754 coordinates,
third vertices on the same side of the common edge imply genuine positive
interior-area overlap; opposite sides imply expected edge-only contact.

No geometry changes, no neural inference. This is NOT global self-intersection
proof; indexed one-vertex and non-index pairs remain separate diagnostic gates.
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
from exact_triangle_predicates import sub, cross, dot

SCHEMA="local3d.g3.15.exact-indexed-edge-contact.v1"
MAX_VERTICES=100000
MAX_FACES=75000
MAX_PAIRS=120000
MAX_SECONDS=60.0


def exact_indexed_edge_contacts(vertices, faces, adjacency, *,
                                max_pairs=MAX_PAIRS,
                                max_seconds=MAX_SECONDS):
    v0, f0, adj0 = np.asarray(vertices), np.asarray(faces), np.asarray(adjacency)
    if (v0.ndim != 2 or v0.shape[1] != 3 or
            f0.ndim != 2 or f0.shape[1] != 3 or
            adj0.ndim != 2 or adj0.shape[1] != 2):
        raise QAError("G3.15 invalid triangle/edge adjacency dimensions")
    if (not np.issubdtype(f0.dtype, np.integer) or
            not np.issubdtype(adj0.dtype, np.integer) or
            np.issubdtype(f0.dtype, np.bool_) or
            np.issubdtype(adj0.dtype, np.bool_)):
        raise QAError("G3.15 indexed references must be integers")
    if (not (4 <= len(v0) <= MAX_VERTICES) or
            not (2 <= len(f0) <= MAX_FACES) or
            not (1 <= len(adj0) <= max_pairs <= MAX_PAIRS) or
            not (0 < max_seconds <= MAX_SECONDS)):
        raise QAError("G3.15 unsafe geometry/CPU pair budget")
    v, f, p = (np.asarray(v0,dtype=np.float64),
               np.asarray(f0,dtype=np.int64),
               np.asarray(adj0,dtype=np.int64))
    if (not np.isfinite(v).all() or f.min()<0 or f.max()>=len(v) or
            p.min()<0 or p.max()>=len(f) or
            np.any(p[:,0]>=p[:,1])):
        raise QAError("G3.15 invalid finite coordinate/ordered references")
    if (np.any(f[:,0]==f[:,1]) or np.any(f[:,1]==f[:,2]) or
            np.any(f[:,0]==f[:,2])):
        raise QAError("G3.15 repeated indexed triangle vertex")
    if np.unique(p,axis=0).shape[0] != len(p):
        raise QAError("G3.15 duplicate indexed-adjacency pair")
    if np.unique(np.sort(f,axis=1),axis=0).shape[0] != len(f):
        raise QAError("G3.15 duplicate triangle face")
    scale = float(np.linalg.norm(v.max(axis=0)-v.min(axis=0)))
    if not np.isfinite(scale) or scale<=1e-12:
        raise QAError("G3.15 degenerate geometric bounds")
    xyz=v[f]
    twice=np.linalg.norm(np.cross(xyz[:,1]-xyz[:,0],
                                  xyz[:,2]-xyz[:,0]),axis=1)
    if np.any(~np.isfinite(twice)) or np.any(
            twice<=max(1e-20,scale*scale*1e-15)):
        raise QAError("G3.15 degenerate triangle cannot be cleared")

    begin=time.perf_counter()
    points=[tuple(Fraction.from_float(float(c)) for c in coords) for coords in v]
    exact_coplanar_overlap=0
    exact_coplanar_opposite=0
    exact_noncoplanar=0
    examples=[]
    processed=0
    incomplete_reason=None
    for k,(i,j) in enumerate(p):
        if (k%128==0 and time.perf_counter()-begin>=max_seconds):
            incomplete_reason="EXACT_RATIONAL_CPU_TIME_BUDGET"
            break
        fa,fb=f[i],f[j]
        common=sorted(set(int(x) for x in fa)&set(int(x) for x in fb))
        if len(common)!=2:
            raise QAError("G3.15 claimed shared-edge faces must share EXACTLY two indexed vertices")
        other_a=[int(x) for x in fa if x not in common]
        other_b=[int(x) for x in fb if x not in common]
        if len(other_a)!=1 or len(other_b)!=1:
            raise QAError("G3.15 non-triangle adjacency cannot be analyzed")
        a,b=points[common[0]],points[common[1]]
        ca,cb=points[other_a[0]],points[other_b[0]]
        edge=sub(b,a)
        n=cross(edge,sub(ca,a))
        if n==(0,0,0) or cross(edge,sub(cb,a))==(0,0,0):
            raise QAError("G3.15 exact geometric degeneracy")
        if dot(n,sub(cb,a))!=0:
            exact_noncoplanar+=1
        else:
            orientation=dot(n,cross(edge,sub(cb,a)))
            if orientation>0:
                exact_coplanar_overlap+=1
                if len(examples)<5:
                    examples.append([int(i),int(j)])
            elif orientation<0:
                exact_coplanar_opposite+=1
            else:
                raise QAError("G3.15 coplanar side orientation unexpectedly zero")
        processed+=1
    complete=incomplete_reason is None
    return {
        "schema":SCHEMA,
        "status":("INDETERMINATE_CPU_BUDGET" if not complete else
                  "EXACT_COPLANAR_SHARED_EDGE_AREA_OVERLAP_CANDIDATES" if exact_coplanar_overlap else
                  "ALL_INDEXED_SHARED_EDGES_ONLY_EXPECTED_GEOMETRIC_EDGE_CONTACT"),
        "completeIndexedSharedEdgePairClassification":complete,
        "incompleteReason":incomplete_reason,
        "triangleCount":int(len(f)),
        "vertexCount":int(len(v)),
        "allProvidedIndexedSharedEdgePairs":int(len(p)),
        "pairsExaminedByExactBinaryFloatArithmetic":int(processed),
        "exactNoncoplanarOnlySharedEdgePairs":exact_noncoplanar,
        "exactCoplanarOppositeSideOnlySharedEdgePairs":exact_coplanar_opposite,
        "exactCoplanarSameSidePositiveAreaOverlapPairs":exact_coplanar_overlap,
        "privateExampleOverlappingIndexedFacePairs":examples,
        "perPairClassificationIsExactForDecodedIEEE754Coordinates":True,
        "method":"RATIONAL_TETRAHEDRAL_ORIENTATION_AND_SAME_SIDE_EDGE_AREA",
        "normalIndexedSharedEdgeContactIsNotADefect":True,
        "overlapIndicatesMathematicalAreaNotAutomaticPhysicalPrintDefect":True,
        "uncalibratedGLBQuantizationMayChangeTrueCADGeometry":True,
        "indexedVertexOnlyPairsNotEvaluated":True,
        "differentIndexNonadjacentPairsNotEvaluatedHere":True,
        "globalSelfIntersectionFreeCertified":False,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
        "resourceCaps":{"maxFaces":MAX_FACES,"maxVertices":MAX_VERTICES,
                        "maxIndexedEdgePairs":max_pairs,"maxSeconds":max_seconds},
    }


def screen_glb(path):
    model=Path(path)
    if model.is_symlink():
        raise QAError("G3.15 symlink model refused")
    qa=inspect_glb(model)
    topo=qa["topology"]
    if (qa["geometryObjectCount"]!=1 or topo["componentCount"]!=1 or
            topo["everyObjectWatertight"] is not True or
            topo["everyObjectWindingConsistent"] is not True or
            topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or
            topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0):
        raise QAError("G3.15 requires one complete closed indexed manifold")
    mesh=_mesh(model)
    adj=np.sort(np.asarray(mesh.face_adjacency,dtype=np.int64),axis=1)
    adj=np.unique(adj,axis=0)
    if (len(adj)!=len(mesh.faces)*3//2 or
            len(mesh.faces)%2!=0):
        raise QAError("G3.15 indexed edge-pair census incomplete")
    result=exact_indexed_edge_contacts(mesh.vertices,mesh.faces,adj)
    result["modelSha256"]=qa["modelSha256"]
    result["modelBytes"]=qa["modelBytes"]
    return result


def immutable(path,record):
    p=Path(path)
    if p.is_symlink():
        raise QAError("G3.15 symlink evidence refused")
    body=json.dumps(record,sort_keys=True,indent=2)+"\n"
    p.parent.mkdir(parents=True,exist_ok=True)
    if p.exists():
        if p.read_text(encoding="utf-8")!=body:
            raise QAError("G3.15 changed immutable private evidence refused")
    else:
        p.write_text(body,encoding="utf-8")


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--model",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    a=parser.parse_args()
    r=screen_glb(a.model)
    immutable(a.out,r)
    print("G3_15_EXACT_INDEXED_SHARED_EDGE_CPU "+json.dumps({
        "sha":r["modelSha256"],
        "edgePairs":r["allProvidedIndexedSharedEdgePairs"],
        "examined":r["pairsExaminedByExactBinaryFloatArithmetic"],
        "sameSideOverlaps":r["exactCoplanarSameSidePositiveAreaOverlapPairs"],
        "complete":r["completeIndexedSharedEdgePairClassification"],
        "printQualified":False,
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,TypeError,MemoryError) as e:
        print("G3_15_EXACT_EDGE_CPU_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
