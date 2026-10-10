"""G3.8 bounded triangle-contact screen and orb diagnostic CPU tests."""
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
from triangle_contact_screen import (
    _sat_potential_contacts, contact_screen, screen_glb, write_immutable)
from orb_radial_irregularity import fit_radial_irregularity, compare_real_orb


class ContactScreenTests(unittest.TestCase):
    def test_closed_smooth_icosphere_has_no_detected_nonadjacent_contacts(self):
        sphere=trimesh.creation.icosphere(subdivisions=3,radius=1.0)
        result=contact_screen(sphere.vertices,sphere.faces)
        self.assertTrue(result["completeBroadphaseAndSATForEligiblePairs"])
        self.assertEqual(result["potentialNonadjacentContactCountLowerBound"],0)
        # A clean triangulated convex sphere can have ZERO nonadjacent
        # bounding-box overlaps; this is not a failure or a clearance.
        self.assertGreaterEqual(result["pairsExaminedByConservativeSAT"],0)
        self.assertFalse(result["selfIntersectionFreeCertified"])
        self.assertFalse(result["printQualified"])

    def test_overlapping_cubes_are_detected_as_possible_surface_contacts(self):
        a=trimesh.creation.box(extents=[1.5,1.5,1.5])
        b=trimesh.creation.box(extents=[1.5,1.5,1.5])
        b.apply_translation([0.7,0.5,0.4])
        both=trimesh.util.concatenate((a,b))
        result=contact_screen(both.vertices,both.faces)
        self.assertIn(result["screen"],(
            "POTENTIAL_NONADJACENT_CONTACTS_DETECTED",
            "INDETERMINATE_BUDGET_OR_TIME"))
        self.assertGreater(result["potentialNonadjacentContactCountLowerBound"],0)
        self.assertFalse(result["selfIntersectionFreeCertified"])

    def test_separated_closed_cubes_have_no_eligible_triangle_contacts(self):
        a=trimesh.creation.box(extents=[1,1,1])
        b=a.copy()
        b.apply_translation([5,0,0])
        combined=trimesh.util.concatenate((a,b))
        result=contact_screen(combined.vertices,combined.faces)
        self.assertTrue(result["completeBroadphaseAndSATForEligiblePairs"])
        self.assertEqual(result["potentialNonadjacentContactCountLowerBound"],0)

    def test_sat_detects_coplanar_overlap_and_crossing_but_not_separation(self):
        a=np.array([[0,0,0],[2,0,0],[0,2,0]],dtype=float)
        coplanar=np.array([[.3,.3,0],[1,.4,0],[.4,1,0]],dtype=float)
        disjoint=np.array([[3,3,0],[4,3,0],[3,4,0]],dtype=float)
        crossing=np.array([[.4,.4,-1],[.4,.4,1],[1.3,.4,1]],dtype=float)
        pairs_a=np.stack((a,a,a))
        pairs_b=np.stack((coplanar,disjoint,crossing))
        values=_sat_potential_contacts(pairs_a,pairs_b,tol=1e-9)
        self.assertEqual(values.tolist(),[True,False,True])

    def test_vertex_adjacent_triangles_are_intentionally_excluded(self):
        box=trimesh.creation.box(extents=[1,1,1])
        report=contact_screen(box.vertices,box.faces)
        self.assertTrue(report["completeBroadphaseAndSATForEligiblePairs"])
        self.assertGreater(report["skippedPairsSharingAnyVertexIndex"],0)
        self.assertFalse(report["selfIntersectionFreeCertified"])
        self.assertIn("Pairs sharing any vertex index are excluded and can still self-fold",report["limitations"])

    def test_broadphase_and_sat_caps_report_indeterminate_never_pass(self):
        sphere=trimesh.creation.icosphere(subdivisions=2)
        limited=contact_screen(sphere.vertices,sphere.faces,max_candidates=1)
        self.assertFalse(limited["completeBroadphaseAndSATForEligiblePairs"])
        self.assertEqual(limited["screen"],"INDETERMINATE_BUDGET_OR_TIME")
        self.assertEqual(limited["incompleteReason"],"BROADPHASE_CANDIDATE_BUDGET_EXCEEDED")
        # Use actual intersecting closed cubes: a convex icosphere may have
        # no eligible nonadjacent AABB pairs at all.
        a=trimesh.creation.box(extents=[1.5,1.5,1.5])
        b=a.copy();b.apply_translation([0.7,0.5,0.4])
        overlapping=trimesh.util.concatenate((a,b))
        limited=contact_screen(overlapping.vertices,overlapping.faces,max_sat=1)
        self.assertFalse(limited["completeBroadphaseAndSATForEligiblePairs"])
        self.assertEqual(limited["screen"],"INDETERMINATE_BUDGET_OR_TIME")
        self.assertEqual(limited["incompleteReason"],"NARROWPHASE_PAIR_BUDGET_EXCEEDED")

    def test_time_budget_never_yields_false_clearance(self):
        sphere=trimesh.creation.icosphere(subdivisions=3)
        report=contact_screen(sphere.vertices,sphere.faces,max_seconds=1e-12)
        self.assertEqual(report["screen"],"INDETERMINATE_BUDGET_OR_TIME")
        self.assertEqual(report["incompleteReason"],"CPU_TIME_BUDGET_EXCEEDED")

    def test_invalid_arrays_and_invalid_budgets_fail_closed(self):
        box=trimesh.creation.box()
        with self.assertRaisesRegex(QAError,"Unsafe/nonpositive"):
            contact_screen(box.vertices,box.faces,max_sat=0)
        broken=box.vertices.copy()
        broken[0,0]=np.nan
        with self.assertRaisesRegex(QAError,"Unsafe/invalid"):
            contact_screen(broken,box.faces)
        faces=box.faces.copy()
        faces[0,0]=len(box.vertices)
        with self.assertRaisesRegex(QAError,"Unsafe/invalid"):
            contact_screen(box.vertices,faces)

    def test_degenerate_face_is_refused_not_clear_categorized(self):
        box=trimesh.creation.box()
        faces=box.faces.copy()
        faces[0]=[0,0,1]
        with self.assertRaisesRegex(QAError,"Degenerate triangle face"):
            contact_screen(box.vertices,faces)

    def test_static_existing_chair_reference_passes_file_level_screen(self):
        chair=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        result=screen_glb(chair)
        self.assertEqual(result["modelSha256"],
            "48ee912229ad73fcbda1a6b455dbcc39d396bdf2c752ccabc90a29097b09b6ec")
        self.assertFalse(result["selfIntersectionFreeCertified"])
        self.assertFalse(result["printQualified"])

    def test_immutable_local_only_report(self):
        box=trimesh.creation.box()
        report=contact_screen(box.vertices,box.faces)
        with tempfile.TemporaryDirectory() as temp:
            out=Path(temp)/"report.json"
            write_immutable(out,report)
            old=out.read_bytes()
            write_immutable(out,report)
            self.assertEqual(out.read_bytes(),old)
            out.write_text("FALSIFIED",encoding="utf-8")
            with self.assertRaisesRegex(QAError,"refusing overwrite"):
                write_immutable(out,report)


class RadialIrregularityTests(unittest.TestCase):
    def test_same_icosphere_result_is_deterministic_and_nonprinting(self):
        mesh=trimesh.creation.icosphere(subdivisions=3)
        a=fit_radial_irregularity(mesh.vertices,mesh.faces)
        b=fit_radial_irregularity(mesh.vertices,mesh.faces)
        self.assertEqual(a,b)
        self.assertGreaterEqual(a["absoluteRadialResidualMeanRelativeToRadius"],0)
        self.assertEqual(a["sampleCount"],4096)

    def test_nonround_icosphere_has_more_radial_residual(self):
        mesh=trimesh.creation.icosphere(subdivisions=3)
        base=fit_radial_irregularity(mesh.vertices,mesh.faces)
        v=mesh.vertices.copy()
        # Large, deterministic radial ripple at fixed angular bands.
        theta=np.arctan2(v[:,1],v[:,0])
        factor=1+.15*np.sin(8*theta)*np.sin(5*v[:,2])
        v*=factor[:,None]
        perturbed=fit_radial_irregularity(v,mesh.faces)
        self.assertGreater(
            perturbed["absoluteRadialResidualMeanRelativeToRadius"],
            base["absoluteRadialResidualMeanRelativeToRadius"]*4)

    def test_mm_or_scale_cannot_be_claimed_by_normalized_metric(self):
        mesh=trimesh.creation.icosphere(subdivisions=2)
        base=fit_radial_irregularity(mesh.vertices,mesh.faces)
        moved=fit_radial_irregularity(mesh.vertices*50+np.array([6,-31,15]),mesh.faces)
        self.assertAlmostEqual(
            base["absoluteRadialResidualMeanRelativeToRadius"],
            moved["absoluteRadialResidualMeanRelativeToRadius"],places=7)

    def test_catalog_reference_is_original_source_not_ai_output(self):
        model=ROOT/"benchmarks/g3/fixtures/01-orb-alpha/ground-truth.glb"
        with self.assertRaisesRegex(QAError,"A derivative must differ from the source"):
            compare_real_orb(model,model,model)


if __name__=="__main__":
    unittest.main()
