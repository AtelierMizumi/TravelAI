# TravelAI 2.0

[Hướng dẫn cài đặt và chạy bằng tiếng Việt](HUONG_DAN_CHAY.md)

TravelAI uses one Expo / React Native application for Web, Android and iOS. Traveler and administrator screens live in `apps/mobile`. Spring Boot provides the shared API and PostgreSQL persistence. FastAPI calls Google Cloud Vision using server-side credentials.

## Start the application

Use Node.js 22.18 or newer. From the repository root

```bash
npm --prefix apps/mobile ci
# PostgreSQL must already be running and configured for the backend.
npm run dev:web  # start/reuse backend and AI, then open Expo Web
# Or run Expo for a phone:
npm run dev
```

The application contains discovery and destination details, tour/hotel search and details, explicit inventory selection, review and SIMULATED payment, booking history, rescheduling/cancellation, account/profile/password settings, moderated posts with images/comments/likes/shares/follows, private messaging, notifications and role-protected administration. User-facing lists and recognition results are fetched from the backend. Empty databases show empty states.

During LAN development, native clients derive the server hostname from the Expo development host. Web uses the current hostname with backend port 8080 and AI port 8000. Override endpoints for custom networks, Expo tunnels or deployment before starting/building Expo

```bash
EXPO_PUBLIC_API_URL=https://your-backend.example/api \
EXPO_PUBLIC_AI_API_URL=https://your-ai.example \
npm start
```

Both endpoints should use HTTPS in deployed environments. Expo Web's `web.output=server` export requires an Expo-compatible server deployment. Android/iOS exports contain JavaScript bundles and assets. Creating signed native binaries and running on physical devices are separate steps. The development helper requires the backend's PostgreSQL on localhost:5432, Python dependencies for the AI service, Maven and a compatible JDK. It starts or reuses the two services and stops the processes it started when exited. The AI service must run for image recognition; the backend and PostgreSQL must run for application data.

## Backend

Set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` as private environment variables on the backend server before startup. Do not commit database credentials. Configure the existing PostgreSQL datasource through the server environment. The Maven project defaults to Java 25. Start with a compatible installed JDK using `./mvnw spring-boot:run` in `backend`. Local automated validation uses installed JDK21 with the explicit Maven override `-Djava.version=21`.

For existing databases, review the additive SQL under `backend/src/main/resources/db` before deploying. It adds the simulated booking/session schema and message retry identifier. Existing tour/hotel booking records are available as legacy history. New bookings use the transactional review/payment API.

Chat message content is encrypted at rest using AES-256-GCM on the backend. This is not end-to-end encryption: the backend can decrypt it, and metadata and notification text are not covered. Use HTTPS/WSS in deployment. The default key is `backend/.secrets/message.key` (override with `TRAVELAI_MESSAGE_KEY_FILE`). Store a secure independent backup of this key; losing it makes encrypted messages and the encrypted database backup unreadable. Never commit it. For an existing installation, run `python3 scripts/migrate_message_encryption.py` to inspect, then `python3 scripts/migrate_message_encryption.py --apply` before starting the updated backend. The latter creates and verifies an encrypted database backup and migrates existing plaintext messages transactionally. Do not generate a new key to replace one already used.

Backend and AI are separate processes; booking, simulated banking and inventory remain in the backend's PostgreSQL database so their transactions remain atomic. Chat, notifications, feed and inventory have in-app WebSocket updates with polling fallback. This is not an operating-system push notification service, and other screens may load or poll data instead.

On a new database, register an account through the application. An authorized database operator can assign its ADMIN role to bootstrap administration. There is no default administrator password or seeded catalog. Use the admin screens to populate places, tours/hotels, physical room/departure inventory, required cutoff/hold policies and year-specific official holiday calendars. Link each booking offering to its tour/hotel catalog ID. Synthetic SIMULATED bank records must already be provisioned through the restricted backend API before travelers can link them; the traveler interface does not top up balances.

All monetary displays and transactions use SIMULATED VND and synthetic SIM-MC / TEST identifiers. Administrator policy/calendar changes are versioned. Travelers explicitly confirm authoritative server reviews before payment. The booking/refund policies remain defined in `specs/001-travelai-cross-platform/spec.md`.

## Khôi phục mật khẩu qua email

Mã xác nhận được gửi đến địa chỉ đã đăng ký, có hiệu lực 10 phút và chỉ dùng một lần. Người dùng nhập mã trước; chỉ sau khi xác nhận thành công mới có thể nhập mật khẩu mới. Phiên đổi mật khẩu có hiệu lực tối đa 5 phút, không vượt quá hạn của mã và chỉ dùng một lần. Sau năm lần nhập mã sai, người dùng cần yêu cầu mã mới; sau khi đổi mật khẩu, các phiên đăng nhập cũ bị thu hồi. Cần áp dụng `backend/src/main/resources/db/009_password_reset.sql` và `010_password_reset_verification.sql` cho cơ sở dữ liệu hiện có sau khi sao lưu.

Để gửi thư thật, cấu hình các biến môi trường cho tiến trình backend trước khi khởi động:

- `TRAVELAI_SMTP_USERNAME`: địa chỉ Gmail dùng để gửi thư; đây có thể khác địa chỉ người nhận.
- `TRAVELAI_SMTP_PASSWORD`: mật khẩu ứng dụng Gmail của tài khoản gửi, được giữ trong môi trường máy chủ, không đưa vào Git hoặc ứng dụng.
- `TRAVELAI_RESET_SECRET`: khóa riêng, ổn định, gồm ít nhất 32 byte ngẫu nhiên mã hóa Base64; có thể tạo bằng `openssl rand -base64 32`. Lưu bí mật này an toàn và giữ nguyên giữa các lần khởi động.
- Tùy chọn: `TRAVELAI_SMTP_HOST` và `TRAVELAI_SMTP_PORT` (mặc định `smtp.gmail.com` và `587`), `TRAVELAI_SMTP_FROM` (mặc định là tài khoản gửi). Kết nối yêu cầu STARTTLS.

Gmail cần bật xác minh hai bước để tạo mật khẩu ứng dụng. Thiếu cấu hình hoặc máy chủ SMTP từ chối kết nối, API trả lỗi dịch vụ chưa sẵn sàng; không có thư giả lập. Khi gửi thất bại, mã tương ứng bị vô hiệu hóa để người dùng có thể yêu cầu lại. Hệ thống giới hạn yêu cầu trong bộ nhớ của từng tiến trình, vì vậy khi triển khai nhiều máy chủ cần bổ sung giới hạn chung ở tầng hạ tầng.

Để chạy thử trên máy cá nhân, sau khi tạo mật khẩu ứng dụng Gmail và dừng backend cũ, chạy `bash scripts/dev-with-gmail.sh web` (hoặc thay `web` bằng `app`). Nhập địa chỉ Gmail gửi thư và mật khẩu ứng dụng khi được hỏi; mật khẩu không hiện trên màn hình và chỉ tồn tại trong môi trường của tiến trình. Script kiểm tra kết nối bảo mật và đăng nhập SMTP trước khi khởi động, không gửi thư trong bước kiểm tra. Script tạo khóa khôi phục riêng tại `backend/.secrets/password-reset.key` với quyền riêng tư; giữ bản sao an toàn của khóa này. Sau đó chọn **Quên mật khẩu?** và nhập email đã đăng ký để nhận mã.

## Trợ lý Gemini

Đặt `GEMINI_API_KEY` trong môi trường của backend trước khi chạy `npm run dev:web` hoặc `npm run dev`. Tùy chọn `GEMINI_MODEL` (mặc định `gemini-3.5-flash-lite`). Không đưa khóa vào ứng dụng, Git hoặc chat. Nút AI yêu cầu đăng nhập và chuyển nội dung câu hỏi sang Gemini; cần tài khoản có hạn mức, và dịch vụ có thể phát sinh phí.

Trợ lý hỗ trợ ghi câu hỏi rồi gửi âm thanh tới Gemini sau khi người dùng xác nhận; câu trả lời có thể được đọc bằng giọng nói của thiết bị. Tin nhắn thoại giữa người dùng được mã hóa khi lưu giống nội dung chat. Trình duyệt cần HTTPS hoặc localhost để xin quyền micro/camera. Bản ghi tối đa 20 giây và 600 KB; thiết bị chỉ được yêu cầu quyền micro khi bắt đầu ghi. Android/iOS và khả năng phát chéo WebM/M4A giữa thiết bị cần kiểm thử trên thiết bị thật trước khi công bố.

## AI service

```bash
python3 -m uvicorn ai.main:app --app-dir ai-service --host 0.0.0.0 --port 8000
```

The existing `ai-service/ai/service-account.json`, or the file specified by `GOOGLE_APPLICATION_CREDENTIALS`, is loaded only by Python. Configure `AI_ALLOWED_ORIGINS` for the deployed Web origin. See `ai-service/README.md` for provider and upload details.

## Checks

```bash
npm run check
scripts/test-backend.sh
python3 -m unittest discover -s ai-service/tests -v
cd apps/mobile
npx expo export --platform web --platform android --platform ios --output-dir /tmp/travelai-export
```

Backend tests create a fresh local PostgreSQL instance using synthetic data. AI contract tests mock external providers. Device camera/permissions, native secure storage and reference-device performance require physical Android/iOS verification.

Sơ đồ các bảng PostgreSQL hiện tại: [docs/database-hien-tai.md](docs/database-hien-tai.md).

## Repository layout

- `apps/mobile` contains the universal application and its client tests.
- `backend` contains shared business APIs, security, inventory and simulated banking.
- `ai-service` contains image recognition and API tests.
- `specs`, `.specify` and `.agents` contain requirements and project workflows.
- `scripts` contains isolated verification commands.

The separate Vite traveler/admin clients, unused Expo tutorial screens/assets, automatic example-place seeder, old AI source copies and generated backend artifacts were removed during the universal migration. The temporary recovery archive previously stored in `/tmp` is no longer present. This public repository starts with a new history; the previous repository history is not included.
