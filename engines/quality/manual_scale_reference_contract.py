"""LOCAL3D G3.21: fail-closed physical-reference attestation contract.

No verified external physical dimension for the old image-generated models.
An arbitrary JSON reference, self-declared mm units, signature-looking hashes
or numeric landmark mapping NEVER constitutes independently verified real-world
scale. This validator offers only STRUCTURAL review readiness, not calibration.

There is deliberately NO code path that emits an mm-per-GLB-unit factor,
print qualification or a physical minimum-wall measurement.
"""
from __future__ import annotations

from datetime import date
import hashlib
import json
import math
from pathlib import Path
import re

import numpy as np

from geometry_qa import QAError

SCHEMA="local3d.g3.21.manual-physical-reference-evidence-contract.v1"
SUBMISSION_SCHEMA="local3d.g3.21.unverified-operator-reference-submission.v1"
MAX_EVIDENCE_BYTES=16384
MAX_VERTICES=100000
MAX_ABS_COORD=1e9
SHA_RE=re.compile(r"^[a-f0-9]{64}$")
METHODS={"PHYSICAL_CALIPER_READOUT","PHYSICAL_RULER_READOUT"}
EXPECTED_REFERENCE_KEYS={
    "measurementType","measuredLengthMm","measurementDate",
    "measurementEvidenceSha256","operatorRecordSha256",
    "landmarkVertexIndexA","landmarkVertexIndexB",
}
EXPECTED_ROOT_KEYS={"schema","modelSha256","reference"}


def _sha(value):
    return isinstance(value,str) and SHA_RE.fullmatch(value) is not None


def _blocked(model_sha,status,*,reason,structurally_valid=False):
    return {
        "schema":SCHEMA,
        "modelSha256":model_sha,
        "status":status,
        "reason":reason,
        "candidateOperatorReferenceStructurallyValid":structurally_valid,
        "measurementSourceIndependentlyVerified":False,
        "operatorIdentityIndependentlyVerified":False,
        "sourceLandmarkPhysicalCorrespondenceIndependentlyVerified":False,
        "modelToPhysicalScaleIndependentlyVerified":False,
        "millimetersPerGLBUnit":None,
        "physicalDimensionMm":None,
        "physicalMinimumWallThicknessMm":None,
        "metadataUnitsCanNeverAutoAuthorizeScale":True,
        "sourceVerifiedUnits":"UNKNOWN_UNCALIBRATED",
        "scaleApprovedForAnyPipeline":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "manualApprovalRequired":True,
        "newAiInference":False,
    }


def review_unverified_submission(model_sha, submission=None, vertices=None):
    """Parse candidate evidence; NEVER approve a physical scale.

    When evidence is absent, explicitly BLOCK. With candidate evidence,
    strict syntax and model-index plausibility checks are possible, but
    independent calibration/identity/photo/physical landmark review is NOT.
    """
    if not _sha(model_sha):
        raise QAError("G3.21 invalid SHA-pinned expected model identifier")
    if submission is None:
        return _blocked(model_sha,"BLOCKED_MISSING_EXTERNAL_REFERENCE",
                        reason="NO_OPERATOR_MEASUREMENT_SUBMISSION")
    if not isinstance(submission,dict) or set(submission)!=EXPECTED_ROOT_KEYS:
        raise QAError("G3.21 unexpected or missing root evidence keys")
    if submission.get("schema")!=SUBMISSION_SCHEMA:
        raise QAError("G3.21 unknown operator reference schema")
    if submission.get("modelSha256")!=model_sha:
        raise QAError("G3.21 operator claim does not match expected model SHA")
    ref=submission.get("reference")
    if not isinstance(ref,dict) or set(ref)!=EXPECTED_REFERENCE_KEYS:
        raise QAError("G3.21 missing reference fields or forbidden approval/PII")
    if ref["measurementType"] not in METHODS:
        raise QAError("G3.21 only explicit physical caliper/ruler methods accepted")
    value=ref["measuredLengthMm"]
    if (isinstance(value,bool) or not isinstance(value,(float,int)) or
        not math.isfinite(value) or not (0<value<=100000)):
        raise QAError("G3.21 invalid claimed physical length")
    if any(not _sha(ref[field]) for field in
           ("measurementEvidenceSha256","operatorRecordSha256")):
        raise QAError("G3.21 unverified evidence identifier malformed")
    try:
        when=date.fromisoformat(ref["measurementDate"])
    except (TypeError, ValueError) as error:
        raise QAError("G3.21 measurement date must be YYYY-MM-DD") from error
    if when>date.today() or when.year<2000:
        raise QAError("G3.21 future/stale declared measurement date")
    ia=ref["landmarkVertexIndexA"]
    ib=ref["landmarkVertexIndexB"]
    if (isinstance(ia,bool) or isinstance(ib,bool) or
        not isinstance(ia,int) or not isinstance(ib,int) or
        ia<0 or ib<0 or ia==ib):
        raise QAError("G3.21 distinct nonnegative integer landmark indices required")
    if vertices is None:
        return _blocked(model_sha,"PENDING_TRUSTED_MESH_MAPPING_REVIEW",
                        reason="TRUSTED_DECODED_MESH_VERTICES_NOT_PROVIDED",
                        structurally_valid=True)
    v=np.asarray(vertices)
    if (v.ndim!=2 or v.shape[1]!=3 or
        len(v)>MAX_VERTICES or len(v)<3 or
        not np.issubdtype(v.dtype,np.number) or
        np.issubdtype(v.dtype,np.bool_)):
        raise QAError("G3.21 unsafe landmark geometry")
    xyz=np.asarray(v,dtype=np.float64)
    if not np.isfinite(xyz).all() or np.max(np.abs(xyz))>MAX_ABS_COORD:
        raise QAError("G3.21 nonfinite or oversized landmark geometry")
    if ia>=len(xyz) or ib>=len(xyz):
        raise QAError("G3.21 operator landmark index outside trusted mesh")
    separation=float(np.linalg.norm(xyz[ia]-xyz[ib]))
    if not math.isfinite(separation) or separation<=1e-12:
        raise QAError("G3.21 duplicate/degenerated mapped reference landmarks")
    # Deliberately do NOT calculate value/separation (even as a preview);
    # that ratio is NOT independently calibrated by a forged sidecar.
    return _blocked(model_sha,"PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW",
                    reason="OPERATOR_CLAIM_AND_GEOMETRIC_INDICES_ARE_ONLY_SYNTAX_CHECKED",
                    structurally_valid=True)


def read_submission_file(path):
    file=Path(path)
    if file.is_symlink():
        raise QAError("G3.21 symlinked operator evidence refused")
    if not file.is_file() or file.stat().st_size>MAX_EVIDENCE_BYTES:
        raise QAError("G3.21 operator evidence exceeds bounded file size")
    try:
        body=json.loads(file.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        raise QAError("G3.21 invalid operator evidence JSON") from exc
    return body


def summarize_registered_sources(proof):
    """Trusted G3.20 public SHA proof only, NO PRIVATE model/job access."""
    if (not isinstance(proof,dict) or
        proof.get("schema")!=
          "local3d.g3.20.historical-scale-provenance-normal-ray-chord-four-models.v1" or
        proof.get("physicalMillimeterScale")!="UNKNOWN_UNCALIBRATED" or
        proof.get("mmPerGLBUnit") is not None or
        proof.get("minimumPhysicalWallThicknessMm") is not None or
        proof.get("printQualified") is not False or
        proof.get("projectOriginalImageRights")!="PROJECT_ORIGINAL_PROCEDURAL" or
        proof.get("historicalCompletedJobAndPriorG319SHARightsVerified") is not True):
        raise QAError("G3.21 prior G3.20 public provenance proof changed")
    lanes={
        "realTripoSR":"realHistoricTripoSROrbModelSha256",
        "positiveWindingDerivative":"sameSurfaceWindingOnlyDerivativeSha256",
        "proceduralGT":"originalProceduralSphereGTSha256",
        "historicalChair":"historicLicensedMITChairSha256",
    }
    result={}
    for lane,field in lanes.items():
        sha=proof.get(field)
        source_label={
            "realTripoSR":"realTripoSR",
            "positiveWindingDerivative":"sameGeometryPositiveWindingDerivative",
            "proceduralGT":"originalProceduralGT",
            "historicalChair":"historicLicensedChair",
        }[lane]
        row=proof.get(source_label)
        if (not _sha(sha) or not isinstance(row,dict) or
            row.get("sourceVerifiedMillimetersPerGLBUnit") is not None or
            row.get("physicalWallThicknessMm") is not None or
            row.get("printQualified") is not False):
            raise QAError("G3.21 previous model SHA/physical scale conflict")
        result[lane]=review_unverified_submission(sha,None)
    return {
        "schema":"local3d.g3.21.four-existing-models-missing-mm-reference.v1",
        "sourceScope":"PRIOR_PUBLIC_SHA_PROOF_ONLY_NO_PRIVATE_SOURCE_REREAD",
        "samePriorSourceRightsAndHashAncestry":True,
        "allRegisteredModelsMissingVerifiedPhysicalScale":True,
        "modelResults":result,
        "reviewedSubmissions":0,
        "untrustedGLBMetadataCannotAutoCreateSubmission":True,
        "physicalMmScaleCertified":False,
        "minimumWallThicknessCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
        "containsUserNamesOrMeasurementMedia":False,
    }


def write_immutable(path,result):
    target=Path(path)
    if target.is_symlink():
        raise QAError("G3.21 symlinked evidence target")
    data=json.dumps(result,sort_keys=True,indent=2)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=data:
            raise QAError("G3.21 existing immutable proof changed")
    else:
        target.write_text(data,encoding="utf-8")
