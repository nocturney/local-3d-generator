"""Conservative CPU-only, opt-in winding derivative for an existing GLB.

This ONLY reverses triangle winding on a closed single-component, single-scene
mesh with consistent-but-inward faces. Source never overwritten. Never certifies
printing, wall thickness, scale, materials or geometric self-intersections.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import sys
import trimesh

from geometry_qa import QAError, inspect_glb, digest


def correct_negative_winding(source: Path, target: Path, report_path: Path):
    source=source.resolve(strict=True)
    target=target.resolve()
    report_path=report_path.resolve()
    if source==target or target==report_path:
        raise QAError("Source, target and report must be different files")
    if target.suffix.lower()!=".glb" or report_path.suffix.lower()!=".json":
        raise QAError("Expected .glb output and .json report")
    if target.is_symlink() or report_path.is_symlink() or target.exists() or report_path.exists():
        raise QAError("Refusing to overwrite existing derivative/report")
    before=inspect_glb(source)
    if before["geometryObjectCount"]!=1 or before["topology"]["componentCount"]!=1:
        raise QAError("Requires one closed connected mesh")
    part=before["parts"][0]
    if not part["watertightIndexTopology"] or not part["windingConsistent"] or \
       part["positiveVolume"] or part["signedVolumeArbitraryUnitsCubed"] is None or \
       part["signedVolumeArbitraryUnitsCubed"]>=0 or \
       part["boundaryEdges"] or part["nonManifoldEdges"] or part["zeroAreaFacesScaleRelative"]:
        raise QAError("Requires closed, consistently inward-wound negative-volume model")
    scene=trimesh.load(source,file_type="glb",force="scene",process=False)
    meshes=scene.dump(concatenate=False)
    if hasattr(meshes,"faces"):
        meshes=[meshes]
    else:
        meshes=list(meshes)
    if len(meshes)!=1:
        raise QAError("Multi-mesh scene is not supported by conservative winding repair")
    mesh=meshes[0].copy()
    mesh.invert()
    if not mesh.is_watertight or not mesh.is_volume or not mesh.is_winding_consistent:
        raise QAError("Inverted mesh failed topology checks")
    converted=trimesh.Scene(mesh).export(file_type="glb")
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(converted)
    try:
        after=inspect_glb(target)
        verified=(after["totalVertices"]==before["totalVertices"] and
                  after["totalTriangles"]==before["totalTriangles"] and
                  after["topology"]["everyObjectWatertight"] and
                  after["topology"]["everyObjectPositiveVolume"] and
                  after["topology"]["everyObjectWindingConsistent"])
        if not verified:
            raise QAError("Derivative topology or geometry changed unexpectedly")
        if any(abs(a-b)>1e-5 for a,b in zip(
            before["globalBoundsArbitraryUnits"]["extents"],
            after["globalBoundsArbitraryUnits"]["extents"])):
            raise QAError("Derivative unexpectedly changed mesh bounding extents")
        provenance={
            "schema":"local3d.g3.orientation-derivative.v1",
            "sourceSha256":before["modelSha256"],
            "derivedSha256":after["modelSha256"],
            "sourceFilename":source.name,
            "derivedFilename":target.name,
            "transformation":"INVERT_TRIANGLE_WINDING_ON_CLOSED_NEGATIVE_VOLUME_MESH",
            "vertices":after["totalVertices"],"triangles":after["totalTriangles"],
            "sourceSignedVolumeArbitraryUnitsCubed":part["signedVolumeArbitraryUnitsCubed"],
            "derivedSignedVolumeArbitraryUnitsCubed":after["parts"][0]["signedVolumeArbitraryUnitsCubed"],
            "preservedAabbExtents":after["globalBoundsArbitraryUnits"]["extents"],
            "sourceWasWatertight":True,"derivedWatertight":True,
            "sourcePositiveVolume":False,"derivedPositiveVolume":True,
            "selfIntersections":"NOT_TESTED",
            "wallThickness":"NOT_TESTED",
            "worldUnits":"UNKNOWN_UNCALIBRATED",
            "printQualified":False,"approvedForPrinter":False,
            "fabricationAction":"NONE",
            "note":"Derivative is NOT automatic model repair or a manufacturing qualification. Original is unchanged."
        }
        report_path.parent.mkdir(parents=True,exist_ok=True)
        report_path.write_text(json.dumps(provenance,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        return provenance
    except Exception:
        target.unlink(missing_ok=True)
        raise


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--model",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    parser.add_argument("--report",type=Path,required=True)
    args=parser.parse_args()
    provenance=correct_negative_winding(args.model,args.out,args.report)
    print("G3_ORIENTATION_DERIVATIVE_DRAFT "+json.dumps({
        "source":provenance["sourceSha256"],
        "derivative":provenance["derivedSha256"],
        "sourceVolume":provenance["sourceSignedVolumeArbitraryUnitsCubed"],
        "derivedVolume":provenance["derivedSignedVolumeArbitraryUnitsCubed"],
        "printQualified":False
    }))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError) as error:
        print("G3_ORIENTATION_DERIVATIVE_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
