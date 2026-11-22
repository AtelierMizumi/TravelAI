# Data Model

All additions are additive JPA/PostgreSQL tables. IDs are server-generated. Time is stored as instants and displayed in Asia/Ho_Chi_Minh. User references point to existing users. Amounts are integer SIMULATED VND.

| Entity | Fields and invariants |
| --- | --- |
| AuthSession | token digest unique, user ID, issuedAt, lastActivityAt, expiresAt, revoked. Seven days absolute and 24-hour inactivity. Raw bearer token is never stored. |
| SimulatedAccount | ID, ownerId, nonnegative balance, VND currency. One authoritative source account per booking. |
| SimulatedCard | synthetic-only ID, accountId, synthetic CVV verifier, expiry month/year, status. Only ACTIVE unexpired cards may debit. Refund ignores card status. |
| BookingOffering | type, legacy offeringId, departure/check-in/out times, capacity/seat map/rooms, prices, active state, four required policies and version. Room maxGuests is a positive integer. Cutoff hours are integers >=0, grace minutes >=0, hold minutes >=1. |
| HolidayCalendar | year, immutable version, official source reference, approvedBy/time, approved date set. Draft versions cannot price a booking. |
| Booking | ownerId, offeringId, CONFIRMED/PENDING/CANCELLED/NO_SHOW/EXPIRED states, current immutable itinerary, original amount, sourceAccountId, totalPaid, revision and timestamps. Successful rescheduling preserves tour travelers/hotel total guests. |
| BookingReview | owner, booking/revision, target itinerary and selections, canonical digest, policy/time/price snapshots, reviewed holiday versions, fee/difference/total, issued request timestamp, hold expiry and explicit confirmation evidence. |
| InventoryAllocation | booking/review, exact room/seat or count unit, service start/date, HOLD/CONFIRMED/RELEASED, issuedAt/expiry and policy reference. Held+confirmed never exceeds capacity. Hotel nights use [checkInDate, checkOutDate). |
| SimulatedTransaction | immutable booking/account/reference, CHARGE/REFUND/FEE record, exact amount, currency, timestamp and operation. Unique successful logical operation. |
| BookingHistory | actor, action, request time, before/after snapshots, calendar/policy versions, amount components, outcome/reason. No real card data or CVV. |
| BookingOperation | caller/action/idempotency key unique, canonical nonsecret request digest, committed result reference. Same request returns same result, conflicting payload rejects. |
| TransactionBarrier | singleton lock row acquired before any inventory/bank mutation. Re-read all records after lock. |

## Transitions

PENDING hold -> CONFIRMED requires exact explicit review, active hold, successful synthetic debit and inventory allocation in one transaction. Expiry releases HOLD once. Failed debit retains hold only until issued expiry.

CONFIRMED -> updated CONFIRMED requires both strict cutoffs, live inventory and additional payment of 20% original amount plus holiday-only components. Original allocation is replaced only on commit.

CONFIRMED -> CANCELLED refunds 65% aggregate paid total for eligible traveler or 100% for service-unavailable admin. Record retained fee and release only resellable inventory atomically.

CONFIRMED -> NO_SHOW requires authorized administrator at/after saved grace end. Zero financial effects. Administrator explicitly selects resellable allocations to release. Correction restores CONFIRMED only if every required original allocation can be reacquired.

## Retention

FR-014 governs account/content/message/recognition/booking/audit/backup deletion and anonymization. Immutable ledger meaning applies during its accepted retention period. Personal references may be anonymized while preserving totals and linkage.
