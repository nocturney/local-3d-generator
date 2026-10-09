"""Pure-CPU Y-up derivative of a validated TripoSR pilot GLB.

Preserves original GLB and SHA audit. Writes a separately recorded derivative,
never overwrites and never qualifies geometry for printing.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import trimesh

ROOT = Path(__file__).resolve().parents[2]
PILOTS = ROOT / "runtime" / "pilots"

def digest(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as handle:
        for piece in iter(lambda: handle.read(2 * 1024 * 1024), b""):
            h.update(piece)
    return h.hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pilot_id")
    args = parser.parse_args()
    if not args.pilot_id.startswith("tripo-") or not all(ch.isalnum() or ch == "-" for ch in args.pilot_id):
        parser.error("Invalid pilot identifier")
    base = (PILOTS / args.pilot_id).resolve(strict=True)
    if not base.is_relative_to(PILOTS.resolve()):
        parser.error("Untrusted pilot path")
    raw = base / "model.glb"
    report = json.loads((base / "qa-report.json").read_text(encoding="utf-8"))
    if digest(raw) != report["artifactSha256"] or report.get("simulation") is not False:
        raise ValueError("Original real-inference artifact failed SHA/provenance validation")
    target = base / "model-upright.glb"
    target_report = base / "upright-report.json"
    if target.exists() or target_report.exists():
        raise FileExistsError("Derived artifact exists; refusing to overwrite")
    scene = trimesh.load(raw, file_type="glb", force="scene", process=False)
    if len(scene.geometry) != 1:
        raise ValueError("Initial pilot expects exactly one mesh")
    rotate = trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0])
    for mesh in scene.geometry.values():
        mesh.apply_transform(rotate)
    binary = scene.export(file_type="glb")
    target.write_bytes(binary)
    verify = trimesh.load(target, file_type="glb", force="scene", process=False)
    all_geometry = list(verify.geometry.values())
    if len(all_geometry) != 1 or len(all_geometry[0].faces) != report["faces"]:
        target.unlink(missing_ok=True)
        raise ValueError("Y-up derivative lost geometry")
    new_mesh = all_geometry[0]
    details = {
        "schema": "local3d.g2.yup-derivative.v1",
        "simulation": False,
        "sourcePilotedModel": raw.name,
        "sourceSha256": report["artifactSha256"],
        "outputFile": target.name,
        "outputSha256": digest(target),
        "bytes": target.stat().st_size,
        "coordinateSystem": "Y_UP",
        "transform": "rotate X -90 degrees from TripoSR Z_UP output",
        "vertices": len(new_mesh.vertices),
        "faces": len(new_mesh.faces),
        "bounds": [float(x) for x in new_mesh.extents],
        "watertight": bool(new_mesh.is_watertight),
        "status": "DRAFT",
        "printQualified": False,
        "note": "Pure CPU post-processing of verified local real-inference GLB. No new model inference."
    }
    target_report.write_text(json.dumps(details, indent=2) + "\n", encoding="utf-8")
    print("YUP_DERIVATIVE_VALIDATED " + json.dumps(details))

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("YUP_DERIVATIVE_FAILED " + type(error).__name__ + ": " + str(error), file=sys.stderr)
        sys.exit(1)
