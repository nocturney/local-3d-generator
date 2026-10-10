"""LOCAL3D G3.19 — independent second exact triangle contact oracle.

Independent from G3.13 polygon clipping and G3.17 section code:
* noncoplanar plane-plane line contacts from direct edge-plane signed
  interpolation, using a different edge formulation and interval proof;
* coplanar triangle overlap from EXACT point-in-triangle and ALL NINE
  finite segment/segment intersections, not polygon clipping.
The convex planar intersection point set distinguishes no contact,
one point, a positive-length collinear segment, or positive 2D area.

All operations are rational on already-decoded IEEE754 vertex coords.
The module provides exact standalone paired-triangle math, NOT itself
any broadphase/global mesh/physical print approval.
"""
from __future__ import annotations

from fractions import Fraction
import numpy as np

from geometry_qa import QAError

MAX_COORD=1e9

def _sub(a,b):
    return tuple(a[k]-b[k] for k in range(len(a)))

def _cross3(a,b):
    return (a[1]*b[2]-a[2]*b[1],
            a[2]*b[0]-a[0]*b[2],
            a[0]*b[1]-a[1]*b[0])

def _dot(a,b):
    return sum(u*v for u,v in zip(a,b))

def _cross2(a,b):
    return a[0]*b[1]-a[1]*b[0]

def _det2(a,b,c):
    return _cross2(_sub(b,a),_sub(c,a))

def _triangle(tri):
    values=np.asarray(tri)
    if (values.shape!=(3,3) or
            not (np.issubdtype(values.dtype,np.number) and
                 not np.issubdtype(values.dtype,np.bool_))):
        raise QAError("G3.19 expected three 3D numeric triangle vertices")
    f=np.asarray(values,dtype=np.float64)
    if not np.isfinite(f).all() or np.max(np.abs(f))>MAX_COORD:
        raise QAError("G3.19 refused nonfinite/oversized coordinates")
    result=tuple(tuple(Fraction.from_float(float(x)) for x in row)
                 for row in f)
    if _cross3(_sub(result[1],result[0]),
               _sub(result[2],result[0]))==(0,0,0):
        raise QAError("G3.19 refused exact zero-area triangle")
    return result


def _point_on_segment(p,a,b):
    return _det2(a,b,p)==0 and all(
        min(a[k],b[k])<=p[k]<=max(a[k],b[k]) for k in range(2))


def _point_in_triangle(p,tri):
    determinant=_det2(*tri)
    if determinant==0:
        raise QAError("G3.19 degenerate coplanar projection")
    signs=tuple(_det2(tri[k],tri[(k+1)%3],p)
                for k in range(3))
    return all(s>=0 for s in signs) if determinant>0 else all(s<=0 for s in signs)


def _seg_crossing_points(a,b,c,d):
    """All finite crossing point(s) of two exact 2D CLOSED segments."""
    r=_sub(b,a)
    s=_sub(d,c)
    ca=_sub(c,a)
    denominator=_cross2(r,s)
    if denominator:
        t=_cross2(ca,s)/denominator
        u=_cross2(ca,r)/denominator
        if 0<=t<=1 and 0<=u<=1:
            return {(a[0]+t*r[0],a[1]+t*r[1])}
        return set()
    if _cross2(ca,r)!=0:
        return set()
    points=set()
    for p in (a,b):
        if _point_on_segment(p,c,d):
            points.add(p)
    for p in (c,d):
        if _point_on_segment(p,a,b):
            points.add(p)
    return points


def _coplanar_oracle(a,b,na):
    drop=max(range(3),key=lambda k:abs(na[k]))
    keep=[k for k in range(3) if k!=drop]
    p=tuple(tuple(x[k] for k in keep) for x in a)
    q=tuple(tuple(x[k] for k in keep) for x in b)
    points=set()
    for x in p:
        if _point_in_triangle(x,q):
            points.add(x)
    for x in q:
        if _point_in_triangle(x,p):
            points.add(x)
    for k in range(3):
        for j in range(3):
            points.update(_seg_crossing_points(
                p[k],p[(k+1)%3],q[j],q[(j+1)%3]))
    if not points:
        return "EXACT_DISJOINT"
    if len(points)==1:
        return "EXACT_SINGLE_POINT_BOUNDARY_CONTACT"
    ordered=list(points)
    first,second=ordered[:2]
    if any(_det2(first,second,z)!=0 for z in ordered[2:]):
        return "EXACT_COPLANAR_POSITIVE_AREA_OVERLAP"
    return "EXACT_COPLANAR_POSITIVE_LENGTH_BOUNDARY_SEGMENT"


def _plane_cut_endpoints(tri,plane_first,normal):
    """Exact segment of one triangle in a transverse plane.

    Based on closed edge-plane intersections (endpoint-inclusive), not
    G3.17's point-set formula or G3.13's polygon clipping.
    """
    signed=tuple(_dot(normal,_sub(p,plane_first)) for p in tri)
    cut=[]
    for i in range(3):
        j=(i+1)%3
        x,y=tri[i],tri[j]
        sx,sy=signed[i],signed[j]
        if sx==0:
            cut.append(x)
        if sx*sy<0:
            t=sx/(sx-sy)
            cut.append(tuple(x[k]+t*(y[k]-x[k])
                             for k in range(3)))
    cut=list(set(cut))
    if len(cut)>2:
        raise QAError("G3.19 impossible >2 noncoplanar cut points")
    return cut


def _noncoplanar_oracle(a,b,na,nb,line):
    cut_a=_plane_cut_endpoints(a,b[0],nb)
    cut_b=_plane_cut_endpoints(b,a[0],na)
    if not cut_a or not cut_b:
        return "EXACT_DISJOINT"
    along_a=[_dot(line,p) for p in cut_a]
    along_b=[_dot(line,p) for p in cut_b]
    low=max(min(along_a),min(along_b))
    high=min(max(along_a),max(along_b))
    if low>high:
        return "EXACT_DISJOINT"
    if low==high:
        return "EXACT_SINGLE_POINT_BOUNDARY_CONTACT"
    return "EXACT_NONCOPLANAR_POSITIVE_LENGTH_LINE_INTERSECTION"


def classify_pair_independent(first,second):
    a,b=_triangle(first),_triangle(second)
    na=_cross3(_sub(a[1],a[0]),_sub(a[2],a[0]))
    nb=_cross3(_sub(b[1],b[0]),_sub(b[2],b[0]))
    intersection_line=_cross3(na,nb)
    if intersection_line!=(0,0,0):
        return _noncoplanar_oracle(a,b,na,nb,intersection_line)
    if _dot(na,_sub(b[0],a[0]))!=0:
        return "EXACT_DISJOINT"
    return _coplanar_oracle(a,b,na)
