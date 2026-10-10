"""G3.20 four previously licensed GLBs: SHA unit claims + CPU chord proof.

Image-to-3D source has NO independently verified physical dimension/mm scale.
Even if Trimesh emits a glTF extras.units="meters" metadata hint,
this is an exporter field, not a source measurement or verified calibration.

The old original real orb has nonpositive signed volume: do not cast
"inward" normal rays until orientation is independently established;
the unchanged-geometry G3.7 positive-winding derivative is used for
non-certifying sampled chord probes. DO NOT mutate or repair source GLBs.

Immutable local reports and SHA-linked aggregated public report.
No new AI/GPU, network, printer, OS or Office actions.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import sys

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["PYTHONNOUSERSITE"]="1"

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))
from geometry_qa import QAError
from unit_scale_and_chord_screen import screen_glb,write_immutable

spec=importlib.util.spec_from_file_location(
    "g315_unit_source_rights",ROOT/"scripts"/"g3-15-edge-replay.py")
if spec is None or spec.loader is None:
    raise QAError("G3.20 missing trusted historic source SHA validator")
prior=importlib.util.module_from_spec(spec)
spec.loader.exec_module(prior)

PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PUBLIC=ROOT/"docs"/"evidence"/"g3"/"orb-01-g320-unit-chord-cpu.json"
OLDER=ROOT/"docs"/"evidence"/"g3"/"orb-01-g319-second-exact-oracle-proof.json"
LANES={
    "original":"realTripoSR",
    "derivative":"windingOnlySameSurface",
    "reference":"originalProceduralGT",
    "chair":"historicalLicensedChair",
}

def public_summary(r):
    sample=r["sampledNormalRayChords"]
    meta=r["unitProvenance"]
    return {
        "faces":r["triangleCount"],
        "vertices":r["vertexCount"],
        "sourcePositiveSignedVolumeForInwardRays":
            r["sourcePositiveSignedVolumeForInwardRays"],
        "status":r["status"],
        "meshExtentsArbitraryUnits":r["meshExtentsArbitraryUnits"],
        "boundingDiagonalArbitraryUnits":r["boundingDiagonalArbitraryUnits"],
        "triangulationEdgeLengthsArbitraryUnits":
            r["triangulationEdgeLengthsArbitraryUnits"],
        "meshUnitClaimsFromUnverifiedExporterMetadata":
            meta["unverifiedGltfUnitClaims"],
        "glTFUnitsClaimCannotProvidePhysicalCalibration":
            meta["declaredMetersAreNotTrustedAsPhysicalScale"],
        "independentMeasuredReferenceMm":meta["independentMeasuredReferenceMm"],
        "sourceVerifiedMillimetersPerGLBUnit":
            meta["sourceVerifiedMillimetersPerGLBUnit"],
        "rayStatus":sample["status"],
        "rayIncompleteReason":sample["incompleteReason"],
        "raySamplesPlanned":sample["probesPlanned"],
        "raySamplesExamined":sample["probesExamined"],
        "confidentFirstHitSamples":sample["confidentFirstHitSamples"],
        "boundaryAmbiguousSamplesExcluded":
            sample["boundaryAmbiguousSamplesExcluded"],
        "noConfidentHitSamples":sample["noConfidentHitSamples"],
        "firstHitChordsArbitraryUnits":sample["firstHitChordsArbitraryUnits"],
        "firstHitChordsRelativeToAabbDiagonal":
            sample["firstHitChordsRelativeToAabbDiagonal"],
        "rayChordsMayTraverseEntireSolidNotWallThickness":True,
        "realPhysicalMillimetersVerified":False,
        "minimumLocalWallThicknessMeasured":False,
        "physicalWallThicknessMm":None,
        "printQualified":False,
        "approvedForPrinter":False,
    }


def replay(job_id,*,prepare_private=False,write_public=False):
    sources,old314=prior.historical_models(job_id)
    p319=prior.getjson(OLDER)
    if (p319.get("schema")!=
            "local3d.g3.19.independent-second-triangle-oracle-four-source.v1" or
            p319.get("historicRealOrbTripoSRModelSha256")!=prior.SHA["original"] or
            p319.get("historicalOriginalImageSha256")!=prior.IMAGE_SHA or
            p319.get("sourceRights")!="PROJECT_ORIGINAL_PROCEDURAL" or
            p319.get("twoDifferentExactNarrowphaseImplementationsAgreeForEveryNoIndexAabbCandidate") is not True or
            p319.get("printQualified") is not False):
        raise QAError("G3.20 earlier G3.19 rights/asset SHA proof diverged")

    expected_positive={"original":False,"derivative":True,
                       "reference":True,"chair":True}
    expected_meters_claim={"original":False,"derivative":True,
                           "reference":False,"chair":True}
    rows={}
    for lane,path in sources.items():
        if lane not in LANES:
            raise QAError("Unexpected additional previous source lane")
        result=screen_glb(path)
        old=p319[LANES[lane]]
        claims=result["unitProvenance"]["unverifiedGltfUnitClaims"]
        has_meters={"field":"units","claim":"meters"} in claims
        ray=result["sampledNormalRayChords"]
        if (result["modelSha256"]!=prior.SHA[lane] or
            result["triangleCount"]!=old["faces"] or
            result["sourcePositiveSignedVolumeForInwardRays"] is not
                expected_positive[lane] or
            has_meters is not expected_meters_claim[lane] or
            result["mmPerGLBUnit"] is not None or
            result["physicalMinWallThicknessMm"] is not None or
            result["minimumWallThicknessTested"] is not False or
            result["printQualified"] is not False or
            result["approvedForPrinter"] is not False or
            result["fabricationAction"]!="NONE" or
            result["unitProvenance"]["safeToConvertToMillimeters"] is not False or
            result["unitProvenance"]["sourceVerifiedMillimetersPerGLBUnit"] is not None or
            result["unitProvenance"]["independentMeasuredReferenceMm"]!="ABSENT" or
            result["status"]!=ray["status"]):
            raise QAError("G3.20 fail-closed unit/source/GLB provenance: "+lane)
        if lane=="original":
            if (ray["status"]!="INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION" or
                ray["probesExamined"]!=0 or
                ray["firstHitChordsArbitraryUnits"] is not None):
                raise QAError("G3.20 inverted original orb must NOT cast inward rays")
        else:
            if (ray["status"]!="SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE" or
                ray["probesExamined"]!=128 or
                ray["confidentFirstHitSamples"]<=0 or
                ray["firstHitChordsArbitraryUnits"] is None):
                raise QAError("G3.20 previous positive winding probe incomplete: "+lane)
        if lane=="reference":
            median=ray["firstHitChordsArbitraryUnits"]["median"]
            if median<=1.5:
                raise QAError("G3.20 solid sphere should produce full-solid chords")
        loc=PRIVATE/(lane+"-g320-uncalibrated-chords.json")
        if prepare_private:
            write_immutable(loc,result)
        if prior.getjson(loc)!=result:
            raise QAError("G3.20 immutable private report changed: "+lane)
        rows[lane]=result

    # The source original/copy may differ in winding orientation and GLB
    # metadata; do NOT assert identical ray outputs. Geometry dimensions
    # should, however, remain invariant across the unchanged surface copy.
    a,b=rows["original"],rows["derivative"]
    if (a["triangleCount"]!=b["triangleCount"] or
        a["meshExtentsArbitraryUnits"]!=b["meshExtentsArbitraryUnits"] or
        a["triangulationEdgeLengthsArbitraryUnits"]!=
            b["triangulationEdgeLengthsArbitraryUnits"]):
        raise QAError("G3.20 original/same-geometry copy surface metrics diverged")
    public={
        "schema":"local3d.g3.20.historical-scale-provenance-normal-ray-chord-four-models.v1",
        "sourceScope":"PREVIOUS_SHA_LOCKED_TRUSTED_GLB_ONLY",
        "fixtureId":"01-orb-alpha",
        "projectOriginalImageRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "originalImageSha256":prior.IMAGE_SHA,
        "realHistoricTripoSROrbModelSha256":prior.SHA["original"],
        "sameSurfaceWindingOnlyDerivativeSha256":prior.SHA["derivative"],
        "originalProceduralSphereGTSha256":prior.SHA["reference"],
        "historicLicensedMITChairSha256":prior.SHA["chair"],
        "historicalCompletedJobAndPriorG319SHARightsVerified":True,
        "meshMetadataUnitsNotAcceptedAsVerifiedPhysicalScale":True,
        "modelImagesProvideNoIndependentKnownMmDimensions":True,
        "noMillimeterConversionOrWallThicknessClaim":True,
        "noNormalRayProbeOnNonpositiveSignedVolumeOriginal":True,
        "normalRayChordsAreNotLocalWallThickness":True,
        "triangulationEdgesAreNotPhysicalFeatures":True,
        "realTripoSR":public_summary(rows["original"]),
        "sameGeometryPositiveWindingDerivative":public_summary(rows["derivative"]),
        "originalProceduralGT":public_summary(rows["reference"]),
        "historicLicensedChair":public_summary(rows["chair"]),
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "mmPerGLBUnit":None,
        "minimumPhysicalWallThicknessMm":None,
        "minimumWallThicknessCertified":False,
        "realWorldReferenceCalibrationAbsent":True,
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
        "privateRawModelJobIdAndFaceSamplesExcluded":True,
    }
    raw=json.dumps(public,sort_keys=True,indent=2)+"\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",raw,re.I):
        raise QAError("G3.20 private job ID leaked into sanitized report")
    if write_public:
        write_immutable(PUBLIC,public)
    if prior.getjson(PUBLIC)!=public:
        raise QAError("G3.20 public immutable proof changed")
    print("G3_20_ORIGINAL_SOURCE_SHA_UNIT_AND_CHORD_CPU_PASS "+json.dumps({
        "fourExistingModelShaSourcesVerified":True,
        "originalRealOrbPositiveSignedVolume":False,
        "originalRealOrbInwardRayProbesDisabled":True,
        "gltfMetadataMetersNotRealMillimeterCalibration":True,
        "positiveWindingSourcesBoundedChordsCompleted":3,
        "sourceVerifiedMillimetersPerGLBUnit":None,
        "minimumPhysicalWallThicknessMm":None,
        "newGpuInference":False,
        "printQualified":False,
    }))


if __name__=="__main__":
    try:
        p=argparse.ArgumentParser()
        p.add_argument("--job-id",required=True)
        p.add_argument("--prepare-private",action="store_true")
        p.add_argument("--write-public",action="store_true")
        a=p.parse_args()
        replay(a.job_id,prepare_private=a.prepare_private,
               write_public=a.write_public)
    except (QAError,OSError,ValueError,TypeError,KeyError,MemoryError) as exc:
        print("G3_20_CPU_PROOF_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
