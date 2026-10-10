"""LOCAL3D G3.20: trusted-source GLB units and bounded CPU chord diagnostics.

A glTF/Trimesh extras.units=meters claim is NOT evidence that image-generated
meshes represent physical meter-sized objects. Never infer a millimeter
conversion from such metadata. Physical scale remains UNKNOWN_UNCALIBRATED.

Inward face-normal FIRST-HIT CHORDS can traverse a whole solid and are not
minimum wall thickness. Small triangulation edges are NOT minimum features.
Both are arbitrary GLB units, sampled, non-manufacturing CPU indicators.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import struct
import time

import numpy as np

from geometry_qa import QAError, inspect_glb
from winding_equivalence import _mesh
from aabb_pair_census import _input

SCHEMA="local3d.g3.20.uncalibrated-units-and-normal-chord-cpu.v1"
MAX_VERTICES=100000
MAX_FACES=75000
MAX_ABS_COORD=1e9
MAX_PROBES=128
MAX_RAY_TRI_TESTS=10000000
MAX_SECONDS=45.0
MAX_JSON_BYTES=8*1024*1024


def _round(value):
    if value is None:
        return None
    x=float(value)
    if not math.isfinite(x):
        raise QAError("G3.20 nonfinite output value")
    return round(x,10)


def _quantiles(values):
    if not len(values):
        return None
    a=np.asarray(values,dtype=np.float64)
    if not np.isfinite(a).all() or np.min(a)<0:
        raise QAError("G3.20 invalid sampled distance")
    return {"min":_round(np.min(a)), "p10":_round(np.quantile(a,.1)),
            "median":_round(np.median(a)),
            "p90":_round(np.quantile(a,.9)), "max":_round(np.max(a))}


def _read_units_claims(glb):
    """Bounded local first GLB JSON chunk, allowed safe metadata only."""
    file=Path(glb)
    if file.is_symlink():
        raise QAError("G3.20 GLB symlink refused")
    length=file.stat().st_size
    with file.open("rb") as src:
        head=src.read(20)
        if (len(head)!=20 or head[:4]!=b"glTF" or
                struct.unpack_from("<I",head,4)[0]!=2 or
                struct.unpack_from("<I",head,8)[0]!=length or
                head[16:20]!=b"JSON"):
            raise QAError("G3.20 invalid GLB first JSON chunk")
        size=struct.unpack_from("<I",head,12)[0]
        if size<4 or size>MAX_JSON_BYTES or size>length-20:
            raise QAError("G3.20 GLB JSON exceeds trusted-source budget")
        raw=src.read(size)
    try:
        gltf=json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as error:
        raise QAError("G3.20 unreadable GLB JSON") from error
    if not isinstance(gltf,dict) or not isinstance(gltf.get("asset"),dict) or gltf["asset"].get("version")!="2.0":
        raise QAError("G3.20 invalid glTF asset version")
    claims=[]
    def scan(entry):
        if not isinstance(entry,dict):
            return
        for field in ("units","unit","unitScale","mmPerUnit","physicalScale"):
            if field not in entry:
                continue
            value=entry[field]
            if isinstance(value,str):
                normalized=value.strip().lower()
                label=normalized if normalized in (
                    "meters","meter","metres","millimeters","millimetres",
                    "centimeters","centimetres","mm","cm","m") else "OTHER_UNVERIFIED_STRING"
            else:
                label="NONSTRING_UNVERIFIED_CLAIM"
            claims.append((field,label))
    scan(gltf["asset"].get("extras"))
    scan(gltf.get("extras"))
    for key in ("meshes","nodes","scenes"):
        collection=gltf.get(key,[])
        if not isinstance(collection,list):
            raise QAError("G3.20 malformed glTF scene metadata")
        if len(collection)>100000:
            raise QAError("G3.20 metadata element count cap")
        for item in collection:
            scan(item.get("extras") if isinstance(item,dict) else None)
    safe=sorted(set(claims))
    return {
        "unverifiedGltfUnitClaims":[{"field":field,"claim":label}
                                    for field,label in safe],
        "unverifiedExporterOrMeshUnitsPresent":bool(safe),
        "declaredMetersAreNotTrustedAsPhysicalScale":True,
        "independentMeasuredReferenceMm":"ABSENT",
        "sourceVerifiedMillimetersPerGLBUnit":None,
        "physicalMillimeterScale":"UNKNOWN_UNCALIBRATED",
        "safeToConvertToMillimeters":False,
        "notInferredFromGltfExtrasOrGenerator":True,
    }


def _indeterminate_ray(reason,probes,examined,planned,completed):
    return {
        "status":("INDETERMINATE_UNVERIFIED_NORMAL_ORIENTATION"
                  if reason=="SOURCE_SIGNED_VOLUME_NOT_OUTWARD_NORMAL_RAYS_DISABLED"
                  else "INDETERMINATE_CPU_RAY_BUDGET"),
        "incompleteReason":reason,
        "probesPlanned":probes,
        "probesExamined":examined,
        "rayTriangleTestsPlanned":planned,
        "rayTriangleTestsCompleted":completed,
        "confidentFirstHitSamples":None,
        "boundaryAmbiguousSamplesExcluded":None,
        "noConfidentHitSamples":None,
        "firstHitChordsArbitraryUnits":None,
        "firstHitChordsRelativeToAabbDiagonal":None,
        "shortChordCountWithin1PercentDiagonal":None,
        "shortChordCountWithin5PercentDiagonal":None,
    }


def _ray_hit_distances(v,f,tri,*,max_probes=MAX_PROBES,
                       max_tests=MAX_RAY_TRI_TESTS,max_seconds=MAX_SECONDS):
    if not (1<=max_probes<=MAX_PROBES and
            1<=max_tests<=MAX_RAY_TRI_TESTS and
            0<max_seconds<=MAX_SECONDS):
        raise QAError("G3.20 unsafe CPU resource budget")
    started=time.perf_counter()
    n=len(f)
    sampled=np.unique(np.linspace(0,n-1,num=min(max_probes,n),dtype=np.int64))
    planned=int(len(sampled)*n)
    if planned>max_tests:
        return _indeterminate_ray("RAY_TRIANGLE_TESTS_CAP",len(sampled),0,planned,0)
    diag=float(np.linalg.norm(v.max(axis=0)-v.min(axis=0)))
    if not math.isfinite(diag) or diag<=1e-12:
        raise QAError("G3.20 degenerate bounding diagonal")
    min_forward=diag*1e-9
    e1=tri[:,1]-tri[:,0]
    e2=tri[:,2]-tri[:,0]
    raw_normals=np.cross(e1,e2)
    normal_mag=np.linalg.norm(raw_normals,axis=1)
    if not np.isfinite(normal_mag).all() or np.any(normal_mag<diag*diag*1e-15):
        raise QAError("G3.20 degenerate/nonfinite triangle normal")
    normals=raw_normals/normal_mag[:,None]
    distances=[]
    ambiguous=nohit=near1=near5=0
    for at,i64 in enumerate(sampled):
        if at%4==0 and time.perf_counter()-started>=max_seconds:
            return _indeterminate_ray("CPU_TIME_BUDGET",len(sampled),at,planned,at*n)
        i=int(i64)
        origin=tri[i].mean(axis=0)
        direction=-normals[i]
        incident=np.isin(f,f[i]).any(axis=1)
        h=np.cross(np.broadcast_to(direction,e2.shape),e2)
        det=np.einsum("ij,ij->i",e1,h)
        with np.errstate(divide="ignore",invalid="ignore"):
            nonparallel=np.abs(det)>diag*diag*1e-13
            inv=np.zeros(n,dtype=np.float64)
            inv[nonparallel]=1.0/det[nonparallel]
            delta=origin-tri[:,0]
            u=np.einsum("ij,ij->i",delta,h)*inv
            q=np.cross(delta,e1)
            w=np.einsum("j,ij->i",direction,q)*inv
            t=np.einsum("ij,ij->i",e2,q)*inv
            valid=((~incident)&nonparallel&(t>min_forward)&
                   (u>=-1e-10)&(w>=-1e-10)&(u+w<=1+1e-10))
            stable=(valid&(u>1e-9)&(w>1e-9)&(u+w<1-1e-9))
        if not np.any(valid):
            nohit+=1
            continue
        first=float(np.min(t[valid]))
        close=np.abs(t[valid]-first)<=max(min_forward,first*1e-8)
        if np.any((~stable[valid])&close):
            ambiguous+=1
            continue
        stable_t=t[stable]
        if not len(stable_t):
            nohit+=1
            continue
        hit=float(np.min(stable_t))
        if not math.isfinite(hit) or hit<=0:
            raise QAError("G3.20 nonfinite or nonpositive chord")
        distances.append(hit)
        near1+=int(hit/diag<=.01)
        near5+=int(hit/diag<=.05)
    if time.perf_counter()-started>=max_seconds:
        return _indeterminate_ray("CPU_TIME_BUDGET_AFTER_LAST_RAY",
                                  len(sampled),len(sampled),planned,planned)
    return {
        "status":"SAMPLED_NORMAL_RAY_CHORD_DIAGNOSTIC_COMPLETE",
        "incompleteReason":None,
        "probesPlanned":int(len(sampled)),
        "probesExamined":int(len(sampled)),
        "rayTriangleTestsPlanned":planned,
        "rayTriangleTestsCompleted":planned,
        "confidentFirstHitSamples":len(distances),
        "boundaryAmbiguousSamplesExcluded":ambiguous,
        "noConfidentHitSamples":nohit+ambiguous,
        "firstHitChordsArbitraryUnits":_quantiles(distances),
        "firstHitChordsRelativeToAabbDiagonal":
            _quantiles([distance/diag for distance in distances]),
        "shortChordCountWithin1PercentDiagonal":near1,
        "shortChordCountWithin5PercentDiagonal":near5,
        "rayOriginPolicy":"DETERMINISTIC_FACE_CENTROIDS",
        "rayDirectionPolicy":"NEGATIVE_ORIENTED_FACE_NORMAL",
        "rayHitExcludesTrianglesSharingOriginalVertexIndex":True,
        "rayFloatApproximateNotExactPhysicalMeasurement":True,
        "firstNormalRayHitMayTraverseSolidInterior":True,
        "chordsNotLocalWallThickness":True,
        "globalMinWallThicknessMeasured":False,
    }


def screen_geometry(vertices,faces,*,max_probes=MAX_PROBES,
                    max_ray_tests=MAX_RAY_TRI_TESTS,max_seconds=MAX_SECONDS,
                    probe_normals=True):
    v,f,tri,diag=_input(vertices,faces)
    if not np.isfinite(v).all() or np.max(np.abs(v))>MAX_ABS_COORD:
        raise QAError("G3.20 invalid oversized coordinates")
    edges=np.concatenate((np.linalg.norm(tri[:,1]-tri[:,0],axis=1),
                          np.linalg.norm(tri[:,2]-tri[:,1],axis=1),
                          np.linalg.norm(tri[:,0]-tri[:,2],axis=1)))
    if not np.isfinite(edges).all() or np.any(edges<=0):
        raise QAError("G3.20 invalid mesh edge")
    ray=(_ray_hit_distances(v,f,tri,max_probes=max_probes,
                            max_tests=max_ray_tests,max_seconds=max_seconds)
         if probe_normals else _indeterminate_ray(
             "SOURCE_SIGNED_VOLUME_NOT_OUTWARD_NORMAL_RAYS_DISABLED",0,0,0,0))
    return {
        "schema":SCHEMA,
        "status":ray["status"],
        "triangleCount":int(len(f)),
        "vertexCount":int(len(v)),
        "boundingDiagonalArbitraryUnits":_round(diag),
        "meshExtentsArbitraryUnits":[_round(x) for x in v.max(axis=0)-v.min(axis=0)],
        "triangulationEdgeLengthsArbitraryUnits":_quantiles(edges),
        "triangleEdgesAreNotMinimumPrintableFeatures":True,
        "sampledNormalRayChords":ray,
        "outwardNormalOrientationRequiredAndVerifiedForRays":bool(probe_normals),
        "realPhysicalUnitAndScale":"UNKNOWN_UNCALIBRATED",
        "mmPerGLBUnit":None,
        "physicalMinWallThicknessMm":None,
        "minimumWallThicknessTested":False,
        "measuredWallThicknessMinimumArbitraryUnits":None,
        "computedValuesAreNotMillimeters":True,
        "normalChordsAreNotWallThickness":True,
        "sourceGeometryAlreadyQuantizedIEEE754":True,
        "globalPrintableFeaturePass":False,
        "globalSelfIntersectionFreeCertified":False,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE",
        "newAiInference":False,
    }


def screen_glb(path):
    file=Path(path)
    if file.is_symlink():
        raise QAError("G3.20 symlinked source GLB rejected")
    qa=inspect_glb(file)
    topo=qa["topology"]
    if (qa["geometryObjectCount"]!=1 or topo["componentCount"]!=1 or
            topo["everyObjectWatertight"] is not True or
            topo["everyObjectWindingConsistent"] is not True or
            topo["boundaryEdges"]!=0 or topo["nonManifoldEdges"]!=0 or
            topo["zeroAreaFaces"]!=0 or topo["duplicateFaceTriples"]!=0):
        raise QAError("G3.20 only verified closed positively oriented single GLB")
    mesh=_mesh(file)
    positive=topo["everyObjectPositiveVolume"] is True
    result=screen_geometry(mesh.vertices,mesh.faces,probe_normals=positive)
    result["sourcePositiveSignedVolumeForInwardRays"]=positive
    result["modelSha256"]=qa["modelSha256"]
    result["modelBytes"]=qa["modelBytes"]
    result["unitProvenance"]=_read_units_claims(file)
    return result


def write_immutable(path,report):
    target=Path(path)
    if target.is_symlink():
        raise QAError("G3.20 symlinked evidence refused")
    raw=json.dumps(report,sort_keys=True,indent=2)+"\n"
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists():
        if target.read_text(encoding="utf-8")!=raw:
            raise QAError("G3.20 immutable evidence changed")
    else:
        target.write_text(raw,encoding="utf-8")
