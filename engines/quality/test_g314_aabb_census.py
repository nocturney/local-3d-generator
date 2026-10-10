"""G3.14 independent AABB exhaustive candidate/adjacency partition controls."""
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
from aabb_pair_census import census_all_aabb_pairs, screen_glb, write_immutable


def cross_case():
    vertices = np.array([
        [0, 0, 0], [2, 0, 0], [0, 2, 0],
        [.5, .5, -1], [.5, .5, 1], [1.5, .5, 1],
        [2, 2, 0], [2, -1, 0]], dtype=float)
    faces = np.array([[0, 1, 2], [0, 1, 7],
                      [0, 6, 7], [3, 4, 5]], dtype=int)
    return vertices, faces


def brute_aabb(v, f):
    vertices = np.asarray(v, dtype=np.float64)
    faces = np.asarray(f, dtype=np.int64)
    tri = vertices[faces]
    diagonal = float(np.linalg.norm(vertices.max(axis=0) - vertices.min(axis=0)))
    tol = max(1e-12, diagonal * 1e-9)
    lo, hi = tri.min(axis=1), tri.max(axis=1)
    summary = dict(aabb=0, edge=0, vertex=0, nonindexed=0)
    for a in range(len(faces)):
        for b in range(a+1, len(faces)):
            if np.all(lo[a] <= hi[b] + tol) and np.all(lo[b] <= hi[a] + tol):
                summary["aabb"] += 1
                shared = len(set(faces[a]) & set(faces[b]))
                summary[{0:"nonindexed", 1:"vertex", 2:"edge"}[shared]] += 1
    return summary


class G314IndependentBroadphaseTests(unittest.TestCase):
    def assert_matches_brute_force(self, vertices, faces):
        r = census_all_aabb_pairs(vertices, faces)
        brute = brute_aabb(vertices, faces)
        self.assertTrue(r["completeAabbOverlappingFacePairCensus"])
        self.assertTrue(r["completeNumericalSATForNoSharedIndexPairs"])
        self.assertEqual(r["aabbOverlappingPairs"], brute["aabb"])
        self.assertEqual(r["indexedSharedEdgePairsWithinAabb"], brute["edge"])
        self.assertEqual(r["indexedSharedOnlyOneVertexPairsWithinAabb"],
                         brute["vertex"])
        self.assertEqual(r["noSharedIndexPairsWithinAabb"], brute["nonindexed"])
        self.assertEqual(r["noSharedIndexPairsCheckedByNumericalSAT"],
                         brute["nonindexed"])
        self.assertEqual(brute["aabb"],
                         brute["edge"] + brute["vertex"] + brute["nonindexed"])
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])
        return r

    def test_all_three_index_adjacency_classes_exhaustively_counted(self):
        v, f = cross_case()
        r = self.assert_matches_brute_force(v, f)
        self.assertGreater(r["indexedSharedEdgePairsWithinAabb"], 0)
        self.assertGreater(r["indexedSharedOnlyOneVertexPairsWithinAabb"], 0)
        self.assertGreater(r["noSharedIndexPairsWithinAabb"], 0)

    def test_strict_nonindexed_geometric_piercing_gets_exact_refinement(self):
        first = np.array([[0, 0, 0], [2, 0, 0], [0, 2, 0]])
        second = np.array([[.5, .5, -1], [.5, .5, 1], [1.5, .5, 1.]])
        v = np.vstack((first, second))
        f = np.array([[0, 1, 2], [3, 4, 5]])
        r = self.assert_matches_brute_force(v, f)
        self.assertEqual(r["numericalSATPotentialNonindexedPairs"], 1)
        self.assertEqual(r["exactFlaggedPairRefinement"]["classificationCounts"].get(
            "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE"), 1)
        self.assertFalse(r["approvedForPrinter"])

    def test_coplanar_area_overlap_no_shared_index_is_exactly_flagged(self):
        v = np.array([[0, 0, 0], [2, 0, 0], [0, 2, 0],
                      [.25, .25, 0], [1, .25, 0], [.25, 1, 0]], float)
        f = np.array([[0, 1, 2], [3, 4, 5]])
        r = self.assert_matches_brute_force(v, f)
        self.assertEqual(r["exactFlaggedPairRefinement"]["classificationCounts"].get(
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"), 1)

    def test_coplanar_shared_edge_is_adjacency_not_physical_penetration(self):
        v = np.array([[0, 0, 0], [2, 0, 0], [0, 2, 0], [0, -2, 0.]])
        f = np.array([[0, 1, 2], [1, 0, 3]])
        r = self.assert_matches_brute_force(v, f)
        self.assertEqual(r["indexedSharedEdgePairsWithinAabb"], 1)
        self.assertEqual(r["noSharedIndexPairsWithinAabb"], 0)
        self.assertEqual(r["numericalSATPotentialNonindexedPairs"], 0)
        self.assertFalse(r["allIndexedAdjacentFacePairsExactGeometricClearance"])

    def test_only_shared_vertex_is_counted_separately(self):
        v = np.array([[0,0,0], [2,0,0], [0,2,0],
                      [1,0,1], [0,1,1]], dtype=float)
        f = np.array([[0,1,2], [0,3,4]])
        r = self.assert_matches_brute_force(v, f)
        self.assertEqual(r["indexedSharedOnlyOneVertexPairsWithinAabb"], 1)

    def test_two_separated_triangles_do_not_appear_as_aabb_candidates(self):
        v = np.array([[0,0,0],[1,0,0],[0,1,0],
                      [5,5,5],[6,5,5],[5,6,5]],dtype=float)
        f = np.array([[0,1,2],[3,4,5]])
        r = self.assert_matches_brute_force(v, f)
        self.assertEqual(r["aabbOverlappingPairs"], 0)
        self.assertIsNotNone(r["exactFlaggedPairRefinement"])

    def test_small_icosphere_matches_independent_all_pairs_bruteforce(self):
        m = trimesh.creation.icosphere(subdivisions=1)
        r = self.assert_matches_brute_force(m.vertices, m.faces)
        self.assertGreater(r["indexedSharedEdgePairsWithinAabb"], 0)
        self.assertGreater(r["indexedSharedOnlyOneVertexPairsWithinAabb"], 0)

    def test_original_procedural_gt_exposes_additional_conservative_aabb_pairs(self):
        path = ROOT / "benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        r = screen_glb(path)
        self.assertEqual(r["triangleCount"], 1280)
        self.assertEqual(r["indexedSharedEdgePairsWithinAabb"], 1920)
        self.assertEqual(r["indexedSharedOnlyOneVertexPairsWithinAabb"], 5730)
        self.assertGreater(r["noSharedIndexPairsWithinAabb"], 0)
        self.assertEqual(r["numericalSATPotentialNonindexedPairs"], 0)
        self.assertTrue(r["completeAabbOverlappingFacePairCensus"])

    def test_each_pair_budget_fails_closed_not_zero_clearance(self):
        v, f = cross_case()
        for opts, why in [
            ({"max_broadphase":1}, "SPHERE_BROADPHASE"),
            ({"max_aabb":1}, "AABB_PAIR"),
            ({"max_sat":1}, "NONINDEXED_SAT"),
            ({"max_exact":1}, "EXACT_FLAGGED"),
            ({"max_seconds":1e-12}, "CPU_TIME"),
        ]:
            # max_exact=1 may be sufficient on this four-triangle example,
            # so use two deliberately overlapping disjoint-index triangles.
            if "max_exact" in opts:
                c = np.array([[0,0,0],[2,0,0],[0,2,0],
                              [.5,.5,-1],[.5,.5,1],[1.5,.5,1],
                              [.25,.25,0],[1,.25,0],[.25,1,0]],float)
                t = np.array([[0,1,2],[3,4,5],[6,7,8]],int)
                r = census_all_aabb_pairs(c, t, **opts)
            else:
                r = census_all_aabb_pairs(v, f, **opts)
            self.assertFalse(r["completeAabbOverlappingFacePairCensus"], opts)
            self.assertTrue(r["incompleteReason"].startswith(why), opts)
            self.assertEqual(r["status"], "INDETERMINATE_BUDGET_OR_TIME")
            self.assertFalse(r["globalSelfIntersectionFreeCertified"])
            self.assertFalse(r["printQualified"])

    def test_invalid_input_budget_index_and_nans_are_refused(self):
        v, f = cross_case()
        with self.assertRaisesRegex(QAError, "integer"):
            census_all_aabb_pairs(v, f.astype(float))
        corrupt = v.copy()
        corrupt[0,0] = np.nan
        with self.assertRaisesRegex(QAError, "Invalid indexed"):
            census_all_aabb_pairs(corrupt, f)
        with self.assertRaisesRegex(QAError, "Duplicated"):
            census_all_aabb_pairs(v, np.vstack((f, f[0])))
        with self.assertRaisesRegex(QAError, "[Ii]nvalid/unsafe"):
            census_all_aabb_pairs(v, f, max_aabb=10**10)
        f_bad = f.copy()
        f_bad[0,0] = len(v)+2
        with self.assertRaisesRegex(QAError, "Invalid indexed"):
            census_all_aabb_pairs(v, f_bad)

    def test_immutable_private_report_tamper_is_refused(self):
        v, f = cross_case()
        r = census_all_aabb_pairs(v, f)
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)/"report.json"
            write_immutable(p, r)
            old = p.read_bytes()
            write_immutable(p, r)
            self.assertEqual(p.read_bytes(), old)
            p.write_text("tampered", encoding="utf-8")
            with self.assertRaisesRegex(QAError, "Refusing changed"):
                write_immutable(p, r)

    def test_closed_box_real_glb_wrapper_never_print_authorizes(self):
        p = ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        r = screen_glb(p)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["printQualified"])


if __name__ == "__main__":
    unittest.main()
