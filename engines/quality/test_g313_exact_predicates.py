"""G3.13 CPU exact-rational selected triangle-pair predicate adversarial controls."""
from __future__ import annotations

from pathlib import Path
import sys
import unittest

import numpy as np
import trimesh

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from geometry_qa import QAError
from exact_triangle_predicates import classify_pair, classify_selected_pairs


A = np.array([[0., 0., 0.], [2., 0., 0.], [0., 2., 0.]])
INSIDE = np.array([[.25, .25, 0.], [1., .25, 0.], [.25, 1., 0.]])
CROSSING = np.array([[.5, .5, -1.], [.5, .5, 1.], [1.5, .5, 1.]])
SEPARATED = np.array([[0., 0., 2.], [2., 0., 2.], [0., 2., 2.]])
OPPOSITE = np.array([[0., 0., 0.], [2., 0., 0.], [0., -2., 0.]])


class ExactTrianglePredicatesTests(unittest.TestCase):
    def test_true_transverse_strict_interior_crossing_either_order(self):
        expected = "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE"
        self.assertEqual(classify_pair(A, CROSSING), expected)
        self.assertEqual(classify_pair(CROSSING, A), expected)

    def test_small_but_exact_binary_float_crossing_still_detected(self):
        crossed = CROSSING.copy()
        crossed[:,2] *= 1e-7
        self.assertEqual(classify_pair(A, crossed),
                         "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE")

    def test_coplanar_contained_triangle_has_proven_positive_area(self):
        for p, q in ((A, INSIDE), (INSIDE, A),
                     (A[::-1], INSIDE[::-1])):
            self.assertEqual(classify_pair(p, q),
                             "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")

    def test_coplanar_identical_even_reversed_is_not_called_clear(self):
        self.assertEqual(classify_pair(A, A[::-1]),
                         "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")

    def test_coplanar_shared_edge_opposite_side_is_zero_area_contact(self):
        self.assertEqual(classify_pair(A, OPPOSITE),
                         "EXACT_COPLANAR_ZERO_AREA_BOUNDARY_TOUCH")

    def test_coplanar_separated_triangles(self):
        far = A + [10., 10., 0.]
        self.assertEqual(classify_pair(A, far), "EXACT_COPLANAR_DISJOINT")

    def test_coplanar_single_vertex_touch_is_not_called_disjoint(self):
        corner = np.array([[2.,0.,0.],[3.,0.,0.],[2.,-1.,0.]])
        self.assertEqual(classify_pair(A, corner),
                         "EXACT_COPLANAR_ZERO_AREA_BOUNDARY_TOUCH")

    def test_strictly_plane_separated_triangles(self):
        self.assertEqual(classify_pair(A, SEPARATED),
                         "EXACT_STRICT_PLANE_SEPARATION")

    def test_non_coplanar_shared_vertex_is_unresolved_not_proven_crossing(self):
        # Noncoplanar triangle shares [0,0,0] but its remaining vertices
        # are off plane: no strictly interior edge piercing.
        shared = np.array([[0., 0., 0.], [1., 1., 1.], [0., 1., 1.]])
        self.assertEqual(classify_pair(A, shared),
                         "UNRESOLVED_EXACT_BOUNDARY_OR_PARTIAL_COINCIDENCE")

    def test_non_coplanar_piercing_outside_A_is_not_a_false_strict_hit(self):
        remote = np.array([[3., 3., -1.], [3., 3., 1.], [4., 3., 1.]])
        self.assertNotEqual(classify_pair(A, remote),
                            "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE")

    def test_crossing_pairs_multiple_classifications_not_global_mesh_cert(self):
        vertices = np.vstack((A, CROSSING, SEPARATED))
        faces = np.array([[0,1,2], [3,4,5], [6,7,8]])
        rep = classify_selected_pairs(vertices, faces, [[0,1],[0,2]])
        self.assertEqual(rep["selectedPairsClassified"], 2)
        self.assertTrue(rep["completeSelectedPairClassification"])
        self.assertEqual(rep["classificationCounts"][
            "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE"], 1)
        self.assertEqual(rep["classificationCounts"][
            "EXACT_STRICT_PLANE_SEPARATION"], 1)
        self.assertFalse(rep["globalSelfIntersectionFreeCertified"])
        self.assertFalse(rep["printQualified"])

    def test_pair_budget_is_explicit_and_enforced(self):
        vertices = np.vstack((A, CROSSING, SEPARATED))
        faces = np.array([[0,1,2], [3,4,5], [6,7,8]])
        with self.assertRaisesRegex(QAError, "Unsafe exact predicate"):
            classify_selected_pairs(vertices, faces, [[0,1],[0,2]], max_pairs=1)

    def test_zero_time_budget_returns_indeterminate_and_no_clearance(self):
        vertices = np.vstack((A, CROSSING))
        faces = np.array([[0,1,2], [3,4,5]])
        r = classify_selected_pairs(vertices, faces, [[0,1]],
                                    max_seconds=1e-12)
        self.assertFalse(r["completeSelectedPairClassification"])
        self.assertEqual(r["selectedPairsClassified"], 0)
        self.assertTrue(r["status"].startswith("INDETERMINATE"))
        self.assertFalse(r["printQualified"])

    def test_invalid_nan_unbounded_and_degenerate_rejected(self):
        with self.assertRaisesRegex(QAError, "Invalid/nonfinite"):
            classify_pair(A, A + [0,0,np.nan])
        with self.assertRaisesRegex(QAError, "Invalid/nonfinite"):
            classify_pair(A, A + [1e12,0,0])
        deg = A.copy()
        deg[2] = deg[1]
        with self.assertRaisesRegex(QAError, "degenerate"):
            classify_pair(A, deg)

    def test_invalid_selected_indices_or_float_ids_rejected(self):
        vertices = np.vstack((A,CROSSING))
        faces = np.array([[0,1,2],[3,4,5]])
        with self.assertRaisesRegex(QAError, "must be integers"):
            classify_selected_pairs(vertices, faces.astype(float), [[0,1]])
        with self.assertRaisesRegex(QAError, "Invalid exact"):
            classify_selected_pairs(vertices, faces, [[1,1]])
        with self.assertRaisesRegex(QAError, "Invalid exact"):
            classify_selected_pairs(vertices, faces, [[1,0]])

    def test_existing_closed_box_neighbor_pair_does_not_award_print_release(self):
        box = trimesh.creation.box()
        face_0 = box.faces[0]
        adjacent_index = int(box.face_adjacency[0][1])
        pair = classify_pair(box.vertices[face_0],
                             box.vertices[box.faces[adjacent_index]])
        self.assertNotEqual(pair, "EXACT_STRICT_TRANSVERSE_SEGMENT_INTERIOR_PIERCE")

    def test_procedural_GT_known_adjacent_faces_cannot_be_qualified_from_samples(self):
        from winding_equivalence import _mesh
        model = HERE.parents[1] / "benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        mesh = _mesh(model)
        pairs = np.sort(np.asarray(mesh.face_adjacency[:8], dtype=int), axis=1)
        report = classify_selected_pairs(mesh.vertices, mesh.faces, pairs)
        self.assertEqual(report["selectedPairCount"], 8)
        self.assertEqual(report["selectedPairsClassified"], 8)
        self.assertTrue(report["completeSelectedPairClassification"])
        self.assertTrue(report["notAnExhaustiveMeshPairEnumeration"])
        self.assertFalse(report["globalSelfIntersectionFreeCertified"])
        self.assertFalse(report["printQualified"])

    def test_exact_pair_classifier_rejects_complex_and_boolean_values(self):
        with self.assertRaisesRegex(QAError, "Expected a finite"):
            classify_pair(A, np.asarray(A, dtype=complex))
        vertices = np.vstack((A, CROSSING))
        faces = np.array([[0,1,2],[3,4,5]])
        with self.assertRaisesRegex(QAError, "must be integers"):
            classify_selected_pairs(vertices, faces, np.array([[False,True]]))

    def test_winding_reversal_preserves_positive_coplanar_overlap(self):
        self.assertEqual(classify_pair(A, INSIDE),
                         classify_pair(A[::-1], INSIDE[::-1]))


if __name__ == "__main__":
    unittest.main()
