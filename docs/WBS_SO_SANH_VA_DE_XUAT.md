# Đề xuất cập nhật WBS — TravelAI 2.0

**Ngày đối chiếu:** 09/11/2026  
**Nguồn cũ:** [ngoctapcodee/ai](https://github.com/ngoctapcodee/ai), nhánh `main`, commit `c2ee6fa`.  
**Nguồn hiện tại:** [ngoctapcodee/travel-ai-system](https://github.com/ngoctapcodee/travel-ai-system), nhánh `main`, commit `5799682`.  
**Nguồn WBS:** danh sách tiêu đề và mã issue do chủ dự án cung cấp; tài liệu này không đọc được trạng thái Kanban, mô tả chi tiết hoặc nghiệm thu thực tế của từng issue.

Tài liệu là **bản đề xuất để sửa WBS**, không tự cập nhật GitHub Project. Các trạng thái dưới đây là đề xuất dựa trên mã nguồn và bằng chứng kiểm thử hiện có, không phải trạng thái đã đọc từ board.

## Ký hiệu đề xuất

- **Có mã — cần nghiệm thu:** có chức năng hoặc tài liệu trong dự án, nhưng chưa đủ bằng chứng để kết luận toàn bộ yêu cầu đã hoàn thành.
- **Một phần:** có một số thành phần liên quan, còn thiếu phạm vi hoặc kiểm thử quan trọng.
- **Chưa thấy triển khai:** chưa tìm thấy trong mã nguồn được đối chiếu; không khẳng định không tồn tại ở môi trường hoặc repository khác.
- **Ngừng sử dụng:** issue cũ đã được thay thế; giữ lại để truy vết, không tính hai lần.

Không tự đánh dấu `Done`, không tự gán phần trăm hoàn thành và không suy ra trạng thái từ ngày sprint.

## 1. Những thay đổi chính so với repository cũ

| Nội dung | Repository cũ `ai` | Repository hiện tại `travel-ai-system` |
| --- | --- | --- |
| Giao diện | Có frontend React/Vite và admin web riêng. | Một ứng dụng Expo/React Native dùng chung mã nguồn cho Web, Android và iOS; admin nằm trong cùng ứng dụng. Cần kiểm thử trên thiết bị thật; chưa khẳng định đã có APK/IPA phát hành. |
| Dữ liệu | Một số màn hình dùng dữ liệu mẫu: [feed cũ](https://github.com/ngoctapcodee/ai/blob/c2ee6fa3949a7c76462073862bb82c71b69392f1/frontend/src/pages/Feed.jsx) khởi tạo bài viết cố định; [thanh toán cũ](https://github.com/ngoctapcodee/ai/blob/c2ee6fa3949a7c76462073862bb82c71b69392f1/frontend/src/pages/Booking/Payment.jsx) lưu đặt chỗ trong `localStorage`. | Nhiều luồng lấy dữ liệu qua API Spring Boot và lưu trong PostgreSQL. Database mới không tự có đầy đủ danh mục, lịch bán hoặc ngân hàng mô phỏng. |
| Xác thực | Controller cũ so sánh mật khẩu với dữ liệu người dùng. | Mã đăng nhập mới dùng phiên/token lưu phía máy chủ, băm mật khẩu PBKDF2, phân quyền USER/ADMIN và luồng quên mật khẩu qua email. Chưa thấy triển khai JWT hoặc OAuth2. |
| Đặt chỗ và thanh toán | Có giao diện/luồng mô phỏng ở frontend. | Có API xem lại, giữ/phân bổ tồn chỗ, lịch sử, hủy/đổi lịch và thanh toán **SIMULATED** qua database. Không kết nối ngân hàng, Mastercard hoặc cổng thanh toán thật. |
| AI | Có FastAPI và Google Cloud Vision. | Giữ FastAPI/Vision, có giao diện chọn/chụp ảnh, trạng thái không chắc chắn và quét khung hình định kỳ có yêu cầu đồng ý; có trợ lý Gemini riêng. Cần cấu hình khóa và kiểm thử trên thiết bị. |
| Cộng đồng và tin nhắn | Có giao diện feed với bài viết mẫu. | Có API/bảng cho bài viết, tương tác, theo dõi, tin nhắn và WebSocket; nội dung tin nhắn được mã hóa khi lưu trên máy chủ. Đây không phải mã hóa đầu cuối. |
| Kiến trúc | README cũ mô tả frontend, Spring Boot/PostgreSQL và FastAPI. | FastAPI là tiến trình riêng; phần lớn chức năng nghiệp vụ vẫn ở một backend Spring Boot dùng chung PostgreSQL. **Chưa phải hệ thống microservice đầy đủ, chưa có database riêng cho từng service.** |
| Chức năng cũ cần lưu ý | Có màn hình nhà hàng và [lập lịch trình mẫu cố định](https://github.com/ngoctapcodee/ai/blob/c2ee6fa3949a7c76462073862bb82c71b69392f1/frontend/src/pages/TripPlanner.jsx). | Chưa thấy module nhà hàng hoặc màn hình Trip Planner tương đương trong ứng dụng mới. Chat Gemini không nên được ghi là đã thay thế đầy đủ Trip Planner. Nếu còn thuộc phạm vi, tạo việc riêng để triển khai. |
| Quản lý khóa | Lịch sử repo cũ từng chứa JSON service account. | Repo mới được tạo với lịch sử mới và không đưa JSON key lên; khóa, mật khẩu database và cấu hình SMTP phải được cung cấp riêng ở môi trường chạy. Không suy ra mọi vấn đề bảo mật đã được kiểm toán. |

## 2. Nội dung đề xuất cho từng issue WBS hiện có

Mỗi dòng gồm **tên có thể dùng cho issue**, phạm vi hiện tại và phần còn cần làm/kiểm chứng.

| Mã / issue | Tên issue đề xuất | Trạng thái đề xuất | Nội dung nên ghi vào WBS |
| --- | --- | --- | --- |
| **1.1.1 / #1** | Đặc tả yêu cầu và phạm vi TravelAI đa nền tảng | Có tài liệu — cần nghiệm thu | Có `spec.md`, user story, FR và checklist cho Web/Android/iOS, đặt chỗ, chính sách mô phỏng và quản trị. Checklist vẫn còn mục bằng chứng triển khai/thiết bị chưa hoàn tất; đối chiếu với sản phẩm và cập nhật khi thay đổi phạm vi. |
| **1.1.2 / #2** | Thiết kế kiến trúc hiện tại và lộ trình microservice | Một phần | Ghi đúng hiện trạng: Expo client, một backend Spring Boot, một PostgreSQL và FastAPI/Vision riêng. **Chưa có bằng chứng về AI Gateway hay microservice độc lập cho từng nghiệp vụ.** Nếu giữ mục tiêu microservice, bổ sung thiết kế ranh giới service, giao tiếp, sở hữu dữ liệu và nhất quán giao dịch. |
| **1.1.3 / #3** | Mô hình PostgreSQL, migration và sao lưu | Một phần | Có entity, SQL migration và hướng dẫn database; lần kiểm tra máy cục bộ có 29 bảng. Cần kiểm thử khởi tạo mới/khôi phục, phân quyền và sao lưu ở môi trường đích; không gọi là PostgreSQL Enterprise hoặc database riêng từng service khi chưa có bằng chứng. |
| **1.2.1 / #4** | Đăng ký, đăng nhập và khôi phục mật khẩu an toàn | Có mã — cần nghiệm thu | Có phiên máy chủ, PBKDF2, USER/ADMIN và quên mật khẩu: gửi mã email, xác nhận mã, sau đó mới đặt mật khẩu TravelAI mới. Cần cấu hình SMTP và kiểm thử bảo mật; **JWT/OAuth2 chưa thấy triển khai**, chỉ giữ trong tên/phạm vi nếu tiếp tục lên kế hoạch. |
| **1.2.2 / #5** | Hồ sơ cá nhân và quản lý nội dung của tôi | Có mã — cần nghiệm thu | Có hồ sơ, chọn ảnh đại diện từ thiết bị, thông tin cá nhân, danh sách bài viết và đặt chỗ. Kiểm thử quyền sửa hồ sơ, tải ảnh và hoạt động trên thiết bị thật. |
| **1.3.1 / #6** | Chọn/chụp và tiền xử lý ảnh đa nền tảng | Có mã — cần nghiệm thu | Có chọn ảnh hoặc chụp, tiền xử lý trước upload, hỏi quyền camera và xác nhận gửi ảnh tới Vision. Cần kiểm thử định dạng, kích thước, từ chối quyền và thiết bị Android/iOS. |
| **1.3.2 / #7** | Nhận diện hình ảnh bằng FastAPI và Google Cloud Vision | Một phần | Có API nhận diện thật, xử lý lỗi và trạng thái dự đoán/không xác định. Lần thử 15 ảnh mẫu cho 9 ảnh có tên phù hợp đối chiếu sơ bộ, 6 ảnh chưa xác định; bộ mẫu nhỏ và có ảnh trùng, **không dùng kết quả này làm độ chính xác tổng quát**. Cần dataset gán nhãn, đo sai số và kiểm thử thiết bị. |
| **1.3.3 / #8** | Hiển thị kết quả AI và dịch vụ liên quan | Một phần | Màn hình hiển thị tên dự đoán, mô tả, nhãn, tọa độ/nguồn khi có. Trang chi tiết địa điểm có tour/khách sạn liên quan theo thông tin danh mục; chưa thấy kết nối tự động kết quả nhận diện với bộ gợi ý dịch vụ thông minh. Cần xác định cách ghép dữ liệu và đo chất lượng gợi ý. |
| **1.4.1 / #9** | Khám phá địa điểm và xem chi tiết | Có mã — cần nghiệm thu | Có danh mục/chi tiết địa điểm qua API, liên kết tour/khách sạn và nút mở chỉ đường Google Maps. Nút mở Google Maps bên ngoài, không phải bản đồ dẫn đường nhúng; cần kiểm thử dữ liệu và giao diện. |
| **1.4.2 / #10** | Danh mục và chi tiết tour | Có mã — cần nghiệm thu | Có API và giao diện danh sách/chi tiết tour, tìm kiếm và liên kết đặt chỗ. Cần cấu hình dịch vụ, lịch, giá và tồn chỗ thật của môi trường mô phỏng; kiểm thử quyền admin và người dùng. |
| **1.4.3 / #11** | Danh mục và tìm kiếm khách sạn | Có mã — cần nghiệm thu | Có danh sách/chi tiết, nhóm theo tỉnh và bộ lọc giá, điểm sao, khu vực từ dữ liệu có sẵn. Cần kiểm thử chất lượng dữ liệu địa chỉ, 34 tỉnh/thành và hành vi trên mobile. |
| **1.5.1 / #12** | Đặt dịch vụ và thanh toán ngân hàng **SIMULATED** | Một phần | Có bước xem lại/xác nhận, liên kết tài khoản thử, thanh toán thành công/thất bại, ghi nhận lịch sử và xử lý giữ/phân bổ chỗ. Thanh toán và số dư là **SIMULATED**; không lưu/thực hiện thanh toán bằng dữ liệu thẻ thật. Cần nghiệm thu đồng thời, retry, hết hạn giữ và kiểm thử giao diện đầu-cuối. |
| **1.5.2 / #13** | Lịch sử đặt chỗ, hủy và đổi lịch | Một phần | Có lịch sử, hủy, hoàn phí và đổi lịch. Chính sách mô phỏng: hủy tự nguyện đủ điều kiện hoàn 65%/phí 35%; admin hủy do không cung cấp dịch vụ hoàn 100%; đổi lịch thu phí 20% giá gốc và chênh lệch dương chỉ theo quy tắc ngày lễ Việt Nam, không hoàn chênh lệch âm. Cần kiểm thử cutoff được cấu hình, lịch lễ từng năm, cạnh tranh tồn chỗ và giao diện. |
| **1.6.1 / #14** | Đánh giá sao, nội dung và ảnh sau trải nghiệm | Có mã — cần nghiệm thu | Có đánh giá cho booking đủ điều kiện sau khi kết thúc, một đánh giá/booking, lọc số sao, sắp xếp và đọc thêm trên tour/khách sạn. Cần kiểm thử lịch kết thúc, quyền tác giả, ảnh và thiết bị. |
| **1.6.2 / #15** | Bảng tin du lịch và tương tác cộng đồng | Có mã — cần nghiệm thu | Có API và giao diện bài viết, ảnh, thích, bình luận, chia sẻ, theo dõi và kiểm duyệt; khác feed mẫu cũ. Cần kiểm thử quyền, cập nhật đồng thời, trải nghiệm và dữ liệu lỗi. |
| **1.6.3 / #16** | Tin nhắn và thông báo qua WebSocket | Một phần | Có WebSocket/STOMP, cập nhật lại sau kết nối, polling dự phòng, tin nhắn văn bản/thoại và mã hóa nội dung khi lưu. Không phải mã hóa đầu cuối; chưa có bằng chứng push notification hệ điều hành hoặc kiểm thử liên thiết bị đầy đủ. |
| **1.7.1 / #17** | Dashboard quản trị và thống kê cơ bản | Một phần | Có số lượng users, posts, places và booking tour/khách sạn từ API. Chưa thấy dashboard phân tích doanh thu, biểu đồ hoặc bộ lọc nâng cao được nghiệm thu. |
| **1.7.2 / #18** | Quản lý danh mục địa điểm | Có mã — cần nghiệm thu | Có CRUD địa điểm trong admin và API bảo vệ thao tác quản trị. Cần kiểm thử quyền, dữ liệu ảnh, xác nhận xóa và ảnh hưởng đến dữ liệu liên quan. |
| **1.7.3 / #19** | Quản lý tour, khách sạn, lịch bán và khuyến mãi | Một phần | Có CRUD tour/khách sạn, cấu hình offering/tồn chỗ, chính sách, lịch lễ và khuyến mãi theo khoảng ngày; trang chủ hiển thị một số ưu đãi hợp lệ. Cần kiểm thử UI admin, lịch lễ đúng năm và giá khuyến mãi xuyên ngày/thiết bị. Chưa chứng minh có portal đối tác độc lập. |
| **1.7.4 / #20** | Quản lý người dùng và phân quyền USER/ADMIN | Một phần | Có danh sách và thao tác quản trị người dùng, khóa/mở, vai trò; backend kiểm tra quyền. Cần kiểm thử phân quyền từng endpoint và tự bảo vệ tài khoản. Chưa gọi là hệ thống RBAC doanh nghiệp nhiều vai trò/quyền chi tiết khi chưa có bằng chứng. |
| **1.7.5 / #21** | Quản lý đặt chỗ và lịch sử giao dịch SIMULATED | Một phần | Có màn hình admin xem đặt chỗ/lịch sử và thực hiện một số thao tác theo quyền; giao dịch là mô phỏng. Chưa thấy đối soát với ngân hàng/cổng thanh toán thật, xuất báo cáo đối soát đầy đủ hoặc quy trình kế toán thực tế. |
| **1.7.6 / #22** | Kiểm duyệt nội dung và cấu hình hệ thống | Một phần | Có duyệt/từ chối bài viết và một số cấu hình hệ thống. Cần xác định danh sách cấu hình, audit log, kiểm thử quyền và bảo vệ dữ liệu trước khi nghiệm thu. |
| **1.8.1 / #23** | Kiểm thử đơn vị, tích hợp và E2E đa nền tảng | Một phần | Có bộ kiểm thử backend trên PostgreSQL tạm, hợp đồng AI giả lập và test client. Lần kiểm tra bản chuẩn bị 08/11/2026: 52 backend, 10 client, 11 AI đạt; không đồng nghĩa E2E hay kiểm thử Android/iOS thật đã hoàn thành. Cần bổ sung E2E, đồng thời, bảo mật, hiệu năng và báo cáo nghiệm thu. |
| **1.8.2 / #24** | Đóng gói, CI/CD và triển khai cloud | Chưa thấy triển khai | Repo công khai và tài liệu chạy local đã có. Chưa thấy Dockerfile/Compose, workflow CI/CD hoặc cấu hình AWS trong snapshot đối chiếu. Cần xây dựng pipeline, quản lý bí mật, môi trường staging, backup và kiểm thử triển khai nếu đây vẫn là mục tiêu. |
| **Deprecated / #25** | Triển khai cloud và bàn giao — thay bằng #24 | Ngừng sử dụng | Giữ liên kết sang #24 để truy vết; không tính là hai hạng mục triển khai riêng. |

## 3. Hạng mục mới nên thêm nếu muốn theo dõi riêng

Các mục sau có thể là issue mới hoặc sub-issue của issue được nêu; tránh tính trùng phạm vi.

1. **Ứng dụng dùng chung Web/Android/iOS và thiết kế giao diện** — thuộc #6/#9–#16: hoàn thiện responsive, animation, accessibility; build và kiểm thử trên Android/iOS thật. Không ghi “đã phát hành app” chỉ vì export bundle thành công.
2. **Đổi lịch, giữ chỗ và lịch lễ Việt Nam** — sub-issue #13: kiểm thử phí 20% giá gốc, chênh lệch chỉ áp dụng theo chính sách ngày lễ, cutoff hai lịch, snapshot chính sách, bảo vệ chỗ cũ và idempotency.
3. **Ngân hàng mô phỏng và lịch sử thất bại** — sub-issue #12/#21: dữ liệu `SIM-MC`/`TEST` tổng hợp, trạng thái tài khoản, thanh toán thất bại/thử lại và không lưu dữ liệu thẻ thật.
4. **Trợ lý Gemini và tương tác giọng nói** — issue mới thuộc nhóm AI: chat chữ, ghi âm/đọc trả lời và cấu hình key trên backend; kiểm thử quyền micro, hạn mức, lỗi nhà cung cấp và thiết bị. Không ghi Gemini đã xử lý nhận diện ảnh: đường phân tích Gemini trong AI service đang bị vô hiệu hóa.
5. **Khuyến mãi và lịch lễ do admin quản lý** — sub-issue #19: phân biệt khoảng ngày sale với lịch ngày lễ Việt Nam, kiểm thử giá và hiển thị trên trang chủ/danh mục.
6. **Quét camera định kỳ và đối tượng/văn hóa** — sub-issue #6/#7: xác nhận gửi khung hình, quyền camera, hộp bao từ Vision khi có; kiểm thử độ trễ, chi phí và độ chính xác. Hiện không có cơ sở để bảo đảm nhận diện chính xác mọi món ăn hay hiện vật Việt Nam theo thời gian thực.
7. **Bảo mật dữ liệu và quản lý secrets** — liên kết #4/#16/#24: rà soát TLS, giới hạn truy cập, vòng đời khóa, sao lưu/khôi phục, quét secrets và xử lý khóa cũ đã lộ; phân biệt mã hóa khi lưu với E2E.
8. **Thông báo và hỗ trợ người dùng** — tách khỏi #16 nếu cần: chuông thông báo trong ứng dụng, kênh liên hệ, nhắc lịch; đánh giá riêng nhu cầu push notification trên thiết bị.
9. **Nhà hàng và Trip Planner** — chỉ thêm nếu chủ dự án xác nhận vẫn thuộc phạm vi: hai màn hình này có trong mã giao diện cũ nhưng chưa thấy chức năng tương đương đầy đủ ở bản mới; thiết kế lại dựa trên API/dữ liệu thực thay vì mẫu cố định.

## 4. Đề xuất thứ tự làm tiếp

1. Thống nhất lại phạm vi sản phẩm và sửa tên các issue có chữ **microservice**, **JWT/OAuth2**, **thanh toán trực tuyến**, **RBAC Enterprise** hoặc **cloud** để phản ánh đúng hiện trạng.
2. Nghiệm thu các luồng chính trên dữ liệu thử an toàn: đăng ký/khôi phục mật khẩu, nhận diện ảnh, tour/khách sạn, thanh toán/hủy/đổi lịch SIMULATED và cộng đồng/tin nhắn.
3. Thiết lập dữ liệu admin, lịch lễ và ngân hàng mô phỏng theo môi trường; kiểm thử giao diện Android/iOS và quyền camera/micro trên thiết bị thật.
4. Bổ sung kiểm thử đầu-cuối, bảo mật và hiệu năng; lưu bằng chứng theo từng issue trước khi đặt `Done`.
5. Sau khi chốt thiết kế triển khai, thực hiện Docker/CI-CD/cloud; chỉ tách microservice khi có thiết kế nhất quán giao dịch giữa đặt chỗ, tồn chỗ và ngân hàng mô phỏng.

## 5. Nguồn kiểm tra trong repository hiện tại

- Đặc tả và checklist: [`spec.md`](../specs/001-travelai-cross-platform/spec.md), [`requirements.md`](../specs/001-travelai-cross-platform/checklists/requirements.md).
- Kiến trúc và database: [`README.md`](../README.md), [`database-hien-tai.md`](database-hien-tai.md).
- Đặt chỗ và chính sách: [`BookingService.java`](../backend/src/main/java/com/travelai/backend/booking/BookingService.java), [`BookingPolicies.java`](../backend/src/main/java/com/travelai/backend/booking/BookingPolicies.java).
- Xác thực: [`SessionService.java`](../backend/src/main/java/com/travelai/backend/security/SessionService.java), [`PasswordResetService.java`](../backend/src/main/java/com/travelai/backend/security/PasswordResetService.java).
- Ứng dụng: [`apps/mobile/src`](../apps/mobile/src), đặc biệt `app/admin.tsx`, `app/messages.tsx`, `screens/recognition.tsx`.
- AI và thử ảnh: [`ai-service/ai/main.py`](../ai-service/ai/main.py), [báo cáo ảnh mẫu](kiem-thu-anh-ai-2026-11-08.md).
- Kiểm thử: [`scripts/test-backend.sh`](../scripts/test-backend.sh), `apps/mobile/tests`, `ai-service/tests`.
