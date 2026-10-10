"""G3.21 public-only immutable absence-of-calibration source proof.

Reads G3.20 previously verified sanitized SHA report only. It NEVER opens
the private real model job, source image or any operator measurement. Even
a structured future submission merely becomes PENDING_HUMAN_REVIEW.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))
from geometry_qa import QAError
from manual_scale_reference_contract import summarize_registered_sources,write_immutable

PUBLIC_OLD=ROOT/"docs"/"evidence"/"g3"/"orb-01-g320-unit-chord-cpu.json"
PUBLIC_NEW=ROOT/"docs"/"evidence"/"g3"/"orb-01-g321-physical-calibration-missing.json"
MAX_REPORT_SIZE=1024*1024


def replay(*,write_public=False):
    if PUBLIC_OLD.is_symlink() or not PUBLIC_OLD.is_file():
        raise QAError("G3.21 prior public source proof absent/symlinked")
    data=PUBLIC_OLD.read_bytes()
    if not data or len(data)>MAX_REPORT_SIZE:
        raise QAError("G3.21 prior public source proof outside size limits")
    try:
        old=json.loads(data)
    except (ValueError,UnicodeError) as error:
        raise QAError("G3.21 prior public SHA proof malformed") from error
    result=summarize_registered_sources(old)
    result["priorG320PublicEvidenceSha256"]=hashlib.sha256(data).hexdigest()
    if write_public:
        write_immutable(PUBLIC_NEW,result)
    if PUBLIC_NEW.is_symlink() or not PUBLIC_NEW.is_file() or (
            json.loads(PUBLIC_NEW.read_text(encoding="utf-8"))!=result):
        raise QAError("G3.21 immutable public gate proof diverged")
    print("G3_21_FOUR_SOURCE_PHYSICAL_REFERENCE_ABSENT_CPU_PASS "+json.dumps({
        "source":"ONLY_PRIOR_SANITIZED_G320_PUBLIC_SHA_PROOF",
        "fourSourceScaleStatuses":"BLOCKED_MISSING_EXTERNAL_REFERENCE",
        "operatorSubmissionsReviewed":0,
        "modelScaleMmPerUnitApproved":False,
        "printQualified":False,
        "newAiInference":False,
    }))
    return result


if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--write-public",action="store_true")
        args=parser.parse_args()
        replay(write_public=args.write_public)
    except (QAError,OSError,TypeError,KeyError,ValueError,MemoryError) as exc:
        print("G3_21_PUBLIC_CONTRACT_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
