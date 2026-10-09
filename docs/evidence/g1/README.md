# G1 independent browser acceptance evidence - 2026-10-09

## Windows / Chris

Environment: Windows 10.0.26300, Node 24.19, Chrome 154.0.8037.98. Original G1 clean room and local fixture only. Source commit 96f85c17b4e2c2099273bf2689e1d34397f68f71, browser QA screenshot before G2 preflight additions unchanged.

- 12/12 Node unit/API/preflight tests PASS; 7/7 browser phases PASS with Playwright-core.
- report.json is the unaltered Windows browser report from the earlier PASS run.
- 01-empty-desktop.png, 02-completed-desktop.png, 04-image-job.png, 05-mobile.png are locally captured demo-only screenshots. No customer images.
- A subsequent Windows full npm run test:all on 2026-10-09 reproduced 12/12 Node and 7/7 browser PASS.

## macOS / MacMiniOffice.local

Environment: Darwin arm64, Node 24.21, Microsoft Edge 154.0.4258.53, 16GiB unified memory. Project files for source commit 96f85c1 were copied from authorized GitHub file refs to isolated /tmp/local3d-qa-20261009, dependencies installed with npm ci --ignore-scripts. No existing Office P0 worktrees modified.

- 12/12 Node unit/API/preflight tests PASS.
- Mac Chrome headless crashed inside browser path services (1001), before app load; this is not a proven app failure.
- Browser QA configured locally to launch installed Edge instead; 7/7 phases PASS, 0 JS/CSP errors, 0 external URL requests.
- macos-report.json is the original successful Mac browser QA report copied into this repository.
- Mac local screenshots were visually inspected from the temporary QA directory but not duplicated into the GitHub repo; filenames are listed in the report. The committed test runner now chooses Edge on Mac.
- This is a G1 app/browser qualification, NOT a real AI model GPU or macOS hardware qualification.

## Interpretation

Real GLB preview, mouse orbit, reset, image upload, text/demo jobs, cancellation, history, source access, DRAFT QA, mobile overflow, and local/no-external-network all exercised. QA fixture geometry is deterministic and wholly unrelated to the uploaded image/prompt. PrintQualified always false. No printer, Fabrication Router, Office registries, paid cloud or external inference accessed.
