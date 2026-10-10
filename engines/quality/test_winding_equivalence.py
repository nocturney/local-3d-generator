"""G3.7 strict CPU winding-only proof — no source files changed, no CUDA."""
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
from winding_equivalence import prove_exact_winding_only, write_proof


class WindingEquivalenceTests(unittest.TestCase):
    def setUp(self):
        self.workspace=tempfile.TemporaryDirectory()
        self.addCleanup(self.workspace.cleanup)
        self.root=Path(self.workspace.name)

    def make_box_pair(self):
        box=trimesh.creation.box(extents=[1,1.5,2.25])
        box.visual.vertex_colors=np.tile(
            np.array([71,169,203,255],dtype=np.uint8),
            (len(box.vertices),1)
        )
        negative=box.copy()
        negative.invert()
        src=self.root/"inward.glb"
        derived=self.root/"outward.glb"
        src.write_bytes(trimesh.Scene(negative).export(file_type="glb"))
        derived.write_bytes(trimesh.Scene(box).export(file_type="glb"))
        return src,derived

    def test_preexisting_real_chair_orientation_derivative_is_exact(self):
        source=ROOT/"docs/evidence/g2-app/real-app-output.glb"
        derivative=ROOT/"docs/evidence/g3/chair-positive-winding.glb"
        proof=prove_exact_winding_only(source,derivative)
        self.assertTrue(proof["sameVertexCoordinatesExact"])
        self.assertTrue(proof["sameTriangleGeometryExceptExactReversal"])
        self.assertTrue(proof["faceNormalsExactlyOpposite"])
        self.assertEqual(proof["sourceTriangles"],19972)
        self.assertTrue(proof["topologyAfter"]["positiveVolume"])
        self.assertFalse(proof["printQualified"])

    def test_color_preserving_exact_inversion(self):
        source,derivative=self.make_box_pair()
        proof=prove_exact_winding_only(source,derivative)
        self.assertTrue(proof["sameVertexCoordinatesExact"])
        self.assertTrue(proof["sameTriangleGeometryExceptExactReversal"])
        self.assertTrue(proof["vertexColorsExactlyPreserved"])
        self.assertEqual(proof["materialVisualKind"],"vertex")
        self.assertLess(proof["sourceSignedVolumeArbitraryUnitsCubed"],0)
        self.assertGreater(proof["derivativeSignedVolumeArbitraryUnitsCubed"],0)
        self.assertFalse(proof["modelInferenceExecuted"])
        self.assertFalse(proof["printQualified"])

    def test_silent_vertex_geometry_change_fails_even_if_closed(self):
        source,derivative=self.make_box_pair()
        scene=trimesh.load(derivative,file_type="glb",force="scene",process=False)
        mesh=list(scene.dump(concatenate=False))[0]
        verts=mesh.vertices.copy()
        # Translation preserves closed topology, volume and extents, yet a
        # winding-only derivative is forbidden from changing positions.
        verts[:,0]+=0.007
        mesh.vertices=verts
        derivative.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
        with self.assertRaisesRegex(QAError,"changed/reordered vertex coordinate"):
            prove_exact_winding_only(source,derivative)

    def test_silent_color_change_fails(self):
        source,derivative=self.make_box_pair()
        scene=trimesh.load(derivative,file_type="glb",force="scene",process=False)
        mesh=list(scene.dump(concatenate=False))[0]
        colors=mesh.visual.vertex_colors.copy()
        colors[0,0]^=1
        mesh.visual.vertex_colors=colors
        derivative.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
        with self.assertRaisesRegex(QAError,"vertex color appearance"):
            prove_exact_winding_only(source,derivative)

    def test_reordered_faces_must_be_exactly_reversed(self):
        source,derivative=self.make_box_pair()
        scene=trimesh.load(derivative,file_type="glb",force="scene",process=False)
        mesh=list(scene.dump(concatenate=False))[0]
        mesh.faces=mesh.faces[:,[1,2,0]]
        derivative.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
        with self.assertRaisesRegex(QAError,"faces beyond exact triangle reversal"):
            prove_exact_winding_only(source,derivative)

    def test_already_positive_source_and_identical_source_are_rejected(self):
        source,derivative=self.make_box_pair()
        with self.assertRaisesRegex(QAError,"Expected inward source"):
            prove_exact_winding_only(derivative,source)
        with self.assertRaisesRegex(QAError,"differ from the source"):
            prove_exact_winding_only(source,source)

    def test_open_or_disconnected_mesh_is_rejected(self):
        source,derivative=self.make_box_pair()
        mesh=list(trimesh.load(derivative,force="scene",process=False).dump(concatenate=False))[0]
        mesh.faces=mesh.faces[1:]
        derivative.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
        with self.assertRaisesRegex(QAError,"clean closed consistent"):
            prove_exact_winding_only(source,derivative)

    def test_private_proof_is_immutable(self):
        source,derivative=self.make_box_pair()
        proof=prove_exact_winding_only(source,derivative)
        output=self.root/"proof.json"
        write_proof(output,proof)
        first=output.read_bytes()
        write_proof(output,proof)
        self.assertEqual(output.read_bytes(),first)
        output.write_text("TAMPERED",encoding="utf-8")
        with self.assertRaisesRegex(QAError,"refusing overwrite"):
            write_proof(output,proof)


if __name__=="__main__":
    unittest.main()
