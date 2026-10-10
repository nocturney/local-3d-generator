"""LOCAL3D G3.30 trusted CPU-only canonical fixture verification.

Every tested image is an original prior generated 64x64 synthetic sample.
No guest VM, host privilege change, model, network or untrusted media.
"""
import base64
import hashlib
import importlib.util
from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"tests/fixtures/g327-synthetic-images.json"
OUT=ROOT/"tests/fixtures/g330-trusted-canonical-output.json"
SCRIPT=ROOT/"scripts/g3-30-build-trusted-canonical-fixtures.py"

def module():
    spec=importlib.util.spec_from_file_location("g330_fixture_generator",SCRIPT)
    m=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

class G330TrustedCanonicalPython(unittest.TestCase):
    def test_three_original_generated_formats_decode_then_canonicalize_on_host_only(self):
        before=json.loads(SRC.read_text(encoding="utf-8"))
        after=json.loads(OUT.read_text(encoding="utf-8"))
        self.assertEqual(before["schema"],"local3d.g327.trusted-generated-image-fixtures.v1")
        self.assertTrue(after["trustedOriginalGeneratedOnly"])
        self.assertFalse(after["sandboxVMExecuted"])
        self.assertFalse(after["networkEgressIsolated"])
        self.assertFalse(after["untrustedUploadProcessed"])
        self.assertEqual(after["pillowVersion"],"10.1.0")
        self.assertEqual(after["sourceFixtureSetSHA256"],hashlib.sha256(SRC.read_bytes()).hexdigest())
        self.assertEqual([x["sourceFormat"] for x in after["samples"]],["PNG","JPEG","WEBP"])
        for entry,original in zip(after["samples"],before["images"]):
            with self.subTest(fmt=entry["sourceFormat"]):
                self.assertEqual(entry["sourceSHA256"],original["sha256"])
                raw=base64.b64decode(entry["outputBase64"],validate=True)
                self.assertEqual(hashlib.sha256(raw).hexdigest(),entry["outputSHA256"])
                self.assertEqual(len(raw),entry["outputBytes"])
                self.assertLess(len(raw),65536)
                with Image.open(BytesIO(raw)) as im:
                    im.load()
                    self.assertEqual(im.format,"PNG")
                    self.assertEqual(im.mode,"RGB")
                    self.assertEqual(im.size,(64,64))
    def test_pinned_host_image_generator_deterministic_exact_immutable_public_fixture(self):
        m=module()
        self.assertEqual(m.build(),m.build())
        self.assertEqual(m.build(),json.loads(OUT.read_text(encoding="utf-8")))
        self.assertEqual(m.TRUSTED["PNG"][1],
                         json.loads(SRC.read_text(encoding="utf-8"))["images"][0]["sha256"])
    def test_source_fixture_identity_forgery_or_unknown_image_fail_closed(self):
        m=module()
        with TemporaryDirectory() as d:
            p=Path(d)/"modified.json"
            doc=json.loads(SRC.read_text(encoding="utf-8"))
            doc["images"][0]["sha256"]="0"*64
            p.write_text(json.dumps(doc),encoding="utf-8")
            with patch.object(m,"SOURCE",p):
                with self.assertRaises(ValueError):
                    m.build()
            doc["images"][0]["sha256"]=m.TRUSTED["PNG"][1]
            doc["images"][0]["base64"]=base64.b64encode(b"not png").decode()
            p.write_text(json.dumps(doc),encoding="utf-8")
            with patch.object(m,"SOURCE",p):
                with self.assertRaises(ValueError):
                    m.build()
    def test_pillow_host_fixture_conversion_does_not_grant_any_guest_or_print_approval(self):
        report=json.loads(OUT.read_text(encoding="utf-8"))
        self.assertEqual(report["executionEnvironment"],"HOST_PINNED_PILLOW_TRUSTED_CPU_FIXTURE_ONLY")
        for key in ("sandboxVMExecuted","networkEgressIsolated","untrustedUploadProcessed",
                    "guestDecoderProven","productionGpuOrPrinterReady"):
            self.assertIs(report[key],False)
        self.assertEqual(report["samples"][0]["sourceSHA256"],
                         report["samples"][0]["outputSHA256"])
        self.assertNotEqual(report["samples"][1]["sourceSHA256"],
                            report["samples"][1]["outputSHA256"])
        self.assertNotEqual(report["samples"][2]["sourceSHA256"],
                            report["samples"][2]["outputSHA256"])

if __name__=="__main__":
    unittest.main()
