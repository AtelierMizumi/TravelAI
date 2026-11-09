# Harden v2 Community, Admin Analytics và System Settings

Ngày: 2026-11-09, Asia/Ho_Chi_Minh. Owner: Trần Minh Thuận (Tech Lead / cross-scope).
Trạng thái: **draft viết lại sau khi đối chiếu surveys — chờ self-review và duyệt nội dung**. Chưa được ủy quyền sửa product code hoặc commit.

## 1. Phạm vi và base snapshot

- Canonical target đợt này: **`backend/` + `apps/mobile/`** (stack v2).
- Base: worktree `TravelAI-integration`, branch `integration/ngoc-2.0`, HEAD `bf6c075`. Khi implementation plan được duyệt, sẽ làm **worktree mới sạch** từ base này; không sửa worktree hiện hành đang dirty.
- Ba PR v1 (`#45`, `#52`, `#53`) không thuộc scope này. Tác vụ này không sửa các PR đó. Tài liệu release cũ (ship v2) còn lưu ý v2 phải qua diễn tập merge theo issue #48; chuyển đổi nhánh/base nên ghi trong plan.
- Không làm: migration dữ liệu production, xóa/reset DB/volume compose, sửa deploy/edge/AI, sửa signing secret, sửa history rewrite, sửa/xóa/skip test suite.
- Đầu ra đợt này: source thật + regression tests trong repo + integration evidence + CHANGE-REQUESTED reopen. **Không merge main cuối**; deliverable chỉ PR sẵn cho Tech Lead duyệt/merge.

## 2. Vật chứng codebase đã kiểm chứng

### 2.1 Auth/session (v2)
- `SessionService.java:17-89`: `Actor` là `record(id, role)`; `admin()` cho phép role `ADMIN` và `requireOwner(id)` yêu cầu owner hoặc admin. Token là opaque; session lưu digest kèm expiration (`expires_at`; idle 24h). Login blocked account bị từ chối; logout/change-password thu hồi session.
- `ApiSecurity.java:31-57`: normalize path bằng `UrlPathHelper` (decoded, không `;matrix`, không `//`, không dot-segments, loại `%2e/%2f/%5c`). Mọi `/api/**` bắt Bearer session ngoại trừ allowlist, trong đó có GET `/api/system-settings` và các GET catalog/feeds công khai mà controller chưa dùng `currentActor()`; non-GET settings yêu cầu `requireAdmin()`.
- `SocketSecurity.java:20-25`: CONNECT socket bắt buộc native header `Authorization`; SEND/SUBSCRIBE thực hiện re-auth; allowlist topics: private `messages|notifications|chat-unread` chỉ cho `ownId`, `admin-notifications` chỉ admin, shared `/topic/feed` và `/topic/inventory/{uuid}`.

### 2.2 Community (v2)
- `PostController.java:50-60`: `GET /api/posts` chỉ lấy `APPROVED` và ghi đè `userId` thành actor hiện tại. Không bootstrap bằng `?userId=`.
- `:68-73`: `GET /api/posts/user/{userId}`: owner xem mọi status; non-owner chỉ APPROVED. Admin không được special-case ở đây.
- `:62-66`: `GET /api/posts/admin/all`: `requireAdmin()`, trả entity raw (không liked/comments count).
- `:75-112`: tạo PENDING, server override author; yêu cầu content hoặc image không null/blank.
- `:115-145`: owner update để về PENDING; không validate rỗng nội dung/image đầy đủ.
- `:171-227`: approve/reject không có transition guard; post bất kỳ đều approve/reject được.
- `:229-277` like: lấy actor từ session (`currentUser()`), check-then-insert không transaction, không có unique constraint `(postId,userId)`, nên hai toggle đồng thời có thể duplicate.
- `:279-321` comment: **không** kiểm status ApPENDING/REJECTED; tương tự share ở `:323-379`.
- `:384-432` `mapPost`: embed `originalPost` mà không kiểm status; comments embed toàn bộ.
- Delete (`147-169`): chia `shareCount` trừ đi không atomic, để lại likes/comments/share mồ côi.
- `PostLike` entity `@Table(name="likes")` có **không có UniqueConstraint**. `ddl-auto=update` không tự tạo index; Spring sẽ không tạo unique constraints mới trừ khi migration.

Realtime:
- Server: native `/ws-native` + SockJS `/ws`, topics `/topic`, app prefix `/app` (`WebSocketConfig.java:22-33`).
- `FeedEventsConfig.java:16-25`: sau mỗi POST/PUT/DELETE `/api/posts/**` thành công, publish `{changed:true}` qua `NotificationPublisher.feedChanged()`; payload không kèm content, fallback là polling resource hook.
- Client: `useRealtime` vẫn kết nối STOMP; `feed.tsx` dùng `/topic/feed` + polling 15s. Không có heartbeat/token-refresh khi reconnect.

### 2.3 Settings (v2)
- Entity `SystemSettings.java:13-23`: singleton `id=1`, `siteName`, `adminEmail`, `emailNotify`, `systemNotify`, `maintenanceMode`; **không** có `@Version`, không validation annotation, không `updatedAt/updatedBy`.
- Controller `SystemSettingsController.java:18-51`: `GET /` public, lazy-create default; trả FULL entity (`maintenanceMode` cho guest) nhưng không có `PublicSettings` DTO.
- `PUT /` ghi đè toàn bộ 5 fields từ request (không check null), không `@Transactional`, không lock → concurrent PUT last-write-wins.
- Mobile `AdminSettings.tsx:7-75`: `emailNotify: false` hard-code khi lưu; không có switch binding.
- Frontend admin UI: `Screen` (`ui.tsx:85-145`) chờ `loading`, nhưng `_layout.tsx:100-104,255-275` poll `/system-settings` 30s và thay Stack bằng “đang bảo trì” chỉ cho client; không có server enforcement.

### 2.4 Maintenance & bookings
- Backend `BookingService.java:24-529` có transaction/Barrier; không đọc maintenanceMode. `Reservation.java:7-19` có status CONFIRMED.
- Legacy bookings `TourBookingController.java`, `HotelBookingController.java`: **không** kiểm tra ownership theo actor; ApiSecurity: non-GET `/api/(tour|hotel)-bookings` blocked 409 và path GET `/user/{userId}` admin quản trị.
- Không khẳng định booking fail ngay khi có maintenance; chỉ mobile `_layout` hiện màn hình bakım khôn cần can thiệp truy vấn API.

### 2.5 Admin stats

- `AdminController.java:41-66`: `GET /api/admin/stats` đếm users/posts/bookings/tours/hotels/places. Catalog `Tour/Hotel/Place` vẫn tồn tại.
- Analytics v2: grep `analytics` không có endpoint/method chuẩn; `NotificationPublisher` gửi notification cho post pending nhưng chỉ có notify không phải analytics.

### 2.6 Tests/env

- `ApiSecurityPathTest` kiểm tra admin-path, `;matrix`, `//`, dot-segments, owner rule, admin pass.
- `BookingTransactionsTest` có create post pending và identity/foo test, non-admin approve 403, admin approve OK.
- `BackendApplicationTests` chỉ contextLoads; email/setup test profile khác nhau.
- `mvnw` có sẵn; không Docker/Testcontainers.
- JDK 21 là runtime mặc định lúc khảo sát; pom Jenkins có lớp mẫu Spring Boot; không cần cài thêm.
- Local PostgreSQL 16 có sẵn (docker images postgres:16-alpine, compose volumes).

## 3. Decision cần chốt trước spec review

| ID | Câu hỏi | Đề xuất | Ảnh hưởng |
|---|---|---|---|
| D1 | Canonical analytics | SIMULATED canonical booking (`booking_reservations`+`booking_history`+`BankTransaction`) | Cần chốt xác nhận có tổng kết trong AdminServiceTổng? |
| D2 | Kỳ báo cáo | 12-month rolling window + timezone Asia/Ho_Chi_Minh, bucket YYYY_amt? 
| D3 | Settings source | `SystemSettings` giữ entity/repository; DTO view ở controller. Không sổ tay giữ đồng bộ với key settings hiện có |
| D4 | Post status | Giữ lowercase REST contract nhưng backend uppercase; cần POST status JSON nên viết validator |
| D5 | Rejected visibility | Tác giả được xem reason/rejectedAt, không public |
| D6 | Maintenance scope | Chỉ block write canonical (review/pay), bỏ qua read/cancel/refund/admin/booking read/history; bỏ qua login/register; public catalog read |
| D7 | Additive migration hay chỉ logic | Additive unique like constraint, không xóa data; backup mandatory trước khi áp |
| D8 | Realtime | Browser phải nhận `changed` event; polling fallback (15s) ok; heartbeat/token refresh không bắt buộc |
| D9 | Post write validation | Không để content và image đều blank khi tạo/update; reject luôn kèm reason ≤255 ký tự |
| D10 | Admin/all | Trả mapPost shape đã lọc qua policy, không entity raw |
| D11 | Settings version | Thêm `@Version` + optimistic lock; validation inputs không null, email hợp lệ |
| D12 | Dashboard revenue | Canonical-only, không cộng TourBooking/HotelBooking legacy |

## 4. Kiến trúc đề xuất

### 4.1 Community (`PostAccessPolicy` seam)

Thêm helper tập trung:
- `boolean canReadFeed(Post, Actor | null)`
- `boolean canViewMine(Post, Actor)`
- `boolean canLike(Post, Actor)`
- `boolean canComment(Post, Actor)`
- `boolean canShare(Post, Actor)`
- `boolean canModerate(Post, Actor)`

Quy tắc:
- Anonymous chỉ APPROVED.
- Owner thấy PENDING/APPROVED của mình (UI badgePending chờ duyệt).
- Admin thấy tất cả.
- Like/comment/share cũng chỉ được áp policy trên post visible.

Schema: thêm additive `UNIQUE(post_id,user_id)` cho `likes` (qua `ddl-auto=update` tự tạo, không cần Flyway).

Share count: dùng `@Modifying @Query` update shareCount atomic, hoặc có khóa hàng đợi.

### 4.2 Analytics (`AnalyticsAggregation` seam)

Thêm `AnalyticsAggregation` service:
- `Stats getStats(LocalDate from, LocalDate to)`
- `List<RevenuePoint> revenueSeries(LocalDate from, LocalDate to)`
- `List<TopService> topServices(int limit)` dùng canonical tables.

Quy tắc semantics:
- Booking canonical mới là SIMULATED; không tính TourBooking/HotelBooking legacy lẫn canonical.
- Receipt+Discount dùng `BookingService`; aggregate bảng không chạm `Tour/Hotel/Place`.
- 12-month rolling window theo timezone Asia/Ho_Chi_Minh; bucket YYYY-MM, không gộp năm.
- 100+ bookings unified.

### 4.3 System Settings (`SystemSettingsService` seam)

Tách:
- `PublicSettings` (GET /system-settings)
- `AdminSettings` (GET/PUT `/admin/system-settings`)
- Validation cho siteName (Pattern, length), adminEmail (email format), notification flags (boolean), maintenanceMode (boolean).
- Maintenance Guard: chặn write canonical booking mutations (`review`/`pay`) khi maintenance mode; không chặn logout/login/change-password, booking read/history/cancel/refund, catalog read-only, hoặc admin.

Frontend phải chờ `loading==false` trước khi quyết định anonymous/deny; không fail-open khi auth chưa resolve.

## 5. Acceptance criteria

### Community
- Anonymous chỉ thấy APPROVED; PENDING/REJECTED của người khác không mở được qua REST feed/user/share/comment/like, search, hoặc topic realtime.
- Owner thấy PENDING bài của mình, APPROVED và REJECTED có reason nếu có.
- Admin thấy toàn bộ status (PENDING, APPROVED, REJECTED).
- Like/comment/share chỉ gọi được trên bài visible với actor; duplicate like tối đa một lần (unique constraint).
- Account A/B độc lập: Alice like, Bob like tăng; Alice unlike giảm, Bob vẫn còn.
- Bài REJECTED không được like/comment/share bởi actor khác owner; owner không thể public lại bằng cách thao tác gián tiếp.

### Analytics
- API `/api/admin/analytics` trả users/posts/catalog counts từ canonical tables.
- Revenue series/stats chỉ đếm canonical bookings (không cộng TourBooking/HotelBooking legacy).
- Empty dataset => zero/empty arrays; không sample activity.
- Bucket theo YYYY-MM; không gộp năm.

### Settings/maintenance
- GET `/api/system-settings` chỉ expose public fields; GET/PUT admin endpoint chỉ ADMIN; anonymous 401; non-admin 403; admin 200.
- Settings update validate và dùng Map/DTO; không trả full entity.
- Lưu settings xong đọc lại từ context khác hoặc sau restart thấy cùng giá trị (persistent).
- Maintenance mode chặn new canonical booking review/pay không phải read/admin/cancel/refund; có log rõ thành trace 503.
- Settings UI phải chờ auth loading mới phân biệt anonymous; không fail-open.

## 6. Test strategy

Backend (JUnit, Postgres minimal/testcontainer hoặc CI PostgreSQL):
- `PostAccessPolicy` matrix: owner/other/admin/anonymous × APPROVED/PENDING/REJECTED × feed/like/comment/share/admin endpoint.
- Realtime topic/subscription authorization cho feed/private notifications.
- Like duplicate race: hai INSERT đồng thời cho cùng `(post,user)` => chỉ một succeed hoặc catch lại ở unique constraint.
- Settings admin-only endpoint: 401 anon, 403 user, 200 admin GET/PUT.
- MaintenanceGuard: maintenance=true chặn review/pay mới, nhưng không chặn cancel/read/admin/booking history.
- Analytics: seeded canonical bookings với mixed years/statuses trả aggregation đúng; >100 bookings vẫn tính đủ; legacy TourBooking/HotelBooking không ảnh hưởng.
- Migration additive: chạy lên DB rỗng + dump có sẵn không làm mất `posts`/`booking_reservations`.

Frontend (Node/Test + Expo components):
- Auth loading gate cho AdminScreen; anonymous thấy login prompt.
- AdminSettings với guest/user/admin.
- Feed sorting không trường approved trong cache.
- Web build (`tsc --noEmit`, lint) không lỗi.

Integration:
- pg_isready + curl login qua seed user có sẵn; đổi account A/B theo settings.
- Hai-browser contexts riêng: đăng post Pending ở browser A; không thấy ở B; approve Admin rồi thấy cả 2.

Không liệt kê test không liên quan.

## 7. Module/invariant cần ghi

Domain vocabulary cần được thống nhất:
- **actor**: authenticated user id + role from session (không trust client body).
- **canonicalBooking**: hệ SIMULATED của `BookingService`.
- **legacyBooking**: `TourBooking|HotelBooking` tables vẫn tồn tại, không dùng trong analytics v2.
- **sharedFeed**: `GET /posts` (APPROVED only for anonymous).
- **adminFeed**: `GET /posts/admin/all`.
- **publicSettings/adminSettings**: quyền đọc/ghi phân tách rõ.

ADR cần tạo nếu người dùng duyệt hai yasak: SIMULATED-only canonical booking và force moderation status canonical.

## 8. Kiểm soát không còn

- Không dùng schema `likes` mới hay các entity phụ; giữ nguyên `posts`.
- Không migrate dữ liệu production trong Phase test.
- Không đọc `.env`, key, token, CM credential trong lượt này.
- Không công commit/push/merge.

## 9. Việc cần làm trước implementation

1. Chốt D1-D12 trong bảng §4 (trả lời xác nhận/không).
2. Xác nhận canonical database phạm vi là SIMULATED hay có muốn nối legacy legacy?
3. Chốt có muốn thêm status LOWERCASE hay uppercase? Đề xuất: giữ REST JSON lowercase (as-is canonical status), document cụ thể.
4. Chốt two-browser E2E: Chromium headless trên CI hay chỉ Node/unit tests?
5. Nếu duyệt, mới chuyển sang viết implementation plan chi tiết.

## 10. Quyết định đã chọn

| ID | Đề xuất | Lý do |
|---|---|---|
| A | Compose uses apps/mobile bundled, giữ nguyên | Back-end routes hiện hành đã viết theo stack này. |
| B | Không migrate dữ liệu | Lesser regression risk, additive compatibility. |
| C | SIMULATED canonical backend | Treasury+Inventory trong `BookingService` có sẵn. |
| D | Policies moved to `PostAccessPolicy` + unique constraint | Giảm duplicate seams, tránh mismatch như v1 localStorage và Test Pipeline. |
| E | `publicView()` + `adminSettings.update()` | Tính trừu tượng sâu, tránh leak full entity. |
| F | `SystemSettings` giữ entity + repository | Giữ canonical, thay DTO ở controller layer; không cần migrate. |
| G | Không thêm download schema field, chỉ field nhận flag boolean | Bảo toàn tương thích client/cache có sẵn. |
| H | Không chuẩn hóa settings JSON entity seed hiện hành | Tránh sửa enum lowercase nếu REST tảng khác. |
| I | Maintenance không block api chung (auth/flags/admin) | An toàn trong release public, tránh locked system. |

## 11. Như vậy người dùng đã được hiểu

Đã viết lại spec với fact chi tiết hơn từ khảo sát; thêm decision table D1-D12 và split rõ CANONICAL vs legacy.

Thêm vào: Không thay đổi provider/model/API chứa secret in chat; không xoá history rewrite.
