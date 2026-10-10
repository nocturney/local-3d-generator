"""G3.12 exact-source-locked replay on FOUR already existing GLBs, CPU ONLY.

--prepare-private writes immutable reports under gitignored runtime.
Normal replay is read-only, checks every field, never launches a model.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import sys

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["PYTHONNOUSERSITE"] = "1"
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "engines" / "quality"))
from geometry_qa import QAError, digest
from spatial_index_proximity import screen_glb, write_immutable

SHAS = {
    "original": "f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2",
    "corrected": "ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f",
    "reference": "c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749",
    "chair": "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec"
}
PRIVATE = ROOT / "runtime" / "qa" / "g3" / "orb-01-positive-winding"
MODELS = {
    "corrected": PRIVATE / "orb-positive-winding.glb",
    "reference": ROOT / "benchmarks" / "g3" / "fixtures" / "01-orb-alpha" / "ground-truth.glb",
    "chair": ROOT / "docs" / "evidence" / "g3" / "chair-positive-winding.glb"
}
REPORTS = {key: PRIVATE / (key + "-spatial-index.json") for key in SHAS}


def verify(job_id, *, prepare_private=False):
    if not re.fullmatch(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", job_id, re.I):
        raise QAError("Exact previously completed job UUID required")
    folder = ROOT / "runtime" / "data-g2-manual" / "jobs" / job_id
    if folder.is_symlink() or folder.resolve(strict=True) != folder.absolute():
        raise QAError("Noncanonical previous local job")
    job_path = folder / "job.json"
    if job_path.is_symlink():
        raise QAError("Symlinked prior job record forbidden")
    job = json.loads(job_path.read_text(encoding="utf-8"))
    if (job.get("id") != job_id or job.get("status") != "completed" or
            job.get("simulation") is not False or
            job.get("providerId") != "triposr-local"):
        raise QAError("Not a genuinely completed prior manual TripoSR job")
    MODELS["original"] = folder / "output.glb"
    reports = {}
    for kind, path in MODELS.items():
        if path.is_symlink() or not path.is_file() or digest(path) != SHAS[kind]:
            raise QAError("Historical licensed GLB SHA/provenance differs: " + kind)
        report = screen_glb(path)
        if report["modelSha256"] != SHAS[kind] or report["newAiInference"] is not False or (
                report["printQualified"] is not False or
                report["globalSelfIntersectionFreeCertified"] is not False):
            raise QAError("G3.12 safety/source invariant failed")
        if not report["completeDifferentIndexProximityCensus"]:
            raise QAError("G3.12 scan incomplete; cannot publish completed evidence: " + kind)
        saved = REPORTS[kind]
        if prepare_private:
            write_immutable(saved, report)
        if saved.is_symlink() or not saved.is_file():
            raise QAError("Private G3.12 immutable report missing: " + kind)
        if json.loads(saved.read_text(encoding="utf-8")) != report:
            raise QAError("Private CPU replay divergence: " + kind)
        reports[kind] = report

    # Pure global orientation reversal MUST leave point positions and graph
    # adjacency unchanged, not silently clean the source.
    excluded = {"modelSha256", "modelBytes", "signedVolumeArbitraryUnitsCubed"}
    original, copy = reports["original"], reports["corrected"]
    if any(original[k] != copy[k] for k in original if k not in excluded):
        raise QAError("Exact-winding-only derivative changed spatial conclusions")
    print("G3_12_FOUR_MODEL_SPATIAL_CPU_REPLAY_PASS " + json.dumps({
        "realOrbVertices": original["vertexCount"],
        "realOrbCoincidentPairs": original["exactCoincidentDifferentIndexPairs"],
        "realOrbNearPairs": original["nearCoincidentDifferentIndexPairs"],
        "realOrbCrossComponentProximity": original["acrossIndexedComponentsPairs"],
        "allFourModelShaVerified": True,
        "allFourCensusesComplete": True,
        "newInference": False,
        "printQualified": False
    }))


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--job-id", required=True)
        parser.add_argument("--prepare-private", action="store_true")
        args = parser.parse_args()
        verify(args.job_id, prepare_private=args.prepare_private)
    except (QAError, OSError, ValueError, KeyError, TypeError, MemoryError) as exc:
        print("G3_12_CPU_REPLAY_FAILED " + type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
