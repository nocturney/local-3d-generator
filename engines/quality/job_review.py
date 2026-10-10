"""Trusted LOCAL3D API CPU-only review of an existing completed G2 job.

No model inference or print control. Path parameters come from the LOCAL3D
server (NOT client input); only LOCAL3D runtime job records are allowed.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys

from manual_job_score import evaluate_job, ManualBenchmarkError
from shape_metrics import write_immutable_report, ShapeMetricError, ROOT

UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--jobs-root", type=Path, required=True)
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    if not UUID.fullmatch(args.job_id):
        raise ManualBenchmarkError("Unknown job identifier")
    runtime = (ROOT / "runtime").resolve(strict=True)
    if args.jobs_root.is_symlink():
        raise ManualBenchmarkError("Untrusted jobs directory")
    root = args.jobs_root.resolve(strict=True)
    if root.name != "jobs" or not root.is_relative_to(runtime):
        raise ManualBenchmarkError("Only private LOCAL3D runtime job stores may be evaluated")
    job = root / args.job_id
    if args.out.is_symlink() or args.out.resolve() != job / "benchmark-shape.json":
        raise ManualBenchmarkError("Benchmark report must be fixed job sibling path")
    report = evaluate_job(job, jobs_root=root)
    write_immutable_report(args.out, report)
    print("G3_CPU_BENCHMARK_REVIEW_DRAFT " + json.dumps({
        "fixture": report["fixtureId"],
        "modelSha256": report["modelSha256"],
        "evaluation": report["evaluation"],
        "printQualified": False,
        "gpuInferenceExecuted": False
    }))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, ManualBenchmarkError, ShapeMetricError) as error:
        print("G3_CPU_BENCHMARK_REVIEW_FAILED: " + type(error).__name__,
              file=sys.stderr)
        sys.exit(1)
