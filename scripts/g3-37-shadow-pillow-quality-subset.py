"""G3.37 CPU-only Pillow 12.3 shadow quality suite with explicit historical exclusions.

This does NOT upgrade the production environment. Twenty test methods prove
historic Pillow10.1 installed-metadata / byte-for-byte canonical evidence,
rather than semantically validating Pillow12.3. They must remain immutable
and continue to run under production. No test is silently skipped.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
QUALITY=ROOT/"engines/quality"
OVERLAY=(ROOT/"runtime/qa/g3/pillow-shadow/overlay").resolve()
WHEEL=ROOT/"runtime/qa/g3/pillow-shadow/wheels/pillow-12.3.0-cp311-cp311-win_amd64.whl"
EXPECTED_WHEEL_SHA="8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a"
OUT=ROOT/"runtime/qa/g3/g337-shadow-quality-classification.json"
PINNED_CLASS="test_g322_static_security.G322StaticSecurityTests."
PINNED_METHODS={
 "test_g326_safe_image_boundary.G326SafeImageTests.test_three_trusted_formats_have_consistent_header_and_decoder",
 "test_g326_safe_image_boundary.G326SafeImageTests.test_generation_is_deterministic_inside_frozen_pillow_runtime",
 "test_g326_safe_image_boundary.G326SafeImageTests.test_sha_locked_public_proof_matches_offline_recalculation",
 "test_g330_trusted_exchange.G330TrustedCanonicalPython.test_pinned_host_image_generator_deterministic_exact_immutable_public_fixture"
}
def digest(raw:bytes)->str:
 return hashlib.sha256(raw).hexdigest()
def flatten(suite):
 for node in suite:
  if isinstance(node,unittest.TestSuite):
   yield from flatten(node)
  else:yield node
def fail(msg):raise RuntimeError("G337 fail closed "+msg)
def main():
 if sys.version_info[:2]!=(3,11):fail("expected pinned Python3.11")
 if os.environ.get("CUDA_VISIBLE_DEVICES")!="-1":fail("GPU not explicitly disabled")
 if os.environ.get("HF_HUB_OFFLINE")!="1" or os.environ.get("TRANSFORMERS_OFFLINE")!="1":
  fail("Python external dependency remote fetch not disabled")
 if os.environ.get("L3D_ENABLE_TRIPOSR")!="0":fail("G2 must stay disabled")
 import PIL
 if PIL.__version__!="12.3.0" or not Path(PIL.__file__).resolve().is_relative_to(OVERLAY):
  fail("actual interpreter not importing pinned Pillow12.3 shadow overlay")
 if not WHEEL.is_file() or WHEEL.is_symlink() or digest(WHEEL.read_bytes())!=EXPECTED_WHEEL_SHA:
  fail("local existing Pillow12.3 wheel SHA changed")
 # discover but DO NOT invoke a GPU model or historical fixture generator:
 sys.path.insert(0,str(QUALITY))
 suite=unittest.TestLoader().discover(start_dir=str(QUALITY),pattern="test_*.py",top_level_dir=str(QUALITY))
 all_tests=list(flatten(suite))
 ids=[test.id() for test in all_tests]
 if len(ids)!=262 or len(set(ids))!=262:fail("unexpected quality test inventory")
 excluded=[id for id in ids if id.startswith(PINNED_CLASS) or id in PINNED_METHODS]
 pinned_class=[id for id in excluded if id.startswith(PINNED_CLASS)]
 if len(excluded)!=20 or len(pinned_class)!=16 or set(excluded)-set(pinned_class)!=PINNED_METHODS:
  fail("historical Pillow10.1 tests to exclude changed")
 selected=[case for case in all_tests if case.id() not in excluded]
 if len(selected)!=242:fail("unexpected shadow-safe test count")
 # The four individual historical generators were independently observed to
 # raise frozen-version exceptions under 12.3; keep them under 10.1.
 runner=unittest.TextTestRunner(stream=sys.stderr,verbosity=1)
 result=runner.run(unittest.TestSuite(selected))
 if not result.wasSuccessful() or result.testsRun!=242 or result.failures or result.errors or result.skipped:
  fail("shadow subset regression failed; no compatibility grant")
 record={
  "schema":"local3d.g337.existing-shadow-pillow-quality-subset-no-gpu.v1",
  "date":"2026-10-11",
  "actualShadowPillowVersion":PIL.__version__,
  "shadowVersionProvenance":"PROCESS_LOCAL_EXISTING_OVERLAY_PINNED_WHEEL",
  "shadowWheelSha256":EXPECTED_WHEEL_SHA,
  "discoveredQualityTestCases":len(ids),
  "excludedVersionLockedHistoricalCases":len(excluded),
  "excludedVersionLockedHistoricalClassCases":len(pinned_class),
  "excludedIndividualVersionLockedCases":len(PINNED_METHODS),
  "executedShadowPillowTests":result.testsRun,
  "shadowPillowTestsPassed":result.testsRun,
  "historicalVersionLockedTestIds":sorted(excluded),
  "excludedTestReason":"HISTORICAL_PRODUCTION_PILLOW_10_1_METADATA_OR_FIXED_CANONICAL_FIXTURE_SHA_NOT_SHADOW_COMPATIBILITY",
  "originalUnfilteredShadowSuiteDidNotPass":True,
  "originalUnfilteredShadowRunTestsReported":246,
  "originalUnfilteredShadowRunErrors":5,
  "originalUnfilteredErrorsCausedByHistoricalPinnedRuntimeChecks":True,
  "historicalProductionSuiteRetainsSeparateFullRegression":True,
  "productionPythonModified":False,
  "newPackagesInstalled":False,
  "modelWeightsOrCUDAAccessed":False,
  "gpuInferenceRuns":0,
  "networkDependencyFetchAllowed":False,
  "WindowsSandboxVMStarted":False,
  "untrustedMediaProcessed":False,
  "productionUpgradeApproved":False,
  "nativeDecoderOSIsolationProven":False,
  "securityIssue4Resolved":False,
  "printQualified":False
 }
 OUT.parent.mkdir(parents=True,exist_ok=True)
 buf=(json.dumps(record,indent=2,sort_keys=True)+"\n").encode()
 if OUT.exists() or OUT.is_symlink():
  if OUT.read_bytes()!=buf:fail("immutable local private shadow-subset report drift")
 else:
  with OUT.open("xb") as f:f.write(buf)
 print("G337_SHADOW_QUALITY_SUBSET_PASS "+json.dumps({
  "shadow":PIL.__version__,
  "discovered":len(ids),
  "excludedOriginal10_1Historic":len(excluded),
  "shadowPassed":result.testsRun,
  "notFullShadow262Pass":True,
  "cpuOnly":True,
  "gpu":0,
  "snapshotSha256":digest(buf)
 }))
if __name__=="__main__":main()
