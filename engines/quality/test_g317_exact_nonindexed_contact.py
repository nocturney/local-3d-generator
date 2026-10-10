"""G3.17 exact nonindexed AABB candidate and triangle pair adversarial tests."""
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
from exact_nonindexed_contact import (
    classify_two_exact, exact_nonindexed_census, screen_glb, write_immutable
)


A=np.array([[0.,0.,0.],[2.,0.,0.],[0.,2.,0.]])
def pair(B):
    return np.vstack((A,np.asarray(B,dtype=float))),np.array(
        [[0,1,2],[3,4,5]],dtype=np.int64)


def brute_aabb_classes(v,f):
    xyz=np.asarray(v,dtype=float)[f]
    low,high=xyz.min(axis=1),xyz.max(axis=1)
    diag=float(np.linalg.norm(np.asarray(v).max(axis=0)-
                               np.asarray(v).min(axis=0)))
    tol=max(1e-12,diag*1e-9)
    result=dict(aabb=0,edge=0,vertex=0,zero=0)
    for i in range(len(f)):
        for j in range(i+1,len(f)):
            if np.all(low[i]<=high[j]+tol) and np.all(low[j]<=high[i]+tol):
                result["aabb"]+=1
                shared=len(set(int(x) for x in f[i]) &
                           set(int(x) for x in f[j]))
                result[{0:"zero",1:"vertex",2:"edge"}[shared]]+=1
    return result


class ExactNonindexedTests(unittest.TestCase):
    def test_strict_noncoplanar_line_crossing_triangle_interiors(self):
        B=[[.5,.5,-1],[.5,.5,1],[1.5,.5,1]]
        self.assertEqual(classify_two_exact(A,B),
          "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        self.assertTrue(r["completeNumericalCandidateEnumerationAndExactNarrowphase"])
        self.assertEqual(r["exactClassificationCounts"].get(
          "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION"),1)
        self.assertEqual(r["exactPositiveLengthOrAreaContactsAmongCandidates"],1)
        self.assertFalse(r["printQualified"])

    def test_coplanar_one_triangle_inside_another_is_positive_area(self):
        B=[[.25,.25,0],[1,.25,0],[.25,1,0]]
        self.assertEqual(classify_two_exact(A,B),
                         "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        self.assertEqual(r["exactClassificationCounts"].get(
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"),1)

    def test_coplanar_same_geometric_edge_distinct_ids_is_long_line(self):
        B=[[0,0,0],[2,0,0],[1,-1,0]]
        self.assertEqual(classify_two_exact(A,B),
                         "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        self.assertEqual(r["exactClassificationCounts"].get(
            "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT"),1)

    def test_coplanar_point_only_touch_different_index_vertices(self):
        B=[[0,0,0],[-1,0,0],[0,-1,0]]
        self.assertEqual(classify_two_exact(A,B),
                         "EXACT_SINGLE_POINT_BOUNDARY_CONTACT")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        self.assertEqual(r["exactBoundaryPointContactsAmongCandidates"],1)
        self.assertEqual(r["exactPositiveLengthOrAreaContactsAmongCandidates"],0)

    def test_separate_parallel_planes_return_exact_disjoint(self):
        B=[[0,0,2],[2,0,2],[0,2,2]]
        self.assertEqual(classify_two_exact(A,B),"EXACT_DISJOINT")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        self.assertEqual(r["zeroSharedIndexAabbCandidatePairs"],0)
        self.assertTrue(r["completeNumericalCandidateEnumerationAndExactNarrowphase"])

    def test_noncoplanar_disjoint_even_when_aabb_overlaps(self):
        B=[[1.8,1.8,-1],[1.8,1.8,1],[2,2,1]]
        self.assertEqual(classify_two_exact(A,B),"EXACT_DISJOINT")
        v,f=pair(B)
        r=exact_nonindexed_census(v,f)
        # 3D bounding boxes may overlap despite no triangle contact.
        self.assertEqual(r["zeroSharedIndexAabbCandidatePairs"],1)
        self.assertEqual(r["exactClassificationCounts"],{"EXACT_DISJOINT":1})

    def test_noncoplanar_single_point_at_original_vertex(self):
        B=[[0,0,0],[-1,0,1],[0,-1,-1]]
        label=classify_two_exact(A,B)
        self.assertEqual(label,"EXACT_SINGLE_POINT_BOUNDARY_CONTACT")

    def test_signed_plane_rational_tiny_crossing_is_exact(self):
        e=2**-40
        B=[[.5,.5,-e],[.5,.5,e],[1.5,.5,e]]
        self.assertEqual(classify_two_exact(A,B),
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION")

    def test_global_triangle_vertex_permutation_winding_invariance(self):
        tests=[
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]],
            [[.25,.25,0],[1,.25,0],[.25,1,0]],
            [[0,0,0],[2,0,0],[1,-1,0]],
            [[0,0,0],[-1,0,0],[0,-1,0]],
            [[0,0,2],[2,0,2],[0,2,2]],
        ]
        for B in tests:
            label=classify_two_exact(A,B)
            self.assertEqual(classify_two_exact(A[::-1],B),label)
            self.assertEqual(classify_two_exact(B,A),label)
            self.assertEqual(classify_two_exact(A,np.asarray(B)[[1,2,0]]),label)

    def test_full_icosphere_candidate_census_matches_brute_indexed_partition(self):
        m=trimesh.creation.icosphere(subdivisions=1)
        r=exact_nonindexed_census(m.vertices,m.faces)
        b=brute_aabb_classes(m.vertices,m.faces)
        self.assertTrue(r["completeNumericalCandidateEnumerationAndExactNarrowphase"])
        self.assertEqual(r["independentlyEnumeratedAllAabbOverlapPairs"],b["aabb"])
        self.assertEqual(r["indexedSharedEdgeAabbPairsNotRetestedHere"],b["edge"])
        self.assertEqual(r["indexedSingleVertexAabbPairsNotRetestedHere"],b["vertex"])
        self.assertEqual(r["zeroSharedIndexAabbCandidatePairs"],b["zero"])
        self.assertEqual(r["exactZeroIndexCandidatesExamined"],b["zero"])
        self.assertEqual(sum(r["exactClassificationCounts"].values()),b["zero"])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])

    def test_original_procedural_gt_216_exact_noncoplanar_candidates_all_disjoint(self):
        p=ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        r=screen_glb(p)
        self.assertEqual(r["independentlyEnumeratedAllAabbOverlapPairs"],7866)
        self.assertEqual(r["zeroSharedIndexAabbCandidatePairs"],216)
        self.assertEqual(r["exactClassificationCounts"],{"EXACT_DISJOINT":216})
        self.assertFalse(r["printQualified"])

    def test_bounded_cpu_pair_caps_fail_closed(self):
        v=np.vstack([A,A+np.array([.05,.05,0]),A+np.array([.1,.1,0])])
        f=np.array([[0,1,2],[3,4,5],[6,7,8]])
        for budgets,reason in [
            ({"max_sphere":1},"SPHERE_PAIR_CAP"),
            ({"max_aabb":1},"AABB_PAIR_CAP"),
            ({"max_noindex":1},"NOINDEX_EXACT_PAIR_CAP"),
            ({"max_seconds":1e-12},"CPU_TIME_BUDGET_BROADPHASE"),
        ]:
            r=exact_nonindexed_census(v,f,**budgets)
            self.assertEqual(r["status"],"INDETERMINATE_CPU_BUDGET")
            self.assertEqual(r["incompleteReason"],reason)
            self.assertFalse(r["completeNumericalCandidateEnumerationAndExactNarrowphase"])
            self.assertFalse(r["globalSelfIntersectionFreeCertified"])
            self.assertFalse(r["printQualified"])

    def test_reject_bad_indexed_geometries_and_budgets(self):
        v,f=pair([[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        bad=v.copy()
        bad[0,0]=np.nan
        with self.assertRaises(QAError):
            exact_nonindexed_census(bad,f)
        with self.assertRaises(QAError):
            exact_nonindexed_census(v,f.astype(float))
        bad=f.copy()
        bad[1,0]=len(v)+1
        with self.assertRaises(QAError):
            exact_nonindexed_census(v,bad)
        with self.assertRaises(QAError):
            exact_nonindexed_census(v,np.vstack([f,f[0]]))
        with self.assertRaisesRegex(QAError,"budget"):
            exact_nonindexed_census(v,f,max_seconds=130)

    def test_evidence_immutable_does_not_overwrite_existing_changed_files(self):
        v,f=pair([[.5,.5,-1],[.5,.5,1],[1.5,.5,1]])
        result=exact_nonindexed_census(v,f)
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"example.json"
            write_immutable(p,result)
            old=p.read_bytes()
            write_immutable(p,result)
            self.assertEqual(p.read_bytes(),old)
            p.write_text("tampered",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"change refused"):
                write_immutable(p,result)

    def test_historic_real_chair_GLBSHA_and_no_printing_claim(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertTrue(r["completeNumericalCandidateEnumerationAndExactNarrowphase"])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])


if __name__=="__main__":
    unittest.main()
