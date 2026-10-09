# LOCAL3D Internal API v1 (G1)

Server binding: 127.0.0.1:4177, loopback only. JSON API; paths and MIME must match allowlists. API is not a printer service.

## Providers

GET /v1/providers lists identity, version, inputTypes, outputTypes, hardwareNeeds, licenseLane, simulation and canStart/canCancel. Only fixture-demo is startable. Other adapters are registry candidates without execution.

Adapter design for future G2: start(input) -> job ID; status(job ID); cancel(job ID); result(job ID). No provider may receive arbitrary URL from client. License/hardware checks before provider activation. deterministicSeed optional where engine supports it.

## Jobs

POST /v1/jobs
Request fields:
- providerId: fixture-demo
- mode: image or text
- prompt: optional on image, min 3 chars on text, max 1200
- image for image mode: {filename, mime, base64}; max 8 MiB, PNG/JPEG/WebP, signature checked
Response: 201 plus Job Manifest with simulation=true.

GET /v1/jobs (last 50 ordered newest first)
GET /v1/jobs/:uuid
POST /v1/jobs/:uuid/cancel
GET /v1/jobs/:uuid/assets/:artifactId

Only these artifact IDs can exist:
- source-image (original verified upload)
- preview-glb (model/gltf-binary DEMO fixture)
- qa-report (application/json DRAFT report)

Jobs have id, providerId, mode, prompt, simulation, seed, status, stage, progress, createdAt, updatedAt, completedAt, source, assets and error. Each asset has ID, kind, MIME, byte count, SHA256 and label. Never return filesystem paths or model API tokens.

Statuses: queued -> running -> completed; can branch to cancelled, failed, interrupted. Every restart records unfinished jobs as interrupted rather than fabricating success. Progress stages explicitly say DEMO; percentages are simulated and NOT engine telemetry.

## Responses and safety

Typical error: {error:{code,message}}. Distinct codes include BAD_JSON, BAD_IMAGE, PROMPT_REQUIRED, PROVIDER_UNAVAILABLE, ALREADY_FINISHED, HOST_DENIED, ORIGIN_DENIED, NOT_FOUND, INVALID_JOB_ID and CAPACITY. Unknown paths return 404. Remote URL/webhook/remotePath/command inputs are rejected. Filename is display-only and never used as a server filesystem path.

GET /v1/health: readiness, localOnly, inference=false, G1_DEMO, job count.

## Extension rules

A future engine adapter is isolated from the core scheduler. It must include license record, reproducible environment, hardware budget, cancellation/timeout, evidence-grade provenance and benchmark fixtures. STL/3MF export must remain draft until independent geometry qualification; never send files directly to printers.
