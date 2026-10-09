"""CPU-only contract tests; no model CUDA allocation, no cloud, no printer."""
import json
import sys
import unittest
import numpy as np
import torch
import worker


class OfflineContractTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
