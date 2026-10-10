"""G3.19 exact rational TRIANGLE CONTACT differential proof on historical GLBs.

An independent second exact mathematical oracle cross-checks every G3.17
zero-index AABB candidate, plus fixed lexicographic 256 shared-full-edge
and 256 one-vertex-only indexed pairs PER previously licensed GLB.

Zero GPU, new AI inference, printer or external network. Source rights/job
asset SHA validation borrowed from G3.15; G3.18 proof must have passed.
Private indexed face IDs never published, and disagreement fails closed.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import sys
import time

os.environ["CUDA_VISIBLE_DEVICES"]="-1"
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["PYTHONNOUSERSITE"]="1"

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"engines"/"quality"))
import numpy as np
from geometry_qa import QAError,inspect_glb
from winding_equivalence import _mesh
from aabb_pair_census import _input
from exact_nonindexed_contact import _candidate_pairs, classify_two_exact
from exact_indexed_vertex_contact import _enumerate_vertex_only_pairs
from independent_triangle_oracle import classify_pair_independent
from exact_aabb_sweep_audit import write_immutable

spec=importlib.util.spec_from_file_location(
    "g315_original_sha_rights",ROOT/"scripts"/"g3-15-edge-replay.py")
if spec is None or spec.loader is None:
    raise QAError("Historical G3.15 rights source SHA validator absent")
prior=importlib.util.module_from_spec(spec)
spec.loader.exec_module(prior)

PRIVATE=ROOT/"runtime"/"qa"/"g3"/"orb-01-positive-winding"
PUBLIC=ROOT/"docs"/"evidence"/"g3"/"orb-01-g319-second-exact-oracle-proof.json"
OLD317=ROOT/"docs"/"evidence"/"g3"/"orb-01-g317-exact-noindex-aabb-pairs.json"
OLD318=ROOT/"docs"/"evidence"/"g3"/"orb-01-g318-exact-axis-sweep-proof.json"
OLD316=ROOT/"docs"/"evidence"/"g3"/"orb-01-g316-exact-indexed-vertex-only.json"
MAX_RUNTIME=105.0
MAX_NOINDEX=100000
MAX_ADJACENCY_SAMPLE=256

LANES={
    "original":("realTripoSR","realTripoSR","realTripoSR"),
    "derivative":("unchangedWindingOnlyCopy","windingOnlySameSurface",
                 "sameSurfaceWindingOnlyDerivative"),
    "reference":("projectOriginalGT","originalProceduralGT",
                 "originalProceduralGT"),
    "chair":("historicalChair","historicLicensedChair","previousLicensedChair"),
}


def classify_bounded(model):
    path=Path(model)
    if path.is_symlink():
        raise QAError("G3.19 symlinked source model refused")
    qa=inspect_glb(path)
    topo=qa["topology"]
    if (qa["geometryObjectCount"]!=1 or
        topo["componentCount"]!=1 or
        topo["everyObjectWatertight"] is not True or
        topo["everyObjectWindingConsistent"] is not True or
        topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or
        topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0):
        raise QAError("G3.19 source must be a single valid closed indexed manifold")
    mesh=_mesh(path)
    v,f,tri,diag=_input(mesh.vertices,mesh.faces)
    begun=time.perf_counter()
    pairs,counts,why,_=_candidate_pairs(
        v,f,tri,diag,max_sphere=2000000,max_aabb=750000,
        max_noindex=300000,deadline_started=begun,max_seconds=MAX_RUNTIME)
    if why is not None or len(pairs)>MAX_NOINDEX:
        raise QAError("G3.19 source no-index candidate budget incomplete")

    tally={"EXACT_DISJOINT":0,
           "EXACT_SINGLE_POINT_BOUNDARY_CONTACT":0,
           "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION":0,
           "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT":0,
           "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP":0}
    for k,(i,j) in enumerate(pairs):
        if k%128==0 and time.perf_counter()-begun>=MAX_RUNTIME:
            raise QAError("G3.19 non-index rational comparison CPU budget")
        first,second=tri[i],tri[j]
        oracle=classify_pair_independent(first,second)
        original=classify_two_exact(first,second)
        if oracle!=original:
            raise QAError("G3.19 two exact triangle engines DISAGREE for no-index pair")
        if oracle not in tally:
            raise QAError("G3.19 unknown independent exact-predicate label")
        tally[oracle]+=1

    # Indexed full-edge sample is a DIFFERENT gate from full no-index census:
    # G3.15 full indexed edge original proof persists independently.
    edges=np.asarray(mesh.face_adjacency,dtype=np.int64)
    edges=np.unique(np.sort(edges,axis=1),axis=0)
    edge_sample=edges[:min(MAX_ADJACENCY_SAMPLE,len(edges))]
    edge_results={}
    for i,j in edge_sample:
        if time.perf_counter()-begun>=MAX_RUNTIME:
            raise QAError("G3.19 shared-edge sample CPU budget")
        label1=classify_pair_independent(tri[i],tri[j])
        label2=classify_two_exact(tri[i],tri[j])
        if label1!=label2 or label1 not in (
            "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION",
            "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT",
            "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"):
            raise QAError("G3.19 shared indexed-edge expected contact disagreement")
        edge_results[label1]=edge_results.get(label1,0)+1

    # G3.16 full one-vertex exact prior proof persists independently;
    # compare second oracle only a deterministic fixed 256-pair subset.
    vs,incidence_upper,vwhy=_enumerate_vertex_only_pairs(
        f,len(v),1000000,280000)
    if vwhy or vs is None:
        raise QAError("G3.19 vertex topology incidence budget")
    vertex_sample=sorted(vs)[:min(MAX_ADJACENCY_SAMPLE,len(vs))]
    vertex_results={}
    for i,j,vid in vertex_sample:
        if time.perf_counter()-begun>=MAX_RUNTIME:
            raise QAError("G3.19 indexed vertex-only sample CPU budget")
        label1=classify_pair_independent(tri[i],tri[j])
        label2=classify_two_exact(tri[i],tri[j])
        if label1!=label2 or label1!="EXACT_SINGLE_POINT_BOUNDARY_CONTACT":
            raise QAError("G3.19 indexed vertex-only oracle disagreement")
        vertex_results[label1]=vertex_results.get(label1,0)+1

    if time.perf_counter()-begun>=MAX_RUNTIME:
        raise QAError("G3.19 exact differential time after full source")
    return {
        "modelSha256":qa["modelSha256"],
        "modelBytes":qa["modelBytes"],
        "faces":len(f),
        "G317AllNumAabbPairs":counts["aabbPairs"],
        "G317NoIndexPairCandidates":len(pairs),
        "G319NoIndexIndependentOracleClassified":sum(tally.values()),
        "independentSecondExactOracleClassificationCounts":tally,
        "indexedFullSharedEdgePairsTotal":len(edges),
        "indexedFullEdgeOracleSampleCount":len(edge_sample),
        "indexedFullEdgeSampleClassificationCounts":edge_results,
        "indexedSingleVertexPairsTotal":len(vs),
        "indexedOneVertexOracleSampleCount":len(vertex_sample),
        "indexedSingleVertexSampleClassificationCounts":vertex_results,
        "completeNoIndexDifferentialExactEveryCandidate":True,
        "onlySelectedIndexedAdjacencyDifferentialNotEntire":True,
        "independentCoplanarMethod":"ALL_NINE_SEGMENT_INTERSECTIONS_PLUS_VERTEX_INSIDE",
        "independentNoncoplanarMethod":"EXACT_EDGE_PLANE_CROSSING_LINE_INTERVALS",
        "sourceAlreadyDecodedIEEE754":True,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
    }


def summarized(r):
    return {key:r[key] for key in (
        "faces","G317AllNumAabbPairs","G317NoIndexPairCandidates",
        "G319NoIndexIndependentOracleClassified",
        "independentSecondExactOracleClassificationCounts",
        "indexedFullSharedEdgePairsTotal","indexedFullEdgeOracleSampleCount",
        "indexedFullEdgeSampleClassificationCounts",
        "indexedSingleVertexPairsTotal","indexedOneVertexOracleSampleCount",
        "indexedSingleVertexSampleClassificationCounts",
        "completeNoIndexDifferentialExactEveryCandidate",
        "onlySelectedIndexedAdjacencyDifferentialNotEntire",
        "printQualified")}


def replay(job_id,*,prepare_private=False,write_public=False):
    sources,old314=prior.historical_models(job_id)
    o317=prior.getjson(OLD317)
    o318=prior.getjson(OLD318)
    o316=prior.getjson(OLD316)
    if (o317.get("realHistoricTripoSRModelSha256")!=prior.SHA["original"] or
        o317.get("originalImageSha256")!=prior.IMAGE_SHA or
        o318.get("previousRealTripoSRModelSha256")!=prior.SHA["original"] or
        o318.get("zeroIndexCandidatePairIdentityComparedNotOnlyCounts") is not True or
        o318.get("allStrictDecodedCoordinateAabbNoIndexPairsPresentInPriorExactG317") is not True or
        o316.get("fullyExactCensusOfEveryOneIndexedVertexOnlyFacePair") is not True):
        raise QAError("G3.19 preexisting source/narrowphase/AABB proof not validated")
    results={}
    for kind,model in sources.items():
        current=classify_bounded(model)
        lane314,lane317,lane318=LANES[kind]
        source_317=o317[lane317]
        source_318=o318[lane318]
        source_314=old314[lane314]
        if (current["modelSha256"]!=prior.SHA[kind] or
            current["G317AllNumAabbPairs"]!=source_317["allAabbOverlapCandidates"] or
            current["G317AllNumAabbPairs"]!=source_318["rationalExactToleranceAabbPairs"] or
            current["G317NoIndexPairCandidates"]!=source_317["nonindexedAabbExactCandidateCount"] or
            current["G317NoIndexPairCandidates"]!=source_318["exactToleranceNoSharedIndex"] or
            current["G319NoIndexIndependentOracleClassified"]!=
                source_317["exactNoIndexPairsExamined"] or
            current["independentSecondExactOracleClassificationCounts"].get("EXACT_DISJOINT",0)!=
                source_317["exactDisjointPairs"] or
            current["indexedFullSharedEdgePairsTotal"]!=source_314["pairsSharingIndexedEdge"] or
            current["indexedSingleVertexPairsTotal"]!=source_314["pairsSharingExactlyOneIndexedVertex"] or
            current["indexedFullEdgeOracleSampleCount"]!=
                min(MAX_ADJACENCY_SAMPLE,current["indexedFullSharedEdgePairsTotal"]) or
            current["indexedOneVertexOracleSampleCount"]!=
                min(MAX_ADJACENCY_SAMPLE,current["indexedSingleVertexPairsTotal"]) or
            current["globalSelfIntersectionFreeCertified"] is not False or
            current["printQualified"] is not False):
            raise QAError("G3.19 independent second-engine SHA/model counts diverged: "+kind)
        private=PRIVATE/(kind+"-g319-second-oracle.json")
        if prepare_private:
            write_immutable(private,current)
        if prior.getjson(private)!=current:
            raise QAError("G3.19 immutable private independent exact proof mismatch: "+kind)
        results[kind]=current
    exclude=("modelSha256","modelBytes")
    a={k:v for k,v in results["original"].items() if k not in exclude}
    b={k:v for k,v in results["derivative"].items() if k not in exclude}
    if a!=b:
        raise QAError("G3.19 unchanged-surface winding-only source differences")
    public={
        "schema":"local3d.g3.19.independent-second-triangle-oracle-four-source.v1",
        "scope":"EVERY_G317_NOINDEX_AABB_CANDIDATE_PLUS_256_INDEXED_EDGE_AND_VERTEX_SAMPLES_PER_MODEL",
        "fixtureId":"01-orb-alpha",
        "sourceRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "historicalOriginalImageSha256":prior.IMAGE_SHA,
        "historicRealOrbTripoSRModelSha256":prior.SHA["original"],
        "unchangedWindingOnlyCopySha256":prior.SHA["derivative"],
        "originalProceduralGroundTruthSha256":prior.SHA["reference"],
        "historicLicensedMITChairSha256":prior.SHA["chair"],
        "historicalG2CompletedJobAssetsAndOriginalSourceRightsVerified":True,
        "twoDifferentExactNarrowphaseImplementationsAgreeForEveryNoIndexAabbCandidate":True,
        "eachIndexedSharedEdgeAndVertexOnlySubsetSizeAtMost":MAX_ADJACENCY_SAMPLE,
        "notFullIndependentIndexedAdjacencyOracle":True,
        "sourceDataAlwaysPreviouslyCreatedRealOrLicensed":True,
        "independentCoplanarMethod":"ALL_NINE_SEGMENT_INTERSECTIONS_PLUS_VERTEX_INSIDE",
        "independentNoncoplanarMethod":"EXACT_EDGE_PLANE_CROSSING_LINE_INTERVALS",
        "realTripoSR":summarized(results["original"]),
        "windingOnlySameSurface":summarized(results["derivative"]),
        "originalProceduralGT":summarized(results["reference"]),
        "historicalLicensedChair":summarized(results["chair"]),
        "identicalGeometricOriginalAndWindingCopyCounts":True,
        "noNewGpuAiInference":True,
        "decodedGeometryNotUnquantizedCAD":True,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "wallThickness":"NOT_TESTED",
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "rawModelImagePrivateJobUUIDAndSampleFaceIndicesExcluded":True,
    }
    raw=json.dumps(public,sort_keys=True,indent=2)+"\n"
    if job_id.lower() in raw.lower() or re.search(
            r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}",raw,re.I):
        raise QAError("G3.19 private ID leak in public proof")
    if write_public:
        write_immutable(PUBLIC,public)
    if prior.getjson(PUBLIC)!=public:
        raise QAError("G3.19 public sanitized SHA replay divergence")
    print("G3_19_INDEPENDENT_SECOND_EXACT_ORACLE_FOUR_SOURCE_PASS "+json.dumps({
        "realOrbEveryNoIndexExactPairsCompared":results["original"][
            "G319NoIndexIndependentOracleClassified"],
        "realOrbNoIndexDisagreements":0,
        "realOrbIndexedEdgeSample":results["original"][
            "indexedFullEdgeOracleSampleCount"],
        "realOrbIndexedVertexSample":results["original"][
            "indexedOneVertexOracleSampleCount"],
        "allFourSourcesRightsSHAVerified":True,
        "newGpuInference":False,
        "printQualified":False,
    }))


if __name__=="__main__":
    try:
        ap=argparse.ArgumentParser()
        ap.add_argument("--job-id",required=True)
        ap.add_argument("--prepare-private",action="store_true")
        ap.add_argument("--write-public",action="store_true")
        a=ap.parse_args()
        replay(a.job_id,prepare_private=a.prepare_private,
               write_public=a.write_public)
    except (QAError,OSError,ValueError,TypeError,KeyError,MemoryError) as exc:
        print("G3_19_INDEPENDENT_ORACLE_FAILED "+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(1)
