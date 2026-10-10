"""G3.7 independent CPU-only audit of a *copy-only* winding derivative.

This is stricter than ordinary GLB topology QA: for a single vertex-colored
indexed mesh it requires bitwise-identical coordinates/colors and exactly
reversed face index order. It does NOT repair, change, re-export, slice, use GPU
inference, call a printer, or claim real-world scale / wall-thickness safety.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import numpy as np
import trimesh

from geometry_qa import QAError, inspect_glb

SCHEMA="local3d.g3.7.winding-equivalence.v1"


def _mesh(file: Path):
    file=Path(file)
    if file.is_symlink() or not file.is_file():
        raise QAError("Winding evidence source must be a regular local GLB")
    try:
        scene=trimesh.load(file,file_type="glb",force="scene",process=False)
        objects=scene.dump(concatenate=False)
        objects=[objects] if hasattr(objects,"faces") else list(objects)
    except Exception as exc:
        raise QAError("Winding evidence GLB cannot be parsed") from exc
    if len(objects)!=1:
        raise QAError("Only single-mesh derivative evidence can be compared")
    return objects[0]


def prove_exact_winding_only(original: Path, derivative: Path):
    original=Path(original)
    derivative=Path(derivative)
    if original.resolve(strict=True)==derivative.resolve(strict=True):
        raise QAError("A derivative must differ from the source file")
    before=inspect_glb(original)
    after=inspect_glb(derivative)
    if before["modelSha256"]==after["modelSha256"]:
        raise QAError("GLBs have the same SHA; no separate derivative")
    if before["geometryObjectCount"]!=1 or after["geometryObjectCount"]!=1 or \
       before["topology"]["componentCount"]!=1 or after["topology"]["componentCount"]!=1:
        raise QAError("Winding audit supports one single connected mesh")
    for q in (before,after):
        t=q["topology"]
        if not t["everyObjectWatertight"] or not t["everyObjectWindingConsistent"] or \
           t["boundaryEdges"]!=0 or t["nonManifoldEdges"]!=0 or \
           t["zeroAreaFaces"]!=0 or t["duplicateFaceTriples"]!=0:
            raise QAError("Winding audit requires a clean closed consistent mesh")
        if q["printQualified"] is not False or q["approvedForPrinter"] is not False:
            raise QAError("Unexpected manufacture-ready metadata")
    if before["topology"]["everyObjectPositiveVolume"] or \
       not after["topology"]["everyObjectPositiveVolume"]:
        raise QAError("Expected inward source and outward derivative")
    vol1=before["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    vol2=after["parts"][0]["signedVolumeArbitraryUnitsCubed"]
    if not isinstance(vol1,(int,float)) or not isinstance(vol2,(int,float)) or \
       vol1>=0 or vol2<=0 or abs(vol1+vol2)>1e-6*max(1,abs(vol1)):
        raise QAError("Derivative did not preserve absolute enclosed volume")
    if before["totalVertices"]!=after["totalVertices"] or \
       before["totalTriangles"]!=after["totalTriangles"]:
        raise QAError("Derivative changed the vertex or face count")
    first=_mesh(original)
    second=_mesh(derivative)
    v1=np.asarray(first.vertices,dtype=np.float64)
    v2=np.asarray(second.vertices,dtype=np.float64)
    f1=np.asarray(first.faces,dtype=np.int64)
    f2=np.asarray(second.faces,dtype=np.int64)
    if not np.array_equal(v1,v2):
        raise QAError("Derivative changed/reordered vertex coordinate data")
    if not np.array_equal(f2,f1[:,::-1]):
        raise QAError("Derivative changed faces beyond exact triangle reversal")
    if first.visual.kind!=second.visual.kind:
        raise QAError("Derivative changed vertex-material representation")
    kind=first.visual.kind
    # The TripoSR licensed output uses vertex colors; refuse if these
    # change, since exported geometry color can matter to preview fidelity.
    if kind=="vertex":
        c1=np.asarray(first.visual.vertex_colors)
        c2=np.asarray(second.visual.vertex_colors)
        if not np.array_equal(c1,c2):
            raise QAError("Derivative changed vertex color appearance")
    elif kind in ("face", "texture"):
        raise QAError("Unreviewed GLB visual format not supported")
    a=np.asarray(first.triangles,dtype=np.float64)
    b=np.asarray(second.triangles,dtype=np.float64)
    n1=np.cross(a[:,1]-a[:,0],a[:,2]-a[:,0])
    n2=np.cross(b[:,1]-b[:,0],b[:,2]-b[:,0])
    if not np.allclose(n1,-n2,atol=1e-10,rtol=1e-10):
        raise QAError("Face normals are not exact opposites")
    if any(abs(x-y)>1e-6 for x,y in zip(
        before["globalBoundsArbitraryUnits"]["extents"],
        after["globalBoundsArbitraryUnits"]["extents"]
    )):
        raise QAError("Derivative changed object bounds")
    return {
        "schema":SCHEMA,
        "sourceSha256":before["modelSha256"],
        "derivativeSha256":after["modelSha256"],
        "sameVertexCoordinatesExact":True,
        "sameTriangleGeometryExceptExactReversal":True,
        "faceNormalsExactlyOpposite":True,
        "vertexColorsExactlyPreserved":kind=="vertex",
        "materialVisualKind":kind,
        "sourceVertices":before["totalVertices"],
        "derivativeVertices":after["totalVertices"],
        "sourceTriangles":before["totalTriangles"],
        "derivativeTriangles":after["totalTriangles"],
        "sourceSignedVolumeArbitraryUnitsCubed":vol1,
        "derivativeSignedVolumeArbitraryUnitsCubed":vol2,
        "topologyBefore":{"watertight":True,"positiveVolume":False,
                          "connectedComponents":1,"boundaryEdges":0,"nonManifoldEdges":0},
        "topologyAfter":{"watertight":True,"positiveVolume":True,
                         "connectedComponents":1,"boundaryEdges":0,"nonManifoldEdges":0},
        "transform":"EXACT_TRIANGLE_FACE_ORDER_REVERSE_ONLY",
        "geometricShapeChanged":False,
        "shapeDistanceImprovementClaimed":False,
        "existingSourceVsGroundTruthScoreUnchangedByPureWinding":True,
        "realWorldScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "selfIntersections":"NOT_TESTED",
        "strength":"NOT_TESTED",
        "supports":"NOT_TESTED",
        "printed":False,
        "modelInferenceExecuted":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE"
    }


def write_proof(file: Path, proof: dict):
    file=Path(file)
    if file.is_symlink():
        raise QAError("Symlink evidence output forbidden")
    raw=json.dumps(proof,indent=2,sort_keys=True)+"\n"
    file.parent.mkdir(parents=True,exist_ok=True)
    if file.exists():
        if file.read_text(encoding="utf-8")!=raw:
            raise QAError("Existing evidence differs; refusing overwrite")
        return
    file.write_text(raw,encoding="utf-8")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",type=Path,required=True)
    p.add_argument("--derivative",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    args=p.parse_args()
    proof=prove_exact_winding_only(args.source,args.derivative)
    write_proof(args.out,proof)
    print("G3_7_EXACT_WINDING_ONLY_CPU_PROOF "+json.dumps({
        "original":proof["sourceSha256"],
        "derivative":proof["derivativeSha256"],
        "vertices":proof["sourceVertices"],
        "triangles":proof["sourceTriangles"],
        "sourceSignedVolume":proof["sourceSignedVolumeArbitraryUnitsCubed"],
        "derivativeSignedVolume":proof["derivativeSignedVolumeArbitraryUnitsCubed"],
        "exactVertexColorAndPositions":proof["sameVertexCoordinatesExact"],
        "noInference":True,
        "printQualified":False
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,TypeError) as error:
        print("G3_7_CPU_WINDING_AUDIT_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
