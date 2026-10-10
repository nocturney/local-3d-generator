"""G3.3 shape comparison tests - CPU, original-source fixtures only, no AI."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from uuid import uuid4

import numpy as np
import trimesh

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))

from shape_metrics import (evaluate_surfaces, report_one,
                           pinned_original_reference, ShapeMetricError)
from manual_job_score import evaluate_job, ManualBenchmarkError

def sha(blob):
    return hashlib.sha256(blob).hexdigest()


class SurfaceMetricTests(unittest.TestCase):
    def test_stored_controls_prove_self_identity_and_wrong_shapes(self):
        ev=ROOT/"docs/evidence/g3"
        positive=json.loads((ev/"shape-positive-controls.json").read_text())
        negative=json.loads((ev/"shape-negative-controls.json").read_text())
        self.assertEqual(positive["count"],8)
        self.assertEqual(negative["count"],4)
        self.assertTrue(positive["noAiInference"] and negative["noAiInference"])
        for result in positive["reports"]:
            self.assertEqual(result["shape"]["bestView"]["chamferL1Normalized"],0)
            self.assertEqual(result["shape"]["bestView"]["f1At2Pct"],1)
            self.assertTrue(result["shape"]["sameInputBinary"])
            self.assertTrue(result["shape"]["referenceSelfSimilarityOnly"])
            self.assertFalse(result["printQualified"])
        for result in negative["reports"]:
            self.assertGreater(result["shape"]["bestView"]["chamferL1Normalized"],.06)
            self.assertLess(result["shape"]["bestView"]["f1At2Pct"],.25)
            self.assertFalse(result["shape"]["sameInputBinary"])
            self.assertFalse(result["printQualified"])

    def test_translation_isotropic_scale_and_right_angle_pose_are_hidden(self):
        _,reference=pinned_original_reference("06-thin-chair")
        mesh=trimesh.load(reference,force="scene",process=False)
        with tempfile.TemporaryDirectory() as temp:
            transformed=trimesh.Scene()
            theta=np.pi/2
            rotation=trimesh.transformations.rotation_matrix(theta,[0,1,0])
            translation=trimesh.transformations.translation_matrix([7.,-4.,13.])
            scale=np.eye(4);scale[:3,:3]*=3.5
            for i,item in enumerate(mesh.dump(concatenate=False)):
                item=item.copy()
                item.apply_transform(translation@rotation@scale)
                transformed.add_geometry(item,geom_name=f"synthetic-rotation-{i}")
            candidate=Path(temp)/"candidate.glb"
            candidate.write_bytes(transformed.export(file_type="glb"))
            result=evaluate_surfaces(reference,candidate,samples=768)
            # Scene-export reordering changes deterministic finite surface samples.
            # The transformed mesh must still be substantially nearer than the
            # deliberately different-shape negative controls (min ~0.072).
            self.assertLess(result["bestView"]["chamferL1Normalized"],.025)
            self.assertFalse(result["measuresAbsoluteScale"])
            self.assertIn(result["bestView"]["candidateYawDegrees"],range(0,360,45))
            self.assertEqual(result["selectionPolicy"],"MIN_CHAMFER_OVER_POST_HOC_YAW_SEARCH")

    def test_identical_surface_with_inverted_faces_may_score_perfectly_but_is_not_solid(self):
        _,reference=pinned_original_reference("01-orb-alpha")
        scene=trimesh.load(reference,force="scene",process=False)
        with tempfile.TemporaryDirectory() as temp:
            flipped=trimesh.Scene()
            for m in scene.dump(concatenate=False):
                clone=m.copy();clone.invert();flipped.add_geometry(clone)
            candidate=Path(temp)/"inward.glb"
            candidate.write_bytes(flipped.export(file_type="glb"))
            similarity=evaluate_surfaces(reference,candidate,samples=512)
            self.assertLess(similarity["bestView"]["chamferL1Normalized"],.02)
            self.assertFalse(similarity["printQualified"])
            self.assertFalse(similarity["sameInputBinary"])
            # Surface proximity cannot replace an independently measured
            # mesh-orientation/topology check.
            from geometry_qa import inspect_glb
            report=inspect_glb(candidate)
            self.assertFalse(report["topology"]["everyObjectPositiveVolume"])

    def test_unlicensed_or_unavailable_ground_truth_cannot_get_synthetic_score(self):
        with self.assertRaises(ShapeMetricError):
            pinned_original_reference("09-upstream-chair")
        with self.assertRaises(ShapeMetricError):
            pinned_original_reference("NOT_IN_CATALOG")
        _,reference=pinned_original_reference("04-torus-hole")
        with tempfile.TemporaryDirectory() as temp:
            copied=Path(temp)/"unrelated.glb"
            copied.write_bytes(b"not a real GLB"*16)
            with self.assertRaises(ValueError):
                report_one("04-torus-hole",copied,lane="UNATTESTED_STANDALONE_CANDIDATE_NOT_VERIFIED_AI_EXECUTION")


class ManualRecordTests(unittest.TestCase):
    @staticmethod
    def construct(folder:Path, fixture:str, model:Path):
        folder.mkdir(parents=True,exist_ok=True)
        source=(
            ROOT/"benchmarks/g3/fixtures"/fixture/"input.png" if fixture!="09-upstream-chair"
            else ROOT/"docs/evidence/g2/source-chair.png"
        ).read_bytes()
        model_bytes=model.read_bytes()
        job_id=folder.name
        qa=json.loads((ROOT/"docs/evidence/g2-app/qa-report.json").read_text())
        qa["jobId"]=job_id
        qa["provenance"]["sourceSha256"]=sha(source)
        qa["provenance"]["artifactSha256"]=sha(model_bytes)
        report_bytes=(json.dumps(qa,indent=2)+"\n").encode()
        assets=[
            {"id":kind,"bytes":len(data),"sha256":sha(data)}
            for kind,data in (
                ("source-image",source),("preview-glb",model_bytes),
                ("qa-report",report_bytes)
            )
        ]
        manifest={
            "id":job_id,"status":"completed","mode":"image",
            "providerId":"triposr-local","simulation":False,
            "prompt":"SECRET-CUSTOMER-DESCRIPTION-MUST-NOT-LEAK",
            "source":{"mime":"image/png","name":"private-person-name.png"},
            "assets":assets
        }
        (folder/"input.png").write_bytes(source)
        (folder/"output.glb").write_bytes(model_bytes)
        (folder/"qa-report.json").write_bytes(report_bytes)
        (folder/"job.json").write_text(json.dumps(manifest))
        return manifest

    def test_record_is_hash_linked_but_not_independently_verified_ai_execution(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            folder=root/str(uuid4())
            self.construct(
                folder,"01-orb-alpha",
                ROOT/"docs/evidence/g2-app/real-app-output.glb"
            )
            result=evaluate_job(folder,jobs_root=root)
            self.assertEqual(result["fixtureId"],"01-orb-alpha")
            self.assertTrue(result["hasOriginalGroundTruth3d"])
            self.assertIsNotNone(result["shape"])
            self.assertIn("NOT_INDEPENDENT_GPU_ATTESTATION",result["candidateEvidenceLane"])
            self.assertEqual(result["evaluation"],"POST_HOC_NORMALIZED_3D_SHAPE_DIAGNOSTIC")
            self.assertFalse(result["modelInferenceExecuted"])
            self.assertFalse(result["printQualified"])
            self.assertNotIn("SECRET-CUSTOMER",json.dumps(result))
            self.assertNotIn(folder.name,json.dumps(result))

    def test_upstream_chair_is_explicitly_unscorable_in_3d(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            folder=root/str(uuid4())
            self.construct(folder,"09-upstream-chair",ROOT/"docs/evidence/g2-app/real-app-output.glb")
            result=evaluate_job(folder,jobs_root=root)
            self.assertEqual(result["fixtureId"],"09-upstream-chair")
            self.assertEqual(result["evaluation"],"NO_GROUND_TRUTH_3D")
            self.assertFalse(result["hasOriginalGroundTruth3d"])
            self.assertIsNone(result["shape"])
            self.assertFalse(result["printQualified"])

    def test_fake_ground_truth_copy_must_not_be_reported_as_ai_output(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            folder=root/str(uuid4())
            _,ground_truth=pinned_original_reference("01-orb-alpha")
            self.construct(folder,"01-orb-alpha",ground_truth)
            with self.assertRaisesRegex(ManualBenchmarkError,"byte-identical"):
                evaluate_job(folder,jobs_root=root)

    def test_tampered_artifact_and_invalid_state_fail_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            folder=root/str(uuid4())
            self.construct(folder,"01-orb-alpha",
                ROOT/"docs/evidence/g2-app/real-app-output.glb")
            original=(folder/"output.glb").read_bytes()
            (folder/"output.glb").write_bytes(original[:-1]+bytes([original[-1]^1]))
            with self.assertRaisesRegex(ManualBenchmarkError,"artifact SHA/size"):
                evaluate_job(folder,jobs_root=root)
            self.construct(folder,"01-orb-alpha",
                ROOT/"docs/evidence/g2-app/real-app-output.glb")
            job=json.loads((folder/"job.json").read_text())
            job["status"]="running"
            (folder/"job.json").write_text(json.dumps(job))
            with self.assertRaisesRegex(ManualBenchmarkError,"Not a completed"):
                evaluate_job(folder,jobs_root=root)


if __name__=="__main__":
    unittest.main()
