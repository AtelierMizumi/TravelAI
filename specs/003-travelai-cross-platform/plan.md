# Implementation Plan — TravelAI 2.0

Branch `001-travelai-cross-platform`. Accepted specification `spec.md`. Date 2026-11-06.

## Summary

Incrementally extend React web/Admin, Expo mobile and Spring Boot/FastAPI. First establish executable mobile checks, then authenticated booking with synthetic banking, authoritative review, expiring inventory holds, rescheduling, cancellation and no-show. Retain legacy records and route compatibility through explicit adapters. All FR-001 through FR-030 remain tracked in tasks.md.

## Technical Context

Java release 25 with Spring Boot 3.5.14, Spring Data JPA and PostgreSQL remain the business boundary. Host Java is 27. Clients use their existing React/Vite and Expo SDK58/React Native0.88 versions. Monetary values use integer VND and BigDecimal half-up percentages. Time rules use injected Clock and Asia/Ho_Chi_Minh. Existing JUnit/Mockito dependencies and an isolated temporary PostgreSQL cluster provide offline-capable unit and transaction tests. Client policy tests use Node's built-in test runner where portable. Expo-compatible ESLint dependencies are installed through expo install.

The accepted 50-user/ten-minute performance and AI reference-device gates remain delivery tasks. No production connection is used for development tests. Deployment and external personal-data transfers require their own accepted scope.

## Constitution Check

| Principle | Design and verification |
| --- | --- |
| I | Policy/transaction tests precede behavior, per-task execution evidence recorded. |
| II | Opaque server sessions, password hashing, ownership/roles, synthetic-only bank identifiers and isolated test DB. |
| III | Stable FR/US IDs map to contracts, tasks and tests. |
| IV | Accepted Q1–Q3 governs behavior. Configuration supplies approved per-service values. |
| V | Spec decisions accepted, design reviewed before implementation. |
| VI | Sequential dependency IDs and explicit completion criteria per task. |
| VII | Cross-check spec, plan, entities, contracts, tasks and checklist. |
| VIII | Preserve local work. User explicitly approved the six-step planning/implementation proposal after review of the known 21/23 gate. This authorizes implementation needed to obtain delivery evidence while those two outcome checkboxes remain open. |
| IX | Runtime/model/device results remain required for convergence. |
| X | Reuse Spring Boot/JPA/PostgreSQL, existing controllers, React clients and Expo Router. |
| XI | Authorization is the user's final OK to the concrete six-step proposal. No claim of completed delivery follows from authorization. |

The scoped gate authorization covers local planning, source fixes and controlled tests. Owner is this task. It expires at completion or a new user restriction. Required remediation is passing delivery evidence before marking the remaining gates complete. Existing records remain readable and any incompatible unsafe mutation returns an actionable conflict until migrated.

## Project Structure

Documentation uses plan.md, research.md, data-model.md, contracts/, quickstart.md and tasks.md in this feature directory.

Backend additions live under backend/src/main/java/com/travelai/backend/{booking,security}. Existing controllers/entities/repositories remain. Test fixtures live in backend/src/test and scripts/test-backend.sh. Shared portable client policy/API code lives in shared/. The approved universal migration consolidates both former Vite clients into apps/mobile/src/services and apps/mobile/src/components/admin. Mobile retains src/app routes and src/components.

## Transaction Design

Normalized tables hold simulated accounts/cards, offering policies, physical rooms/departures, bookings, inventory allocations, immutable ledger/history, reviews and idempotent operations. One transaction barrier row serializes inventory/bank mutations initially. It is a database row lock shared by all instances, with all state re-read after acquiring it. It makes last-unit allocation, balance debits, cancellation credits and retries atomic without distributed locks. This conservative initial granularity must pass the accepted load gate. Later finer locking requires equivalent invariant tests.

Review snapshots bind amounts, itinerary, selections and immutable cutoff/cancellation/no-show/hour policies. Holiday calendar is revalidated immediately before committing payment. A changed classification/amount requires a fresh explicit review. Idempotency keys bind caller/action/booking and a canonical nonsecret request digest. Raw card inputs and CVVs are excluded from persisted payloads. Only synthetic allowlisted identifiers are accepted.

## Compatibility and Migration

New normalized tables are additive. Legacy booking entities gain a canonical booking reference only where needed. Existing display fields and IDs remain. Read adapters preserve history. Old create/update endpoints require reviewed payment intent or return a specific migration conflict rather than inventing paid state. Legacy approve cannot confirm unpaid bookings. Test schema creation is disposable. Production schema changes require an additive reviewed SQL migration and rollback procedure, never destructive reset.

## Validation Order

Run mobile typecheck/lint, pure policy tests, isolated PostgreSQL service/concurrency tests, API authorization and retry tests, web/Admin builds and client journeys. Complete native/device and AI evaluation tasks only with the approved fixtures and devices. Record failed/unavailable checks and open tasks accurately.

## Complexity Tracking

The transaction barrier is an explicit correctness-first choice for initial delivery. Database persistence, API integration and concurrency tests are mandatory. In-memory simulation cannot establish production transactional correctness.

## Universal migration amendment — 2026-11-06

The user authorized moving the Web feature set to the shared Expo Web/Android/iOS application and removing unrelated code. apps/mobile is now the single traveler/admin client. Legacy Web route equivalents remain under src/app. The former frontend and admin directories are superseded. Requirements, backend/AI services and retained database records continue to define the business contracts. Native device verification and the original broader delivery gates remain open.
