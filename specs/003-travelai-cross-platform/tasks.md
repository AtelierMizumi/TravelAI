# Tasks — TravelAI 2.0

Date 2026-11-06. User authorized the concrete six-step implementation proposal. Two known delivery checklist items remain open until evidence exists. Each task states requirements, dependencies, exact files and completion conditions. Tests precede behavior.

## Phase 1 — Setup

- [x] T001 Record reviewed baseline, user authorization and cross-artifact constitution analysis in specs/003-travelai-cross-platform/plan.md and research.md. FR-018/019. Depends none. Complete when all design contracts exist and stable FR coverage is verified.
- [x] T002 Reproduce the mobile ref failure with apps/mobile/src/components/app-tabs.web.tsx and capture failing typecheck evidence. FR-017/019. Depends T001. Complete when the failing command and exact type mismatch are recorded.
- [x] T003 [US8] Correct native-element ref typing in apps/mobile/src/components/app-tabs.web.tsx and add typecheck script to apps/mobile/package.json. FR-017. Depends T002. Complete when typecheck passes without dropping the ref or unsafe casts.
- [x] T004 [US8] Install Expo-compatible lint dependencies and configure apps/mobile/eslint.config.js and package.json. FR-017/019. Depends T003. Complete when local lint and typecheck both pass.
- [x] T005 Create isolated PostgreSQL test setup and red domain/API tests in scripts/test-backend.sh and backend/src/test/java/com/travelai/backend/booking/. FR-019/020–030. Depends T004. Complete when deterministic synthetic tests run against isolated configuration and expected missing behavior fails.

## Phase 2 — Foundations

- [ ] T006 Add additive banking/booking/session schema and migrations in backend/src/main/java/com/travelai/backend/booking/ and backend/src/main/resources/db/. FR-018/020/023. Depends T005. Complete when isolated persistence works and legacy records remain readable.
- [x] T007 Implement pure Clock/VND/cutoff/holiday policy functions in backend/src/main/java/com/travelai/backend/booking/BookingPolicies.java. FR-020/021/024–030. Depends T005. Complete when rounding, expiry and dual-cutoff unit tests pass.

## Phase 3 — US1 accounts and protected operations

- [ ] T008 [US1] Write session/password/ownership red tests in backend/src/test/java/com/travelai/backend/security/. FR-001/002/013. Depends T006. Complete when unauthorized, role-forgery, expiry and revocation cases are executable.
- [ ] T009 [US1] Implement hashed passwords, opaque sessions and ownership/role enforcement in backend/src/main/java/com/travelai/backend/security/ and controller/AuthController.java. FR-001/002/013. Depends T008. Complete when seven-day/24-hour expiry, logout/password/block revocation and safe user DTO tests pass.
- [ ] T010 [US1] Integrate server sessions into apps/mobile/src/context/auth.tsx and their API transports. FR-001/002/013. Depends T009. Complete when clients send tokens and reject stale identities while preserving current exported methods.

## Phase 4 — US2 catalog and inventory policy

- [ ] T011 [US2] Write offering/calendar/physical-room inventory red tests in backend/src/test/java/com/travelai/backend/booking/OfferingTests.java. FR-003/004/015/023. Depends T006/T007/T009. Complete when four-policy sale readiness, room occupancy, date intervals and approved-year fixtures are covered.
- [ ] T012 [US2] Implement protected offering/calendar configuration and exact availability in backend/src/main/java/com/travelai/backend/booking/. FR-003/004/015/023/028. Depends T011. Complete when drafts/invalid configuration reject, capacity is departure-specific and physical-room nights do not oversell.

## Phase 5 — US4 booking and synthetic bank

- [ ] T013 [US4] Write transactional charge/hold/retry/concurrency red tests in backend/src/test/java/com/travelai/backend/booking/BookingTransactionsTest.java. FR-008/009/020–026. Depends T005/T009/T012. Complete when original amount, ACTIVE synthetic cards, balance, last-unit, expiry and rollback cases run.
- [ ] T014 [US4] Implement simulated account/card provisioning, ledger and operation idempotency in backend/src/main/java/com/travelai/backend/booking/. FR-020/021/022. Depends T013. Complete when source-account and no-overdraft/no-duplicate-charge tests pass.
- [ ] T015 [US4] Implement review snapshots, expiring holds and atomic confirmation in backend/src/main/java/com/travelai/backend/booking/. FR-008/009/023–026. Depends T014. Complete when confirmed booking requires explicit digest confirmation, one charge and inventory allocation, with failed payments retaining only the issued hold.
- [ ] T016 [US4] Write rescheduling/cancellation/no-show red tests in backend/src/test/java/com/travelai/backend/booking/BookingLifecycleTest.java. FR-025/027–030. Depends T015. Complete when holiday components, original-amount fees, dual policies, aggregate refunds and correction inventory races are covered.
- [ ] T017 [US4] Implement atomic rescheduling and full immutable history in backend/src/main/java/com/travelai/backend/booking/. FR-028/029/030. Depends T016. Complete when all price/holiday/calendar-revalidation/selection/history tests pass and original booking survives every failure.
- [ ] T018 [US4] Implement 65%/100% refunds, administrator no-show and protected correction in backend/src/main/java/com/travelai/backend/booking/. FR-025/027. Depends T016/T017. Complete when rounding/source-account/refund/correction concurrency tests pass.
- [ ] T019 [US4] Adapt legacy booking mutations in backend/src/main/java/com/travelai/backend/controller/TourBookingController.java and HotelBookingController.java. FR-008/009/018. Depends T018. Complete when unsafe legacy approve/update/delete cannot bypass canonical payment and refund rules, while existing records/read responses remain usable.
- [ ] T020 [US4] Write controlled client review/payment/history tests in apps/mobile/tests/attempt.test.mjs and transport.test.mjs. FR-008/009/026–030. Depends T015/T017/T018. Complete when authoritative responses, disclosure, retries and errors are covered.
- [ ] T021 [US4] Replace timer settlement with synthetic review/payment UI in apps/mobile/src/app/booking/payment.tsx and detail/navigation adapters. FR-008/009/020–026. Depends T019/T020. Complete when only authoritative success shows CONFIRMED and all amount components/selections are explicitly reviewed.
- [ ] T022 [US4] Integrate reschedule/cancel/history flows in apps/mobile/src/app/profile.tsx and src/app/bookings/ and shared booking adapters. FR-027–030. Depends T021. Complete when old inventory is protected, latest calendar revalidation requests confirmation and aggregate refunds/history display SIMULATED VND.

## Phase 6 — US7 administration

- [ ] T023 [US7] Write admin authorization and lifecycle contract tests in backend/src/test/java/com/travelai/backend/booking/AdminBookingTest.java. FR-015/016/025/027. Depends T018. Complete when traveler/anonymous callers are denied and actor/reason evidence is asserted.
- [ ] T024 [US7] Integrate offering/calendar/banking policy management and booking/no-show/correction actions in apps/mobile/src/components/admin/bookings.tsx and src/services/api.ts. FR-015/016/020–030. Depends T023/T019. Complete when every mutation uses the protected contract, displays simulation and retains audit/history.

## Phase 7 — US8 mobile traveler parity

- [ ] T025 [US8] Write shared authenticated API and mobile booking validation tests in shared/ and apps/mobile/src/services/. FR-017/018/020–030. Depends T010/T020. Complete when shared contracts and error/expiry behavior run independently of native UI.
- [ ] T026 [US8] Extend apps/mobile/src/app/ with account/catalog/booking/review/payment/history/rescheduling routes backed by the shared APIs. FR-001–004/008/009/017/020–030. Depends T025/T021/T022. Complete when synthetic Web/Android/iOS fixture journeys agree and lint/typecheck pass.

## Phase 8 — US5 moderated feed

- [ ] T027 [US5] Write moderation/ownership/audience tests in backend/src/test/java/com/travelai/backend/community/. FR-010/013/014. Depends T009. Complete when pending/approved/edited/deleted posts and duplicate interactions are covered.
- [ ] T028 [US5] Secure existing Post/Follow controllers and integrate approved feed/retention behavior into frontend and apps/mobile/src/app/. FR-010/013/014. Depends T027/T026. Complete when moderation and cross-client ownership fixtures pass.

## Phase 9 — US6 messages and reminders

- [ ] T029 [US6] Write participant WebSocket/notification/reminder red tests in backend/src/test/java/com/travelai/backend/community/. FR-011/012/013. Depends T009/T018. Complete when outsider denial, reconnect, 24h/1h reminders and supersession are covered.
- [ ] T030 [US6] Secure Chat/WebSocket/Notification controllers and replace reminder scheduling in backend/src/main/java/com/travelai/backend/service/ReminderService.java. FR-011/012/013. Depends T029. Complete when authorized delivery, replay dedup and itinerary reminders pass.
- [ ] T031 [US6] Integrate mobile messages/notifications and client session expiration into apps/mobile/src/app/ and existing frontend adapters. FR-011/012/017. Depends T030/T026. Complete when Web/Android/iOS fixtures and privacy tests agree.

## Phase 10 — US3 recognition and privacy

- [ ] T032 [US3] Write consent/input/unknown/provider-failure tests in ai-service/tests/ and client recognition adapters. FR-005/006/014. Depends T009. Complete when denied transfers and prohibited personal inputs produce zero provider requests.
- [ ] T033 [US3] Implement explicit consent/provenance and controlled landmark inference in ai-service/ai/main.py and existing web/mobile recognition routes. FR-005/014. Depends T032. Complete when synthetic provider/error/consent fixtures pass.
- [ ] T034 [US3] Create licensed nonpersonal dataset manifest, Kaggle training/evaluation provenance and model rollback artifacts in ai-service/evaluation/. FR-006/007. Depends T032. Complete when five accepted classes and independent sample counts/rights are present with approved transfer scope.
- [ ] T035 [US3] Integrate approved YOLO model and native live-camera flow in ai-service/ and apps/mobile/src/app/. FR-006/007/017. Depends T034/T033/T026. Complete when evaluation and permission lifecycle tests meet accepted metrics on both reference devices.

## Phase 11 — Cross-cutting delivery evidence

- [ ] T036 Write controlled-clock category deletion/restore tests and implement retention/anonymization jobs in backend/src/main/java/com/travelai/backend/privacy/. FR-014/016/030. Depends T018/T028/T030/T033. Complete when 30/60-day and 12-month limits, restore replay and source-derived deletion pass.
- [ ] T037 Run all quickstart acceptance, builds, lint/typechecks and additive migration/rollback checks and record results in specs/003-travelai-cross-platform/quickstart.md. FR-017/018/019. Depends T024/T026/T028/T031/T035/T036. Complete when all required suites pass against reviewed source.
- [ ] T038 Run accepted 50-user/ten-minute load and independent AI/reference-device evaluations and record evidence in specs/003-travelai-cross-platform/validation.md. FR-005/006/007/011/017/019. Depends T037. Complete when all accepted metric, accuracy, FPS/latency and financial/inventory invariants pass.
- [ ] T039 Cross-analyze all FR-001 through FR-030 coverage and retained local changes in specs/003-travelai-cross-platform/validation.md. FR-019. Depends T038. Complete when every required FR has current passing evidence and all remaining gaps are represented as tasks before any convergence claim.

## Dependencies and independent acceptance

Setup -> foundations -> US1 -> US2 -> US4. US7 and US8 integrate the same canonical booking service. US5 and US6 require authenticated identities. US3 requires approved consent, data and model artifacts. Final evidence depends on all assigned platform journeys. Story independent tests use synthetic prerequisite fixtures.

Parallel opportunities after dependencies pass include US5 moderation tests, US6 participant tests and US3 consent tests in separate directories. Implementation is sequential in this task unless separately delegated.

## Implementation strategy

Complete the approved mobile repair first, then secure identity and original transactional checkout, then lifecycle and client integration. Continue all tracked stories and delivery evidence. A task is checked only after its stated tests pass. External data transfer and cloud deployment remain separately scoped.

## Execution evidence

Initial local baseline recorded in spec.md. Update this section with command results after each task.

T001 passed. Five design artifacts and contracts generated and reviewed. User authorization to proceed on known 21/23 delivery gate recorded in plan.md. Research agents completed read-only research.
T002 passed. Mobile `tsc --noEmit --incremental false` reproduced TS2322 at app-tabs.web.tsx:38 before the fix.

T003 passed. Mobile ref remains forwarded with Pressable-compatible native-element type. `npm run typecheck` exit 0.
T004 passed. Expo installed ESLint/config and local `EXPO_OFFLINE=1 CI=1 npm run lint` and `npm run typecheck` both exit 0 after replacing hydration setState-in-effect with useSyncExternalStore. Dependency install reported 15 moderate advisory entries, to review without unrequested broad upgrades.
Policy baseline: 10 BookingPoliciesTest tests pass against isolated temporary PostgreSQL harness, evidence /tmp/travelai-backend-test-rzYs2Q/build/surefire-reports. PasswordHashesTest was executed red before implementation. Host JDK27 Lombok failure reproduced and isolated JDK21 validation configured without changing production Java25 default.

2026-11-06 implementation checkpoint. `scripts/test-backend.sh` completed all 21 tests with zero failures/errors against a new isolated PostgreSQL instance. Includes eight transaction/API cases, ten policy cases, two password cases and application context startup. Last report directory is recorded in /tmp/travelai-transaction-run.log. Synthetic concurrency checks cover last-seat holds and duplicate payment, expiry is tested exactly at the issued boundary, failed rescheduling preserves the original, successful change releases its old seat, and a 100 + 80 payment basis refunds 117 and retains 63. The initial transaction tests exposed persist-before-initialization errors, which were corrected and rerun.

Frontend and admin production builds both passed using temporary output directories. New opaque-session transport integration compiles. Mobile lint/typecheck passed earlier. Test runtime uses installed JDK21 with a command-line release override, production Java25 compatibility remains to be verified.

Foundation implementation remains incomplete. Additive SQL is authored but migration/legacy compatibility evidence is pending. Security still requires its full expiry/revocation/ownership matrix. Canonical booking API/service exists and passes the listed subset, but hotel/no-show/calendar/cutoff-policy version matrices, rollback fault injection, UI integration and all-platform delivery evidence remain open. Legacy booking mutations now return an explicit migration conflict to prevent bypassing canonical SIMULATED payment. The old checkout screen needs migration before it is usable with these protected endpoints. Existing legacy records remain readable through authorized GET routes. T006 and later tasks are deliberately unchecked except pure policy T007, whose direct test prerequisite passed.

Requirements checklist remains 21/23. No delivery or overall-completion checkbox changed. Expo dependency installation reported 15 moderate advisory entries that remain for dependency review.

2026-11-06 universal-client amendment. The user authorized consolidating the former traveler/admin Vite applications into apps/mobile for Web/Android/iOS and cleanup after migration. Legacy client path assignments above now point to their Expo replacements. Old source was archived locally before deletion. This migration does not close physical-device, AI evaluation, retention or performance requirements. The requirements checklist is unchanged. Updated verification evidence is in the repository README and the execution evidence below.

Universal migration verification completed on 2026-11-06. Backend `scripts/test-backend.sh` reports 30 tests, zero failures/errors. Client `npm run check` covers lint/typecheck plus nine direct transport/idempotency tests. Expo exported Web, Android and iOS bundles after removing the old clients and tutorial code. AI contract suite reports nine passing tests with mocked provider requests. Browser QA used a temporary PostgreSQL instance and synthetic accounts/catalog/cards. It verified login/session restoration, profile/balance data, tour inventory selection, explicit review disclosures and a SIMULATED 100,000 VND payment resulting in CONFIRMED. Recovery archive for removed source is /tmp/travelai-pre-universal-ki2r9g0d.tar.gz. Native physical-device journeys, broader delivery measurements and remaining FR matrices are still open. npm dependency audit retains 15 moderate advisory entries.

Compatibility follow-up. Existing short legacy passwords are migrated to PBKDF2 only after successful verification, while new/changed passwords retain the eight-character minimum. Administrator dashboard totals now include both canonical and legacy bookings.
