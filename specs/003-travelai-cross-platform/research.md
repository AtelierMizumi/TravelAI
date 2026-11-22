# Research — 2026-11-06

## Existing boundaries

Decision. Preserve Spring Boot3.5.14/JPA/PostgreSQL. Existing TourBookingController and HotelBookingController are reusable API adapters but currently accept client identity/prices, modify quantities directly and approve without settlement. Introduce services and authorization before enabling the new money/inventory operations.

Rationale. The database and all clients already depend on these boundaries. New tables preserve legacy records and existing display contracts.

Alternatives. A gateway would violate synthetic-only scope. A client-only ledger or process-local lock would fail transaction/multi-instance guarantees.

## Test environment

Decision. Use JUnit/Mockito already cached and a disposable local PostgreSQL cluster. Host has initdb/pg_ctl/postgres. H2, Testcontainers and Spring Security are not cached. Tests supply synthetic users/offers/accounts and disable production seeders and reminders.

Rationale. PostgreSQL proves actual row-lock, rollback and concurrent-transaction behavior without a production database.

## Authentication

Decision. Opaque random bearer sessions stored by digest, seven-day absolute/24-hour inactivity expiry, password hashing with JDK PBKDF2 and random salt. Existing plaintext password rows may be upgraded only after successful credential verification. Never expose password properties. Protect ownership/admin actions server-side.

## Mobile typing and checks

Decision. Override the incompatible TabTriggerSlotProps ref type with ComponentProps<typeof Pressable>['ref'] while retaining runtime ref forwarding. Install Expo-compatible ESLint/config and use flat configuration. Preserve Expo58 and existing routes.

Evidence. Installed expo-router declares RefAttributes<View>, while RN0.88 Pressable uses the native host element type. Official Expo documentation was checked for SDK58, custom tab composition and lint setup.

References. https://docs.expo.dev/versions/v58.0.0/ and https://docs.expo.dev/router/advanced/custom-tabs/ and https://docs.expo.dev/guides/using-eslint/.

## Currency and history

Decision. Use integer VND ledger balances and decimal half-up percentages. Refund the aggregate source-account paid total, derive retained fee as remainder. Immutable histories retain snapshots, request evidence and operation references. Never persist card/CVV request payloads or use a real card network.

## Scope of execution

Decision. First deliver the approved mobile and booking/banking work. All other specification requirements remain explicitly tracked. AI model accuracy and native performance require measured fixture/device evidence, and cannot be marked delivered from source/build checks.
