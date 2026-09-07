# Quy Chuẩn Phân Công Nhóm 3 Kỹ Sư & Tuân Thủ WBS (Team Collaboration & WBS)

## 1. Cơ Cấu Phân Chia Công Việc 3 Thành Viên
Dự án được phân bổ công việc theo năng lực chuyên môn:

### Kỹ Sư 1: Tech Lead & AI / Fullstack Integration
- **Phụ trách WBS**:
  - `1.1.1`, `1.1.2`: Phân tích yêu cầu, thiết kế kiến trúc hệ thống
  - `1.3.1`, `1.3.2`, `1.3.3`: Pipeline xử lý ảnh, FastAPI AI Service, tích hợp Google Cloud Vision API
  - `1.7.3`: Triển khai hạ tầng Cloud & Docker containerization
- **Công nghệ chủ lực**: Python, FastAPI, Google Vision API, Docker, CI/CD.

### Kỹ Sư 2: Core Backend & Database Engineer
- **Phụ trách WBS**:
  - `1.1.3`: Thiết kế và tối ưu lược đồ PostgreSQL
  - `1.2.1`, `1.2.2`: Module xác thực tài khoản & bảo mật JWT
  - `1.5.4`: Xử lý luồng đặt chỗ (Booking engine) & thanh toán
  - `1.6.1`, `1.6.2`, `1.6.3`, `1.6.4`: API bảng điều khiển & quản trị hệ thống (Admin)
  - `1.4.4`: Tích hợp WebSocket STOMP Server cho tin nhắn thời gian thực
- **Công nghệ chủ lực**: Java, Spring Boot 3, Spring Security, JPA/Hibernate, PostgreSQL, WebSocket.

### Kỹ Sư 3: Frontend & UI/UX Engineer
- **Phụ trách WBS**:
  - `1.3.4`: Giao diện hiển thị kết quả phân tích AI
  - `1.5.1`, `1.5.2`, `1.5.3`: Giao diện Khám phá điểm đến, danh sách Tour và Khách sạn
  - `1.4.1`, `1.4.2`: Mạng xã hội, chia sẻ bài viết, tương tác Like/Comment/Follow
  - `1.4.3`: Form đánh giá & hiển thị Review
  - `1.4.4`, `1.6.5`: Giao diện Chat trực tuyến & màn hình kiểm duyệt Admin
- **Công nghệ chủ lực**: ReactJS 18, Vite, TailwindCSS, Axios, State Management.

## 2. Quy Trình Phối Hợp & Nhánh Tính Năng (Branching & PR Strategy)
- Mỗi gói công việc (Work Package) trong WBS tương ứng 1 GitHub Issue (#1 đến #25) và được thực hiện trên nhánh tính năng riêng biệt:
  - Cú pháp nhánh: `feat/wbs-<id>-<keyword>` (ví dụ: `feat/wbs-1.3.3-google-vision`)
- Merge vào nhánh `main` thông qua Pull Request có review chéo giữa các thành viên, mô phỏng văn hóa kỹ thuật cao.
