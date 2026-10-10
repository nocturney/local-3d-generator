"""G3.9 CPU-only edge-adjacent angle diagnostic negative/functional checks."""
from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np
import trimesh

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))

from geometry_qa import QAError
from adjacent_face_angles import angle_diagnostic,audit_glb


class EdgeAngleTests(unittest.TestCase):
    def test_known_project_original_sphere_has_mild_adjacent_angles(self):
        source=ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        result=audit_glb(source)
        self.assertEqual(result["modelSha256"],
            "c8834b2668210e58a73ff8b2ab3bcf2d0bc5d2df9a09b3dd0313b425b3664749")
        self.assertEqual(result["faceCount"],1280)
        self.assertEqual(result["edgeAdjacentFacePairs"],1920)
        self.assertEqual(result["angleDegrees"]["p95"],5.731991)
        self.assertEqual(result["edgeCountsOverAngleThreshold"]["over45Deg"],0)
        self.assertEqual(result["edgeCountsOverAngleThreshold"]["over90Deg"],0)
        self.assertTrue(result["allIndexedTwoFaceEdgesExamined"])
        self.assertFalse(result["printQualified"])

    def test_historic_chair_winding_only_version_has_identical_angles(self):
        src=ROOT/"docs/evidence/g2-app/real-app-output.glb"
        dst=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        before=audit_glb(src)
        after=audit_glb(dst)
        self.assertNotEqual(before["modelSha256"],after["modelSha256"])
        self.assertEqual(before["edgeAdjacentFacePairs"],after["edgeAdjacentFacePairs"])
        self.assertEqual(before["angleDegrees"],after["angleDegrees"])
        self.assertEqual(before["edgeCountsOverAngleThreshold"],after["edgeCountsOverAngleThreshold"])
        self.assertFalse(after["printQualified"])

    def test_sharp_intentional_cube_edges_do_not_prove_defect(self):
        mesh=trimesh.creation.box(extents=[1,2,3])
        result=angle_diagnostic(mesh)
        self.assertEqual(result["faceCount"],12)
        self.assertEqual(result["edgeAdjacentFacePairs"],18)
        self.assertEqual(result["edgeCountsOverAngleThreshold"]["over45Deg"],12)
        self.assertEqual(result["angleDegrees"]["max"],90)
        self.assertTrue(result["intentionalSharpCreasesCanExceedThresholds"])
        self.assertTrue(result["doesNotProveNoFaceFoldover"])
        self.assertTrue(result["doesNotProveSelfIntersectionFree"])

    def test_reversed_winding_does_not_improve_normal_angle_difference(self):
        mesh=trimesh.creation.icosphere(subdivisions=2)
        reverse=mesh.copy()
        reverse.invert()
        a=angle_diagnostic(mesh)
        b=angle_diagnostic(reverse)
        self.assertEqual(a["angleDegrees"],b["angleDegrees"])
        self.assertEqual(a["edgeCountsOverAngleThreshold"],b["edgeCountsOverAngleThreshold"])

    def test_same_density_rough_sphere_has_larger_normal_variation(self):
        mesh=trimesh.creation.icosphere(subdivisions=3)
        a=angle_diagnostic(mesh)
        v=mesh.vertices.copy()
        angle=np.arctan2(v[:,1],v[:,0])
        v*=(1+0.17*np.sin(9*angle)*np.sin(5*v[:,2]))[:,None]
        rough=trimesh.Trimesh(vertices=v,faces=mesh.faces,process=False)
        b=angle_diagnostic(rough)
        self.assertGreater(b["angleDegrees"]["p95"],a["angleDegrees"]["p95"]*2)
        self.assertGreater(b["edgeCountsOverAngleThreshold"]["over45Deg"],0)
        self.assertTrue(b["notPrintQualified"])

    def test_open_surface_rejected(self):
        mesh=trimesh.creation.box()
        partial=trimesh.Trimesh(
            vertices=mesh.vertices,faces=mesh.faces[:-1],process=False)
        with self.assertRaisesRegex(QAError,"watertight"):
            angle_diagnostic(partial)

    def test_degenerate_face_is_rejected(self):
        mesh=trimesh.creation.box()
        face=mesh.faces.copy()
        face[0]=[0,0,1]
        defective=trimesh.Trimesh(vertices=mesh.vertices,faces=face,process=False)
        with self.assertRaisesRegex(QAError,"watertight|Degenerate"):
            angle_diagnostic(defective)

    def test_pinned_original_chair_does_not_rewrite_geometry(self):
        model=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=audit_glb(model)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertEqual(r["edgeAdjacentFacePairs"],29958)
        self.assertEqual(r["printQualified"],False)
        self.assertEqual(r["fabricationAction"],"NONE")
        self.assertTrue(r["doesNotTestVertexOnlyAdjacency"])


if __name__=="__main__":
    unittest.main()
