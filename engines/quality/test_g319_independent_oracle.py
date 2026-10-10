"""G3.19 independent rational oracle differential adversarial controls."""
from __future__ import annotations

from pathlib import Path
import sys
import unittest
from unittest.mock import patch

import numpy as np

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from geometry_qa import QAError
from independent_triangle_oracle import classify_pair_independent
from exact_nonindexed_contact import classify_two_exact


A=np.array([[0,0,0],[2,0,0],[0,2,0]],float)


def differential(a,b):
    first=classify_pair_independent(a,b)
    second=classify_two_exact(a,b)
    if first!=second:
        raise QAError("G3.19 exact engines DISAGREE; fail closed")
    return first


class G319IndependentOracleTests(unittest.TestCase):
    def classify(self,b,expected,a=A):
        result=differential(a,np.asarray(b,dtype=float))
        self.assertEqual(result,expected)
        self.assertEqual(differential(np.asarray(b,float),a),expected)

    def test_noncoplanar_crosses_both_triangle_interiors(self):
        self.classify([[.5,.5,-1],[.5,.5,1],[1.5,.5,1]],
                      "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION")

    def test_tiny_crossing_exact_float_roundoff(self):
        eps=2**-45
        self.classify([[.5,.5,-eps],[.5,.5,eps],[1.5,.5,eps]],
                      "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION")

    def test_coplanar_one_triangle_inside_another(self):
        self.classify([[.25,.25,0],[1,.25,0],[.25,1,0]],
                      "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")

    def test_partly_overlapping_coplanar_interiors(self):
        self.classify([[1,0,0],[3,0,0],[1,2,0]],
                      "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")

    def test_coplanar_collinear_common_segment(self):
        self.classify([[0,0,0],[2,0,0],[1,-1,0]],
                      "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT")

    def test_coplanar_different_index_only_one_point_touch(self):
        self.classify([[0,0,0],[-1,0,0],[0,-1,0]],
                      "EXACT_SINGLE_POINT_BOUNDARY_CONTACT")

    def test_parallel_noncoincident_triangles(self):
        self.classify([[0,0,1],[2,0,1],[0,2,1]],
                      "EXACT_DISJOINT")

    def test_noncoplanar_bbox_overlap_but_triangles_separate(self):
        self.classify([[1.8,1.8,-1],[1.8,1.8,1],[2,2,1]],
                      "EXACT_DISJOINT")

    def test_ordinary_shared_index_edge_geometry_is_positive_line_not_fault(self):
        self.classify([[0,0,0],[2,0,0],[1,1,1]],
                      "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION")

    def test_ordinary_shared_index_vertex_only_geometry_is_point(self):
        self.classify([[0,0,0],[-1,0,1],[0,-1,-1]],
                      "EXACT_SINGLE_POINT_BOUNDARY_CONTACT")

    def test_triangle_vertex_permutation_and_winding_preserve_class(self):
        cases=[
            [[.5,.5,-1],[.5,.5,1],[1.5,.5,1]],
            [[.25,.25,0],[1,.25,0],[.25,1,0]],
            [[0,0,0],[2,0,0],[1,-1,0]],
            [[0,0,0],[-1,0,0],[0,-1,0]],
        ]
        for case in cases:
            b=np.asarray(case,float)
            expected=differential(A,b)
            self.assertEqual(differential(A[::-1],b),expected)
            self.assertEqual(differential(A,b[::-1]),expected)
            self.assertEqual(differential(A[[1,2,0]],b[[2,0,1]]),expected)

    def test_invalid_nonfinite_and_degenerate_input_refused_by_both(self):
        bad=np.array(A,copy=True);bad[0,0]=np.nan
        for fn in (classify_pair_independent,classify_two_exact):
            with self.assertRaises(QAError):
                fn(bad,A)
            with self.assertRaises(QAError):
                fn(A,[[0,0,0],[1,0,0],[2,0,0]])
            with self.assertRaises(QAError):
                fn(A,A+np.array([1e10,0,0]))

    def test_seeded_3d_integer_grid_differential_randomized(self):
        rng=np.random.default_rng(31917)
        seen={}
        checked=0
        for _ in range(3400):
            a=rng.integers(-3,4,size=(3,3)).astype(float)
            b=rng.integers(-3,4,size=(3,3)).astype(float)
            try:
                label=differential(a,b)
            except QAError as error:
                if ("degenerate" in str(error).lower() or
                        "zero-area" in str(error).lower()):
                    continue
                raise
            checked+=1
            seen[label]=seen.get(label,0)+1
        self.assertGreater(checked,3200)
        self.assertGreater(seen.get("EXACT_DISJOINT",0),2000)
        self.assertGreater(seen.get(
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION",0),0)

    def test_seeded_coplanar_grid_differential_randomized(self):
        rng=np.random.default_rng(31918)
        seen={}
        checked=0
        for _ in range(3200):
            a=np.column_stack((rng.integers(-4,5,size=(3,2)),
                               np.zeros(3))).astype(float)
            b=np.column_stack((rng.integers(-4,5,size=(3,2)),
                               np.zeros(3))).astype(float)
            try:
                label=differential(a,b)
            except QAError as error:
                if ("degenerate" in str(error).lower() or
                        "zero-area" in str(error).lower()):
                    continue
                raise
            checked+=1
            seen[label]=seen.get(label,0)+1
        self.assertGreater(checked,2600)
        self.assertGreater(seen.get("EXACT_COPLANAR_POSITIVE_AREA_OVERLAP",0),100)
        self.assertGreater(seen.get("EXACT_DISJOINT",0),0)

    def test_seeded_3d_small_finite_binary_offsets(self):
        rng=np.random.default_rng(31919)
        checked=0
        for _ in range(1200):
            a=rng.integers(-2,3,size=(3,3)).astype(float)
            b=rng.integers(-2,3,size=(3,3)).astype(float)
            a[:,2]+=(2**-25)*rng.integers(-2,3,size=3)
            b[:,2]+=(2**-25)*rng.integers(-2,3,size=3)
            try:
                differential(a,b)
            except QAError as error:
                if ("degenerate" in str(error).lower() or
                        "zero-area" in str(error).lower()):
                    continue
                raise
            checked+=1
        self.assertGreater(checked,1000)

    def test_control_for_deliberately_injected_disagreement_fail_closed(self):
        b=np.asarray([[.25,.25,0],[1,.25,0],[.25,1,0]],float)
        with patch("test_g319_independent_oracle.classify_two_exact",
                   return_value="EXACT_DISJOINT"):
            with self.assertRaisesRegex(QAError,"DISAGREE"):
                differential(A,b)

    def test_no_global_print_fitness_assumption_from_pair_classifier(self):
        label=differential(A,np.asarray(
            [[.25,.25,0],[1,.25,0],[.25,1,0]],float))
        self.assertEqual(label,"EXACT_COPLANAR_POSITIVE_AREA_OVERLAP")
        # This is a pure 2-triangle math function with no print-qualified flag,
        # not a model certification or fabrication action.


if __name__=="__main__":
    unittest.main()
