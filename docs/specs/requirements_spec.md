# 📑 TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) - TRAVELAI

> **Mã công việc WBS**: `1.1.1 - Tài liệu đặc tả yêu cầu & phạm vi doanh nghiệp (SRS)`  
> **Người thực hiện**: Trần Minh Thuận (Tech Lead / PM)  
> **Phiên bản**: `1.0.0` | **Sprint**: `Sprint 1 (Tuần 1 - 2)`  
> **Liên kết Issue**: [Issue #1](https://github.com/AtelierMizumi/TravelAI/issues/1)

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
TravelAI là nền tảng du lịch thông minh thế hệ mới, ứng dụng trí tuệ nhân tạo (Computer Vision & AI Landmark Detection) để tự động nhận diện danh lam thắng cảnh từ hình ảnh của du khách, kết nối liền mạch với hệ sinh thái khám phá điểm đến, đặt phòng khách sạn / tour du lịch, đánh giá cộng đồng và trò chuyện thời gian thực.

---

## 2. TÁC NHÂN HỆ THỐNG (SYSTEM ACTORS)
1. **Du Khách (Guest / Unauthenticated User)**:
   - Tra cứu, tìm kiếm địa danh du lịch theo tỉnh thành, thể loại.
   - Upload ảnh để trải nghiệm tính năng nhận diện địa danh bằng AI.
   - Xem chi tiết tour, khách sạn và các đánh giá công khai.
2. **Thành Viên Đăng Ký (Authenticated User / Traveler)**:
   - Quản lý hồ sơ cá nhân, lịch sử tìm kiếm.
   - Đặt tour du lịch, đặt phòng khách sạn và quản lý đơn đặt chỗ (Booking).
   - Viết bài chia sẻ trải nghiệm, đăng album ảnh, tương tác Like/Comment/Follow.
   - Viết đánh giá (Reviews & Ratings) sau chuyến đi.
   - Nhắn tin trực tiếp qua kênh Chat thời gian thực (WebSocket).
3. **Quản Trị Viên (Administrator - ROLE_ADMIN)**:
   - Theo dõi số liệu vận hành qua Dashboard tổng quan.
   - Quản lý danh mục người dùng, phân quyền và khóa tài khoản vi phạm.
   - Quản trị kho dữ liệu địa danh du lịch, tọa độ và hình ảnh đối sánh.
   - Quản lý đơn đặt chỗ, duyệt thanh toán và xuất báo cáo.
   - Kiểm duyệt nội dung bài viết và phản hồi vi phạm cộng đồng.

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS - FR)

### FR-01: Phân Hệ Nhận Diện Hình Ảnh Bằng AI (AI Vision Subsystem)
- **FR-01.1**: Người dùng upload ảnh từ thiết bị (hỗ trợ JPG, PNG, WEBP; dung lượng tối đa 10MB).
- **FR-01.2**: Hệ thống tiền xử lý ảnh: kiểm tra tính hợp lệ, nén và chuẩn hóa kích thước trước khi phân tích.
- **FR-01.3**: AI Service phân tích hình ảnh thông qua Google Cloud Vision API (Landmark Detection & Web Detection).
- **FR-01.4**: Trả về tên địa danh nhận diện được, tọa độ địa lý, độ tin cậy (Confidence Score > 70%) và liên kết trực tiếp tới cơ sở dữ liệu địa danh trong hệ thống.
- **FR-01.5**: Tự động gợi ý các tour du lịch và khách sạn lân cận địa danh vừa nhận diện.

### FR-02: Phân Hệ Xác Thực & Tài Khoản (Authentication & User Profile)
- **FR-02.1**: Đăng ký tài khoản với email, họ tên, mật khẩu được mã hóa an toàn (BCrypt).
- **FR-02.2**: Đăng nhập hệ thống, cấp phát token bảo mật JSON Web Token (JWT).
- **FR-02.3**: Quản lý thông tin cá nhân: cập nhật avatar, số điện thoại, đổi mật khẩu.

### FR-03: Phân Hệ Khám Phá & Đặt Dịch Vụ Lữ Hành (Discovery & Booking)
- **FR-03.1**: Tìm kiếm toàn văn (Full-text search) địa điểm du lịch, lọc theo vùng miền/tỉnh thành.
- **FR-03.2**: Xem danh mục và chi tiết các gói tour du lịch (lịch trình chi tiết, giá tiền, số chỗ còn trống).
- **FR-03.3**: Xem danh mục và chi tiết khách sạn (hạng sao, tiện nghi, loại phòng, giá theo đêm).
- **FR-03.4**: Tạo đơn đặt chỗ (Booking): chọn ngày khởi hành/nhận phòng, số lượng khách, tính tổng tiền và thanh toán.

### FR-04: Phân Hệ Mạng Xã Hội Du Lịch & Đánh Giá (Social & Reviews)
- **FR-04.1**: Viết bài chia sẻ kinh nghiệm du lịch kèm đính kèm ảnh và gắn thẻ địa danh.
- **FR-04.2**: Tương tác bài viết: Thả tim (Like), Bình luận (Comment), Theo dõi tác giả (Follow).
- **FR-04.3**: Gửi đánh giá (Rating 1 - 5 sao + nhận xét) cho địa danh/tour/khách sạn. Tự động cập nhật điểm trung bình.
- **FR-04.4**: Nhắn tin trực tiếp thời gian thực (Real-time Chat) qua giao thức WebSocket STOMP.

### FR-05: Phân Hệ Quản Trị Hệ Thống (Admin Portal)
- **FR-05.1**: Dashboard hiển thị biểu đồ thống kê: tổng lượt nhận diện AI, đơn booking, người dùng, doanh thu.
- **FR-05.2**: Quản lý người dùng: xem danh sách, lọc vai trò, khóa/mở khóa tài khoản.
- **FR-05.3**: Quản lý địa danh: thêm mới, chỉnh sửa thông tin, tọa độ, mô tả và ảnh mẫu.
- **FR-05.4**: Quản lý đơn đặt chỗ: duyệt đơn, cập nhật trạng thái đơn (Pending, Confirmed, Cancelled, Completed).
- **FR-05.5**: Kiểm duyệt bài viết cộng đồng, gỡ bỏ nội dung không phù hợp.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

| Mã NFR | Tiêu Chí | Chỉ Số Đạt Được |
|---|---|---|
| **NFR-01** | **Hiệu Năng (Performance)** | Thời gian phản hồi API nhận diện ảnh < 2.5 giây; API thông thường < 300ms dưới tải 50 concurrent requests. |
| **NFR-02** | **Tính Sẵn Sàng (Availability)** | Hệ thống đạt uptime tối thiểu 99.5%, kiến trúc decoupled đảm bảo lỗi AI không làm sập Core Backend. |
| **NFR-03** | **Bảo Mật (Security)** | Mật khẩu hash BCrypt (cost factor 10); xác thực JWT có thời hạn hết hạn; chống SQL Injection, XSS, CSRF; phân quyền RBAC chặt chẽ. |
| **NFR-04** | **Tính Tương Thích (Compatibility)** | Giao diện chuẩn Responsive Web, hiển thị mượt mà trên Desktop (Chrome, Safari, Edge, Firefox), Tablet và Mobile. |
| **NFR-05** | **Khả Năng Mở Rộng (Scalability)** | Phân tách dịch vụ dạng Containerized (Docker), sẵn sàng scale độc lập AI Worker khi tải nhận diện tăng đột biến. |

---

## 5. TIÊU CHUẨN CHẤP THUẬN (ACCEPTANCE CRITERIA)
- 100% các Actor và Use Case được định nghĩa rõ ràng.
- Đầy đủ tiêu chuẩn API RESTful, định dạng mã lỗi JSON chuẩn RFC 7807.
- Được Tech Lead (Trần Minh Thuận) phê duyệt và chuyển tiếp làm đầu vào cho thiết kế kiến trúc hệ thống (`1.1.2`).
