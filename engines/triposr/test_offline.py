"""CPU-only contract tests; no model CUDA allocation, no cloud, no printer."""
import json
import sys
import unittest
from unittest.mock import patch
import numpy as np
import torch
import worker


class OfflineContractTests(unittest.TestCase):
    def test_git_owner_exception_is_exact_scope_per_read_only_command(self):
        path = worker.SOURCE.resolve(strict=True).as_posix()
        for operation, expected in (
            ("head", ["rev-parse", "HEAD"]),
            ("status", ["status", "--porcelain", "--untracked-files=normal"]),
        ):
            with patch.object(worker.subprocess, "check_output", return_value=" ok\n") as invoke:
                self.assertEqual(worker.pinned_source_git(operation), "ok")
                args = invoke.call_args.args[0]
                self.assertEqual(args[:3], ["git", "-c", f"safe.directory={path}"])
                self.assertEqual(args[3:5], ["-c", "core.fsmonitor=false"])
                self.assertEqual(args[5:7], ["-C", str(worker.SOURCE)])
                self.assertEqual(args[7:], expected)
                self.assertEqual(invoke.call_args.kwargs["text"], True)
        with self.assertRaises(ValueError):
            worker.pinned_source_git("fetch")
        with self.assertRaises(ValueError):
            worker.pinned_source_git("--upload-pack")

    def test_changed_source_is_rejected_even_with_scoped_git_ownership(self):
        with patch.object(worker, "pinned_source_git", side_effect=[
            worker.SOURCE_SHA, " M src/altered.py"
        ]):
            with self.assertRaisesRegex(RuntimeError, "changed or dirty"):
                worker.check_materials()

    def test_pinned_source_and_downloaded_weights(self):
        manifest = worker.check_materials()
        self.assertEqual(manifest["source"]["commit"], worker.SOURCE_SHA)
        self.assertTrue(worker.CHECKPOINT.exists())
        self.assertTrue(worker.DINO_CONFIG.exists())

    def test_cpu_marching_cubes_contract(self):
        worker.install_local_import_barriers(torch, np)
        from torchmcubes import marching_cubes
        x, y, z = np.mgrid[-1:1:32j, -1:1:32j, -1:1:32j]
        volume = torch.from_numpy((x*x + y*y + z*z - 0.45).astype(np.float32))
        verts, faces = marching_cubes(volume, 0.0)
        self.assertEqual(verts.device.type, "cpu")
        self.assertEqual(faces.device.type, "cpu")
        self.assertEqual(verts.shape[1], 3)
        self.assertEqual(faces.shape[1], 3)
        self.assertGreater(len(verts), 200)
        self.assertGreater(len(faces), 300)
        self.assertTrue(torch.isfinite(verts).all().item())

    def test_background_removal_is_closed(self):
        worker.install_local_import_barriers(torch, np)
        import rembg
        with self.assertRaisesRegex(RuntimeError, "disabled"):
            rembg.new_session()


    def test_image_preflight_rejects_tiny_or_corrupted_image(self):
        import tempfile
        from pathlib import Path
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            small = root / "small.png"
            Image.new("RGB", (32, 32), (255, 255, 255)).save(small)
            with self.assertRaisesRegex(ValueError, ">=64x64"):
                worker.prepare_image(small)
            corrupt = root / "corrupt.png"
            corrupt.write_bytes(b"\x89PNG\r\n\x1a\nINVALID")
            with self.assertRaises(Exception):
                worker.prepare_image(corrupt)

    def test_image_preflight_rgba_preserves_gray_background(self):
        import tempfile
        from pathlib import Path
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            image = Path(tmp) / "alpha.png"
            src = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
            src.putpixel((32, 32), (250, 100, 30, 255))
            src.save(image)
            rgb, description = worker.prepare_image(image)
            self.assertEqual(rgb.mode, "RGB")
            self.assertEqual(rgb.getpixel((0, 0)), (128, 128, 128))
            self.assertEqual(rgb.getpixel((32, 32)), (250, 100, 30))
            self.assertIn("mid-gray", description)


if __name__ == "__main__":
    unittest.main()
