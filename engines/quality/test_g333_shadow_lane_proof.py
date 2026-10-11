"""G3.33 check trusted, immutable shadow/production Pillow CPU lane receipts."""
from pathlib import Path
import json
import hashlib
import unittest

ROOT=Path(__file__).resolve().parents[2]
P=ROOT/"runtime/qa/g3/g333-pillow-lanes"
PUBLIC=ROOT/"docs/evidence/g3/g3-33-pillow-12-3-shadow-cpu-compatibility.json"
def sha(p):
 return hashlib.sha256(p.read_bytes()).hexdigest()

class G333ShadowLaneProof(unittest.TestCase):
 def test_parallel_trusted_cpu_lanes_have_identical_rgb(self):
  a=json.loads((P/"production.json").read_text(encoding="utf8"))
  b=json.loads((P/"shadow.json").read_text(encoding="utf8"))
  self.assertEqual([a["pillowVersion"],b["pillowVersion"]],["10.1.0","12.3.0"])
  self.assertEqual(len(a["rows"]),12)
  self.assertEqual(len(b["rows"]),12)
  self.assertEqual(a["fixtureCount"],b["fixtureCount"])
  for x,y in zip(a["rows"],b["rows"]):
   with self.subTest(case=x["publicSourceId"]):
    self.assertEqual(x["publicSourceId"],y["publicSourceId"])
    self.assertEqual(x["publicSourceSha256"],y["publicSourceSha256"])
    self.assertEqual(x["sourceRights"],y["sourceRights"])
    self.assertEqual(x["resultSize"],y["resultSize"])
    self.assertEqual(x["resultRgbBytesSha256"],y["resultRgbBytesSha256"])
    self.assertEqual(x["alphaCompositeApplied"],y["alphaCompositeApplied"])
 def test_source_shas_and_explicit_no_gpu_releases(self):
  p=json.loads(PUBLIC.read_text(encoding="utf8"))
  self.assertEqual(p["productionPrivateCpuLaneRecordSha256"],sha(P/"production.json"))
  self.assertEqual(p["shadowPrivateCpuLaneRecordSha256"],sha(P/"shadow.json"))
  self.assertEqual(p["totalPreviouslyLicensedOrOriginalInputs"],12)
  self.assertEqual(p["pixelShaIdenticalCount"],12)
  self.assertFalse(p["productionPillowUpgraded"])
  self.assertFalse(p["historicalFullGpuModelCompatibilityDemonstrated"])
  self.assertFalse(p["nativeParserSecurityOrUntrustedUploadClearance"])
  self.assertFalse(p["securityIssue4Resolved"])
  self.assertFalse(p["printQualified"])
  self.assertEqual(p["modelOrGpuRuns"],0)

if __name__=="__main__":
 unittest.main()
