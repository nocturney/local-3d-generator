"""G3.20 adversarial CPU-only provenance and sampled chord diagnostics."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
import trimesh

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from geometry_qa import QAError
from unit_scale_and_chord_screen import (
    _read_units_claims,screen_geometry,screen_glb,write_immutable
)


class G320UnitScaleChordTests(unittest.TestCase):
    def setUp(self):
        self.sphere=trimesh.creation.icosphere(subdivisions=1,radius=.86)

    def test_sampled_sphere_chord_never_means_minimum_shell_wall(self):
        r=screen_geometry(self.sphere.vertices,self.sphere.faces)
        sample=r["sampledNormalRayChords"]
        self.assertEqual(sample["status"],"SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE")
        self.assertEqual(sample["probesExamined"],80)
        self.assertGreater(sample["confidentFirstHitSamples"],0)
        self.assertGreater(sample["firstHitChordsArbitraryUnits"]["median"],1.0)
        self.assertTrue(sample["chordsNotLocalWallThickness"])
        self.assertFalse(sample["globalMinWallThicknessMeasured"])
        self.assertIsNone(r["physicalMinWallThicknessMm"])
        self.assertIsNone(r["mmPerGLBUnit"])
        self.assertFalse(r["printQualified"])

    def test_flat_box_has_short_inward_chords_but_no_printing_claim(self):
        box=trimesh.creation.box(extents=[2.,2.,.05])
        vertices=box.vertices.copy()
        # Deliberate slight face offset avoids aligned triangulation
        # boundaries and yields interior first hits on opposite faces.
        vertices[vertices[:,2]>0,0]+=.031
        vertices[vertices[:,2]>0,1]+=.073
        r=screen_geometry(vertices,box.faces)
        s=r["sampledNormalRayChords"]
        self.assertGreater(s["confidentFirstHitSamples"],0)
        self.assertAlmostEqual(s["firstHitChordsArbitraryUnits"]["min"],.05,places=6)
        self.assertFalse(r["minimumWallThicknessTested"])
        self.assertIsNone(r["measuredWallThicknessMinimumArbitraryUnits"])
        self.assertEqual(r["realPhysicalUnitAndScale"],"UNKNOWN_UNCALIBRATED")
        self.assertFalse(r["globalPrintableFeaturePass"])

    def test_symmetric_thin_box_boundary_ray_ambiguity_is_explicit(self):
        box=trimesh.creation.box(extents=[2.,2.,.05])
        report=screen_geometry(box.vertices,box.faces)
        ray=report["sampledNormalRayChords"]
        self.assertEqual(ray["probesExamined"],12)
        self.assertGreater(ray["boundaryAmbiguousSamplesExcluded"],0)
        self.assertIsNone(ray["firstHitChordsArbitraryUnits"])
        self.assertFalse(report["minimumWallThicknessTested"])

    def test_scale_mesh_threefold_scales_probe_values_but_never_proves_mm(self):
        first=screen_geometry(self.sphere.vertices,self.sphere.faces)
        second=screen_geometry(self.sphere.vertices*3.,self.sphere.faces)
        self.assertAlmostEqual(
            second["boundingDiagonalArbitraryUnits"]/
            first["boundingDiagonalArbitraryUnits"],3.,places=7)
        self.assertAlmostEqual(
            second["sampledNormalRayChords"]["firstHitChordsArbitraryUnits"]["median"]/
            first["sampledNormalRayChords"]["firstHitChordsArbitraryUnits"]["median"],
            3.,places=6)
        self.assertAlmostEqual(
            first["sampledNormalRayChords"]["firstHitChordsRelativeToAabbDiagonal"]["median"],
            second["sampledNormalRayChords"]["firstHitChordsRelativeToAabbDiagonal"]["median"],
            places=6)
        self.assertIsNone(second["mmPerGLBUnit"])

    def test_immutable_and_repeatability(self):
        first=screen_geometry(self.sphere.vertices,self.sphere.faces)
        second=screen_geometry(self.sphere.vertices,self.sphere.faces)
        self.assertEqual(first,second)
        with tempfile.TemporaryDirectory() as folder:
            out=Path(folder)/"immutable.json"
            write_immutable(out,first)
            old=out.read_bytes()
            write_immutable(out,second)
            self.assertEqual(old,out.read_bytes())
            out.write_text("changed",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"immutable evidence changed"):
                write_immutable(out,first)

    def test_deceptive_meters_gltf_metadata_does_not_calibrate_size(self):
        with tempfile.TemporaryDirectory() as folder:
            mesh=self.sphere.copy()
            mesh.metadata["units"]="meters"
            file=Path(folder)/"fake-meters.glb"
            file.write_bytes(mesh.export(file_type="glb"))
            r=screen_glb(file)
        self.assertTrue(r["unitProvenance"]["unverifiedExporterOrMeshUnitsPresent"])
        self.assertIn({"field":"units","claim":"meters"},
                      r["unitProvenance"]["unverifiedGltfUnitClaims"])
        self.assertIsNone(r["unitProvenance"]["sourceVerifiedMillimetersPerGLBUnit"])
        self.assertFalse(r["unitProvenance"]["safeToConvertToMillimeters"])
        self.assertIsNone(r["mmPerGLBUnit"])
        self.assertFalse(r["printQualified"])

    def test_deceptive_millimeters_gltf_metadata_does_not_calibrate_size(self):
        with tempfile.TemporaryDirectory() as folder:
            mesh=self.sphere.copy()
            mesh.metadata["units"]="millimeters"
            file=Path(folder)/"fake-millimeters.glb"
            file.write_bytes(mesh.export(file_type="glb"))
            proof=screen_glb(file)
        self.assertIn({"field":"units","claim":"millimeters"},
                      proof["unitProvenance"]["unverifiedGltfUnitClaims"])
        self.assertEqual(proof["unitProvenance"]["independentMeasuredReferenceMm"],"ABSENT")
        self.assertEqual(proof["unitProvenance"]["physicalMillimeterScale"],"UNKNOWN_UNCALIBRATED")

    def test_unrecognized_unit_metadata_never_leaks_arbitrary_text(self):
        with tempfile.TemporaryDirectory() as folder:
            mesh=self.sphere.copy()
            mesh.metadata["units"]="PRIVATE_PERSON_NUMBER_123456"
            file=Path(folder)/"unsafe-metadata.glb"
            file.write_bytes(mesh.export(file_type="glb"))
            proof=screen_glb(file)
        published=json.dumps(proof)
        self.assertNotIn("PRIVATE_PERSON_NUMBER_123456",published)
        self.assertIn({"field":"units","claim":"OTHER_UNVERIFIED_STRING"},
                      proof["unitProvenance"]["unverifiedGltfUnitClaims"])

    def test_negative_signed_volume_blocks_inward_ray_not_edge_census(self):
        inverse=trimesh.Trimesh(vertices=self.sphere.vertices,
                                faces=self.sphere.faces[:,::-1],process=False)
        self.assertFalse(inverse.is_volume)
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/"inverted.glb"
            p.write_bytes(inverse.export(file_type="glb"))
            r=screen_glb(p)
        self.assertFalse(r["sourcePositiveSignedVolumeForInwardRays"])
        self.assertFalse(r["outwardNormalOrientationRequiredAndVerifiedForRays"])
        self.assertEqual(r["status"],"INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION")
        self.assertIsNone(r["sampledNormalRayChords"]["firstHitChordsArbitraryUnits"])
        self.assertIsNotNone(r["triangulationEdgeLengthsArbitraryUnits"])
        self.assertFalse(r["printQualified"])

    def test_time_budget_indeterminate_not_clearance(self):
        r=screen_geometry(self.sphere.vertices,self.sphere.faces,max_seconds=1e-12)
        self.assertEqual(r["status"],"INDETERMINATE_CPU_RAY_BUDGET")
        self.assertIsNone(r["sampledNormalRayChords"]["firstHitChordsArbitraryUnits"])
        self.assertFalse(r["minimumWallThicknessTested"])
        self.assertFalse(r["printQualified"])

    def test_test_count_budget_indeterminate(self):
        r=screen_geometry(self.sphere.vertices,self.sphere.faces,max_ray_tests=1)
        self.assertEqual(r["status"],"INDETERMINATE_CPU_RAY_BUDGET")
        self.assertEqual(r["sampledNormalRayChords"]["incompleteReason"],
                         "RAY_TRIANGLE_TESTS_CAP")
        self.assertIsNone(r["sampledNormalRayChords"]["confidentFirstHitSamples"])

    def test_explicit_orientation_disabled_does_not_cast_ray(self):
        r=screen_geometry(self.sphere.vertices,self.sphere.faces,probe_normals=False)
        self.assertEqual(r["status"],"INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION")
        self.assertEqual(r["sampledNormalRayChords"]["rayTriangleTestsCompleted"],0)
        self.assertFalse(r["outwardNormalOrientationRequiredAndVerifiedForRays"])

    def test_invalid_geometry_indices_nan_oversized_budget_rejected(self):
        v=self.sphere.vertices
        f=self.sphere.faces
        with self.assertRaises(QAError):
            screen_geometry(v,f.astype(float))
        x=np.asarray(v).copy();x[0,0]=np.nan
        with self.assertRaises(QAError):
            screen_geometry(x,f)
        with self.assertRaises(QAError):
            screen_geometry(v,np.array([[0,1,999999]],dtype=int))
        with self.assertRaisesRegex(QAError,"budget"):
            screen_geometry(v,f,max_probes=1000)

    def test_open_shell_rejected_from_trusted_glb_screen(self):
        mesh=self.sphere.copy()
        mesh.update_faces(np.arange(len(mesh.faces)-1))
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/"open.glb"
            p.write_bytes(mesh.export(file_type="glb"))
            with self.assertRaisesRegex(QAError,"verified closed"):
                screen_glb(p)

    def test_source_procedural_gt_rejects_mm_and_detects_long_solid_chord(self):
        p=ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
                         "c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749")
        self.assertEqual(r["status"],"SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE")
        self.assertGreater(
            r["sampledNormalRayChords"]["firstHitChordsArbitraryUnits"]["median"],1.6)
        self.assertIsNone(r["physicalMinWallThicknessMm"])
        self.assertFalse(r["unitProvenance"]["safeToConvertToMillimeters"])

    def test_prior_licensed_chair_glb_claims_meters_without_real_scale_proof(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
                         "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertIn({"field":"units","claim":"meters"},
                      r["unitProvenance"]["unverifiedGltfUnitClaims"])
        self.assertEqual(r["status"],"SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE")
        self.assertIsNone(r["mmPerGLBUnit"])
        self.assertFalse(r["printQualified"])


if __name__=="__main__":
    unittest.main()
