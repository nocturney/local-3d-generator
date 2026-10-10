"""G3 provisional silhouette comparison, offline CPU; never a print-quality score.

Compare source foreground masks against 3D projected triangle union. Pose/camera
and perspective are unknown for AI meshes; best-over-many projections is only a
diagnostic upper bound and MUST NOT be called objective shape fidelity.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import numpy as np
import trimesh
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "benchmarks/g3/fixtures"
SIZE = 192
MAX_VERTICES = 500_000
MAX_FACES = 1_000_000


class SilhouetteError(ValueError):
    pass


def file_hash(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def load_catalog():
    path = FIXTURES / "manifest.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schema") != "local3d.g3.fixture-catalog.v1" or data.get("fixtureCount") != 9:
        raise SilhouetteError("Invalid or unknown G3 fixture registry")
    return data


def verified_reference(entry: dict):
    id_ = entry["id"]
    if not isinstance(id_, str) or "/" in id_ or "\\" in id_ or ".." in id_:
        raise SilhouetteError("Invalid fixture ID")
    image_ref, mask_ref = entry["files"]["image"], entry["files"]["mask"]
    if entry["sourceRights"] == "PROJECT_ORIGINAL_PROCEDURAL":
        source = FIXTURES / image_ref
        mask = FIXTURES / mask_ref
    elif entry["sourceRights"] == "UPSTREAM_TRIPOSR_MIT_SAMPLE":
        source = ROOT / image_ref
        mask = ROOT / mask_ref
    else:
        raise SilhouetteError("Unverified license status")
    for p in (source,mask):
        if p.is_symlink() or not p.resolve(strict=True).is_relative_to(ROOT.resolve()):
            raise SilhouetteError("Untrusted fixture path")
    if file_hash(source) != entry["imageSha256"] or file_hash(mask) != entry["maskSha256"]:
        raise SilhouetteError("Fixture image or mask modified after provenance lock")
    with Image.open(mask) as pic:
        reference = pic.convert("L")
        if reference.getbbox() is None:
            raise SilhouetteError("Empty reference mask")
        return reference


def load_parts(file):
    file=Path(file).resolve(strict=True)
    if file.stat().st_size > 64 * 1024 * 1024:
        raise SilhouetteError("Model exceeds bounded file budget")
    scene=trimesh.load(file, file_type="glb", force="scene", process=False)
    parts=scene.dump(concatenate=False)
    if hasattr(parts, "faces"):parts=[parts]
    else:parts=list(parts)
    if not parts or len(parts)>64:
        raise SilhouetteError("Invalid geometry object count")
    if sum(len(m.faces) for m in parts)>MAX_FACES or sum(len(m.vertices) for m in parts)>MAX_VERTICES:
        raise SilhouetteError("Mesh outside CPU projection budget")
    for m in parts:
        if not np.isfinite(np.asarray(m.vertices)).all():
            raise SilhouetteError("Nonfinite model vertex")
    return parts


def source_normalized(mask: Image.Image):
    binary=mask.point(lambda x:255 if x>=128 else 0)
    box=binary.getbbox()
    if box is None:raise SilhouetteError("No mask foreground pixels")
    cropped=binary.crop(box)
    scale=(SIZE*.70)/max(cropped.size)
    dims=tuple(max(1,int(round(k*scale))) for k in cropped.size)
    reduced=cropped.resize(dims,Image.Resampling.NEAREST)
    out=Image.new("L",(SIZE,SIZE),0)
    out.paste(reduced,((SIZE-dims[0])//2,(SIZE-dims[1])//2))
    return np.asarray(out)>0


def render_projected(parts, camera_axis):
    vertices=np.vstack([np.asarray(m.vertices,dtype=np.float64) for m in parts])
    center=(vertices.min(axis=0)+vertices.max(axis=0))/2
    forward=-np.asarray(camera_axis,dtype=np.float64)
    forward/=np.linalg.norm(forward)
    right=np.cross(forward,[0,1,0])
    if np.linalg.norm(right)<1e-8:raise SilhouetteError("Degenerate projection camera")
    right/=np.linalg.norm(right)
    up=np.cross(right,forward)
    whole=vertices-center
    scales=np.stack((whole@right,whole@up),axis=1)
    distance=max(float(np.ptp(scales[:,0])),float(np.ptp(scales[:,1])),1e-9)
    factor=(SIZE*.70)/distance
    output=Image.new("L",(SIZE,SIZE),0)
    pen=ImageDraw.Draw(output)
    for mesh in parts:
        local=np.asarray(mesh.vertices,dtype=np.float64)-center
        projected=np.stack([SIZE/2+factor*(local@right),
                            SIZE/2-factor*(local@up)],axis=1)
        for face in mesh.faces:
            a,b,c=projected[face]
            pen.polygon([tuple(a),tuple(b),tuple(c)],fill=255)
    # Normalize projected foreground *exactly* as the source mask. A world-XYZ
    # bounding-box center is not generally a projected silhouette center.
    return source_normalized(output)


def mask_features(mask):
    components=int(ndimage.label(mask)[1])
    fill=ndimage.binary_fill_holes(mask)
    holes=int(ndimage.label(fill & ~mask)[1])
    return {"connectedRegions2D":components,"holes2D":holes,
            "foregroundFraction":round(float(mask.mean()),6)}


def measure(reference, candidate):
    union=int(np.count_nonzero(reference | candidate))
    intersection=int(np.count_nonzero(reference & candidate))
    return round(intersection/union,6) if union else 0.0


def report_one(entry, mesh_file, mode="pose_search"):
    mask=verified_reference(entry)
    reference=source_normalized(mask)
    parts=load_parts(mesh_file)
    if mode=="exact_reference_camera":
        axis=entry.get("cameraAxis")
        if not axis:raise SilhouetteError("Exact source camera not known")
        poses=[("source-camera",axis)]
    elif mode=="pose_search":
        poses=[(f"yaw-{yaw}_elevation-{elev}",[
            math.cos(math.radians(yaw))*5,
            math.sin(math.radians(elev))*5,
            math.sin(math.radians(yaw))*5
        ]) for yaw in range(0,360,45) for elev in (5,25,45)]
    else:raise SilhouetteError("Unknown evaluation type")
    max_score=-1.0;best=None
    for label,axis in poses:
        candidate=render_projected(parts,axis)
        score=measure(reference,candidate)
        if score>max_score:
            max_score=score
            best={"camera":label,"viewAxis":[round(x,5) for x in axis],
                  "silhouetteIoU":score,"projectionFeatures":mask_features(candidate)}
    return {
        "schema":"local3d.g3.silhouette-diagnostic.v1",
        "fixtureId":entry["id"],"fixtureLicense":entry["sourceRights"],
        "imageSha256":entry["imageSha256"],"maskSha256":entry["maskSha256"],
        "modelSha256":file_hash(Path(mesh_file)),
        "evaluation":mode,"testedViews":len(poses),
        "referenceMaskFeatures":mask_features(reference),
        "bestProjectedView":best,
        "metricInterpretation":(
            "POSITIVE_CONTROL_ONLY: known original geometry and exact source camera"
            if mode=="exact_reference_camera" else
            "EXPLORATORY_UPPER_BOUND: fit yaw/elevation after viewing source mask. "
            "No known camera calibration, true geometry ground truth or dimensional fidelity"
        ),
        "printQualified":False,"approvedForPrinter":False
    }


def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--fixture",help="Dataset fixture ID")
    cli.add_argument("--model",type=Path,help="Trusted local GLB to inspect")
    cli.add_argument("--out",type=Path,required=True)
    cli.add_argument("--positive-controls",action="store_true",help="Evaluate all 8 original models (no inference)")
    args=cli.parse_args()
    catalog=load_catalog()
    index={x["id"]:x for x in catalog["fixtures"]}
    if args.positive_controls:
        if args.fixture or args.model:cli.error("Cannot combine positive controls with specific fixture")
        results=[]
        for e in catalog["fixtures"]:
            if e["sourceRights"]!="PROJECT_ORIGINAL_PROCEDURAL":continue
            model=FIXTURES/e["files"]["groundTruth"]
            if model.is_symlink() or file_hash(model)!=e["groundTruthSha256"]:
                raise SilhouetteError("Ground-truth GLB provenance changed")
            results.append(report_one(e,model,mode="exact_reference_camera"))
        output={
            "schema":"local3d.g3.silhouette-positive-controls.v1",
            "notAiInference":True,"controlCount":len(results),
            "minimumIoU":min(r["bestProjectedView"]["silhouetteIoU"] for r in results),
            "reports":results,
            "printQualified":False
        }
    else:
        if not args.fixture or args.fixture not in index or args.model is None:
            cli.error("Requires a known --fixture and --model")
        output=report_one(index[args.fixture],args.model)
    out=args.out.resolve()
    if args.out.is_symlink():raise SilhouetteError("Output symlink not allowed")
    out.parent.mkdir(parents=True,exist_ok=True)
    raw=json.dumps(output,indent=2,sort_keys=True)+"\n"
    if out.exists() and out.read_text(encoding="utf-8")!=raw:
        raise SilhouetteError("Refuse to overwrite a conflicting audit result")
    out.write_text(raw,encoding="utf-8")
    if args.positive_controls:
        print("G3_SILHOUETTE_CONTROLS "+json.dumps({"count":len(results),"minimumIoU":output["minimumIoU"]}))
    else:
        print("G3_SILHOUETTE_EXPLORATORY "+json.dumps({
            "fixture":args.fixture,"bestIoU":output["bestProjectedView"]["silhouetteIoU"],
            "views":output["testedViews"],"printQualified":False
        }))


if __name__=="__main__":
    try:main()
    except (SilhouetteError,OSError,ValueError) as exc:
        print("G3_SILHOUETTE_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
