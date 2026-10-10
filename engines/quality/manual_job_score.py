"""Explicit, offline, local completed G2 job -> private G3.3 shape score.

NEVER starts TripoSR, Torch, CUDA, network, slicer or printer. A local job's
checksums verify internal consistency, NOT independent hardware execution.
The only 3D ground truths are the eight original synthetic reference scenes;
the ninth upstream chair has no ground-truth 3D and cannot get a 3D score.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import stat
import sys

from geometry_qa import inspect_glb
from shape_metrics import report_one, pinned_original_reference
from silhouette import ROOT, load_catalog, verified_reference

JOBS = ROOT / "runtime" / "data-g2-manual" / "jobs"
PRIVATE_SCORES = ROOT / "runtime" / "qa" / "g3" / "manual-scores"
SOURCE_LOCK = ROOT / "docs" / "TRIPOSR_SOURCE_LOCK.json"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


class ManualBenchmarkError(ValueError):
    pass


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_bytes(file: Path, min_bytes=1, max_bytes=128*1024):
    file=Path(file)
    if file.is_symlink():
        raise ManualBenchmarkError("Symlink artifact is not allowed")
    stat_result=file.stat()
    if not stat.S_ISREG(stat_result.st_mode) or not (min_bytes<=stat_result.st_size<=max_bytes):
        raise ManualBenchmarkError("Unexpected artifact size or type")
    return file.read_bytes()


def read_json(file):
    return json.loads(read_bytes(file).decode("utf8"))


def expected_asset(job, asset_id, blob):
    asset=next((a for a in job["assets"] if a.get("id")==asset_id),None)
    if not asset or asset.get("sha256")!=sha(blob) or asset.get("bytes")!=len(blob):
        raise ManualBenchmarkError("Job manifest artifact SHA/size mismatch: "+asset_id)
    return asset


def evaluate_job(job_dir: Path, *, jobs_root: Path = JOBS):
    jobs_root=Path(jobs_root).resolve(strict=True)
    job_dir=Path(job_dir)
    if job_dir.is_symlink() or not job_dir.is_dir():
        raise ManualBenchmarkError("Untrusted job folder")
    folder=job_dir.resolve(strict=True)
    if folder.parent!=jobs_root or not UUID.fullmatch(folder.name):
        raise ManualBenchmarkError("Only direct UUID manual job folders can be scored")
    job=read_json(folder/"job.json")
    if (job.get("id")!=folder.name or job.get("providerId")!="triposr-local" or
        job.get("simulation") is not False or job.get("status")!="completed" or
        not isinstance(job.get("assets"),list) or job.get("mode")!="image"):
        raise ManualBenchmarkError("Not a completed real-mode TripoSR local job record")
    ext={"image/png":".png","image/jpeg":".jpg","image/webp":".webp"}.get(
        job.get("source",{}).get("mime"))
    if not ext:
        raise ManualBenchmarkError("Unsupported stored source format")
    source=read_bytes(folder/("input"+ext),64,8*1024*1024)
    model=read_bytes(folder/"output.glb",100,64*1024*1024)
    qa_raw=read_bytes(folder/"qa-report.json",10,256*1024)
    expected_asset(job,"source-image",source)
    expected_asset(job,"preview-glb",model)
    expected_asset(job,"qa-report",qa_raw)
    qa=json.loads(qa_raw)
    lock=read_json(SOURCE_LOCK)
    p=qa.get("provenance") or {}
    if (qa.get("schema")!="local3d.qa.v1" or
        qa.get("jobId")!=job["id"] or qa.get("realInference") is not True or
        qa.get("mode")!="REAL_INFERENCE" or qa.get("simulation") is not False or
        qa.get("printQualified") is not False or
        qa.get("approvedForPrinter") is not False or
        p.get("sourceSha256")!=sha(source) or
        p.get("artifactSha256")!=sha(model) or
        p.get("sourceCommit")!=lock["source"]["commit"] or
        p.get("weightsRevision")!=lock["weights"]["revision"] or
        p.get("weightsSha256")!=lock["weights"]["sha256"] or
        p.get("coordinateSystem")!="Y_UP"):
        raise ManualBenchmarkError("Unverified local TripoSR provenance chain")
    catalog=load_catalog()
    entry=next((e for e in catalog["fixtures"] if e["imageSha256"]==sha(source)),None)
    if entry is None:
        raise ManualBenchmarkError("Source photo does not match any licensed G3 reference")
    verified_reference(entry)
    geometrical=inspect_glb(folder/"output.glb")
    if geometrical["modelSha256"]!=sha(model) or geometrical["printQualified"] is not False:
        raise ManualBenchmarkError("Model geometry audit does not match source GLB")
    report={
        "schema":"local3d.g3.manual-job-shape-evaluation.v1",
        "fixtureId":entry["id"],
        "imageSha256":entry["imageSha256"],
        "modelSha256":sha(model),
        "candidateEvidenceLane":"HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION",
        "sourceRights":entry["sourceRights"],
        "hasOriginalGroundTruth3d":False,
        "evaluation":"NO_GROUND_TRUTH_3D",
        "shape":None,
        "topology":{
            "vertices":geometrical["totalVertices"],
            "triangles":geometrical["totalTriangles"],
            "componentCount":geometrical["topology"]["componentCount"],
            "watertight":geometrical["topology"]["everyObjectWatertight"],
            "positiveVolume":geometrical["topology"]["everyObjectPositiveVolume"],
            "boundaryEdges":geometrical["topology"]["boundaryEdges"],
            "nonManifoldEdges":geometrical["topology"]["nonManifoldEdges"]
        },
        "limitations":[
            "Source image and outputs matched local hashes; local manifests are NOT independent GPU execution attestations",
            "This does not establish scale, dimensional accuracy, wall thickness, strength, self-intersections or print readiness",
            "Only project-original synthetic inputs have a legitimate source 3D model for geometric comparison"
        ],
        "modelInferenceExecuted":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE"
    }
    if entry["sourceRights"]=="PROJECT_ORIGINAL_PROCEDURAL":
        _,reference=pinned_original_reference(entry["id"])
        if sha(model)==entry["groundTruthSha256"]:
            raise ManualBenchmarkError(
                "Candidate is byte-identical to original source ground truth; cannot count as AI output"
            )
        details=report_one(
            entry["id"],folder/"output.glb",
            lane="HASH_LINKED_LOCAL_COMPLETED_JOB_NOT_INDEPENDENT_GPU_ATTESTATION"
        )
        report["hasOriginalGroundTruth3d"]=True
        report["evaluation"]="POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC"
        report["shape"]=details["shape"]
    return report


def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--job-id",required=True)
    args=cli.parse_args()
    if not UUID.fullmatch(args.job_id):
        cli.error("--job-id must be a valid local UUID")
    report=evaluate_job(JOBS/args.job_id)
    PRIVATE_SCORES.mkdir(parents=True,exist_ok=True)
    name=report["modelSha256"]+"-"+report["fixtureId"]+".json"
    output=PRIVATE_SCORES/name
    raw=json.dumps(report,indent=2,sort_keys=True)+"\n"
    if output.is_symlink():
        raise ManualBenchmarkError("Symlink output not allowed")
    if output.exists() and output.read_text(encoding="utf8")!=raw:
        raise ManualBenchmarkError("Existing private score differs; refusing overwrite")
    if not output.exists():
        output.write_text(raw,encoding="utf8")
    print("G3_PRIVATE_JOB_EVALUATION "+json.dumps({
        "fixture":report["fixtureId"],
        "hasSource3d":report["hasOriginalGroundTruth3d"],
        "chamfer":report["shape"]["bestView"]["chamferL1Normalized"] if report["shape"] else None,
        "evidenceLane":report["candidateEvidenceLane"],
        "newGpuInference":False,
        "printQualified":False
    }))


if __name__=="__main__":
    try:main()
    except (OSError,ValueError,KeyError,TypeError) as e:
        print("G3_PRIVATE_SCORE_FAILED "+str(e),file=sys.stderr)
        sys.exit(1)
