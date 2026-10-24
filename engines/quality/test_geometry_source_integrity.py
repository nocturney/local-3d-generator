"""CPU-only G3 provenance test: the report SHA must describe the decoded GLB bytes."""
from __future__ import annotations
import hashlib
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

import trimesh

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import geometry_qa


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def glb_bytes(mesh) -> bytes:
    data = mesh.export(file_type="glb")
    return data if isinstance(data, bytes) else bytes(data)


class GeometrySourceIntegrityTests(unittest.TestCase):
    def setUp(self):
        # Two different, valid, watertight GLBs: 12 triangles vs 80 triangles.
        self.first = glb_bytes(trimesh.creation.box(extents=[1, 2, 3]))
        self.second = glb_bytes(trimesh.creation.icosphere(subdivisions=1))
        self.assertNotEqual(self.first, self.second)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.model = Path(self.temp.name) / "model.glb"

    def swap_path_after_decode(self, replacement: bytes):
        """Return a trimesh.load wrapper that replaces the pathname after decode."""
        real_load = trimesh.load
        staged = Path(self.temp.name) / "staged.glb"
        staged.write_bytes(replacement)
        swapped = []

        def wrapper(*args, **kwargs):
            scene = real_load(*args, **kwargs)
            if not swapped:
                swapped.append(True)
                os.replace(staged, self.model)
            return scene
        return wrapper, swapped

    def test_path_swap_after_decode_does_not_relabel_inspected_geometry(self):
        self.model.write_bytes(self.first)
        wrapper, swapped = self.swap_path_after_decode(self.second)
        with patch("trimesh.load", side_effect=wrapper):
            report = geometry_qa.inspect_glb(self.model)
        self.assertEqual(swapped, [True])
        self.assertEqual(self.model.read_bytes(), self.second)
        self.assertEqual(report["totalTriangles"], 12)
        self.assertEqual(report["modelSha256"], sha256(self.first))
        self.assertEqual(report["modelBytes"], len(self.first))

    def test_stable_valid_glb_reports_its_own_digest_and_length(self):
        self.model.write_bytes(self.second)
        report = geometry_qa.inspect_glb(self.model)
        self.assertEqual(report["modelSha256"], sha256(self.second))
        self.assertEqual(report["modelBytes"], len(self.second))
        self.assertEqual(report["totalTriangles"], 80)
        self.assertEqual(report["schema"], "local3d.g3.geometry-qa.v1")
        self.assertEqual(report["classification"], "DRAFT_REQUIRES_HUMAN_REVIEW")
        self.assertFalse(report["printQualified"])

    def test_oversize_file_rejected_before_decode(self):
        with patch("trimesh.load", side_effect=AssertionError("decoded oversize GLB")):
            with self.model.open("wb") as stream:
                stream.truncate(geometry_qa.MAX_BYTES + 1)
            with self.assertRaisesRegex(geometry_qa.QAError, "byte budget"):
                geometry_qa.inspect_glb(self.model)

    def test_header_length_mismatch_rejected_before_decode(self):
        corrupt = bytearray(self.first)
        corrupt[8:12] = (len(self.first) + 1).to_bytes(4, "little")
        self.model.write_bytes(bytes(corrupt))
        with patch("trimesh.load", side_effect=AssertionError("decoded mismatched GLB")):
            with self.assertRaisesRegex(geometry_qa.QAError, "declared length"):
                geometry_qa.inspect_glb(self.model)


if __name__ == "__main__":
    unittest.main()
