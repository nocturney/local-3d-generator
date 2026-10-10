"""G3.22 public offline-only, immutable security triage from pinned local sources.

NO network query, GPU/Python package import, model checkpoint, install or OS edits.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import sys

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["PYTHONNOUSERSITE"]="1"

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))

from geometry_qa import QAError
from g322_dependency_reachability import report

EVIDENCE=ROOT/"docs"/"evidence"/"g3"/"g3-22-pinned-python-static-triage.json"


def replay(*,write_public=False):
    r=report(verify_installed=True,verify_upstream=True)
    if (r["historicalVersionLevelMatches"]!=104 or
        r["advisoryIdsActuallyRetainedInPreviousSnapshot"]!=36 or
        r["advisoryIdsOmittedByPreviousSnapshot"]!=68 or
        r["firstPartyPythonFilesASTInspected"]<30 or
        r["allAdvisoriesIndividuallyTriaged"] is not False or
        r["securityGateResolved"] is not False or
        r["newUntrustedImagesApproved"] is not False or
        r["newAiInference"] is not False):
        raise QAError("G3.22 security output unsupported or incomplete")
    raw=json.dumps(r,sort_keys=True,indent=2)+"\n"
    if EVIDENCE.is_symlink():
        raise QAError("G3.22 public proof symlink refused")
    if write_public:
        EVIDENCE.parent.mkdir(parents=True,exist_ok=True)
        if EVIDENCE.exists():
            if EVIDENCE.read_text(encoding="utf-8")!=raw:
                raise QAError("G3.22 immutable public proof mismatched")
        else:
            EVIDENCE.write_text(raw,encoding="utf-8")
    if not EVIDENCE.is_file() or EVIDENCE.read_text(encoding="utf-8")!=raw:
        raise QAError("G3.22 SHA/source proof modified or not yet initialized")
    print("G3_22_HISTORIC_SECURITY_STATIC_TRIAGE_PASS "+json.dumps({
        "freezePinnedVersionsVerified":34,
        "firstPartyPythonSourceFilesInspected":r["firstPartyPythonFilesASTInspected"],
        "historicalOSVPackageVersionMatches":104,
        "sampleAdvisoryIdsRetainedInSnapshot":36,
        "unsavedAdvisoryIds":68,
        "pillowParserDirectInputSurfacePresent":True,
        "allAdvisoriesExploitableOrRemediated":False,
        "securityGateResolved":False,
        "productionDependencyChanges":0,
        "newGPUModelInference":False
    }))
    return r


if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--write-public",action="store_true")
        args=parser.parse_args()
        replay(write_public=args.write_public)
    except (QAError,OSError,ValueError,TypeError,KeyError,MemoryError) as exc:
        print("G3_22_SECURITY_STATIC_TRIAGE_FAILED "+type(exc).__name__+
              ": "+str(exc),file=sys.stderr)
        sys.exit(1)
