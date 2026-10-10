"""G3.15 exact IEEE754 indexed shared-edge area-overlap adversarial tests."""
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
from exact_indexed_edge_contact import (
    exact_indexed_edge_contacts, screen_glb, immutable
)


def make_pair(other=(.4,.8,0.)):
    v=np.array([[0,0,0],[1,0,0],[.2,1,0],other],dtype=np.float64)
    f=np.array([[0,1,2],[1,0,3]],dtype=np.int64)
    p=np.array([[0,1]],dtype=np.int64)
    return v,f,p


class ExactIndexedEdgeTests(unittest.TestCase):
    def test_exact_coplanar_same_side_positive_area_overlap(self):
        v,f,p=make_pair()
        r=exact_indexed_edge_contacts(v,f,p)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],1)
        self.assertEqual(r["exactCoplanarOppositeSideOnlySharedEdgePairs"],0)
        self.assertEqual(r["exactNoncoplanarOnlySharedEdgePairs"],0)
        self.assertTrue(r["completeIndexedSharedEdgePairClassification"])
        self.assertEqual(r["privateExampleOverlappingIndexedFacePairs"],[[0,1]])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])

    def test_valid_coplanar_opposite_side_meets_only_on_edge(self):
        v,f,p=make_pair((.4,-.8,0.))
        r=exact_indexed_edge_contacts(v,f,p)
        self.assertEqual(r["exactCoplanarOppositeSideOnlySharedEdgePairs"],1)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],0)

    def test_noncoplanar_shared_edge_is_only_common_plane_intersection(self):
        v,f,p=make_pair((.4,.8,.4))
        r=exact_indexed_edge_contacts(v,f,p)
        self.assertEqual(r["exactNoncoplanarOnlySharedEdgePairs"],1)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],0)

    def test_nearly_but_not_exactly_coplanar_is_noncoplanar_in_IEEE754(self):
        v,f,p=make_pair((.4,.8,1e-10))
        r=exact_indexed_edge_contacts(v,f,p)
        self.assertEqual(r["exactNoncoplanarOnlySharedEdgePairs"],1)
        self.assertTrue(r["uncalibratedGLBQuantizationMayChangeTrueCADGeometry"])

    def test_reversing_global_face_winding_preserves_geometric_counts(self):
        for third in ((.4,.8,0.),(.4,-.8,0.),(.4,.8,.4)):
            v,f,p=make_pair(third)
            f2=f[:,::-1]
            a=exact_indexed_edge_contacts(v,f,p)
            b=exact_indexed_edge_contacts(v,f2,p)
            for k in ("exactNoncoplanarOnlySharedEdgePairs",
                      "exactCoplanarOppositeSideOnlySharedEdgePairs",
                      "exactCoplanarSameSidePositiveAreaOverlapPairs"):
                self.assertEqual(a[k],b[k])

    def test_closed_box_valid_right_angles_are_not_faults(self):
        m=trimesh.creation.box()
        pairs=np.sort(np.asarray(m.face_adjacency),axis=1)
        pairs=np.unique(pairs,axis=0)
        r=exact_indexed_edge_contacts(m.vertices,m.faces,pairs)
        self.assertEqual(r["allProvidedIndexedSharedEdgePairs"],18)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],0)
        self.assertGreater(r["exactNoncoplanarOnlySharedEdgePairs"],0)
        self.assertGreater(r["exactCoplanarOppositeSideOnlySharedEdgePairs"],0)
        self.assertFalse(r["printQualified"])

    def test_smooth_procedural_sphere_is_not_falsely_overlapping(self):
        m=trimesh.creation.icosphere(subdivisions=2)
        pairs=np.unique(np.sort(m.face_adjacency,axis=1),axis=0)
        r=exact_indexed_edge_contacts(m.vertices,m.faces,pairs)
        self.assertEqual(r["allProvidedIndexedSharedEdgePairs"],len(m.faces)*3//2)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],0)

    def test_rejects_nonedge_vertex_only_pair(self):
        v=np.array([[0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,1,1]],float)
        f=np.array([[0,1,2],[0,3,4]],int)
        with self.assertRaisesRegex(QAError,"EXACTLY two"):
            exact_indexed_edge_contacts(v,f,[[0,1]])

    def test_rejects_duplicate_pair_and_reversed_pair(self):
        v,f,p=make_pair()
        with self.assertRaisesRegex(QAError,"duplicate indexed-adjacency"):
            exact_indexed_edge_contacts(v,f,[[0,1],[0,1]])
        with self.assertRaisesRegex(QAError,"ordered references"):
            exact_indexed_edge_contacts(v,f,[[1,0]])

    def test_rejects_nans_degenerate_geometry_and_invalid_indices(self):
        v,f,p=make_pair()
        bad=v.copy();bad[0,0]=np.nan
        with self.assertRaisesRegex(QAError,"invalid finite"):
            exact_indexed_edge_contacts(bad,f,p)
        bad=v.copy();bad[3]=bad[2]
        # Duplicate geometric coordinates across different face indexes
        # are valid for a pair-level AABB test (the two faces still have area).
        r=exact_indexed_edge_contacts(bad,f,p)
        self.assertEqual(r["exactCoplanarSameSidePositiveAreaOverlapPairs"],1)
        dup=f.copy();dup[1]=[1,0,0]
        with self.assertRaisesRegex(QAError,"repeated indexed"):
            exact_indexed_edge_contacts(v,dup,p)
        with self.assertRaisesRegex(QAError,"integers"):
            exact_indexed_edge_contacts(v,f.astype(float),p)

    def test_capped_CPU_time_returns_indeterminate_never_clear(self):
        v,f,p=make_pair()
        r=exact_indexed_edge_contacts(v,f,p,max_seconds=1e-12)
        self.assertEqual(r["status"],"INDETERMINATE_CPU_BUDGET")
        self.assertFalse(r["completeIndexedSharedEdgePairClassification"])
        self.assertEqual(r["pairsExaminedByExactBinaryFloatArithmetic"],0)
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])

    def test_resource_limits_refuse_unbounded_pair_budget(self):
        v,f,p=make_pair()
        with self.assertRaisesRegex(QAError,"unsafe"):
            exact_indexed_edge_contacts(v,f,p,max_pairs=MAX_SENTINEL)

    def test_immutable_evidence_refuses_modified_reports(self):
        v,f,p=make_pair()
        r=exact_indexed_edge_contacts(v,f,p)
        with tempfile.TemporaryDirectory() as t:
            file=Path(t)/"report.json"
            immutable(file,r)
            before=file.read_bytes()
            immutable(file,r)
            self.assertEqual(file.read_bytes(),before)
            file.write_text("tampered",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"changed immutable"):
                immutable(file,r)

    def test_historical_real_chair_full_exact_edge_classification_not_print(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertEqual(r["allProvidedIndexedSharedEdgePairs"],29958)
        self.assertTrue(r["completeIndexedSharedEdgePairClassification"])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])


MAX_SENTINEL=150000

if __name__ == "__main__":
    unittest.main()
