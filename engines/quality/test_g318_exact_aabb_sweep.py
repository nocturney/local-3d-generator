"""G3.18 exact decoded-float AABB sorted-X sweep adversarial CPU tests."""
from __future__ import annotations

from fractions import Fraction
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
import trimesh

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from geometry_qa import QAError
from exact_aabb_sweep_audit import (
    audit_exact_aabb_sweep,screen_glb,write_immutable
)


def disjoint_indexed_two_triangles(second,first=None):
    a=np.array([[0,0,0],[2,0,0],[0,2,0]] if first is None
               else first,dtype=np.float64)
    b=np.asarray(second,dtype=np.float64)
    return np.vstack((a,b)),np.array([[0,1,2],[3,4,5]],dtype=np.int64)


def brute_fraction_aabb(v,f):
    vv=np.asarray(v,dtype=np.float64)
    ff=np.asarray(f,dtype=np.int64)
    mn=vv[ff].min(axis=1)
    mx=vv[ff].max(axis=1)
    diag=float(np.linalg.norm(vv.max(axis=0)-vv.min(axis=0)))
    tolerance=Fraction.from_float(float(max(1e-12,diag*1e-9)))
    left=[[Fraction.from_float(float(x)) for x in row] for row in mn]
    right=[[Fraction.from_float(float(x)) for x in row] for row in mx]
    exact={"toleranced":0,"strict":0,
           "edge":0,"vertex":0,"zero":0}
    for i in range(len(ff)):
        for j in range(i+1,len(ff)):
            match=all(left[i][axis]<=right[j][axis]+tolerance and
                      left[j][axis]<=right[i][axis]+tolerance
                      for axis in range(3))
            if match:
                exact["toleranced"]+=1
                overlap=len(set(int(k) for k in ff[i])&
                            set(int(k) for k in ff[j]))
                exact[{2:"edge",1:"vertex",0:"zero"}[overlap]]+=1
            if all(left[i][axis]<=right[j][axis] and
                   left[j][axis]<=right[i][axis]
                   for axis in range(3)):
                exact["strict"]+=1
    return exact


class G318ExactAabbSweepTests(unittest.TestCase):
    def assert_matches_brute(self,v,f):
        r=audit_exact_aabb_sweep(v,f)
        b=brute_fraction_aabb(v,f)
        self.assertTrue(r["completeIndependentExactAabbAndNumericalCrosscheck"])
        self.assertEqual(r["status"],
                         "INDEPENDENT_EXACT_AABB_COVERAGE_CROSSCHECK_PASS")
        c=r["sweep"]
        self.assertEqual(c["exactTolerancedBoxPairs"],b["toleranced"])
        self.assertEqual(c["exactStrictBoxPairs"],b["strict"])
        self.assertEqual(c["toleranceSharedEdge"],b["edge"])
        self.assertEqual(c["toleranceOneVertex"],b["vertex"])
        self.assertEqual(c["toleranceNoSharedIndex"],b["zero"])
        self.assertEqual(r["comparison"]["numericMissingStrictNoindex"],0)
        self.assertEqual(r["comparison"]["numericMissingExactToleranceNoindex"],0)
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])
        return r

    def test_two_distinct_indexed_triangles_intersect_true_3d(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["strictNoSharedIndex"],1)

    def test_coplanar_area_overlap_distinct_indexed_vertices(self):
        v,f=disjoint_indexed_two_triangles(
            [[.25,.25,0],[1,.25,0],[.25,1,0]])
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["strictNoSharedIndex"],1)

    def test_same_xyz_but_different_index_only_point_contact(self):
        v,f=disjoint_indexed_two_triangles(
            [[0,0,0],[-1,0,0],[0,-1,0]])
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["toleranceNoSharedIndex"],1)

    def test_shared_original_edge_classification(self):
        v=np.array([[0,0,0],[2,0,0],[0,2,0],[0,-2,0]],float)
        f=np.array([[0,1,2],[1,0,3]],int)
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["toleranceSharedEdge"],1)
        self.assertEqual(r["sweep"]["toleranceNoSharedIndex"],0)

    def test_shared_one_original_vertex_classification(self):
        v=np.array([[0,0,0],[2,0,0],[0,2,0],[-1,0,1],[0,-1,1]],float)
        f=np.array([[0,1,2],[0,3,4]],int)
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["toleranceOneVertex"],1)

    def test_outward_tolerance_detects_near_planes_strict_separation(self):
        eps=2**-35
        v,f=disjoint_indexed_two_triangles(
            [[0,0,eps],[2,0,eps],[0,2,eps]])
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["exactTolerancedBoxPairs"],1)
        self.assertEqual(r["sweep"]["exactStrictBoxPairs"],0)
        self.assertEqual(r["comparison"]["numericNoindexPairs"],1)

    def test_far_parallel_planes_are_not_candidates(self):
        v,f=disjoint_indexed_two_triangles(
            [[0,0,1e-4],[2,0,1e-4],[0,2,1e-4]])
        r=self.assert_matches_brute(v,f)
        self.assertEqual(r["sweep"]["exactTolerancedBoxPairs"],0)
        self.assertEqual(r["sweep"]["exactStrictBoxPairs"],0)

    def test_translation_winding_face_permutation_preserves_counts(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        base=audit_exact_aabb_sweep(v,f)["sweep"]
        reversed_face_order=f[::-1,::-1]
        changed=audit_exact_aabb_sweep(v+np.array([32.,16.,8.]),
                                       reversed_face_order)["sweep"]
        self.assertEqual(base,changed)

    def test_icosphere_independently_brute_force_rational_all_pairs(self):
        mesh=trimesh.creation.icosphere(subdivisions=1)
        r=self.assert_matches_brute(mesh.vertices,mesh.faces)
        self.assertGreater(r["sweep"]["toleranceOneVertex"],0)
        self.assertGreater(r["sweep"]["toleranceSharedEdge"],0)

    def test_procedural_GT_exact_strict_AABB_and_numeric_counts(self):
        p=ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        r=screen_glb(p)
        self.assertTrue(r["allStrictAabbOverlapPairsMathematicallyCoveredForDecodedFiniteXYZ"])
        self.assertEqual(r["sweep"]["exactTolerancedBoxPairs"],7866)
        self.assertEqual(r["sweep"]["toleranceSharedEdge"],1920)
        self.assertEqual(r["sweep"]["toleranceOneVertex"],5730)
        self.assertEqual(r["sweep"]["toleranceNoSharedIndex"],216)
        self.assertEqual(r["comparison"]["numericNoindexPairs"],216)
        self.assertTrue(r["comparison"]["exactNoindexPairIdsEqualNumerical"])

    def test_exact_full_strict_candidate_missing_numerically_is_fail_closed(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        bogus=([],{"aabbPairs":0,"sharedEdgePairs":0,
                   "oneVertexPairs":0,"noIndexPairs":0},None,1e-9)
        with patch("exact_aabb_sweep_audit._candidate_pairs",return_value=bogus):
            r=audit_exact_aabb_sweep(v,f)
        self.assertEqual(r["status"],"INDETERMINATE_SPATIAL_OR_CPU_BUDGET")
        self.assertEqual(r["incompleteReason"],
                         "MISSING_EXACT_TOLERANCE_NOINDEX_IN_G317")
        self.assertFalse(r["completeIndependentExactAabbAndNumericalCrosscheck"])
        self.assertEqual(r["comparison"]["numericMissingStrictNoindex"],1)
        self.assertFalse(r["printQualified"])

    def test_bounded_X_candidate_expansion_is_indeterminate(self):
        v=np.array([[0,0,0],[2,0,0],[0,2,0],
                    [0,0,1],[2,0,1],[0,2,1],
                    [0,0,2],[2,0,2],[0,2,2]],float)
        f=np.array([[0,1,2],[3,4,5],[6,7,8]],int)
        r=audit_exact_aabb_sweep(v,f,max_x_pairs=1)
        self.assertEqual(r["incompleteReason"],"X_AXIS_PAIR_BUDGET")
        self.assertFalse(r["completeIndependentExactAabbAndNumericalCrosscheck"])

    def test_bounded_exact_AABB_expansion_is_indeterminate(self):
        v=np.array([[0,0,0],[2,0,0],[0,2,0],
                    [.1,.1,0],[1,.1,0],[.1,1,0],
                    [.2,.2,0],[1,.2,0],[.2,1,0]],float)
        f=np.array([[0,1,2],[3,4,5],[6,7,8]],int)
        r=audit_exact_aabb_sweep(v,f,max_exact_boxes=1)
        self.assertEqual(r["incompleteReason"],"EXACT_AABB_PAIR_BUDGET")
        self.assertFalse(r["completeIndependentExactAabbAndNumericalCrosscheck"])
        r=audit_exact_aabb_sweep(v,f,max_noindex=1)
        self.assertEqual(r["incompleteReason"],"EXACT_NO_INDEX_PAIR_BUDGET")

    def test_tiny_time_budget_returns_indeterminate_never_clearance(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        r=audit_exact_aabb_sweep(v,f,max_seconds=1e-12)
        self.assertTrue(str(r["incompleteReason"]).startswith("CPU_TIME_BUDGET"))
        self.assertFalse(r["completeIndependentExactAabbAndNumericalCrosscheck"])
        self.assertFalse(r["printQualified"])

    def test_invalid_arrays_duplicate_faces_and_unsafe_budget_rejected(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        with self.assertRaises(QAError):
            audit_exact_aabb_sweep(v,f.astype(float))
        bad=v.copy();bad[0,0]=np.nan
        with self.assertRaises(QAError):
            audit_exact_aabb_sweep(bad,f)
        with self.assertRaises(QAError):
            audit_exact_aabb_sweep(v,np.vstack((f,f[0])))
        with self.assertRaisesRegex(QAError,"unsafe"):
            audit_exact_aabb_sweep(v,f,max_seconds=1000)

    def test_immutable_evidence_tampering_refused(self):
        v,f=disjoint_indexed_two_triangles(
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        r=audit_exact_aabb_sweep(v,f)
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"report.json"
            write_immutable(p,r)
            old=p.read_bytes()
            write_immutable(p,r)
            self.assertEqual(old,p.read_bytes())
            p.write_text("edited",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"cannot be replaced"):
                write_immutable(p,r)

    def test_historical_SHA_pinned_chair_analysed_without_print_release(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])


if __name__=="__main__":
    unittest.main()
