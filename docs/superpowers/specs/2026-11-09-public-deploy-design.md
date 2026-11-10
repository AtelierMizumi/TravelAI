# TravelAI: Deploy công khai bằng PC-as-VPS, Requirements Spec

Ngày: 2026-11-09. Owner: Trần Minh Thuận (Tech Lead). Trạng thái: **bản hoàn chỉnh chờ duyệt** (chưa commit). Thay thế bản nháp cùng tên (có phương án Cloud Run/Neon, đã bỏ).
Hạn: ~1 tuần (chấm sớm). Sprint 5 kết thúc 2026-11-15.

## 0. Quyết định đã chốt (từ chủ dự án, 2026-11-09)

| # | Quyết định | Hệ quả |
| --- | --- | --- |
| Q1 | **Reverse proxy toàn phần trên PC**, coi PC là một VPS. Không build/deploy lên cloud (bỏ Cloud Run, Neon, Pages, Render) | Toàn bộ stack (web, backend, AI, Postgres) chạy trong một `docker compose` trên PC |
| Q2 | **Đã mua `minhthuan.dev`** qua Cloudflare Registrar (2026-11-09, DNSSEC đã bật) | Đi thẳng Cloudflare Tunnel named (T4); `PUBLIC_ORIGIN=https://travelai.minhthuan.dev`. T1/T2/T3 chỉ còn là dự phòng (mục 3.2) |
| Q3 | Ship stack v2 (`backend/`, `apps/mobile`, `ai-service/` của Ngọc), v1 lưu bằng tag/branch | Giữ nguyên kết luận mục 2 của bản nháp trước (tóm tắt ở mục 2) |
| Q4 | Cross-scope được chấp nhận; `ai-service` của Ngọc **không chỉnh code**, sửa WBS cho khớp thực tế | H3, H4 xử lý ở lớp edge/GCP, không sửa `ai-service` |
| Q5 | Chưa xoay key GCP | Bắt buộc xoay trước khi public (SEC-02) |
| Q6 | JWT secret mới đã xoay | Đã áp dụng cho v1 (mục 5.1). v2 không dùng JWT |

Ngoài phạm vi: iOS (không có Mac), Electron/Tauri, VNPay thật, Kubernetes, Flyway, CD tự động, hosting cloud, self-hosted runner trên máy cá nhân.

## 1. Mục tiêu và tiêu chí xong

Có **một URL HTTPS công khai** truy cập được từ mạng ngoài (điện thoại 4G/5G), chạy ổn định trong thời gian chấm, và không có lỗ hổng "ngớ ngẩn" khi bị hỏi. Authenticity Gate trong `KE_HOACH.md` đang bị chặn vì chưa deploy.

Xong khi, từ mạng ngoài mạng nhà:
1. **Web** (desktop và mobile browser): đăng nhập, tìm tour, đặt tour + thanh toán mô phỏng, nhận diện ảnh bằng Google Vision thật.
2. **Android**: APK cài được, trỏ vào cùng URL HTTPS, chạy lại hành trình trên (nhận diện ảnh phụ thuộc D7, mục 7).
3. Không secret nào trong git; CI xanh gồm smoke test `compose up`.
4. Báo cáo 04, 05 và README khớp với thứ thực sự chạy.

## 2. Vì sao ship v2 (tóm tắt kết luận)

Không gộp được hai stack (không chung lịch sử git, package/schema/hợp đồng AI khác nhau, không kịp 1 tuần). Ship **v2 (branch `integration/ngoc-2.0`)**: 43 file TSX với hành trình đăng nhập, tour, đặt + thanh toán, nhận diện ảnh đã pass trên web và Android; backend 19 controller, 52 test pass, session token, `Idempotency-Key`; Google Vision thật đã kiểm thử 15 ảnh (9 đúng rõ, 6 chưa xác định). v1 giữ bằng tag `v1-vite-core-final`.

Đánh đổi chấp nhận: (a) AI được chấm là `ai-service/` của Ngọc, không phải `services/ai` (WBS 1.3.x); báo cáo nêu rõ lý do. (b) `AGENTS.md` quy định React/Vite + Java 17, v2 là Expo + Java 25: cần một ADR ngắn. (c) v2 đang untracked trong worktree `../TravelAI-integration`, phải commit và merge trước khi deploy.

## 3. Kiến trúc yêu cầu

### 3.1 Topology (PC = VPS)

```
Internet --HTTPS--> [Tunnel agent trên PC] --HTTP 127.0.0.1:8080--> [edge: Caddy]
                                                   /        static web (expo export -p web)
                                                   /api/*   backend:8080
                                                   /ws*     backend:8080 (WebSocket)
                                                   /ai/*    ai-service:8000 (strip prefix)
                                       [postgres:5432]  mạng nội bộ compose, không publish
```

- **FR-01** Chỉ một thành phần nhận traffic từ ngoài: Caddy, bind `127.0.0.1` (không `0.0.0.0`). Postgres, backend, ai-service **không publish cổng** ra host.
- **FR-02** TLS do lớp tunnel kết thúc; Caddy phục vụ HTTP nội bộ (`auto_https off`). Khi chuyển sang VPS thật/domain trực tiếp có thể bật lại auto HTTPS bằng overlay riêng.
- **FR-03** Một origin duy nhất. Web gọi API bằng **đường dẫn tương đối** (`/api`, `/ai`, `/ws`), nên đổi domain **không cần build lại web**.
- **FR-04** Caddy giới hạn `request_body max_size 10MB` cho `/ai/*`; thêm header bảo mật (HSTS khi đã HTTPS ở edge, `X-Content-Type-Options`, `Referrer-Policy`); chặn đường dẫn `/actuator*`, `/swagger*`, `/v3/api-docs*` từ ngoài (H10).
- **FR-05** Rate-limit `/ai/*` và `/api/auth*` ở Caddy (plugin `caddy-ratelimit` hoặc build Caddy với module; nếu không kịp thì dùng giới hạn ở tầng tunnel/quota GCP, ghi rõ trong báo cáo).
- **FR-06** Compose dùng `restart: unless-stopped`, healthcheck thật cho từng service, `depends_on: condition: service_healthy`, và `${VAR:?missing}` cho mọi biến bắt buộc (không default cho secret).
- **FR-07** Tệp compose: `docker-compose.yml` (lõi, không publish cổng) + overlay `docker-compose.edge.yml` (Caddy + tunnel). Overlay VPS/domain trực tiếp là việc sau.

### 3.2 Lớp tunnel (chưa có domain)

Cần một đường vào HTTPS công khai mà **không mở cổng router** (an toàn khi sau CGNAT/5G) và **URL ổn định** (URL được nhúng vào APK). Các lựa chọn; số liệu về giới hạn gói miễn phí chưa xác minh bằng trang chính thức, phải kiểm tra trước khi dựa vào:

| Lựa chọn | URL | Cần domain | Điểm mạnh | Điểm yếu / cần xác minh |
| --- | --- | --- | --- | --- |
| **T1. Tailscale Funnel** (khuyến nghị) | `https://<máy>.<tailnet>.ts.net`, ổn định | Không | Miễn phí cho cá nhân, không mở cổng, TLS tự động, đổi sang domain sau vẫn dùng được song song | Funnel chỉ cho một số cổng (xác minh), có giới hạn băng thông chưa công bố rõ; người chấm truy cập được vì Funnel là public |
| T2. ngrok free + static domain | `https://<tên>.ngrok-free.app`, ổn định | Không | Dựng nhanh | Trang interstitial cảnh báo cho trình duyệt có thể làm hỏng gọi API/APK (xác minh); giới hạn request/băng thông |
| T3. Cloudflare quick tunnel (`trycloudflare.com`) | Đổi mỗi lần chạy | Không | Không cần tài khoản | **Không dùng cho nộp bài**: URL đổi, APK không còn trỏ đúng; chỉ dùng thử nhanh |
| T4. Cloudflare Tunnel (named) | `https://<sub>.<domain>` ổn định | **Có** | Ổn định nhất, WAF/rate-limit miễn phí ở edge | Chỉ dùng sau khi mua domain |

**Quyết định hiện tại: T4 (đã có domain `minhthuan.dev`). T1 chỉ là dự phòng nếu tunnel Cloudflare gặp sự cố.** Bản gốc khuyến nghị T1 khi chưa có domain. Đánh đổi: T1 phụ thuộc dịch vụ bên thứ ba và tài khoản Tailscale của bạn; bù lại URL cố định và không cần chi phí. Nếu T1 không đạt tiêu chí kiểm thử (TST-09), chuyển T2.

- **FR-08** `cloudflared` chạy như container trong overlay `docker-compose.edge.yml` (`restart: unless-stopped`), trỏ hostname `travelai.minhthuan.dev` → `http://caddy:80` (cấu hình ở dashboard, tunnel dạng token). Token là secret SEC-07, chỉ ở `.env`. Caddy không cần publish cổng ra host.
- **FR-09** Biến `PUBLIC_ORIGIN` (ví dụ `https://<máy>.<tailnet>.ts.net`) là nguồn sự thật duy nhất cho CORS, WebSocket origin, build APK và tài liệu.

### 3.3 Vận hành trên PC

- **FR-10** Máy không ngủ trong lúc chấm: tắt suspend (KDE Power settings hoặc `systemd-inhibit`), cắm điện, IP/mạng không đổi cách nối (tunnel là kết nối đi ra nên IP đổi không sao).
- **FR-11** Có `scripts/up.sh`/`scripts/down.sh` và một runbook `docs/deploy/RUNBOOK.md`: bật, tắt, xem log, xoay secret, khôi phục.
- **FR-12** Backup Postgres bằng `pg_dump` định kỳ (cron/systemd timer) ra thư mục ngoài repo; giữ ≥3 bản gần nhất. Ghi rõ `ddl-auto=update` là hạn chế đã biết.
- **FR-13** Firewall host: chỉ SSH/LAN cần thiết; không có cổng nào của compose lắng nghe trên interface công cộng (kiểm tra bằng `ss -tlnp`).

### 3.4 Lộ trình khi có domain (không đổi kiến trúc)

1. Mua domain, trỏ nameserver về Cloudflare.
2. Tạo named tunnel (T4) ánh xạ `app.<domain>` → `http://127.0.0.1:8080`.
3. Đổi `PUBLIC_ORIGIN`, khởi động lại compose. Web không cần build lại (FR-03).
4. **Build lại APK** vì URL tuyệt đối nằm trong bundle. Yêu cầu tùy chọn **FR-14**: thêm màn "Server URL" trong app (hoặc đọc từ `/config.json` lúc chạy) để lần sau không phải build lại; cross-scope (`apps/mobile`), chỉ làm nếu D7 cũng được duyệt.

## 4. Bí mật và quy trình xoay

Nguyên tắc: secret chỉ tồn tại ở file `.env`/file key trên host, quyền `600`, **ngoài git**; không bao giờ trong `build-args`, `EXPO_PUBLIC_*`, log, chat hoặc báo cáo.

| ID | Secret | Dùng ở | Cách tạo / xoay |
| --- | --- | --- | --- |
| SEC-01 | `POSTGRES_PASSWORD` | postgres, backend | `openssl rand -base64 32` |
| SEC-02 | `GOOGLE_APPLICATION_CREDENTIALS` (JSON) | ai-service | **Phải xoay trước khi public** (key cũ đã chia sẻ qua chat/Discord). Google Cloud Console → IAM & Admin → Service Accounts → Keys → *Add key → Create new key (JSON)*, lưu ngoài repo, rồi **Delete** key cũ. Mount `:ro` |
| SEC-03 | `TRAVELAI_MESSAGE_KEY_FILE` | backend | `openssl rand -base64 32 > secrets/message.key && chmod 600`. DB prod là DB mới nên không cần giữ khóa dev |
| SEC-04 | `GEMINI_API_KEY` (nếu bật) | backend | Key mới ở Google AI Studio, thu hồi key cũ |
| SEC-05 | `JWT_SECRET` | chỉ v1 (`services/core`) | **Đã xoay (mục 5.1).** v2 dùng session, không cần |
| SEC-06 | SMTP (nếu bật) | backend | App password riêng, không dùng mật khẩu Gmail chính |
| SEC-07 | Token tunnel (Tailscale auth key / ngrok authtoken) | tunnel agent | Lưu trong `.env`/keyring của dịch vụ, không commit |
| SEC-08 | Mật khẩu admin seed | backend (seed) | Lấy từ env, không commit (H7) |

- **SEC-09** `.gitignore` chặn `.env*` (trừ `.env.example`), `secrets/`, `*service-account*.json`, `*.keystore`, `*.jks`. Có hook/CI quét secret (ít nhất `gitleaks` hoặc grep mẫu) trong `governance-check.sh`.
- **SEC-10** Secret cũ coi như đã chết; **không rewrite history** (đúng `AGENTS.md`).

### 5.1 Trạng thái xoay JWT (đã thực hiện 2026-11-09)

- Secret mới được ghi vào `.env` ở gốc repo (mode `600`, đã xác nhận `git check-ignore .env`). **Không** xuất hiện trong spec, báo cáo hay git.
- `services/core/src/main/resources/application.yml`: bỏ giá trị mặc định cứng cũ, còn `${JWT_SECRET}` (thiếu biến thì app không khởi động, đúng ý "fail-fast").
- `.env.example`: thay giá trị bằng placeholder `replace-with-output-of-openssl-rand-hex-32`.
- Còn lại: giá trị cũ vẫn nằm trong test fixture (`application-test.yml`, `JwtTokenProviderTest.java`) và lịch sử git. Chấp nhận vì chỉ dùng cho test, đã vô hiệu ở runtime.
- Secret mới đã được dán vào phiên chat, nên coi như **đã lộ ở mức transcript**. Nếu v1 từng chạy công khai hoặc bạn muốn sạch hoàn toàn, sinh lại bằng `openssl rand -hex 32` và sửa `.env`.
- Việc này mới là **thay đổi chưa commit** trên branch `feat/wbs-hardening-acceptance` (2 file: `.env.example`, `application.yml`).

## 5. Hardening v2 trước khi public

Mọi mục nằm trong code của Ngọc/Đức nên gắn cờ cross-scope (mục 8). Theo Q4, H3 và H4 xử lý ngoài `ai-service`.

| ID | Phát hiện (đã xác minh) | Xử lý | Nghiệm thu |
| --- | --- | --- | --- |
| H1 | `CorsConfig.java`: `allowedOriginPatterns("*")` | Đọc `CORS_ALLOWED_ORIGINS` = `PUBLIC_ORIGIN` | `curl -H "Origin: https://evil.example"` không nhận `Access-Control-Allow-Origin` |
| H2 | `WebSocketConfig.java`: `setAllowedOriginPatterns("*")` | Cùng allowlist; xác minh handshake yêu cầu token | Handshake từ origin lạ bị từ chối |
| H3 | `ai-service/ai/main.py:54-58`: `allow_credentials=True` | Không sửa code (Q4): đặt `CORS_ALLOWED_ORIGINS` env = `PUBLIC_ORIGIN`; do same-origin qua Caddy nên trình duyệt không cần CORS tới AI | Cấu hình env, ghi lại trong báo cáo |
| H4 | `/detect` không auth, ai cũng đốt được quota Vision | (1) **quota ngày thấp + budget alert** trên GCP (kiểm soát cứng); (2) rate-limit `/ai/*` ở Caddy; (3) giới hạn 10 MB | Quota hiển thị trong GCP Console; 30 request liên tiếp bị chặn ở edge |
| H5 | `show-sql=true`, `ddl-auto=update` | Profile `prod`: `show-sql=false` | Log không in SQL |
| H6 | Khóa mã hóa tin nhắn thiếu vẫn khởi động | Fail-fast khi file thiếu/rỗng | Xóa file khóa, backend không lên |
| H7 | DB trống không có admin, lịch tour, tài khoản ngân hàng mô phỏng | Script seed idempotent, mật khẩu admin từ env | Chạy seed 2 lần không lỗi, không trùng dữ liệu |
| H8 | Container hardening | non-root, `cap_drop: [ALL]`, `read_only` nếu kịp, `restart: unless-stopped` | `docker inspect` xác nhận |
| H9 | Healthcheck backend gọi `GET /api/places` | Giữ (chạm DB) | `docker compose ps` healthy |
| H10 | Actuator/swagger có thể lộ | Chặn ở Caddy (FR-04) và xác minh bằng gọi thử | `curl` từ ngoài trả 404/403 |

Thanh toán v2 là **mô phỏng** (có `Idempotency-Key`, `TransactionBarrier`): ghi rõ "mô phỏng" trong báo cáo và UI.

## 6. CI (không có CD)

- **CI-01** Mọi PR: sinh secret tạm trong job (`openssl rand`), `docker compose up -d --wait` với `VISION_MOCK_ENABLED=true`, chạy `scripts/smoke.sh`, rồi `down -v`. Không cần secret thật.
- **CI-02** Không có CD tự động và không self-hosted runner trên PC cá nhân. Deploy là lệnh tay: `git pull && docker compose -f docker-compose.yml -f docker-compose.edge.yml up -d --build --wait` (đóng gói trong `scripts/up.sh`).
- **CI-03** Không truyền secret qua `build-args`; không `EXPO_PUBLIC_*` chứa secret.
- **CI-04** `scripts/smoke.sh` kiểm: `/` trả 200, `/api/places` 200, đăng nhập tài khoản seed, `/ai/health`, một lần `/ai/detect` với ảnh mẫu (mock trong CI).

## 7. Android và đa nền tảng

- **PLT-01 Web**: `npx expo export -p web` → `dist` do Caddy phục vụ (SPA fallback về `index.html`). Kiểm responsive desktop/điện thoại.
- **PLT-02 Android APK**: release chặn HTTP (cleartext) nên bắt buộc HTTPS, đúng với `PUBLIC_ORIGIN`. Build bằng `expo prebuild` + Gradle cục bộ (đã có Android SDK) hoặc EAS (kiểm giới hạn gói miễn phí trên trang Expo). Ký bằng keystore riêng, ngoài git. `EXPO_PUBLIC_API_URL=$PUBLIC_ORIGIN`, `EXPO_PUBLIC_AI_API_URL=$PUBLIC_ORIGIN/ai` (công khai theo thiết kế).
- **PLT-03 D7** (nhận diện ảnh Android lỗi `Unsupported FormDataPart`): (a) sửa `apps/mobile/src/services/recognition.ts` gửi `File`/`Blob` (cross-scope, **khuyến nghị** nếu thử trên Waydroid pass); (b) không sửa, tuyên bố trung thực là nhận diện ảnh chỉ trên web. Quyết định ở mục 11.
- **PLT-04 iOS**: không làm; ghi rõ trong báo cáo.

## 8. Phạm vi và cross-scope

Theo `AGENTS.md`, chỉ được sửa WBS của bạn (`1.1.x`, `1.3.x`, `1.8.2`). Cross-scope đã được chấp nhận (Q4); mọi commit mang danh bạn và gắn cờ cross-scope trong PR.

| Nhóm việc | WBS | Ghi chú |
| --- | --- | --- |
| Compose, Caddy, tunnel, smoke test, runbook, secrets | 1.8.2 (của bạn) | Không cần đồng thuận |
| Cấu hình AI qua env/edge (H3, H4) | 1.3.x | Không sửa code `ai-service` |
| H1, H2, H5, H6, H7 (backend) | Đức/Ngọc | Cross-scope, đã chấp nhận |
| D7, FR-14 (mobile) | Ngọc | Tùy chọn, cần xác nhận ở mục 11 |
| Báo cáo trách nhiệm | Tài liệu của bạn | Bảng khách quan: owner, bằng chứng `file:line`, mức nghiêm trọng, hạn, tiêu chí nghiệm thu, issue sẵn để giao |

## 9. Trạng thái repo và kế hoạch hợp nhất

1. Trong worktree `TravelAI-integration`: chạy `scripts/governance-check.sh`; đảm bảo không có `node_modules`, key, binary (`*.pdf/docx/zip`) trong diff; `.gitignore` chặn `*service-account*.json` và `secrets/`.
2. Commit v2 (Conventional Commits có `(#issue)`), mở PR `integration/ngoc-2.0` → `main`.
3. Rebase/merge `feat/wbs-hardening-acceptance` theo thứ tự thống nhất; giải quyết xung đột compose và CI.
4. Tag `v1-vite-core-final` trước khi `main` đổi stack.
5. Không push, không merge `main` khi chưa được yêu cầu; PR để bạn duyệt.
6. Hiện chưa commit: 2 file đổi JWT (mục 5.1), `docs/reports/`, và spec này.

## 10. Kiểm thử và nghiệm thu

| ID | Kiểm | Cách làm | Đạt khi |
| --- | --- | --- | --- |
| TST-01 | Stack lên sạch | `docker compose ... up -d --wait` trên máy sạch | Mọi service healthy |
| TST-02 | Smoke script | `scripts/smoke.sh` | Exit 0 |
| TST-03 | Không lộ cổng | `ss -tlnp`, `nmap` từ máy khác trong LAN | Chỉ 127.0.0.1:8080 (Caddy) và cổng SSH nếu có |
| TST-04 | CORS/WS | `curl -H "Origin: …"` | Chỉ `PUBLIC_ORIGIN` được chấp nhận |
| TST-05 | Fail-fast | Xóa `JWT_SECRET` (v1) / khóa tin nhắn (v2) | Service không khởi động, lỗi rõ ràng |
| TST-06 | Hành trình web | Playwright hoặc tay trên URL công khai | Đăng nhập → tour → đặt → thanh toán mô phỏng → nhận diện ảnh |
| TST-07 | Hành trình Android | APK trên thiết bị/Waydroid qua 4G/5G | Như TST-06 (trừ D7 nếu chọn b) |
| TST-08 | Rate-limit/quota | Spam `/ai/*` | Bị chặn ở edge, quota GCP đã đặt |
| TST-09 | Tunnel ổn định | Khởi động lại PC và tunnel agent | URL không đổi, tự lên lại, hành trình vẫn pass |
| TST-10 | Secret scan | `gitleaks`/grep trên diff và `HEAD` | Không có key/secret (ngoại trừ fixture test đã biết) |
| TST-11 | Test suite | Backend 52, app 10, AI 11 | Pass; không skip/xóa test |

## 11. Câu hỏi còn mở (chặn kế hoạch triển khai)

1. ~~Tunnel~~ **Đã chốt:** T4, domain `minhthuan.dev`.
2. **D7**: duyệt phương án (a) sửa `recognition.ts` (và FR-14 "Server URL" trong app) hay chọn (b)?
3. **Thẻ/billing GCP**: Vision thật cần billing; bạn có bật được billing và đặt quota/budget alert không? (Bắt buộc cho H4.)
4. **WBS/báo cáo trên Drive**: cho tôi sửa bản trong `docs/reports/` rồi bạn đồng bộ lên Drive, hay cấp quyền đọc/ghi Drive?
5. **Secret JWT mới đã dán vào chat**: bạn muốn tôi giữ nguyên hay sinh lại?

## 12. Lịch 7 ngày (đề xuất)

| Ngày | Việc | Kiểm chứng |
| --- | --- | --- |
| 1 | Chốt mục 11; xoay key GCP; sinh secret; `compose --profile v2 up` cục bộ | Stack v2 healthy |
| 2 | Compose lõi + overlay edge (Caddy), `${VAR:?}`, `.env.example` khớp, healthcheck, seed | TST-01, TST-02 |
| 3 | **Lên URL công khai** qua T4 (`travelai.minhthuan.dev`); H1, H2, H6, H10; chặn actuator | TST-04, TST-06 từ điện thoại 4G |
| 4 | Rate-limit + quota/budget GCP; CI smoke; build APK | TST-07, TST-08, CI xanh |
| 5 | Commit/PR v2 vào `main`; báo cáo trách nhiệm; ADR; runbook, backup | PR sẵn sàng |
| 6 | Viết lại báo cáo 04, 05, README, KE_HOACH cho v2; sửa số liệu (45 test `services/ai` → 52/10/11) | Báo cáo khớp thực tế |
| 7 | Rehearsal demo, video 3-5 phút; TST-09, TST-10; `governance-check`; nộp | Checklist Q11-Q19 |

Ngày 3 là mốc quyết định: có URL công khai sớm, các ngày sau chỉ cải thiện.
