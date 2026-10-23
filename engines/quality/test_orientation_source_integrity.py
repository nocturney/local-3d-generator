"""CPU-only regression for time-of-check/time-of-use source fidelity."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import trimesh

import geometry_qa
import orientation_derivative


class SourceIntegrityTests(unittest.TestCase):
    @staticmethod
    def make_inverted_box(shift=0.0):
        mesh = trimesh.creation.box(extents=(1, 2, 3))
        mesh.invert()
        mesh.apply_translation((shift, 0, 0))
        return trimesh.Scene(mesh).export(file_type="glb")

    def test_source_replaced_between_qa_and_conversion_is_refused(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "source.glb"
            target = root / "derivative.glb"
            report = root / "provenance.json"
            source.write_bytes(self.make_inverted_box())
            alternate = self.make_inverted_box(shift=4.0)
            load_original = trimesh.load
            calls = 0

            def swap_before_second_read(*args, **kwargs):
                nonlocal calls
                calls += 1
                if calls == 2:
                    source.write_bytes(alternate)
                return load_original(*args, **kwargs)

            with patch.object(trimesh, "load", side_effect=swap_before_second_read):
                with self.assertRaisesRegex(geometry_qa.QAError, "Source.*changed"):
                    orientation_derivative.correct_negative_winding(
                        source, target, report)
            self.assertFalse(target.exists())
            self.assertFalse(report.exists())
            self.assertEqual(calls, 2)

    def test_unchanged_source_produces_honest_draft_provenance(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "source.glb"
            target = root / "derivative.glb"
            report = root / "provenance.json"
            source.write_bytes(self.make_inverted_box())
            proof = orientation_derivative.correct_negative_winding(
                source, target, report)
            self.assertEqual(proof["sourceSha256"], geometry_qa.digest(source))
            self.assertEqual(proof["derivedSha256"], geometry_qa.digest(target))
            self.assertFalse(proof["printQualified"])
            self.assertEqual(proof["fabricationAction"], "NONE")


if __name__ == "__main__":
    unittest.main()
