# Unified `main` — design (15/11/2026)

## Intent
One coherent product on `main`: the TravelAI 2.0 stack (Expo web/Android + Spring Boot + FastAPI) that is already deployed, plus the best work of all three engineers, without parallel stacks. Success = `main` builds, all CI jobs green, the live stack still passes smoke tests, and every shipped feature has an owner, an issue and evidence.

## Findings that drive the design
- `main` is the v1 line (Đức `services/core`, Ngọc `client`, Thuận `services/ai`). The deployed product is v2 (`backend`, `apps/mobile`, `ai-service`), imported in `018dcd6` under CR-01. PR #57 carries v2; PR #56 carries the JWT hardening for v1.
- v2 already covers the WBS user flows: auth/session, catalog, booking with simulated payment, ratings, feed, chat, admin, settings (see Ngọc's comparison doc and `AdminController`, `BookingService`, `RatingController`).
- Gaps versus v1/other lines: (1) tour/hotel/place delete has no guard when bookings exist (Đức, #54); (2) landmark → province → same-province tours/hotels catalog (Ngọc, `f6071c7`); (3) a local classifier fused with Google Vision (Đức model, Ngọc loader) — useful only as a non-authoritative signal; (4) v1 problem+json error format is absent.

## Decisions
1. **Base = v2.** v1 stays reachable by tag `v1-vite-core-final` and by history; it is removed from the `main` tree after ports land.
2. **Merge, do not squash,** `origin/main` into `release/unified` so Đức's and Thuận's history is kept.
3. **Port by re-implementing on v2 entities, test-first.** No copy of v1 code. Port 1: delete guard. Port 2: Ngọc's catalog patch minus test images, docs and model binaries. Port 3: local classifier loader, **optional and off when the model file is absent**; a local-only prediction is labelled "dự đoán" and never attaches services (Ngọc's own rule, kept).
4. **No binaries in git:** model downloaded by the pinned-checksum script; sample images stay out.
5. **No new stack, no rewrite, no deploy side-effects:** changes reach the live site only through the existing release path.

## Out of scope (recorded, not hidden)
Porting JWT/RTR (v2 uses server-side sessions with idle and absolute expiry); Đức's v1 reconciliation UI (v2 admin has booking and bank panels); ONNX training pipeline; calibrated accuracy claims.

## Verification
Backend: `./mvnw test` on JDK 25 against Postgres 16 (Docker locally, CI on PR). App: `npm run lint && npm test && npx tsc --noEmit`. AI: `python -m unittest discover -s tests`. Stack: `scripts/smoke-edge.sh`.
