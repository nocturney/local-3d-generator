"""G3.12 adversarial CPU-only spatially coincident index diagnostics."""
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
from spatial_index_proximity import screen_spatial_indices, screen_glb, write_immutable


def separated_triangles(shift=(0., 0., 0.)):
    base = np.array([[0., 0., 0.], [1., 0., 0.], [0., 1., 0.]])
    return np.concatenate((base, base + shift)), np.array(
        [[0, 1, 2], [3, 4, 5]], dtype=np.int64)


class SpatialIndexProximityTests(unittest.TestCase):
    def test_identical_geometry_but_disjoint_indices_flagged_not_welded(self):
        v, f = separated_triangles()
        v_before = v.copy()
        r = screen_spatial_indices(v, f)
        self.assertEqual(r["indexedConnectedComponents"], 2)
        self.assertEqual(r["exactCoincidentDifferentIndexPairs"], 3)
        self.assertEqual(r["nearCoincidentDifferentIndexPairs"], 0)
        self.assertEqual(r["acrossIndexedComponentsPairs"], 3)
        self.assertEqual(r["componentPairsWithVertexProximity"], 1)
        self.assertTrue(r["completeDifferentIndexProximityCensus"])
        self.assertFalse(r["disconnectedShellsContactFreeCertified"])
        self.assertFalse(r["printQualified"])
        np.testing.assert_array_equal(v, v_before)

    def test_near_but_nonidentical_disconnected_shells_are_separate(self):
        v, f = separated_triangles((0., 0., 1e-8))
        r = screen_spatial_indices(v, f)
        self.assertEqual(r["exactCoincidentDifferentIndexPairs"], 0)
        self.assertEqual(r["nearCoincidentDifferentIndexPairs"], 3)
        self.assertEqual(r["acrossIndexedComponentsNearPairs"], 3)
        self.assertEqual(r["status"], "CROSS_COMPONENT_VERTEX_PROXIMITY_CANDIDATES")

    def test_noncontact_outside_explicit_tolerance_not_flagged(self):
        v, f = separated_triangles((0., 0., 1e-4))
        r = screen_spatial_indices(v, f)
        self.assertEqual(r["proximityPairsEnumerated"], 0)
        self.assertFalse(r["absenceCannotExcludeFaceInteriorShellContact"] is False)
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])

    def test_duplicate_coordinates_within_same_index_component(self):
        v = np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0],
                      [0, 0, 0], [1, 1, 0]], dtype=float)
        f = np.array([[0, 1, 2], [1, 3, 4]], dtype=int)
        r = screen_spatial_indices(v, f)
        self.assertEqual(r["indexedConnectedComponents"], 1)
        self.assertEqual(r["exactCoincidentDifferentIndexPairs"], 1)
        self.assertEqual(r["acrossIndexedComponentsPairs"], 0)
        self.assertIn("SAME_COMPONENT", r["status"])

    def test_indexed_same_vertex_is_not_a_different_index_duplicate(self):
        m = trimesh.creation.box()
        r = screen_spatial_indices(m.vertices, m.faces)
        self.assertEqual(r["proximityPairsEnumerated"], 0)
        self.assertEqual(r["indexedConnectedComponents"], 1)
        self.assertFalse(r["printQualified"])

    def test_clean_sphere_has_no_spatially_duplicate_vertex_ids(self):
        m = trimesh.creation.icosphere(subdivisions=2)
        r = screen_spatial_indices(m.vertices, m.faces)
        self.assertEqual(r["proximityPairsEnumerated"], 0)
        self.assertTrue(r["completeDifferentIndexProximityCensus"])

    def test_dense_collision_set_fails_closed_not_zero_clearance(self):
        centers = np.zeros((36, 3))
        a = np.column_stack((np.arange(36, dtype=float)+1, np.ones(36), np.zeros(36)))
        b = np.column_stack((np.arange(36, dtype=float)+1, np.zeros(36), np.ones(36)))
        v = np.vstack((centers, a, b))
        f = np.column_stack((np.arange(36), np.arange(36)+36, np.arange(36)+72))
        r = screen_spatial_indices(v, f)
        self.assertFalse(r["completeDifferentIndexProximityCensus"])
        self.assertIsNone(r["proximityPairsEnumerated"])
        self.assertIn("INDETERMINATE", r["status"])
        self.assertFalse(r["printQualified"])

    def test_explicit_pair_budget_fails_closed(self):
        v, f = separated_triangles()
        r = screen_spatial_indices(v, f, max_pairs=1)
        self.assertFalse(r["completeDifferentIndexProximityCensus"])
        self.assertIsNone(r["exactCoincidentDifferentIndexPairs"])

    def test_invalid_indices_nonfinite_nearzero_and_bad_limits_rejected(self):
        v, f = separated_triangles()
        bad = v.copy()
        bad[0, 0] = np.nan
        with self.assertRaisesRegex(QAError, "Nonfinite"):
            screen_spatial_indices(bad, f)
        with self.assertRaisesRegex(QAError, "integers"):
            screen_spatial_indices(v, f.astype(float))
        with self.assertRaisesRegex(QAError, "Repeated vertex"):
            screen_spatial_indices(v, np.array([[0,0,2]]))
        with self.assertRaisesRegex(QAError, "Unreferenced"):
            screen_spatial_indices(np.vstack((v, [2,2,2])), f)
        with self.assertRaisesRegex(QAError, "resource budget"):
            screen_spatial_indices(v, f, near_rel=0.1)

    def test_detect_contact_between_disconnected_closed_box_shells(self):
        left = trimesh.creation.box()
        right = trimesh.creation.box()
        right.apply_translation([1., 0., 0.])
        joined = trimesh.util.concatenate([left, right])
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "touching-boxes.glb"
            path.write_bytes(trimesh.Scene(joined).export(file_type="glb"))
            r = screen_glb(path)
            self.assertEqual(r["indexedConnectedComponents"], 2)
            self.assertGreaterEqual(r["acrossIndexedComponentsExactPairs"], 4)
            self.assertFalse(r["disconnectedShellsContactFreeCertified"])

    def test_immutable_report_refuses_tampering_and_links(self):
        v, f = separated_triangles()
        r = screen_spatial_indices(v, f)
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "spatial.json"
            write_immutable(p, r)
            first = p.read_bytes()
            write_immutable(p, r)
            self.assertEqual(p.read_bytes(), first)
            p.write_text("tampered", encoding="utf-8")
            with self.assertRaisesRegex(QAError, "refusing overwrite"):
                write_immutable(p, r)

    def test_known_prior_real_chair_still_unqualified(self):
        path = ROOT / "docs/evidence/g3/chair-positive-winding.glb"
        r = screen_glb(path)
        self.assertEqual(r["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertFalse(r["globalSelfIntersectionFreeCertified"])
        self.assertFalse(r["approvedForPrinter"])


if __name__ == "__main__":
    unittest.main()
