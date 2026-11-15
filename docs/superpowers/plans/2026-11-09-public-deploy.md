# Public Deploy (PC-as-VPS + Cloudflare Tunnel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the v2 stack (web + backend + AI + Postgres) from this PC at `https://travelai.minhthuan.dev` through one Caddy reverse proxy and a Cloudflare Tunnel, with the hardening the spec requires.

**Architecture:** One compose project: v2 services on an internal network, Caddy as the only ingress, `cloudflared` dialing out to Cloudflare. Web uses relative URLs so the domain can change without rebuilding it. Secrets live only in gitignored `.env` and `secrets/`.

**Tech Stack:** Docker Compose, Caddy 2, cloudflared, Spring Boot (Java 25), FastAPI, Expo web export, Postgres 16, bash.

**Spec:** `docs/superpowers/specs/2026-11-09-public-deploy-design.md`

## Status 2026-11-10 (evidence; branch `feat/wbs-1.8.2-v2-integration`, formerly `integration/ngoc-2.0`)

| Task | State | Evidence |
|---|---|---|
| 1 Edge files | done | `3b6aff5`; `scripts/test-edge-config.sh` exit 0 (2026-11-10) |
| 2 Secrets | done | `scripts/gen-secrets.sh` + `scripts/test-gen-secrets.sh` (`3b6aff5`), exit 0 |
| 3 Compose/edge hardening | done | `3b6aff5`, `cbfd622`; public `scripts/smoke-edge.sh` 13/13 PASS; prod containers publish no host port (`docker ps`) |
| 4 Tunnel + reboot | partial | DNS resolves (Cloudflare); public smoke PASS from this PC; RUNBOOK + up/down in `3b6aff5`. Open: phone on mobile data, `systemctl restart docker` test (owner) |
| 5 CORS/WS/message key | done | `018dcd6`; tests `OriginPolicyTest`, `SocketSecurityTest`, `MessageKeyRequiredTest`; public CORS evil-origin check PASS |
| 6 Idempotent seed | done | `393d0e2`, `00e7119`, `2f3cf07` (#44) |
| 7 AI abuse/key rotation | open (owner) | No rate limit in `deploy/Caddyfile`; GCP key rotation + quota pending |
| 8 CI smoke job | done | `8ba197c` (#46); PR #55 CI "Compose stack, seed and smoke" SUCCESS |
| 9 Android APK | open (owner D7) | — |
| 10 Hand-off | open | see `2026-11-10-sequential-completion.md` Task 7 |

## Global Constraints

- Work happens in the worktree `../TravelAI-integration` (branch `feat/wbs-1.8.2-v2-integration`, renamed from `integration/ngoc-2.0` on 2026-11-10); `deploy/Caddyfile`, `docker-compose.edge.yml` and the spec currently sit in the main worktree and move there in Task 1.
- Public origin is `https://travelai.minhthuan.dev` (`PUBLIC_ORIGIN`); never hardcode it outside `.env.example` and docs.
- No secret in git, `build-args`, `EXPO_PUBLIC_*`, logs or chat. `.env`, `secrets/` mode `600`.
- Nothing publishes a host port in the edge setup; Postgres, backend and AI are reachable only through Caddy.
- `ai-service` code is not modified (decision Q4); AI behavior is controlled through env and the edge.
- Do not commit or push unless the user asks; do not touch `main`.
- Do not skip, delete or weaken existing tests (backend 52, app 10, AI 11).
- Commits use Conventional Commits with `(#24)`.

## Review Focus

- A request with `Origin: https://evil.example` to `/api/*` and to the WebSocket handshake must be rejected, not just ignored (Task 5).
- `/actuator/*`, `/swagger*`, `/v3/api-docs*` must return 404 through the tunnel, not just locally (Task 3).
- Upload of an image over 10 MB to `/ai/*` must fail with 413, and a missing/empty `message.key` must stop the backend (Tasks 3, 5).
- Rebooting the PC or restarting Docker must bring the tunnel and stack back by itself, with the same URL (Task 4).
- Running the seed twice must not duplicate data or reset the admin password (Task 6).

---

### Task 1: Move edge files to the v2 worktree and align service names

**Files:**
- Create (move): `../TravelAI-integration/deploy/Caddyfile`, `../TravelAI-integration/docker-compose.edge.yml`
- Modify: `../TravelAI-integration/.env.example` (add `PUBLIC_ORIGIN`, `CLOUDFLARE_TUNNEL_TOKEN`, `HOST_GCP_KEY`, `HOST_MESSAGE_KEY` placeholders)
- Test: `../TravelAI-integration/scripts/test-edge-config.sh`

**Interfaces:**
- Produces: Caddy upstreams `backend-v2:8080` and `ai-v2:8000`; overlay file name `docker-compose.edge.yml`; env names `PUBLIC_ORIGIN`, `CLOUDFLARE_TUNNEL_TOKEN`.

- [x] **Step 1: Write the failing test** `scripts/test-edge-config.sh`: runs `docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml config` with dummy env and asserts (a) exit 0, (b) the rendered output contains services `caddy` and `cloudflared`, (c) `reverse_proxy backend-v2:8080` and `reverse_proxy ai-v2:8000` appear in `deploy/Caddyfile`, (d) there is no `published:` entry for `caddy` or `cloudflared`.
- [x] **Step 2:** Run it. Expected: FAIL (files not in this worktree yet).
- [x] **Step 3:** Copy the three files from the main worktree, change the Caddyfile upstreams to the v2 names, set the overlay `caddy` volume source to `./apps/mobile/dist`, and give `caddy` `depends_on` the v2 services with `condition: service_healthy`.
- [x] **Step 4:** Re-run the test. Expected: PASS.
- [x] **Step 5: Commit** `feat(devops): add Caddy + cloudflared edge overlay for v2 (#24)`.

### Task 2: Secrets generation

**Files:**
- Create: `scripts/gen-secrets.sh`
- Modify: `.gitignore` (ensure `secrets/`, `.env`, `.env.*` except `.env.example`)
- Test: `scripts/test-gen-secrets.sh`

**Interfaces:**
- Produces: `secrets/message.key` (base64 32 bytes, `600`) and `POSTGRES_PASSWORD` appended to `.env` if missing; the script never overwrites an existing value and never prints a secret.

- [x] **Step 1: Write the failing test:** in a temp dir, run `gen-secrets.sh` twice; assert the first run creates `secrets/message.key` (mode `600`, non-empty) and `POSTGRES_PASSWORD` (length >= 32) in `.env`, the second run changes neither, and neither run's stdout contains either value.
- [x] **Step 2:** Run it. Expected: FAIL (script missing).
- [x] **Step 3:** Implement `scripts/gen-secrets.sh` with `#!/usr/bin/env bash`, `set -euo pipefail`, `umask 077`, using `openssl rand -base64 32`.
- [x] **Step 4:** Re-run the test. Expected: PASS. Run `git check-ignore secrets/message.key .env` and expect both listed.
- [x] **Step 5: Commit** `feat(devops): add idempotent secret generator (#24)`.

### Task 3: Production compose hardening and edge behavior

**Files:**
- Modify: `docker-compose.yml` (v2 services: `cap_drop`, `read_only` where it boots, healthchecks for `backend-v2` and `ai-v2`), `deploy/Caddyfile` (rate limits if the module is built in, otherwise documented fallback)
- Create: `docker-compose.prod.yml` (resets `ports` of v2 services to none; keeps `restart: unless-stopped`)
- Test: `scripts/smoke.sh` (extend)

**Interfaces:**
- Consumes: Task 1 overlay.
- Produces: `scripts/smoke.sh <base-url>` exits non-zero on any failed check; checks listed below are its contract.

- [x] **Step 1: Extend `scripts/smoke.sh` first** with checks against `$1`: `GET /` 200; `GET /api/places` 200; `GET /actuator/health` 404; `GET /swagger-ui/index.html` 404; `POST /ai/detect` with an 11 MB file gives 413; response header `X-Content-Type-Options: nosniff`.
- [x] **Step 2:** Bring up the stack locally with the edge overlay minus the tunnel (publish Caddy on `127.0.0.1:8088` through a local override) and run `scripts/smoke.sh http://127.0.0.1:8088`. Expected: FAIL on the not-yet-implemented checks.
- [x] **Step 3:** Implement the compose/Caddy changes until the checks pass. Healthchecks must hit an endpoint that touches the database for the backend (spec H9).
- [x] **Step 4:** Re-run smoke. Expected: all checks PASS; `ss -tlnp` shows no container port bound beyond the local override.
- [x] **Step 5: Commit** `feat(devops): harden v2 compose and edge behavior (#24)`.

### Task 4: Tunnel up, public smoke, survive reboot

**Files:**
- Create: `scripts/up.sh`, `scripts/down.sh`, `docs/deploy/RUNBOOK.md`
- No code under test beyond `scripts/smoke.sh`

**Interfaces:**
- Consumes: `scripts/smoke.sh`, `.env` with `CLOUDFLARE_TUNNEL_TOKEN`.
- Produces: `scripts/up.sh` runs `gen-secrets.sh`, builds the web export, runs `docker compose --profile v2 -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.edge.yml up -d --build --wait`.

- [x] **Step 1:** Confirm DNS first: `travelai.minhthuan.dev` must resolve (the last check at 2026-11-09 still returned no A record; if so, ask the owner to add the published route `caddy:80` in the tunnel).
- [x] **Step 2:** Run `scripts/up.sh`, then `scripts/smoke.sh https://travelai.minhthuan.dev` from this PC and from a phone on mobile data. Expected: PASS on both.
- [ ] **Step 3:** Reboot test: restart the Docker daemon (`sudo systemctl restart docker`), wait, re-run public smoke. Expected: PASS with the same URL. Verify `systemctl is-enabled docker` is `enabled`.
- [x] **Step 4:** Write `docs/deploy/RUNBOOK.md`: start, stop, logs, rotate a secret, restore the DB dump, what to do if the tunnel is down.
- [x] **Step 5: Commit** `docs(devops): add runbook and up/down scripts (#24)`.

### Task 5: Backend hardening H1, H2, H6 (cross-scope)

**Files:**
- Modify: `backend/src/main/java/**/CorsConfig.java`, `backend/src/main/java/**/WebSocketConfig.java`, the message-key loader, `backend/src/main/resources/application.properties` (prod profile)
- Test: new tests beside the existing backend tests

**Interfaces:**
- Consumes: env `CORS_ALLOWED_ORIGINS` (comma list, equals `PUBLIC_ORIGIN` in prod).
- Produces: no wildcard origins; backend refuses to start without a non-empty message key file.

- [x] **Step 1: Write failing tests:** (a) a `MockMvc` preflight to `/api/places` with `Origin: https://evil.example` receives no `Access-Control-Allow-Origin`; with the configured origin it does; (b) a WebSocket handshake from `https://evil.example` is rejected; (c) context startup fails when the key file is missing and when it is empty.
- [x] **Step 2:** Run `scripts/test-backend.sh`. Expected: new tests FAIL for the stated reasons, existing 52 still PASS.
- [x] **Step 3:** Implement: read `CORS_ALLOWED_ORIGINS` in `CorsConfig` and `WebSocketConfig`; fail fast on a missing/empty key; set `spring.jpa.show-sql=false` under the prod profile.
- [x] **Step 4:** Run `scripts/test-backend.sh`. Expected: all PASS (52 + new).
- [x] **Step 5: Commit** `fix(backend): restrict CORS/WS origins and fail fast without message key (#24)` flagged cross-scope in the PR text.

### Task 6: Idempotent seed (H7)

**Files:**
- Create: `scripts/seed.sh` (or a SQL file plus runner), `docs/deploy/SEED.md` only if behavior needs explaining
- Test: `scripts/test-seed.sh`

**Interfaces:**
- Consumes: `ADMIN_PASSWORD` from `.env`; produces an admin user, tour schedules and the simulated bank account.

- [x] **Step 1: Write the failing test:** run the seed twice against a clean test database; assert row counts are equal after both runs and the admin password hash is unchanged by the second run.
- [x] **Step 2:** Run it. Expected: FAIL (seed missing).
- [x] **Step 3:** Implement with `INSERT ... ON CONFLICT DO NOTHING`; the admin password comes only from env.
- [x] **Step 4:** Re-run. Expected: PASS.
- [x] **Step 5: Commit** `feat(devops): add idempotent production seed (#24)`.

### Task 7: AI abuse controls and Vision key rotation (owner-run)

**Files:**
- Modify: `docs/deploy/RUNBOOK.md`

- [ ] **Step 1 (owner):** Create a new GCP service-account key, save it outside git, point `HOST_GCP_KEY` at it, delete the old key in the console.
- [ ] **Step 2 (owner):** In GCP set a low daily Vision quota and a budget alert; screenshot or note the values in the runbook (no key material).
- [ ] **Step 3:** Re-run `scripts/smoke.sh` with 30 rapid `/ai/detect` calls; expected: edge rejects the excess (or document the fallback if the rate-limit module is unavailable).
- [ ] **Step 4: Commit** `docs(devops): record AI quota and key rotation procedure (#24)`.

### Task 8: CI smoke job

**Files:**
- Modify: `.github/workflows/*.yml` (add a job), `scripts/smoke.sh` (already parameterized)

- [x] **Step 1:** Add a job that generates temporary secrets with `openssl rand`, sets `VISION_MOCK_ENABLED=true`, runs compose without the tunnel (local Caddy port), runs `scripts/smoke.sh`, then `down -v`.
- [x] **Step 2:** Push to a throwaway branch only if the owner asks; otherwise verify the job locally with `act`-free steps (run the same commands by hand).
- [x] **Step 3:** Expected: smoke exits 0 with mock AI.
- [x] **Step 4: Commit** `ci(devops): add compose smoke job (#24)`.

### Task 9: Android APK (needs owner decision D7)

- [ ] **Step 1 (owner):** Choose D7 (a) or (b) in spec section 11.
- [ ] **Step 2:** If (a): write a failing app test for the multipart upload of a recognition image, fix `apps/mobile/src/services/recognition.ts` to send `File`/`Blob`, run the app tests (10 + new).
- [ ] **Step 3:** Build the release APK with `EXPO_PUBLIC_API_URL=$PUBLIC_ORIGIN` and `EXPO_PUBLIC_AI_API_URL=$PUBLIC_ORIGIN/ai`, signed with a keystore stored outside git.
- [ ] **Step 4:** Install on a device over mobile data and run login, tour, booking, payment (and recognition if D7 = a).
- [ ] **Step 5: Commit** only source changes, never the keystore.

### Task 10: Merge, reports, hand-off

- [ ] **Step 1:** Run `scripts/governance-check.sh`; confirm no binary documents or secrets are staged.
- [ ] **Step 2:** Tag `v1-vite-core-final` on the current v1 head before any stack switch on `main`.
- [ ] **Step 3:** Prepare the PR `integration/ngoc-2.0` -> `main` for the owner to review; do not merge.
- [ ] **Step 4:** Update reports 04, 05, README and `KE_HOACH.md` to match what actually runs (test counts 52/10/11), and the accountability table with `file:line` evidence.

## Self-Review

- Spec coverage: FR-01..13 and H1..H10 map to Tasks 1, 3, 4, 5, 6; SEC-01..10 to Tasks 2 and 7; CI-01..04 to Task 8; PLT to Task 9; section 9 to Task 10. FR-05 (rate limit) is conditional on the Caddy module and has a documented fallback. FR-14 is optional and not planned.
- Type/name consistency: upstreams `backend-v2:8080` and `ai-v2:8000`, overlay `docker-compose.edge.yml`, and env names are used identically across tasks.
- Gap to confirm: the exact backend file paths in Task 5 are taken from the spec (`CorsConfig.java`, `WebSocketConfig.java`); the implementer must locate them with grep before editing.
