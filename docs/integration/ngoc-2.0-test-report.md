# TravelAI 2.0 (Ngoc) Integration, Test Report

Date: 2026-11-08. Upstream: `ngoctapcodee/travel-ai-system` @ `5799682`. Branch: `integration/ngoc-2.0` (based on `feat/wbs-1.8.2-docker-compose-integration`).
All payments are SIMULATED. Credentials are never stored in this repository.

## Toolchain

Node 26.13, Java 21 (host) / Temurin 25 (Docker), Docker Compose 5.7, uv 0.13, adb 1.0.41, PostgreSQL client tools 18.6 (no service enabled).
Android target: Waydroid (Android 13, x86_64) running Expo Go; backend and AI reached through `adb reverse` (8080, 8000, 8084).

## Baseline (upstream unmodified, host-run)

| Suite | Result |
| --- | --- |
| `npm run check` (lint + tsc + 10 unit tests) | pass |
| AI tests (`unittest`, 11) | pass |
| Backend tests (52, temporary PostgreSQL) | pass (run with `./mvnw`, JDK 21) |

## Integration (profile `v2`)

`docker compose --profile v2 up -d --build postgres-v2 ai-v2 backend-v2` starts PostgreSQL 16, the upstream AI service and the Spring Boot backend (Java 25). Verified: all containers healthy; Hibernate creates 29 tables on an empty database; `googleVisionConfigured=true`; ports bound to 127.0.0.1; no key material in image layers or git; default profile unaffected. A missing `HOST_GCP_KEY`/`HOST_MESSAGE_KEY` makes the v2 service fail at creation with a clear bind-path error.

## Journey J (login, tour, booking + payment, image recognition)

| Step | Web (desktop browser) | Android (Waydroid, Expo Go) |
| --- | --- | --- |
| Login | pass | pass |
| Tour list / detail | pass (first load about 5 s) | pass |
| Review + simulated payment | pass (`CONFIRMED`, 50,000,000 -> 47,500,000) | pass (`CONFIRMED`, 47,500,000 -> 45,000,000) |
| Pay without confirmation | readable 400 | not run (API: readable 400) |
| Pick image (system photo picker) | pass | pass |
| Image recognition upload | pass (Berlin Cathedral, real Google Vision) | **fail: D7** |
| Non-image / no consent / over 10 MB (API) | 400 / 400 / 413 | n/a |
| Backend unreachable | repeated retries, no crash (D5) | pass: clear message "Khong ket noi duoc backend..." |

Not covered: camera capture and live camera scan (Waydroid has no camera), iOS (no Mac), Gmail password reset, Gemini chat (no key), admin screens.

## Defects

| ID | Area | Finding | Suspected owner |
| --- | --- | --- | --- |
| D1 | backend | `backend/.mvn/wrapper/` missing upstream, so `./mvnw` fails (fixed in this snapshot by adding wrapper properties) | Duc/Ngoc |
| D2 | backend | Starts normally when `TRAVELAI_MESSAGE_KEY_FILE` points to a nonexistent file or `/dev/null` (no fail-fast); an unreadable file does crash startup | Duc |
| D3 | app | Review without a selected departure shows raw English `Unknown departure`; departure buttons show no selected state | Ngoc |
| D4 | data | `data.sql` seeds one place; a fresh database has no admin, tour schedule or simulated bank account, so booking is impossible until seeded | Duc/Ngoc |
| D5 | app | With the backend down, the web client retries notifications and the WebSocket continuously (138 console errors in about 3 minutes), no visible backoff | Ngoc |
| D6 | tooling | `scripts/dev.sh` needs host `mvn`, `pg_isready` and `psql`; not all present on a default workstation | Ngoc |
| D7 | app (native) | `apps/mobile/src/services/recognition.ts` appends an RN-style `{uri, name, type}` part to `FormData`; Expo SDK 58's `expo/fetch` rejects it with `Unsupported FormDataPart implementation`, so image recognition cannot work on Android/iOS. Suggested fix: send a `File` from `expo-file-system` (has `bytes()`), or a `Blob`. Other native multipart uploads (profile avatar) likely share the problem. | Ngoc |
