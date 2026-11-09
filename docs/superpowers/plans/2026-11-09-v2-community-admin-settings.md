# Harden v2 Community, Admin Analytics và System Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden v2 `backend/` + `apps/mobile/` to close the visibility/concurrency + settings + analytics + `mvn` toolchain risk without re-architecting the done work.

**Architecture:** Patch the existing v2 stack (Spring Boot + PostgreSQL + Expo mobile) by adding three small seam services (`PostAccessPolicy`, `MaintenancePolicy`, `AnalyticsAggregation`) and a focused TestToolchain fix for `scripts/test-backend.sh`. No production migration; additive unique constraint on `likes` via Hibernate `ddl-auto=update`; no deploy/edge/AI changes.

**Tech Stack:** Java 21 (local), Spring Boot 3.5.14, PostgreSQL 16, JUnit 5 + MockMvc (`@SpringBootTest`), React Native/Expo (Jest-less node:test for mobile), Bash + curl + Playwright (Chromium contexts) for two-browser E2E.

**Spec:** `docs/superpowers/specs/2026-11-09-v2-community-admin-settings-design.md`

## Global Constraints

- Stack v2 only: `backend/` + `apps/mobile/` from `integration/ngoc-2.0@bf6c075`. No v1 (`client/` + `services/core/`) edits, no deploy/edge/AI/secret changes.
- Work exclusively in `business harness /Users/.../TravelAI-integration`, never mutate `/home/thuanc177/Projects/School/TravelAI` (dirty home branch `feat/wbs-hardening-acceptance`).
- Never `git add` binary/office artifacts; do not merge main at end; preserve production data; no re-seeding production or breaking API explicitly defined in the spec.
- All new Java files under `backend/src/main/java/com/travelai/backend/community/` and `backend/src/main/java/com/travelai/backend/admin/` are clean/existing packages — respect existing package naming (`controller/`, `booking/`, `security/`, `repository/`, `entity/`), reuse those packages where possible.
- Test-first: write failing regression test first; implement minimal code to pass; then full suite; never delete/xfail/skip unrelated tests.
- Logging: existing `NotificationPublisher` semantics (`save(Notification)` before/after commit handling) must remain; do not bypass realtime topics (`/topic/feed`).
- Branch/PR naming: branch `feat/wbs-v2-hardening` from `bf6c075`; Conventional Commits with issue binding `(<issue_id>)`, e.g. `feat(v2): add PostAccessPolicy (#<issue_id>)`. Do not push to `main`. One PR to `integration/ngoc-2.0`, one to `main` if required.
- Java version: JDK 21 default locally; `backend/pom.xml` retains Java 25 compile target. `scripts/test-backend.sh` must use `./mvnw` (or wrapper `./mvnw` in backend) and `-Djava.version=21` for local.
- Database: Production PG is not to be mutated; integration tests use isolated `initdb` (random port, `-k` temp socket) like `scripts/test-backend.sh` does today. Schema additive: `likes(post_id,user_id)` unique constraint; additive `reject_reason`, `rejected_at`, `rejected_by`, `moderation_history` columns via `ddl-auto=update` or explicit migration SQL; no dropping columns.
- Settings fields semantics: `siteName` length ≥ 1, `adminEmail` email shape, `maintenanceMode` boolean, `emailNotify`/`systemNotify` booleans, all non-null on update.
- Analytics authority: SIMULATED canonical bookings only (`booking_reservations` + `simulated_transactions` ledger); do not sum legacy `TourBooking`/`HotelBooking` entities; do not compute revenue from frontend.

## Review Focus

The five failure modes most likely to bite a person using this software:

1. **Cross-user post leak** — a neighbor somehow still likes/comments/shares a `PENDING`/`REJECTED` post via direct id or realtime replay. Expected: only `APPROVED` is visible to non-owner + `mapPost.originalPost` hides non-approved originals; test pins every REST + WS path and `/topic/feed` replay.
2. **Duplicate like / share count drift** — race on like (`likes` insert) or share (`shareCount` read-modify-write). Expected: DB unique constraint gives one like per `(post,user)`; share count is atomic `@Modifying`; tests do concurrent inserts and verify `DataIntegrityViolationException` handled as idempotent toggle.
3. **Maintenance blocking the wrong flow** — blocking login/register/profile/admin/cancel/refund or allowing a new `review`/`pay` while in maintenance. Expected: `MaintenancePolicy.shouldBlock` allows `READ, AUTH, PAY_EXISTING, CANCEL_REFUND, ADMIN`; blocks only `NEW_PURCHASE` (`POST /booking/reviews` canonical review). Tests exercise every endpoint class.
4. **Analytics counting legacy data locale/year** — including `HotelBooking`/`TourBooking`, counting `CONFIRMED` revenue as paid, or merging Dec-2025 + Jan-2026. Expected: `AnalyticsAggregation` buckets by `YYYY-MM` in `Asia/Ho_Chi_Minh`, sums only `CHARGE`/`REFUND` ledger for canonical reservations, counts only CONFIRMED/HISTORICAL canonical rows, descends from 12-month rolling window. Tests pin mixed-year fixtures.
5. **Admin UI guest/admin flash** and settings DTO leaking `maintenanceMode` to guests — frontend must gate on `auth.loading === false` before `user` null/role decision; public settings must omit internal flags. Tests render `<Screen protected>` and assert `publicSettings()` does not contain admin-only fields.

---

## Task 1 — TestToolchain Fix: `scripts/test-backend.sh` to `./mvnw`

**Goal:** Enable local backend tests on this host where `mvn` is missing (CI already uses `./mvnw test`).

**Files:**
- Modify: `scripts/test-backend.sh:26` (replace `mvn` with `./mvnw` wrapper semantics; keep `-o -Djava.version=21 -Dtravelai.build.directory="$test_root/build"`)
- Test: none (verify by running `bash scripts/test-backend.sh -q` — must exit 0 end-to-end).

**Interfaces:**
- Consumes: none.
- Produces: `scripts/test-backend.sh` runnable locally (`mvnw` available via `backend/mvnw` wrapper).

- [ ] **Step 1: Inspect current script and verify wrapper existence**

Run: `ls -la /home/thuanc177/.hermes/cache/scratch/travelai-plan-v2/backend/mvnw; command -v mvn || echo "mvn missing"`  
Expected: `mvnw` exists in `backend/`, `mvn` missing => reproduction of current failure.

- [ ] **Step 2: Patch script**

Modify `scripts/test-backend.sh` line 26 from:
```bash
mvn -o -Djava.version=21 -Dtravelai.build.directory="$test_root/build" "$@" test
```
to:
```bash
./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$test_root/build" "$@" test
```
No other change to `initdb` / random port / `TRAVELAI_TEST_DB_*` exports.

- [ ] **Step 3: Run backend tests locally via isolated PG**

Run: `bash scripts/test-backend.sh -q` from `/home/thuanc177/.hermes/cache/scratch/travelai-plan-v2`  
Expected: `BUILD SUCCESS`, tests executed against ephemeral DB, no `mvn: command not found`.

- [ ] **Step 4: Commit (toolchain)**

```bash
git add scripts/test-backend.sh
git commit -m "chore(v2): use ./mvnw in test-backend.sh (#<issue_id>)"
```
Branch must be `feat/wbs-v2-hardening` from `bf6c075`. Do not stage other files.

---

## Task 2 — `PostAccessPolicy` + API Tests (`PostController`, `PostLike`)

**Goal:** Centralize visibility/interaction permission and stop direct-id leaks for pending/rejected post.

**Files:**
- Create: `backend/src/main/java/com/travelai/backend/community/PostAccessPolicy.java` — value class with `canReadFeed(Post, Actor)`, `canViewMine(Post, Actor)`, `canLike(Post, Actor)`, `canComment(Post, Actor)`, `canShareFrom(Post, Actor)`, `canModerate(Post, Actor)`; anonymous `Actor==null` supported.
- Modify: `backend/src/main/java/com/travelai/backend/controller/PostController.java:50-379` — invoke `PostAccessPolicy` for all `GET /posts`, `GET /posts/user/{userId}`, `POST /posts/{postId}/like|comments|share`; ensure `GET /api/posts/admin/all` returns `mapPost` shape (not raw `Post` entity).
- Modify: `backend/src/main/java/com/travelai/backend/entity/PostLike.java:6` — add `@Table(name="likes", uniqueConstraints=@UniqueConstraint(name="uk_likes_post_user"...))`.
- Test: `backend/src/test/java/com/travelai/backend/community/PostAccessPolicyIntegrationTest.java` — integration test via `MockMvc` with `bytes` JSON and 2 users crafted via `BookingTransactionsTest`-pattern helpers (isolated PG test profile `test`).

**Interfaces:**
- Consumes: `com.travelai.backend.entity.Post`; `SessionService.Actor` (from `security/SessionService.java:17-21`); existing repositories `PostLikeRepository`, `PostRepository`.
- Produces: `PostAccessPolicy` bean; unified `canXXX` behavior used by later tasks.

- [ ] **Step 1: Write failing test (happy-path feed visibility)**

```java
@Test void feedOnlyApproves_forAnonymous() throws Exception {
  Actor outsider = user("USER"); Actor owner = user("USER");
  long pendingId = createPost(owner, "PENDING");
  long approvedId = createPost(owner, "APPROVED");
  mvc.perform(get("/api/posts").header("Authorization", bearer(outsider)))
     .andExpect(status().isOk())
     .andExpect(jsonPath("$[?(@.id==%d)]", pendingId).doesNotExist())
     .andExpect(jsonPath("$[?(@.id==%d)]", approvedId).exists());
}
```

- [ ] **Step 2: Run failing test**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=PostAccessPolicyIntegrationTest#feedOnlyApproves_forAnonymous`  
Expected: FAIL — pending is visible (existing feed filter exists but user-path / like / comment / share not yet enforced).

- [ ] **Step 3: Implement `PostAccessPolicy` minimal**

Implement class with:
- `canReadFeed(Post post, Actor actor)` -> `actor != null && "APPROVED".equals(post.getStatus())` (handles feed list filtering: non-approved not shown to any non-admin non-owner).
- `canViewMine(Post post, Actor actor)` -> `actor != null && actor.id() == post.getAuthorId()` (owner sees own PENDING/APPROVED/REJECTED).
- `canLike/Comment/ShareFrom(Post post, Actor actor)` -> `canReadFeed||canViewMine||(actor!=null && "ADMIN".equals(actor.role()))`.
- `canModerate(Post post, Actor actor)` -> `actor != null && "ADMIN".equals(actor.role())`.
Wire policy in `PostController`:
- `toggleLike`/`addComment`/`sharePost` call policy before any repository mutation; return 403 if fails (not 400).
- `getPostsByUser` uses policy: owner sees all status; admin sees all status; others see only APPROVED.
- `getAllPostsForAdmin` maps every result through `mapPost`.

- [ ] **Step 4: Run test to verify pass**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=PostAccessPolicyIntegrationTest#feedOnlyApproves_forAnonymous`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/travelai/backend/community/PostAccessPolicy.java \
        backend/src/main/java/com/travelai/backend/controller/PostController.java \
        backend/src/main/java/com/travelai/backend/entity/PostLike.java \
        backend/src/test/java/com/travelai/backend/community/PostAccessPolicyIntegrationTest.java
git commit -m "feat(v2): enforce feed visibility via PostAccessPolicy (#<issue_id>)"
```

---

## Task 3 — Like Uniqueness / Share Atomicity / `originalPost` leak

**Goal:** Eliminate duplicate like race and hide non-approved original post in shares.

**Files:**
- Create: `backend/src/test/java/com/travelai/backend/community/PostLikeConcurrencyTest.java` — spawns two threads using `ExecutorService` against `/PostController.toggleLike`.
- Modify: `backend/src/main/java/com/travelai/backend/controller/PostController.java:229-277,323-379,384-432` — add `try/catch (DataIntegrityViolationException)` for duplicate like; change `shareCount` increment to `@Modifying` atomic update (using `em.createQuery("update Post set shareCount=shareCount+1 ...")` or `postRepository.incrementShareCount(postId)`); in `mapPost`, if original post is `PENDING`/`REJECTED` and viewer lacks policy, set `originalPost=null` or empty map.
- Test: `PostLikeConcurrencyTest.java`, `PostOriginalLeakTest.java` (inside `PostAccessPolicyIntegrationTest.java` or new).

**Interfaces:**
- Consumes: `PostAccessPolicy` (Task 2), `PostLikeRepository`, `PostRepository`.
- Produces: idempotent toggle returning `{liked:true, likesCount}` even if second concurrent insert duplicates; share count atomic; original post hidden for unauthorized viewer.

- [ ] **Step 1: Write failing duplicate-like test**

```java
@Test void concurrentLikesResultInSingleRow() throws Exception {
  Actor a = user("USER"); long postId = createApprovedPost();
  ExecutorService exec = Executors.newFixedThreadPool(2);
  Future<?> f1 = exec.submit(() -> toggleLike(postId, a));
  Future<?> f2 = exec.submit(() -> toggleLike(postId, a));
  f1.get(); f2.get();
  long count = likeRepository.countByPostId(postId);
  assertEquals(1, count); // fails with count==2 before unique constraint
}
```

- [ ] **Step 2: Run failing test**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=PostLikeConcurrencyTest`  
Expected: FAIL — duplicate rows counted.

- [ ] **Step 3: Implement constraint + handling**

In `PostLike.java`, add:
```java
@Table(name="likes", uniqueConstraints=@UniqueConstraint(
  name="uk_likes_post_user",
  columnNames={"post_id","user_id"}))
```
Ensure database column names align with existing mapping (`postId` → `post_id` column automatically via Hibernate naming; if column names differ, explicitly map with `@Column(name="post_id")` and `@Column(name="user_id")`).

In `PostController.toggleLike`, wrap insert in:
```java
try {
  likeRepository.saveAndFlush(like);
} catch (DataIntegrityViolationException e) {
  // Duplicate due to concurrent request: treat as liked
  return ResponseEntity.ok(Map.of("liked", true, "likesCount", likeRepository.countByPostId(postId)));
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=PostLikeConcurrencyTest`  
Expected: PASS, `count==1`.

- [ ] **Step 5: Implement share atomicity + originalPost hide**

Update `PostRepository`:
```java
@Modifying @Query("update Post set shareCount = shareCount + 1 where id = :postId")
void incrementShareCount(@Param("postId") Long postId);
```
In `sharePost`, replace read-modify-write with `incrementShareCount(postId)`.

In `mapPost`, after fetching original, check policy:
```java
if (original == null) data.put("originalPost", null);
else if (Policy.canRead(original, currentActor.viewerId)) data.put("originalPost", originalData);
else data.put("originalPost", null);
```
Add test for `originalPost` of REJECTED post not visible in shared post feed.

- [ ] **Step 6: Run full Post/JUnit suite**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=PostAccessPolicyIntegrationTest,PostLikeConcurrencyTest`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/travelai/backend/controller/PostController.java \
        backend/src/main/java/com/travelai/backend/entity/PostLike.java \
        backend/src/main/java/com/travelai/backend/repository/PostLikeRepository.java \
        backend/src/main/java/com/travelai/backend/repository/PostRepository.java \
        backend/src/test/java/com/travelai/backend/community/
git commit -m "feat(v2): enforce unique like and hide pending original (#<issue_id>)"
```

---

## Task 4 — SystemSettingsService: validation, DTO split, `@Version`

**Goal:** Harden settings mutate/update, avoid guest leaking maintenanceMode, add optimistic lock.

**Files:**
- Create: `backend/src/main/java/com/travelai/backend/admin/SystemSettingsService.java` with `PublicSettings publicView()`, `SystemSettings adminGet(Actor actor)`, `SystemSettings update(Actor actor, SystemSettings request)`; inject `SystemSettingsRepository`, `BookingService` (or `MaintenancePolicy` from Task 5).
- Modify: `backend/src/main/java/com/travelai/backend/entity/SystemSettings.java:13-23` — add validation annotations (`@Size(min=1,max=100) siteName`, `@Email adminEmail`), `@Column(nullable=false) Boolean maintenanceMode = false`, `@Version Long version;`, `updatedAt` (Instant) + `updatedBy` (Long) optional.
- Modify: `backend/src/main/java/com/travelai/backend/controller/SystemSettingsController.java:18-51` — GET delegates to `publicView()`; PUT validates via service; return `ResponseStatusException(SEE_OTHER)` or 400 on invalid.
- Modify: `backend/src/main/java/com/travelai/backend/repository/SystemSettingsRepository.java:8` — add `@Lock(LockModeType.PESSIMISTIC_WRITE)` for update path if needed.
- Modify mobile: `apps/mobile/src/components/admin/settings.tsx:30` — add `emailNotify` switch binding; remove hardcoded `emailNotify: false` on save.
- Test: `backend/src/test/java/com/travelai/backend/admin/SystemSettingsIntegrationTest.java` (MockMvc for PUT/GET bodies and nulls; concrete draft tests for admin-only enforcement).

**Interfaces:**
- Consumes: existing `SystemSettings` entity, `SessionService.Actor`, `ApiSecurity.currentActor()` interceptor already gates PUT to admin.
- Produces: `SystemSettingsService.publicView(): Map<String,Object>` containing only `siteName, adminEmail, maintenanceMode boolean?` — need to decide if public should expose maintenanceMode. Spec says public GET should not leak admin fields; plan will hide `emailNotify, systemNotify, maintenanceMode` from guest if spec says so; admin view includes all.
- Validation failure returns 400 with `message` field; version conflict returns 409.

- [ ] **Step 1: Write failing test for DTO split**

```java
@Test void publicSettingsHidesAdminFields() throws Exception {
  mvc.perform(get("/api/system-settings"))
     .andExpect(status().isOk())
     .andExpect(jsonPath("$.maintenanceMode").doesNotExist())
     .andExpect(jsonPath("$.siteName").exists());
}
```

- [ ] **Step 2: Run failing test**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=SystemSettingsIntegrationTest#publicSettingsHidesAdminFields`  
Expected: FAIL — `maintenanceMode` exists in guest response.

- [ ] **Step 3: Implement service + DTO**

Implement `SystemSettingsService`:
- `publicView()` returns `Map.of("siteName", settings.siteName, "adminEmail", settings.adminEmail)`.
- `adminGet()` returns full entity.
- `update(request)` validates: `siteName` non-null/non-blank ≤100; `adminEmail` non-null/email format; `maintenanceMode/emailNotify/systemNotify` non-null; then saves with `@Version` check.

Update `SystemSettingsController.getSettings()`:
```java
return ResponseEntity.ok(systemSettingsService.publicView());
```

Update `updateSettings()`:
```java
return ResponseEntity.ok(systemSettingsService.update(ApiSecurity.currentActor(), request));
```

- [ ] **Step 4: Run test to verify pass**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=SystemSettingsIntegrationTest`  
Expected: PASS.

- [ ] **Step 5: Mobile `emailNotify` switch**

In `settings.tsx`, add state for `emailNotify` and a `Switch` bound to it, and on `save` replace `emailNotify: false` with current `emailNotify` value.

- [ ] **Step 6: Verify frontend typecheck + Node tests**

Run: `cd apps/mobile && npm run typecheck && npm test`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/travelai/backend/admin/SystemSettingsService.java \
        backend/src/main/java/com/travelai/backend/controller/SystemSettingsController.java \
        backend/src/main/java/com/travelai/backend/entity/SystemSettings.java \
        backend/src/test/java/com/travelai/backend/admin/SystemSettingsIntegrationTest.java \
        apps/mobile/src/components/admin/settings.tsx
git commit -m "feat(v2): split SystemSettings public/admin and add version lock (#<issue_id>)"
```

---

## Task 5 — `MaintenancePolicy` Gate + `ApiSecurity` integration

**Goal:** Server-side maintenance enforcement only for new canonical booking purchases.

**Files:**
- Create: `backend/src/main/java/com/travelai/backend/admin/MaintenancePolicy.java` — enum `MaintenanceAction {READ,AUTH,NEW_PURCHASE,PAY_EXISTING,CANCEL_REFUND,ADMIN}`; `boolean shouldBlock(Actor actor, MaintenanceAction action, boolean maintenanceEnabled)`.
- Modify: `backend/src/main/java/com/travelai/backend/security/ApiSecurity.java:38-57` — inject `SystemSettingsRepository` or `MaintenancePolicy`; in `preHandle()`, after authenticating actor, call `maintenancePolicy.shouldBlock` for matched canonical review path (`POST /api/booking/reviews`); if blocked, throw `ResponseStatusException(SERVICE_UNAVAILABLE, "Hệ thống đang bảo trì")` (503).
- Modify: `BookingService.review` to check maintenance via policy (defensive second line of defense if invoked directly without interceptor tests): call `maintenancePolicy.ensureNotBlocked(actor, MaintenanceAction.NEW_PURCHASE)`.
- Test: `backend/src/test/java/com/travelai/backend/admin/MaintenancePolicyIntegrationTest.java` — MockMvc with `SystemSettings.maintenanceMode` toggled true/false and checking responses for login/register/read/`POST /booking/reviews` etc.

**Interfaces:**
- Consumes: `SystemSettingsRepository`, `SessionService.Actor`, interceptor already sets `travelai.actor`.
- Produces: `MaintenancePolicy.shouldBlock` semantics; 503 on blocked new purchase only.

- [ ] **Step 1: Write failing test**

```java
@Test void maintenanceBlocksNewReviewButAllowsCancel() throws Exception {
  setMaintenance(true);
  Actor traveler = user("USER");
  String token = bearer(traveler);
  mvc.perform(post("/api/booking/reviews").header("Authorization",token)
      .header("Idempotency-Key", UUID.randomUUID().toString())
      .contentType("application/json").content("{}"))
     .andExpect(status().isServiceUnavailable()); // 503
  mvc.perform(post("/api/booking/bookings/<id>/cancel").header("Authorization",token)...)
     .andExpect(status().isOk()); // allowed
}
```

- [ ] **Step 2: Run failing test**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=MaintenancePolicyIntegrationTest`  
Expected: FAIL — review still returns 200/201 (not blocked).

- [ ] **Step 3: Implement `MaintenancePolicy`**

Create enum and `shouldBlock`:
```java
public boolean shouldBlock(Actor actor, MaintenanceAction action) {
  if (actor != null && actor.admin()) return false;
  if (action == MaintenanceAction.ADMIN || action == MaintenanceAction.AUTH || action == MaintenanceAction.READ ||
      action == MaintenanceAction.PAY_EXISTING || action == MaintenanceAction.CANCEL_REFUND) return false;
  return maintenanceEnabled; // NEW_PURCHASE only
}
```
Inject `SystemSettingsRepository` to read singleton `id=1`; cache 5-second TTL if needed. Call from `ApiSecurity` for `POST /api/booking/reviews` exact path match (`method==POST && path.equals("/api/booking/reviews")`).

Optional defensive call in `BookingService.review`: `maintenancePolicy.ensureNotBlocked(actor, MaintenanceAction.NEW_PURCHASE)`.

- [ ] **Step 4: Run test to verify pass**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=MaintenancePolicyIntegrationTest`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/travelai/backend/admin/MaintenancePolicy.java \
        backend/src/main/java/com/travelai/backend/security/ApiSecurity.java \
        backend/src/main/java/com/travelai/backend/booking/BookingService.java \
        backend/src/test/java/com/travelai/backend/admin/MaintenancePolicyIntegrationTest.java
git commit -m "feat(v2): enforce maintenance gate on new canonical bookings (#<issue_id>)"
```

---

## Task 6 — `AnalyticsAggregation` Service + Admin Endpoint

**Goal:** Provide canonical revenue/count aggregation without legacy bookings.

**Files:**
- Create: `backend/src/main/java/com/travelai/backend/admin/AnalyticsAggregation.java`:
    - `Map<String,Object> getStats(LocalDate from, LocalDate to)`
    - `List<Map<String,Object>> revenueSeries(LocalDate from, LocalDate to)` — aggregates by `YYYY-MM` buckets.
    - `List<Map<String,Object>> topServices(int limit)` — ranks `BookingOffering` by count of canonical `Reservation`s.
- Modify: `backend/src/main/java/com/travelai/backend/controller/AdminController.java` — new `GET /api/admin/analytics` endpoint that calls `AnalyticsAggregation`; returns `Map.of("stats", stats, "revenueSeries", revenueSeries, "topServices", topServices)`.
- Modify: `backend/src/main/java/com/travelai/backend/booking/BankTransaction.java` — ensure `kind` values `CHARGE` and `REFUND` only counted (already used in `BookingService`).
- Test: `backend/src/test/java/com/travelai/backend/admin/AnalyticsAggregationIntegrationTest.java` — seed canonical reservations via `BookingService.provisionBank/review/pay` helpers; seed legacy `HotelBooking`/`TourBooking` entities to ensure they are NOT counted; assert 12-month rolling bucket counts.

**Interfaces:**
- Consumes: `booking_reservations`, `simulated_transactions` (`BankTransaction`), `UserRepository`, `PostRepository`.
- Produces: `GET /api/admin/analytics` JSON shape that the mobile admin stats section can consume.

- [ ] **Step 1: Write failing analytics test**

```java
@Test void analyticsCountsOnlyCanonicalBookings() throws Exception {
  Actor traveler = user("USER"); Actor admin = user("ADMIN");
  // Create canonical reservation paid
  createCanonicalReservation(traveler, 1_000_000L, "2025-12-15");
  createCanonicalReservation(traveler, 2_000_000L, "2026-01-14");
  // Insert legacy TourBooking+HoteBooking rows (separate repositories)
  mvc.perform(get("/api/admin/analytics").header("Authorization", bearer(admin)))
     .andExpect(status().isOk())
     .andExpect(jsonPath("$.stats.totalBookings").value(2))
     .andExpect(jsonPath("$.revenueSeries.length()").value(2))
     .andExpect(jsonPath("$.revenueSeries[0].month").value("2025-12"))
     .andExpect(jsonPath("$.revenueSeries[0].revenue").value(1_000_000))
     .andExpect(jsonPath("$.revenueSeries[1].month").value("2026-01"));
}
```

- [ ] **Step 2: Run failing test**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=AnalyticsAggregationIntegrationTest#analyticsCountsOnlyCanonicalBookings`  
Expected: FAIL — endpoint not found (404).

- [ ] **Step 3: Implement service + endpoint**

Implement `AnalyticsAggregation`:
- `revenueSeries(from,to)`: query `simulated_transactions` join `booking_reservations` where `kind='CHARGE'` sum by `to_char(createdAt, 'YYYY-MM')`; subtract `REFUND` amounts similarly and `totalPaid` statuses must be `CONFIRMED` (exclude `PENDING`/`REJECTED`/`CANCELLED` Reservation rows if no count). Legacy bookings uses `TourBookingRepository` / `HotelBookingRepository` and are deliberately not included (return 0 for legacy counts explicitly).
- `getStats`: count canonical `Reservation`s + users/posts/places via existing repositories.
- `topServices`: `select itinerary->>'name', count(*) ... group by name order by count desc limit N`.

Update `AdminController`:
```java
@GetMapping("/analytics")
public ResponseEntity<?> analytics() {
  ApiSecurity.currentActor().requireAdmin();
  return ResponseEntity.ok(Map.of(
    "stats", analyticsAggregation.getStats(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).minusMonths(12), LocalDate.now(...)),
    "revenueSeries", analyticsAggregation.revenueSeries(...),
    "topServices", analyticsAggregation.topServices(10)
  ));
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `./mvnw -o -Djava.version=21 -Dtravelai.build.directory="$TEMP/build" test -Dtest=AnalyticsAggregationIntegrationTest`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/travelai/backend/admin/AnalyticsAggregation.java \
        backend/src/main/java/com/travelai/backend/controller/AdminController.java \
        backend/src/test/java/com/travelai/backend/admin/AnalyticsAggregationIntegrationTest.java
git commit -m "feat(v2): add canonical analytics aggregation (#<issue_id>)"
```

---

## Task 7 — Frontend Admin Guard + Settings DTO update (mobile)

**Goal:** Prevent guest/admin UI flash and use public/admin DTO split.

**Files:**
- Modify: `apps/mobile/src/app/admin.tsx:47-76` — wrap `<Screen protected>` usage: only render `AdminSettings` after `loading === false`; if `loading` show spinner, if `!user` rely on `Screen`'s login prompt, if `user && role!=='ADMIN'` show `Cần quyền ADMIN`.
- Modify: `apps/mobile/src/components/admin/settings.tsx:7-21` — `useResource<AdminSettings>` instead of shared `Settings`; catch 403/401 and show `ErrorText`.
- Modify: `apps/mobile/src/components/ui.tsx:85-145` — internal `Screen` already has loading gate; no change unless `loading` state is lost.

**Interfaces:**
- Consumes: `Auth` context (`user, loading, error` from `context/auth.tsx:31-38`); API responses from Task 4/6.
- Produces: admin screens never render admin content while `loading==true`.

- [ ] **Step 1: Write failing frontend test** — repo currently runs `node --test` without DOM; implement a minimal Node test for the gating logic.

Create `apps/mobile/tests/adminGuard.test.mjs` — simple function `adminAccess({ user, loading })` returns `"loading" | "denied" | "allowed"`. Add test:
```js
test('admin screen keeps loading gate before checking user', () => {
  assert.equal(adminAccess({ user: null, loading: true }), 'loading');
  assert.equal(adminAccess({ user: null, loading: false }), 'denied');
  assert.equal(adminAccess({ user: { role: 'USER' }, loading: false }), 'denied');
  assert.equal(adminAccess({ user: { role: 'ADMIN' }, loading: false }), 'allowed');
});
```
Where `adminAccess` is a pure exported helper from `apps/mobile/src/app/admin.tsx` or `apps/mobile/src/lib/authGuard.ts`.

- [ ] **Step 2: Run failing test**

Run: `cd apps/mobile && npm test`  
Expected: FAIL — `adminAccess` not exported.

- [ ] **Step 3: Implement guard helper**

Export from `admin.tsx` or new `authGuard.ts`:
```ts
export function adminAccess({ user, loading }: { user: { role?: string } | null; loading: boolean }) {
  if (loading) return "loading";
  if (!user || user.role !== "ADMIN") return "denied";
  return "allowed";
}
```
Adjust `Admin` default component to use helper to avoid flash.

- [ ] **Step 4: Run frontend tests + typecheck**

Run: `cd apps/mobile && npm test && npm run typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/app/admin.tsx apps/mobile/tests/adminGuard.test.mjs
git commit -m "fix(v2): gate admin UI on auth loading state (#<issue_id>)"
```

---

## Task 8 — Two-browser E2E (Chromium contexts, isolated PG)

**Goal:** Prove cross-user visibility across two independent browser sessions against real backend.

**Files:**
- Create: `apps/mobile/e2e/two-browser.mjs` — Playwright (or Puppeteer) script that spawns:
    - Backend: `SPRING_PROFILES_ACTIVE=test TRAVELAI_TEST_DB_URL=... ./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=0"` on random port.
    - Frontend: `expo export -p web --output-dir dist` then static server (e.g. `python3 -m http.server` or Expo web dev server).
- Test: same script run via `node apps/mobile/e2e/two-browser.mjs` — asserts:
  - User A creates `PENDING` post.
  - Anonymous `GET /api/posts` does not contain that post.
  - User B `GET /api/posts/user/<A>` sees 0 items.
  - Admin approves via `PUT /api/posts/<id>/approve`.
  - Both A and B now see post; B can like/comment/share.

**Interfaces:**
- Consumes: backend API contract from tasks 2-5; two Chromium `BrowserContext`s each with separate `localStorage["travelai_token"]` and `SecureStore` equivalent.

- [ ] **Step 1: Write failing E2E script**

Scaffold `two-browser.mjs` to create two users via `/api/auth/register` then `login`, then use `register` + `login` token storage (`setToken`). Run and observe pending post incorrectly visible to B (baseline).

- [ ] **Step 2: Run E2E and verify failure**

Run: `node apps/mobile/e2e/two-browser.mjs`  
Expected: FAIL — B sees pending post (or cannot like pending).

- [ ] **Step 3: Ensure Tasks 2-3 close leak**

No code change in E2E task; once `PostAccessPolicy` + visibility is in place, pending post stays hidden to B, approved becomes visible, and like/unlike from B does not affect A's other state.

- [ ] **Step 4: Run E2E to verify pass**

Run: `node apps/mobile/e2e/two-browser.mjs`  
Expected: PASS after tasks 2-3.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/e2e/two-browser.mjs
git commit -m "test(v2): two-browser post visibility E2E (#<issue_id>)"
```

---

## Task 9 — Full Suite + Migration Evidence

**Goal:** Confirm no regressions, additive schema is safe, final evidence ready for PR.

**Files:**
- None (verification only) unless cleanup of stale files is needed.

- [ ] **Step 1: Run full backend suite against isolated PG**

Run: `bash scripts/test-backend.sh -q` from worktree root.  
Expected: `BUILD SUCCESS`, all `@SpringBootTest` methods PASS including new tests.

- [ ] **Step 2: Run mobile checks**

Run: `npm run check` from `TravelAI-integration` root (invokes mobile lint + typecheck + tests).  
Expected: PASS.

- [ ] **Step 3: Run web export smoke**

Run: `cd apps/mobile && npx expo export -p web --output-dir dist`  
Expected: `dist` produced, `index.html` references `dist/_expo/static/js/web/index-*.js`.

- [ ] **Step 4: Migration evidence**

Run against isolated dump:
```bash
pg_dump -U travelai_test -h 127.0.0.1 -p <port> travelai_test > dump.sql
sqlite3 /tmp/postgres_merge_check.db ".mode list" "select 1"
# Assert saved data persists after startup with new unique constraint
```
Manual verification: new `likes` unique constraint is present; no existing `posts`/`booking_reservations` rows deleted after boot against dump.

- [ ] **Step 5: Commit evidence (if any)**

If rollback/backup notes need to be added to docs, commit them separately:
```bash
git add docs/operations/rollback-notes.md
git commit -m "docs(v2): add additive migration rollback note (#<issue_id>)"
```

---

## Review Checklist (Skills, Test-First, DOD)

- [ ] Each task uses TDD: failing test first (RED), minimal implementation (GREEN), full test suite run (verify).
- [ ] No generated-file artifacts committed (`dist/`, `target/build/`, `.expo/cache/`).
- [ ] Conventional Commits with `(<issue_id>)` binding; no assistant attribution trailers.
- [ ] `git status --short` shows only intended files; no secret, `.env`, `.env.local` content committed.
- [ ] PR description lists cross-scope files and owner (Tech Lead Trần Minh Thuận).
- [ ] Acceptance matrix from spec §5 all PASS with evidence attached to PR body.
- [ ] Migration additive; rollback preserves data; no destructive scripts committed.

---

## Dependencies

| Task | Depends on | Blocks |
|---|---|---|
| 1 TestToolchain | none | 2-9 |
| 2 PostAccessPolicy | 1 | 3 |
| 3 Like/Share | 2 | 8 |
| 4 Settings DTO | 1 | 5 |
| 5 Maintenance | 4 | 8 |
| 6 Analytics | 1 | 8 |
| 7 Mobile Guard | 4 | 8 |
| 8 E2E | 3,5 | 9 |
| 9 Full Suite | 8 | PR |

Edge dependency: Task 4 must precede Task 5 (MaintenancePolicy reads `SystemSettingsService.publicView` DTO).

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `ddl-auto=update` collides with prod schema on deploy | Medium | Backup `pg_dump` before deploy; rollback via `DROP CONSTRAINT` only, no data loss. |
| Analytics query perf on `simulated_transactions` | Low | Use `Asia/Ho_Chi_Minh` bucket index; 12-month window bounded; paginate if needed. |
| `ApiSecurity` 503 false positive on auth endpoints | Medium | Explicit early-return for `paths whitelist` before maintenance check (already in Task 5 design). |
| Two-browser E2E flakiness (port contention) | Medium | Use random ports for backend and frontend servers; allocate Chromium contexts via Playwright isolated `launchPersistentContext`. |
| `mvnw` version mismatch (3.9.9 wrapper) vs Java 21 | Low | Use `-Djava.version=21` locally and leave pom compile target 25; CI stays on `./mvnw test` with Temurin 25. |
| Duplicate like under high concurrency still races without constraint | Low | Unique constraint catches `DataIntegrityViolationException` deterministically. |

---

## Self-Review

**Spec coverage check:**

- §2.1 Auth/session → existing `SessionService`/`ApiSecurity` unchanged; Task 5 refines maintenance without altering auth flow.
- §2.2 Community (visibility, like concurrency, originalPost, admin/all shape) → Tasks 2-3 cover all endpoints.
- §2.3 Settings (validation, DTO split, `@Version`, `emailNotify` switch) → Task 4.
- §2.4 Maintenance & bookings (server-side gate, cancel/refund allowed) → Task 5.
- §2.5 Admin stats / Analytics (canonical-only, bucket YYYY-MM) → Task 6.
- §2.6 Tests/env (isolated PG + wrapper) → Tasks 1, 9.
- D1-D12 decisions in spec §3 are defaults applied; some (like legacy booking inclusion in stats) still need Tech Lead confirmation before implementers write the analytics query.

**Plan proportion:** 9 bite-sized tasks, ~140 lines of plan per task max; each concrete test has exact assertion; no transcript code beyond signatures.

**Type consistency:** `Actor` matches `SessionService.Actor` (`id: long, role: String`); `SystemSettings` fields mirror backend entity; `AnalyticsAggregation` returns `Map<String,Object>` shapes consumed by mobile admin stats.

**Review Focus coverage:** Each of the five Review Focus rows maps to a concrete TDD test in Tasks 2,3,4,6,7.

**No TODO/TBD:** Every decision (DTO split, maintenance blocked action, analytics canonical source) has an explicit value in the plan.
