# Operations — LOCAL3D G1/G2 on Windows, G1 on macOS

## G3.32 — read-only, canonical Windows Sandbox configuration validation

    node scripts/g3-32-assemble-canonical-wsb-proof.mjs
    node --test tests/g332-canonical-wsb-xml.test.js
    .\scripts\g3-32-verify-wsb-xml-readonly.ps1

The new candidate docs/security/g332-canonical-networkless-nohost-share.wsb matches Microsoft's sample casing for VGpu. Windows .NET XmlReader tests well-formedness/tree only; DO NOT launch the .wsb or infer guest networking/host data isolation from a parser pass. The original G3.29 WSB profile remains unchanged and both variants' runtime acceptance is still untested. No host folders or guest commands. G3.31 launcher discovery from remote Session 0 remains no client visible, not definitive about interactive users. [G3.32 details](G3_32_CANONICAL_WSB_XML_CPU_2026-10-11.md), [immutable proof](evidence/g3/g3-32-canonical-wsb-xml-static-review.json).

## G3.31 — safe Windows Sandbox CLI and app availability check

    node scripts/g3-31-assemble-launch-route-evidence.mjs
    node --test tests/g331-sandbox-launch-route.test.js

The proof replay uses a frozen sanitized record from a successful direct read-only Remote Desktop Commander Session 0 command. Separately, scripts/g3-31-readonly-launcher-inventory.mjs offers fresh, bounded read-only CIM/AppX/Get-Command detection, but nested PowerShell under the current remote service sometimes times out; a fresh probe MUST NOT be claimed from replay alone. Windows Sandbox optional feature is Enabled but neither legacy exe nor the new `wsb` command or app registration was observed **in this service context**. No VM launch or interactive-user app state qualified. Do not auto-install, toggle Windows features, restart, change firewall or run Windows Sandbox default networking settings. [Audit](G3_31_WINDOWS_SANDBOX_CLIENT_DISCOVERY_CPU_2026-10-11.md), [immutable snapshot](evidence/g3/g3-31-windows-sandbox-launch-discovery-only.json).

## G3.30 — trusted-only host CPU data-envelope simulation

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-30-build-trusted-canonical-fixtures.py
    node scripts/g3-30-assemble-exchange-proof.mjs
    node --test tests/g330-synthetic-guest-exchange.test.js tests/g330-protocol-proof.test.js
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g330_trusted_exchange.py

This touches only three pinned public original synthetic generated buffers and emits deterministic CPU-only canonical RGB PNG TEST fixture bytes under tests/fixtures/g330-trusted-canonical-output.json. The source SHA-locked Node exchange contract is **NOT part of G1/G2 live API** and refuses all customer/untrusted inputs or claims of OS guest execution. G3.29 sandbox candidate XML still has no ingress or return channel. Existing 4177 listener not restarted; 4178 Office untouched; G2 manual 4179 off. Future real Sandbox VM testing requires explicit approval/verified launcher; never treat host-only output receipt as signed evidence. [G3.30 methods](G3_30_TRUSTED_SYNTHETIC_EXCHANGE_CPU_2026-10-10.md), [public proof](evidence/g3/g3-30-trusted-only-offline-exchange-not-sandbox.json).

## G3.29 — read-only Windows Sandbox capability audit and static profile review

    node scripts/g3-29-host-readonly-probe.mjs
    node scripts/g3-29-assemble-sandbox-readiness.mjs
    node --test tests/g329-windows-sandbox-readiness.test.js

Host capability probe queries CIM, optional-feature STATE, and command discovery only. An Enabled feature is not proof that the Sandbox app can launch or that a guest egress/file/clipboard boundary is enforced. Exact candidate docs/security/g329-candidate-networkless-nohost-share.wsb DISABLES networking, vGPU and host shares; DO NOT double-click/launch it automatically. No actual Sandbox VM was launched in G3.29. The frozen one-time public readiness snapshot is replayed without fresh host probing; use the separate read-only probe to observe live state. Production G2 native worker is still unconfined, Issue #4 OPEN, no new untrusted media permission. [Full G3.29 assessment](G3_29_WINDOWS_SANDBOX_READINESS_CPU_2026-10-10.md) and [immutable evidence](evidence/g3/g3-29-windows-sandbox-readiness-not-attestation.json).

## G3.28 — integrated structural image admission, historic evidence preserved

    node scripts/g3-28-assemble-integration-proof.mjs
    node --test tests/g328-api-image-preflight.test.js tests/g328-integration-proof.test.js
    node scripts/g3-25-assemble-pillow-format-review.mjs
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-26-safe-image-boundary-proof.py
    node scripts/g3-27-assemble-structure-proof.mjs

G3.28 tests call createApp in NEW ephemeral loopback instances; 3 synthetically complete files are accepted and incomplete ones rejected 422 before any job or manual-G2 MOCK adapter. Old public G3.25/26/27 JSON files MUST NEVER be edited. Updated read-only replay helpers reconstruct exact Windows CRLF server source from fixed Git ancestor with SHA check; keep that commit reachable in offline git history. Current server/index.js is DIFFERENT from the historical SHA and invokes the bounded container validator. 4177 currently running the old code has not been restarted; a future coordinated restart and post-restart tests are separate from this milestone. Do not touch 4178/Office, activate G2 inference or OS firewall/egress. [Full details](G3_28_INTEGRATED_IMAGE_ADMISSION_CPU_2026-10-10.md), [immutable new proof](evidence/g3/g3-28-integrated-structural-image-admission.json).

## G3.27 — detached bounded structural image preflight contract

    node scripts/g3-27-assemble-structure-proof.mjs
    node --test tests/g327-image-structure-contract.test.js tests/g327-structure-proof.test.js

The preflight is a pure zero-dependency **standalone** component in server/image-structure-preflight.js. NO production import or G2 native parsing is added yet; it rejects malformed/incomplete synthetic image containers under CPU/size bounds but is not proof of safe Pillow decoder execution. Existing earlier G3.25/26 proof files remain unchanged; G3.27 immutable proof links source SHA and original frozen synthetic image bytes. Integrate only as a separately QA-verified later milestone with historical source-proof preservation. [Contract and limitations](G3_27_BOUNDED_IMAGE_STRUCTURE_PREFLIGHT_CPU_2026-10-10.md), [immutable proof](evidence/g3/g3-27-image-structure-preflight-contract.json).

## G3.26 — safe in-memory Pillow images + actual G1 fixture HTTP signature gate

On Chris ONLY, using existing frozen Python venv, CPU with no model load:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-26-safe-image-boundary-proof.py
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g326_safe_image_boundary.py
    node --test tests/g326-harmless-format-api.test.js

The proof regenerates 3 tiny original in-memory images, checks full Pillow decode and immutable source SHA lineage to prior G3.25, current Node/Python entrypoints and own source; no-flags verifies the previously created sanitized public JSON byte-for-byte, --write-public for initial creation ONLY. Separate Node tests start a temporary G1 fixture-only loopback app, submit harmless INCOMPLETE signature-only bytes, and check accepted 201 versus bad MIME 422, NEVER G2 provider/GPU. Source [method](G3_26_SAFE_IMAGE_SIGNATURE_BOUNDARY_CPU_2026-10-10.md) and [proof](evidence/g3/g3-26-harmless-image-boundary.json). Security and print gates remain OPEN.

## G3.25: offline Pillow codec/format-specific upstream-condition review

Read-only CPU replay, no model/native image decoding:

    node scripts/g3-25-assemble-pillow-format-review.mjs
    node --test tests/g325-pillow-format-triage.test.js

Uses only G3.23/G3.24 existing public reports and the current tracked server/index.js + engines/triposr/worker.py. Recomputes SHA256 source ancestry and verifies immutable 16-group/32-record source-boundary review, or fails closed on changed security code or version/fix records. The historical first public proof was created with --write-public only once; do not regenerate an altered report silently. No new images, native codec exploitation, internet, package install, CUDA inference, Office, OS configuration or printer. [Method](G3_25_PILLOW_FORMAT_API_TRIAGE_CPU_2026-10-10.md), [public proof](evidence/g3/g3-25-pillow-format-review.json). Security Issue #4 and production geometry #3 still OPEN; no change to G2 pinned venv.

## G3.24: immutable public security REVIEW queue — no new OSV/network/GPU/install

Builds source-SHA-stable manual review ordering from prior G3.22 static app-path evidence and full G3.23 public 104-entry/64-alias-group metadata. These are workflow queues, NOT vulnerability severities or fixed package acceptance: Pillow direct byte decoder groups reviewed first (16), pinned Transformers DINO ViT loader groups (29), Torch checkpoint/native tensor runtime groups (19). Three representative official GHSA severity/patch-version examples only; all individual codepath reachability remains UNKNOWN.

CPU-only deterministic offline replay and tests:

    node scripts/g3-24-assemble-security-review-queue.mjs
    node --test tests/g324-security-review-queue.test.js

First immutable sanitized proof created with --write-public, subsequent no-flag replay refuses byte SHA changes. [Method](G3_24_STATIC_SECURITY_REVIEW_PRIORITY_QUEUE_2026-10-10.md), [public QA proof](evidence/g3/g3-24-security-review-queue.json). A future isolated dependency shadow needs separate authorization; current G2 venv/Pillow 10.1.0/Transformers 4.35.0/Torch CUDA 2.5.1 pins unchanged. No automated GPU, Office, cloud, printer or OS security changes. Issue #4 and #3 OPEN.

## G3.23: full public OSV ID/alias census — explicit public query, offline replay

G3.23 performed a one-time HTTPS POST to public OSV.dev for ONLY preverified public package/version pairs Pillow 10.1.0, transformers 4.35.0, torch 2.5.1. Saved strict sanitized public ID/alias/fixed-range metadata under gitignored runtime/qa/g3/osv-full-g323; no client/model media or secrets sent. G3.5 historical old 104 matches had only 36 actual IDs saved; current full response has 104 IDs and all old 36 appear. Strict alias-linking groups 104 returned records into 64 groups (NOT confirmed distinct flaws). No remediation/fix or actual exploitability claim.

The explicit network fetch utility scripts/g3-23-fetch-public-osv-full.mjs REFUSES overwriting its saved source; it is NOT part of npm tests or server startup. The assembler can replay fully OFFLINE, SHA verifying both G3.22 and G3.5 proof ancestry, with no private G2 jobs or external requests:

    node scripts/g3-23-assemble-osv-full.mjs

The one-time initial public report creation used --write-public; subsequent no-flag replay refuses any drift. [Method](G3_23_FULL_PUBLIC_OSV_IDS_ALIAS_CENSUS_2026-10-10.md) and [full ID/alias SHA proof](evidence/g3/g3-23-full-public-osv-id-census.json). Security #4 remains OPEN, live dependencies unchanged, NO OS isolation, GPU, model inference, printer or 4178 changes.

## G3.22: offline Python advisory static reachability — read-only ONLY

No Python install, model loading or live OSV query. G3.22 parses existing historical G3.5 OSV JSON, verifies original pinned 34-dependency freeze hash and local importlib.metadata exact 34 installed versions, pinned upstream clean Git checkout and G3.6 Pillow 12.3 shadow evidence SHA. Reviews 63 first-party Python + 2 upstream relevant pinned files using AST. 104 previous OSV version matches are NOT 104 established vulnerabilities; only 36 actual IDs retained and 68 remain unsampled/UNKNOWN. Pillow directly decodes image bytes; Transformers/Torch have pinned source/model calls but no transitive absence proof. Worker SHA/weights_only/offline app guards are code checks, not OS sandbox guarantees. Package pins unmodified.

CPU-only adversarial tests and previously generated public immutable read-only replay:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g322_static_security.py
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-22-security-static-proof.py

First public SHA aggregate created with --write-public; subsequent no-flag replay fails closed if source/installed snapshot changes. [G3.22 full method](G3_22_PYTHON_ADVISORY_STATIC_REACHABILITY_CPU_2026-10-10.md); [immutable sanitized proof](evidence/g3/g3-22-pinned-python-static-triage.json). No production Pillow upgrade or OS isolation; security Issue #4 and print/geometry Issue #3 OPEN. No Office, GPU, printer or unrelated 4178 changes.

## G3.21: future manual physical measurement schema — verification REQUIRED, zero auto-calibration

Use engines/quality/manual_scale_reference_contract.py only for CPU strict syntactic check of a FUTURE operator-submitted independent physical reference. Evidence requires previous SHA-pinned model, claimed caliper/ruler measurement in mm with date/evidence SHA/operator record SHA and TWO valid original indexed mesh landmarks. A typed record does NOT establish a real physical measurement, source landmark correspondence, identity or printer authorization. Missing reference remains BLOCKED_MISSING_EXTERNAL_REFERENCE; a structurally plausible record remains PENDING_INDEPENDENT_HUMAN_CALIBRATION_REVIEW. Never emit millimetersPerGLBUnit or any absolute mm wall-thickness from this contract. Unrecognized metadata, misleading Trimesh exporter units and forged flags are refused.

Local CPU-only tests and READ-ONLY proof from previous PUBLIC G3.20 SHA JSON (NO private historic G2 job access):

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g321_manual_reference_contract.py
    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-21-calibration-contract-proof.py

Initial one-time immutable public proof created with --write-public; no-flag replay verified without private source reads or GPU inference. [G3.21 policy](G3_21_MANUAL_MM_REFERENCE_CONTRACT_CPU_2026-10-10.md), [four-source blocked evidence](evidence/g3/orb-01-g321-physical-calibration-missing.json). Do not treat proof SHA as independent physical measurement. No printer, OS security, Office, 4178 or model actions.

## G3.20: do NOT trust exporter units; sampled GLB-unit normal-ray chord diagnostics only

Source worker engine and pinned G2 real assets contain no independently measured subject dimension. Trimesh-generated glTF extras.units="meters" found in previously licensed G3.7 winding derivative and chair does NOT establish actual meters, mm calibration or print sizing; physicalMillimeterScale remains UNKNOWN_UNCALIBRATED, mmPerGLBUnit null. The new CPU-only engines/quality/unit_scale_and_chord_screen.py samples up to 128 deterministic face barycenters on POSITIVE signed-volume closed manifolds and reports inward normal ray first-hit chords plus triangulation edge lengths IN GLB COORDINATE UNITS ONLY. A sphere full-solid chord demonstrates these are NOT wall thickness. Original previously generated TripoSR orb has NONPOSITIVE signed volume and inward ray probing is DISABLED instead of silently treating wrong normals as safe. No source mutation or physical calibration.

Run adversarial CPU tests:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g320_unit_chord_screen.py

Replay all FOUR prior licensed immutable source reports READ-ONLY, private locally stored historic original job UUID only:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-20-unit-chord-replay.py --job-id <PREVIOUS_PRIVATE_COMPLETED_G2_ORB_JOB_UUID>

First immutable local reports/sanitized public proof constructed once with --prepare-private --write-public for existing licensed original and derivative GLBs. Subsequent verification OMIT flags and refuse changed bytes. Private job IDs and original source image/model data remain outside Git. [Method](G3_20_UNIT_PROVENANCE_AND_CHORD_CPU_2026-10-10.md) · [public SHA evidence](evidence/g3/orb-01-g320-unit-chord-cpu.json). No new GPU inference, cloud, model installation, printer/Fabrication Router, OS policy, Office or unrelated 4178 changes.

## G3.19: independent second exact triangle contact oracle differential (CPU only)

New engines/quality/independent_triangle_oracle.py computes exact binary-Fraction triangle-pair contact with mathematically independent noncoplanar plane-edge interpolation and coplanar all-nine segment/segment tests (not G3.13 polygon clip). scripts/g3-19-second-oracle-replay.py rechecks every G3.17 KDTree zero-index AABB candidate with BOTH exact engines, requiring same label on every pair; previous licensed real orb 43,107, copy 43,107, original GT 216 and chair 28,593 all agree. For indexed neighbors only deterministic first 256 shared-full-edge and first 256 single-vertex-only pairs per model are spot-checked by the second oracle; do not claim full independently doubled adjacency clearance.

Python randomized and adversarial CPU controls:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g319_independent_oracle.py

Prior completed private G2 real job SHA locked source, four-model READ-ONLY immutable replay:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-19-second-oracle-replay.py --job-id <EXISTING_PREVIOUS_PRIVATE_REAL_ORB_JOB_UUID>

The one-time private and sanitized public proof construction used --prepare-private --write-public for previously SHA-approved historical sources only; subsequent replay WITHOUT those flags refuses altered evidence. Never include source private job UUID, source image binary or sampled face-pair IDs in Git. [Method/limitations](G3_19_SECOND_EXACT_TRIANGLE_ORACLE_CPU_2026-10-10.md), [sanitized SHA proof](evidence/g3/orb-01-g319-second-exact-oracle-proof.json). Still DRAFT, printQualified=false, no CPU result authorizes printer, new GPU job, Office, cloud, Windows security or unrelated 4178 changes.

## G3.18: independent exact AABB axis sweep crosschecks full numeric KDTree candidate selection (CPU)

The bounded CPU module engines/quality/exact_aabb_sweep_audit.py sorts face AABBs by their decoded IEEE754 minimum X coordinate, conservatively prefilters Y/Z with outward IEEE754 rounding, then performs all 6 interval comparisons using Fraction exact rationals, both strict and under the declared 1e-9 diagonal-relative GLB-unit margin. No cKDTree is used by the independent pass. Compare full 0/1/2 shared-index candidate counts to G3.14 and complete no-index pair SET membership against G3.17 KDTree. Any missed exact no-index candidate is INDETERMINATE. Four previous licensed SHA/asset sources had zero missed candidates. This proves candidate-coverage only for finite decoded coordinates within bounded resource limits, NOT physical mm/print clearance.

Local CPU adversarial tests:

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g318_exact_aabb_sweep.py

Four previous licensed sources, operator-only PRIVATE preexisting completed orb job UUID; read-only SHA replay:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-18-exact-aabb-replay.py --job-id <PREVIOUSLY_COMPLETED_PRIVATE_ORB_JOB_UUID>

Initial SHA-locked per-model and sanitized public immutable proof already prepared. Subsequent reads use no --prepare-private/--write-public flags; private pair IDs are never published. [Method](G3_18_EXACT_AABB_SWEEP_AUDIT_CPU_2026-10-10.md), [G3.18 aggregated public report](evidence/g3/orb-01-g318-exact-axis-sweep-proof.json). Do not use GPU, inference, cloud, printers, Office or unrelated service 4178.

## G3.17: all NUMERICAL AABB selected NO-index pairs, EXACT rational contact narrowphase (CPU only)

The bounded G3.17 CPU module engines/quality/exact_nonindexed_contact.py independently reproduces the G3.14 numerical AABB candidate census and splits 0/1/2 original indexed vertex overlap classes. For 0-index candidates only, exact Fraction geometry classifies true decoded IEEE-754 triangle-plane intersection: disjoint, point-only, positive-length noncoplanar/coplanar boundary line, positive-area coplanar overlap. Previous real 01-orb-alpha TripoSR 43,107 noindex candidates, unchanged winding 43,107, original GT 216 and licensed MIT chair 28,593 all exactly DISJOINT within numerically selected AABB candidates. AABB selection remains numerical and not a universal formally exact all-triangle broadphase, and real physical millimeter/wall/print suitability remains unknown.

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g317_exact_nonindexed_contact.py

SHA-locked four previous licensed sources, local READ-ONLY replay, operator-only previously completed genuine G2 job private UUID (never include in Git or assistant report):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-17-noindex-replay.py --job-id <PREVIOUS_PRIVATE_REAL_SOURCE_JOB_UUID>

The one-time immutable local private reports and sanitized public SHA aggregate proof were already prepared. On subsequent replays OMIT --prepare-private and --write-public. [G3.17 method](G3_17_EXACT_NOINDEX_AABB_CONTACT_CPU_2026-10-10.md), [sanitized counts](evidence/g3/orb-01-g317-exact-noindex-aabb-pairs.json). No new GPU permission, cloud/model run, printer action, Office or service 4178 modifications.

## G3.16: all exact indexed shared-single-vertex face contacts (CPU only)

The independent CPU module engines/quality/exact_indexed_vertex_contact.py reads only already-existing SHA-pinned indexed GLB geometry. It enumerates all unordered face pairs sharing exactly ONE original indexed vertex, independent of the G3.14 box broadphase, and EXACTLY classifies positive-length noncoplanar/coplanar intersections beyond that point. Four previous licensed GLBs rechecked: orb 190,860 pairs, identical G3.7 copy 190,860, GT 5,730, chair 92,629; zero positive extra intersections within this indexed one-vertex-only class. Exact arithmetic applies ONLY to decoded binary-float coordinates, not CAD source dimensions or physical-print qualification.

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g316_exact_indexed_vertex_contact.py

Read-only SHA-verified replay of the PREVIOUSLY completed private genuine local G2 orb job (do NOT store its private job ID in Git or client logs):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-16-vertex-replay.py --job-id <PREVIOUS_REAL_PRIVATE_JOB_UUID>

The first immutable per-model local report and sanitized public aggregate SHA proof were already created; on future verification invoke WITHOUT --prepare-private/--write-public. All model/photo/raw pair example evidence remains in ignored runtime. [Method](G3_16_EXACT_INDEXED_VERTEX_CONTACT_CPU_2026-10-10.md), [public SHA counts](evidence/g3/orb-01-g316-exact-indexed-vertex-only.json). This is not full exact nonindexed collision checking; no user-untrusted GLB, cloud, GPU inference or printer access is approved. Office and unrelated service 4178 remain untouched.

## G3.15: exact binary-float contact of every indexed shared-edge face-pair (no GPU)

The standalone CPU module engines/quality/exact_indexed_edge_contact.py evaluates all 60,528 previously generated REAL TripoSR orb indexed shared-edge adjacency pairs, exactly distinguishing noncoplanar expected edge-only geometry, coplanar opposite-side expected edge-only geometry and coplanar same-side positive area overlap in already decoded GLB floating coordinates. No candidate same-side coplanar area overlap on this prior orb/copy/GT/chair. This is not a full self-intersection-free or physical/mm wall thickness/printing test.

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g315_exact_indexed_edge_contact.py

Read-only four previously existing source SHA replay; the previously completed actual private job UUID must remain solely a local argument, never in the repository:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-15-edge-replay.py --job-id <EXISTING_PREVIOUS_REAL_JOB_UUID>

Private gitignored reports and sanitized public aggregate source-SHA data were already created; historical --prepare-private --write-public is a one-time immutable operation only. [Method](G3_15_EXACT_INDEXED_EDGE_CONTACT_CPU_2026-10-10.md), [proof](evidence/g3/orb-01-g315-exact-indexed-edge.json). No GPU inference permission has been given; 4178, Office, model weights and printers unchanged.

## G3.14: all conservative NUMERICAL AABB-overlapping face-pair census (CPU only)

New engines/quality/aabb_pair_census.py enumerates all numerical AABB-overlap candidate face pairs with an independent bounding-BOX-sphere cKDTree; the source G3.8 uses a different, triangle-centroid-sphere prefilter. G3.14 includes indexed shared-edge/one-vertex adjacency in its pair COUNT, but only performs numerical SAT on no-index pairs, escalating any SAT-positive to bounded exact G3.13 pair predicates. It is NOT a global exact mesh intersection test, mm-size measurement or printer clearance.

The previously existing SHA-pinned real orb's 294,495 conservative AABB candidate pairs partition into 60,528 edge + 190,860 vertex-only + 43,107 no-index, numerical no-index SAT positive=0. The increase of 82 conservative AABB candidates vs earlier G3.8 is NOT 82 actual collisions. No model was rerun.

CPU-only controls (using the already pinned interpreter):

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g314_aabb_census.py

Four-model read-only SHA-locked replay from a previous, completed local G2 job ID (NEVER include the UUID in Git/console screenshots):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-14-aabb-replay.py --job-id <PREVIOUSLY_COMPLETED_PRIVATE_JOB_UUID>

Private ignored per-model reports and sanitized public evidence were already created once; do not reuse --prepare-private --write-public unless genuinely rebuilding immutable evidence under reviewed source hashes. See [complete caveats](G3_14_AABB_FULL_PAIR_CENSUS_CPU_2026-10-10.md) and [public counts](evidence/g3/orb-01-g314-full-aabb-census.json). No permission granted to print, launch CUDA, run other models, change Office or call cloud.

## G3.13: exact rational PAIR predicate — very limited, no global scan

The new offline Python `engines/quality/exact_triangle_predicates.py` classifies ONLY explicitly supplied triangles or bounded chosen pair lists. It does not scan a whole mesh, infer CAD millimeters, weld vertices or certify manufacturability. The exact Fraction arithmetic applies to ALREADY decoded IEEE-754 model coordinates; ambiguous indexed boundary contacts stay unresolved, as they should.

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_g313_exact_predicates.py

Source-locked *read-only* 24-pairs-per-existing-model verification (prior private real completed job ID, NEVER paste it into commits or public docs):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-13-selected-pair-replay.py --job-id <PREVIOUS_COMPLETED_PRIVATE_JOB_UUID>

Public sanitized SHA report: [selected exact pair data](evidence/g3/orb-01-g313-selected-exact-pair-predicate.json). It excludes private job/face IDs; all 24 selected indexed shared-edge pairs per GLB return expected boundary-contact UNRESOLVED. They are NOT 24 actual collision defects nor a sample of all pairs. Avoid treating as a replacement for G3.8 broadphase or any safety gate. See [full method](G3_13_EXACT_SELECTED_TRIANGLE_PREDICATES_CPU_2026-10-10.md). No GPU/Office/printer interaction.

## G3.12: different-index spatial vertex proximity (existing-model CPU only)

All four pre-existing SHA-verified GLBs were already scanned with a bounded cKDTree census, comparing exact/near XYZ for different vertex IDs. A distance <=1e-7 × arbitrary-unit bounding diagonal is a *numerical screen*, NOT a mm tolerance. The real orb's 20,178 vertices and its G3.7 copy produced zero candidate pairs at this threshold; even zero cannot certify face-interior intersections or print readiness. Closed touching-shell positive controls and resource-cap fail-closed tests passed. No GPU inference, printer, data upload or Office code change.

From Chris project root, read-only replay of existing four private immutable reports, with only the earlier genuinely completed real job identifier (never add that ID to a Git report):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-12-verify-spatial-replay.py --job-id <PREVIOUS_COMPLETED_PRIVATE_JOB_UUID>

Historical immutable private report initialization (ALREADY DONE for these SHAs) uses an explicit --prepare-private option; it refuses changed prior reports. Only rerun if a reviewed new local evidence source requires it. To verify public sanitized evidence:

    npm run proof:g3:orb:spatial -- --job-id <PREVIOUS_COMPLETED_PRIVATE_JOB_UUID>

See [full scope](G3_12_SPATIAL_INDEX_PROXIMITY_CPU_2026-10-10.md) and [SHA report](evidence/g3/orb-01-g312-spatial-index-proximity.json). G1 and the explicit-consent G2 ports/services remain unchanged. No model execution or physical manufacturing certification.

## G3.11: CPU-only indexed shared-edge potential coplanar overlap (no new model)

The existing completed `01-orb-alpha` actual TripoSR job's original output and its G3.7 copy-only orientation derivative now also have a conservative shared-edge coplanar same-side overlap screen. On real orb + derivative, each screened 60,528 indexed face-pairs sharing a full edge; 0 candidate coplanar overlap/near-antiparallel/high-backturn findings. This does NOT establish full self-intersection absence, physical scale, wall thickness or permission to print.

Operator-only read-only replay using the **already completed** private real orb job UUID:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-11-verify-edge-replay.py --job-id <EXISTING_COMPLETED_ORB_JOB_UUID>

It validates original, correction, project-original known 3D reference and historic real chair model SHAs and recomputes all four CPU edge screens without modifying files or using GPU. Public sanitized immutable evidence:

    npm run proof:g3:orb:edge-backfold -- --job-id <EXISTING_COMPLETED_ORB_JOB_UUID>

See docs/G3_11_EDGE_BACKFOLD_CPU_2026-10-10.md and docs/evidence/g3/orb-01-g311-edge-coplanar-screen.json. The UUID and GLB binaries remain gitignored locally; there is no new model authorization or printer command.

## G3.10: shared-one-vertex ray screen / complete read-only replay (no GPU)

The existing one-time-approved real orb output and its G3.7 winding-only copy were additionally screened for **190,860 unique vertex-only face pairs per model**, looking for extra nonzero rays of geometric intersection beyond the legitimately shared indexed vertex. Zero numerical common-ray candidates were found. **This is not proof of global intersection-free geometry or print readiness.** Near-coplanar cases and limited CPU budgets never silently pass.

Operator-side read-only reproduction (replace the placeholder with the UUID of the **already completed** real local TripoSR orb job, never queue a new inference):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-10-verify-cpu-replay.py --job-id <EXISTING_COMPLETED_ORB_JOB_UUID>

The script verifies SHA-locked original, orientation-derivative, project-original GT and historical chair GLBs; recalculates all four CPU-only pair screens in memory and compares deterministic report fields. To assemble/verify the strictly sanitized, immutable Git evidence:

    npm run proof:g3:orb:vertex -- --job-id <EXISTING_COMPLETED_ORB_JOB_UUID>

Evidence: docs/evidence/g3/orb-01-g310-shared-vertex-ray-screen.json. No job UUID, private GLB, image, model checkpoint, prompt or customer record is uploaded. Nothing in these diagnostic commands invokes CUDA, neural inference, cloud, Office or printing; no prior authorization may be re-used.

## G3.9: CPU-only adjacent-face angle risk verification (no model execution)

Existing real G3 orb model, prior exact-orientation copy and project-original GT were scanned for all indexed edge-adjacent face normal angles. The operator can reproduce **read-only** using the previous completed local orb job UUID:

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-9-verify-cpu-replay.py --job-id <EXISTING_COMPLETED_REAL_JOB_UUID>

This rechecks source and model hashes and deterministically computes 60,528 real mesh edge-pair angles and GT statistics, without output writes, inference, CUDA, cloud or printer. To assemble/verify the fixed SHA sanitized report:

    npm run proof:g3:orb:edge -- --job-id <EXISTING_COMPLETED_REAL_JOB_UUID>

Result in docs/evidence/g3/orb-01-g39-adjacent-angles.json, method docs/G3_9_ADJACENT_FACES_CPU_2026-10-10.md. **No print clearance**: even an absence of normal differences above 90° does not test vertex-only adjacency foldover, intersection, wall thickness or material/physical suitability. No new per-image GPU permission has been granted; still 2/9 private model outputs.

## G3.8: reproducible CPU-only model surface risk screen (no CUDA)

New reusable commands act only on **already generated licensed GLBs**, with explicit source SHA checks, no model inference, cloud fallback, live service or printer involvement. The original real model/derivative GT filenames remain local under gitignored runtime and G3 benchmarks.

Operator read-only reproduction on Chris (replace UUID with the full **previously completed** G3 `01-orb-alpha` job UUID, never a new/queued job):

    runtime\engines\triposr\venv\Scripts\python.exe scripts\g3-8-verify-cpu-replay.py --job-id <EXISTING_LOCAL_REAL_JOB_UUID>

This re-runs in memory: 3 conservative triangle screens (original inferred model, separate positive-winding derivative and synthetic original GT) and 4096-sample normalized sphere-fit residual. It compares deterministic fields with private stored records, ignores wall-clock runtime variation, refuses changed source/model SHA and does NO output file writes.

To verify/create the unchanged sanitized SHA-linked *public* evidence from those private results:

    npm run proof:g3:orb:risk -- --job-id <EXISTING_LOCAL_REAL_JOB_UUID>

Evidence lives at docs/evidence/g3/orb-01-g38-cpu-risk-screen.json. It does not expose UUIDs, output GLBs, prompts or private paths. The original and corrected 40,352-face meshes each had 43,025 eligible SAT pairs tested and 0 possible nonadjacent contacts; **251,388 vertex-adjacent AABB candidate pairs are not tested for overlaps**. This is not a full self-intersection test, millimeter wall/strength check or print certification. The sphere residual comparison 0.0625% GT vs 4.974% AI is an uncalibrated roundness-only research observation. See docs/G3_8_ORB_CPU_RISK_2026-10-10.md. Every future real GPU image still needs fresh explicit permission.

## G3.7: CPU-only exact winding derivative of an existing real orb model

A single genuinely approved local TripoSR inference already completed on 01-orb-alpha. Its source output remains under the original G2 manual job's private runtime folder; the separate CPU-only orientation derivative lives at:

    runtime/qa/g3/orb-01-positive-winding/orb-positive-winding.glb

Independent CPU verification requires exactly unchanged vertex coordinates, unchanged vertex RGBA, exactly reversed face indices, opposite face normals and same one-component watertight bounds/absolute signed volume. The original GLB SHA is f37a812bc4414ddee34bcb19d2e7535f25d219a3731c14f2dcc89c2c7ba030e2; the separate DRAFT derivative SHA is ab2e5aeb55598624209eeca3e700abef93a69a52886c63ecad6a840e62d8d68f.

The public model binaries are NOT uploaded to GitHub; output is local and ignored. Re-create a sanitized read-only proof from an **already completed and hash-verified** local job (pass the full UUID operator-side only):

    node scripts/g3-7-assemble-orb-evidence.mjs --job-id <existing-G3-orb-job-UUID>

The command is CPU/Node-only and does NOT launch TripoSR, GPU, slicers or printers. Evidence and screenshot under docs/evidence/g3 include no job IDs, client names or private source files. The local report now counts 2/9 observed outputs including the historic chair, while the immutable checked-in public G3 baseline stays 1/9. No one has standing approval to infer the seven remaining images without a fresh per-image request.

**Never treat volume-positive, closed-topology or visually similar geometry as print-ready.** Physical mm units, minimum wall thickness, intersections, supports, material strength and printer suitability remain untested. See docs/G3_7_ORB_WINDING_CPU_2026-10-10.md.

## Hardware and environment (checked 2026-10-09–10)

Windows Chris: NVIDIA GeForce RTX 4080 SUPER 16GB, Intel i9-14900K, Node 24.19, Python 3.11.9, Torch 2.5.1+cu121 **inside isolated G2 venv only**. nvidia-smi observed Office/GUI GPU use; production resource reservations are not guaranteed.

MacMiniOffice.local: arm64, 16 GiB unified memory, Node 24.21. G1 Node API and Edge browser tests previously passed. Real G2 CUDA inference is NOT qualified on macOS and deliberately remains disabled even if L3D_ENABLE_TRIPOSR is set there.

## Start G1 — default, no AI/GPU

From Chris, Windows PowerShell:
    Set-Location 'D:\Velvet\Projects\local-3d-generator'
    npm ci --ignore-scripts --no-audit --no-fund
    npm test
    npm start

Open http://127.0.0.1:4177 on Chris. Stop with Ctrl+C. Default G1 data is runtime/data/jobs + runtime/data/audit/events.jsonl; every completion is DEMO. G1 does not need installed model weights.

## Start G2 manually — Windows Chris ONLY

Prerequisite: separate runtime/engines/triposr/src, /venv, /weights installed and SHA-verified, and an operator intentionally decides to enable local manual image-to-3D. It is not an automated or persistent background service.

From project root:
    powershell -NoProfile -File scripts/start-g2-manual.ps1

This launches **http://127.0.0.1:4179**, stores jobs under **runtime/data-g2-manual** and temporarily sets L3D_ENABLE_TRIPOSR=1 for this local process. It will never occupy the default G1 port/data directory. It refuses to kill a process on a busy port. In browser, choose TripoSR Local, upload image, check the one-job GPU approval and press Create Real Model. A text prompt is an annotation only. No job begins without POST confirmGpu=true, and no GPU queue can remain unattended.

Close the terminal with Ctrl+C to stop; automatic restart and OS boot start are NOT configured. The model worker uses an isolated Python process; if the worker is cancelled the UI displays "נעצרת" until its process tree exits. No cloud inference/print output.

## Local model files

- Source: runtime/engines/triposr/src — pinned detached, clean MIT upstream checkout.
- Model/config: runtime/engines/triposr/weights — SHA-verified 1.68GB model.ckpt, config.yaml and DINO tokenizer config.
- Runtime: runtime/engines/triposr/venv/Scripts/python.exe, Torch 2.5.1+cu121, dependency freeze in engines/triposr/requirements-resolved-win-py311.txt.
- App engine worker: engines/triposr/worker.py; manual per-run GPU guard: server/triposr-adapter.js; G1 fixture is independent.
- Model stage/source/GLB evidence: runtime/data-g2-manual/jobs/<UUID>/... + local audit log (private; do NOT publish customer photos). GPU smoke evidence lives in runtime/qa, with a sanitized MIT sample in docs/evidence/g2-app.
- Original isolated standalone pilot remains at runtime/pilots and runtime/pilot-logs; do not overwrite it.
- Source and weights never committed. Do not copy proprietary images, downloaded model checkpoint or executable venv into GitHub.

## Windows Chris: scoped Git source-owner CPU preflight (before any further GPU request)

The October 10 one-time G3 `01-orb-alpha` attempt passed GPU and Office gates but failed at **`verify_sources`**, before model loading. Its original Windows-PowerShell diagnostic showed Git exit 128: TripoSR checkout owned by **NT AUTHORITY/SYSTEM**, operator **CHRIS/Chris**. This is not a missing checkpoint; Git refused metadata access because of the checkout ownership. Historical G3.4 job failure and spent approval latch are retained privately.

Worker fix: for exactly two fixed metadata commands (`rev-parse HEAD` and `status --porcelain`), `worker.py` sets a command-scoped `-c safe.directory=<resolved exact TripoSR checkout>`, with `core.fsmonitor=false`. The pinned upstream commit, clean-source test and checkpoint/config SHA are still required. **Do not** run `git config --global --add safe.directory`, set `safe.directory=*`, disable ownership checks globally, re-own the SYSTEM source folder or alter Office. This is a deliberately scoped trust decision for the already-pinned source checkout, not a general security workaround.

From the CHRIS interactive PowerShell session run this **CPU-only** test using the NEW project worker (not the immutable failed v0.2.4 snapshot):

    & 'D:\Velvet\Projects\local-3d-generator\runtime\engines\triposr\venv\Scripts\python.exe' 'D:\Velvet\Projects\local-3d-generator\scripts\g3-verify-triposr-source-owner-cpu.py'

Expected: `G3_CPU_ONLY_SOURCE_OWNER_FIX_PASS`, `SOURCE_CLEAN True`, `WEIGHTS_SHA_CHECK PASS`, `NO_CUDA_OR_AI_INFERENCE True`. If Git still fails, **stop** and report output; do not change global trust settings or consume another GPU approval.

**Not authorized:** re-running the archived `runtime/qa/approved-01-orb-alpha-g34-20261010/release-v024/scripts/g3-approved-orb-once.mjs`. Its one-time approval was consumed and original code snapshot is preserved unchanged. New real inference, even on the same image, requires a *new explicit per-image authorization*, live Office/GPU no-conflict gates, and a fresh single-run script. No unattended GPU queue or print release.

## G3.4 one-click CPU scoring on a completed G3 fixture (NO AI inference)

After an explicitly consented TripoSR G2 job with a licensed G3 source image completes, open that job's details and click **"השוואת G3 (CPU)"**. The bounded offline Python worker verifies hashes/provenance, computes a diagnostic normalized 3D surface distance only when *source original 3D* exists, and attaches **"דוח השוואת G3"** in the existing local job. A second click is idempotent, no new neural inference/Cloud/API calls. DEMO, unlicensed, running, failed or changed files fail closed.

The **"סריקת רשת (CPU)"** tool is independent and still useful: a good geometric similarity score cannot certify correct normals, positive volume, wall thickness or physical print readiness.

For a previous-real-GLB CPU-only proof (no CUDA/GPU), run from project root:

    node scripts/g3-4-actual-cpu-review-proof.mjs

This uses a temporary reconstructed job from the previously generated G2 chair GLB, invokes the ACTUAL isolated Python scorer over localhost, verifies NO_GROUND_TRUTH_3D / NOT PRINT QUALIFIED, records a sanitized proof in docs/evidence/g3 and removes the temporary job. This is **not** a new model prediction or an authorization to run a real GPU job.

Future successful actual G2 inference QA includes optional hostGpuTelemetry (shared-host NVIDIA-SMI snapshots) in addition to peakCudaReservedMiB (PyTorch worker). Samples every 1500ms approximate the shared GPU state and may miss short peaks. Both are diagnostic only; neither certifies that Office or other GPU applications are unaffected, and all current no-conflict checks remain.

See docs/G3_4_CPU_REVIEW_TELEMETRY_2026-10-10.md. **No new GPU runs or printer actions are part of the G3.4 milestone.**

## G3.3 one-image manual quality workflow (no unattended AI)

1. In the explicitly launched G2 Windows localhost UI (port 4179), choose any G3 source image from the selector under **תמונת מקור**; click **טען תמונה לטופס בלבד**. This loads the licensed PNG but does not start any job. The chosen image gets a fresh blank GPU-consent checkbox.
2. If you intentionally want a real TripoSR run, choose the TripoSR Local provider, tick the per-image consent and press **צור מודל אמיתי (GPU)**. Office idle and NVIDIA GPU guards and shared LOCAL3D lease all remain in force. There is NO unattended batch.
3. After completion, copy the full UUID via **העתק Manifest**. From project root, evaluate the existing output ONLY in CPU:

       npm run score:g3 -- --job-id <full-job-uuid>

   Source/weights/job/model SHA must match the pinned G3 licensed input. The result is private under runtime/qa/g3/manual-scores. Ninth upstream chair has NO source 3D and cannot be ranked with an invented 3D ground truth.
4. Optionally consolidate without uploading private records:

       node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs

   This produces an append-only SHA-fingerprinted private benchmark snapshot and includes only validated local scores; it does not alter the public 1/9 reviewed coverage.

Regression controls without ANY model inference:

       runtime\engines\triposr\venv\Scripts\python.exe engines\quality\shape_metrics.py --positive-controls --output docs\evidence\g3\shape-positive-controls.json
       runtime\engines\triposr\venv\Scripts\python.exe engines\quality\shape_metrics.py --negative-controls --output docs\evidence\g3\shape-negative-controls.json
       runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_*.py

The shape metrics are finite-sample, scale-normalized and pose-selected after the fact, not proof of physical dimensions, complete shape reconstruction or printer compatibility. No automatic repair/printing.

## G3.2 read-only management and cross-process GPU lease

- npm run audit:g3:gpu-lock — read-only shared lease diagnostic. If locked, investigate existing LOCAL3D/Python workers and Office/NVIDIA GPU usage. **No automated lock deletion or stale lock reclamation**.
- npm run benchmark:g3 — SHA-checks licensed nine-input catalog and previous G2 real chair provenance. Public coverage snapshot stays 1 prior observed real sample / 8 unrun; refuses silent overwrite of different evidence.
- node scripts/g3-collect-benchmark.mjs --jobs-dir runtime/data-g2-manual/jobs — optional PRIVATE matching of local complete job records; writes an append-only fingerprinted private snapshot under gitignored runtime/qa/g3; does not expose client names/prompts/IDs. Local SHA-provenance is not independent proof of GPU execution.
- npm run audit:g3:storage — read-only metadata storage summary (job counts, sizes, status/age); sanitized report under gitignored runtime/qa/g3. Never deletes source images, trims history or enforces a quota.
- G1 normal launch unaffected; all G2 manual servers use the SAME project-wide GPU lock regardless of port/data folder. Concurrent G2 manual requests return 409 instead of queuing. The lock is not a replacement for live Office/GPU no-conflict checks.

More: docs/G3_2_SAFETY_BENCHMARK_2026-10-10.md.

## G3 optional CPU mesh review — NO GPU activity

On a **completed** manual TripoSR job in http://127.0.0.1:4179, press "סריקת רשת (CPU)". This runs the fixed offline Python Trimesh scanner on the existing output.glb and adds a geometry-qa.json report to the job manifest. "סריקת רשת הושלמה" means the scan completed, **not** that the model is safe to print. No G1 demo job can request this action.

For standalone reproducibility using the *already generated* licensed G2 chair model:

    runtime\engines\triposr\venv\Scripts\python.exe engines\quality\geometry_qa.py --model docs\evidence\g2-app\real-app-output.glb --out docs\evidence\g3\chair-geometry.json

    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\quality -p test_quality.py -v

The G3 nine-source-image catalog is generated by scripts/g3_make_fixtures.py using CPU-only Trimesh/Pillow and refuses to change locked fixture bytes. Its 8 synthetic reference pairs have known source geometry; do not claim they are AI outputs. An existing *real* chair model has negative signed volume. Optional CPU-only corrective derivative is documented in docs/G3_PROGRESS_2026-10-10.md and never modifies the original GLB. Do not run a new AI benchmark batch unless a fresh manual per-job GPU approval and Office no-conflict gate are satisfied.

## Tests — no AI model execution

    npm test
    npm run qa:browser
    npm run qa:browser-g2-mock
    npm run test:all

On Chris v0.2.4 G3.4 preview: **53/53 Node tests**, 8 G1 Chrome phases, 8 mock G2/G3 Chrome phases, 18 G3 CPU-only Python tests plus 5 prior G2 offline Python tests. Separately, the historical G2 chair was re-audited with the actual pinned Python CPU scorer (no GPU). The isolated Python interpreter can run the G2 tests with:
    runtime\engines\triposr\venv\Scripts\python.exe -m unittest discover -s engines\triposr -p test_offline.py -v

Python tests validate weights hash/input/CPU marching cubes and do not allocate GPU. Tests using mock real-provider injection are marked TEST_MOCK; they must never be presented as a fresh AI result.

Real one-time G2 smoke exists as scripts/g2-one-time-app-smoke.mjs and is **not** included in npm test/test:all. It requires an explicit process-only manual authorization environment variable and an Office idle/GPU capacity check. Do NOT schedule or automatically replay it.

## Data, backup and rollback

Stop servers first, then copy runtime/data and runtime/data-g2-manual to an access-controlled dated backup. Store Git source SHA, package-lock SHA256, model/checkpoint SHA and job manifests separately. Verify backup integrity before attempting restoration. Preserve original job directories (source images may be confidential).

Rollback code: stop servers, preserve both G1/G2 data and runtime/engines, checkout last tested Git commit, npm ci for that lockfile, npm test and verify localhost health. Never overwrite/delete weights or job records automatically. Future JSON schema migrations must be separately reviewed. A G2 interrupted job is not resumed automatically after restart.

## Troubleshooting

- Port 4177/4179 busy: stop only your own known LOCAL3D instance or choose an explicitly supported free port; do not kill unknown processes.
- G2 engine disabled: normal on default G1. Start intentional manual script; do not set persistent system-wide env flags.
- G2_NOT_INSTALLED: confirm isolated Python, model source and pinned weights, verify hashes; do not silently download remote model.
- G2_OFFICE_BUSY / G2_OFFICE_UNVERIFIED / G2_GPU_BUSY: a guard is blocking a collision; do not bypass for speed.
- G2_IMAGE_ONLY / BAD_IMAGE: TripoSR needs image input, 64x64 to 16MP, PNG/JPEG/WebP within 8MiB. Transparent background is automatically composited on gray, not removed with rembg.
- Browser WebGL missing: verify local Three.js and graphics support, inspect console; GLB downloads remain available.
- G2 cancelled/failed: only manifests with fully verified GLB and DRAFT report expose output links. Do not infer printability from a watertight flag.
- HTTP 403: localhost Host/Origin guard; no LAN exposure. Do not disable security to resolve access problems.

Never modify Office 2.0 / VelvetOS core / Fabrication Router, UAC/firewall/system CUDA or printer services as part of LOCAL3D operation.

## G3.5 CPU resource and public advisory audit (NO GPU)

All commands below are run manually in LOCAL3D's repository; they never start the TripoSR neural worker or a printer.

    npm run audit:g3:storage
    npm run audit:g3:admission
    npm run test:all

The admission proof checks real existing G2 manual job storage at the worst allowed 8MiB input size, without deleting or modifying any existing job. It retains a private sanitized runtime/qa/g3/g3-5-storage-admission.json audit snapshot. New manually consented G2 jobs are now rejected on storage cap (507 G3_STORAGE_QUOTA), low free volume (507 G3_LOW_DISK_SPACE) or unsafe/unverified storage state (503 G3_STORAGE_UNVERIFIED), **before model/GPU access**. The numbers are protective development thresholds, not actual reserved disk blocks.

For optional public security-advisory research ONLY, with explicit outbound Internet contact to OSV.dev (transfers only public PyPI package names/versions; no client images, source code, paths or secrets):

    npm run audit:g3:python-osv

This contacts the public OSV.dev service, saves timestamped matches to gitignored runtime/qa/g3/g3-5-python-osv-screen.json and never installs or changes Python. The separate optional scripts/g3-5-npm-audit-evidence.mjs can summarize previously captured raw npm audit responses with current package-lock SHA; it makes no network calls itself. A version-level advisory match is NOT confirmed code-path exploitability. npm audit of production/development Node dependencies can be run separately in read-only mode. Current Python advisory findings require a scoped, reviewed compatibility/upgrade plan before calling this product secure for untrusted media.

To avoid CPU contention, only one G3 CPU topology or shape review may run in one LOCAL3D Node process at a time. Others receive 409 G3_CPU_BUSY. There is no unattended CPU review queue. No automatic deletion or retention enforcement has been introduced.

Detailed controls: docs/G3_5_RESOURCE_SECURITY_2026-10-10.md.

## G3.6 reproducible Pillow shadow evaluation — not a runtime upgrade

The original Windows TripoSR venv is still pinned to Pillow 10.1.0. A separate, ignored location under runtime/qa/g3/pillow-shadow holds a Pillow 12.3.0 CPython3.11 amd64 wheel (PyPI SHA256 8e95e1385e4998ae9694eeaa4730ba5457ff61185b3a55e2e7bea0880aef452a) and a target overlay. Do NOT set system-wide PYTHONPATH or mutate the currently working model venv.

To investigate the candidate in a **new** isolated experiment folder, download the exact public wheel with pip --no-deps --only-binary, verify the official SHA256, then pip install --no-index --no-deps --target into the separate local overlay. The included scripts describe the pinned experiment. For an already staged overlay, the CPU-only verifier and importer can be launched in process-local CUDA_VISIBLE_DEVICES=-1 / PYTHONPATH mode. scripts/g3-6-shadow-python-regression.ps1 executes 5 G2 plus 18 G3 Python unit tests with temporary environment restoration and refuses to overwrite a previous proof.

scripts/g3-6-pillow-candidate-screen.mjs explicitly queries only public PyPI/OSV package metadata (Internet required, never normal runtime). scripts/g3-6-assemble-shadow-proof.mjs checks existing ignored report hashes and produces a sanitized release proof offline. The version/code evidence is in docs/G3_6_PILLOW_SHADOW_2026-10-10.md.

Do NOT activate this shadow in G2 startup, do not replace frozen requirements/model packages, and do not run additional GPU compatibility tests without new scoped permission plus current Office/VRAM checks. No automatic inference or printing is part of this workflow.
