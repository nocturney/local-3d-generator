"""G3.10 shared-ONE-vertex ray screen: adversarial CPU-only controls.

These deliberately include two non-watertight isolated triangles to test
the lower-level geometric predicate. The standalone GLB audit rejects
nonwatertight meshes; tests NEVER authorize print or GPU.
"""
from __future__ import annotations
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
from vertex_only_ray_screen import (
    screen_vertex_only,screen_existing_glb,immutable_report)


def fixture(a=(0.2,0.4,1.0),b=(0.4,0.2,-1.0)):
    vertices=np.array([
        (0.,0.,0.),(1.,0.,0.),(0.,1.,0.),a,b
    ],dtype=np.float64)
    faces=np.array([[0,1,2],[0,3,4]],dtype=np.int64)
    return vertices,faces


class SharedVertexRayControls(unittest.TestCase):
    def test_crossing_non_coplanar_wedges_reveal_extra_contact_beyond_vertex(self):
        v,f=fixture()
        r=screen_vertex_only(v,f)
        self.assertEqual(r["vertexOnlyPairsEnumerated"],1)
        self.assertEqual(r["vertexOnlyPairsExamined"],1)
        self.assertEqual(r["classification"]["potentialExtraContactAlongNonzeroCommonRay"],1)
        self.assertEqual(r["status"],"POTENTIAL_EXTRA_VERTEX_CONTACT_RAYS")
        self.assertTrue(r["completeVertexOnlyPairClassification"])
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])

    def test_only_common_vertex_contact_not_treated_as_overlap(self):
        v,f=fixture(a=(-.2,-.4,1.),b=(-.4,-.2,-1.))
        r=screen_vertex_only(v,f)
        self.assertEqual(r["vertexOnlyPairsEnumerated"],1)
        self.assertEqual(r["classification"]["potentialExtraContactAlongNonzeroCommonRay"],0)
        self.assertEqual(r["classification"]["separatedRaySectorsWithinNumericalTolerance"],1)
        self.assertEqual(r["status"],"NO_EXTRA_NONCOPLANAR_COMMON_RAYS_FOUND_IN_VERTEX_ONLY_PAIRS")
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_exact_coplanar_wedges_are_unresolved_not_false_clearance(self):
        v,f=fixture(a=(-1.,0.,0.),b=(0.,-1.,0.))
        r=screen_vertex_only(v,f)
        self.assertEqual(r["vertexOnlyPairsEnumerated"],1)
        self.assertEqual(r["classification"]["nearParallelOrCoplanarUnresolvedPairs"],1)
        self.assertEqual(r["status"],"UNRESOLVED_NEAR_COPLANAR_OR_BORDERLINE_VERTEX_PAIRS")
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_edge_collinear_boundary_contact_is_unresolved_not_confident_hit(self):
        v,f=fixture(a=(1.,0.,1.),b=(1.,0.,-1.))
        r=screen_vertex_only(v,f)
        self.assertEqual(r["vertexOnlyPairsEnumerated"],1)
        self.assertEqual(r["classification"]["potentialExtraContactAlongNonzeroCommonRay"],0)
        self.assertGreater(r["classification"]["edgeAlignedRayUncertainPairs"],0)
        self.assertEqual(r["status"],"UNRESOLVED_NEAR_COPLANAR_OR_BORDERLINE_VERTEX_PAIRS")

    def test_fully_edge_adjoining_triangle_pairs_are_excluded(self):
        v=np.array([[0,0,0],[1,0,0],[0,1,0],[0,0,1]],dtype=float)
        f=np.array([[0,1,2],[0,2,3]])
        r=screen_vertex_only(v,f)
        self.assertEqual(r["vertexOnlyPairsEnumerated"],0)
        self.assertEqual(r["fullEdgePairDoubleIncidencesSkipped"],2)
        self.assertEqual(r["vertexOnlyPairsExamined"],0)
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_closed_cube_is_not_called_defective_due_to_shared_vertices(self):
        box=trimesh.creation.box()
        r=screen_vertex_only(box.vertices,box.faces)
        self.assertEqual(r["faceCount"] if "faceCount" in r else r["triangleCount"],12)
        # Trimesh box triangulation has 28 vertex-only face pairs; the
        # exact valence depends on chosen face diagonals.
        self.assertEqual(r["vertexOnlyPairsEnumerated"],28)
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])

    def test_original_procedural_icosphere_has_zero_extra_ray_hits(self):
        sphere=trimesh.creation.icosphere(subdivisions=2)
        r=screen_vertex_only(sphere.vertices,sphere.faces)
        self.assertGreater(r["vertexOnlyPairsEnumerated"],0)
        self.assertEqual(r["classification"]["potentialExtraContactAlongNonzeroCommonRay"],0)
        self.assertTrue(r["completeVertexOnlyPairClassification"])
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_winding_reversal_of_same_geometry_preserves_vertex_ray_results(self):
        sphere=trimesh.creation.icosphere(subdivisions=2)
        first=screen_vertex_only(sphere.vertices,sphere.faces)
        rev=screen_vertex_only(sphere.vertices,sphere.faces[:,::-1])
        self.assertEqual(first["classification"],rev["classification"])
        self.assertEqual(first["vertexOnlyPairsEnumerated"],rev["vertexOnlyPairsEnumerated"])

    def test_pairs_cpu_budget_reports_indeterminate_never_certifies(self):
        sphere=trimesh.creation.icosphere(subdivisions=2)
        r=screen_vertex_only(sphere.vertices,sphere.faces,max_pairs=1)
        self.assertEqual(r["status"],"INDETERMINATE_CPU_BUDGET")
        self.assertEqual(r["incompleteReason"],"VERTEX_ONLY_PAIR_BUDGET_EXCEEDED")
        self.assertFalse(r["completeVertexOnlyPairClassification"])
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_time_budget_reports_indeterminate_not_false_zero_contacts(self):
        sphere=trimesh.creation.icosphere(subdivisions=3)
        r=screen_vertex_only(sphere.vertices,sphere.faces,max_seconds=1e-12)
        self.assertEqual(r["status"],"INDETERMINATE_CPU_BUDGET")
        self.assertFalse(r["completeVertexOnlyPairClassification"])
        self.assertFalse(r["trueSelfIntersectionFreeCertified"])

    def test_degenerate_face_and_invalid_input_fail_closed(self):
        v,f=fixture()
        face=f.copy();face[0]=[0,0,1]
        with self.assertRaisesRegex(QAError,"Degenerate indexed"):
            screen_vertex_only(v,face)
        broken=v.copy();broken[0,0]=float("nan")
        with self.assertRaisesRegex(QAError,"Invalid coordinates"):
            screen_vertex_only(broken,f)
        with self.assertRaisesRegex(QAError,"resource budget"):
            screen_vertex_only(v,f,max_pairs=0)

    def test_immutable_local_report_refuses_changes(self):
        v,f=fixture()
        result=screen_vertex_only(v,f)
        with tempfile.TemporaryDirectory() as tmp:
            dest=Path(tmp)/"screen.json"
            immutable_report(dest,result)
            old=dest.read_bytes()
            immutable_report(dest,result)
            self.assertEqual(dest.read_bytes(),old)
            dest.write_text("TAMPERED",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"refusing overwrite"):
                immutable_report(dest,result)

    def test_previous_real_chair_glb_can_be_scanned_without_gpu(self):
        case=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        report=screen_existing_glb(case)
        self.assertEqual(report["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertEqual(report["vertexOnlyPairsEnumerated"],92629)
        self.assertFalse(report["trueSelfIntersectionFreeCertified"])
        self.assertFalse(report["newAiInference"])
        self.assertFalse(report["printQualified"])


if __name__=="__main__":
    unittest.main()
