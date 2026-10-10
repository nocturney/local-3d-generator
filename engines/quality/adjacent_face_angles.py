"""G3.9 CPU-only edge-adjacent face normal/dihedral angle DIAGNOSTIC.

All real values are angular differences across INDEXED EDGE ADJACENCIES ONLY.
They are not foldover proofs. Sharp edges can be intentional; vertex-only
neighbor contacts and intra-face penetrations are NOT tested, nor wall size,
material mechanics, true normals from source photos or printer quality.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import sys

import numpy as np
from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh

SCHEMA="local3d.g3.9.adjacent-face-normal-angles.v1"
MAX_FACES=75000
MAX_SHARED_EDGES=120000
THRESHOLDS=(15,30,45,60,90,120,150)


def angle_diagnostic(mesh):
    v=np.asarray(mesh.vertices,dtype=np.float64)
    f=np.asarray(mesh.faces,dtype=np.int64)
    if v.ndim!=2 or v.shape[1]!=3 or f.ndim!=2 or f.shape[1]!=3 or \
       len(f)==0 or len(f)>MAX_FACES or len(v)>100000 or \
       f.min()<0 or f.max()>=len(v) or not np.isfinite(v).all():
        raise QAError("Invalid/unsafe indexed mesh for adjacent-angle screen")
    if not mesh.is_watertight or not mesh.is_winding_consistent:
        raise QAError("Adjacent-angle screen requires consistently wound watertight mesh")
    triangles=v[f]
    normals_raw=np.cross(
        triangles[:,1,:]-triangles[:,0,:],
        triangles[:,2,:]-triangles[:,0,:])
    norms=np.linalg.norm(normals_raw,axis=1)
    scale=float(np.linalg.norm(v.max(axis=0)-v.min(axis=0)))
    if not np.isfinite(scale) or scale<1e-12 or \
       np.any(norms<=max(1e-20,scale*scale*1e-15)):
        raise QAError("Degenerate face cannot receive a reliable angle")
    n=normals_raw/norms[:,None]
    adjacent=np.asarray(mesh.face_adjacency,dtype=np.int64)
    edge_pair_count=len(adjacent)
    if edge_pair_count>MAX_SHARED_EDGES or edge_pair_count!=len(f)*3//2:
        raise QAError("Unexpected edge-adjacency incidence; cannot audit all shared edges")
    if adjacent.ndim!=2 or adjacent.shape[1]!=2 or \
       np.any(adjacent[:,0]==adjacent[:,1]) or \
       np.min(adjacent)<0 or np.max(adjacent)>=len(f):
        raise QAError("Corrupt face-adjacency map")
    projections=np.einsum("ij,ij->i",n[adjacent[:,0]],n[adjacent[:,1]])
    angles=np.degrees(np.arccos(np.clip(projections,-1.,1.)))
    if not np.isfinite(angles).all():
        raise QAError("Nonfinite edge-adjacent dihedral angle")
    percentiles=np.percentile(angles,[50,90,95,99,100])
    counts={f"over{int(deg)}Deg":int(np.count_nonzero(angles>deg))
            for deg in THRESHOLDS}
    return {
        "schema":SCHEMA,
        "faceCount":int(len(f)),
        "edgeAdjacentFacePairs":int(edge_pair_count),
        "allIndexedTwoFaceEdgesExamined":True,
        "angleDegrees":{
            "p50":round(float(percentiles[0]),6),
            "p90":round(float(percentiles[1]),6),
            "p95":round(float(percentiles[2]),6),
            "p99":round(float(percentiles[3]),6),
            "max":round(float(percentiles[4]),6)
        },
        "edgeCountsOverAngleThreshold":counts,
        "fractionOver45Deg":round(counts["over45Deg"]/edge_pair_count,8),
        "scope":"FACE_PAIRS_SHARING_EXACTLY_ONE_INDEXED_EDGE",
        "normals":"FACE_NORMAL_VECTORS_FROM_INDEXED_GLTF_TRIANGLES",
        "tessellationComparisonNotScaleIndependent":True,
        "intentionalSharpCreasesCanExceedThresholds":True,
        "doesNotTestVertexOnlyAdjacency":True,
        "doesNotProveNoFaceFoldover":True,
        "doesNotProveSelfIntersectionFree":True,
        "notPhysicalMillimeterWallThickness":True,
        "notPrintQualified":True,
        "gpuInferenceExecuted":False,
        "printerCommandsIssued":False
    }


def audit_glb(model:Path):
    model=Path(model)
    if model.is_symlink():
        raise QAError("Symlinked model forbidden")
    qa=inspect_glb(model)
    if qa["geometryObjectCount"]!=1 or \
       qa["topology"]["componentCount"]!=1 or \
       qa["topology"]["everyObjectWatertight"] is not True or \
       qa["topology"]["everyObjectWindingConsistent"] is not True:
        raise QAError("Adjacent-angle diagnostic only supports single manifold connected mesh")
    result=angle_diagnostic(_mesh(model))
    result["modelSha256"]=qa["modelSha256"]
    result["modelBytes"]=qa["modelBytes"]
    result["sourceSignedVolumeArbitraryUnitsCubed"]=qa["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    result["printQualified"]=False
    result["approvedForPrinter"]=False
    result["fabricationAction"]="NONE"
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--model",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    report=audit_glb(a.model)
    target=a.out
    if target.is_symlink():
        raise QAError("Symlink proof forbidden")
    raw=json.dumps(report,indent=2,sort_keys=True)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=raw:
            raise QAError("Refusing to overwrite changed adjacent-angle report")
    else:
        target.write_text(raw,encoding="utf-8")
    print("G3_9_EDGE_FACE_NORMAL_DIAGNOSTIC "+json.dumps({
        "sha256":report["modelSha256"],
        "adjacentEdges":report["edgeAdjacentFacePairs"],
        "p95Degrees":report["angleDegrees"]["p95"],
        "over45":report["edgeCountsOverAngleThreshold"]["over45Deg"],
        "over90":report["edgeCountsOverAngleThreshold"]["over90Deg"],
        "printQualified":False,"newGpuInference":False
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,TypeError) as error:
        print("G3_9_ADJACENT_FACE_ANGLES_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
