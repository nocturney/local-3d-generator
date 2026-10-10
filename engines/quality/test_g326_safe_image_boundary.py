"""G3.26 CPU-only harmless format/boundary tests; all media are in-memory 64x64."""
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

from safe_image_fixture_probe import (
    EXPECTED, build_safe_probe, pillow_decode, safe_fixture_bytes,
    sniff_short_header, unsafe_to_decode_prefix_only,
)

ROOT = Path(__file__).resolve().parents[2]
PROOF = ROOT / "docs/evidence/g3/g3-26-harmless-image-boundary.json"

class G326SafeImageTests(unittest.TestCase):
    def test_three_trusted_formats_have_consistent_header_and_decoder(self):
        probe=build_safe_probe()
        self.assertEqual(probe["sourceImageFormatCount"],3)
        self.assertEqual([x["format"] for x in probe["results"]],["PNG","JPEG","WEBP"])
        for entry in probe["results"]:
            with self.subTest(fmt=entry["format"]):
                raw=safe_fixture_bytes(entry["format"])
                self.assertLess(len(raw),512000)
                self.assertEqual(hashlib.sha256(raw).hexdigest(),entry["sourceBytesSha256"])
                self.assertEqual(sniff_short_header(raw),entry["declaredMime"])
                self.assertEqual(pillow_decode(raw),(entry["format"],(64,64)))

    def test_generation_is_deterministic_inside_frozen_pillow_runtime(self):
        self.assertEqual(build_safe_probe(),build_safe_probe())

    def test_format_allowlist_rejects_other_generation_requests(self):
        for fmt in ["JP2","PDF","TGA","GD","BDF","","../file.png",None]:
            with self.subTest(fmt=fmt),self.assertRaises(ValueError):
                safe_fixture_bytes(fmt)

    def test_short_magic_header_does_not_prove_valid_decoding(self):
        for fmt,mime,signature in EXPECTED:
            prefix=signature if fmt!="WEBP" else b"RIFF\x00\x00\x00\x00WEBP"
            with self.subTest(fmt=fmt):
                self.assertEqual(sniff_short_header(prefix),mime)
                self.assertFalse(unsafe_to_decode_prefix_only(prefix))

    def test_truncated_webp_header_does_not_pass_magic_check(self):
        self.assertIsNone(sniff_short_header(b"RIFF\x00\x00\x00\x00WEB"))
        self.assertIsNone(sniff_short_header(b""))
        self.assertIsNone(sniff_short_header(b"not-an-image"))

    def test_missing_or_truncated_real_content_rejected_by_pillow(self):
        for fmt in ("PNG","JPEG","WEBP"):
            with self.subTest(fmt=fmt):
                complete=safe_fixture_bytes(fmt)
                self.assertFalse(unsafe_to_decode_prefix_only(complete[:12]))
                self.assertFalse(unsafe_to_decode_prefix_only(complete[:3]))

    def test_sha_locked_public_proof_matches_offline_recalculation(self):
        spec=importlib.util.spec_from_file_location("g326_source",ROOT/"scripts/g3-26-safe-image-boundary-proof.py")
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        actual=json.loads(PROOF.read_text(encoding="utf-8"))
        self.assertEqual(actual,module.report())
        self.assertEqual(actual["pillowSourceTests"]["pillowVersion"],"10.1.0")
        self.assertEqual(actual["previousG325SanitizedProofSha256"],
                         module.sha(module.FILES["g325"]))

    def test_no_native_security_or_physical_approval_misrepresented(self):
        proof=json.loads(PROOF.read_text(encoding="utf-8"))
        self.assertTrue(proof["sourceImagesTrustedSyntheticOnly"])
        self.assertTrue(proof["headerCheckNotFullImageValidation"])
        self.assertFalse(proof["newUntrustedUploadsAllowed"])
        self.assertFalse(proof["nativeParserOSConfinementVerified"])
        self.assertTrue(proof["all32PillowAdvisoryApplicabilityUnresolved"])
        self.assertFalse(proof["securityIssue4Resolved"])
        self.assertFalse(proof["manufacturingIssue3Resolved"])
        self.assertEqual(proof["modelExecutions"],0)
        self.assertEqual(proof["gpuInferenceRuns"],0)
        self.assertFalse(proof["printQualified"])
        self.assertEqual(proof["fabricationAction"],"NONE")

if __name__=="__main__":
    unittest.main()
