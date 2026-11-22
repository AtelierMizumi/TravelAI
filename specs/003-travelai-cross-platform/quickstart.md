# Validation Guide

## Preconditions

Use synthetic fixtures and local dependencies. Preserve unrelated local work. PostgreSQL test cluster must use a fresh /tmp directory and loopback-only port. Supply test configuration explicitly, disable production seeders/schedulers and never use stored production credentials.

## Checks

1. Mobile typecheck with `npm run typecheck` and lint with `npm run lint` in apps/mobile after Expo-compatible lint installation.
2. Policy/unit and isolated database checks with `scripts/test-backend.sh` from repository root. Expected output records unit, rollback, authorization and concurrent transaction outcomes.
3. Client portable tests through their documented Node test command. Web/Admin production builds use isolated /tmp output directories to preserve existing artifacts.
4. Start a separately configured local backend against synthetic data. Create a synthetic traveler/admin, offerings and four explicit policies, approved calendars and a registered SIMULATED card/account. Review exact booking before payment.
5. Pay/retry one review and verify one debit/CONFIRMED booking, finite inventory and no timer-generated settlement. Fail a payment then retry before hold expiry. Expiry rejects further charges and returns held capacity.
6. Reschedule through both strict cutoffs and selected available replacement inventory. Verify 20% original-amount fee, holiday-only differences, immutable source account, one additional debit/history and old-inventory release on commit.
7. Test traveler 65% aggregate refund/35% remainder and admin 100% refund, expired/locked card refund, duplicate/concurrent cancellation and no negative balance.
8. ADMIN confirms no-show at/after saved grace, explicitly releases only resellable inventory, and corrects only when complete original inventory is available. No extra financial effects.
9. Complete Web/Android/iOS/Admin journey coverage, retention/deletion/consent, AI held-out evaluation and approved 50-user/reference-device gates before delivery acceptance.

Build success alone does not satisfy the final feature-outcome gate. Record exact reviewed source, fixture/model/device versions, commands, failures and remaining tasks in tasks.md. User authorized implementation through the explicit OK despite the two known delivery checkboxes remaining open.
