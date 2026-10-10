"""G3.11 CPU exact-index shared edge planar backfold diagnostic controls."""
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
from edge_backfold_screen import edge_pair_backfold,screen_glb,write_immutable


def case(other=(.4,.8,0.)):
    v=np.array([[0,0,0],[1,0,0],[.2,1,0],other],dtype=float)
    faces=np.array([[0,1,2],[1,0,3]],dtype=np.int64)
    pairs=np.array([[0,1]],dtype=np.int64)
    return v,faces,pairs


class CoplanarBackfoldTests(unittest.TestCase):
    def test_same_side_coplanar_edge_adjacency_exposes_real_surface_area_overlap_candidate(self):
        v,f,p=case((.4,.8,0.))
        r=edge_pair_backfold(v,f,p)
        self.assertEqual(r["indexedSharedEdgeFacePairs"],1)
        self.assertEqual(r["nearAntiparallelNormalsAtOrAbove175Degrees"],1)
        self.assertEqual(r["facePairsWithThirdVerticesOnSameLateralSide"],1)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],1)
        self.assertEqual(r["maxFaceNormalAngleDegrees"],180)
        self.assertFalse(r["completeMeshSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])
        self.assertEqual(r["privateExamplePossibleOverlapFaceIndices"],[[0,1]])

    def test_valid_planar_adjacent_faces_on_opposite_sides_do_not_flag(self):
        v,f,p=case((.4,-.8,0.))
        r=edge_pair_backfold(v,f,p)
        self.assertEqual(r["facePairsWithThirdVerticesOnOppositeLateralSides"],1)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],0)
        self.assertEqual(r["nearAntiparallelNormalsAtOrAbove175Degrees"],0)
        self.assertEqual(r["maxFaceNormalAngleDegrees"],0)
        self.assertFalse(r["printQualified"])

    def test_non_coplanar_backturn_not_misreported_as_actual_coplanar_overlap(self):
        v,f,p=case((.4,.8,.4))
        r=edge_pair_backfold(v,f,p)
        self.assertEqual(r["facePairsWithThirdVerticesOnSameLateralSide"],1)
        self.assertEqual(r["backturnPairsSameSideAbove150Degrees"],1)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],0)
        self.assertFalse(r["completeMeshSelfIntersectionFreeCertified"])

    def test_coplanar_but_near_collinear_face_edge_is_explicitly_ambiguous(self):
        v,f,p=case((.4,1e-9,0.))
        r=edge_pair_backfold(v,f,p)
        self.assertGreaterEqual(
            r["nearCoplanarBorderlineLateralSidePairsUnresolved"],1)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],0)

    def test_true_valid_box_has_no_coplanar_same_side_backfold_risks(self):
        mesh=trimesh.creation.box()
        r=edge_pair_backfold(mesh.vertices,mesh.faces,mesh.face_adjacency)
        self.assertEqual(r["indexedSharedEdgeFacePairs"],18)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],0)
        self.assertEqual(r["backturnPairsSameSideAbove150Degrees"],0)
        self.assertEqual(r["nearAntiparallelNormalsAtOrAbove175Degrees"],0)
        self.assertFalse(r["completeMeshSelfIntersectionFreeCertified"])

    def test_valid_icosphere_does_not_false_flag_ordinary_adjacent_faces(self):
        m=trimesh.creation.icosphere(subdivisions=2)
        r=edge_pair_backfold(m.vertices,m.faces,m.face_adjacency)
        self.assertEqual(r["possibleCoplanarSameSideAreaOverlapPairs"],0)
        self.assertEqual(r["nearAntiparallelNormalsAtOrAbove175Degrees"],0)

    def test_reversing_all_face_winding_preserves_coplanar_screen(self):
        m=trimesh.creation.icosphere(subdivisions=2)
        reversed_mesh=trimesh.Trimesh(vertices=m.vertices,
                                     faces=m.faces[:,::-1],process=False)
        a=edge_pair_backfold(m.vertices,m.faces,m.face_adjacency)
        b=edge_pair_backfold(reversed_mesh.vertices,reversed_mesh.faces,
                             reversed_mesh.face_adjacency)
        for key in ("indexedSharedEdgeFacePairs",
                    "nearAntiparallelNormalsAtOrAbove175Degrees",
                    "backturnPairsSameSideAbove150Degrees",
                    "possibleCoplanarSameSideAreaOverlapPairs",
                    "facePairsWithThirdVerticesOnSameLateralSide"):
            self.assertEqual(a[key],b[key])

    def test_corrupt_edge_adjacency_is_refused(self):
        v,f,p=case()
        wrong=np.array([[0,0]],dtype=int)
        with self.assertRaisesRegex(QAError,"illegal face/edge indices"):
            edge_pair_backfold(v,f,wrong)
        wrong_faces=np.array([[0,1,2],[1,2,3]])
        # These faces share edge [1,2], so still valid adjacency.
        result=edge_pair_backfold(v,wrong_faces,p)
        self.assertEqual(result["indexedSharedEdgeFacePairs"],1)
        wrong_faces=np.array([[0,1,2],[0,3,4]],dtype=int)
        with self.assertRaisesRegex(QAError,"illegal face/edge indices"):
            edge_pair_backfold(v,wrong_faces,p)

    def test_nonmanifold_or_open_glb_rejected_before_geometry_conclusion(self):
        with tempfile.TemporaryDirectory() as t:
            m=trimesh.creation.box()
            mesh=trimesh.Trimesh(vertices=m.vertices,
                faces=m.faces[:-1],process=False)
            p=Path(t)/"open.glb"
            p.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
            with self.assertRaisesRegex(QAError,"connected, consistently wound"):
                screen_glb(p)

    def test_output_report_is_immutable(self):
        v,f,p=case((.4,.8,0.))
        r=edge_pair_backfold(v,f,p)
        with tempfile.TemporaryDirectory() as t:
            out=Path(t)/"report.json"
            write_immutable(out,r)
            first=out.read_bytes()
            write_immutable(out,r)
            self.assertEqual(first,out.read_bytes())
            out.write_text("CORRUPTED",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"refusing overwrite"):
                write_immutable(out,r)

    def test_historic_real_chair_reference_remains_draft(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
             "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertEqual(r["indexedSharedEdgeFacePairs"],29958)
        self.assertFalse(r["printQualified"])
        self.assertFalse(r["completeMeshSelfIntersectionFreeCertified"])


if __name__=="__main__":
    unittest.main()
