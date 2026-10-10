"""G3.22 bounded read-only pinned advisory/codepath triage controls."""
from __future__ import annotations
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))

from geometry_qa import QAError
import g322_dependency_reachability as audit


class G322StaticSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.actual=audit.report()

    def test_previous_public_snapshot_is_104_matches_not_confirmed_exploits(self):
        p=self.actual
        self.assertEqual(p["packagesEnumerated"],34)
        self.assertEqual(p["historicalVersionLevelMatches"],104)
        self.assertEqual(p["historicalPackagesWithMatches"],3)
        self.assertEqual(p["advisoryIdsActuallyRetainedInPreviousSnapshot"],36)
        self.assertEqual(p["advisoryIdsOmittedByPreviousSnapshot"],68)
        self.assertFalse(p["allAdvisoriesIndividuallyTriaged"])
        self.assertFalse(p["all104AdvisoriesResolvedOrExploitProof"])
        self.assertFalse(p["securityGateResolved"])

    def test_all_local_metadata_pinned_and_upstream_git_source_clean(self):
        p=self.actual
        self.assertEqual(p["localInstalledDistributionCountVerified"],34)
        self.assertTrue(p["pinnedUpstreamSourceGitCleanVerified"])
        self.assertEqual(p["selectedPinnedUpstreamPythonFilesASTInspected"],2)
        self.assertGreater(p["firstPartyPythonFilesASTInspected"],30)
        self.assertFalse(p["osEnforcedEgressOrNativeParserSandboxImplemented"])

    def test_pillow_has_real_image_parsing_input_but_imagemath_only_indirect(self):
        p=self.actual
        self.assertTrue(p["pillowImageParsingDirectInputPathPresent"])
        self.assertIn("Image.open",p["directSourceCallSites"]["pillowRealImageDecode"]["symbol"])
        self.assertTrue(p["observedSourceGuardCode"]["literalPillowExifTranspose"])
        a=next(v for v in p["representativeAdvisoriesReviewedForTriggerOnly"]
               if v["package"]=="Pillow")
        self.assertEqual(a["advisoryId"],"GHSA-3f63-hfp8-52jq")
        self.assertFalse(a["literallyNamedAffectedAPICallFoundInScannedSources"])
        self.assertTrue(a["sourceScanIsNotTransitiveResolutionOrExploitTest"])
        self.assertFalse(a["allPackageAdvisoriesProvenNotAffected"])

    def test_transformers_and_torch_upstream_pinned_paths_still_conditional(self):
        p=self.actual
        self.assertEqual(p["directSourceCallSites"]["localPinnedTorchWeightDeserializer"]["symbol"],
                         "torch.load")
        self.assertEqual(p["directSourceCallSites"]["pinnedVITModelConfigLoader"]["symbol"],
                         "ViTModel.config_class.from_pretrained")
        self.assertTrue(p["observedSourceGuardCode"]["weightsOnlyMonkeypatchCodePresent"])
        self.assertTrue(p["observedSourceGuardCode"]["pinnedDinoDownloadOverrideCodePresent"])
        self.assertTrue(p["observedSourceGuardCode"]["offlineEnvironmentLiteralCodePresent"])
        self.assertFalse(p["observedSourceGuardCode"]["osEnforcedNetworkEgressProven"])
        self.assertFalse(p["observedSourceGuardCode"]["untrustedImageParsingSandboxProven"])
        ids={x["package"]:x["advisoryId"]
             for x in p["representativeAdvisoriesReviewedForTriggerOnly"]}
        self.assertEqual(ids["torch"],"GHSA-3749-ghw9-m3mg")
        self.assertEqual(ids["transformers"],"GHSA-29pf-2h5f-8g72")

    def test_snapshot_sample_ids_do_not_pretend_all_104_details_exist(self):
        rows=self.actual["priorSnapshotRows"]
        self.assertEqual(sum(x["snapshotVersionMatches"] for x in rows),104)
        self.assertEqual(sum(x["advisoryIdsNotRetainedInOldSnapshot"] for x in rows),68)
        self.assertEqual(sum(x["sampledAdvisoryIdsAvailable"] for x in rows),36)
        self.assertEqual(sum(x["snapshotVersionMatches"]>0 for x in rows),3)
        self.assertTrue(all(x["reachabilityOfAllAlerts"]=="UNASSESSED_INDIVIDUALLY" for x in rows))

    def test_previous_pillow_shadow_is_not_live_upgrade(self):
        p=self.actual
        self.assertTrue(p["pillowShadow12_3_0OnlyPreviouslyCPUPreprocessingSmokeTested"])
        self.assertTrue(p["productionPillowStillPinned10_1_0"])
        self.assertFalse(p["productionDependencyOrOStoolsChanged"])

    def test_modified_manifest_bytes_detected_even_same_total_packages(self):
        with tempfile.TemporaryDirectory() as folder:
            fake=Path(folder)/"lock.txt"
            raw=audit.MANIFEST.read_bytes()
            fake.write_bytes(raw.replace(b"Pillow==10.1.0",b"Pillow==10.2.0"))
            with patch.object(audit,"MANIFEST",fake):
                with self.assertRaisesRegex(QAError,"provenance mismatch"):
                    audit.report(verify_installed=False,verify_upstream=False)

    def test_duplicate_or_unpinned_requirement_refused(self):
        with self.assertRaisesRegex(QAError,"unpinned"):
            audit._parse_lock(("\n".join(f"pkg{i}==1.0" for i in range(19))+"\ntransformers>=4.0\n").encode())
        with self.assertRaisesRegex(QAError,"duplicate"):
            audit._parse_lock(("Pillow==10.1.0\npillow==10.1.0\n"+
                               "\n".join(f"pkg{i}==1.0" for i in range(18))).encode())

    def test_osv_count_or_sample_id_drift_refused(self):
        source=json.loads(audit.OSV.read_text(encoding="utf-8"))
        for transform in ("count","id"):
            mutated=json.loads(json.dumps(source))
            row=next(x for x in mutated["packages"] if x["name"]=="Pillow")
            if transform=="count":row["advisoryCount"]+=1
            else:row["sampleAdvisoryIds"][0]="GHSA-0000-0000-0000"
            with tempfile.TemporaryDirectory() as folder:
                temp=Path(folder)/"snapshot.json"
                temp.write_text(json.dumps(mutated),encoding="utf-8")
                with patch.object(audit,"OSV",temp):
                    with self.assertRaisesRegex(QAError,"sample|advisory|source ID"):
                        audit.report(verify_installed=False,verify_upstream=False)

    def test_missing_weights_only_assignment_fail_closed(self):
        raw=audit.WORKER.read_bytes()
        modified=raw.replace(b'kw["weights_only"] = True',
                             b'kw["weights_only"] = False')
        with tempfile.TemporaryDirectory() as folder:
            worker=Path(folder)/"worker.py"
            worker.write_bytes(modified)
            with patch.object(audit,"WORKER",worker):
                with self.assertRaisesRegex(QAError,"weights_only"):
                    audit._must_have_security_controls()

    def test_changed_fixed_dino_fetch_override_fail_closed(self):
        raw=audit.WORKER.read_bytes()
        modified=raw.replace(b"image_tokenizer.hf_hub_download = pinned_dino_download",
                             b"image_tokenizer.hf_hub_download = untrusted")
        with tempfile.TemporaryDirectory() as folder:
            worker=Path(folder)/"worker.py"
            worker.write_bytes(modified)
            with patch.object(audit,"WORKER",worker):
                with self.assertRaisesRegex(QAError,"DINO"):
                    audit._must_have_security_controls()

    def test_missing_worker_image_open_rejected(self):
        raw=audit.WORKER.read_bytes()
        modified=raw.replace(b"Image.open(image)",b"Image.frombytes(image)")
        with tempfile.TemporaryDirectory() as folder:
            worker=Path(folder)/"worker.py"
            worker.write_bytes(modified)
            with patch.object(audit,"WORKER",worker):
                with self.assertRaisesRegex(QAError,"image path"):
                    audit._must_have_security_controls()

    def test_malicious_oversized_and_symlink_sources_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"too-big.txt"
            path.write_bytes(b"x"*100)
            with self.assertRaises(QAError):
                audit._read_bounded(path,16)
            link=Path(folder)/"symlink.txt"
            try:
                link.symlink_to(path)
            except (OSError,NotImplementedError):
                return
            with self.assertRaises(QAError):
                audit._read_bounded(link)

    def test_ast_rejects_invalid_syntax(self):
        with self.assertRaisesRegex(QAError,"AST parse"):
            audit._callees(b"def invalid(:\n")
        tree,calls=audit._callees(b"import os\nf(1)\nx.y(2)\n")
        self.assertEqual(calls["f"],[2])
        self.assertEqual(calls["x.y"],[3])

    def test_importing_report_module_does_not_import_gpu_packages(self):
        # The imported audit code itself uses stdlib metadata/AST; it must
        # not import PyTorch, transformers, or Pillow at audit import time.
        source=(HERE/"g322_dependency_reachability.py").read_text(encoding="utf-8")
        import ast
        tree=ast.parse(source)
        names=set()
        for node in ast.walk(tree):
            if isinstance(node,ast.Import):
                names.update(x.name.split(".")[0] for x in node.names)
            if isinstance(node,ast.ImportFrom) and node.module:
                names.add(node.module.split(".")[0])
        self.assertFalse({"torch","transformers","PIL"} & names)

    def test_no_false_security_qualification_under_version_matches(self):
        r=self.actual
        self.assertFalse(r["newUntrustedImagesApproved"])
        self.assertFalse(r["allAdvisoriesIndividuallyTriaged"])
        self.assertFalse(r["securityGateResolved"])
        self.assertFalse(r["printQualified"])
        self.assertFalse(r["newAiInference"])


if __name__=="__main__":
    unittest.main()
