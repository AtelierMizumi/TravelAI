# Quy Chuẩn Phân Công Nhóm 3 Kỹ Sư & Tuân Thủ WBS (Team Collaboration & WBS)

## 1. Thành Viên Đội Ngũ & Phân Vai Chuyên Môn

Dự án được phát triển bởi đội ngũ 3 kỹ sư phần mềm với phân định vai trò rõ ràng:

### 1. Trần Minh Thuận (Tech Lead, AI & Integration Engineer, PM)
- **Email / Git Identity**: `Minh Thuận Trần <thuanc177@gmail.com>`
- **Trách nhiệm chính**:
  - Quản trị dự án (PM/BA), đặc tả yêu cầu nghiệp vụ và điều phối Sprint.
  - Thiết kế kiến trúc hệ thống tổng thể, giao thức liên lạc đa dịch vụ (Spring Boot <-> FastAPI).
  - Phân hệ AI: Xây dựng FastAPI Microservice, tiền xử lý hình ảnh và tích hợp Google Cloud Vision API.
  - Hạ tầng Docker, Docker Compose, CI/CD pipeline và triển khai Cloud.
- **Phụ trách các gói WBS**:
  - **Sprint 1**: `[WBS 1.1.1]` Khởi động & xác định yêu cầu, `[WBS 1.1.2]` Thiết kế kiến trúc hệ thống.
  - **Sprint 2**: `[WBS 1.3.1]` Upload & tiền xử lý ảnh, `[WBS 1.3.2]` AI Service bằng FastAPI.
  - **Sprint 3**: `[WBS 1.3.3]` Tích hợp Google Cloud Vision API.
  - **Sprint 6**: `[WBS 1.7.3]` Triển khai Cloud & Docker hạ tầng.

### 2. Hoàng Văn Đức (Core Backend & Database Engineer)
- **Email / Git Identity**: `Hoàng Văn Đức <duc.hoangvan.dev@gmail.com>` (hoặc tương đương)
- **Trách nhiệm chính**:
  - Xây dựng Core Backend với Java Spring Boot 3 và Spring Security.
  - Thiết kế CSDL PostgreSQL, viết DDL, indexing, tối ưu hóa truy vấn và bảo toàn dữ liệu.
  - Xác thực tài khoản, phân quyền Role-based Access Control (RBAC), bảo mật JWT.
  - Xây dựng Booking Engine (đặt tour, khách sạn), tính toán chi phí và API Quản trị (Admin).
  - Tích hợp WebSocket STOMP Server cho tính năng tin nhắn thời gian thực.
- **Phụ trách các gói WBS**:
  - **Sprint 1**: `[WBS 1.1.3]` Thiết kế CSDL & mô hình dữ liệu.
  - **Sprint 2**: `[WBS 1.2.1]` Đăng ký/đăng nhập (Backend API), `[WBS 1.2.2]` Profile & bảo mật JWT (Backend).
  - **Sprint 3**: `[WBS 1.5.1]` API Tìm kiếm & khám phá địa điểm (Backend).
  - **Sprint 4**: `[WBS 1.5.4]` Đặt Tour/Khách sạn & thanh toán (Backend API), `[WBS 1.6.1]` Dashboard admin API, `[WBS 1.6.2]` Quản lý người dùng API, `[WBS 1.6.3]` Quản lý địa danh API.
  - **Sprint 5**: `[WBS 1.4.4]` WebSocket Chat backend, `[WBS 1.6.4]` Quản lý đặt chỗ backend.

### 3. Lê Văn Ngọc (Frontend & UI/UX Engineer - Tác Giả Nền Tảng)
- **Email / Git Identity**: `Lê Văn Ngọc <ngoc.levan.dev@gmail.com>` (hoặc tương đương)
- **Trách nhiệm chính**:
  - Xây dựng toàn bộ giao diện người dùng (Client SPA & Admin Portal) với ReactJS 18, Vite, TailwindCSS.
  - Tối ưu hóa trải nghiệm người dùng (UX/UI), responsive trên mọi kích thước màn hình.
  - Phát triển các trang: Khám phá điểm đến, hiển thị kết quả AI nhận diện, đặt tour/khách sạn, viết review.
  - Xây dựng giao diện Mạng xã hội du lịch (Travel Feed), thả tim, bình luận và hộp thoại Chat WebSocket.
- **Phụ trách các gói WBS**:
  - **Sprint 2**: `[WBS 1.2.1]` Form Đăng ký/đăng nhập, `[WBS 1.2.2]` Trang Profile người dùng.
  - **Sprint 3**: `[WBS 1.3.4]` Giao diện hiển thị kết quả nhận diện AI, `[WBS 1.5.1]` Giao diện Khám phá & bộ lọc địa danh.
  - **Sprint 4**: `[WBS 1.4.3]` Form viết & hiển thị Review, `[WBS 1.5.4]` Giao diện đặt tour/khách sạn, `[WBS 1.6.1]` Dashboard UI, `[WBS 1.6.2]` Quản lý người dùng UI, `[WBS 1.6.3]` Quản lý địa danh UI.
  - **Sprint 5**: `[WBS 1.4.1]` Trang đăng bài du lịch, `[WBS 1.4.2]` Tương tác Like/Comment/Follow, `[WBS 1.4.4]` Giao diện Chat realtime, `[WBS 1.5.2]` Chi tiết Tour, `[WBS 1.5.3]` Chi tiết Khách sạn, `[WBS 1.6.4]` UI quản lý đặt chỗ, `[WBS 1.6.5]` UI kiểm duyệt bài viết.
  - **Sprint 6**: `[WBS 1.7.1]`, `[WBS 1.7.2]` Phối hợp kiểm thử E2E, responsive & UI performance.

---

## 2. Mô Thức Làm Việc Tối Ưu (1 Buổi / Tuần - 4 Đến 6 Tiếng)

Để phù hợp với lịch làm việc thực tế, nhóm áp dụng **Mô thức Sprint Session 1 buổi/tuần (4-6 tiếng)**:
- Mỗi tuần nhóm chỉ cần dành **1 buổi tập trung cao độ (ví dụ: Thứ 7 hoặc Chủ Nhật)** để hoàn thành toàn bộ công việc của tuần đó:
  1. **15 phút đầu**: Khởi động buổi làm việc, review GitHub Projects, xác nhận task cần làm trong tuần.
  2. **3.5 - 4 tiếng**: Tập trung code độc lập theo đúng gói WBS phân công (hoặc pair programming).
  3. **30 phút**: Tạo Pull Request, review chéo code và merge vào nhánh chính.
  4. **15 phút cuối**: Chuyển trạng thái task trên GitHub Project Board sang `Done`, ghi nhận kết quả tuần.

---

## 3. Nguyên Tắc Coding & Gán Việc Khi Làm Việc Cùng Agent

- Khi người dùng (Trần Minh Thuận) yêu cầu thực hiện phần việc của mình, Agent **CHỈ ĐƯỢC** tập trung xử lý các gói WBS thuộc trách nhiệm của Trần Minh Thuận (AI, Kiến trúc, Tích hợp, DevOps).
- Không tự tiện làm lẫn lộn phần việc của Hoàng Văn Đức (Backend CSDL) hoặc Lê Văn Ngọc (Frontend) trừ khi người dùng yêu cầu giả lập đóng góp của họ.
- Mọi commit phải phản ánh đúng tác giả, thời gian thực tế theo Sprint và gắn mã Issue tương ứng.
