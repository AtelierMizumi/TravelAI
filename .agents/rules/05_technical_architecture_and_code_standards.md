# 💻 QUY CHUẨN KIẾN TRÚC & TIÊU CHUẨN MÃ NGUỒN (ARCHITECTURE & CODE STANDARDS)
## RULESET 05: ENTERPRISE TECH STACK & QUALITY SPECIFICATIONS

> **ID**: `TAGF-RULE-005`  
> **Phạm vi**: Mọi file mã nguồn Java, Python, JavaScript/React, Dockerfile, SQL.

---

## 1. TIÊU CHUẨN FRONTEND (REACTJS 18 + VITE)

- **Ngôn ngữ & Framework**: React 18+, Vite, modern ES6+ / JSX.
- **Styling**: TailwindCSS với design tokens rõ ràng, kết hợp Lucide React Icons.
- **Cấu trúc thư mục `client/src/`**:
  ```text
  client/src/
  ├── components/       # UI Components tái sử dụng (Button, Modal, Card, Navbar)
  ├── pages/            # Màn hình định tuyến chính (Home, Recognize, Places, Booking)
  ├── services/         # Tầng giao tiếp HTTP API (Axios instance, interceptors, endpoints)
  ├── hooks/            # Custom React Hooks
  ├── context/          # State toàn cục (AuthContext, CartContext, ThemeContext)
  └── utils/            # Helper functions, formatters (tiền tệ, ngày tháng)
  ```
- **Quy tắc Code**:
  - Không hardcode API URL trực tiếp trong component; bắt buộc qua `import.meta.env.VITE_API_BASE_URL`.
  - Bắt buộc xử lý cả 3 trạng thái: `loading` (Skeleton loader), `error` (Toast / Alert thông báo thân thiện) và `success`.
  - Tuyệt đối không để sót `console.log` debug trong mã nguồn chuẩn bị commit.

---

## 2. TIÊU CHUẨN CORE BACKEND (JAVA SPRING BOOT 3)

- **Ngôn ngữ & Framework**: Java 17 (hoặc 21), Spring Boot 3.x, Spring Data JPA, Spring Security 6.
- **Kiến trúc phân tầng (Clean Layered Architecture)**:
  ```text
  Controller Layer  -->  Service Layer (Interface + Impl)  -->  Repository Layer (JPA)  -->  Entity Layer
          │                       │
          ▼                       ▼
     DTO (Request/Response)  Custom Business Exceptions
  ```
- **Bảo mật & Phiên làm việc**:
  - Stateless JWT Authentication thông qua `JwtAuthenticationFilter` kế thừa `OncePerRequestFilter`.
  - Phân quyền endpoint bằng `@PreAuthorize("hasRole('ADMIN')")` hoặc SecurityFilterChain matchers.
- **Quy chuẩn Xử lý Ngoại lệ Toàn cục (Global Exception Handler)**:
  - Mọi controller exception phải được bắt qua `@RestControllerAdvice`.
  - Định dạng JSON lỗi trả về theo chuẩn **RFC 7807 (Problem Details for HTTP APIs)**:
    ```json
    {
      "type": "https://travelai.vn/errors/bad-request",
      "title": "Invalid Input Data",
      "status": 400,
      "detail": "Email đã tồn tại trong hệ thống.",
      "timestamp": "2026-09-27T10:00:00Z"
    }
    ```
- **Tối ưu hóa Database Truy vấn**:
  - Sử dụng `@EntityGraph` hoặc `JOIN FETCH` để triệt tiêu lỗi N+1 Query.
  - Đánh Index trên các cột thường xuyên tìm kiếm / lọc (`name`, `province`, `category_id`, `user_id`).

---

## 3. TIÊU CHUẨN AI MICROSERVICE (PYTHON FASTAPI)

- **Ngôn ngữ & Framework**: Python 3.11+, FastAPI, Pydantic v2.
- **Xử lý Hình ảnh**:
  - Tiếp nhận file ảnh qua `UploadFile = File(...)`.
  - Kiểm tra MIME type (`image/jpeg`, `image/png`, `image/webp`) và kích thước tối đa 10MB bằng luồng byte trong bộ nhớ (không lưu file rác vào đĩa nếu không cần thiết).
  - Sử dụng `Pillow` / `OpenCV` để resize tối ưu (ví dụ: max width 1920px) trước khi gửi đến Google Cloud Vision API để tiết kiệm băng thông và giảm latency.
- **Tích hợp Google Cloud Vision API**:
  - Khởi tạo client singleton: `vision.ImageAnnotatorClient()`.
  - Thiết lập timeout tối đa 5.0 giây; nếu timeout, fallback sang cơ chế nhãn Web Detection hoặc trả về kết quả dự phòng an toàn, **tuyệt đối không để crash service**.

---

## 4. TIÊU CHUẨN CONTAINER HÓA (DOCKER & DOCKER COMPOSE)

- Mọi service (`client`, `services/core`, `services/ai`) đều phải có `Dockerfile` riêng sử dụng kỹ thuật **Multi-stage Build** để tối ưu hóa dung lượng image (dùng `alpine` hoặc `slim`).
- Tệp `docker-compose.yml` ở root phải sẵn sàng khởi chạy toàn bộ 4 container chỉ với một lệnh:
  ```bash
  docker compose up -d
  ```
- Kiểm tra tính sẵn sàng bằng `healthcheck` cho PostgreSQL trước khi khởi động Core Backend.
