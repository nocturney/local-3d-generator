"""G3.34 verifies four original G3.6 safe shadow sample parity receipts."""
import json
from pathlib import Path
from hashlib import sha256
import unittest

ROOT=Path(__file__).resolve().parents[2]
LOCAL=ROOT/"runtime/qa/g3/g334-pillow-safe-edge-cases"
PUBLIC=ROOT/"docs/evidence/g3/g3-34-pillow-edge-cases-cpu-parity.json"

class G334SafePillowParity(unittest.TestCase):
 def test_versions_and_known_safe_four_cases(self):
  a=json.loads((LOCAL/"production.json").read_text("utf8"))
  b=json.loads((LOCAL/"shadow.json").read_text("utf8"))
  self.assertEqual([a["pillowVersion"],b["pillowVersion"]],["10.1.0","12.3.0"])
  self.assertEqual(a["trustedCasesCount"],4)
  self.assertEqual(b["trustedCasesCount"],4)
  for x,y in zip(a["cases"],b["cases"]):
   with self.subTest(case=x["caseId"]):
    self.assertEqual(x["caseId"],y["caseId"])
    self.assertEqual(x["trustedInputSha256"],y["trustedInputSha256"])
    self.assertEqual(x["status"],y["status"])
    if x["caseId"]!="corrupted":
     self.assertEqual(x["rgbPixelSha256"],y["rgbPixelSha256"])
     self.assertEqual(x["size"],y["size"])
    else:
     self.assertEqual(x["errorClass"],y["errorClass"])
     self.assertFalse(x["messageExposed"])
 def test_public_report_references_lane_sha_without_security_clearance(self):
  p=json.loads(PUBLIC.read_text("utf8"))
  for lane,key in (("production","pinnedProductionLanePrivateSha256"),("shadow","pinnedShadowLanePrivateSha256")):
   raw=(LOCAL/(lane+".json")).read_bytes()
   self.assertEqual(p[key],sha256(raw).hexdigest())
  self.assertEqual(p["identicalPixelShaValidSources"],3)
  self.assertEqual(p["corruptImageRejectionClassAgreementCount"],1)
  self.assertFalse(p["nativeParserSandboxCertified"])
  self.assertFalse(p["securityIssue4Resolved"])
  self.assertFalse(p["printQualified"])
  self.assertEqual(p["actualModelInferenceOrGpuRuns"],0)

if __name__=="__main__":
 unittest.main()
