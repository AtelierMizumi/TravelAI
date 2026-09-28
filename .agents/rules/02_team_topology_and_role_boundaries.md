# 👥 TEAM TOPOLOGY & ROLE BOUNDARY ENFORCEMENT
## RULESET 02: 3-ENGINEER RACI MATRIX & PERSONAL SCOPE ISOLATION

> **ID**: `TAGF-RULE-002`  
> **Scope**: Work package allocation, WBS ownership, commit authorship attribution, review routing.

---

## 1. ENGINEERING TEAM TOPOLOGY

The TravelAI engineering team consists of three specialized software engineers:

| Engineer | Title & Specialization | GitHub Handle | Git Identity | Architectural Ownership |
|---|---|---|---|---|
| **Trần Minh Thuận** *(User)* | **Lead Architect & AI/Data Engineer, PM** | `@AtelierMizumi` | `Minh Thuận Trần <thuanc177@gmail.com>` | System Architecture, Sprint Orchestration, PostgreSQL Schema & DDL, FastAPI AI Microservice, Google Cloud Vision SDK, Docker CI/CD Cloud DevOps. |
| **Hoàng Văn Đức** | **Senior Backend & Security Engineer** | `@duchayslay` | `Hoàng Văn Đức <hoangvanduc290805@gmail.com>` | Java Spring Boot 3 Core, JWT/OAuth2 Auth Service, Tour & Hotel Catalog Service, Booking & Payment Gateway, Review Service, WebSocket Chat Backend, Admin APIs (Location, Partners, RBAC, Audit). |
| **Lê Văn Ngọc** | **Senior Frontend & QA Engineer** | `@ngoctapcodee` | `Lê Văn Ngọc <ngoc492005@gmail.com>` | React 18 SPA + Vite, TailwindCSS Design System, User Profile UI, AI Results UI, Location Discovery UI, My Bookings Portal, Social Travel Feed, Admin Analytics & System Config UI, Integration & E2E Testing. |

---

## 2. COMPREHENSIVE RACI MATRIX (24 WORK PACKAGES - TAGF-v2.0)

> **RACI Definitions**:  
> - **R (Responsible)**: The engineer who authors, tests, and commits the implementation.  
> - **A (Accountable)**: The Tech Lead (Trần Minh Thuận) who conducts code review and approves merge.  
> - **C (Consulted)**: Domain specialist consulted for interface contract alignment.  
> - **I (Informed)**: Team members notified upon feature completion.

| WBS ID | Work Package Name | Module | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) | MoSCoW |
|---|---|---|---|---|---|---|---|
| `1.1.1` | Đặc tả yêu cầu & phạm vi doanh nghiệp (SRS) | Initiation | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Whole Team | MVP |
| `1.1.2` | Thiết kế kiến trúc Microservices & AI Gateway | Architecture | **Trần Minh Thuận** | Thuận | Đức | Ngọc | MVP |
| `1.1.3` | Mô hình dữ liệu & Kịch bản CSDL PostgreSQL | Database | **Trần Minh Thuận** | Thuận | Đức | Ngọc | MVP |
| `1.2.1` | Module xác thực bảo mật doanh nghiệp (JWT/OAuth2) | Security/BE | **Hoàng Văn Đức** | Thuận | Thuận, Ngọc | Whole Team | MVP |
| `1.2.2` | Giao diện & API Hồ sơ cá nhân (User Profile) | Profile/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | MVP |
| `1.3.1` | Giao diện tiếp nhận & Bộ tiền xử lý ảnh | AI Vision | **Trần Minh Thuận** | Thuận | Ngọc | Đức | MVP |
| `1.3.2` | Dịch vụ AI nhận diện địa danh (FastAPI & Vision) | AI Vision | **Trần Minh Thuận** | Thuận | Đức | Ngọc | MVP |
| `1.3.3` | Giao diện hiển thị kết quả & Gợi ý thông minh | AI Vision/FE | **Lê Văn Ngọc** | Thuận | Thuận | Đức | MVP |
| `1.4.1` | Giao diện & API Khám phá địa điểm du lịch | Discovery/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | MVP |
| `1.4.2` | Module thông tin Tour du lịch (Tour Catalog) | Catalog/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.4.3` | Module thông tin Khách sạn (Hotel Catalog) | Catalog/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.5.1` | Quy trình đặt dịch vụ & Cổng thanh toán | Booking/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.5.2` | Quản lý lịch sử đặt chỗ (My Bookings Portal) | Booking/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | Should |
| `1.6.1` | Module đánh giá địa danh & dịch vụ (Review) | Social/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.6.2` | Bảng tin chia sẻ trải nghiệm (Social Feed) | Social/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | Could |
| `1.6.3` | Tin nhắn trực tuyến WebSocket (Messaging) | Social/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Could |
| `1.7.1` | Bảng điều khiển quản trị (Analytics Dashboard) | Admin/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | MVP |
| `1.7.2` | Quản lý danh mục địa danh (Location Admin) | Admin/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | MVP |
| `1.7.3` | Quản lý dịch vụ Khách sạn & Tour (Partners) | Admin/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.7.4` | Quản trị tài khoản người dùng & Phân quyền RBAC | Admin/BE | **Hoàng Văn Đức** | Thuận | Thuận | Whole Team | MVP |
| `1.7.5` | Quản lý đơn đặt chỗ & Đối soát (Booking Audit) | Admin/BE | **Hoàng Văn Đức** | Thuận | Ngọc | Whole Team | Should |
| `1.7.6` | Kiểm duyệt nội dung & Cấu hình hệ thống | Admin/FE | **Lê Văn Ngọc** | Thuận | Đức | Whole Team | Could |
| `1.8.1` | Kịch bản & Kiểm thử tích hợp tự động (E2E) | QA/Testing | **Lê Văn Ngọc** | Thuận | Đức, Thuận | Whole Team | MVP |
| `1.8.2` | Đóng gói Docker & Triển khai Cloud (AWS/CI-CD) | Cloud/DevOps | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Whole Team | MVP |

---

## 3. STRICT ISOLATION OF TRẦN MINH THUẬN'S WORK SCOPE

1. **Authorized Work Scope for User**:
   - When executing coding tasks for Trần Minh Thuận, the agent is **STRICTLY RESTRICTED** to packages assigned to Thuận:
     - `1.1.1`: Tài liệu đặc tả yêu cầu & phạm vi doanh nghiệp (SRS).
     - `1.1.2`: Tài liệu thiết kế kiến trúc Microservices & AI Gateway.
     - `1.1.3`: Mô hình dữ liệu & Kịch bản khởi tạo CSDL (PostgreSQL Enterprise).
     - `1.3.1`: Giao diện tiếp nhận & Bộ tiền xử lý ảnh (Image Preprocessor).
     - `1.3.2`: Dịch vụ AI nhận diện địa danh (FastAPI & Google Vision Cloud).
     - `1.8.2`: Đóng gói ứng dụng & Triển khai hạ tầng Cloud (AWS/Docker/CI-CD).
2. **Non-Interference Invariant**:
   - The agent MUST NOT autonomously generate, modify, or commit code for Hoàng Văn Đức's Core Backend tasks or Lê Văn Ngọc's Frontend / QA tasks unless explicitly commanded by the user with peer simulation instructions.
