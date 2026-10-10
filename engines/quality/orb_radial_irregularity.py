"""G3.8 orb-specific radial irregularity, CPU-only and scale-normalized.

Compares a known procedural orb ground truth to a PREVIOUSLY generated real
prediction. Deterministic AREA-WEIGHTED surface sampling + least-squares
best-fit sphere. Radial residuals mix coarse shape distortion and texture-like
ripple: they are NOT a printer finish, CAD, mm or calibrated accuracy measure.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import numpy as np
from geometry_qa import QAError
from shape_metrics import (load_pinned_mesh, pinned_original_reference,
                           uniform_surface_sample)
from winding_equivalence import prove_exact_winding_only

SCHEMA="local3d.g3.8.orb-radial-irregularity.v1"
SAMPLES=4096
SEED=20261010
FIXTURE="01-orb-alpha"


def _rounded(val: float):
    return round(float(val),8)


def fit_radial_irregularity(vertices: np.ndarray, faces: np.ndarray,
                           *, samples=SAMPLES,seed=SEED):
    if samples<256 or samples>8192:
        raise QAError("Invalid bounded sample budget")
    surface,original_diagonal=uniform_surface_sample(
        vertices,faces,n_samples=samples,seed=seed)
    if surface.ndim!=2 or surface.shape!=(samples,3) or not np.isfinite(surface).all():
        raise QAError("Invalid normalized surface data")
    system=np.column_stack((2*surface,np.ones(samples)))
    rhs=(surface**2).sum(axis=1)
    solution,_,rank,_=np.linalg.lstsq(system,rhs,rcond=None)
    if rank!=4 or not np.isfinite(solution).all():
        raise QAError("Surface is insufficient to fit a sphere")
    center=solution[:3]
    nominal_sq=solution[3]+float(center@center)
    if nominal_sq<=1e-12:
        raise QAError("No finite fitted radius")
    nominal=np.sqrt(nominal_sq)
    distances=np.linalg.norm(surface-center,axis=1)
    residual=np.abs(distances-nominal)/nominal
    spread=np.percentile(distances,[5,95])
    return {
        "sampleCount":samples,
        "seed":seed,
        "sampleDistribution":"AREA_WEIGHTED_TRIANGLES_DETERMINISTIC",
        "coordinates":"EACH_MESH_AABB_CENTERED_DIAGONAL_NORMALIZED_INDEPENDENTLY",
        "fit":"LINEAR_LEAST_SQUARES_SPHERE_TO_SAMPLED_SURFACE",
        "originalAabbDiagonalArbitraryUnits":_rounded(original_diagonal),
        "fittedRadiusInNormalizedUnits":_rounded(nominal),
        "absoluteRadialResidualMeanRelativeToRadius":_rounded(residual.mean()),
        "absoluteRadialResidualP95RelativeToRadius":_rounded(np.percentile(residual,95)),
        "radialResidualRmsRelativeToRadius":_rounded(np.sqrt(np.mean(residual**2))),
        "radialSpreadP95MinusP5RelativeToRadius":_rounded((spread[1]-spread[0])/nominal)
    }


def compare_real_orb(reference: Path,predicted: Path,derivative: Path):
    catalog,reference_expected=pinned_original_reference(FIXTURE)
    if Path(reference).resolve(strict=True)!=reference_expected.resolve(strict=True):
        raise QAError("Wrong G3 licensed original reference geometry")
    proof=prove_exact_winding_only(predicted,derivative)
    vgt,fgt,gt_qa=load_pinned_mesh(reference,catalog["groundTruthSha256"])
    vpred,fpred,pred_qa=load_pinned_mesh(predicted)
    if pred_qa["modelSha256"]!=proof["sourceSha256"] or \
       catalog["imageSha256"]!="9cb2f41de1b0239570068b055dc06bf941491559e11942b5bbc5757adb3d886a":
        raise QAError("Unauthorized/mismatched actual 01-orb-alpha source")
    ref=fit_radial_irregularity(vgt,fgt)
    prediction=fit_radial_irregularity(vpred,fpred)
    return {
        "schema":SCHEMA,
        "fixtureId":FIXTURE,
        "fixtureRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "fixtureImageSha256":catalog["imageSha256"],
        "originalReferenceSha256":gt_qa["modelSha256"],
        "previousRealPredictionSha256":pred_qa["modelSha256"],
        "orientationDerivativeSha256":proof["derivativeSha256"],
        "sampleMethodIdenticalForBoth":True,
        "referenceRoundness":ref,
        "actualModelRoundness":prediction,
        "predictionAbsoluteResidualMeanToReferenceRatio":_rounded(
            prediction["absoluteRadialResidualMeanRelativeToRadius"] /
            max(ref["absoluteRadialResidualMeanRelativeToRadius"],1e-8)),
        "derivativeSameExactVertexAndSurfaceGeometryAsPrediction":True,
        "derivativeIsNotReScoredBecauseItsSurfaceIsIdentical":True,
        "accuracyNotCalibrated":True,
        "metricIsNotDimensionOrManufacturingSurfaceFinish":True,
        "notEvaluated":[
            "Self intersection clearance and touching topology",
            "Millimeter scale or calibrated 3D pose",
            "Thickness, mechanical strength or supports",
            "Texture fidelity, source camera projection, customer-quality scoring",
            "True machine print quality and defect tolerance"
        ],
        "interpretation":[
            "Lower normalized radial residual is closer to SOME best-fit sphere, not necessarily more faithful to original input image",
            "This metric combines global nonroundness, triangle faceting and local ripple; it cannot isolate a roughness frequency",
            "Separate normalization conceals physical scale; procedural source is not a TripoSR output",
            "One original-synthetic fixture does not establish quality on photographs"
        ],
        "newAiInference":False,"printQualified":False,
        "approvedForPrinter":False,"fabricationAction":"NONE"
    }


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--reference",type=Path,required=True)
    parser.add_argument("--predicted",type=Path,required=True)
    parser.add_argument("--derivative",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    result=compare_real_orb(args.reference,args.predicted,args.derivative)
    target=args.out
    if target.is_symlink():
        raise QAError("Symlink output forbidden")
    raw=json.dumps(result,indent=2,sort_keys=True)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=raw:
            raise QAError("Refusing changed radial report overwrite")
    else:
        target.write_text(raw,encoding="utf-8")
    print("G3_8_ORB_RADIAL_CPU_DIAGNOSTIC "+json.dumps({
        "referenceMeanRelative":result["referenceRoundness"]["absoluteRadialResidualMeanRelativeToRadius"],
        "predictionMeanRelative":result["actualModelRoundness"]["absoluteRadialResidualMeanRelativeToRadius"],
        "ratio":result["predictionAbsoluteResidualMeanToReferenceRatio"],
        "printQualified":False,"gpuInference":False}))


if __name__=="__main__":
    try:main()
    except (QAError,OSError,ValueError,TypeError) as error:
        print("G3_8_RADIAL_CPU_FAILED "+type(error).__name__+": "+str(error),file=sys.stderr)
        sys.exit(1)
