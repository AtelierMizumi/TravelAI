# Booking and Banking API

Protected endpoints require Authorization: Bearer <opaque-session>. Mutations use Idempotency-Key. Ownership comes from the server session. ADMIN alone changes catalog/policies/calendar and service-unavailable cancellation/no-show. Currency and every monetary response use SIMULATED VND.

| Method/path | Contract |
| --- | --- |
| POST /api/auth/register, /login | Existing user response retained, add session token on valid login. Registration cannot choose role. |
| POST /api/auth/logout | Revoke bearer session. |
| GET /api/booking/offers | Public active configured offers with nonpersonal inventory summaries. |
| POST /api/booking/offers | ADMIN creates/updates explicit departures/physical rooms and all four policies. |
| POST /api/booking/calendars | ADMIN publishes approved year/version/dates and official reference. |
| POST /api/booking/bank/accounts | ADMIN provisions synthetic accounts/cards for fixture users. Never accepts arbitrary real card numbers. |
| GET /api/booking/bank | Own synthetic balance/cards and immutable history. |
| POST /api/booking/reviews | Validate quote/selection/cutoffs and create a payable expiring hold and exact review. Body includes offering, itinerary, selections, guest distribution and optional current booking/revision for rescheduling. |
| POST /api/booking/reviews/{id}/pay | Explicit confirmation of review digest and allowlisted synthetic card/CVV, Idempotency-Key. Successful atomic debit confirms/replaces booking. |
| GET /api/booking/bookings | Own bookings, ADMIN authorized all-view. |
| GET /api/booking/bookings/{id}/history | Owned/authorized history. |
| POST /api/booking/bookings/{id}/cancel | Owned eligible cancellation or ADMIN service-unavailable reason. Aggregate source-account refund. |
| POST /api/booking/bookings/{id}/no-show | ADMIN at/after saved grace, explicit resellable allocation selection. |
| POST /api/booking/bookings/{id}/correct-no-show | ADMIN full inventory restoration or zero-effect conflict. |

Review response includes exact original/proposed times, unchanged travelers/guests, selected room/seat identifiers and mapping, nightly components, holiday classifications/versions, original amount, 20% fee, holiday difference/added charges, total, four policy snapshots, source account, issued expiry and digest. Card/CVV request values never enter history or persisted idempotency payloads.

Errors use message, code and optional fields, with stable HTTP 400 validation, 401 missing/expired session, 403 role/ownership, 404 unavailable record and 409 stale review/inventory/expiry/idempotency conflict. Definitive payment failure leaves zero debit and retains a valid hold until its original expiry. Unknown results retry the same key to retrieve the committed result.

Legacy /api/tour-bookings and /api/hotel-bookings remain adapters with old response fields. Unsafe unpaid approve and unchecked date/quantity edits cannot bypass the canonical workflow. Migration conflicts include the new review endpoint. Existing legacy records stay readable.
