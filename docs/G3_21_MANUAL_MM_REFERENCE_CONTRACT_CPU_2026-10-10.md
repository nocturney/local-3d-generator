# LOCAL3D G3.21 — fail-closed manual physical-reference evidence contract (CPU only)

Date: 2026-10-10 | Release: v0.2.21-g3-manual-mm-reference-gate-cpu

## The problem and what this actually implements

G3.20 established that none of four SHA-pinned historical real/procedural GLBs has any independently verified dimensional correspondence to a real-world millimeter. In particular, Trimesh exporter claims in GLB metadata such as units="meters" are NOT calibration. G3.21 defines a strictly validated **PENDING REVIEW** source-to-physical-reference contract for a possible future operator measurement. It DOES NOT fabricate or obtain a real measurement, does not automatically approve any supplied physical length, and intentionally NEVER emits a numeric millimetersPerGLBUnit conversion factor or print authorization.

New CPU-only module: engines/quality/manual_scale_reference_contract.py

The model's trusted previously verified SHA-256 must be provided by the calling source review, not chosen by untrusted GLB metadata. If no independent operator measurement has been submitted, the answer is ALWAYS:
- status BLOCKED_MISSING_EXTERNAL_REFERENCE
- sourceVerifiedUnits UNKNOWN_UNCALIBRATED
- millimetersPerGLBUnit null
- physicalDimensionMm null
- physicalMinimumWallThicknessMm null
- scaleApprovedForAnyPipeline false
- printQualified false; approvedForPrinter false; fabricationAction NONE

This status is the EXPECTED correct state for the four existing prior models.

## Submission schema (STRUCTURAL readiness, never approval)

A future local operator may provide a JSON document (up to 16,384 bytes) with the exact following fields; extraneous fields, direct scale factors, approval booleans, operator emails and arbitrary metadata are refused:

    {
      "schema": "local3d.g3.21.unverified-operator-reference-submission.v1",
      "modelSha256": "<64 lowercase SHA256 hex of the pinned GLB>",
      "reference": {
        "measurementType": "PHYSICAL_CALIPER_READOUT",
        "measuredLengthMm": 25.0,
        "measurementDate": "2026-10-10",
        "measurementEvidenceSha256": "<64 lowercase SHA256 hex>",
        "operatorRecordSha256": "<64 lowercase SHA256 hex>",
        "landmarkVertexIndexA": 0,
        "landmarkVertexIndexB": 1
      }
    }

The example above is syntactic and HYPOTHETICAL, NOT a real user measurement and never included as real evidence. The JSON identifies claimed physical measurement type (calipers or ruler), a positive mm readout, date, two SHA-looking record handles and two original vertex index landmarks in already decoded trusted mesh coordinates. The parser validates field types, bounds, negative/out-of-range/duplicate indices, nonzero separation and finite coordinates. A spoofed signed-looking hash does not establish identity, file authenticity, camera calibration or actual physical landmark correspondence.

Without trusted decoded mesh vertices supplied, a syntactically valid sidecar yields PENDING_TRUSTED_MESH_MAPPING_REVIEW. With finite mesh vertices and internally consistent distinct indices, it yields PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW. There is intentionally NO path to an APPROVED status: model-scale calculation, physical wall-thickness values or printer release are impossible from this contract alone. Separate human verification of genuine physical evidence, measured object/source provenance, landmark correspondence, exact coordinate transforms and approval authority is required before a future separate stage could perform physical calibration.

Any forged approvedForPrinter=true or mmPerGLBUnit=... key is REJECTED rather than honored.

## SHA-linked four-source public proof without opening private models

New scripts/g3-21-calibration-contract-proof.py reads ONLY previously published sanitized G3.20 public JSON from docs/evidence/g3. It validates:
- Expected G3.20 public proof schema, four model SHA strings, rights ancestry, unknown millimeter scale, null physically measured wall thickness and printQualified false.
- For each historical SHA registered there, uses the fail-closed missing-submission decision. Does not read historic G2 job directory, original image files, raw GLB bytes or operator personal data.
- Includes SHA-256 of the source G3.20 JSON **bytes** in the G3.21 report to detect changes in the public source proof.
- Writes one immutable public aggregate (no names, images, job UUIDs, vertex coordinates or operator data), and supports a fully READ-ONLY re-evaluation without flags. G3.20's separate one-time four-source SHA validation stands as historical proof; no attempt to bypass the previously blocked G3.20 private read-only replay is involved.

Public [G3.21 four SHA models missing independent physical reference](evidence/g3/orb-01-g321-physical-calibration-missing.json).

All 4 historical source models remain BLOCKED_MISSING_EXTERNAL_REFERENCE, because NO new operator reference or external physical measurement was provided. This release has zero operator physical submissions, zero mm factors and zero model/printer actions.

## Reproducing the tests and proof

New Python adversarial tests cover absent source evidence, structurally plausible but unverified caliper records, malicious APPROVED or mmPerUnit fields, mismatched model SHA, arbitrary personal text in JSON, nonphysical single-image estimates, zero/negative/NaN/huge lengths, spoofed evidence/identity hashes, invalid/future dates, coincident/duplicate/out-of-range vertex landmarks, bool/nonfinite geometry, JSON size/symlink rejection, tampered previous unit proof, and immutable report refusal. New Node tests bind all four model SHAs and the previous proof SHA256, enforce BLOCKED statuses, no user PII, no physical dimensions and no print authority.

From authorized Chris LOCAL3D Windows checkout (CPU only):

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g321_manual_reference_contract.py
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-21-calibration-contract-proof.py

Initial immutable public report creation is explicitly manual:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-21-calibration-contract-proof.py --write-public

Subsequent no-flag run is read-only and refuses any source JSON SHA drift. The proof concerns public G3.20 evidence only, not private model re-execution.

## What remains before true physical units or printing

Physical calibration cannot be guaranteed by a JSON record, a numeric dimension, self-declared meter/millimeter metadata, a hash-looking string, or a person's typed "approved" field. Future steps require actual independent measured real-world dimensional evidence and provenance, reliable matching model landmarks, controlled transform chain, reviewer identity and authorization, and separate fit/strength/print engineering tests. Even a verified mm conversion alone cannot establish local wall thickness or physical print suitability.

GitHub Issue #3 geometry/manufacturing and Issue #4 pinned Python OSV advisories, OS-level parsing sandbox and network egress remain OPEN. Model inference coverage still 2/9 historical AI outputs, seven require new distinct explicit GPU approvals. G1 on 4177 and external service 4178 are untouched; G2 inference remains manual and off. No GPU, new model, cloud, printer/Fabrication Router, Windows security or Office changes. Every GLB remains DRAFT, printQualified=false, approvedForPrinter=false, fabricationAction=NONE.

Next G3.22 suggestion: read-only CPU triage of pinned Python dependency advisories and actual code-path reachability for Issue #4, without upgrading libraries or modifying OS security; alternatively the real-world dimension contract can advance only after an actual independently measured physical reference and explicit approval are available.
