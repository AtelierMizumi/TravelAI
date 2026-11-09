# Hướng dẫn chạy TravelAI 2.0

Tài liệu này hướng dẫn chạy dự án trên **Linux** bằng Terminal. Lệnh trong tài liệu dùng Bash; trên Windows có thể dùng WSL2 với các công cụ Linux tương ứng. Đây là hướng dẫn chạy để phát triển, chưa phải hướng dẫn triển khai production.

## 1. Cần cài gì?

- [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/en/download) từ **22.18** trở lên và npm.
- [Java JDK](https://adoptium.net/), Maven và PostgreSQL. Dự án mặc định dùng Java 25; các bài kiểm thử đã chạy với Java 21.
- Python 3.11 trở lên, `pip`, `venv`, OpenSSL, GnuPG và các lệnh PostgreSQL `psql`, `createdb`, `pg_isready`, `pg_dump`, `pg_restore`.
- Internet để cài thư viện và sử dụng Google Vision, Gemini hoặc Gmail nếu bật các chức năng đó.

Kiểm tra phiên bản và công cụ:

```bash
git --version
node --version
npm --version
java -version
mvn -version
python3 --version
psql --version
pg_isready --version
openssl version
gpg --version
```

PostgreSQL cần chạy trên máy. Script `npm run dev:web` hiện kiểm tra PostgreSQL tại `127.0.0.1:5432` và cần các lệnh Linux như `setsid`.

## 2. Lấy mã nguồn

Nếu đã có thư mục repository, mở Terminal trong thư mục đó và bỏ qua lệnh clone. Nếu chưa có:

```bash
git clone https://github.com/ngoctapcodee/travel-ai-system.git travelai-moi
cd travelai-moi
```

Các lệnh bên dưới đều chạy từ **thư mục gốc dự án**. Nếu Terminal đang dùng zsh, có thể gõ `bash` một lần trước khi làm theo để dùng đúng cú pháp `read` trong tài liệu.

## 3. Cài thư viện

```bash
npm --prefix apps/mobile ci
python3 -m venv "$HOME/.virtualenvs/travelai"
source "$HOME/.virtualenvs/travelai/bin/activate"
python -m pip install -r ai-service/requirements.txt
```

Giữ môi trường Python đang kích hoạt trong Terminal mỗi khi chạy dự án. Chạy lại lệnh `source` ở trên nếu mở Terminal mới. Lần đầu chạy backend, Maven có thể tải thêm thư viện.

## 4. Cấu hình PostgreSQL

Mặc định backend kết nối database `travel_ai` tại `localhost:5432`. Dùng tài khoản PostgreSQL của bạn; **không ghi mật khẩu vào file code, GitHub hoặc chat**. Trong cùng Terminal Bash, nhập:

```bash
read -r -p 'Tên người dùng PostgreSQL: ' SPRING_DATASOURCE_USERNAME
read -r -s -p 'Mật khẩu PostgreSQL: ' SPRING_DATASOURCE_PASSWORD
printf '\n'
export SPRING_DATASOURCE_USERNAME SPRING_DATASOURCE_PASSWORD
```

Khi nhập mật khẩu, Terminal không hiện ký tự. Các biến trên chỉ có trong phiên Terminal này; phải nhập lại khi mở Terminal mới. Nếu tên database hoặc cổng khác, đặt thêm `SPRING_DATASOURCE_URL` thành URL JDBC phù hợp. Lưu ý script khởi động chung vẫn yêu cầu PostgreSQL cục bộ sẵn sàng trên cổng 5432.

### Nếu dùng database hiện có

Dùng đúng database, tài khoản và **khóa mã hóa tin nhắn gốc** của database đó. Không tạo lại database và không thay khóa cũ. Cấu hình đường dẫn tuyệt đối đến khóa gốc:

```bash
read -r -p 'Đường dẫn tuyệt đối tới message.key gốc: ' TRAVELAI_MESSAGE_KEY_FILE
export TRAVELAI_MESSAGE_KEY_FILE
```

Sao lưu trước khi nâng cấp schema. Với database cũ có tin nhắn chưa mã hóa, dừng backend và thực hiện bước migration tại mục 7. Không tạo khóa mới thay khóa gốc: tin nhắn đã mã hóa sẽ không giải mã được.

### Nếu tạo database hoàn toàn mới

Chỉ làm bước này nếu chưa có database `travel_ai` và bạn thực sự muốn tạo database mới. Tài khoản PostgreSQL được nhập ở trên phải có quyền tạo database:

```bash
createdb -h 127.0.0.1 -p 5432 -U "$SPRING_DATASOURCE_USERNAME" travel_ai
```

Nhập mật khẩu PostgreSQL nếu được hỏi. Nếu tài khoản không có quyền tạo database, nhờ quản trị PostgreSQL tạo database và cấp quyền cho tài khoản đó. Không xóa hoặc tạo đè database cũ.

Với database mới chưa có tin nhắn mã hóa, tạo một khóa riêng **ngoài repository**:

```bash
umask 077
mkdir -p "$HOME/.local/share/travelai"
export TRAVELAI_MESSAGE_KEY_FILE="$HOME/.local/share/travelai/message.key"
if [ ! -e "$TRAVELAI_MESSAGE_KEY_FILE" ]; then
  openssl rand -base64 32 > "$TRAVELAI_MESSAGE_KEY_FILE"
fi
```

Lưu bản sao an toàn của khóa này. Không đưa khóa lên GitHub. Khóa này dùng để mã hóa tin nhắn trên máy chủ, không phải mã hóa đầu cuối.

## 5. Cấu hình Google Vision và Gemini

**Nhận diện ảnh Google Vision:** file JSON service account được cố ý loại khỏi GitHub. Nếu đã có file hợp lệ được giữ ngoài repository, nhập đường dẫn tuyệt đối:

```bash
read -r -p 'Đường dẫn tuyệt đối file JSON Google Vision: ' GOOGLE_APPLICATION_CREDENTIALS
export GOOGLE_APPLICATION_CREDENTIALS
```

Dự án Google Cloud cần bật Vision API và có quyền/hạn mức phù hợp. Không gửi hoặc commit file JSON. Nếu chưa cấu hình, ứng dụng vẫn có thể khởi động nhưng chức năng nhận diện ảnh không hoạt động. Google Vision có thể phát sinh phí theo cấu hình tài khoản.

**Chat AI Gemini, nếu muốn dùng:** nhập khóa vào môi trường backend, không lưu vào code:

```bash
read -r -s -p 'Gemini API key: ' GEMINI_API_KEY
printf '\n'
export GEMINI_API_KEY
```

Không cần nhập Gemini key nếu chưa dùng chat AI. Gemini cần tài khoản có quyền và hạn mức; có thể phát sinh phí. Phân tích Gemini trong AI service nhận diện ảnh hiện đang bị vô hiệu hóa; nhận diện ảnh sử dụng Google Vision.

## 6. Chạy web lần đầu

Sau khi đã làm các bước trên:

```bash
npm run dev:web
```

Script khởi động hoặc dùng lại backend, AI service và Expo. Giữ Terminal mở. Mở [http://localhost:8084](http://localhost:8084) nếu trình duyệt không tự mở. Backend mặc định ở cổng 8080, AI service ở cổng 8000. Dừng bằng `Ctrl+C`.

Nếu bạn vừa tạo **database hoàn toàn mới**, backend tạo các bảng ban đầu khi khởi động. Sau khi web đã chạy lần đầu, dừng bằng `Ctrl+C`, làm mục 7 rồi khởi động lại. Database mới chưa có sẵn tài khoản quản trị hoặc danh mục tour/khách sạn; cần đăng ký và cấu hình dữ liệu thật trước khi sử dụng các chức năng đó.

## 7. Sao lưu và cập nhật database

Với database đã tồn tại, hãy kiểm tra bản sao lưu và dừng các tiến trình đang ghi dữ liệu trước khi chạy. Đảm bảo các biến PostgreSQL và `TRAVELAI_MESSAGE_KEY_FILE` ở mục 4 vẫn còn trong Terminal. Khóa phải là khóa gốc nếu database có tin nhắn đã mã hóa.

```bash
python3 scripts/migrate_message_encryption.py
python3 scripts/migrate_message_encryption.py --apply
```

Lệnh đầu chỉ kiểm tra; lệnh thứ hai tạo và xác minh bản sao lưu database mã hóa, áp dụng các thay đổi schema và chuyển các tin nhắn cũ chưa mã hóa. Bản sao lưu mặc định nằm trong `.local-backups/`. Giữ an toàn cả bản sao lưu và khóa mã hóa; mất khóa có thể khiến dữ liệu không đọc được. Sau đó chạy lại `npm run dev:web`.

## 8. Bật gửi mã quên mật khẩu qua Gmail

Đây là cấu hình của **máy chủ gửi thư**, chỉ làm cho tài khoản Gmail dùng để gửi. Người dùng TravelAI khác không cần cấu hình Gmail của họ.

1. Bật xác minh 2 bước cho Gmail gửi thư và tạo [mật khẩu ứng dụng Google](https://support.google.com/accounts/answer/185833?hl=vi).
2. Dừng backend hiện tại bằng `Ctrl+C`. Trong cùng Terminal đã kích hoạt môi trường Python và cấu hình PostgreSQL/khóa tin nhắn, chạy:

   ```bash
   bash scripts/dev-with-gmail.sh web
   ```

3. Nhập địa chỉ Gmail gửi thư và mật khẩu ứng dụng khi được hỏi. Mật khẩu không hiện khi gõ. Script kiểm tra kết nối SMTP trước khi chạy.
4. Trên trang đăng nhập TravelAI, chọn **Quên mật khẩu?**, nhập email đã đăng ký, nhận và nhập mã; sau khi xác nhận đúng, đặt mật khẩu TravelAI mới.

Mật khẩu ứng dụng chỉ nằm trong môi trường tiến trình và cần nhập lại khi chạy lại script. Script lưu khóa riêng cho phiên khôi phục tại `backend/.secrets/password-reset.key`; giữ bản sao an toàn và không commit file đó. Mã khôi phục có hạn, dùng một lần và không phải mật khẩu Gmail.

## 9. Chạy trên điện thoại

Trong cùng Terminal đã cấu hình như trên, chạy:

```bash
npm run dev
```

Mở ứng dụng Expo tương thích trên Android/iOS và quét mã QR được hiển thị. Điện thoại và máy chạy backend cần kết nối mạng phù hợp, thường là cùng Wi-Fi; điện thoại phải truy cập được các cổng backend và AI. Camera, micro, lưu trữ và hiệu năng cần được kiểm tra trên thiết bị thật. Xuất bundle JavaScript không tự tạo file APK/IPA đã ký.

## 10. Kiểm thử

Từ thư mục gốc và trong môi trường Python đã kích hoạt:

```bash
npm run check
scripts/test-backend.sh
python3 -m unittest discover -s ai-service/tests -v
```

Kiểm thử backend tạo PostgreSQL tạm với dữ liệu thử; cần các lệnh `initdb` và `pg_ctl` trong `PATH`. Kiểm thử AI giả lập nhà cung cấp và không cần file Google Vision thật. Bài kiểm thử không thay thế kiểm tra Gmail, camera/micro hoặc thanh toán trên thiết bị thật.

## 11. Lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| `PostgreSQL chưa sẵn sàng` | Bật PostgreSQL, kiểm tra `pg_isready -h 127.0.0.1 -p 5432`, tên database và quyền tài khoản. |
| Backend không khởi động | Xem `/tmp/travelai-dev-$(id -u)/backend.log`; kiểm tra JDK, Maven, kết nối database và các biến môi trường. Không chia sẻ log có bí mật. |
| Thiếu khóa mã hóa tin nhắn | Kiểm tra `TRAVELAI_MESSAGE_KEY_FILE`; với database cũ phải dùng khóa gốc. |
| Gmail từ chối đăng nhập | Kiểm tra Gmail gửi thư, xác minh 2 bước và tạo lại mật khẩu ứng dụng. Nếu đổi mật khẩu Google, mật khẩu ứng dụng cũ có thể bị thu hồi. |
| Không có thư xác nhận | Kiểm tra backend đã chạy với cấu hình Gmail, hộp thư rác và email đăng ký. Lỗi SMTP sẽ được báo; không gửi mã xác nhận cho người khác. |
| Nhận diện ảnh báo chưa cấu hình | Kiểm tra `GOOGLE_APPLICATION_CREDENTIALS`, quyền Vision API, hạn mức và log AI service; không tải JSON lên GitHub. |
| Tour/khách sạn chưa có lịch hoặc không thanh toán được | Database mới không có lịch bán, tồn chỗ hay tài khoản ngân hàng mô phỏng sẵn; quản trị viên cần cấu hình dữ liệu cần thiết. Mọi khoản thanh toán đều là **SIMULATED**. |

Tham khảo thêm [README](README.md), [hướng dẫn AI service](ai-service/README.md) và [sơ đồ database](docs/database-hien-tai.md).
