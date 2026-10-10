"""Generate LICENSE-CLEAR reproducible LOCAL3D G3 geometry fixtures; CPU only.

The 8 rendered scenes are project-original procedural shapes and include an
exact foreground mask + original ground-truth GLB. An upstream MIT TripoSR chair
is a NINTH image-only reference, with a mask from its alpha channel.
No neural inference, external media, remote downloads or printing.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import math
from pathlib import Path
import sys

import numpy as np
import trimesh
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "benchmarks" / "g3" / "fixtures"
IMAGE_SIZE = 512
CAMERA_AXIS = (4.0, 2.8, 5.0)
LIGHT = np.array([0.35, 0.75, 0.56])
LIGHT /= np.linalg.norm(LIGHT)
MAIN_COLOR = (191, 198, 188)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def vector(v):
    return np.array(v, dtype=np.float64)


def write_locked(path, raw):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        existing = path.read_bytes()
        if existing != raw:
            raise ValueError(f"Immutable fixture differs: {path}; do not overwrite blindly")
        return
    path.write_bytes(raw)


def box(size, at):
    mesh = trimesh.creation.box(extents=size)
    mesh.apply_translation(at)
    return mesh


def cylinder(radius, height, at, sections=48):
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    mesh.apply_transform(trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0]))
    mesh.apply_translation(at)
    return mesh


def torus(major=0.8, minor=0.24, m=64, n=24):
    v = []
    f = []
    for a in range(m):
        t = a * 2 * math.pi / m
        for b in range(n):
            u = b * 2 * math.pi / n
            r = major + minor * math.cos(u)
            v.append([r * math.cos(t), minor * math.sin(u), r * math.sin(t)])
    for a in range(m):
        for b in range(n):
            s = a*n + b
            t = ((a+1)%m)*n + b
            u = a*n + (b+1)%n
            w = ((a+1)%m)*n + (b+1)%n
            f.extend([[s,t,u],[u,t,w]])
    result = trimesh.Trimesh(vertices=v, faces=f, process=False)
    if result.volume < 0:
        result.invert()
    return result


def vase():
    # Outer bottom -> outer shoulder -> lip -> inner wall -> inner floor.
    # End caps enclose a real cavity, while the mouth stays visibly open.
    profile = [
        (.52,-.9),(.58,-.78),(.65,-.5),(.78,-.20),(.72,.14),
        (.58,.55),(.51,.9),(.42,.9),(.43,.62),(.57,.16),
        (.63,-.20),(.50,-.55),(.40,-.67)
    ]
    n=64
    v = [[r*math.cos(2*math.pi*k/n),y,r*math.sin(2*math.pi*k/n)]
         for r,y in profile for k in range(n)]
    faces=[]
    for a in range(len(profile)-1):
        for k in range(n):
            q=a*n+k
            t=a*n+(k+1)%n
            w=(a+1)*n+k
            z=(a+1)*n+(k+1)%n
            faces.extend([[q,w,t],[t,w,z]])
    # Floor and base caps use shared ring indices.
    start=len(v);v.append([0,profile[0][1],0])
    end=len(v);v.append([0,profile[-1][1],0])
    for k in range(n):
        faces.append([start,(k+1)%n,k])
        b=(len(profile)-1)*n
        faces.append([end,b+k,b+(k+1)%n])
    m=trimesh.Trimesh(vertices=v,faces=faces,process=False)
    if m.volume < 0: m.invert()
    return m


def gear(teeth=12):
    ring=[]
    for k in range(teeth*4):
        a=k*2*math.pi/(teeth*4)
        r=1.06 if k%4 in (1,2) else .78
        ring.append([r*math.cos(a),r*math.sin(a)])
    n=len(ring)
    v=[[x,-.19,z] for x,z in ring]+[[x,.19,z] for x,z in ring]+[[0,-.19,0],[0,.19,0]]
    faces=[]
    for k in range(n):
        j=(k+1)%n
        faces.extend([[2*n,j,k],[2*n+1,n+k,n+j],
                      [k,j,n+k],[n+k,j,n+j]])
    m=trimesh.Trimesh(vertices=v,faces=faces,process=False)
    if m.volume<0:m.invert()
    return m


def make_scenes():
    white=(224,214,201);teal=(97,166,161);rust=(196,128,94)
    ball=trimesh.creation.icosphere(subdivisions=3,radius=.86)
    ball.apply_translation([0,.02,0])
    return [
        ("01-orb-alpha", "simple_convex", "RGBA transparent",
         [(ball.copy(),teal)]),
        ("02-orb-opaque", "same_geometry_opaque_background", "RGB light-gray",
         [(ball.copy(),teal)]),
        ("03-hollow-vase", "hollow_cavity", "RGBA transparent",
         [(vase(),white)]),
        ("04-torus-hole", "through_hole", "RGBA transparent",
         [(torus(),rust)]),
        ("05-disconnected-pair", "separated_objects", "RGBA transparent",
         [(trimesh.creation.icosphere(subdivisions=2,radius=.55).apply_translation([-.75,-.22,0]),teal),
          (trimesh.creation.icosphere(subdivisions=2,radius=.34).apply_translation([.74,.05,.15]),rust)]),
        ("06-thin-chair", "thin_parts_and_open_silhouette", "RGBA transparent",
         [(box([1.55,.19,1.35],[0,-.12,0]),white),
          (box([1.55,1.5,.13],[0,.7,-.60]),teal)]+
         [(box([.14,.97,.14],[x,-.67,z]),rust)
           for x in (-.66,.66) for z in (-.54,.54)]),
        ("07-gear-opaque", "toothed_outline", "RGB light-gray",
         [(gear(),teal)]),
        ("08-arch-opaque", "overhang_and_gaps", "RGB light-gray",
         [(box([.27,1.8,.4],[x,-.1,0]),white) for x in (-.85,.85)] +
         [(box([1.97,.3,.42],[0,.93,0]),rust)])
    ]


def encode_png(picture):
    buff=io.BytesIO()
    picture.save(buff,format="PNG",optimize=False,compress_level=6)
    return buff.getvalue()


def render(parts, transparency):
    # Orthographic synthetic product photograph. Flat-shaded triangles are
    # ordered by depth; masks are exact union of projected source triangles.
    all_verts=np.vstack([np.asarray(mesh.vertices) for mesh,_ in parts])
    center=(all_verts.min(axis=0)+all_verts.max(axis=0))/2
    towards=-vector(CAMERA_AXIS)
    towards/=np.linalg.norm(towards)
    right=np.cross(towards,vector([0,1,0]))
    right/=np.linalg.norm(right)
    up=np.cross(right,towards)
    xy=np.vstack([(all_verts-center)@right,(all_verts-center)@up]).T
    image_scale=max(float(np.ptp(xy[:,0])),float(np.ptp(xy[:,1])),1e-8)
    scale=(IMAGE_SIZE*.70)/image_scale
    bg=(0,0,0,0) if transparency else (244,246,246)
    pic=Image.new("RGBA" if transparency else "RGB",(IMAGE_SIZE,IMAGE_SIZE),bg)
    mask=Image.new("L",(IMAGE_SIZE,IMAGE_SIZE),0)
    draw=ImageDraw.Draw(pic)
    masked=ImageDraw.Draw(mask)
    polygons=[]
    for mesh,color in parts:
        verts=np.asarray(mesh.vertices,dtype=np.float64)
        faces=np.asarray(mesh.faces,dtype=np.int64)
        local=(verts-center)
        screen=np.stack((IMAGE_SIZE/2+(local@right)*scale,
                         IMAGE_SIZE/2-(local@up)*scale),axis=1)
        depth=local@towards
        for face in faces:
            p=screen[face]
            a,b,c=verts[face]
            norm=np.cross(b-a,c-a)
            length=np.linalg.norm(norm)
            if length<1e-12:continue
            norm/=length
            brightness=max(.30,min(1.0,.53+.43*np.dot(norm,LIGHT)))
            rgb=tuple(int(max(0,min(255,brightness*x))) for x in color)
            polygons.append((float(depth[face].mean()),[tuple(x) for x in p],rgb))
    polygons.sort(key=lambda x:x[0],reverse=True) # distant polygons first
    for _,poly,rgb in polygons:
        draw.polygon(poly,fill=rgb+(255,) if transparency else rgb)
        masked.polygon(poly,fill=255)
    return pic,mask


def write_original(entry):
    id_,category,background,parts=entry
    folder=OUTPUT/id_
    transparent="RGBA" in background
    image,mask=render(parts,transparent)
    source=encode_png(image);mask_bytes=encode_png(mask)
    scene=trimesh.Scene()
    for i,(mesh,color) in enumerate(parts):
        copy=mesh.copy()
        copy.visual.vertex_colors=np.tile(np.array([*color,255],dtype=np.uint8),(len(copy.vertices),1))
        scene.add_geometry(copy,geom_name=f"original_{i:02d}")
    glb=scene.export(file_type="glb")
    write_locked(folder/"input.png",source)
    write_locked(folder/"foreground-mask.png",mask_bytes)
    write_locked(folder/"ground-truth.glb",glb)
    foreground=float(np.asarray(mask).mean()/255)
    return {
        "id":id_, "category":category, "sourceRights":"PROJECT_ORIGINAL_PROCEDURAL",
        "sourceKind":"software-rendered original 3D scene, not model output",
        "background":background, "imageSha256":sha(source),
        "maskSha256":sha(mask_bytes), "groundTruthSha256":sha(glb),
        "files":{
            "image":f"{id_}/input.png","mask":f"{id_}/foreground-mask.png",
            "groundTruth":f"{id_}/ground-truth.glb"
        },
        "imageSize":[IMAGE_SIZE,IMAGE_SIZE], "foregroundFraction":round(foreground,5),
        "cameraAxis":list(CAMERA_AXIS),
        "physicalDimensions":"UNKNOWN_SYNTHETIC_COORDINATES",
        "sourceOfTruth":"scripts/g3_make_fixtures.py"
    }


def upstream_chair():
    source=(ROOT/"docs/evidence/g2/source-chair.png").read_bytes()
    image=Image.open(io.BytesIO(source)).convert("RGBA")
    alpha=image.getchannel("A")
    if alpha.getextrema() == (255,255):
        raise ValueError("Pinned MIT chair unexpectedly lacks alpha silhouette")
    mask=alpha.point(lambda x: 255 if x>=128 else 0)
    mask_bytes=encode_png(mask)
    folder=OUTPUT/"09-upstream-chair"
    write_locked(folder/"foreground-mask.png",mask_bytes)
    return {
        "id":"09-upstream-chair","category":"real_upstream_input_baseline",
        "sourceRights":"UPSTREAM_TRIPOSR_MIT_SAMPLE",
        "sourceKind":"TripoSR pinned example photo, not procedurally generated",
        "background":"RGBA transparent",
        "imageSha256":sha(source),"maskSha256":sha(mask_bytes),
        "groundTruthSha256":None,
        "files":{
            "image":"docs/evidence/g2/source-chair.png",
            "mask":"benchmarks/g3/fixtures/09-upstream-chair/foreground-mask.png",
            "groundTruth":None,
            "existingRealOutput":"docs/evidence/g2-app/real-app-output.glb"
        },
        "imageSize":list(image.size),
        "physicalDimensions":"UNKNOWN_UNCALIBRATED",
        "licenseEvidence":"docs/TRIPOSR_SOURCE_LOCK.json and docs/evidence/g2/README.md",
        "note":"Existing real GLB, one actual model run, not generated by this fixture builder"
    }


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",type=Path,default=OUTPUT)
    args=parser.parse_args()
    if args.output.resolve()!=OUTPUT.resolve():
        parser.error("Benchmark output fixed to the dedicated project directory")
    entries=[write_original(x) for x in make_scenes()]+[upstream_chair()]
    assert len(entries)==9 and len({e["id"] for e in entries})==9
    manifest={
        "schema":"local3d.g3.fixture-catalog.v1",
        "dataset":"G3_ORIGINAL_SYNTHETIC_PLUS_ONE_LICENSED_UPSTREAM",
        "fixtureCount":len(entries),
        "requiresGpu":False,
        "hasRealInference":False,
        "photoRights":{
            "originals":"Eight generated by project code; no third-party photos/models",
            "upstream":"TripoSR example photo distributed under upstream MIT source"
        },
        "evaluationLimitations":[
            "The synthetic images are not a representative natural-photo distribution",
            "Reference CAD geometries use arbitrary synthetic units, not millimeters",
            "A source-mask silhouette score is camera-alignment sensitive",
            "Real chair has no ground-truth mesh and is a separate licensed upstream input",
            "No image or output here is itself print-qualified"
        ],
        "fixtures":entries
    }
    raw=(json.dumps(manifest,indent=2,sort_keys=True,ensure_ascii=False)+"\n").encode()
    write_locked(OUTPUT/"manifest.json",raw)
    print("G3_FIXTURES_BUILT "+json.dumps({
        "count":len(entries),"originalProcedural":8,"upstreamLicensed":1,
        "manifestSha256":sha(raw),"gpuUsed":False,
        "categoryCount":len({x['category'] for x in entries})
    }))


if __name__=="__main__":
    try:main()
    except Exception as e:
        print("G3_FIXTURES_FAILED "+type(e).__name__+": "+str(e),file=sys.stderr)
        sys.exit(1)
