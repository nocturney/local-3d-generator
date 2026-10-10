"""G3.21 manual calibration evidence contract — fail-closed adversarial tests."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))

from geometry_qa import QAError
from manual_scale_reference_contract import (
    read_submission_file,review_unverified_submission,
    summarize_registered_sources,write_immutable,
    SUBMISSION_SCHEMA
)

MODEL="a"*64
V=np.array([[0.,0.,0.],[1.,0.,0.],[0.,1.,0.],[0.,0.,1.]])

def candidate():
    return {
        "schema":SUBMISSION_SCHEMA,
        "modelSha256":MODEL,
        "reference":{
            "measurementType":"PHYSICAL_CALIPER_READOUT",
            "measuredLengthMm":25.0,
            "measurementDate":"2026-10-10",
            "measurementEvidenceSha256":"b"*64,
            "operatorRecordSha256":"c"*64,
            "landmarkVertexIndexA":0,
            "landmarkVertexIndexB":1,
        },
    }


class G321CalibrationContractTests(unittest.TestCase):
    def test_absent_evidence_blocks_real_mm_and_printer(self):
        a=review_unverified_submission(MODEL,None)
        self.assertEqual(a["status"],"BLOCKED_MISSING_EXTERNAL_REFERENCE")
        self.assertIsNone(a["millimetersPerGLBUnit"])
        self.assertIsNone(a["physicalDimensionMm"])
        self.assertFalse(a["scaleApprovedForAnyPipeline"])
        self.assertFalse(a["printQualified"])
        self.assertEqual(a["fabricationAction"],"NONE")

    def test_fake_caliper_reference_without_geometry_requires_mapping_review(self):
        a=review_unverified_submission(MODEL,candidate())
        self.assertEqual(a["status"],"PENDING_TRUSTED_MESH_MAPPING_REVIEW")
        self.assertTrue(a["candidateOperatorReferenceStructurallyValid"])
        self.assertFalse(a["measurementSourceIndependentlyVerified"])
        self.assertIsNone(a["millimetersPerGLBUnit"])

    def test_syntactically_good_mapping_still_never_calibrates_physical_units(self):
        a=review_unverified_submission(MODEL,candidate(),V)
        self.assertEqual(a["status"],"PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW")
        self.assertTrue(a["candidateOperatorReferenceStructurallyValid"])
        self.assertFalse(a["modelToPhysicalScaleIndependentlyVerified"])
        self.assertIsNone(a["millimetersPerGLBUnit"])
        self.assertIsNone(a["physicalDimensionMm"])
        self.assertIsNone(a["physicalMinimumWallThicknessMm"])
        self.assertFalse(a["printQualified"])

    def test_stale_or_mismatching_model_sha_fails_closed(self):
        with self.assertRaises(QAError):
            review_unverified_submission("bad",None)
        p=candidate();p["modelSha256"]="d"*64
        with self.assertRaisesRegex(QAError,"does not match"):
            review_unverified_submission(MODEL,p,V)

    def test_forged_approved_for_printer_and_mm_factor_root_keys_rejected(self):
        p=candidate();p["approvedForPrinter"]=True
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)
        p=candidate();p["mmPerGLBUnit"]=1.0
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)

    def test_unrecognized_reference_fields_including_email_are_rejected(self):
        p=candidate();p["reference"]["email"]="private@example.com"
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)
        p=candidate();del p["reference"]["operatorRecordSha256"]
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)

    def test_untrusted_image_estimate_or_meter_unit_method_cannot_self_authorize(self):
        p=candidate();p["reference"]["measurementType"]="AI_ESTIMATED_FROM_IMAGE"
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)
        p=candidate();p["reference"]["measurementType"]="meters"
        with self.assertRaises(QAError):
            review_unverified_submission(MODEL,p,V)

    def test_zero_nan_bool_negative_overbudget_fake_length_rejected(self):
        for v in (0.,-1.,float("nan"),float("inf"),True,100001,"25"):
            p=candidate();p["reference"]["measuredLengthMm"]=v
            with self.subTest(v=str(v)):
                with self.assertRaises(QAError):
                    review_unverified_submission(MODEL,p,V)

    def test_forged_signature_looks_like_hash_but_still_only_pending(self):
        p=candidate()
        p["reference"]["operatorRecordSha256"]="f"*64
        r=review_unverified_submission(MODEL,p,V)
        self.assertEqual(r["status"],"PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW")
        self.assertFalse(r["operatorIdentityIndependentlyVerified"])
        self.assertFalse(r["sourceLandmarkPhysicalCorrespondenceIndependentlyVerified"])

    def test_invalid_evidence_sha_and_date_rejected(self):
        for field in ("measurementEvidenceSha256","operatorRecordSha256"):
            p=candidate();p["reference"][field]="not-hash"
            with self.assertRaises(QAError):
                review_unverified_submission(MODEL,p,V)
        for d in ("1900-01-01","2099-01-01","not-date"):
            p=candidate();p["reference"]["measurementDate"]=d
            with self.assertRaises(QAError):
                review_unverified_submission(MODEL,p,V)

    def test_landmark_indices_bools_duplicated_out_of_bounds_rejected(self):
        for indices in ((0,0),(-1,1),(0,99),(True,1),(1,False)):
            p=candidate()
            p["reference"]["landmarkVertexIndexA"]=indices[0]
            p["reference"]["landmarkVertexIndexB"]=indices[1]
            with self.subTest(indices=indices):
                with self.assertRaises(QAError):
                    review_unverified_submission(MODEL,p,V)

    def test_coincident_geometry_points_do_not_prove_calibration(self):
        x=V.copy();x[1]=x[0]
        with self.assertRaisesRegex(QAError,"duplicate"):
            review_unverified_submission(MODEL,candidate(),x)

    def test_untrusted_nonfinite_and_boolean_geometry_rejected(self):
        for v in (np.array([[0,0,0],[1,0,0],[0,1,0]],dtype=bool),
                  np.array([[0,0,0],[float("nan"),0,0],[0,1,0]])):
            with self.assertRaises(QAError):
                review_unverified_submission(MODEL,candidate(),v)

    def test_file_input_bounded_json_and_non_symlink(self):
        with tempfile.TemporaryDirectory() as root:
            path=Path(root)/"submission.json"
            path.write_text(json.dumps(candidate()),encoding="utf-8")
            loaded=read_submission_file(path)
            self.assertEqual(loaded["modelSha256"],MODEL)
            path.write_bytes(b"x"*16385)
            with self.assertRaises(QAError):
                read_submission_file(path)
            path.write_text("{bad json",encoding="utf-8")
            with self.assertRaises(QAError):
                read_submission_file(path)

    def test_G320_4_real_prior_models_all_still_blocked(self):
        p=ROOT/"docs/evidence/g3/orb-01-g320-unit-chord-cpu.json"
        prior=json.loads(p.read_text(encoding="utf-8"))
        r=summarize_registered_sources(prior)
        self.assertEqual(len(r["modelResults"]),4)
        for status in r["modelResults"].values():
            self.assertEqual(status["status"],"BLOCKED_MISSING_EXTERNAL_REFERENCE")
            self.assertFalse(status["scaleApprovedForAnyPipeline"])
            self.assertIsNone(status["millimetersPerGLBUnit"])
            self.assertFalse(status["printQualified"])
        self.assertFalse(r["physicalMmScaleCertified"])
        self.assertFalse(r["minimumWallThicknessCertified"])

    def test_tampered_prior_sha_units_or_print_status_rejected(self):
        source=ROOT/"docs/evidence/g3/orb-01-g320-unit-chord-cpu.json"
        raw=json.loads(source.read_text(encoding="utf-8"))
        for field,bad in (
            ("mmPerGLBUnit",25.),
            ("physicalMillimeterScale","VERIFIED"),
            ("printQualified",True),
            ("historicalCompletedJobAndPriorG319SHARightsVerified",False)
        ):
            tampered=json.loads(json.dumps(raw))
            tampered[field]=bad
            with self.subTest(field=field):
                with self.assertRaises(QAError):
                    summarize_registered_sources(tampered)

    def test_immutable_public_report_never_silently_overwritten(self):
        source=ROOT/"docs/evidence/g3/orb-01-g320-unit-chord-cpu.json"
        r=summarize_registered_sources(json.loads(source.read_text(encoding="utf-8")))
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/"safe.json"
            write_immutable(p,r)
            before=p.read_bytes()
            write_immutable(p,r)
            self.assertEqual(before,p.read_bytes())
            p.write_text("changed",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"immutable proof changed"):
                write_immutable(p,r)


if __name__=="__main__":
    unittest.main()
