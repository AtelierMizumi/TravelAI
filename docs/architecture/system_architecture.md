# 🏛️ TÀI LIỆU THIẾT KẾ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

> **Mã công việc WBS**: `1.1.2 - Thiết kế kiến trúc hệ thống`  
> **Người thực hiện**: Trần Minh Thuận (Tech Lead / System Architect)  
> **Phiên bản**: `1.0.0` | **Sprint**: `Sprint 1 (Tuần 1 - 2)`  
> **Liên kết Issue**: [Issue #2](https://github.com/AtelierMizumi/TravelAI/issues/2)

---

## 1. MÔ HÌNH KIẾN TRÚC TỔNG THỂ (HIGH-LEVEL ARCHITECTURE)

TravelAI được xây dựng theo kiến trúc **Microservices-oriented Monolith**, kết hợp ưu điểm của tính toàn vẹn dữ liệu trong Core Backend và tính linh hoạt, mở rộng cao của AI Microservice:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER (CLIENT)                         │
│                    ReactJS 18 + Vite + TailwindCSS SPA                      │
│                [Traveler Web Portal]  &  [Admin Management]                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / JSON REST & WebSocket STOMP
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORE BACKEND (JAVA SPRING BOOT 3)                        │
│   ┌───────────────────────────┐      ┌──────────────────────────────────┐   │
│   │   Spring Security + JWT   │      │       WebSocket STOMP Broker     │   │
│   ├───────────────────────────┤      ├──────────────────────────────────┤   │
│   │   Booking & Payment Engine│      │       Review & Rating Service    │   │
│   ├───────────────────────────┤      ├──────────────────────────────────┤   │
│   │   Place & Discovery Svc   │      │       User & Admin Control       │   │
│   └─────────────┬─────────────┘      └──────────────────────────────────┘   │
│                 │ Spring Data JPA                                           │
└─────────────────┼────────────────────────────────────┬──────────────────────┘
                  │                                    │ Internal REST Call
                  ▼                                    ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│     POSTGRESQL 16 DATABASE    │     │      AI RECOGNITION SERVICE (FASTAPI) │
│  - Users, Roles, Permissions  │     │   - Image Preprocessing Pipeline      │
│  - Places, Categories, Photos │     │   - Google Cloud Vision SDK Client    │
│  - Tours, Hotels, Bookings    │     │   - Landmark Mapping Engine           │
│  - Reviews, Posts, Comments   │     └───────────────────┬───────────────────┘
└───────────────────────────────┘                         │ gRPC / HTTPS
                                                          ▼
                                      ┌───────────────────────────────────────┐
                                      │     GOOGLE CLOUD VISION API (CLOUD)   │
                                      │  - Landmark Detection                 │
                                      │  - Web Detection (Fallback)           │
                                      └───────────────────────────────────────┘
```

---

## 2. LUỒNG TƯƠNG TÁC CHI TIẾT (SEQUENCE DIAGRAMS)

### 2.1. Luồng Nhận Diện Địa Danh Bằng AI (AI Landmark Recognition Flow)
Luồng xử lý từ khi người dùng tải ảnh lên cho đến khi nhận được kết quả và gợi ý dịch vụ liên quan:

```mermaid
sequenceDiagram
    autonumber
    actor User as Du Khách (Client UI)
    participant Core as Spring Boot Backend
    participant AI as FastAPI AI Service
    participant Vision as Google Cloud Vision API
    participant DB as PostgreSQL Database

    User->>Core: POST /api/places/recognize (Multipart Image)
    Note over Core: Xác thực JWT & Kiểm tra header
    Core->>AI: POST /api/v1/vision/recognize (Image Stream)
    
    activate AI
    AI->>AI: Validate Image (Format, Dimensions, Size)
    AI->>AI: Preprocessing (Resize, Contrast normalization)
    AI->>Vision: AnnotateImageRequest (Landmark & Web Detection)
    activate Vision
    Vision-->>AI: AnnotateImageResponse (Landmark Description, Lat/Long, Confidence)
    deactivate Vision
    
    AI->>AI: Mapping kết quả & trích xuất Confidence Score
    AI-->>Core: 200 OK JSON {landmark_name, confidence, lat, lng}
    deactivate AI

    activate Core
    Core->>DB: Query thông tin địa danh theo landmark_name
    DB-->>Core: Place Entity (Thông tin, mô tả, ảnh, tỉnh thành)
    Core->>DB: Query các Tour & Khách sạn lân cận Place ID
    DB-->>Core: Danh sách Tours & Hotels liên quan
    Core-->>User: 200 OK JSON {place, tours, hotels, confidence}
    deactivate Core

    User->>User: Hiển thị kết quả AI & Tour/Khách sạn gợi ý
```

### 2.2. Luồng Đặt Chỗ Dịch Vụ (Booking & Payment Flow)
```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng (React Client)
    participant Core as Spring Boot Backend
    participant DB as PostgreSQL Database

    User->>Core: POST /api/bookings (tourId/hotelId, date, guests)
    Note over Core: Kiểm tra JWT, số lượng khách, tính tổng tiền
    Core->>DB: INSERT INTO bookings (status: PENDING)
    DB-->>Core: Booking created (ID)
    Core-->>User: 201 Created (Booking details & payment redirect)
    
    User->>Core: POST /api/bookings/{id}/pay (Simulated/Gateway)
    Core->>DB: UPDATE bookings SET status='CONFIRMED', paid_at=NOW()
    Core-->>User: 200 OK (Booking Confirmed)
```

---

## 3. BẢO MẬT & PHÂN QUYỀN HỆ THỐNG (SECURITY ARCHITECTURE)

1. **Xác thực phiên làm việc (Authentication)**:
   - Sử dụng kiến trúc Stateless Session dựa trên **JSON Web Token (JWT)**.
   - Access Token: Thời hạn 2 giờ, đính kèm trong header `Authorization: Bearer <token>`.
   - Refresh Token: Thời hạn 7 ngày, lưu trữ bảo mật để cấp lại access token.
2. **Phân quyền truy cập (Authorization & RBAC)**:
   - `ROLE_USER`: Khám phá địa điểm, upload ảnh AI, đặt tour/khách sạn, viết bài, review, chat.
   - `ROLE_ADMIN`: Toàn quyền truy cập bảng điều khiển Admin, quản trị người dùng, địa danh và duyệt đơn đặt chỗ.
3. **Phòng thủ đa tầng (Defense in Depth)**:
   - Password Hashing: Thuật toán BCrypt với Cost Factor = 10.
   - CORS Configuration: Chỉ cho phép nguồn từ các domain tin cậy được chỉ định.
   - Rate Limiting: Hạn chế tần suất gọi API nhận diện AI để bảo vệ quota Google Vision API.
