# Hợp đồng API (bản chạy TravelAI 2.0)

> Cập nhật 15/11/2026 từ mã nguồn `backend` và `ai-service`. Tất cả đường dẫn qua một origin: `/api/*`, `/ws`, `/ai/*`. Lỗi trả JSON `{message}`; chưa dùng `application/problem+json`. Các thao tác ghi trên `places`, `tours`, `hotels`, `admin`, `users`, `system-settings` yêu cầu ADMIN.

## Backend (`/api`)

| Nhóm | Điểm cuối |
|---|---|
| Xác thực `/auth` | `POST register`, `login`, `logout`, `password-reset/request`, `password-reset/verify`, `password-reset/confirm`; `GET me`; `PUT profile/{id}`, `change-password/{id}` |
| Địa điểm `/places` | `GET /`, `GET /{id}`, `GET /resolve?landmarkCode=`, `GET /{id}/services` (tour + khách sạn cùng tỉnh, `matchType=SAME_PROVINCE`); `POST`, `PUT /{id}`, `DELETE /{id}` (ADMIN) |
| Tour `/tours`, Khách sạn `/hotels` | `GET /`, `GET /{id}`; `POST`, `PUT /{id}`, `DELETE /{id}` (ADMIN; trả **409** khi đã có đặt chỗ) |
| Đặt chỗ `/booking` | `GET offers`, `offers/{id}/availability`, `bank`, `bank/institutions`, `bookings`, `bookings/{id}/history`, `reviews/{id}`; `POST bank/link`, `reviews`, `reviews/{id}/pay`, `bookings/{id}/cancel`, `bookings/{id}/no-show`; quản trị: `offers`, `calendars`, `bank/accounts`, `bookings/{id}/correct-no-show` |
| Đặt chỗ cũ `/tour-bookings`, `/hotel-bookings` | `GET`, `POST`, `PUT /{id}`, `PUT /{id}/approve`, `PUT /{id}/reject`, `DELETE /{id}` |
| Đánh giá `/ratings` | `POST /`, `GET /{kind}/{catalogId}` |
| Bảng tin `/posts` | `GET /`, `GET /user/{userId}`, `GET /admin/all`; `POST /`, `PUT /{id}`, `DELETE /{id}`, `PUT /{id}/approve`, `PUT /{id}/reject`, `POST /{postId}/like`, `/comments`, `/share` |
| Xã hội | `/follows` (`POST toggle`, `GET stats/{userId}`, `GET check`), `/people`, `/notifications` |
| Chat `/chat` + WebSocket `/ws` | `POST send`, `GET conversation`, `GET inbox/{userId}`, `GET unread/{userId}`, `PUT read` |
| Quản trị | `/admin` (`GET stats`, `analytics`, `users`), `/admin/system-settings`, `/system-settings` (`GET` công khai, `PUT` ADMIN), `/users` (khóa, cấp/gỡ quyền, xóa) |
| Trợ lý `/ai` (backend) | `POST chat`, `voice`, `detect` |

## AI service (`/ai`)

| Điểm cuối | Mô tả |
|---|---|
| `GET /` | Tình trạng: `googleVisionConfigured`, `localLandmarkModel` |
| `POST /detect` | `multipart`: `file`, `consent=true`; trả tên, `recognitionStatus` (`identified`, `predicted`, `unknown`), tọa độ, độ tin cậy, `landmarkCode`, `province`. Tệp quá 10 MB bị từ chối (413); lỗi nhà cung cấp trả 502/503 |
| `GET /places/summary` | Tóm tắt địa điểm theo tên |
