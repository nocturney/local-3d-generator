"""G3.26: safe in-memory format probe for synthetic 64x64 images only.

Never accepts an external filename, customer media, arbitrary bytes or model/GPU input.
Tests Pillow encoder/decoder expectations, NOT OS isolation or vulnerability safety.
"""
from __future__ import annotations
from io import BytesIO
import hashlib
from PIL import Image, UnidentifiedImageError
import PIL

EXPECTED = (
    ("PNG", "image/png", bytes.fromhex("89504e470d0a1a0a")),
    ("JPEG", "image/jpeg", bytes.fromhex("ffd8ff")),
    ("WEBP", "image/webp", b"RIFF"),
)

def safe_fixture_bytes(fmt: str) -> bytes:
    if fmt not in {v[0] for v in EXPECTED}:
        raise ValueError("G3.26 only three trusted generated formats")
    rgb = Image.new("RGB", (64, 64), (43, 98, 157))
    buffer = BytesIO()
    rgb.save(buffer, format=fmt)
    raw = buffer.getvalue()
    if not 30 <= len(raw) <= 512_000:
        raise RuntimeError("G3.26 synthetic fixture encoding size out of bounds")
    return raw

def sniff_short_header(raw: bytes):
    """Reproduce short Node header categories for DIAGNOSTIC comparison only.

    Real API behavior must be verified separately in Node HTTP integration tests.
    """
    if raw.startswith(EXPECTED[0][2]): return "image/png"
    if raw.startswith(EXPECTED[1][2]): return "image/jpeg"
    if len(raw) >= 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        return "image/webp"
    return None

def pillow_decode(raw: bytes) -> tuple[str, tuple[int,int]]:
    with Image.open(BytesIO(raw)) as source:
        kind = source.format
        source.load()
        return kind, source.size

def unsafe_to_decode_prefix_only(raw: bytes) -> bool:
    """A harmless incomplete prefix used solely to show header != valid image."""
    try:
        pillow_decode(raw)
    except (UnidentifiedImageError, OSError, ValueError):
        return False
    return True

def build_safe_probe() -> dict:
    if PIL.__version__ != "10.1.0":
        raise RuntimeError("G3.26 frozen historical Pillow version changed")
    cases = []
    for fmt,mime,_signature in EXPECTED:
        raw = safe_fixture_bytes(fmt)
        observed, dimensions = pillow_decode(raw)
        header = sniff_short_header(raw)
        if observed != fmt or dimensions != (64,64) or header != mime:
            raise RuntimeError("G3.26 generated format/Pillow/short signature disagreement")
        # Header-only truncation is intentionally NOT a valid fully decoded image.
        fragment = raw[:11] if fmt=="WEBP" else raw[:8] if fmt=="PNG" else raw[:3]
        if sniff_short_header(fragment) != (None if fmt=="WEBP" else mime):
            raise RuntimeError("G3.26 short-header behavior unexpectedly changed")
        if unsafe_to_decode_prefix_only(fragment):
            raise RuntimeError("G3.26 incomplete header unexpectedly decoded as a full image")
        cases.append({
            "format":fmt,
            "declaredMime":mime,
            "syntheticPixelDimensions":[64,64],
            "sourceBytesSha256":hashlib.sha256(raw).hexdigest(),
            "sourceByteCount":len(raw),
            "observedPillowFormat":observed,
            "shortHeaderClassification":header,
            "incompletePrefixFullyPillowDecodable":False,
            "dangerousParserPayloadUsed":False
        })
    return {
        "schema":"local3d.g3.26.harmless-inmemory-images.v1",
        "pillowVersion":PIL.__version__,
        "synthetic64PixelSourcesOnly":True,
        "sourceImageFormatCount":len(cases),
        "allThreeImageFormatsSupportedForHarmlessFixtures":True,
        "results":cases,
        "headerFilteringGuaranteesFullDecodeSafety":False,
        "nativeLibraryExploitabilityAssessed":False,
        "customerMediaProcessed":False,
        "modelExecutions":0,
        "gpuInferenceRuns":0,
        "printQualified":False,
        "approvedForPrinter":False,
        "fabricationAction":"NONE"
    }
