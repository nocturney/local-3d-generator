"""LOCAL3D G3.22 — read-only, CPU-only, bounded static advisory/codepath triage.

G3.5 OSV public package/version matches are NOT confirmed vulnerabilities.
This does not query a live advisory service, enumerate omitted advisory IDs,
prove transitive reachability, validate patched-version runtime compatibility,
establish OS firewall isolation, or grant untrusted image permissions.

No module imports from vulnerable packages; only importlib.metadata.version
and AST inspection of bounded authorized first-party + pinned TSR source.
"""
from __future__ import annotations
import ast
from datetime import date, datetime, timezone
import hashlib
from importlib import metadata
import json
from pathlib import Path
import re
import subprocess

from geometry_qa import QAError

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"engines"/"triposr"/"requirements-resolved-win-py311.txt"
OSV=ROOT/"docs"/"evidence"/"g3"/"g3-5-python-osv-screen.json"
SHADOW=ROOT/"docs"/"evidence"/"g3"/"g3-6-shadow-pillow-cpu-proof.json"
SOURCE_LOCK=ROOT/"docs"/"TRIPOSR_SOURCE_LOCK.json"
WORKER=ROOT/"engines"/"triposr"/"worker.py"
SRC=ROOT/"runtime"/"engines"/"triposr"/"src"
TSR_SYS=SRC/"tsr"/"system.py"
TSR_IMAGE=SRC/"tsr"/"models"/"tokenizers"/"image.py"
REPORT_SCHEMA="local3d.g3.22.pinned-python-sampled-advisory-codepath-static.v1"

MAX_BYTES=2*1024*1024
MAX_FILES=256
MAX_MANIFEST_PACKAGES=100
MAX_ADVISORY_SAMPLE=12
PINNED_COUNT=34
EXPECTED_MATCHES={"Pillow":32,"torch":22,"transformers":50}
REVIEWED={
    "Pillow":{
        "version":"10.1.0",
        "firstSampleId":"GHSA-3f63-hfp8-52jq",
        "trigger":"PIL.ImageMath.eval with attacker-influenced environment",
        "triggerSymbol":"ImageMath.eval",
        "officialAdvisory":"https://github.com/advisories/GHSA-3f63-hfp8-52jq",
        "advisoryFixVersion":"10.2.0",
        "surface":"DIRECT_IMAGE_DECODE_PATH_PRESENT",
        "disposition":"PRIORITY_FIX_INPUT_DECODING_DEPENDENCY; SPECIFIC_IMAGEMATH_API_NOT_DIRECTLY_CALLED_IN_AUDIT",
        "requiredCodeCall":"Image.open"
    },
    "transformers":{
        "version":"4.35.0",
        "firstSampleId":"GHSA-29pf-2h5f-8g72",
        "trigger":"AutoModelForCausalLM.from_pretrained with malicious config attention kernel external fetch",
        "triggerSymbol":"AutoModelForCausalLM.from_pretrained",
        "officialAdvisory":"https://github.com/advisories/GHSA-29pf-2h5f-8g72",
        "advisoryFixVersion":"5.3.0",
        "surface":"PINNED_LOCAL_VIT_MODEL_CONFIG_TRANSITIVE_IMPORT",
        "disposition":"TRIGGER_API_NOT_DIRECTLY_USED_BUT_TRANSITIVE_MODEL_CONFIG_REACHABILITY_NOT_PROVEN",
        "requiredCodeCall":"ViTModel.config_class.from_pretrained"
    },
    "torch":{
        "version":"2.5.1+cu121",
        "firstSampleId":"GHSA-3749-ghw9-m3mg",
        "trigger":"torch.mkldnn_max_pool2d local denial of service",
        "triggerSymbol":"torch.mkldnn_max_pool2d",
        "officialAdvisory":"https://github.com/advisories/GHSA-3749-ghw9-m3mg",
        "advisoryFixVersion":"2.7.1-rc1",
        "surface":"PINNED_WEIGHT_LOAD_AND_TENSOR_INFERENCE_LANE",
        "disposition":"TRIGGER_API_NOT_DIRECTLY_USED_BUT_TRANSITIVE_TORCH_OP_REACHABILITY_NOT_PROVEN",
        "requiredCodeCall":"torch.load"
    }
}

def _read_bounded(file, limit=MAX_BYTES):
    file=Path(file)
    if file.is_symlink() or not file.is_file() or file.stat().st_size>limit:
        raise QAError("G3.22 refused non-file, symlink or oversized provenance input")
    return file.read_bytes()


def _sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _load_json(file):
    try:
        data=json.loads(_read_bounded(file))
    except (ValueError,UnicodeError) as error:
        raise QAError("G3.22 malformed expected security snapshot") from error
    if not isinstance(data,dict):
        raise QAError("G3.22 expected JSON object")
    return data


def _parse_lock(data):
    try:
        lines=data.decode("utf-8").strip().splitlines()
    except UnicodeError as error:
        raise QAError("G3.22 invalid dependency freeze encoding") from error
    if not (20<=len(lines)<=MAX_MANIFEST_PACKAGES):
        raise QAError("G3.22 unexpected pinned dependency count")
    names={}
    for line in lines:
        match=re.fullmatch(r"([A-Za-z0-9_.-]+)==([A-Za-z0-9.!+_-]+)",line)
        if not match:
            raise QAError("G3.22 unpinned or malformed dependency manifest")
        name,version=match.groups()
        canonical=re.sub(r"[-_.]+","-",name).lower()
        if canonical in names:
            raise QAError("G3.22 duplicate normalized pinned package")
        names[canonical]=(name,version)
    return names


def _callees(source):
    """Literal static Python AST call spellings; NOT transitive resolution."""
    try:
        tree=ast.parse(source.decode("utf-8"))
    except (SyntaxError,UnicodeError) as error:
        raise QAError("G3.22 Python AST parse failed") from error
    calls={}
    for node in ast.walk(tree):
        if isinstance(node,ast.Call):
            try:
                callee=ast.unparse(node.func)
            except (ValueError,TypeError) as error:
                raise QAError("G3.22 unsafe Python AST node") from error
            calls.setdefault(callee,[]).append(node.lineno)
    return tree,calls


def _scan_sources(*,source_tree=SRC,strict_root=ROOT):
    pyfiles=[]
    roots=[ROOT/"engines"/"triposr",ROOT/"engines"/"quality",ROOT/"scripts"]
    for base in roots:
        if base.is_symlink() or not base.is_dir():
            raise QAError("G3.22 source root missing/symlinked")
        for file in base.rglob("*.py"):
            if file.is_symlink() or not file.is_file():
                raise QAError("G3.22 source symlink/path refused")
            pyfiles.append(file)
            if len(pyfiles)>MAX_FILES:
                raise QAError("G3.22 source file enumeration budget")
    # Pinned upstream source: only explicitly established call-path files.
    upstream={
        "PINNED_TRIPOSR/tsr/system.py":source_tree/"tsr"/"system.py",
        "PINNED_TRIPOSR/tsr/models/tokenizers/image.py":
            source_tree/"tsr"/"models"/"tokenizers"/"image.py",
    }
    result={}
    all_calls=[]
    for file in sorted(pyfiles):
        raw=_read_bounded(file)
        _,calls=_callees(raw)
        name=file.relative_to(strict_root).as_posix()
        result[name]={"sha256":_sha(raw),"calls":calls}
        for callee,lines in calls.items():
            for at in lines:
                all_calls.append((name,callee,at))
    for label,file in upstream.items():
        raw=_read_bounded(file)
        _,calls=_callees(raw)
        result[label]={"sha256":_sha(raw),"calls":calls}
        for callee,lines in calls.items():
            for at in lines:
                all_calls.append((label,callee,at))
    return result,all_calls,len(pyfiles)


def _source_git_identity(source=SRC,expected=None):
    """Read-only exact-directory Git trust; NO global git config mutations."""
    folder=source.resolve(strict=True)
    if source.is_symlink() or not folder.is_dir() or not str(folder).startswith(str(ROOT.resolve())):
        raise QAError("G3.22 pinned upstream source path out of scope")
    prefix=["git","-c","safe.directory="+folder.as_posix(),
            "-c","core.fsmonitor=false","-C",str(folder)]
    try:
        sha=subprocess.check_output(prefix+["rev-parse","HEAD"],
                text=True,stderr=subprocess.PIPE,timeout=9).strip()
        modified=subprocess.check_output(prefix+["status","--porcelain",
                            "--untracked-files=normal"],text=True,
                            stderr=subprocess.PIPE,timeout=9).strip()
    except (OSError,subprocess.SubprocessError) as error:
        raise QAError("G3.22 cannot prove pinned upstream source identity") from error
    if sha!=expected or modified:
        raise QAError("G3.22 pinned model source checkout advanced or dirty")
    return sha


def _require_call(call_map,path,call):
    p=call_map.get(path)
    if not p or call not in p["calls"] or not p["calls"][call]:
        raise QAError("G3.22 critical mitigation/exposure source call drift: "+path+" "+call)
    return {"file":path,"symbol":call,"lines":p["calls"][call][:8]}


def _must_have_security_controls():
    raw=_read_bounded(WORKER)
    tree,calls=_callees(raw)
    found_functions={x.name:x for x in ast.walk(tree)
                     if isinstance(x,(ast.FunctionDef,ast.AsyncFunctionDef))}
    if not {"prepare_image","main","check_materials",
            "protected_load","pinned_dino_download"}.issubset(found_functions):
        raise QAError("G3.22 expected worker safety functions missing")
    def source_call_in(name,call):
        f=found_functions[name]
        return any(isinstance(n,ast.Call) and ast.unparse(n.func)==call
                   for n in ast.walk(f))
    if (not source_call_in("prepare_image","Image.open") or
        not source_call_in("prepare_image","ImageOps.exif_transpose") or
        not source_call_in("main","check_materials") or
        not source_call_in("main","TSR.from_pretrained")):
        raise QAError("G3.22 trusted worker import/real image path changed")
    block=found_functions["protected_load"]
    force_weights=any(
        isinstance(n,ast.Assign) and
        any(isinstance(t,ast.Subscript) and isinstance(t.value,ast.Name) and
            t.value.id=="kw" and isinstance(t.slice,ast.Constant) and
            t.slice.value=="weights_only" for t in n.targets) and
        isinstance(n.value,ast.Constant) and n.value.value is True
        for n in ast.walk(block))
    if not force_weights:
        raise QAError("G3.22 torch weights_only protection absent/changed")
    # Static AST checks, NOT evidence of OS-backed egress enforcement.
    force_env=any(
        isinstance(n,ast.Assign) and
        any(isinstance(t,ast.Subscript) and isinstance(t.value,ast.Attribute)
            and isinstance(t.value.value,ast.Name) and t.value.value.id=="os"
            and t.value.attr=="environ" and isinstance(t.slice,ast.Constant)
            and t.slice.value in {"HF_HUB_OFFLINE","TRANSFORMERS_OFFLINE"}
            for t in n.targets) and isinstance(n.value,ast.Constant) and n.value.value=="1"
        for n in ast.walk(tree))
    if not force_env:
        raise QAError("G3.22 offline worker environment guard changed")
    # Confirm patch assignment exists even if from_pretrained remains conditional.
    assign_hub=any(
        isinstance(n,ast.Assign) and
        any(isinstance(t,ast.Attribute) and t.attr=="hf_hub_download" and
            isinstance(t.value,ast.Name) and t.value.id=="image_tokenizer"
            for t in n.targets) and isinstance(n.value,ast.Name) and
        n.value.id=="pinned_dino_download" for n in ast.walk(found_functions["main"]))
    if not assign_hub:
        raise QAError("G3.22 fixed DINO download override absent")
    return {
        "literalDirectImageOpen":True,
        "literalPillowExifTranspose":True,
        "pinnedWeightSourceValidatedInMain":True,
        "weightsOnlyMonkeypatchCodePresent":True,
        "pinnedDinoDownloadOverrideCodePresent":True,
        "offlineEnvironmentLiteralCodePresent":True,
        "osEnforcedNetworkEgressProven":False,
        "untrustedImageParsingSandboxProven":False,
    }


def report(*,verify_installed=True,verify_upstream=True):
    freeze_raw=_read_bounded(MANIFEST,65536)
    lock=_parse_lock(freeze_raw)
    snapshot=_load_json(OSV)
    shadow=_load_json(SHADOW)
    locksha=_sha(freeze_raw)
    if (len(lock)!=PINNED_COUNT or
        snapshot.get("schema")!="local3d.g3-5.python-dependency-screen.v1" or
        snapshot.get("frozenDependencyManifestSha256")!=locksha or
        snapshot.get("queryCount")!=len(lock) or
        snapshot.get("totalMatchedAdvisoryIds")!=104 or
        snapshot.get("packagesWithMatchedAdvisories")!=3 or
        snapshot.get("publicPyPiVersionPairsOnly") is not True):
        raise QAError("G3.22 freeze/public OSV snapshot provenance mismatch")
    rows=snapshot.get("packages")
    if not isinstance(rows,list) or len(rows)!=len(lock):
        raise QAError("G3.22 OSV package entry coverage incomplete")
    found=set()
    public_rows=[]
    sampled_count=0
    unsampled_count=0
    for item in rows:
        if not isinstance(item,dict):
            raise QAError("G3.22 non-object OSV report package entry")
        name=item.get("name")
        if not isinstance(name,str):
            raise QAError("G3.22 missing OSV package name")
        canonical=re.sub(r"[-_.]+","-",name).lower()
        if canonical in found or canonical not in lock:
            raise QAError("G3.22 unexpected or repeated OSV package")
        found.add(canonical)
        pinned_name,version=lock[canonical]
        match=item.get("matchedPublicVersion")
        count=item.get("advisoryCount")
        ids=item.get("sampleAdvisoryIds")
        omitted=item.get("moreAdvisoriesBeyondSample")
        if (item.get("pinnedVersion")!=version or
            match!=version.split("+")[0] or
            not isinstance(count,int) or isinstance(count,bool) or
            count<0 or not isinstance(ids,list) or
            len(ids)>MAX_ADVISORY_SAMPLE or
            not isinstance(omitted,int) or omitted<0 or
            len(ids)+omitted!=count or
            len(set(ids))!=len(ids) or any(
                not isinstance(x,str) or not re.fullmatch(r"[A-Za-z0-9-]{5,100}",x)
                for x in ids)):
            raise QAError("G3.22 OSV per-package sample is incomplete or changed")
        sampled_count+=len(ids)
        unsampled_count+=omitted
        public_rows.append({"packageName":pinned_name,"pinnedVersion":version,
                            "publicVersionQueried":match,
                            "snapshotVersionMatches":count,
                            "sampledAdvisoryIdsAvailable":len(ids),
                            "advisoryIdsNotRetainedInOldSnapshot":omitted,
                            "reachabilityOfAllAlerts":"UNASSESSED_INDIVIDUALLY"})
    if found!=set(lock) or sum(x["snapshotVersionMatches"] for x in public_rows)!=104:
        raise QAError("G3.22 OSV snapshot total changed")
    for name,expected in EXPECTED_MATCHES.items():
        key=name.lower()
        entry=next(x for x in rows if x["name"].lower()==key)
        if (entry["advisoryCount"]!=expected or
            entry["sampleAdvisoryIds"][0]!=REVIEWED[name]["firstSampleId"]):
            raise QAError("G3.22 representative advisory source ID or count changed")
    if (shadow.get("schema")!="local3d.g3-6.shadow-pillow-release-evidence.v1" or
        shadow.get("productionDependencyManifestSha256")!=locksha or
        shadow.get("currentProductionPillow")!="10.1.0" or
        shadow.get("candidateShadowPillow")!="12.3.0" or
        shadow.get("productionVenvModified") is not False or
        shadow.get("securityQualification")!="NOT_GRANTED"):
        raise QAError("G3.22 prior isolated Pillow proof mismatch")
    version_mismatch=[]
    if verify_installed:
        for canonical,(name,version) in lock.items():
            try:
                installed=metadata.version(name)
            except metadata.PackageNotFoundError:
                installed=None
            if installed!=version:
                version_mismatch.append(name)
        if version_mismatch:
            raise QAError("G3.22 pinned Windows Python distribution metadata drift")
    lock_model=_load_json(SOURCE_LOCK)
    expected_head=lock_model.get("source",{}).get("commit")
    if not isinstance(expected_head,str) or not re.fullmatch(r"[a-f0-9]{40}",expected_head):
        raise QAError("G3.22 invalid source commit lock")
    if verify_upstream:
        _source_git_identity(expected=expected_head)
    sources,callees,scanned=_scan_sources()
    controls=_must_have_security_controls()
    sites={
        "pillowRealImageDecode":_require_call(sources,
                                  "engines/triposr/worker.py","Image.open"),
        "pillowImageExif":_require_call(sources,
                                  "engines/triposr/worker.py","ImageOps.exif_transpose"),
        "pinnedTsRLoaded":_require_call(sources,
                                  "engines/triposr/worker.py","TSR.from_pretrained"),
        "localPinnedTorchWeightDeserializer":_require_call(sources,
                                  "PINNED_TRIPOSR/tsr/system.py","torch.load"),
        "pinnedVITModelConfigLoader":_require_call(sources,
                                  "PINNED_TRIPOSR/tsr/models/tokenizers/image.py",
                                  "ViTModel.config_class.from_pretrained"),
    }
    representative=[]
    for package,spec in REVIEWED.items():
        sample_api=spec["triggerSymbol"]
        literal_hits=[{"source":f,"line":n} for f,x,n in callees if x==sample_api]
        if literal_hits:
            raise QAError("G3.22 conditional advisory trigger API directly called; must re-triage")
        representative.append({
            "package":package,
            "advisoryId":spec["firstSampleId"],
            "officialAdvisoryUrl":spec["officialAdvisory"],
            "historicalPinnedVersion":spec["version"],
            "firstPatchedVersionFromAdvisory":spec["advisoryFixVersion"],
            "documentedRepresentativeTrigger":spec["trigger"],
            "literallyNamedAffectedAPICallFoundInScannedSources":False,
            "sourceScanIsNotTransitiveResolutionOrExploitTest":True,
            "realSourceSurface":spec["surface"],
            "limitedStaticDisposition":spec["disposition"],
            "allSampledPackageAdvisoriesReviewedIndividually":False,
            "allPackageAdvisoriesProvenNotAffected":False,
        })
    return {
        "schema":REPORT_SCHEMA,
        "snapshotDate":snapshot["screenedAt"],
        "snapshotIsHistoricalNotLive":True,
        "liveAdvisoryQueryPerformed":False,
        "previousFrozenPythonManifestSha256":locksha,
        "previousOsVPublicSnapshotSha256":_sha(_read_bounded(OSV)),
        "previousShadowPillowProofSha256":_sha(_read_bounded(SHADOW)),
        "pinnedTripoSRSourceCommit":expected_head,
        "pinnedUpstreamSourceGitCleanVerified":bool(verify_upstream),
        "localInstalledDistributionCountVerified":len(lock) if verify_installed else None,
        "noPackageImportsOrModelWeightsLoadedDuringStaticInspection":True,
        "packagesEnumerated":len(lock),
        "historicalVersionLevelMatches":104,
        "historicalPackagesWithMatches":3,
        "advisoryIdsActuallyRetainedInPreviousSnapshot":sampled_count,
        "advisoryIdsOmittedByPreviousSnapshot":unsampled_count,
        "allAdvisoriesIndividuallyTriaged":False,
        "priorSnapshotRows":public_rows,
        "firstPartyPythonFilesASTInspected":scanned,
        "selectedPinnedUpstreamPythonFilesASTInspected":2,
        "directSourceCallSites":sites,
        "observedSourceGuardCode":controls,
        "representativeAdvisoriesReviewedForTriggerOnly":representative,
        "sourceInspectionIsOnlyStaticAndCannotProveFullReachability":True,
        "pillowImageParsingDirectInputPathPresent":True,
        "torchTransformersTransitiveRuntimeReachabilityUnknown":True,
        "pillowShadow12_3_0OnlyPreviouslyCPUPreprocessingSmokeTested":True,
        "productionPillowStillPinned10_1_0":True,
        "all104AdvisoriesResolvedOrExploitProof":False,
        "newUntrustedImagesApproved":False,
        "osEnforcedEgressOrNativeParserSandboxImplemented":False,
        "productionDependencyOrOStoolsChanged":False,
        "securityGateResolved":False,
        "printQualified":False,
        "newAiInference":False
    }
