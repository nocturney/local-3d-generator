"""CPU-only G3 geometry / fixture contract and negative tests; no CUDA."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
import trimesh
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import geometry_qa
import silhouette
import orientation_derivative


class GeometryTests(unittest.TestCase):
    def test_simple_closed_box_has_positive_volume(self):
        mesh = trimesh.creation.box(extents=[1, 2, 3])
        qa = geometry_qa.inspect_mesh(mesh)
        self.assertTrue(qa["watertightIndexTopology"])
        self.assertTrue(qa["positiveVolume"])
        self.assertEqual(qa["boundaryEdges"], 0)
        self.assertEqual(qa["nonManifoldEdges"], 0)
        self.assertEqual(qa["connectedComponents"], 1)
        self.assertGreater(qa["signedVolumeArbitraryUnitsCubed"], 0)

    def test_reversed_closed_box_still_watertight_but_not_positive_volume(self):
        mesh = trimesh.creation.box(extents=[1, 2, 3])
        mesh.invert()
        qa = geometry_qa.inspect_mesh(mesh)
        self.assertTrue(qa["watertightIndexTopology"])
        self.assertTrue(qa["windingConsistent"])
        self.assertFalse(qa["positiveVolume"])
        self.assertLess(qa["signedVolumeArbitraryUnitsCubed"], 0)

    def test_open_shell_and_duplicate_faces_reported(self):
        source = trimesh.creation.box(extents=[1, 1, 1])
        open_mesh = trimesh.Trimesh(
            vertices=source.vertices, faces=source.faces[1:], process=False
        )
        result = geometry_qa.inspect_mesh(open_mesh)
        self.assertFalse(result["watertightIndexTopology"])
        self.assertGreater(result["boundaryEdges"], 0)
        bad_faces = np.vstack((source.faces, source.faces[0]))
        duplicate = trimesh.Trimesh(vertices=source.vertices, faces=bad_faces, process=False)
        report = geometry_qa.inspect_mesh(duplicate)
        self.assertGreater(report["duplicateFaceIndexTriples"], 0)
        self.assertGreater(report["nonManifoldEdges"], 0)

    def test_real_chair_negative_signed_volume_is_not_print_qualified(self):
        model = ROOT / "docs/evidence/g2-app/real-app-output.glb"
        qa = geometry_qa.inspect_glb(model)
        self.assertEqual(qa["modelSha256"],
                         "ed50855c7e2f6a3cd0ab884a41d44a13c2ea86a3d14f04c05b9e889160429416")
        self.assertEqual(qa["totalTriangles"], 19972)
        self.assertEqual(qa["topology"]["componentCount"], 1)
        self.assertTrue(qa["topology"]["everyObjectWatertight"])
        self.assertTrue(qa["topology"]["everyObjectWindingConsistent"])
        self.assertFalse(qa["topology"]["everyObjectPositiveVolume"])
        self.assertLess(qa["parts"][0]["signedVolumeArbitraryUnitsCubed"], 0)
        self.assertFalse(qa["printQualified"])
        self.assertEqual(qa["notEvaluated"]["wallThickness"], "NOT_TESTED")
        self.assertEqual(qa["notEvaluated"]["realWorldScaleAndUnits"], "UNKNOWN_UNCALIBRATED")

    def test_invalid_glb_fails_before_decode(self):
        with tempfile.TemporaryDirectory() as temp:
            fake = Path(temp) / "fake.glb"
            fake.write_bytes(b"glTF" + (2).to_bytes(4, "little") + (9999).to_bytes(4, "little") + b"\0"*256)
            with self.assertRaisesRegex(geometry_qa.QAError, "length"):
                geometry_qa.inspect_glb(fake)


    def test_orientation_derivative_does_not_modify_original_and_is_draft(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = ROOT / "docs/evidence/g2-app/real-app-output.glb"
            before = geometry_qa.digest(source)
            target = root / "upright-positive-winding.glb"
            proof = root / "derivative.json"
            report = orientation_derivative.correct_negative_winding(source,target,proof)
            after = geometry_qa.inspect_glb(target)
            self.assertEqual(before,geometry_qa.digest(source))
            self.assertEqual(report["sourceSha256"],before)
            self.assertEqual(report["derivedSha256"],after["modelSha256"])
            self.assertTrue(after["topology"]["everyObjectWatertight"])
            self.assertTrue(after["topology"]["everyObjectPositiveVolume"])
            self.assertGreater(after["parts"][0]["signedVolumeArbitraryUnitsCubed"],0)
            self.assertFalse(report["printQualified"])
            self.assertEqual(report["worldUnits"],"UNKNOWN_UNCALIBRATED")
            with self.assertRaisesRegex(geometry_qa.QAError, "overwrite"):
                orientation_derivative.correct_negative_winding(source,target,proof)

    def test_orientation_correction_refuses_already_positive_mesh(self):
        positive=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        self.assertTrue(positive.is_file())
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(geometry_qa.QAError, "negative-volume"):
                orientation_derivative.correct_negative_winding(
                    positive,Path(temp)/"bad.glb",Path(temp)/"bad.json")


class BenchmarkTests(unittest.TestCase):
    def test_catalog_nine_license_attested_sources(self):
        catalog = silhouette.load_catalog()
        self.assertEqual(catalog["fixtureCount"], 9)
        self.assertEqual(
            sum(e["sourceRights"] == "PROJECT_ORIGINAL_PROCEDURAL" for e in catalog["fixtures"]), 8)
        self.assertEqual(
            sum(e["sourceRights"] == "UPSTREAM_TRIPOSR_MIT_SAMPLE" for e in catalog["fixtures"]), 1)
        for entry in catalog["fixtures"]:
            reference = silhouette.verified_reference(entry)
            self.assertTrue(reference.width >= 64 and reference.height >= 64)
            self.assertGreater(reference.getbbox()[2], reference.getbbox()[0])
            if entry["sourceRights"] == "PROJECT_ORIGINAL_PROCEDURAL":
                gt = silhouette.FIXTURES / entry["files"]["groundTruth"]
                self.assertEqual(silhouette.file_hash(gt), entry["groundTruthSha256"])

    def test_positive_controls_reproducible_and_mask_holes(self):
        report = json.loads((ROOT/"docs/evidence/g3/silhouette-positive-controls.json").read_text())
        self.assertEqual(report["controlCount"], 8)
        self.assertTrue(report["notAiInference"])
        self.assertGreater(report["minimumIoU"], .93)
        ids = {r["fixtureId"]: r for r in report["reports"]}
        self.assertEqual(ids["04-torus-hole"]["referenceMaskFeatures"]["holes2D"], 1)
        self.assertEqual(ids["01-orb-alpha"]["bestProjectedView"]["silhouetteIoU"],
                         ids["02-orb-opaque"]["bestProjectedView"]["silhouetteIoU"])

    def test_chair_silhouette_is_explicitly_uncalibrated(self):
        report = json.loads((ROOT/"docs/evidence/g3/chair-silhouette-exploratory.json").read_text())
        self.assertEqual(report["fixtureId"], "09-upstream-chair")
        self.assertEqual(report["evaluation"], "pose_search")
        self.assertEqual(report["testedViews"], 24)
        self.assertIn("EXPLORATORY_UPPER_BOUND", report["metricInterpretation"])
        self.assertFalse(report["printQualified"])
        self.assertGreaterEqual(report["bestProjectedView"]["silhouetteIoU"], 0)
        self.assertLessEqual(report["bestProjectedView"]["silhouetteIoU"], 1)


if __name__ == "__main__":
    unittest.main()
