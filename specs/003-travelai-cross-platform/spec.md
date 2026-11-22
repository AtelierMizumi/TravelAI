# Feature Specification: TravelAI 2.0 Cross-Platform Development

**Feature Branch**: No branch created or changed; feature directory is independent of branch name.

**Created**: 2026-11-04

**Status**: Specification decisions accepted on 2026-11-06. Delivery-verification evidence and overall checklist completion remain open under FR-019.

**Input**: Inspect frontend, admin, backend, AI service, and Expo mobile; specify existing and missing
travel capabilities across web, Android, iOS, and Admin CMS while preserving services and source.
No planning, implementation, source changes, external service calls, or commits are authorized here.

## Clarifications

### Session 2026-11-04

- Q: Which traveler features must the first release deliver across Web, Android, and iOS? → A: Option A. Accounts/profiles, destinations, landmark photo recognition, tours/hotels, booking/checkout, feed, messaging, and in-app notifications are mandatory on Web, Android, and iOS. Live YOLO cultural object detection is mandatory on Android/iOS only. Existing Admin CMS is retained.

- Q: Should the first release use simulated checkout with administrators managing tours and hotels, or include real payments or separate provider accounts? → A: Option A with mandatory extensions: USER/ADMIN only; administrators manage tours/hotels; Mastercard-style simulated card checkout with a simulated banking database of synthetic accounts/cards/CVVs, balances and transaction history; no real gateway or money. Validate cards, expiry, balance and payment status; deduct balances atomically, prevent duplicate charges and overselling, hold pending inventory and release unpaid holds after a configurable timeout. Failed payment never confirms a booking; successful payment and atomic inventory allocation confirm the booking under the custom policy recorded below. Cancellation policies follow subsequent decisions. No-show uses administrator confirmation with zero refund under the later clarification. All payment UI must clearly disclose simulation.

- Q: What custom booking and cancellation policy applies? → A: Before any simulated Mastercard payment, travelers explicitly confirm the tour/hotel, selected dates/times, traveler/guest count, applicable seats/rooms, total SIMULATED amount and 65% refund/35% fee policy. CONFIRMED requires successful simulated payment and atomic inventory allocation. Unpaid holds expire. Eligible voluntary cancellation refunds 65% and retains a 35% simulated fee; administrator cancellation because service cannot be provided refunds 100%. Record refunds/fees, release inventory when resellable, and make all payment/refund/inventory operations transactional and idempotent. Prevent duplicate refunds, double bookings, negative balances and overselling. Label all card payments, balances, fees and refunds SIMULATED; never process or store real card data. Cancellation cutoff and no-show decisions are recorded in the subsequent clarifications. No-show correction follows the subsequent inventory-protected restoration decision.

- Q: What mandatory rescheduling behavior applies? → A: Travelers can change the date/time of an existing CONFIRMED booking. Each successful change requires an additional SIMULATED payment with a fee of 20% of the original booking amount. Review shows original/new dates and times, traveler count, new seat/room availability, original amount, fee, applicable price difference and total additional SIMULATED payment. Check availability; preserve the original reservation until new inventory and payment are secured atomically. Failures preserve the original booking; prevent duplicate charges and record complete history. Positive differences follow the superseding holiday-only policy below; negative differences are not refunded under the decision below; cutoff configuration follows the accepted elapsed-hour, version and sale-readiness decisions. Seat/room reselection is resolved in the subsequent clarification. The later unlimited-change decision resolves the change limit.

- Q: When may a rescheduling price difference be charged? → A: The latest holiday-only policy overrides general price-difference charging. Each change incurs 20% of the ORIGINAL booking amount. Add max(0, newItineraryPrice - currentItineraryPrice) only if the new service date is an officially recognized Vietnamese public holiday in Asia/Ho_Chi_Minh, using a maintained year-specific calendar covering lunar holidays/Tết and applicable official arrangements. Nonholiday weekdays, weekends, peak-season dates and unofficial festivals add zero difference. Disclose classification, fee, difference and total before confirmation; preserve atomicity, inventory, idempotency and history. Negative differences are not refunded under the subsequent explicit decision below.

- Q: When the new itinerary costs less than the current itinerary, should the traveler receive a separate SIMULATED refund? → A: No. Negative price differences are not refunded or credited and do not offset the fixed 20% rescheduling fee based on the original booking amount. Positive differences apply only when the new service date is an official Vietnamese public holiday.

- Q: Which price should be used as currentItineraryPrice when calculating a holiday price increase? → A: Option A. Use the itinerary price recorded when the current itinerary was initially booked or last successfully rescheduled, excluding change fees; do not substitute the latest catalog price.

- Q: What deadline should apply to rescheduling a confirmed booking? → A: Option B. Administrators configure a rescheduling cutoff for each offering before departure or hotel check-in. Cutoff anchors, server request timestamp and strict boundary behavior are resolved below; configured values follow the accepted nonnegative whole-hour rule. The later sale-readiness decision requires explicit values; nonretroactive policy snapshots are resolved below; no numerical cutoff is assumed.

- Q: Which scheduled start should determine the rescheduling cutoff? → A: Option C. Both the currently confirmed and proposed departure/check-in MUST satisfy their respective configured cutoffs, including holiday-specific rules where configured. Reject if either fails, explain the reason clearly, and preserve the original booking, allocated inventory and simulated balance. Charge only after both checks and inventory validation succeed. Exact cutoff-boundary behavior follows the strict server-time decision below.

- Q: Should a rescheduling request made exactly at either cutoff deadline be accepted? → A: Option A, strict boundaries. Capture authoritative server-side requestTime; never trust the device clock. Require requestTime < currentCutoffDeadline AND requestTime < proposedCutoffDeadline. Calculate each deadline from its service departure/check-in in the applicable service timezone and configured cutoff duration, including configured holiday rules. Equality or later on either side rejects the entire change with no fee and preserves the original booking, inventory and simulated balance.

- Q: Should administrator changes to cutoff settings affect bookings already confirmed? → A: Option A. Use the immutable cutoff policy snapshot saved at booking or last successful rescheduling for the current itinerary. Use the policy effective at request review for the proposed itinerary, display it before confirmation, and save it as the new immutable snapshot only on success. Store policy version, duration and timezone; retain one server requestTime and strict checks for both deadlines. Administrative edits are never retroactive; rejected changes preserve the original snapshot, reservation, inventory and simulated balance with no charge.

- Q: If an administrator changes the proposed itinerary’s cutoff policy after review but before confirmation, should the reviewed policy remain valid? → A: Option A. Retain the proposed cutoff policy version shown at review for that rescheduling request. Subsequent administrator edits do not replace it; success saves that reviewed immutable snapshot, while rejection/failure preserves the current itinerary snapshot and charges nothing. Both strict cutoff checks still use one authoritative server requestTime.

### Session 2026-11-05

- Q: Where are refunds credited if the original synthetic card has expired or is no longer ACTIVE? → A: Option A. Credit the SIMULATED bank account recorded as the source of the successful payment, regardless of the card’s current expiry or nonpayable status.

- Q: Which synthetic card statuses allow payment? → A: Option A. Only ACTIVE cards may pay. Locked, suspended and closed cards reject even when expiry and balance checks otherwise pass.

- Q: When does a synthetic card with month/year expiry become expired? → A: Option A. It remains valid through the stated month and expires at 00:00 on the first day of the next month in Asia/Ho_Chi_Minh.

- Q: Do travelers select a specific hotel room or only a room type? → A: Option A. Select each physical room by its stable identifier/displayed room number. Holds, allocations and rescheduling pairings reference those exact rooms.

- Q: Which check-in/checkout hours apply after an administrator updates hotel hours? → A: Option A. Existing confirmed itineraries retain their accepted saved hours. New bookings or successful rescheduling adopt the exact hours displayed for traveler confirmation.

- Q: Who determines hotel check-in and checkout hours? → A: Option A. Administrators configure separate check-in and checkout hours for each hotel, displayed before confirmation. These hours determine the applicable itinerary times used by cancellation, rescheduling and no-show rules.

- Q: May another booking check in on the day an existing hotel booking checks out? → A: Option A. Hotel inventory is allocated by nights starting on check-in date and ending before checkout date. Adjacent stays may share the boundary date.

- Q: Which holiday calendar applies if it changes between rescheduling review and payment? → A: Option A. Recalculate against the latest approved calendar. If any relevant holiday classification or total payment changes, require renewed traveler review and explicit confirmation before charging.

- Q: What happens if a proposed rescheduling date belongs to a year without an approved holiday calendar? → A: Option A. Block the change until the relevant year has an approved calendar, explain that the calendar needs updating, and preserve the original booking, inventory and simulated balance with zero charge.

- Q: Who maintains and approves the annual Vietnamese public-holiday calendar? → A: Option A. Authorized administrators manually enter/update each year’s calendar, record official source references and approve its version before it is used.

- Q: Which date determines holiday classification for a hotel night? → A: Option A. A night from date D to D+1 is classified by its starting date D in Asia/Ho_Chi_Minh. Apply this to matched nights, added nights and added rooms.

- Q: How is capacity managed for tours without a seat map? → A: Option A. Administrators configure separate capacity for each departure date/time. Each traveler consumes one place in that departure only.

- Q: How is hotel room occupancy validated? → A: Option A. Administrators configure one maximum total guest capacity per room or room type. Every person counts as one occupancy place, with no separate adult/child capacity rule.

- Q: May hotel rescheduling change the total number of guests? → A: Option A. Preserve the currently confirmed total guest count. Guests may be redistributed among explicitly selected rooms, subject to room occupancy limits.

- Q: May tour rescheduling change the traveler count? → A: Option A. Keep the currently confirmed traveler count unchanged. For seat-map tours, explicitly select exactly that number of distinct replacement seats.

- Q: For tours with a seat map, must selected seat count equal traveler count? → A: Option A. Each traveler occupies one seat. The number of distinct selected seats must equal the number of travelers for the selected departure.

- Q: What happens to a hold after a failed simulated payment? → A: Option B. Keep the hold until its originally issued expiry, allow another payment attempt within that interval and never extend its duration because of retries. Failed payment never confirms a booking or leaves a debit.

- Q: Do hold-timeout edits affect existing holds? → A: Option A. Existing holds retain their issued expiry. Only newly created holds use the updated per-offering timeout.

- Q: May a service open for sale without an explicit hold timeout? → A: Option A. A valid per-offering hold timeout must be configured before sale. No automatic shared default is used.

- Q: Which unit and values configure pending-payment hold duration? → A: Option A. Positive integer minutes, minimum one minute. Each minute equals 60 elapsed seconds.

- Q: How is the temporary seat/room hold timeout configured? → A: Option B. Administrators configure the pending-payment hold timeout separately for each tour/hotel offering. Positive integer minutes are resolved by the subsequent decision. Missing configuration and edit behavior follow subsequent decisions. Payment failure retains the existing hold until its unchanged expiry under the subsequent decision.

- Q: How are fractional percentage fees and refunds rounded in SIMULATED VND? → A: Option A. Round to the nearest whole VND, with fractions of 0.5 VND or more rounded up. Calculate the cancellation fee as total paid minus the rounded refund so the two reconcile exactly.

- Q: Which currency does the simulated banking system use? → A: Option A. VND only for catalog quotes, card payments, balances, fees, refunds and transaction history. All remain explicitly labeled SIMULATED.

- Q: May an administrator correct a mistaken no-show? → A: Option B. An authorized administrator may restore the booking only if all required original inventory can be restored. Record complete correction history and charge nothing extra.

- Q: What happens to allocated inventory after administrator-confirmed no-show? → A: Option B. An authorized administrator identifies the portion still resellable and explicitly releases that portion. Elapsed or otherwise unresellable inventory retains its existing allocation. No-show produces zero refund or debit.

- Q: May an offering open for sale without a configured no-show grace period? → A: Option A. An administrator must explicitly configure a valid no-show grace period before opening the offering for sale. Explicit zero is valid. Missing configuration has no automatic zero fallback.

- Q: If no-show grace settings change between rescheduling review and payment, should the reviewed version remain valid? → A: Option A. Keep the no-show grace-policy version displayed for that request and adopt that exact immutable snapshot on successful rescheduling. Later edits apply to newly reviewed requests.

- Q: Which no-show grace policy applies after an administrator changes the configuration? → A: Option A. Use the immutable no-show grace snapshot saved when the current itinerary was booked or last successfully rescheduled. Later administrator changes do not alter that confirmed itinerary’s grace period.

- Q: May an administrator confirm no-show exactly when the grace period ends? → A: Option A. Permit confirmation when the authoritative server timestamp is greater than or equal to the confirmed departure/check-in instant plus the configured grace duration. Earlier attempts reject.

- Q: Which unit configures the no-show grace period? → A: Option A. Use nonnegative integer minutes. Each minute equals 60 elapsed seconds. Zero adds no waiting duration after the confirmed service start. The subsequent boundary decision permits confirmation at or after the grace end.

- Q: When may an administrator first confirm a no-show? → A: Option B. Each service has an administrator-configured grace period for late arrivals after the currently confirmed tour departure or hotel check-in. Administrator confirmation remains required after the grace period. Units and permitted values follow the subsequent nonnegative-integer-minutes decision. The subsequent decision resolves exact boundary behavior. Saved-version and review-validity behavior follows the accepted no-show snapshot decisions.

- Q: How is a traveler who does not attend and has not validly canceled treated? → A: Option B. An authorized administrator confirms no-show. No automatic no-show transition is triggered merely by the scheduled start time. No-show produces zero refund. The subsequent decision selects a per-service grace period. Its detailed timing, correction handling and inventory consequences require clarification.

- Q: Which cutoff-hour values may administrators configure? → A: Option A. Cancellation and rescheduling cutoffs use whole hours greater than or equal to zero. Zero requires the request strictly before departure/check-in.

- Q: May a service be sold before both cancellation and rescheduling cutoffs are configured? → A: Option A. Administrators must explicitly configure both cutoffs before opening each offering for sale. No automatic fallback cutoff is used.

- Q: Which timezone applies to cancellation and rescheduling cutoff calculations? → A: Option A. Always use Asia/Ho_Chi_Minh for all service departure/check-in times, cutoff calculation and deadline display.

- Q: Which unit configures cancellation and rescheduling cutoffs? → A: Option A. Use elapsed hours, with each hour equal to 60 minutes, measured backwards from the applicable service departure/check-in.

- Q: Which service start determines the voluntary cancellation deadline? → A: Option A. Calculate backwards from the departure time or hotel check-in time of the currently CONFIRMED itinerary, including the latest successful rescheduling, using its saved cancellation policy.

- Q: If the administrator updates cancellation policy between rescheduling review and payment, should the reviewed version remain valid? → A: Option A. Retain the cancellation policy version displayed for that rescheduling request and adopt that exact immutable snapshot on success. Later policy edits apply to newly reviewed requests.

- Q: After an administrator changes cancellation settings, which policy applies to an existing confirmed booking? → A: Option A. Use the cancellation policy snapshot saved when the current itinerary was booked or last successfully rescheduled. Later administrator edits do not retroactively change that accepted snapshot.

- Q: Should voluntary cancellation exactly at its cutoff deadline be rejected? → A: Option A. Accept only when the authoritative server-side cancellation request timestamp is strictly earlier than the cancellation cutoff deadline. Equality or later rejects. Client device clocks cannot determine eligibility.

- Q: Until when may travelers voluntarily cancel to receive the 65% refund? → A: Option B. Administrators configure a voluntary cancellation cutoff for each service. Its duration uses explicitly configured nonnegative whole hours in Asia/Ho_Chi_Minh and its saved-version behavior follows the accepted subsequent decisions. The subsequent decision establishes a strict server-time boundary.

- Q: When the administrator cancels because service cannot be provided, are all additional payments refunded? → A: Option A. Refund 100% of all successful linked SIMULATED payments, including the original booking amount, every rescheduling fee and every holiday-related charge. Retain zero cancellation fee.

- Q: For eligible voluntary cancellation after rescheduling, how are additional payments refunded? → A: Option A. Refund 65% of all successful SIMULATED payments for the booking, including the original payment, every rescheduling fee and every holiday-related charge. Retain 35% of that total as the SIMULATED cancellation fee.

- Q: How are replacement rooms matched to old rooms for holiday-night price comparisons? → A: Option A. The traveler explicitly pairs each replacement room with its corresponding current room. Use that old room’s recorded nightly prices and ordinal night matching. Unpaired new rooms follow the added-room policy.

- Q: Are removed hotel rooms refunded when rescheduling reduces the room count? → A: Option A. Removed rooms produce zero refund, credit or offset. Collect the full 20% of the original booking amount once per successful change, plus applicable proposed-itinerary holiday charges. Release removed-room allocations for resale only on successful atomic rescheduling.

- Q: How are additional rooms charged during hotel rescheduling? → A: Option B. For each additional room, charge the full quoted price only for its room-nights on official Vietnamese public holidays. Other room-nights have zero additional room charge. Collect the original-booking 20% fee once per successful change. Removed rooms produce no refund, credit or offset under the subsequent decision. Room matching follows the subsequent explicit traveler-pairing decision.

- Q: May hotel rescheduling change the number of rooms? → A: Option B. Travelers may increase or decrease room count, subject to inventory, occupancy validation, both strict cutoffs, explicit review and successful simulated payment. Added rooms follow the subsequent holiday-only decision. Removed rooms follow the subsequent no-refund decision. The subsequent traveler-pairing decision defines current/proposed room matching.

- Q: When shortening a hotel stay, are removed nights refunded? → A: Option A. Removed nights produce no refund, credit or offset. Collect the full 20% fee based on the original booking amount plus any applicable holiday charges for the proposed itinerary. Release removed-night inventory only on successful atomic rescheduling.

- Q: How should added hotel nights without an old matching night be charged? → A: Option B. Charge the full quoted price only for added nights whose new service date is an official Vietnamese public holiday. Added nonholiday nights incur zero additional night charge. Keep the single 20% original-booking rescheduling fee and matched-night holiday differences. Removed nights follow the subsequent no-refund decision.

- Q: May hotel rescheduling increase or decrease the number of nights? → A: Option B. Both longer and shorter stays are allowed, subject to availability, both strict cutoffs, explicit review and successful simulated payment. Added nights follow the subsequent holiday-only decision. Removed unmatched nights produce no refund, credit or offset under the subsequent decision. The original-booking 20% fee and holiday-only differences for ordinally matched nights remain applicable.

- Q: Which recorded hotel night price should each proposed night be compared with? → A: Option A. Match by ordinal position within the stay, first new night to first current night, second to second, and so on. Use recorded current-itinerary nightly prices. Longer and shorter stays are allowed under the subsequent decision. Removed nights receive no refund or credit. Room counts may increase or decrease under the subsequent decision. Removed rooms produce no refund, credit or offset under the subsequent decision. Room matching follows the subsequent explicit traveler-pairing decision. Additional rooms follow the subsequent holiday-only pricing decision. Added-night pricing follows the subsequent decision.

- Q: For a hotel stay spanning several nights, when does the holiday price difference apply? → A: Option B. Calculate positive differences only for the newly selected room-nights whose service dates are official Vietnamese public holidays. Nonholiday nights add zero difference. The fixed 20% original-booking fee applies once per successful rescheduling. Nightly matching follows the subsequent ordinal-position decision. Longer and shorter stays are allowed. Added/removed-night pricing follows the subsequent decisions. Room counts may increase or decrease under the subsequent decision. Removed rooms produce no refund, credit or offset under the subsequent decision. Room matching follows the subsequent explicit traveler-pairing decision. Additional rooms follow the subsequent holiday-only pricing decision.

- Q: How are seats or rooms selected when rescheduling, and when does the old selection become available to others? → A: Option A. The traveler explicitly selects available replacement seats/rooms. On successful atomic rescheduling and simulated payment, release the replaced old allocation so other travelers can see and select it for its original service date/time. Preserve the original allocation while the change is pending or fails.

- Q: How many successful reschedulings should be allowed per booking? → A: Option A. Unlimited successful reschedulings, subject on every change to both strict cutoff checks, available inventory, explicit review confirmation and successful simulated payment. Each change still charges 20% of the original booking amount plus the applicable holiday-only positive difference.

### Session 2026-11-06

- Q: Do you approve the complete Q1–Q3 decision package for final specification integration? → A: Option A. Approve all Q1 business/source-account policies, Q2 consent/retention/deletion rules and Q3 taxonomy/dataset/platform/quality/performance targets. The package is recorded in Accepted Completion Decisions and integrated into the governing FRs and success criteria. Delivery evidence remains subject to FR-019 and Constitution I/IX.

## User Scenarios & Testing *(mandatory)*

Priorities below order specification concerns, not an approved implementation schedule. First-release
platform coverage and final Q1–Q3 completion decisions are accepted in Clarifications. Each story is independently assessable using synthetic fixtures; prerequisite identity
or catalog fixtures may be supplied without implementing other stories. Tests described here are
future verification obligations, not claims of tests executed during this repository inspection.

### User Story 1 - Secure accounts and profiles (Priority: P1)

**Story ID**: US-01

As a traveler, I want to register, sign in, update my own profile and password, and sign out so that my bookings and conversations remain private.

**Why this priority**: Account access protects every personalized journey.

**Independent Test**: Exercise FR-001, FR-002, FR-013 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given two fixture accounts, when account A signs in and edits its profile, then only A changes; when A requests B’s private records or impersonates an admin, access is denied.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 2 - Discover destinations and services (Priority: P1)

**Story ID**: US-02

As a traveler, I want accurate destination, tour, and hotel information so that I can choose a trip without following misleading links.

**Why this priority**: Discovery is valuable independently of checkout.

**Independent Test**: Exercise FR-003, FR-004 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given a fixture destination with active and inactive services, when I browse and filter it, then only matching available catalog entries appear; an unknown destination shows not-found rather than a different place.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 3 - Recognize landmarks and cultural objects (Priority: P2)

**Story ID**: US-03

As a traveler, I want a photo landmark result or live result for the five approved cultural classes with its uncertainty explained so that I can learn about what I see.

**Why this priority**: Recognition differentiates the product; unsafe or unverified guesses reduce trust.

**Independent Test**: Exercise FR-005, FR-006, FR-007, FR-014 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given authorized nonpersonal images and recorded recognition outputs, when I request recognition, then landmark and cultural labels remain distinct; denial of permission, unknown objects, and provider outages produce explicit outcomes without unauthorized transfers.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 4 - Request a booking and understand payment state (Priority: P1)

**Story ID**: US-04

As a traveler, I want to review and explicitly confirm my booking and SIMULATED total before payment, receive a truthful reservation status, reschedule a CONFIRMED booking with a disclosed 20% SIMULATED fee, and understand cancellation refunds and fees so that I can make an informed choice.

**Why this priority**: False payment confirmation can cause direct user harm.

**Independent Test**: Exercise FR-008, FR-009, FR-020–FR-030 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given an active service, when I submit valid dates and quantities, then exactly one booking is recorded for one logical submission; a timeout does not establish payment success and a changed price requires review.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.
3. Given a payable booking, when I review checkout, then I see the offering, dates/times, guest count, applicable seats/rooms, total SIMULATED amount and 65% refund/35% fee policy; no payment proceeds until I explicitly confirm this exact summary. Changed details require renewed confirmation.
4. Given confirmed review, when payment and allocation succeed atomically, then exactly one booking becomes CONFIRMED; payment failure, expired holds or allocation failure leave no debit or confirmation.
5. Given an eligible confirmed booking with a SIMULATED charge of 100 units, when I voluntarily cancel, then 65 units are refunded and 35 units retained as a SIMULATED fee with linked history entries; retries do not refund or release inventory twice. Resellable inventory becomes available.
6. Given an administrator cancellation because service cannot be provided, when cancellation succeeds, then all successful linked SIMULATED charges, including rescheduling fees and holiday charges, are refunded in full with zero fee; unavailable service inventory is not offered for resale.

7. Given my CONFIRMED booking originally costing 100 SIMULATED units and an available new date/time at the same price, when I explicitly confirm the complete rescheduling review and payment succeeds, then exactly 20 additional SIMULATED units are charged, the booking uses the new slot, the original allocation is released only as part of the successful atomic change, and history links both schedules and the transaction.
8. Given a declined payment, insufficient balance, expired proposed hold, unavailable new slot or injected write failure, when rescheduling is attempted, then the original CONFIRMED booking and its allocation remain unchanged and no additional debit persists.
9. Given concurrent retries of one confirmed change, when responses are lost or requests repeat across clients, then exactly one change and one additional payment are recorded; conflicting changes from the same booking version cannot both commit.

10. Given an original amount of 100 SIMULATED units and a new itinerary priced 40 above the current itinerary, when I reschedule to an ordinary date, nonholiday weekend or nonholiday peak-season date, then only 20 is charged; if the new date is a Vietnamese public holiday in the relevant year's calendar, then 60 is charged. Review and history identify the holiday classification and applied difference. Lower prices yield zero holidayDifference, no refund or credit, and the full 20% fee remains payable.

11. Given either the currently confirmed itinerary or the proposed itinerary violates its own configured rescheduling cutoff, including any configured holiday-specific rule, when I attempt to change dates/times, then the request is rejected with a clear failing-deadline reason, my original CONFIRMED booking and inventory remain allocated, and my simulated balance is unchanged. Payment is attempted only if both cutoffs and inventory validation pass.

12. Given I explicitly select available replacement seats/rooms, when the change and SIMULATED payment commit successfully, then the selected new inventory is mine and the replaced old inventory becomes visible and selectable to other travelers for its original service dates/times. A pending or failed change retains my old selection.

### User Story 5 - Share travel experiences (Priority: P2)

**Story ID**: US-05

As a traveler, I want to publish travel posts and interact with approved content so that I can exchange experiences with other travelers.

**Why this priority**: Community discovery provides value without booking.

**Independent Test**: Exercise FR-010 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given pending, approved, and rejected fixture posts, when a traveler opens the public feed, then only approved content is visible; an unauthorized edit is rejected and a like toggle has no duplicate relationship.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 6 - Communicate and receive updates (Priority: P2)

**Story ID**: US-06

As a traveler, I want private conversations and accurate in-app notifications so that I can follow messages and travel activity.

**Why this priority**: Users need reliable updates and private communication.

**Independent Test**: Exercise FR-011, FR-012 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given two participants and an outsider, when a participant sends a message, then it persists and appears once to authorized participants; the outsider cannot read it, and notification read state survives reload.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 7 - Administer the travel system (Priority: P1)

**Story ID**: US-07

As an administrator, I want controlled catalog, booking, user, and post management so that travelers receive accurate information and moderated content.

**Why this priority**: Existing CMS functions need dependable authorization and shared state.

**Independent Test**: Exercise FR-015, FR-016, FR-027 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given an administrator and traveler, when each attempts the same moderation action, then only the administrator changes the resource; the traveler sees the resulting permitted state after reload and failures leave no false success.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### User Story 8 - Continue across platforms without losing existing behavior (Priority: P1)

**Story ID**: US-08

As a traveler using web, Android, or iOS, I want the same authorized account and travel records so that changing devices does not create conflicting data.

**Why this priority**: Mobile extends the system while protecting existing investment.

**Independent Test**: Exercise FR-017, FR-018, FR-019 with isolated fixtures and controlled dependencies.

**Acceptance Scenarios**:

1. Given a shared synthetic account, when an approved operation is performed on one supported client and refreshed on another, then the same persistent state appears; legacy routes and data remain available unless an approved migration explicitly changes them.
2. Given an unavailable dependency, when the operation fails, then the user sees a recoverable error and no false persisted or paid state.

### Edge Cases

Cover expired and blocked accounts; forged identities; another user's IDs; invalid/duplicate input;
unknown or deleted catalog entries; empty result sets; stale prices; zero/negative quantities;
past dates, checkout before check-in, date/time-zone boundaries; double taps, retries, and lost
responses; permission refusal and revocation; empty, oversized, corrupt, or unsupported images;
unknown/low-confidence recognition; missing provider configuration; external-service denial;
message reconnect, duplicates and out-of-order arrivals; unauthorized subscriptions; deleted linked
content; read/unread races; interrupted deletion; retention holds and backup restoration; rescheduling versus cancellation, concurrent rescheduling,
new-slot hold expiry, overlapping original/new hotel stays, stale availability/quotes, unchanged-slot
requests, fractional 20% fees, cheaper/dearer dates, and repeated changes.

## Requirements *(mandatory)*

### Repository Evidence and Current Capability Baseline

Inspection was static and local on 2026-11-04 across all five requested areas. Configuration secret
values, production data, image contents, and credentials were not needed or read for this review.
No application, provider, database, payment, or device test was run. Consequently no end-to-end
feature is classified as verified working.

Classification: **Implemented code, unverified** means a concrete code path exists without execution
evidence; **Partial** means disconnected, simulated, incomplete, or materially unsafe behavior was
observed; **Planned** means the required capability was not found in inspected active source.
A code-presence finding never proves correctness or production readiness.

| Capability | Existing evidence | Classification and gap | Proposed outcome |
| --- | --- | --- | --- |
| Account registration/login/profile/password | `frontend/src/context/AuthContext.jsx`; backend `AuthController.java` | Partial: account UI and persistence paths exist; passwords stored/compared directly; local user object does not prove authenticated authority | Secure account lifecycle and ownership checks |
| Destinations/discovery | `Landing.jsx` loads places; `DestinationDetail.jsx` uses `DESTINATIONS_DATA`; `PlaceController.java` lists/creates/deletes | Partial: unknown detail IDs fall back to Ha Long; static related services may diverge from CMS | Consistent catalog and explicit not-found states |
| Landmark recognition | `frontend/src/pages/Detection.jsx` calls FastAPI `/detect`; `ai-service/ai/main.py` uses Cloud Vision and Wikipedia enrichment | Implemented code, unverified: no accuracy, permission, or runtime evidence; supplementary Gemini routine exists but current detect path disables it | Authorized recognition with truthful provenance and unknown states |
| Backend AI endpoint | backend `AiController.java` uses filename heuristics | Partial simulation, not equivalent to FastAPI inference | Never present filename heuristics as genuine inference |
| Cultural object recognition | No YOLO integration or model training workflow found in inspected active code | Planned | Evaluated Vietnamese cultural object detection; Kaggle training governance |
| Tours/hotels | web booking list/detail pages; backend `TourController.java`, `HotelController.java` | Implemented code, unverified: active-item filters and CRUD paths exist | Accurate browse/detail behavior on approved platforms |
| Booking requests/history | `Payment.jsx`, `Profile.jsx`; hotel/tour booking controllers and entities | Partial: pending/approved/rejected paths exist; client-supplied identity and price; availability/concurrency rules not established | Authorized durable bookings with correct totals and state |
| Payments | `Payment.jsx` sets paid after booking request and a timer; random display reference | Partial simulation: no settlement or gateway confirmation path found | Truthful states; synthetic banking only under FR-020–FR-030 |
| Social feed | `Feed.jsx`; `PostController.java`, `FollowController.java`; post/like/comment/share/follow entities | Implemented code, unverified: moderation states and interaction paths exist; client identity accepted | Secure moderated social journeys |
| Messaging | `Messages.jsx`, message service; `ChatController.java`, `ChatWebSocketController.java`, `WebSocketConfig.java` | Partial: persistence and real-time paths exist; client sender identity and broad origins observed; privacy/reconnect not verified | Private authenticated messaging with replay/retry evidence |
| Notifications | web/admin pages and adapters; `NotificationController.java`; `ReminderService.java` | Implemented code, unverified: unread/read/delete and daily reminder code; CMS uses recipient 0; isolation/delivery not verified | Correct scoped in-app updates; push is unconfirmed |
| Admin CMS | `admin/src/App.jsx`, management pages and services; backend admin/user/settings/catalog/moderation controllers | Partial: routes/actions exist; client role checks do not establish server protection; destination detail not synchronized | Authorized administration with consistent traveler-visible state |
| Mobile | `apps/mobile/src/app/index.tsx`, `explore.tsx`, `_layout.tsx`, package manifest | Starter implemented; all TravelAI business journeys planned and unverified on Android/iOS | Approved traveler parity through existing services |
| Providers | inspected user roles are USER/ADMIN; no distinct provider account/ownership workflow found | Separate provider role excluded by accepted clarification | Administrators manage offerings under the confirmed first-release scope |
| Automated assurance | web/admin manifests have no test command; backend context-loading test only in inspected test source | Partial: no journey regression evidence or AI evaluation suite found | Test-first, requirement-traced verification |
| Other legacy surfaces | README describes planner; destination page links `/planner`; current `App.jsx` has no planner route; restaurant references remain | Partial/unsupported path, not proof of a functioning journey | Record for scope decision; preserve source without inventing replacement features |

Source paths above are relative to their named area; backend classes are under
`backend/src/main/java/com/travelai/backend/`. These findings are a dated baseline, not an assertion
that every file or potential integration has been exhaustively audited.

### Actors, Platform Scope, and Value

- Travelers need discovery, informed recognition, trustworthy bookings, account privacy, and social
  communication. Web, Android, and iOS are target traveler surfaces.
- Administrators need catalog accuracy, moderation, booking decisions, controlled user access, and
  reliable system status. Admin CMS is the administrative surface; native admin clients are not
  requested and are not assumed.
- Only USER (traveler) and ADMIN roles are required. Administrators manage tours and hotels.
  Separate provider accounts, provider self-service, ownership permissions, and payouts are outside
  first-release scope.

Platform notation: **W** = existing React Web; **A** = React Native Expo Android; **I** = React Native
Expo iOS; **C** = existing React Admin CMS. Existing Spring Boot business APIs, FastAPI AI services,
and repository-backed PostgreSQL choices are preservation constraints, not a new system design.
Confirmed first-release scope: accounts/profiles, destination discovery, landmark photo recognition,
tour/hotel discovery and booking/checkout, social feed, private messaging, and in-app notifications
MUST be delivered on W/A/I. Live YOLO cultural object detection MUST be delivered on A/I; live Web
YOLO detection is outside the first-release requirement. Existing C management functionality MUST
be retained. Only USER/ADMIN roles are required; administrators manage offerings. Checkout MUST use the
synthetic banking/card simulation in FR-020–FR-030, without real money or a real gateway.

Acceptance: the versioned acceptance journeys for FR-001–FR-005, FR-008–FR-012 and applicable
FR-013–FR-030 MUST pass on their assigned platforms; FR-006 live-camera journeys MUST pass on A/I. Applicable CMS
journeys MUST pass on C. Missing any assigned platform blocks first-release acceptance.

### Functional Requirements

Every FR is mandatory for its confirmed scope. “All cases” refers to a versioned acceptance suite covering the normal, error and edge cases specified for that FR. Accepted Completion Decisions Q1–Q3 define the final business, privacy, platform and measurement policies. Delivery acceptance requires executed evidence under FR-019.

#### FR-001 — Secure account lifecycle

**User story**: US-01, as stated above.

**Supported platforms**: W/A/I; C administrator login.

**Requirement and user value**: Travelers and administrators MUST be able to sign in and out; travelers MUST be able to register with the existing email/password journey.

**Measurable acceptance criteria**: With a synthetic active, blocked, duplicate-email, and incorrect-password fixture, valid credentials grant only the assigned role; all invalid cases are rejected; sign-out prevents further protected operations; no password appears in responses or logs.

**Accepted session policy and tests**

A session MUST expire seven days after issuance or after 24 hours of inactivity, whichever occurs first. Authoritative server time MUST enforce both boundaries. Logout revokes the affected session and password change or account blocking revokes existing sessions for that account. Recovery, verification and SSO are outside the required release scope. Automated controlled-clock tests MUST cover one second before, exactly at and after both expiry boundaries, logout, password change, blocking and attempts across Web/Android/iOS/Admin sessions. Expired or revoked sessions reject protected requests without unauthorized mutation.

**Errors and edge cases**: Duplicate submission, expired authentication, blocked account, malformed email, unavailable service.

**Verification approach**: Automated account journey and unauthorized-access tests; inspect hashed password persistence with synthetic records.

**Existing versus proposed / dependencies**: Existing partial behavior to secure. The accepted session policy above defines release scope and expiry.

#### FR-002 — Owned profiles and password updates

**User story**: US-01, as stated above.

**Supported platforms**: W/A/I; C only authorized user management.

**Requirement and user value**: Travelers MUST read/update their own permitted profile fields and change their password without changing another account or elevating roles.

**Measurable acceptance criteria**: Update persists after reload across supported clients; wrong current password and mismatched confirmation change nothing; forged IDs/role fields cannot modify another account or privileges.

**Errors and edge cases**: Missing user, invalid fields, concurrent edit, failed save.

**Verification approach**: Profile unit/integration tests and cross-account negative tests.

**Existing versus proposed / dependencies**: Existing partial behavior. Account deletion and session revocation follow FR-014 and FR-001.

#### FR-003 — Destination discovery

**User story**: US-02, as stated above.

**Supported platforms**: W/A/I; C catalog management.

**Requirement and user value**: Travelers MUST discover catalog destinations and view details that correspond to the selected record.

**Measurable acceptance criteria**: Each fixture destination opens matching name/location/details; unknown/deleted IDs show not-found; an empty catalog shows an explicit empty state rather than perpetual loading or fabricated content.

**Errors and edge cases**: No results, unavailable catalog, malformed/deleted ID.

**Verification approach**: Catalog contract tests and list-to-detail journey tests.

**Existing versus proposed / dependencies**: Existing dynamic list and static details require reconciliation.

#### FR-004 — Tour and hotel discovery

**User story**: US-02, as stated above.

**Supported platforms**: W/A/I; C catalog management.

**Requirement and user value**: Travelers MUST browse, search/filter, and view active tour and hotel offerings associated with accurate locations.

**Measurable acceptance criteria**: For a fixture catalog, searches and supported location filters return exactly matching active entries; clearing filters restores the set; selected details match the record and current displayed price; inactive/deleted entries are not bookable.

**Errors and edge cases**: Empty results, stale related service, missing image, invalid link.

**Verification approach**: Fixture-based filtering, contract, and navigation tests.

**Existing versus proposed / dependencies**: Existing code paths unverified; provider inventory portal not assumed.

#### FR-005 — Landmark recognition

**User story**: US-03, as stated above.

**Supported platforms**: W/A/I; C no inference workflow assumed.

**Requirement and user value**: Travelers MUST submit authorized nonpersonal photos for landmark recognition and receive a named candidate or explicit unknown/unavailable result with provenance and uncertainty.

**Measurable acceptance criteria**: Known fixture outputs show the corresponding candidate; unknown and missing-confidence outputs never invent certainty; unsupported/empty/oversized/corrupt files are rejected before provider transfer; no authorization means zero outbound recognition/enrichment transfers. Quality and turnaround MUST meet the approved evaluation bounds below.

**Approved landmark evaluation**

Use a versioned evaluation manifest with at least 200 licensed nonpersonal known-landmark images and 200 unknown/negative images with independently reviewed ground truth. Top-1 accuracy on known images MUST be at least 0.90. The false-known rate on unknown/negative images MUST be at most 0.05. Landmark response latency MUST be at p95 at most five seconds under the FR-019 controlled acceptance load/network conditions. Automated evaluation MUST report counts, dataset/source versions, ground truth, errors and latency evidence. Transfers and input disposal MUST follow FR-014.

**Errors and edge cases**: Low confidence, ambiguous scene, provider timeout, missing configuration, canceled upload.

**Verification approach**: Controlled provider doubles, outbound-transfer assertions, versioned landmark evaluation after approval.

**Existing versus proposed / dependencies**: Existing Cloud Vision path requires the approved FR-014 privacy rules and measured quality/latency evidence before delivery acceptance.

#### FR-006 — Live Vietnamese cultural object recognition

**User story**: US-03, as stated above.

**Supported platforms**: A/I mandatory; W live detection outside first-release scope; C no live detection workflow.

**Requirement and user value**: Travelers MUST be able to recognize the approved Vietnamese cultural object classes specified below in a live camera session and see localized object positions, class labels, and uncertainty.

**Measurable acceptance criteria**: Authorized supported camera frames produce class/position outputs under the approved per-class quality, frame-rate, and end-to-end delay thresholds; unknown objects are not forced into known classes; stopping/revoking camera access stops capture and transmission.

**Approved cultural classes and runtime gates**

The required initial classes are nón lá, áo dài, trống đồng, Vietnamese lantern and tuồng mask. A held-out versioned evaluation set MUST contain at least 200 independent images per class plus 200 unknown/negative examples, with representative conditions and recorded label definitions/source rights. Cultural detection MUST reach mAP@0.5 of at least 0.75 and per-class precision of at least 0.85 and recall of at least 0.80. On each FR-017 reference device, live detection MUST sustain at least ten processed frames per second and p95 capture-to-result latency at most 300 milliseconds under FR-019 test conditions. Automated evaluation MUST report per-class metrics, unknown failures and runtime measurements. Training/tuning and evaluation data MUST remain separate.

**Errors and edge cases**: Permission denial/revocation, no camera, poor lighting, multiple objects, unsupported device, lost connection.

**Verification approach**: Permission lifecycle tests, recorded-frame evaluation, target Android/iOS device measurements.

**Existing versus proposed / dependencies**: Planned YOLO capability. Class scope, quality and runtime targets are accepted. Delivery requires independent dataset and reference-device evidence.

#### FR-007 — Model provenance and release eligibility

**User story**: US-03, as stated above.

**Supported platforms**: W/A/I recognition outcomes; training governance shared.

**Requirement and user value**: Recognition releases MUST use approved, reproducible model/evaluation artifacts and distinguish cultural object detection from landmark recognition.

**Measurable acceptance criteria**: Each promoted cultural model links to permitted dataset origins, class definitions, independent test split, versioned artifact/configuration/dependencies/seeds, Kaggle run evidence, per-class precision/recall and mAP, runtime evidence, and rollback version; missing evidence blocks promotion.

**Approved promotion evidence**

The evaluation manifest MUST include all accepted FR-005/FR-006 classes, sample counts, licenses, ground truth and independent held-out splits. Promotion MUST require the accepted landmark accuracy/unknown thresholds and cultural per-class/mAP/runtime gates on FR-017 reference devices. Automated artifact/evaluation tests MUST reject a missing class, insufficient independent samples, missing license or a failed threshold. Record Kaggle training provenance and model rollback version. Dataset transfers remain subject to FR-014 scoped approval.

**Errors and edge cases**: License unavailable, test leakage, unsupported class, quality regression, artifact mismatch.

**Verification approach**: Artifact/provenance review, reproducibility checks and independent model evaluation.

**Existing versus proposed / dependencies**: Planned training workflow; Kaggle is not a live inference dependency; FR-005/FR-006 define the accepted promotion bounds.

#### FR-008 — Durable tour and hotel bookings

**User story**: US-04, as stated above.

**Supported platforms**: W/A/I; C authorized booking decisions.

**Requirement and user value**: Travelers MUST submit valid booking requests, receive a durable reference, and see their own booking history and actual booking status. Owners MUST also be able to request date/time changes to their CONFIRMED bookings under FR-028–FR-030.

**Measurable acceptance criteria**: Valid dates and positive integer quantities create one record for one logical submission; retries do not duplicate it; displayed total equals the authoritative quote; tampered client prices cannot lower it; booking, hold and payment states survive reload. Unpaid or failed-payment bookings never become confirmed. CONFIRMED occurs only on successful simulated payment and atomic inventory allocation after explicit traveler review confirmation (FR-026); no additional administrator approval gates confirmation. Unknown result after timeout is not labeled success.

**Final eligibility and source-account policy**

An eligible voluntary cancellation is an owned CONFIRMED booking with an authoritative request before its saved cancellation deadline and no previously committed cancellation. Resellable future allocations MUST return to availability atomically when the service remains on sale. All original/additional payments for the booking MUST use the one source account under FR-020. Automated tests MUST reject cross-account requests, expired eligibility and duplicate finalization with zero unauthorized debit/refund or inventory mutation.

**Errors and edge cases**: Past dates, invalid check-out, unavailable offering, price change, concurrent requests, excessive quantities.

**Verification approach**: Booking calculation/validation, retry and concurrency tests plus history journey tests.

**Existing versus proposed / dependencies**: Existing partial behavior; limited inventory and payment prerequisite are mandatory under FR-020–FR-030. Confirmation, cancellation cutoffs, rescheduling and refund amounts are resolved by the accepted decisions. Final eligibility and the single source account are defined below and in FR-020/FR-027.

#### FR-009 — Truthful payment state

**User story**: US-04, as stated above.

**Supported platforms**: W/A/I; C only approved reconciliation visibility.

**Requirement and user value**: Travelers MUST see payment state separately from booking state; payment success MUST require an authoritative successful transaction in the simulated banking system. Real money and real payment gateways MUST NOT be used.

**Measurable acceptance criteria**: A booking response, timer, random client reference, or browser redirect alone never establishes settlement; failed/canceled/unknown payment is shown accurately; retries do not create multiple charges. Every card-entry, payment-result and receipt screen MUST state that payments are simulated and no real money moves; Mastercard-style presentation MUST NOT imply a live Mastercard integration.

**Errors and edge cases**: Lost callback, duplicate event, wrong amount/currency, abandonment, refund request.

**Verification approach**: Payment-state unit tests and controlled success/failure/duplicate/timeout scenarios for the selected mode.

**Existing versus proposed / dependencies**: Current timer-based payment UI is not the required banking simulation. FR-020–FR-030 are mandatory new scope; accepted lifecycle and single-source account rules apply. VND-only simulated currency is confirmed; FR-025–FR-027 define confirmation and refund amounts.

#### FR-010 — Moderated travel feed

**User story**: US-05, as stated above.

**Supported platforms**: W/A/I; C moderation.

**Requirement and user value**: Travelers MUST create and manage their own travel posts and like, comment, share, and follow within existing moderation rules.

**Measurable acceptance criteria**: A new/edited post follows the approved pending flow; public feed excludes pending/rejected posts; authorized approval exposes it and rejection does not; unauthorized edits fail; like/follow toggles leave at most one relationship and consistent counters after reload.

**Accepted audience and deletion policy**

Approved feed content MUST be visible to signed-in active travelers. Author edits MUST return the edited post to pending moderation before its edited content becomes public. Unauthorized/blocked readers cannot bypass the audience rule. Posts, comments and related social records follow FR-014 source-content/account deletion rules. Automated tests MUST cover audience access, author edit returning to pending, renewed approval and deletion propagation.

**Errors and edge cases**: Empty content, deleted source post, duplicate interaction, failed moderation, unavailable feed.

**Verification approach**: Post lifecycle, moderation/ownership, relationship and counter integration tests.

**Existing versus proposed / dependencies**: Existing code requires the accepted audience/moderation behavior and FR-014 retention/deletion evidence.

#### FR-011 — Private real-time messaging

**User story**: US-06, as stated above.

**Supported platforms**: W/A/I; C access to traveler conversations not assumed.

**Requirement and user value**: Authenticated travelers MUST exchange persisted private messages with permitted recipients and load authorized conversation history.

**Measurable acceptance criteria**: Two authorized participants receive each accepted message once with a persistent identity and consistent order; reconnect restores persisted history without duplicate display; outsider history access and subscriptions fail; spoofed sender identity is rejected. Delivery time MUST meet the accepted latency rule below.

**Accepted recipient, retention and latency rules**

Any two active USER accounts may exchange messages. Only the participants may read messages or subscribe to their private conversation. Message retention is a rolling 12 months under FR-014. Delivery to an online authorized participant MUST complete at p95 within two seconds under FR-019 controlled load/network conditions. Automated tests MUST cover active recipients, blocked/inactive/anonymous denial, outsider subscriptions, deletion/expiry and latency with reconnect/retry integrity.

**Errors and edge cases**: Offline receiver, disconnect during send, retry, empty text, blocked account, deleted participant.

**Verification approach**: Two-session journey, persistence/reconnect tests and unauthorized subscription/access tests.

**Existing versus proposed / dependencies**: Existing partial code requires the accepted active-user recipient rule and FR-014 retention evidence.

#### FR-012 — Scoped in-app notifications

**User story**: US-06, as stated above.

**Supported platforms**: W/A/I; C authorized administrative notifications.

**Requirement and user value**: Users MUST receive applicable in-app activity/booking/message updates and manage their own read state; administrators MUST see only authorized administrative updates.

**Measurable acceptance criteria**: One fixture event produces the expected scoped item; read/read-all persists and unread count equals unread items after reload; another user cannot list, read or delete it; reminder boundary/retry cases do not duplicate the same scheduled event.

**Accepted events and reminders**

Required traveler in-app events are booking confirmation, successful rescheduling, cancellation/refund, no-show/correction and incoming messages. Service reminders MUST occur 24 hours and one hour before the currently confirmed departure/check-in in Asia/Ho_Chi_Minh. Schedule only triggers still in the future at confirmation. Successful rescheduling MUST supersede reminders for the old itinerary. Each booking/itinerary/trigger emits at most once under retries and concurrent scheduling. Administrative notifications remain scoped to ADMIN. Native push, email and SMS are outside required release scope. Derived notifications follow their linked source event's FR-014 retention/deletion limits and recipient deletion.

Controlled-clock tests MUST cover both triggers, confirmation inside each window, trigger equality at confirmation, rescheduling supersession, duplicate dispatch and no-show/cancellation events. Assert one authorized in-app update per applicable event and no stale reminder for replaced itineraries.

**Errors and edge cases**: Duplicate event, missing target, time-zone boundary, stale count, service failure.

**Verification approach**: Notification ownership/counter tests, event integration tests and controlled-clock reminder tests.

**Existing versus proposed / dependencies**: Existing code requires the accepted in-app event/reminder rules, scoped access and retention evidence.

#### FR-013 — Authorization and sensitive-information protection

**User story**: US-01/US-07, as stated above.

**Supported platforms**: W/A/I/C and shared services.

**Requirement and user value**: Protected operations MUST enforce authenticated roles and resource ownership; credentials and private data MUST be securely stored and excluded from unauthorized responses and logs.

**Measurable acceptance criteria**: All protected-operation test cases reject anonymous, forged-role and cross-account requests; HTTP and real-time channels enforce the same authority; password records use adaptive hashes; synthetic-secret scanning finds zero leaked values in delivered clients, artifacts, logs and fixtures.

**Errors and edge cases**: Expired session, revoked role, manipulated identifiers, permissive origin, accidental debug output.

**Verification approach**: Role/ownership matrix tests, configuration/security review and synthetic-secret scanning.

**Existing versus proposed / dependencies**: Mandatory remediation of observed direct password comparison and identity-trust gaps; runtime configuration never exposed.

#### FR-014 — External transfer authorization, retention and deletion

**User story**: US-01/US-03/US-05/US-06, as stated above.

**Supported platforms**: W/A/I/C and all data flows.

**Requirement and user value**: All external transfers MUST have explicit approved destination/purpose/data scope; prohibited production/private inputs MUST never reach AI services; users MUST have the approved retention/deletion policy explained and honored.

**Measurable acceptance criteria**: Denied/missing approval produces zero outbound transfers, including enrichment, telemetry and remote media requests carrying user data; test fixtures are synthetic/anonymized. For every data category, the category-specific retention limit and deletion deadline below are tested with a controlled clock, including replicas/backups and permitted holds; revoked permission stops subsequent transfers.

**Approved category retention and deletion**

| Data category | Required retention/deletion rule |
| --- | --- |
| Account/profile | Retain while the account is active. Requested deletion removes active personal data within 30 days. |
| Posts and dependent social records/media | Retain until deletion. Remove requested active records/media within 30 days and propagate source/account deletion to dependent records. |
| Conversation messages | Rolling 12-month retention limit. Requested active personal-record deletion completes within 30 days. |
| Recognition input | Discard after inference completes, including terminal error/cancellation cleanup. |
| Recognition metadata | 30-day retention limit with account/source deletion propagated. |
| Booking, SIMULATED ledger/refund and linked audit history | Retain for 12 months after service end or terminal cancellation, whichever is later. Requested deletion removes/anonymizes personal references within 30 days while preserving accounting/referential integrity. |
| Other administrative audit events | Apply the approved 12-month audit retention to their own event timestamp where no booking service/cancellation anchor exists. |
| Notifications and derived activity records | Inherit linked source-event retention/deletion and recipient deletion. Retention cannot exceed the applicable source/account limit. |
| Backup copies | Expire residual copies within a further 30 days after active deletion, with a maximum 60 days from the deletion request. Restore reapplies deletion records before access. |

All derived copies and logs MUST follow the associated category rules and exclude secrets. No unspecified retention hold may extend the limits. A future hold requires explicitly accepted scope and duration. Automated controlled-clock tests MUST cover every category at its deadline, source/account deletion, anonymized ledger links, backup expiry, restore replay and revocation.

**Approved transfer and consent scope**

External inference MUST require explicit user action and consent naming destination, purpose and input scope. Google Cloud Vision may receive authorized nonpersonal landmark images. Self-hosted FastAPI/YOLO may receive approved nonpersonal inference inputs. Personal images and account/payment/private production data remain prohibited AI-service inputs. Revocation MUST stop subsequent transfers. Wikipedia, Wikimedia, supplementary AI enrichment, external telemetry and remote-media transfers carrying user data remain disabled until separately approved. Kaggle receives only licensed or author-owned nonpersonal training/evaluation data after separate scoped transfer approval. Tests MUST use synthetic/anonymized fixtures and controlled provider doubles. Automated outbound-interception tests MUST prove zero transfers for denied/revoked consent, disabled destinations or prohibited inputs.

**Errors and edge cases**: Mixed personal/nonpersonal image, location metadata, withdrawn consent, backup restore, partial deletion, legal hold.

**Verification approach**: Outbound interception tests, redaction tests, retention/deletion job tests and policy traceability review.

**Existing versus proposed / dependencies**: Approved periods, deletion deadlines and transfer rules are specified above. External data transfer requires its applicable scoped consent.

#### FR-015 — Authorized Admin CMS management

**User story**: US-07, as stated above.

**Supported platforms**: C; W/A/I observe resulting authorized state.

**Requirement and user value**: Administrators MUST manage supported users, destinations, tours, hotels, bookings, posts, notifications, and existing settings without granting those powers to travelers.

**Measurable acceptance criteria**: For each existing management action, an administrator can perform the permitted operation and observe the persisted result; traveler/anonymous attempts fail; failed actions do not show success; approve/reject state agrees with traveler history/feed after reload.

**Sale-readiness acceptance criteria**

An offering MUST have four valid explicit policy configurations before opening for sale or accepting new bookings, namely cancellation cutoff, rescheduling cutoff, no-show grace period and pending-payment hold timeout. Administrators MUST see which configuration is missing or invalid. Shared business rules MUST reject direct open-sale or new-booking requests that bypass this gate, with zero payment or inventory allocation. This also applies to existing catalog offerings lacking any of these four policies. Valid existing confirmed itineraries retain their saved policies. Automated CMS/API and W/A/I acceptance tests MUST cover every missing-policy combination, invalid configured values, all four valid policies and concurrent sale/configuration changes. Only the all-four-valid case can pass this gate. Explicit no-show grace of zero satisfies configuration validation, while missing grace does not. Assert no new charge or inventory allocation when sale/new booking is rejected.

**Holiday calendar administration and tests**

Authorized administrators MUST be able to manually create/update and approve year-specific Vietnamese public-holiday calendar versions with official references. Only approved versions may drive holiday classification/payment calculations. Automated authorization, calendar-validation, integration and CMS/W/A/I tests MUST cover draft/approved versions, unauthorized edits/approval, missing source/year/version, Tết and official arrangements in controlled fixtures, cross-year dates and immutable historical evidence. Show an actionable administrative error when the required approved year coverage is unavailable. These tests use controlled calendar fixtures and make no external service requests.

**Hotel check-in and checkout hours**

Administrators MUST configure check-in and checkout local times separately for each hotel in Asia/Ho_Chi_Minh. Authorized clients MUST show these times with the selected arrival/departure dates before booking or rescheduling confirmation. Shared business rules MUST combine the selected dates and applicable hotel times to derive check-in/checkout instants. Cancellation and current/proposed rescheduling cutoffs and no-show grace eligibility MUST use the corresponding confirmed/proposed check-in instant. Room-night inventory continues to follow [checkInDate, checkOutDate). Record the accepted itinerary times and timezone with booking and history evidence. Administrator edits MUST preserve the accepted saved check-in/checkout times of existing confirmed itineraries and their derived deadline/no-show anchors. New booking/rescheduling reviews use the hotel hours effective for that review and MUST display them before explicit confirmation. Success MUST save exactly those displayed hours and resulting dated instants as immutable itinerary evidence, even if settings change before payment. Failed/rejected changes preserve the existing saved times, policy snapshots and derived instants. Newly reviewed requests use the updated settings. Retain accepted hours, dates, timezone and configuration reference/version in history.

Automated configuration, authorization, API/integration and W/A/I/C acceptance tests MUST cover two hotels with different check-in/checkout times, review disclosure, Asia/Ho_Chi_Minh conversion, invalid or missing local times and client-supplied time tampering. Verify that each hotel’s check-in generates the correct cancellation deadline, both rescheduling deadlines and no-show eligibility instant under its saved policies. Changing the proposed hotel stay dates MUST recompute proposed instants before confirmation. Rejected requests and failed payment MUST preserve the original itinerary, allocations and balance.

**Errors and edge cases**: Missing record, stale edit, failed write, invalid role/status, removal of referenced data.

**Verification approach**: Admin role matrix, management contract tests and CMS-to-traveler consistency tests.

**Existing versus proposed / dependencies**: Existing partial CMS; provider management, new analytics, and new business controls not assumed.

#### FR-016 — Administrative accountability and destructive-action gates

**User story**: US-07, as stated above.

**Supported platforms**: C and all maintenance workflows.

**Requirement and user value**: Sensitive administrative actions MUST be attributable to an authorized actor, and destructive changes MUST require explicit approval before execution.

**Measurable acceptance criteria**: Each tested sensitive mutation has actor/action/target/time/outcome evidence without secrets; a destructive action without approval changes zero records; approving one action does not authorize unrelated deletion; protected references are handled under FR-014 approved retention/deletion and audit rules.

**Errors and edge cases**: Double confirmation, expired approval, audit failure, dependent records, concurrent removal.

**Verification approach**: Audit-event and approval-gate tests; destructive scenarios use synthetic disposable data only.

**Existing versus proposed / dependencies**: Constitution-derived requirement; FR-014 defines the accepted audit retention and deletion semantics.

#### FR-017 — Cross-platform compatibility and accessibility

**User story**: US-08, as stated above.

**Supported platforms**: W/A/I; C for administrative journeys.

**Requirement and user value**: Confirmed traveler journeys MUST provide equivalent authorized outcomes on web, Android and iOS; CMS MUST retain administrative functionality.

**Measurable acceptance criteria**: The same versioned fixture journeys pass on every assigned platform; an update made on one is reflected on another after refresh; permission denial/offline states are explicit; primary controls have accessible names and complete flows can be exercised with applicable keyboard/screen-reader navigation.

**Approved platform and reference-device matrix**

Required Web/Admin browser acceptance covers the current and preceding major Chrome, Edge, Firefox and Safari versions at release. Mobile acceptance covers Android 10 or later and iOS 16 or later. Record exact released OS/browser versions used for each acceptance run. Recognition reference devices are an Android Snapdragon 778G device with 6 GB RAM and an iPhone 12. Automated parity/permission/accessibility journeys MUST pass every assigned platform. FR-005/FR-006 performance measurements MUST pass on each reference device under FR-019 conditions. Tests MUST record device/OS, application, model and network versions with the result.

**Errors and edge cases**: Platform-specific camera absence, token expiry, network switch, unsupported device, missing content.

**Verification approach**: Platform acceptance matrix, accessibility checks, cross-client state and contract tests.

**Existing versus proposed / dependencies**: Mobile currently starter-only; the approved browser/OS/reference-device matrix above and FR-019 performance gates define required acceptance.

#### FR-018 — Preservation and evidence-based migration

**User story**: US-08, as stated above.

**Supported platforms**: W/A/I/C and shared services.

**Requirement and user value**: Existing source, local work, data and valid user journeys MUST be preserved through incremental changes that reuse current business and AI services.

**Measurable acceptance criteria**: An approved baseline of legacy routes, data and service consumers is recorded; all required baseline regression cases pass; every intentional incompatible change has user-approved impact, migration and rollback evidence; no unrelated local change is overwritten.

**Errors and edge cases**: Undocumented consumer, removed route, stale documentation, migration failure, partial rollback.

**Verification approach**: Baseline inventory review, consumer/regression tests and synthetic migration/rollback exercise when applicable.

**Existing versus proposed / dependencies**: Spring Boot/FastAPI preserved; database/infrastructure choices validated against repository; no wholesale rewrite.

#### FR-019 — Test-first verification and convergence reporting

**User story**: US-08, as stated above.

**Supported platforms**: All development stages and W/A/I/C delivery.

**Requirement and user value**: Every implementation task MUST reference requirements, dependencies, acceptance criteria and verification; completion and convergence MUST be supported by passing evidence.

**Measurable acceptance criteria**: Acceptance tests precede behavior; relevant tests run after each task; failing/skipped required tests keep tasks incomplete; unchecked required checklist items stop affected work pending clarification/approval; CONVERGED requires every mandatory confirmed requirement linked to passing current-code evidence, otherwise NOT CONVERGED lists blockers.

**Approved operating acceptance and measurement conditions**

Measure performance with 50 simultaneous synthetic users over a ten-minute run on a controlled connection of at least 20 Mbps and 50 ms round-trip delay. Record server, application, model, dataset, device and network conditions, including latency sample counts and p95 results. All financial/inventory concurrency runs MUST preserve the stated invariants and contain zero required failing cases.

| Journey | Required bound |
| --- | --- |
| Ordinary API operations | p95 at most two seconds |
| Booking/payment/refund/rescheduling | p95 at most three seconds |
| Online authorized message delivery | p95 at most two seconds |
| Landmark request | p95 at most five seconds |
| Live cultural detection on each reference device | At least ten processed frames/second and p95 capture-to-result at most 300 ms |

Automated unit/integration, journey and evaluation suites MUST trace all FR-001 through FR-030 acceptance criteria to the exact reviewed application/model state. Provider outages, malformed inputs, unknown recognition, permission refusal and offline states MUST exercise each FR's failure behavior. Routine external providers use controlled doubles. Paid/live external evaluations require separate scoped approval under FR-014. Test definitions and targets are accepted here. Executed delivery evidence remains required to complete the feature-outcomes checklist item.

**Errors and edge cases**: Missing artifact, stale test run, critical ambiguity, failed check, unapproved exception.

**Verification approach**: Cross-document traceability review and task/test evidence audit; all eleven constitution principles checked at each gate.

**Existing versus proposed / dependencies**: This document is specification only; no implementation task or convergence claim is made.

#### FR-020 — Synthetic banking records

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I checkout and own history; C authorized management; shared simulated banking data.

**Requirement and user value**: The system MUST maintain a simulated banking database containing synthetic test accounts, test cards, test CVVs, simulated balances and transaction history. It MUST NOT store real card numbers or real CVVs or use real gateways.

**Measurable acceptance criteria**: Known synthetic fixtures load with the expected balance/card/account relationship; unrecognized card details are rejected without persistence; real/unrecognized inputs are never echoed into logs, telemetry or stored payloads; users cannot read other users’ balances/cards/history. Every accepted charge/refund has an immutable transaction reference and attributable account/booking linkage.

**VND-only currency acceptance criteria**

All catalog quotes, synthetic bank balances, original/additional payments, fees, refunds and transaction history MUST use VND. Every monetary display MUST identify VND and SIMULATED. Shared business rules MUST reject non-VND payment/refund requests or quote/account currency mismatches with zero balance, ledger, booking or inventory mutation. Accepted transactions MUST retain the VND currency with their amount and linked references. Earlier numerical acceptance examples expressed as SIMULATED units denote SIMULATED VND. Percentage calculations MUST use the whole-VND half-up rule below.

Automated unit, API/integration and W/A/I/C acceptance tests MUST cover VND fixtures, currency labels on quote/review/result/history, non-VND and tampered currency rejection, and consistent currency across successful charges, fees and refunds. Currency-invalid retries and concurrent requests MUST have zero financial/inventory effects.

**SIMULATED VND rounding and acceptance criteria**

Round calculated percentage amounts to the nearest whole VND, rounding fractions of 0.5 VND or more upward. Calculate each rescheduling fee once from the original booking amount at 20%, then round that fee. Calculate the 65% voluntary refund once on the aggregate successful-payment cancellation basis, then round the refund. The retained cancellation fee MUST equal that basis minus the rounded refund, ensuring exact reconciliation. A 100% administrator refund equals the successful-payment basis exactly. Quote, confirmation, debit/credit, receipt and history MUST use identical authoritative rounded values. Arithmetic MUST preserve exact percentage and half-unit decisions across retries and concurrent requests.

Automated unit and ledger/contract tests MUST include original amounts 101, 102 and 103 VND producing 20%, rounded fees 20, 20 and 21 VND respectively. A voluntary cancellation basis of 101 VND produces refund 66 and retained fee 35. A basis of 110 VND produces the exact half-unit case 71.5, rounded refund 72 and retained fee 38. Test aggregate rather than per-charge rounding, exact reconciliation, repeated changes, retries, balances and administrator full refunds. All monetary UI continues to identify SIMULATED VND.

**Single source-account banking and tests**

All original and rescheduling payments for one booking MUST debit the same traveler-owned SIMULATED bank account. The authoritative initial successful charge establishes that source account. Another registered ACTIVE, unexpired synthetic card attached to the same account may pay an additional charge. A different account MUST reject before debit or completed booking/inventory change. Every charge/refund MUST retain the booking/source-account linkage. All eligible cancellation refunds credit that one source account even if its cards later expire or become nonpayable.

Automated ownership/integration and W/A/I/C tests MUST cover same-account replacement cards, multiple successful rescheduling payments, foreign/different-account attempts, account-identifier tampering, failed attempts, concurrent charges and retries. Verify aggregate rounded voluntary refunds and full administrator refunds reconcile to the one recorded source account and at most one effective refund.

**Errors and edge cases**: Unknown card, real-looking unregistered input, forged account ownership, accidental logging.

**Verification approach**: Synthetic fixture and ownership tests; request/log/storage inspection with synthetic sentinels; no real card testing.

**Existing versus proposed / dependencies**: New explicit user requirement. Separate logical simulation data is mandatory; physical database topology is a planning decision, not permission to replace existing persistence.

#### FR-021 — Simulated card validation and disclosure

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I; shared simulated banking validation.

**Requirement and user value**: Checkout MUST provide realistic Mastercard-style card entry using only registered synthetic cards/CVVs, validate details and expiry, ACTIVE card status, available balance and transaction status, and clearly disclose simulation.

**Measurable acceptance criteria**: Wrong synthetic number/CVV, expired card, insufficient balance and nonpayable status each fail with zero debit and no confirmation. A valid payable synthetic card can proceed; card entry, processing, result and receipt all display SIMULATED and that no real money moves. Every displayed card payment, balance, fee and refund, including history and CMS views, MUST be explicitly labeled SIMULATED. No live card network is contacted.

**Synthetic card status and automated tests**

Only a registered synthetic card with authoritative status ACTIVE MUST be permitted to pay for initial bookings or rescheduling, subject to all other validation. Locked, suspended, closed, unknown or missing card status MUST reject with a clear reason, zero debit and no booking confirmation or completed rescheduling. Status supplied by the client cannot establish authority. Validate card status transactionally with the debit so a concurrent status edit and charge produce a consistent committed result. A rejected attempt follows FR-024 hold-retention rules without extending expiry and preserves original confirmed inventory during rescheduling.

Automated unit, API/integration and W/A/I/C acceptance tests MUST cover ACTIVE and every nonpayable status with otherwise valid expiry/CVV/balance, missing/unknown statuses, forged client status and a status change between review and payment. Include concurrent administrator card locking/payment, retries and lost success responses. Assert zero mutation for a rejected payment, at most one successful debit and consistent authoritative card-status/ledger evidence for a committed result. Card-status restrictions govern new charges. Card expiry and nonpayable status MUST NOT block an otherwise eligible refund to the source simulated bank account under FR-027.

**Synthetic card expiry and automated tests**

Evaluate registered synthetic card month/year expiry using authoritative server time in Asia/Ho_Chi_Minh. The card remains eligible for the entire stated month and becomes expired at 00:00 on the first day of the following month. At or after that instant, reject a new charge with zero debit or booking confirmation. Other payment eligibility checks still apply before expiry. Client device clocks cannot determine card validity. Validate month/year input before any financial mutation.

Automated unit, integration and W/A/I checkout tests MUST cover one second before expiry, exact expiry and one second after, with respective expiry-check results eligible, rejected and rejected. Include December/January rollover, February/leap-year boundaries, UTC-offset-equivalent timestamps, skewed device clocks, malformed month/year, original checkout and rescheduling payment. Verify zero debit on expiry rejection and hold retention only until its original expiry under FR-024, with original confirmed inventory preserved for failed rescheduling. All fixtures use synthetic cards and make zero real network payment requests.

**Errors and edge cases**: Expiry boundary, malformed input, zero balance, already-paid or expired booking, unsupported test card.

**Verification approach**: Boundary validation, disclosure journey and zero-external-payment-request tests.

**Existing versus proposed / dependencies**: New requirement. Expiry follows the end-of-month Asia/Ho_Chi_Minh rule. Only ACTIVE cards may pay under the approved status rule. Refunds credit the recorded source simulated bank account despite card expiry or nonpayable status under FR-027.

#### FR-022 — Atomic simulated charge and duplicate prevention

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I; shared booking/banking services; C authorized transaction view.

**Requirement and user value**: Only after explicit review confirmation under FR-026, a successful simulated payment MUST deduct the authoritative amount atomically and durably record its transaction and booking association. Repeated requests MUST NOT cause duplicate charges. Rescheduling payments require the distinct explicit review in FR-028 and MUST use the same simulated banking safeguards; an existing paid booking is not treated as a duplicate of its legitimate rescheduling payment.

**Measurable acceptance criteria**: For one logical payment retried concurrently from multiple clients, at most one successful debit exists and all successful replies reference that same transaction; final balance equals initial balance minus the single authorized amount. Injected failure produces no orphan debit or false confirmation; conflicting reused request identities are rejected. Concurrent distinct purchases cannot overdraw a balance.

**Errors and edge cases**: Response lost after debit, concurrent retries, competing account debits, interrupted write, reused request with changed amount.

**Verification approach**: Concurrent transaction/retry and failure-injection tests with synthetic records and balance/ledger assertions.

**Existing versus proposed / dependencies**: New requirement. Payment, refund and inventory effects MUST be transactional and idempotent together; failure leaves no partial debit, credit, fee, allocation, release or confirmation. Coordination design is deferred to planning; retry/atomicity guarantees are mandatory.

#### FR-023 — Limited inventory and pending-payment holds

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I; C capacity management; shared inventory.

**Requirement and user value**: The system MUST prevent overselling by temporarily holding capacity for a payable booking before confirming payment. Held and confirmed allocations MUST count against the same limited inventory.

**Measurable acceptance criteria**: For capacity C and concurrent requests exceeding C, held plus confirmed allocations never exceed C for any applicable tour departure or hotel stay unit; unavailable capacity prevents a new payable allocation. Payment cannot confirm an expired/unowned hold. A successful booking converts its allocation without double-counting. Rescheduling checks new availability while preserving the original allocation; overlapping original/new inventory MUST not be oversold or incorrectly counted. Temporary proposed-slot holds expire without releasing the original reservation (FR-029).

**Tour seat-map inventory and acceptance tests**

For a tour with seat selection, each traveler MUST occupy one distinct seat and selected seat count MUST equal traveler count. Validate seat identifiers against the selected tour departure and enforce availability per departure. Review MUST show traveler count and exact selected seat numbers. Duplicate seat identifiers, too few or too many seats, unknown seats and seats from a different departure MUST reject with zero charge/allocation change. Active holds and confirmed allocations for a seat consume the same departure-specific unit. Rescheduling requires explicit replacement seat selection with the same seat-count validation and atomic old-seat release under FR-029.

Automated unit, contract/integration and W/A/I seat-selection tests MUST cover a three-traveler booking with three distinct seats, two/four-seat mismatches, duplicate/unknown/wrong-departure identifiers, concurrent last-seat attempts, expired holds and failed-payment retry. Successful rescheduling MUST secure exactly the validated new seats and release replaced old seats for other travelers. Rejection/failure preserves old allocations and balance. Tests MUST assert no duplicate charge, double allocation or overselling. Tours without a seat map follow the departure-specific capacity rule below. Hotel occupancy follows the configured total-guest limit below.

**Tours without a seat map**

Administrators MUST configure a separate finite capacity for each tour departure date/time. Each traveler consumes one place. Review MUST show the selected departure, traveler count and available places. Active holds and confirmed allocations count against that departure’s capacity only. Another departure’s remaining places cannot authorize an over-capacity request. Shared business rules MUST reject insufficient capacity before a debit or successful booking/rescheduling. Rescheduling MUST reserve the unchanged traveler count on the proposed departure and release the replaced original departure allocation only through the successful atomic change under FR-029.

Automated unit, contract/integration and W/A/I/C acceptance tests MUST cover departures D1 and D2 with different capacities. A three-traveler hold on D1 reduces only D1 availability by three. Requests above D1 remaining capacity reject even if D2 has sufficient places. Concurrent requests for the final places MUST never oversell. Cover hold expiry returning places only to its own departure, failed-payment retry, capacity reductions below active allocations, and successful/failed rescheduling between departures. Assert exactly one debit/allocation/release per logical operation and preservation of original booking and balance on failure.

**Hotel total-guest occupancy**

Administrators MUST configure a maximum total guest capacity for each selectable hotel room or room type. Each person occupies one place regardless of age. Before creating a payable hold, accepting payment or committing a booking/rescheduling, shared business rules MUST verify that the assigned guest count of every selected room is within its configured maximum and that the per-room assignments sum to the booking’s total guests. Show each selected room’s capacity and assigned count in review. Missing capacity cannot establish availability for the requested guest distribution. Administrative capacity edits MUST NOT silently invalidate existing confirmed allocations under the existing inventory-preservation rule.

Automated unit, API/integration and W/A/I/C acceptance tests MUST accept a room assignment exactly equal to configured capacity and reject an assignment one guest above it with zero debit or completed allocation change. Cover multiple rooms with different capacities, a distribution that fits total capacity but exceeds one room’s capacity, unchanged total guests redistributed during rescheduling, age-neutral counting, unknown/missing capacities and rejected direct API payloads. Payment failure, retries and concurrent capacity/inventory changes MUST preserve valid confirmed allocations, balances and exactly-once ledger/history effects.

**Accepted hotel-hour snapshot tests**

Automated unit, integration and W/A/I/C acceptance tests MUST confirm a stay under hotel-hour version H1, publish H2 and verify the existing booking retains H1’s check-in/checkout instants and derived cancellation/rescheduling/no-show times. A newly reviewed request MUST display H2. Review under H1 followed by an administrator edit before payment MUST retain the exact displayed H1 hours for that request. Successful rescheduling atomically adopts its reviewed hour snapshot, while rejection, failed payment and retries preserve the correct original or committed snapshot without duplicate debit/allocation. History MUST retain both prior and accepted time versions.

**Specific hotel room selection and acceptance criteria**

Travelers MUST select each physical room by its stable hotel-scoped identifier and displayed room number for the entire selected stay. Inventory MUST be allocated per exact room and local room-night date. Show selected room numbers, applicable occupancy capacities and dates before explicit booking/rescheduling confirmation. Room-type metadata may supply capacity and descriptive attributes, while the selected physical room remains the allocation unit. Rescheduling pairs MUST reference the actual old and new room identifiers selected by the traveler. A different physical room requires renewed review and explicit confirmation.

Automated unit, contract/integration and W/A/I/C tests MUST cover two rooms of the same type, a selected room unavailable for one night while another same-type room is available, unknown/duplicate/foreign-hotel room identifiers, guest-capacity validation and simultaneous attempts for the same room-night. Reject an unavailable selected room with zero debit or completed allocation change. A successful booking/rescheduling MUST secure exactly the selected rooms and record their identifiers/numbers in history. Test old-room resale after replacement, adjacent stays, changed selections requiring renewed confirmation and failed-payment preservation.

**Hotel configured service times**

Hotel booking and rescheduling reviews MUST display the per-hotel configured check-in and checkout times for the selected dates under FR-015. Validate whole room-night availability over the approved date interval while using the configured check-in instant for cutoff and no-show calculations.

**Hotel room-night interval and acceptance tests**

Hotel inventory MUST use local room-night dates in Asia/Ho_Chi_Minh over the interval [checkInDate, checkOutDate). Include the night starting on check-in date and exclude the night starting on checkout date. Checkout MUST be later than check-in. A booking checking out on date D does not consume night D, allowing a different booking to check in on D when all other availability and payment conditions pass. Availability, holds, confirmed allocation, cancellation release and rescheduling replacement MUST use this same interval.

Automated unit, integration and W/A/I/C acceptance tests MUST cover a controlled room booking from dates D1 to D3 consuming exactly nights D1 and D2, an adjacent D3-to-D4 booking that succeeds, and an overlapping D2-to-D4 request that fails without a debit or completed allocation. Cover active holds, expiry/release, same-day checkout/check-in boundaries, invalid zero/negative stays, month/year boundaries, midnight timezone conversion and concurrent requests. Rescheduling overlapping the original stay MUST preserve common room-nights, secure newly required nights and release only replaced nights atomically, avoiding duplicate consumption or release. Failed changes preserve all original allocations and balances.

**Errors and edge cases**: Concurrent last-unit booking, overlapping hotel dates, invalid quantities, capacity edit below allocations, payment/expiry race.

**Verification approach**: Concurrent inventory and overlapping-date integration tests; invariant checks after each failure/race.

**Existing versus proposed / dependencies**: New requirement. Seat-map tours require one distinct departure-specific seat per traveler. Tours without a seat map use configured capacity per departure date/time, with one place per traveler. Hotel rooms use administrator-configured maximum total guest capacity, counting each person as one place. Successful simulated payment and atomic allocation confirm immediately under FR-025.

#### FR-024 — Configurable expiry and release of unpaid holds

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I checkout/countdown and status; C authorized timeout configuration; shared inventory.

**Requirement and user value**: Unpaid holds MUST expire automatically after an administrator-configurable timeout specific to their tour/hotel offering and release capacity. Each offering has its own hold-timeout setting, enforced by shared business rules. Failed payments MUST NOT confirm a booking.

**Measurable acceptance criteria**: Each hold has an authoritative expiry visible at checkout; an unpaid hold at or after expiry cannot be charged or confirmed and no longer blocks new inventory allocation. Repeated expiry handling releases capacity only once. Payment racing expiry results either in one valid paid allocation or no charge and released capacity, never a charge without its allocation.

**Per-offering hold acceptance tests**

Automated configuration, ownership/role, integration and W/A/I/C tests MUST cover at least two offerings with different approved hold timeouts and assert that each hold’s authoritative expiry and checkout countdown use the setting applicable to that offering. Test tour departure and hotel room-night holds, abandoned checkout, expired allocation resale, rejected unauthorized configuration and expiry/payment concurrency. Proposed-inventory holds during rescheduling also follow their proposed offering’s hold configuration under FR-029. Expiry of a proposed hold preserves the original confirmed itinerary and its inventory. Hold durations MUST be whole minutes greater than or equal to one. One minute equals 60 elapsed seconds. Duration validation MUST reject zero, negative, fractional, missing and nonnumeric values without changing the active configuration. A valid hold timeout MUST be explicitly configured before the offering opens for sale or accepts bookings/creates payable holds. Missing timeout blocks the affected operation with a clear administrator configuration error and zero debit or allocation. No shared automatic default applies.

**Failed payment and retry acceptance criteria**

After a definitively failed simulated payment, retain the same valid hold and its original issued expiry. Show the failed result, unchanged expiry/countdown and the ability to retry while the hold remains valid. Failed attempts MUST leave no debit or CONFIRMED booking. Retry MUST enforce all applicable payment, ownership, inventory and cutoff eligibility rules. Neither repeated failures, retries, reloads nor timeout-setting edits may extend that hold. At or after its issued expiry, reject payment and confirmation and release capacity exactly once.

Use the same hold for subsequent explicit payment attempts before expiry. Preserve idempotent results for duplicate requests for an individual attempt and at most one successful payment for the booking or logical rescheduling. An unknown payment result after a lost response MUST be reconciled to its authoritative outcome before creating another successful debit. A proposed-inventory hold retained after a failed rescheduling payment MUST keep the original confirmed booking and its allocations intact.

Automated unit, integration and W/A/I acceptance tests MUST fail an attempt on a one-minute hold, assert zero debit and unchanged expiry, then succeed on an eligible retry before expiry with exactly one debit/confirmation. Test multiple failures without extension, duplicate attempt requests, lost success responses, retries exactly at/after expiry, concurrent retries and cleanup-worker outage. Repeat for rescheduling, asserting preservation of original inventory after failure and exactly one replacement/debit on success.

**Issued hold expiry and configuration edits**

Capture the offering’s effective timeout when a hold is created and save that duration, its configuration reference/version, authoritative server creation time and issued expiry with the hold. Later administrator edits MUST leave that issued expiry and its displayed countdown unchanged. A newly created hold uses the then-effective configuration. Reloads and retries for the same logical hold MUST return its existing expiry. Proposed-inventory holds during rescheduling follow the same rule.

Automated unit, integration and W/A/I/C acceptance tests MUST create hold H1 under timeout V1, publish shorter and longer V2 settings and assert H1’s creation time/duration/expiry remain unchanged while new hold H2 uses V2. Test concurrent configuration edits/hold creation so each hold captures one consistent configuration, client reloads, duplicate creation requests, expiry/payment races at both original and newly configured boundaries and cleanup-worker delays. Existing holds expire and release exactly once at their own issued expiry. Record enough evidence to reconcile each hold’s countdown and expiry decision to its saved configuration.

**Required hold configuration tests**

Automated CMS/API and W/A/I acceptance tests MUST reject opening sale, creating new bookings and creating payable holds when the offering’s hold timeout is missing or invalid, even if both cutoffs and no-show grace are configured. Show which policy is missing. Assert zero debit/ledger write/inventory allocation, including direct API bypass and concurrent configuration changes. Once all four settings are valid, the configuration gate may pass and each new hold derives its expiry from the configured timeout. Existing confirmed bookings retain their accepted policies.

**Minute-duration acceptance tests**

Automated unit/configuration tests MUST accept one minute and positive integer minutes and reject zero, negative, fractional and nonnumeric values. With a one-minute hold created at authoritative server instant T, its duration-derived expiry is T + 60 seconds. Controlled-clock payment/allocation tests MUST verify that T + 59 seconds is before expiry, T + 60 seconds and T + 61 seconds reject payment/confirmation and cease blocking capacity. Any additional service-start eligibility checks still apply. Test countdown display with skewed client clocks, reload/retry without unintended duration extension, arithmetic-invalid extreme input and scheduler outage. No expired hold can cause a debit or permanent allocation.

**Errors and edge cases**: Abandoned checkout, scheduler outage, invalid timeout configuration, retry after expiry, clock boundary, failed-payment retry.

**Verification approach**: Controlled-clock expiry/reallocation and payment/expiry race tests, including unavailable cleanup worker.

**Existing versus proposed / dependencies**: New requirement. Per-offering timeout scope is resolved. Existing-hold expiry is immutable under later timeout edits. Failed payment retains the hold until its issued expiry and permits retry without extension.

#### FR-025 — Payment-gated confirmation and booking lifecycle

**User story**: US-04; US-07 for authorized administration.

**Supported platforms**: W/A/I own booking/payment history; C authorized decisions and refund visibility.

**Requirement and user value**: After explicit review confirmation, a booking MUST become CONFIRMED only when successful simulated payment and inventory allocation complete atomically. Administrator approval is not an additional confirmation prerequisite. Unpaid bookings MUST never permanently occupy seats or rooms; temporary holds expire under FR-024.

**Measurable acceptance criteria**: Pending/failed/unpaid or expired holds never appear CONFIRMED. Payment and allocation either both succeed with one confirmed booking and one debit, or neither persists. Concurrent last-seat/room purchases cannot double book or oversell. Cancellation follows FR-027; forbidden transitions have zero effects. All payment, refund and inventory transitions are transactional and idempotent. Rescheduling a CONFIRMED booking follows FR-028–FR-030; failure leaves the original booking CONFIRMED with its original inventory, and success atomically replaces the schedule/allocation after additional simulated payment.

**Administrator-confirmed no-show**

Only an authorized administrator MUST be able to mark a paid CONFIRMED booking as NO_SHOW when the traveler does not attend and has not validly canceled. Scheduled time alone MUST NOT automatically mark a no-show. No-show MUST issue zero SIMULATED refund or credit, make zero new debit and preserve the account balance. Record actor, server timestamp, reason and prior/new booking states, and expose the resulting authorized state in traveler history. Repeated no-show requests MUST have one effective transition/audit event and zero duplicate financial effects. Cancellation/no-show races MUST preserve a consistent committed lifecycle with no double transition or refund. Each service MUST support an administrator-configured late-arrival grace period after the currently CONFIRMED tour departure or hotel check-in. Shared business rules MUST reject no-show confirmation before the applicable grace period has elapsed, preserve booking/inventory/balance and show an administrator-readable reason and earliest confirmation time. Record the service start, applicable grace period and evaluated eligibility in audit history. Elapsed waiting alone does not transition the booking. No-show corrections follow the inventory-protected restoration rule below. Inventory release follows the administrator-selected resellable-portion rule below.

Automated unit, role/ownership, integration and CMS/W/A/I history tests MUST cover administrator confirmation, traveler/anonymous denial, no automatic transition on clock advance, zero refund/debit/balance effects, duplicate requests and concurrent cancellation. An already validly canceled booking cannot be marked as an unpaid no-show or refunded again. Automated controlled-clock tests MUST cover different configured grace periods per service, attempts before the end of the grace period, late-arrival eligibility after it, no automatic transition when the clock advances, distinct tour departure/hotel check-in anchors, and continued preservation of balances. Inventory expectations follow the explicit administrator-selected partial-release criteria below. Version selection follows the saved no-show policy snapshot.

**No-show partial inventory release**

An authorized administrator MUST explicitly identify the allocated seats/room-nights still eligible for resale and select the portion to release when handling NO_SHOW. Release only that selected resellable portion. Elapsed or otherwise unresellable allocations MUST retain their existing allocation state. Validate ownership of each selected allocation, relevant service dates/times and current resale availability using authoritative server time. Reject invalid or foreign selections with a clear reason and zero mutation. Record the administrator, reason, selected identifiers/date ranges, released quantities and retained portion in audit history. No-show confirmation and its selected release MUST be transactional and idempotent. Repeated requests cannot release capacity twice. Released inventory MUST become visible/selectable for other travelers when the service can still be supplied. Zero financial effects apply to the original no-show traveler.

Automated unit, authorization, integration and CMS/W/A/I inventory tests MUST cover no resellable units, all eligible units and a mixed stay with elapsed room-nights retained and future resellable room-nights released. Test selected eligible seats, elapsed/unavailable-service selections, unknown/cross-booking identifiers, unauthorized release and partial-write failures. Other travelers MUST be able to select released inventory while retained inventory remains unavailable. Concurrent resale requests and repeated no-show/release requests MUST prevent double release, double booking and overselling. Assert retained original allocation history, exactly one effective release and unchanged original traveler balance. A failed atomic operation preserves original booking and inventory.

**Correction of mistaken no-show**

An authorized administrator MUST be able to correct a mistaken NO_SHOW and restore the booking to CONFIRMED only when all required original inventory can be secured. Retain allocations that were never released and reacquire all released original seat/room-night allocations needed for the itinerary. Existing holds and confirmed allocations belonging to other travelers MUST be respected. If any required unit is unavailable, reject the whole correction with a clear reason and preserve the prior NO_SHOW state, inventory and simulated balance.

Restoration of booking state and inventory plus correction history MUST be atomic and idempotent. Charge zero additional SIMULATED amount, issue no refund/credit and preserve the original payment records, prices and accepted policy snapshots. Record correcting administrator, server timestamp, reason, prior no-show event, before/after states and allocation effects. Retain both the no-show and correction events in history. Retries cannot allocate capacity twice or duplicate correction success.

Automated unit, authorization, integration and CMS/W/A/I acceptance tests MUST cover all inventory retained, released inventory still available, some or all released inventory already held/booked by another traveler, unauthorized requests, concurrent resale/restoration, retries and injected partial failures. Only full restoration may commit. Assert zero double booking/overselling, no effect on other travelers’ reservations, exactly one restoration event and unchanged simulated balances and ledger.

**Versioned no-show grace policy**

Each confirmed itinerary MUST retain an immutable no-show grace-policy snapshot saved at booking or last successful rescheduling. Store its policy version, graceMinutes and service-start/timezone evidence. Administrator edits MUST create a new version and preserve existing confirmed itinerary snapshots. Use the saved version and current confirmed service start for no-show eligibility. On successful rescheduling, atomically adopt the accepted new itinerary’s no-show snapshot and retain the previous version in history. Rejection or failure preserves the previous snapshot, booking, inventory and balance. The applicable service timezone is Asia/Ho_Chi_Minh. Disclose the no-show policy that will attach to the itinerary before confirmation. Bind the no-show policy version effective and displayed at rescheduling review to that request through confirmation/payment. Later administrator edits MUST preserve that reviewed version for the request. Success MUST save exactly that reviewed no-show snapshot atomically. Newly reviewed requests use the then-effective version. Required deadline checks, availability, explicit confirmation and simulated payment continue to apply.

Automated unit, integration and CMS/W/A/I history tests MUST cover administrator changes after booking, existing itineraries retaining their saved grace, new bookings adopting an updated version, successful rescheduling adopting the accepted new snapshot, and rejected/failed changes retaining the original version. Evaluate no-show timing one second before, exactly at and one second after grace end using each saved version, including zero grace. Assert immutable previous versions, correct minute duration, audit traceability and exactly one snapshot adoption under retries. Also test review under no-show version V1 followed by an administrator edit to V2 before payment. Success MUST adopt V1 and record the version shown, a newly reviewed request MUST use V2, and rejection/failure MUST retain the original confirmed snapshot. Verify that grace eligibility calculations use the adopted version rather than the later global settings.

**No-show eligibility boundary and automated tests**

Capture an authoritative server-side timestamp for the administrator no-show request. Compute `noShowEligibleAt = confirmedServiceStart + graceMinutes * 60 seconds`, using the currently confirmed departure/check-in instant. Confirmation requires `serverRequestTime >= noShowEligibleAt`, subject to role and lifecycle validation. Before that instant reject with a clear earliest-confirmation reason and zero booking/inventory/balance effects. At equality or later, an authorized explicit administrator request may mark NO_SHOW with zero refund/debit. Client clocks cannot establish eligibility.

Controlled-clock tests MUST cover one second before, exactly at and one second after grace end, with expected timing results reject, eligible and eligible. Repeat with zero grace, a 30-minute/1800-second grace, client clocks ahead/behind and offset-equivalent timestamps. Eligibility alone does not create an automatic transition. Audit the server timestamp, service-start instant, configured minutes, eligibility instant and evaluated result. Retry and concurrency tests MUST preserve one effective transition and zero financial effects.

**No-show grace value validation and tests**

Configure and display no-show grace periods as integer minutes greater than or equal to zero, with each minute equal to 60 elapsed seconds. Use the currently confirmed departure/check-in as the waiting-period anchor. Zero adds zero seconds. Admin UI and shared API validation MUST reject negative, fractional, missing or nonnumeric values without changing an active configured policy. A valid no-show grace period MUST be explicitly configured before sale or a new booking under FR-015. Explicit zero is valid. Missing grace blocks the operation with a clear configuration error and zero payment/inventory allocation. Automated tests MUST cover zero, positive whole minutes, negative/fractional/nonnumeric inputs and arithmetic-invalid extreme values. For a 30-minute fixture, the waiting interval MUST be exactly 1800 seconds. Preserve the original booking, inventory and simulated balance on rejected configuration or premature no-show requests. Inventory effects follow the explicit administrator-selected partial-release rule. Version selection follows the saved no-show snapshot.

**Errors and edge cases**: Partial no-show inventory release, elapsed versus future room-nights, invalid resale selection, concurrent resale, payment/allocation failure, lost response, hold expiry race, cancellation versus confirmation, duplicate requests, concurrent administrator/traveler cancellation.

**Verification approach**: Lifecycle transition, concurrency, retry and injected-failure tests asserting booking state, balances, ledger and inventory together.

**Existing versus proposed / dependencies**: Confirmation timing resolved. Accepted cutoff, confirmation, rescheduling and no-show decisions are specified above. FR-020 fixes the single source account and FR-027 defines final voluntary eligibility.

#### FR-026 — Explicit prepayment review and confirmation

**User story**: US-04.

**Supported platforms**: W/A/I; shared checkout enforcement.

**Requirement and user value**: Before payment, travelers MUST review and explicitly confirm the tour/hotel, selected date/time (including hotel stay dates), traveler/guest count, applicable seat numbers or room selection, total SIMULATED payment amount, and cancellation policy of 65% refund and 35% fee. Only after confirmation may the simulated Mastercard banking system process payment.

**Measurable acceptance criteria**: Missing confirmation causes zero debit and no CONFIRMED booking. Confirmation covers the exact reviewed details and cancellation policy; changing any reviewed detail or total requires renewed confirmation. All displayed payments, balances, fees and refunds are labeled SIMULATED. No real card data is processed or stored and no real card network is used.

**Errors and edge cases**: Stale price, changed selection, duplicate confirmation, expired hold, direct payment request bypassing review.

**Verification approach**: Review-to-payment journeys and bypass/stale-confirmation tests across W/A/I with synthetic inputs only.

**Existing versus proposed / dependencies**: New explicit policy; Cancellation cutoff details follow FR-027. FR-027 defines the accepted complete voluntary eligibility conditions.

#### FR-027 — Transactional cancellation, simulated refunds and inventory release

**User story**: US-04; US-07 for administrator cancellation.

**Supported platforms**: W/A/I cancellation and own history; C authorized cancellation/history; shared banking and inventory.

**Requirement and user value**: Eligible voluntary cancellation of a CONFIRMED booking MUST refund 65% of the total successfully paid SIMULATED amount and retain 35% of that same total as a SIMULATED cancellation fee. The basis MUST include the initial booking payment, all successful rescheduling fees, matched holiday differences and holiday charges for added rooms/nights. Exclude failed, rejected, pending and duplicate payment attempts. Calculate the basis from authoritative linked successful transactions, independently of current itinerary catalog prices or reductions in nights/rooms. Administrator cancellation because service cannot be provided MUST refund 100% of the same total-successful-payment basis, including the original booking payment, all rescheduling fees and all holiday charges, with zero cancellation fee. Refund and fee MUST appear in transaction history linked to the booking and all contributing successful charge references. Inventory MUST be released when it can be resold; unavailable services MUST NOT be reopened for sale merely by cancellation.

**Measurable acceptance criteria**: For 100 simulated units paid, eligible voluntary cancellation credits 65 and records 35 retained; service-unavailable administrator cancellation credits 100 and records zero fee. Each cancellation records actor, reason, authoritative server cancellation request timestamp, evaluated cutoff deadline and eligibility outcome, all contributing successful payment references and amounts, total refund basis, refund and retained cancellation fee. Retries and concurrent traveler/admin cancellation produce at most one effective cancellation/refund, never aggregate refunds exceeding successful linked payments, duplicate fees, duplicate releases or negative balances. Injected failure leaves no partial cancellation, credit, fee or inventory effect; retry yields the same result. Resellable inventory is available after successful cancellation. Every balance, refund and fee shown is labeled SIMULATED.

**Required sale configuration**

Cancellation cutoff, rescheduling cutoff, no-show grace and pending-payment hold timeout MUST all be explicitly configured and valid before an offering opens for sale or accepts a new booking under FR-015. Missing policies do not receive an automatic default, including no implicit zero-minute no-show grace or shared hold-timeout fallback. Invalid/missing configuration MUST be shown to authorized administrators and block the affected sale/booking operation. Both cutoff durations MUST be explicitly configured as whole hours greater than or equal to zero. The approved business rule imposes no additional upper cutoff limit.

**Refund destination and synthetic card changes**

Credit an eligible cancellation refund to the SIMULATED bank account identified by the authoritative successful charge records. A later card expiry, lock, suspension or closure MUST NOT block that refund or require new ACTIVE-card payment validation. Preserve original payment/account linkage and reject client attempts to redirect the credit to another account. Refund credit, cancellation state, fee/history and applicable inventory release MUST remain transactional and idempotent. Refunds create no new card charge. All contributing payments MUST use the one FR-020 source account. Aggregate rounded refunds credit that same account.

Automated unit, ownership, integration and W/A/I/C history tests MUST charge a synthetic card while ACTIVE and then refund eligible cancellations after expiry, locking, suspension and closure. Verify the recorded source account is credited at the approved 65% or 100% amount, all displays identify SIMULATED VND, no other account is credited and retries/concurrent refund requests create one effective credit. Test altered destination/account identifiers and injected failures with zero partial cancellation/refund/inventory effects. Card status changes during refund processing MUST preserve the source-account linkage and authorized credit outcome.

**Configurable voluntary cancellation cutoff**

Each tour/hotel offering MUST have an administrator-configurable voluntary cancellation cutoff. Display the applicable cutoff before booking confirmation and in the cancellation review. Shared business rules MUST validate the applicable cutoff and ownership before committing the voluntary cancellation or refund. A request that fails the configured eligibility rule MUST show a clear reason and preserve booking state, allocated inventory and simulated balance with zero refund/fee transaction. Automated tests MUST cover distinct cutoffs per offering, unauthorized configuration, accepted/rejected requests and strict exact-boundary behavior. Capture the authoritative server-side cancellation request timestamp (`cancellationRequestTime`) and accept only if `cancellationRequestTime < cancellationCutoffDeadline`. Equality or later MUST reject with a clear cutoff reason, preserve the booking, inventory and simulated balance, and produce zero refund/fee transactions. Client-supplied timestamps and device clocks MUST NOT establish eligibility. Controlled-clock tests MUST check one second before the deadline, equality and one second after, with expected eligibility pass, reject and reject respectively. Include clients with clocks ahead/behind the server, equivalent instants expressed with different timezone offsets, duplicate rejected requests and concurrent cancellation attempts. Other authorization and eligibility checks still apply before refund. This cutoff governs traveler voluntary cancellation. Administrator service-unavailable cancellation retains its 100% refund policy. Cancellation cutoff values MUST be whole hours greater than or equal to zero. All cancellation deadlines use Asia/Ho_Chi_Minh. Snapshot/version behavior follows the versioned cancellation policy below.

**Cutoff value validation and automated tests**

Admin UI and shared API validation MUST accept 0 and positive integer hour values and reject missing values, negative values, fractional hours and nonnumeric input without changing the active policy version. Explicit zero satisfies the required-configuration gate, while a missing value does not. Tests MUST verify both cancellation and rescheduling policies, configured holiday durations, valid positive values, malformed/extreme values that would cause arithmetic overflow, and zero-hour boundaries. With zero, one second before the applicable departure/check-in may pass eligibility, while equality or later rejects. Numeric parsing or deadline overflow MUST cause a clear validation error and zero policy/payment/inventory mutation. Both durations must still be explicitly configured before sale.

**Cutoff duration in elapsed hours**

Cancellation and rescheduling cutoff durations MUST be configured and displayed in elapsed hours, with one hour equal to 60 minutes or 3600 seconds. Resolve each departure/check-in to an authoritative instant using Asia/Ho_Chi_Minh, then subtract the saved configured duration in elapsed hours to derive that itinerary’s deadline. Apply the existing strict server request-time comparison to those instants. Store the hour duration and applicable timezone in versioned policy snapshots and audit evidence. Holiday-specific rescheduling durations use the same elapsed-hour unit. All cancellation/rescheduling cutoff policy snapshots MUST identify Asia/Ho_Chi_Minh as their timezone, including configured holiday-specific rules. Display this timezone with the reviewed deadlines. All cancellation/rescheduling durations, including configured holiday-specific values, MUST be whole hours greater than or equal to zero. Zero hours places the deadline exactly at departure/check-in, with the strict request-time rule still enforced. Explicit per-offering values are required before sale, with no automatic fallback.

Automated unit and integration tests MUST verify that a 24-hour configured duration subtracts exactly 86400 seconds, including midnight, month/year boundaries and timezone-offset-equivalent starts. Tests for both cancellation and current/proposed rescheduling deadlines MUST assert one-second-before eligibility and exact-at/one-second-after rejection using authoritative server time. Use UTC and other offset-equivalent request timestamps with Asia/Ho_Chi_Minh service starts, plus clients/servers configured in different host timezones. Assert identical deadline instants and eligibility, Vietnam-local deadline display, unchanged saved timezone and correct holiday-specific hour durations.

**Cancellation deadline anchor**

The cancellation deadline MUST be calculated backwards from the tour departure or hotel check-in of the currently CONFIRMED itinerary using that itinerary’s saved cancellation cutoff duration and applicable timezone. A successful rescheduling replaces the itinerary start and cancellation-policy snapshot atomically. Failed or rejected changes retain the previous start, policy and derived deadline. Both cancellation review and server-side eligibility MUST use the same current itinerary and policy version. Store the evaluated start, deadline and policy version in history.

Automated tests MUST cover successful changes to earlier and later dates, asserting the deadline is derived from the newly confirmed start and accepted policy, followed by strict request-time checks one second before, at and after that deadline. Include repeated changes, failed/rejected changes preserving the old deadline, and concurrent cancellation/rescheduling requests. Assert the final cancellation uses one consistent committed itinerary/policy state with correct inventory, balance and refund history. Allowed duration values are whole hours greater than or equal to zero. The timezone is Asia/Ho_Chi_Minh.

**Versioned cancellation policy**

Each confirmed itinerary MUST retain an immutable cancellation policy snapshot saved at initial booking or last successful rescheduling. The snapshot MUST identify its policy version and the parameters used to evaluate its cancellation deadline, including configured elapsed-hour duration and Asia/Ho_Chi_Minh timezone. Administrator edits MUST create a new policy version and leave accepted itinerary snapshots intact. Before booking/rescheduling confirmation, disclose the cancellation policy that will attach to the proposed itinerary. On successful rescheduling, atomically adopt the accepted new-itinerary cancellation snapshot with the booking, payment, inventory and history changes. Rejected/failed changes preserve the existing cancellation snapshot. Cancellation review and eligibility MUST use that saved snapshot and the strict server-time rule. Record its version and evaluated deadline in cancellation history and retain prior snapshots in rescheduling history. Bind the proposed cancellation policy version displayed at rescheduling review to that request through confirmation and payment. Subsequent administrator edits MUST preserve the reviewed version for that request. Successful rescheduling MUST adopt exactly the displayed version as its immutable cancellation snapshot. Newly reviewed requests use the cancellation policy effective at their review. All required cutoff, availability, explicit confirmation and payment checks still apply.

Automated unit, integration and W/A/I/C acceptance tests MUST cover an administrator change after booking, an existing itinerary retaining its version/deadline, a new booking using the updated version, successful rescheduling adopting the accepted new snapshot, and rejected/failed rescheduling preserving the old snapshot. Review a proposed cancellation policy V1, publish V2 before payment, and assert successful rescheduling saves V1 while a newly reviewed request uses V2. Rejected or failed changes MUST retain the original confirmed snapshot and balance. Retry/failure-injection tests MUST verify exactly one correct snapshot adoption and charge. Repeat cancellation checks one second before, at and after the snapshot-derived deadline. Assert history/version traceability, immutable previous snapshots, and zero duplicate adoption/refund under retries.

**Refund-basis formula**

```text
voluntaryCancellationBasis = sum(successful linked original and rescheduling payments)
voluntaryRefund = roundHalfUpVND(voluntaryCancellationBasis * 0.65)
retainedCancellationFee = voluntaryCancellationBasis - voluntaryRefund
```

**Post-rescheduling acceptance tests**

Given an initial payment of 100 SIMULATED units, two successful rescheduling fees of 20 each and successful holiday charges of 60, eligible voluntary cancellation MUST use a basis of 200, credit 130 and retain 70. Automated calculation, ledger/history and W/A/I acceptance tests MUST cover multiple changes, added/removed rooms/nights, failed and duplicate attempts excluded from the basis, concurrent payment/cancellation, concurrent cancellation retries, and injected partial failure. Reconcile every component to a successful payment reference and verify one effective refund, one retained cancellation fee and atomic inventory release when resellable. Changes made cheaper without an immediate refund do not reduce the paid cancellation basis. Apply the FR-020 half-up VND rounding and derive the retained fee as the remainder.

**Administrator post-rescheduling acceptance tests**

For an original payment of 100 SIMULATED units, two successful rescheduling fees of 20 each and successful holiday charges of 60, service-unavailable administrator cancellation MUST refund 200 and retain zero fee. Automated unit, integration, CMS and W/A/I history tests MUST reconcile the full credit to every successful linked charge, exclude failed/pending/duplicate attempts, and assert no duplicate refunds under retries or concurrent cancellations. Include additional room/night holiday charges and reductions that previously produced no refund. Injected failures MUST preserve atomic cancellation/refund/inventory effects. Unavailable service inventory remains unavailable for resale. Concurrent traveler/admin cancellation follows the single-effective-cancellation invariant and its committed reason, with total credits bounded by successful linked payments.

**Errors and edge cases**: Already canceled/refunded booking, unpaid booking, unauthorized cancellation, payment/cancellation race, conflicting reasons, refund failure, nonresellable inventory, fractional refund amounts.

**Verification approach**: Role/ownership, percentage, ledger reconciliation, concurrent duplicate/cross-actor cancellation and failure-injection tests; inventory resale assertions with synthetic records.

**Existing versus proposed / dependencies**: Percentages and service-unavailable administrator refund resolved. Per-service configurable voluntary cancellation cutoffs are confirmed. Voluntary eligibility requires ownership, CONFIRMED state, request before the saved deadline and no already committed cancellation. Release resellable future allocations when the service remains on sale. FR-020 defines VND rounding.
 Eligible voluntary cancellation after rescheduling includes all successful additional payments in its 65%/35% basis. Administrator service-unavailable cancellation after rescheduling refunds 100% of that same total-successful-payment basis and retains zero fee.

#### FR-028 — Confirmed-booking rescheduling review and 20% fee

**User story**: US-04.

**Supported platforms**: W/A/I; shared booking and simulated banking rules; C authorized visibility.

**Requirement and user value**: Travelers MUST be able to change the date or time of their own existing CONFIRMED tour/hotel booking. Every successful rescheduling MUST require an additional simulated payment including a rescheduling fee equal to 20% of the original booking amount. The fee base is the original booking amount, not a compounded amount including earlier change fees. An additional positive price difference MUST be charged ONLY when the new service date is an officially recognized Vietnamese public holiday, using the formula below. Ordinary dates, weekends and peak-season dates that are not public holidays incur only the 20% fee. Unofficial festivals and ordinary weekends MUST NOT be classified as public holidays without a separately approved policy.

**Later cancellation**

A successful rescheduling payment, including its 20% fee and holiday-related amounts, MUST enter the FR-027 total-paid basis for a later eligible voluntary cancellation. Zero refunds/credits when selecting cheaper dates or removing rooms/nights apply to the rescheduling operation itself. Later eligible whole-booking voluntary cancellation refunds 65% of all successful linked payments. Service-unavailable administrator cancellation refunds 100% of that same total-paid basis with zero cancellation fee. Review MUST explain these cancellation bases before payment, and FR-030 MUST retain the contributing payment references.

**Tour seat count during rescheduling**

For tours with a seat map, replacement selection MUST contain exactly one distinct seat per traveler under FR-023. Tour rescheduling MUST preserve the currently confirmed traveler count. Shared business rules MUST reject an increased or decreased count before any additional debit or completed allocation change and show a clear reason. This count-preservation rule also applies to tours without a seat map. The selected replacement seats and count require explicit review before additional simulated payment.

**Tour traveler-count acceptance tests**

Given a confirmed three-traveler tour booking, a proposed date/time change with three travelers and three valid replacement seats may proceed after the required cutoff/inventory checks and review. Requests with two or four travelers MUST reject with zero additional charge, unchanged original seats, booking count, price/policy snapshots and simulated balance. Automated unit, contract/integration and W/A/I tests MUST include direct client-payload tampering, count/seat mismatches, retries and concurrent changes. Repeated successful rescheduling MUST retain the original traveler count and continue to charge the fixed 20% based on originalBookingAmount plus only applicable holiday differences. History MUST retain the count used in every attempt and the rejection reason for altered-count attempts. Hotel guest-count preservation follows the subsequent decision.

**Replacement seat/room selection**: Where seat/room selection applies, travelers MUST explicitly choose available replacement seats/rooms for the proposed itinerary and see those exact selections in the confirmation review. Availability MUST be enforced for the selected identifiers and relevant dates/times. The old allocation remains secured while selection/payment is pending. After successful simulated payment and atomic replacement under FR-029, the replaced old seats/rooms MUST immediately return to available inventory for their original service dates/times and be visible and selectable by other travelers, subject to the offering remaining available for sale. Failure or abandonment preserves the original selection.

**Hotel guest-count preservation**

Hotel rescheduling MUST preserve the total guest count of the currently CONFIRMED booking. Travelers may redistribute that total among the proposed selected rooms. Review and history MUST show the unchanged total and proposed per-room distribution. Validate that all room-level counts sum to the confirmed total and satisfy each selected room’s applicable occupancy limits before payment or final inventory replacement. Increased/decreased totals, mismatched distribution sums or occupancy violations MUST reject with a clear reason and zero debit, preserving original guest/room counts, allocations, price/policy snapshots and simulated balance. Changing room count or stay length does not authorize changing total guests. Use each room or room type’s administrator-configured maximum total guest capacity under FR-023, counting each person as one place.

Automated unit, API/integration and W/A/I acceptance tests MUST cover four guests redistributed across one, two or more selected rooms within approved limits, unchanged total across repeated rescheduling, attempts to submit three/five guests, distributions whose sum differs from four, negative/fractional counts and room-capacity violations. Include simultaneous room/night changes, direct payload tampering, rejected payment and concurrent retries. Successful changes MUST record the accepted distribution exactly once with inventory/payment/history effects under FR-029. Rejected/failed changes preserve the original booking and balance.

**Room-count changes**

Hotel rescheduling MUST allow travelers to increase or decrease the number of rooms and explicitly select all proposed available rooms. Review MUST show current/proposed room counts, the exact selected room identifiers/numbers, stay dates, guest distribution and any approved room-count charges/refunds separately. Validate occupancy and every selected room-night before charging. On successful atomic change, secure all proposed allocations and release only replaced or removed original allocations so other travelers can select resellable inventory. On rejection, unavailable rooms, failed payment or interrupted writes, preserve all original allocations, counts, snapshots and balance. Apply the fixed 20% original-booking fee once per successful request. Each added room MUST incur its full quoted room-night price only for official Vietnamese public-holiday nights, classified in Asia/Ho_Chi_Minh using the year-specific calendar. All other added-room nights have zero additional charge. Review and history MUST identify each added room, date, quoted price, holiday classification and applied charge. These nights require inventory allocation even when charged zero. Charge a room-night once even if both the room and night are newly added. Removed rooms MUST produce zero SIMULATED refund, credit or offset against the 20% fee or applicable holiday charges. Before confirmation, show removed room identifiers, dates, recorded prices and zero refund/credit. Retain these details in history. On success, release removed allocations atomically for resale when the service remains available. Failure or rejection preserves the original room count, allocations and balance. Travelers MUST explicitly pair each replacement room with its corresponding current room before confirming. Each paired room uses the selected old room’s recorded nightly prices, with first night matched to first night and subsequent nights by ordinal position. Review and history MUST retain old/new room identifiers and the explicit mapping. A room may appear in at most one pair. Reject duplicate, unknown or cross-booking mappings with zero debit and preserve the original reservation. Unpaired new rooms follow the added-room policy and unpaired old rooms follow the removed-room policy. Changes to mapping or selections require renewed explicit confirmation.

Automated acceptance tests MUST cover increasing and decreasing room count, simultaneous room/night changes, explicit reselection and review, unavailable added rooms, occupancy violations, concurrent last-room requests, atomic removal/release, payment failures and idempotent retries. Assert unchanged original inventory and balance on rejection/failure and one complete allocation/ledger/history change on success. Added-room tests MUST cover mixed ordinary/holiday stays, nonholiday weekends/peak-season nights, Tết and cross-year calendars. For an original amount of 200 SIMULATED units, no matched-night difference and one added room with an ordinary night quoted at 150 and a holiday night at 180, collect exactly 40 + 0 + 180 = 220. Assert both room-nights are allocated, zero charges for ordinary nights, one charge per holiday room-night, complete review/history and no duplicate charges during retries or simultaneous room/night additions. Removed-room tests MUST verify zero refunds/credits, no offset against fees or holiday charges and the unchanged originalBookingAmount. Given an original amount of 400 SIMULATED units and a reduction from two rooms to one for nonholiday dates, collect exactly 80, create zero refund/credit and expose removed original inventory for other travelers after successful commit. Repeat for mixed holiday dates, simultaneous room/night reductions, failed payment, cutoff rejection, inventory conflict and concurrent retries, checking one fee debit, one release per replaced allocation and complete history.

**Rescheduling frequency**: A booking MUST allow unlimited successful date/time changes. Every change independently requires both strict cutoff checks, available inventory, explicit traveler confirmation and successful additional simulated payment. Prior change count MUST NOT prevent an otherwise eligible change. Every 20% fee continues to use the initial originalBookingAmount, with holiday-only positive differences and no cheaper-itinerary refund.

**Room-pairing acceptance tests**

Given two current rooms A and B with recorded first-night prices of 100 and 200 SIMULATED units, and proposed official-holiday rooms X and Y priced 150 and 250, explicit pairs A→X and B→Y MUST produce differences of 50 and 50. Pairs B→X and A→Y MUST produce differences of zero and 150. Apply the fixed original-booking 20% fee once to either case. Automated tests MUST assert that the selected pairing drives review, charge and history, changed mappings require renewed confirmation, duplicate/foreign/unknown mappings reject with zero mutation/debit, and added/removed rooms follow their approved rules. Repeat mixed-night cases, failed payment and concurrent changes to verify snapshot preservation and idempotent results.

**Tour policy formula**:

```text
reschedulingFee = roundHalfUpVND(originalBookingAmount * 0.20)
holidayDifference = isVietnamesePublicHoliday(newServiceDate) ? max(0, newItineraryPrice - currentItineraryPrice) : 0
totalAdditionalPayment = reschedulingFee + holidayDifference
```

**Hotel night service date**

Each hotel room-night starting on local date D and ending on D+1 MUST use D as its service date for official Vietnamese public-holiday classification in Asia/Ho_Chi_Minh. In the hotel formula, newNightDate and addedNightDate denote that room-night’s starting date. Apply this rule consistently to matched-night holiday differences and full holiday charges for added nights/rooms. Review and history MUST retain the starting service date, room identifier, calendar year/version and classification used for each room-night. Crossing midnight alone does not change the classification of an already identified room-night.

Automated unit, integration and W/A/I review/history tests MUST include a controlled calendar fixture where D is ordinary and D+1 is a public holiday, yielding ordinary classification for D→D+1, and the reverse fixture yielding holiday classification. Repeat around Tết, December/January, UTC-versus-Vietnam date boundaries, added nights and added rooms. Assert that the calendar year belongs to starting date D, all applied charges follow that classification and retries reproduce the recorded date/classification. Fixtures do not assert real annual holiday dates.

**Hotel nightly calculation**

```text
reschedulingFee = roundHalfUpVND(originalBookingAmount * 0.20)
holidayDifference = sum(
    isVietnamesePublicHoliday(newNightDate)
        ? max(0, newNightPrice - matchedCurrentNightPrice)
        : 0
    for each ordinally matched new room-night
)
addedHolidayNightCharge = sum(
    isVietnamesePublicHoliday(addedNightDate) ? addedNightPrice : 0
    for each unmatched new room-night due to added nights or added rooms, counted once
)
totalAdditionalPayment = reschedulingFee + holidayDifference + addedHolidayNightCharge
```

For hotels, classify each new room-night separately using its service date in Asia/Ho_Chi_Minh and the maintained year-specific calendar. Apply positive differences only to official public-holiday nights. Ordinary weekdays, nonholiday weekends and nonholiday peak-season nights contribute zero. The 20% fee applies once to the whole change. Negative nightly differences produce zero refunds/credits and cannot offset a positive difference on another holiday night. Display the nightly date, holiday classification, new price, matched recorded current-night price and applied difference, plus aggregate difference, fixed fee and total, before confirmation. Record these reviewed details in FR-030 history. Match nights by ordinal position within each itinerary. New night i MUST use the recorded current-itinerary price of night i as matchedCurrentNightPrice. Calendar-date matching and catalog edits cannot change that recorded baseline. Record both ordinal indices and dates in review and history. On success, adopt the accepted ordered nightly prices as the baseline for the next rescheduling under FR-029. Hotel rescheduling MUST allow increasing or decreasing the number of nights. Apply ordinal matching to the nights present in both itineraries. Added nights beyond the prior stay length and removed nights beyond the new stay length MUST be identified separately in review and history. For each added unmatched night, charge its full quoted room-night price only if its date is an official Vietnamese public holiday. Added ordinary weekdays, nonholiday weekends and nonholiday peak-season nights have zero additional night charge. Show each added date, holiday classification, quoted price and applied added-night charge separately before confirmation and retain it in history. These nights still require available inventory and atomic allocation even when their added-night charge is zero. Matched-night holiday differences and added-night charges MUST be disjoint so a night cannot be charged twice. The 20% original-booking fee is collected once. Removed nights MUST produce no SIMULATED refund, credit or deduction from the full 20% fee or applicable holiday charges. Show removed dates, recorded prices and zero refund/credit in review and history. Release their original inventory for resale only on successful atomic rescheduling under FR-029. Room counts may increase or decrease under the subsequent decision. Removed rooms produce no refund, credit or offset under the subsequent decision. Room matching follows the subsequent explicit traveler-pairing decision. Additional rooms follow the subsequent holiday-only pricing decision.

**Shortened-stay acceptance scenario and tests**

Given an original booking amount of 300 SIMULATED units and a current three-night itinerary, when the traveler changes to two nonholiday nights, then the additional payment is 60, the removed third night produces zero refund/credit, and its inventory is released on atomic success. A proposed remaining holiday night with a positive matched difference adds only that approved difference to 60. Automated tests MUST verify unchanged originalBookingAmount across repeated shortening, exact simulated balance/ledger effects, review/history disclosure of removed nights and zero refunds, resale visibility after commit, and preservation of all original allocations and balance on cutoff rejection, unavailable rooms or failed payment. Concurrent requests and retries MUST release each replaced allocation and charge the fee at most once.

**Hotel acceptance scenario and automated tests**

Given an original amount of 300 SIMULATED units and an approved nightly mapping with recorded current-night prices of 100 each, a proposed three-night stay has an ordinary night priced 180, an official holiday night priced 140 and another official holiday night priced 80. The ordinary night contributes zero, the holiday nights contribute 40 and zero, the fee is 60 and the total additional SIMULATED payment is 100. No refund or credit is created. Automated calculation and W/A/I review/history tests MUST cover mixed stays, all-nonholiday stays, multiple holiday nights with positive/zero/negative deltas, nonholiday weekends/peak season, Tết, cross-year calendars and Vietnam date boundaries. Failed-payment, concurrent inventory and retry tests MUST preserve the original booking and nightly price snapshots or commit exactly one complete change under FR-029. Tests MUST verify ordinal matching with unequal nightly baseline prices. Given recorded night prices [100, 200] and proposed official-holiday night prices [150, 180], the applied differences MUST be [50, 0], totaling 50, with no refund or cross-night offset. Reversing the recorded baseline order produces differences [0, 80], totaling 80, verifying that order determines the comparison. Tests MUST also verify ordinal indices/dates and the next-change baseline after success, and snapshot preservation after rejection, failure or retry. Automated acceptance requirements MUST include lengthening and shortening the stay, showing old/new check-in/check-out and night counts, checking every proposed room-night, releasing replaced old inventory on atomic success, and preserving the entire old stay on cutoff rejection, unavailable added nights, failed payment or retries. Added-night tests MUST cover an ordinary weekday, nonholiday weekend, nonholiday peak-season night, official holiday, Tết and a cross-year extension. For an original amount of 200 SIMULATED units, zero matched-night holiday difference, an added ordinary night quoted at 150 and an added holiday night quoted at 180, the additional payment MUST be 40 + 0 + 180 = 220. Assert that the ordinary added night is allocated despite its zero charge, the holiday night is charged exactly once, history/review show both, retries do not duplicate charges and failed payment or unavailable added nights preserve the original stay and balance. Removed-night tests MUST assert zero refund/credit and the full original-amount 20% fee, with applicable proposed-itinerary holiday charges collected separately. Room-count changes use the accepted added/removed-room pricing and explicit room-pairing rules above.

`originalBookingAmount` remains the amount of the initial booking across repeated changes; it excludes prior rescheduling fees. `currentItineraryPrice` and `newItineraryPrice` MUST be recorded separately from that original fee base. `currentItineraryPrice` MUST be the itinerary price recorded at initial booking or the last successful rescheduling, excluding rescheduling fees; subsequent catalog edits MUST NOT change this baseline. A successful rescheduling sets the baseline to its accepted `newItineraryPrice`, including when a nonholiday price difference is not charged or a cheaper itinerary yields no refund. The original booking amount remains unchanged for calculating every 20% fee. Negative price differences MUST NOT be refunded, credited or offset against the fee. For an itinerary where all applicable replacement prices are lower, holidayDifference is zero and the traveler MUST still pay the full 20% of the original booking amount, regardless of holiday classification.

**Rescheduling cutoff**: Each offering MUST have an administrator-configurable rescheduling cutoff before departure or hotel check-in. Validate BOTH the currently CONFIRMED itinerary against its applicable configured cutoff and the proposed itinerary against its own applicable configured cutoff. Apply holiday-specific cutoff rules separately to each itinerary where configured; holiday-specific cutoff rules do not change the holiday-only price-difference formula. Reject if either cutoff is violated. Travelers MUST see both applicable deadlines before confirmation and a clear rejection reason identifying the failing current/proposed deadline when rejected. Shared business rules MUST enforce eligibility; client-supplied values cannot override it. Both cutoff checks and inventory validation MUST succeed before any simulated 20% fee or applicable public-holiday price difference is charged. Rejection preserves the original booking, allocated inventory, recorded price baseline and simulated balance with zero debit. Capture one authoritative server-side request timestamp (`requestTime`) for both eligibility checks; the client device clock MUST NOT establish eligibility. Calculate each cutoff deadline from that itinerary’s departure/check-in using its applicable service timezone and configured cutoff duration, including holiday-specific duration where configured. Both `requestTime < currentCutoffDeadline` AND `requestTime < proposedCutoffDeadline` MUST hold. Equality or a later timestamp at either deadline rejects the entire operation, with zero rescheduling fee or holiday-difference charge and no change to the original booking, inventory or simulated balance. Configured durations MUST be whole hours greater than or equal to zero. Both cutoff values must be explicitly configured before sale. Both holiday classification and all cancellation/rescheduling cutoff calculations use Asia/Ho_Chi_Minh.

**Cutoff acceptance criteria and automated tests**: Controlled-clock tests MUST cover current passes/proposed passes, current fails/proposed passes, current passes/proposed fails, and both fail. Only the first combination may proceed to payment after inventory validation. For each rejection, assert a clear failing-deadline reason, unchanged original CONFIRMED booking and allocated inventory, unchanged simulated balance and zero new successful charge. Test one second before, exactly at and one second after each deadline independently while the other deadline passes: one second before passes cutoff eligibility, while equality and one second after reject with zero debit. Repeat with the other itinerary failing and with both failing. Include client clocks deliberately ahead/behind the authoritative server requestTime, timezone-offset-equivalent instants, local date boundaries and configured holiday-specific deadlines; assert identical eligibility for equivalent instants and correct service-timezone deadline calculation. Passing cutoffs alone never guarantees payment success or inventory availability. Test distinct configured cutoffs and holiday-specific rules for current and proposed itineraries, including ordinary-to-holiday and holiday-to-ordinary changes, plus unauthorized configuration attempts. Repeat with unavailable inventory, failed payment and concurrent inventory changes to verify no premature charge or loss of the original reservation. Automated unit, integration and W/A/I acceptance tests MUST precede implementation under FR-019.

**Versioned cutoff policies**: The current CONFIRMED itinerary MUST use the immutable policy snapshot saved when it was booked or last successfully rescheduled. The proposed itinerary MUST use the policy effective when the rescheduling request is reviewed. Display the proposed policy, including version, cutoff duration, applicable timezone and deadline, before explicit confirmation. New bookings MUST save the policy effective for their booking; administrator edits create a new version and MUST NOT retroactively alter existing itinerary snapshots. After successful rescheduling, atomically save the reviewed proposed policy as the new itinerary’s immutable snapshot; retain the prior snapshot in history. Each snapshot MUST contain policy version, cutoff duration, applicable service timezone and configured holiday-specific rules used for that itinerary. Use the same authoritative server requestTime for strict checks against both snapshot-derived deadlines. A rejected or failed change MUST preserve the original snapshot, booking, inventory and balance and produce zero charge. The proposed cutoff policy version shown at review MUST remain bound to that request through confirmation, even if an administrator publishes a newer version meanwhile. A policy edit alone MUST NOT invalidate the review or silently substitute the newer version; successful rescheduling saves exactly the reviewed version. This preserves only the reviewed policy version: strict deadline checks, explicit confirmation, payment, live inventory validation and existing hold expiry requirements still apply. No indefinite inventory hold or deadline exemption is granted.

**Versioned-policy acceptance tests**: Automated tests MUST show that an administrator edit after booking leaves the existing policy version/duration/timezone unchanged; a new booking saves the updated version; and current/proposed checks use their respective saved/review-effective policies. Success atomically adopts the reviewed proposed snapshot and retains the old snapshot in history; rejected/failed changes preserve the old snapshot with zero debit. Replay each case one second before, exactly at and one second after the applicable deadlines, including different holiday-specific rules and timezones. Exact equality and later MUST reject if either deadline fails. Retry and failure-injection tests MUST verify no duplicate snapshot adoption, charge or history success. Also test review under version V1 followed by an administrator update to V2 before confirmation: that request MUST evaluate and adopt V1 on success, a newly reviewed request MUST use V2, and existing confirmed itinerary snapshots MUST remain unchanged. Failure/rejection and retries MUST preserve or adopt the correct snapshots exactly once with no extra debit. These are future test obligations under FR-019, not executed feature tests.

**Holiday classification**: Determine the newly selected service date in `Asia/Ho_Chi_Minh`. Use a maintained, year-specific Vietnamese public-holiday calendar covering lunar-calendar holidays including Tết and officially announced arrangements where applicable. Calendar records MUST identify year, version and official source/reference, including applicable announced arrangements; no fixed Gregorian approximation of lunar holidays or reuse of another year's dates is permitted. Missing/unverified year coverage cannot be silently treated as a nonholiday. Authorized administrators MUST manually enter/update each year’s calendar and approve its version before use. Record the official source/reference, calendar year, version, administrator identities, review/approval timestamps and changes, including lunar-calendar holidays and applicable official announcements. Unapproved draft versions MUST NOT establish payment eligibility or holiday pricing. Calendar edits MUST retain versions referenced by past reviews/transactions. Missing approved year coverage blocks rescheduling under the rule below. Calendar updates between review/payment follow the latest-approved revalidation rule below. Hotel price classification follows each room-night under the hotel formula above.

**Calendar update revalidation and automated tests**

Before committing a rescheduling payment, re-evaluate every relevant proposed service date using the latest approved year-specific holiday calendar and recalculate matched holiday differences and added room/night charges. If any relevant classification or total additional payment differs from the reviewed version, require a new complete review and explicit traveler confirmation before any debit or final inventory replacement. Preserve the original confirmed booking, allocations, price/policy snapshots and balance while awaiting confirmation. Display the updated classifications, calendar versions, line-item differences, fee and total. Declining or abandoning the new review leaves the original booking intact. Existing proposed holds retain their issued expiry under FR-024.

If only the calendar version changes and relevant classifications and total remain identical, explicit reconfirmation is not required by this rule. Record both reviewed and final validated versions and the equivalence outcome in history. A completed transaction retains its recorded calendar evidence. Repeated or concurrent calendar publication/payment requests MUST never commit a stale classification/amount without required renewed confirmation or create duplicate charges.

Automated unit, integration and W/A/I/C acceptance tests MUST cover ordinary-to-holiday and holiday-to-ordinary corrections, a classification change with an unchanged total, changed added-room/night charges, and a version change with identical classifications/total. Assert zero debit until required reconfirmation, preservation on decline/hold expiry, exactly one debit on validated success and complete version/confirmation evidence. Include cross-year coverage, duplicate payment requests and concurrent approval/payment validation.

**Missing approved calendar year**

Rescheduling MUST require approved calendar coverage for every proposed service-date year needed for holiday classification. For hotels this includes every year containing a proposed room-night starting date, including added nights/rooms and cross-year stays. If any required year is missing or only has unapproved drafts, reject the entire change before additional payment or final allocation replacement. Show the traveler which year needs an approved holiday calendar and an actionable administrator configuration error. Preserve the original confirmed booking, inventory, price/policy snapshots and SIMULATED balance, with zero charge. Approval of complete coverage permits a new validated review.

Automated unit, integration and W/A/I/C acceptance tests MUST cover a tour with missing year coverage, draft-only calendars, a hotel stay spanning two years with just one approved year, and a stay with all required years approved. Rejected cases MUST show the missing year, preserve the original reservation/balance and create no charge or completed change. Test direct payment bypass, repeat requests, concurrent calendar approval and rescheduling, and unchanged inventory/payment invariants. After approval, a fresh eligible review may proceed using the approved version.

**Measurable acceptance criteria**: Before explicit confirmation and before any additional debit, review MUST display the new date's holiday/nonholiday classification (holiday name where applicable), and all eight items: original date/time; new date/time (including applicable hotel stay dates); traveler/guest count; new seat/room availability; original booking amount; 20% rescheduling fee; the holiday-only price difference separately, explicitly zero for nonholidays; and total additional SIMULATED payment. For an original amount of 100 units with zero price difference, each eligible successful change charges exactly 20 additional SIMULATED units. All payments, balances, fees and refunds are labeled SIMULATED; only registered synthetic Mastercard-style cards are used under FR-020–FR-022. Missing confirmation or changed reviewed details causes zero debit until renewed confirmation. Client amount tampering cannot change the authoritative fee. Nonowners and non-CONFIRMED bookings cannot reschedule.

**Errors and edge cases**: Rejected tour traveler-count changes, changed quote/calendar version, missing year/calendar coverage, Tết spanning Gregorian dates, December/January changes, UTC versus Vietnam midnight, weekends/peak-season/unofficial festivals, price increase/decrease, fractional fee/rounding, multi-date hotel stays, altered guest count, already changed booking, identical requested slot, past date, invalid hotel stay, unauthorized request.

**Verification approach**: Automated fee calculation and validation unit tests, ownership/contract tests, and complete review/payment regression journeys on W/A/I, written before implementation under FR-019. Include original-amount fee basis across repeated eligible changes, synthetic-card failures and disclosure assertions. Automated acceptance tests MUST cover ordinary weekdays; nonholiday weekends and peak-season dates; official Vietnamese public holidays and applicable announced arrangements; lunar New Year/Tết using the relevant year; cross-year calendars; Asia/Ho_Chi_Minh midnight boundaries; higher, equal and lower new prices; and missing calendar coverage. Assert the formula and classification disclosure in each case. For lower new prices, automated tests MUST assert zero refund/credit transactions, no offset against the fee, exactly the full 20% additional debit, and a final balance equal to the initial balance minus that debit. Repeat for ordinary dates, weekends and official public holidays, including Tết and cross-year changes.

**Existing versus proposed / dependencies**: Mandatory user-specified scope, not verified application behavior. Holiday-only positive-difference collection and the 20% fee are resolved. Manual administrator maintenance and version approval are resolved. Missing approved year coverage blocks rescheduling. Latest-approved calendar revalidation and renewed confirmation are mandatory when classifications or total change.

**Acceptance examples**: All amounts below are SIMULATED; original booking amount is 100, so the fee is 20. Calendar classifications are controlled fixtures, not asserted real holiday dates. Every lower-price example produces zero SIMULATED refund/credit and still requires the full 20% fee.

| Current date classification | New date classification | Current itinerary price | New itinerary price | Holiday difference | Additional payment |
| --- | --- | --- | --- | --- | --- |
| Ordinary | Ordinary | 100 | 140 | 0 | 20 |
| Ordinary | Nonholiday weekend/peak season | 100 | 140 | 0 | 20 |
| Ordinary | Vietnamese public holiday | 100 | 140 | 40 | 60 |
| Vietnamese public holiday | Ordinary | 140 | 100 | 0 | 20 |
| Vietnamese public holiday | Another Vietnamese public holiday | 140 | 160 | 20 | 40 |
| Vietnamese public holiday | Another Vietnamese public holiday | 140 | 120 | 0 | 20 |
| Ordinary | Tết public holiday in selected year | 100 | 140 | 40 | 60 |

**Unlimited-change acceptance tests**: Automated unit, integration and W/A/I journeys MUST exercise at least three successive successful changes to one eligible booking and verify that no count-based rejection occurs. Each success MUST charge exactly once using the unchanged original fee base, adopt the correct price/cutoff snapshots and append complete history. Retries MUST not create extra changes or charges. A later request that fails either cutoff, inventory validation or payment MUST preserve the last confirmed itinerary, snapshots, allocation and balance.

**Replacement-selection acceptance tests**: With traveler A holding old seat S1 on departure D1 and selecting available seat S2 on D2, successful rescheduling MUST secure S2/D2 and release S1/D1 atomically. Traveler B MUST then see S1/D1 available and be able to select/book it. Before commit or after payment failure, hold expiry, cutoff rejection or inventory conflict, S1/D1 remains assigned to A and B cannot book it. Test concurrent attempts for S2/D2 and for newly released S1/D1, retries after lost responses, and equivalent room/date-range cases, asserting no duplicate debit/release, double booking or overselling. Shared inventory integration tests and W/A/I visibility journeys MUST precede implementation under FR-019.

**Repeated-change acceptance scenario**: Given an original amount and recorded initial itinerary price of 100 SIMULATED units, when a successful nonholiday rescheduling accepts a new itinerary price of 140, then 20 is charged and the recorded current itinerary price becomes 140 while the original amount stays 100. If the old slot's catalog price later changes to 180 and the traveler successfully changes to an official public-holiday itinerary priced at 160, then the additional payment is 20 + max(0, 160 - 140) = 40, not 20. Automated tests MUST assert these baselines, history and balances, and verify failed or duplicate changes cannot advance the baseline or compound the fee. Repeat after a cheaper successful change to verify its accepted price becomes the next baseline without issuing a refund.

**Additional cheaper-date acceptance scenario**: Given an original booking amount of 100 SIMULATED units, a current itinerary price of 140, a new itinerary price of 100 and a simulated balance of 50, when an eligible rescheduling succeeds to either an ordinary date or an official Vietnamese public holiday, then holidayDifference is zero, exactly 20 is debited, the final balance is 30 and no refund or credit is recorded. A failed payment preserves the original reservation and balance of 50.

#### FR-029 — Atomic rescheduling payment and inventory replacement

**User story**: US-04.

**Supported platforms**: W/A/I; shared booking, inventory and simulated bank; C authorized visibility.

**Requirement and user value**: Both current and proposed itinerary cutoffs under FR-028 MUST pass, and availability MUST be validated, before any rescheduling charge. Availability MUST be enforced when committing the change. The original reservation MUST remain secured until the new reservation and additional simulated payment are successfully secured. Booking update, new allocation, original allocation release, simulated bank debit, transaction, adoption of the exact proposed rescheduling-cutoff policy snapshot shown at review (even after subsequent administrator edits), adoption of the exact cancellation-policy snapshot displayed at review despite later administrator edits, adoption of the exact no-show policy snapshot displayed at review despite later administrator edits, adoption of the displayed hotel check-in/checkout hour snapshot where applicable and success-history entry MUST commit atomically and idempotently.

**Measurable acceptance criteria**: The committed additional payment MUST equal the confirmed FR-028 holiday-only formula using recorded original/current/new amounts and the recorded year-specific calendar classification. The current itinerary price baseline changes only as part of a successful atomic rescheduling; failure preserves the previous baseline as well as the original booking and inventory. If a proposed new price or calendar change invalidates the reviewed total/classification, renewed explicit confirmation is required before charging; original inventory remains protected. A successful operation produces one updated CONFIRMED booking, one secured new allocation, release of only the replaced original allocation into available inventory visible/selectable to other travelers for its original dates/times when the service remains on sale, one authorized additional payment and one linked success-history entry. For unavailable inventory, payment failure, insufficient balance, expired new hold or injected failure at any write boundary, the original booking/date/time/allocation remains unchanged and no additional debit or partial successful change persists. Abandoned proposed holds expire under FR-024 without affecting the original booking. Concurrent last-unit attempts never oversell. Repeated requests for the same logical change return the same committed result and transaction without duplicate fees/debits, allocation or release. Reused request identity with different details is rejected. Competing changes against the same prior booking state cannot both succeed; cancellation/rescheduling races cannot leave a canceled reservation newly allocated or charged. Balances never become negative. For cheaper replacements, the atomic operation MUST collect the full 20% fee and create no price-difference refund or credit.

**Failed-payment proposed hold**

A definitively failed additional payment preserves the original confirmed booking and leaves its proposed temporary hold valid only until the original issued expiry under FR-024. This temporary hold does not count as a completed replacement. Retry within that interval remains subject to all validation and idempotency requirements. Expiry releases only the proposed temporary allocation.

**Errors and edge cases**: Availability lost after review, payment/expiry race, network timeout after commit, duplicate requests from different clients, simultaneous distinct changes, cancellation race, overlapping hotel stays and partial inventory reuse, cleanup-worker outage.

**Verification approach**: Automated integration tests with concurrent requests, controlled-clock hold expiry, and failure injection across all mutation boundaries. Assert balances, ledger, booking, old/new inventory and success history together after each case; test retries after a lost success response and regress original booking/cancellation journeys. Repeat failed-payment and concurrent last-unit inventory tests for ordinary and holiday classifications, with higher/lower prices and cross-year calendars; assert no original reservation loss or duplicate 20% fee/holiday difference. Tests MUST precede implementation and use synthetic fixtures only.

**Existing versus proposed / dependencies**: Transactional replacement and duplicate prevention are mandatory. FR-023 defines occupancy and FR-028 defines accepted cutoff rules. FR-020 requires the original source account for each additional payment.

#### FR-030 — Complete attributable rescheduling history

**User story**: US-04; US-07 for authorized history access.

**Supported platforms**: W/A/I own booking/history; C authorized booking/transaction history.

**Requirement and user value**: The system MUST retain a complete ordered rescheduling history linked to the durable booking and original payment. Record each logical attempt and its outcome, including failures, without confusing retries with new successful changes. Successful history MUST be atomic with FR-029.

**Measurable acceptance criteria**: Each logical attempt records its identity, actor, authoritative server requestTime, original and proposed dates/times with accepted hotel-hour snapshots/configuration references where applicable and both immutable rescheduling-cutoff policy snapshots and current/proposed cancellation-policy and no-show grace snapshots (including graceMinutes) with evidence of the version displayed at review, policy versions and evidence of the proposed version shown at review, applicable service timezones, configured elapsed-hour durations and applied holiday-specific rules, guest count, unchanged hotel total and old/new per-room guest distributions, original/proposed seat or room selection, explicit old/new room pairing and availability outcome, both applicable cutoff rules/deadlines and check outcomes with rejection reason where applicable, original booking amount, current/new itinerary price snapshots with the booking or successful rescheduling that established each baseline, 20% fee, new service date in Asia/Ho_Chi_Minh, holiday classification/name, calendar year/version and official-source reference, reviewed/final calendar versions with revalidation and reconfirmation evidence where applicable, raw price delta, old/new stay lengths, added/removed unmatched nights with recorded removed-night prices and zero refund/credit, hotel nightly ordinal indices, old/new dates and starting service dates in Asia/Ho_Chi_Minh, recorded baseline prices, proposed prices, classifications and differences where applicable, applied holidayDifference, each added-night or added-room identifier/date/quoted price/classification/applied charge and deduplicated addedHolidayNightCharge total, zero refund/credit for a negative delta, total additional SIMULATED amount, confirmation evidence, outcome/reason and transaction reference when present. Reload across supported clients preserves ordered history; previous successful entries remain unchanged after subsequent changes. Failed attempts show no successful debit or replacement; retries link to the same logical attempt and never duplicate success entries. Failed-attempt records may persist while booking/payment/inventory remain unchanged. Nonowners/unauthorized roles see no private history; history contains no real card data, synthetic CVVs or secrets.

**Errors and edge cases**: Retry after lost response, rejection before payment, interrupted attempt, concurrent history writes, unauthorized access and accidental card-data logging.

**Verification approach**: Automated history/ledger reconciliation, including reconciliation of all successful rescheduling payments into the later FR-027 voluntary and administrator cancellation bases, persistence, ordering, duplicate/retry and access-control tests, plus W/A/I/C authorized visibility tests. Tests MUST reconstruct the FR-028 formula from recorded price/calendar evidence for ordinary, weekend, holiday, Tết and cross-year changes, including later calendar updates without rewriting previous history. For lower-price changes, history/ledger tests MUST assert that the negative raw delta remains visible, holidayDifference is zero, no refund/credit exists and the full 20% fee reconciles to the additional debit. Every successful test change MUST have one matching payment and history entry, and every rejected/failed attempt MUST preserve the original reservation.

**Existing versus proposed / dependencies**: New required history, not runtime verification. FR-014 governs the accepted history retention, deletion/anonymization and backup deadlines.

### Key Entities *(include if feature involves data)*

- **Account/Profile**: identity, assigned role, permitted profile fields, account status, session issue/last-activity/revocation evidence. FR-001 defines session expiry and FR-014 defines retention.
- **Destination**: identity, name, location, descriptive content and related service references.
- **Tour/Hotel Offering**: catalog identity, location, authoritative price in VND, active state, per-hotel check-in/checkout local times in Asia/Ho_Chi_Minh;
  administrators manage physical rooms with stable hotel-scoped identifiers/display numbers, room-night inventory and maximum total guest capacity per room/type. Each person counts as one place. Tour capacity belongs to each departure date/time, with one place per traveler. Hotel inventory uses [checkInDate, checkOutDate) room-night dates in Asia/Ho_Chi_Minh, allowing adjacent stays.
- **Booking**: durable identity, traveler, offering, dates/times and accepted hotel check-in/checkout hour snapshots where applicable, quantities, applicable seats and exact hotel room identifiers/numbers, authoritative total, reviewed policy and explicit confirmation evidence, booking state, immutable current-itinerary rescheduling-cutoff, cancellation-policy and no-show snapshots (versions, cutoff durations in hours, no-show grace in minutes, timezones and applicable rules), and cancellation actor/reason.
- **Rescheduling Attempt/History**: logical attempt identity, booking and original payment linkage, actor/time, before/after schedule and seat/room selections, guest count, availability, original amount, current/new itinerary prices, calendar year/version/source, Vietnam service date and holiday classification, 20% fee, raw delta and applied holidayDifference, additional total, confirmation evidence, outcome/reason and transaction linkage; immutable successful history and ordered attempts under FR-030.
- **Payment Record**: booking association, amount and VND currency, mode, evidence reference and payment state;
  synthetic ledger evidence establishes payment. FR-020 records the common source account and rounding. FR-027 defines linked cancellation refunds/retained fees.
- **Simulated Bank Account/Card/Transaction**: synthetic account/card/CVV, owner, expiry, balance,
  status and charge/refund history; no real financial credentials.
- **Inventory/Hold**: offering, relevant dates/departure, quantity, owner, saved timeout duration/configuration reference, authoritative server creation time, issued immutable expiry and
  allocation state; active holds and confirmed bookings consume the same finite capacity.
- **Recognition Request/Result**: authorized input scope, landmark/object task, provenance, class/candidate,
  uncertainty and unknown/error outcome. FR-014 requires input disposal after inference and 30-day metadata retention.
- **Model/Evaluation Record**: dataset rights/version/split, cultural taxonomy, training provenance,
  model artifact identity, quality/runtime evidence and promotion decision.
- **Post/Comment/Like/Share/Follow**: author/actor, target, content, moderation and relationship state.
- **Conversation/Message**: authorized participants, sender, message identity/content/order/read state.
- **Notification**: recipient scope, source event, linked target, read state and reminder identity.
- **Approval/Retention/Audit Record**: approved action or transfer scope, actor, purpose/destination,
  time, approved category-specific retention/deletion limits and deletion outcome; must not duplicate secrets or private payloads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of confirmed mandatory FRs have requirement-linked acceptance evidence for every
  assigned platform; no required failing or skipped test is reported as a completed requirement.
- **SC-002**: All approved account, discovery, booking, feed, conversation, notification and admin
  fixture journeys finish with the expected persisted state; no legacy mandatory regression fails.
- **SC-003**: All unauthorized ownership/role/subscription and denied-transfer scenarios expose zero
  protected records and cause zero unauthorized mutations or external user-data transfers.
- **SC-004**: Zero payment-success outcomes arise solely from a booking response, timer, redirect,
  or locally generated reference; all selected payment-mode failure/retry scenarios remain truthful.
- **SC-005**: Landmark top-1 accuracy is at least 0.90 on at least 200 known test images and false-known rate at most 0.05 on at least 200 unknown/negative images. Cultural detection uses at least 200 independent images per approved class plus 200 unknown/negative examples and meets mAP@0.5 at least 0.75, per-class precision at least 0.85 and recall at least 0.80. Each reference device sustains at least ten processed frames/second with p95 capture-to-result at most 300 ms. Landmark p95 latency is at most five seconds under FR-019 conditions.
- **SC-006**: All FR-014 category retention/deletion tests meet their exact limits, including 30-day active deletion, 60-day residual backup maximum, 30-day recognition metadata and rolling 12-month messages/audit/booking-ledger rules. Denied/revoked consent and disabled destinations produce zero outbound transfers.
- **SC-007**: All primary journeys in the approved platform matrix pass parity and accessible-control
  checks; unknown destinations and recognition results never silently become different known results.

- **SC-008**: Synthetic banking concurrency/retry tests produce zero duplicate debits/refunds, double bookings, negative
  balances, oversold allocations or confirmed unpaid bookings; every debit/refund reconciles to
  its booking and original transaction. Expired unpaid holds cease blocking capacity at expiry.
- **SC-009**: 100% of displayed card payments, balances, fees and refunds are labeled SIMULATED; zero real card/CVV records are stored
  and zero real payment gateway requests are made.

- **SC-010**: Every successful rescheduling in the approved synthetic acceptance suite charges a 20% fee based on the original booking amount, reconciles its additional payment and history, and atomically replaces inventory. Zero failed changes lose the original reservation; zero retries duplicate rescheduling charges. All eight review items plus holiday classification appear before confirmation on W/A/I; every charged price difference is positive and applies only to a newly selected Vietnamese public holiday, with hotel differences restricted to individual holiday room-nights under the correct year-specific calendar and Asia/Ho_Chi_Minh date. Cheaper-date cases MUST produce zero price-difference refunds/credits and retain the full 20% fee; eligibility checks follow FR-027 and the single-source account rule follows FR-020.

These are release acceptance criteria, not observed outcomes. User research sample sizes,
completion-time budgets, expected load and satisfaction targets are not invented; FR-019 defines the approved numerical operating and user-experience bounds. Fixture coverage alone does not
prove real-world recognition accuracy or production-scale performance.

## Assumptions

### Constraints and Dependencies

- Scope is one cross-platform initiative with the confirmed first-release platform coverage above; implementation sequencing is not decided here.
- USER and ADMIN are the only required roles; no separate provider roles are included.
- Existing email/password access remains the required account journey. FR-001 defines seven-day absolute and 24-hour inactivity session expiry. Recovery, verification and SSO are outside the accepted release scope.
- Shared backend and AI services are preserved; database and infrastructure changes need repository
  validation and approved impact assessment. No rewrite or replacement platform is proposed.
- No offline booking, native push, external messaging channels, live payments, provider portal,
  trip-planner reconstruction, or restaurant booking is implicitly authorized.
- Existing supplementary recognition providers are not automatically enabled or authorized. Wikimedia/
  Wikipedia lookups and remote image hosts also require data-flow review; approval of Cloud Vision
  alone does not authorize other destinations.
- Model artifacts, licensed representative data, safe test environments and target devices are
  dependencies for later verification. None were provisioned or contacted for this specification.
- Requirements derive from the user's stated initiative, current source behavior, and constitution;
  all final business policy and numerical targets are recorded in the accepted Q1–Q3 package below.

### Accepted Completion Decisions

Q1 — Final business policy decisions

**Accepted 2026-11-06**. User selected A to approve the complete Q1–Q3 package.

**Approved requirements**

- All successful original and rescheduling payments for a booking use the same traveler-owned synthetic bank account. Another registered ACTIVE synthetic card attached to that account may pay. Refunds credit that recorded account even when its cards expire or become nonpayable. Every charge and refund MUST retain the common source-account reference.
- Eligible voluntary cancellation means an owned CONFIRMED booking whose authoritative request precedes the saved cancellation deadline and whose cancellation has not already committed. Resellable future allocations return to availability on atomic cancellation when the service remains on sale. Existing no-show, administrator cancellation and retry rules continue to apply.
- Session lifetime is seven days with 24-hour inactivity expiry. Logout, password change and account blocking revoke existing sessions. Recovery, verification and SSO are outside this release's required scope. All approved account/profile journeys remain required on Web, Android and iOS.
- Approved public-feed content is visible to signed-in active travelers. Author edits return posts to pending moderation. Any two active USER accounts may exchange private messages. Only the participants may read the conversation. Content deletion and retention follow Q2.
- In-app notifications cover booking confirmation, rescheduling, cancellation/refund, no-show/correction and incoming messages. Service reminders occur 24 hours and one hour before the currently confirmed departure/check-in in Asia/Ho_Chi_Minh. Emit only reminders whose trigger time is still future at confirmation. Rescheduling supersedes old scheduled reminders. Retries emit each applicable reminder once. Existing required administrative notifications remain scoped to ADMIN. Native push, email and SMS remain outside the confirmed release scope.

Affected requirements are FR-001, FR-008 through FR-012 and FR-020 through FR-030. These decisions are integrated into the governing requirements below their stable FR identifiers.

Q2 — Data transfers, retention and deletion

**Accepted 2026-11-06**. Applies to FR-014 and all linked records and transfers.

**Approved requirements**

- Account records remain while the account is active. Posts remain until deletion and messages have a rolling 12-month retention limit. Recognition inputs are discarded after inference completes and recognition metadata is retained for 30 days. Booking, SIMULATED payment/refund history and administrative audit events are retained for 12 months after the booking's service end or terminal cancellation event, whichever is later.
- User-requested deletion removes active personal records and linked media within 30 days. Deletion can anonymize retained booking/ledger/audit references while preserving accounting and referential integrity. Backups expire within a further 30 days, giving a 60-day maximum for residual backup copies. Restores reapply deletion records before access is enabled. No unspecified retention hold extends these limits. Any future hold requires its own explicitly accepted scope and duration.
- External recognition requires a user action and consent naming destination, purpose and data scope. Google Cloud Vision may receive only authorized nonpersonal landmark images. Self-hosted FastAPI/YOLO receives approved nonpersonal inference inputs. Personal images and account/payment data remain prohibited AI-service inputs. Consent revocation stops future transfers. Wikipedia, Wikimedia, supplementary AI enrichment, external telemetry and remote-media transfers of user data stay disabled until separately approved. Product consent MUST be collected before each applicable external transfer. Specification activity remains confined to local documents.
- Kaggle receives only licensed or author-owned nonpersonal training/evaluation data after separate transfer approval. Credentials and production/private data remain excluded. Routine tests use synthetic fixtures and controlled provider doubles. Retention is enforced and tested for each data category, including derived copies, logs, restored backups and deletion/anonymization links.

Affected requirements are FR-005 through FR-007, FR-010 through FR-016 and FR-020 through FR-030, plus SC-003 and SC-006. The approved retention periods and destinations are mandatory acceptance rules under FR-014.

Q3 — Recognition, platform and operating acceptance bounds

**Accepted 2026-11-06**. Defines the required measurable evaluation targets.

**Approved requirements**

- Initial cultural object classes are nón lá, áo dài, trống đồng, Vietnamese lantern and tuồng mask. A versioned evaluation manifest records label definitions, source/license, representative conditions and a held-out test set with at least 200 independent images per class plus 200 unknown/negative examples. Landmark evaluation uses at least 200 licensed nonpersonal known-landmark images and 200 unknown/negative examples with independently reviewed ground truth. Training/tuning and test data remain separate.
- Cultural evaluation requires mAP@0.5 of at least 0.75 and per-class precision of at least 0.85 and recall of at least 0.80. Landmark top-1 accuracy is at least 0.90 on known fixtures and false-known classification is at most 0.05 on unknown fixtures. Report results per class and dataset version. These approved acceptance targets require measured evidence before delivery acceptance.
- Web/Admin acceptance covers the current and preceding major Chrome, Edge, Firefox and Safari versions at release. Mobile acceptance covers Android 10 or later and iOS 16 or later. Record exact versions in the release matrix. Recognition performance reference devices are an Android Snapdragon 778G device with 6 GB RAM and an iPhone 12. Required parity, permission and accessibility journeys remain as already specified.
- At the declared acceptance load of 50 simultaneous synthetic users over a ten-minute run, ordinary API operations complete at p95 within two seconds and booking/payment/refund/rescheduling within three seconds. Message delivery to an online authorized participant completes at p95 within two seconds. Landmark requests complete at p95 within five seconds. Live detection sustains at least ten processed frames per second and p95 capture-to-result latency at most 300 milliseconds on each reference device under the recorded test setup. All concurrency runs preserve the payment/inventory invariants and contain no required failing cases.
- Verify operating latency on a controlled connection of at least 20 Mbps with 50 ms round-trip delay and record server, model, device and network conditions. Provider outages, malformed inputs, unknown recognition, permissions and offline states follow each FR's explicit failure cases. Paid/live external evaluations require separate scoped approval under Q2.

Affected requirements are FR-005 through FR-007, FR-011, FR-017 and FR-019, plus SC-005 and SC-007. The approved classes, datasets, device matrix and numerical targets govern the acceptance suite.

All accepted booking, cancellation, no-show, holiday and inventory policies remain governing requirements. Q1 through Q3 were accepted together on 2026-11-06 and are integrated into the affected requirements. Checklist revalidation follows the accepted requirement text. Application/model/device verification remains a later evidence gate under FR-019 and Constitution I/IX.

### Constitution Compliance Review

| Principle | Accepted specification evidence and remaining gate |
| --- | --- |
| I. Test-first and quality | Each FR defines future automated verification. FR-019 requires tests before behavior and current-state execution evidence for delivery. |
| II. Privacy/security | FR-013/FR-014 enforce ownership, scoped consent, synthetic/nonpersonal inputs and accepted category retention/deletion. |
| III. Specification quality | FR-001 through FR-030 retain stable IDs, linked stories, platform coverage and measurable accepted criteria. |
| IV. Mandatory clarification | All Q1–Q3 completion decisions were explicitly accepted on 2026-11-06 and integrated into governing requirements. |
| V. Plan quality gate | Specification decision review is complete. The mixed checklist retains delivery verification and overall completion gates. |
| VI. Task dependencies | FR-019 defines requirement references, dependencies and verification obligations for subsequent task work. |
| VII. Cross-document analysis | Constitution, accepted specification and checklist were reviewed together. Plans/tasks remain subsequent authorized stages. |
| VIII. Controlled implementation | Delivery-verification and overall checklist items stay open until their required evidence exists. |
| IX. Convergence | CONVERGED requires passing current-code/model/device evidence under FR-019. |
| X. Architecture | FR-017/FR-018 preserve existing shared services, clients, source, data and approved platform coverage. |
| XI. Governance | User acceptance covers specification Q1–Q3. All subsequent stages retain their own scope and evidence gates. |

**Final specification review 2026-11-06**

All Q1–Q3 packages are accepted and integrated. FR-001 through FR-030 retain their identifiers and all seven required descriptive fields. Functional, privacy, platform and performance targets are explicit. Automated acceptance obligations cover original booking, rescheduling, cancellation, no-show, holds, banking, inventory, ownership, retention and inference quality/runtime.

The requirements checklist now passes 21 of 23 items. Five items changed from pending to passing after approved decision integration. The remaining items are established/verified feature outcomes and overall checklist completion. They require executed application/model/device evidence under FR-019 and Constitution I/IX. Specification acceptance alone supplies documentation coverage evidence.

**Local delivery-evidence audit 2026-11-06**

| Check | Command or inspected evidence | Result |
| --- | --- | --- |
| Traveler web production build | `npm run build -- --outDir /tmp/travelai-web-check-IBndT6` in frontend | PASS, exit 0. Vite transformed 1598 modules. Output was isolated under /tmp. |
| Admin production build | `npm run build -- --outDir /tmp/travelai-admin-check-XkMLro` in admin | PASS, exit 0. Vite transformed 2628 modules. Warnings include ignored dependency use-client directives, stale browser data and a bundle above 500 kB. |
| Mobile TypeScript | `./node_modules/.bin/tsc --noEmit --incremental false` in apps/mobile | FAIL, exit 2. `src/components/app-tabs.web.tsx:38` reports TS2322 due to incompatible ref types. |
| Mobile lint | `./node_modules/.bin/eslint .` in apps/mobile | UNAVAILABLE, exit 127. Local ESLint executable is missing. |
| Web/admin automated feature-test commands | Inspected package scripts | Neither package exposes a test command. |
| Backend test inventory | `backend/src/test/java/com/travelai/backend/BackendApplicationTests.java` | One empty `contextLoads` test using SpringBootTest. An isolated database-backed business acceptance suite was not found in the inspected test tree. |
| Payment correctness path | `frontend/src/pages/Booking/Payment.jsx:101` | The inspected checkout marks payment successful after an 800 ms timer following booking creation. FR-009/FR-020–FR-022 require authoritative simulated-bank settlement. |
| Tour change and confirmation path | `TourBookingController.java`, update and approve methods | Inspected update changes guest count/date/price and saves directly. Approve assigns APPROVED directly. These paths lack the FR-028/FR-029 fee, immutable traveler-count and payment/inventory atomicity obligations. |
| Native traveler delivery | `apps/mobile/src/app/index.tsx` | Inspected home screen remains the Expo starter. Required traveler parity and reference-device evaluation evidence are outstanding. |

The build results establish compilation/package output for the checked clients. FR-019 delivery verification additionally requires passing requirement-linked banking, booking, inventory, privacy, AI and device journeys. The failed/unavailable mobile checks and the inspected behavioral gaps keep feature outcomes and overall checklist completion open at 21/23. Remediation requires a separately authorized planning/implementation stage under the user's existing scope restriction. Existing source and local changes were preserved during this audit.

**Quality gate outcome**

Specification decisions and measurable acceptance definitions are complete. Delivery verification and overall mixed-checklist completion remain open. The authorized activity concludes with the updated specification and checklist.
