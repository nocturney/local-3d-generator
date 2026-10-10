"""G3.16 exact indexed-VERTEX-only contact, topology and CPU-budget tests."""
from __future__ import annotations

from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np
import trimesh

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

from geometry_qa import QAError
from exact_indexed_vertex_contact import (
    exact_vertex_only_census, screen_glb, immutable_write,
)


def two_faces(other_a, other_b, *, shift=(0,0,0)):
    o = np.array(shift, dtype=float)
    v = np.array([
        o, o+[1,0,0], o+[0,1,0],
        o+np.array(other_a, dtype=float), o+np.array(other_b, dtype=float),
    ], dtype=float)
    return v, np.array([[0,1,2],[0,3,4]], dtype=np.int64)


def classifications(v, f, **kwargs):
    return exact_vertex_only_census(v, f, **kwargs)


def brute_vertex_only(f):
    count=0
    for i in range(len(f)):
        for j in range(i+1,len(f)):
            if len(set(int(x) for x in f[i]) &
                   set(int(y) for y in f[j]))==1:
                count+=1
    return count


class G316ExactSingleVertexTests(unittest.TestCase):
    def assert_full_count(self, v, f):
        r = classifications(v,f)
        self.assertTrue(r["completeVertexOnlyExactContactCensus"])
        self.assertTrue(r["allVertexOnlyPairsFromOriginalIndexedIncidenceEnumerated"])
        self.assertEqual(r["totalUniqueIndexedVertexOnlyFacePairs"],
                         brute_vertex_only(f))
        self.assertEqual(r["pairsExaminedByExactRationalGeometry"],
                         brute_vertex_only(f))
        self.assertEqual(sum(r["classificationCounts"].values()),
                         brute_vertex_only(f))
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])
        return r

    def test_noncoplanar_symmetric_positive_length_shared_vertex_ray(self):
        v,f=two_faces((1,0,1),(1,0,-1))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"].get(
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION"),1)
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],1)
        self.assertEqual(r["privateExampleIndexedFacePairs"][
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION"],[[0,1]])

    def test_noncoplanar_opposite_rays_only_meet_at_vertex(self):
        v,f=two_faces((-1,0,1),(-1,0,-1))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"],{"EXACT_VERTEX_ONLY_CONTACT":1})
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],0)

    def test_noncoplanar_one_triangle_just_touches_other_plane_at_vertex(self):
        v,f=two_faces((1,0,1),(-1,0,1))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"],{"EXACT_VERTEX_ONLY_CONTACT":1})

    def test_noncoplanar_true_edge_boundary_ray_is_detected_not_only_vertex(self):
        v,f=two_faces((1,0,0),(0,0,1))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"].get(
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION"),1)

    def test_tiny_nonzero_float_plane_difference_is_still_exact(self):
        z=2**-48
        v,f=two_faces((1,0,z),(1,0,-z))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"].get(
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_INTERSECTION"),1)

    def test_coplanar_interior_positive_area_overlap_detected(self):
        v,f=two_faces((.2,.1,0),(.1,.2,0))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"].get(
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"),1)
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],1)

    def test_coplanar_positive_length_edge_touch_beyond_vertex(self):
        v,f=two_faces((1,0,0),(1,-1,0))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"].get(
            "EXACT_COPLANAR_POSITIVE_LENGTH_EDGE_CONTACT"),1)

    def test_coplanar_wedges_opposite_quadrants_just_vertex(self):
        v,f=two_faces((-1,0,0),(0,-1,0))
        r=self.assert_full_count(v,f)
        self.assertEqual(r["classificationCounts"],{"EXACT_VERTEX_ONLY_CONTACT":1})

    def test_global_winding_and_local_order_invariance_for_adversarial_cases(self):
        cases=(
            ((1,0,1),(1,0,-1)),
            ((-1,0,1),(-1,0,-1)),
            ((1,0,0),(1,-1,0)),
            ((.2,.1,0),(.1,.2,0)),
            ((-1,0,0),(0,-1,0)),
        )
        for a,b in cases:
            v,f=two_faces(a,b,shift=(3,2,1))
            base=classifications(v,f)["classificationCounts"]
            self.assertEqual(classifications(v,f[:,::-1])["classificationCounts"],base)
            self.assertEqual(classifications(v,f[:,[1,2,0]])["classificationCounts"],base)
            self.assertEqual(classifications(v[::-1],
                              len(v)-1-f)["classificationCounts"],base)

    def test_topological_census_independently_equals_full_pair_brute_force(self):
        sphere=trimesh.creation.icosphere(subdivisions=1)
        r=self.assert_full_count(sphere.vertices,sphere.faces)
        self.assertGreater(r["totalUniqueIndexedVertexOnlyFacePairs"],0)
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],0)
        self.assertEqual(r["classificationCounts"],
                         {"EXACT_VERTEX_ONLY_CONTACT":r[
                            "totalUniqueIndexedVertexOnlyFacePairs"]})

    def test_cube_normal_manifold_contact_is_not_an_extra_surface_hit(self):
        box=trimesh.creation.box()
        r=self.assert_full_count(box.vertices,box.faces)
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],0)

    def test_original_procedural_gt_has_5730_vertex_only_exact_contacts(self):
        r=screen_glb(ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb")
        self.assertEqual(r["triangleCount"],1280)
        self.assertEqual(r["totalUniqueIndexedVertexOnlyFacePairs"],5730)
        self.assertEqual(r["pairsExaminedByExactRationalGeometry"],5730)
        self.assertEqual(r["exactExtraContactBeyondSharedVertexPairCount"],0)
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])

    def test_multiple_faces_sharing_one_index_enumerated_without_duplicates(self):
        # 3 distinct planar triangles in nonoverlapping sectors of 3D space.
        v=np.array([[0,0,0],[1,0,0],[0,1,0],
                    [-1,0,1],[0,-1,1],[0,0,-1],[1,-1,-1]],float)
        f=np.array([[0,1,2],[0,3,4],[0,5,6]],int)
        r=self.assert_full_count(v,f)
        self.assertEqual(r["totalUniqueIndexedVertexOnlyFacePairs"],3)

    def test_excludes_shared_index_edge_even_if_its_aabb_overlaps(self):
        v=np.array([[0,0,0],[1,0,0],[0,1,0],[0,-1,0],[0,0,1]],float)
        f=np.array([[0,1,2],[0,1,3],[0,4,2]],int)
        # first+second, first+third share two indices; second+third
        # share just vertex 0.
        r=self.assert_full_count(v,f)
        self.assertEqual(r["totalUniqueIndexedVertexOnlyFacePairs"],1)

    def test_budgets_fail_closed_not_false_success(self):
        v=np.array([[0,0,0],[1,0,0],[0,1,0],
                    [-1,0,1],[0,-1,1],[0,0,-1],[1,-1,-1]],float)
        f=np.array([[0,1,2],[0,3,4],[0,5,6]],int)
        for budgets, reason in (
            ({"max_incident_pair_visits":1},"INCIDENCE_VISIT_BUDGET_EXCEEDED"),
            ({"max_vertex_only_pairs":1},"VERTEX_ONLY_PAIR_BUDGET_EXCEEDED"),
            ({"max_seconds":1e-12},"CPU_TIME_BUDGET_EXCEEDED_PRECOMPUTE"),
        ):
            r=classifications(v,f,**budgets)
            self.assertFalse(r["completeVertexOnlyExactContactCensus"])
            self.assertEqual(r["incompleteReason"],reason)
            self.assertEqual(r["status"],"INDETERMINATE_CPU_BUDGET")
            self.assertFalse(r["printQualified"])
            self.assertFalse(r["globalSelfIntersectionFreeCertified"])

    def test_invalid_inputs_fail_closed(self):
        v,f=two_faces((1,0,1),(1,0,-1))
        with self.assertRaisesRegex(QAError,"triangle/index"):
            classifications(v,f.astype(float))
        bad=v.copy();bad[2]=bad[1]
        with self.assertRaisesRegex(QAError,"degenerate"):
            classifications(bad,f)
        bad=v.copy();bad[0,0]=np.nan
        with self.assertRaisesRegex(QAError,"nonfinite"):
            classifications(bad,f)
        with self.assertRaisesRegex(QAError,"duplicate"):
            classifications(v,np.vstack((f,f[0])))
        with self.assertRaisesRegex(QAError,"unsafe"):
            classifications(v,f,max_seconds=1000)
        f_invalid=f.copy();f_invalid[1,2]=len(v)+2
        with self.assertRaisesRegex(QAError,"out-of-bounds"):
            classifications(v,f_invalid)

    def test_immutable_private_json_evidence_cannot_be_rewritten(self):
        v,f=two_faces((1,0,1),(1,0,-1))
        r=classifications(v,f)
        with tempfile.TemporaryDirectory() as t:
            out=Path(t)/"report.json"
            immutable_write(out,r)
            raw=out.read_bytes()
            immutable_write(out,r)
            self.assertEqual(out.read_bytes(),raw)
            out.write_text("tampered",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"refusing overwrite"):
                immutable_write(out,r)

    def test_historical_chair_SHA_and_no_printing_claim(self):
        p=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r=screen_glb(p)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertTrue(r["completeVertexOnlyExactContactCensus"])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])


if __name__=="__main__":
    unittest.main()
