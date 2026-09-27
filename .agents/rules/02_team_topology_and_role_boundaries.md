# 👥 PHÂN BỔ ĐỘI NGŨ & RANH GIỚI TRÁCH NHIỆM (TEAM TOPOLOGY & ROLE BOUNDARIES)
## RULESET 02: 3-ENGINEER RACI MATRIX & PERSONAL SCOPE ISOLATION

> **ID**: `TAGF-RULE-002`  
> **Phạm vi**: Phân chia quyền hạn, quản lý gói công việc WBS, gán tác giả commit, phân quyền Review.

---

## 1. THÀNH VIÊN ĐỘI NGŨ KỸ SƯ (TEAM TOPOLOGY)

| Kỹ Sư | Chức Danh & Vai Trò | Git Identity | Thẩm Quyền Kiến Trúc |
|---|---|---|---|
| **Trần Minh Thuận** *(User)* | **Tech Lead, AI & Integration Architect, PM** | `Minh Thuận Trần <thuanc177@gmail.com>` | Toàn quyền quyết định kiến trúc, điều phối Sprint, phân hệ AI Microservice & hạ tầng DevOps Cloud. |
| **Hoàng Văn Đức** | **Core Backend & Database Engineer** | `Hoàng Văn Đức <duc.hoangvan.dev@gmail.com>` | Chịu trách nhiệm Core Backend Spring Boot 3, lược đồ CSDL PostgreSQL, Security JWT/RBAC & Booking API. |
| **Lê Văn Ngọc** | **Frontend & UI/UX Specialist** *(Tác giả nền tảng)* | `Lê Văn Ngọc <ngoc.levan.dev@gmail.com>` | Chịu trách nhiệm thiết kế giao diện ReactJS 18 + Vite, tối ưu UX, giao diện AI, Khám phá & Mạng xã hội. |

---

## 2. MA TRẬN PHÂN QUYỀN RACI CHI TIẾT (25 WORK PACKAGES)

> **Ký hiệu RACI**:  
> - **R (Responsible)**: Người trực tiếp lập trình và commit mã nguồn.  
> - **A (Accountable)**: Người duyệt PR và chịu trách nhiệm nghiệm thu cuối cùng (Tech Lead).  
> - **C (Consulted)**: Người được tham vấn chuyên môn trong quá trình làm.  
> - **I (Informed)**: Người được thông báo khi tính năng hoàn thành.

| WBS ID | Gói Công Việc | Phân Hệ | R (Người Làm) | A (Nghiệm Thu) | C (Tham Vấn) | I (Thông Báo) |
|---|---|---|---|---|---|---|
| `1.1.1` | Khởi động & xác định yêu cầu | Khởi động | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Cả nhóm |
| `1.1.2` | Thiết kế kiến trúc hệ thống | Khởi động | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.1.3` | Thiết kế CSDL & mô hình dữ liệu | Khởi động | **Hoàng Văn Đức** | Thuận | Thuận | Ngọc |
| `1.2.1` | Đăng ký / đăng nhập (API & UI) | Tài khoản | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.2.2` | Profile & bảo mật JWT | Tài khoản | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.3.1` | Upload & tiền xử lý ảnh | AI Vision | **Trần Minh Thuận** | Thuận | Ngọc | Đức |
| `1.3.2` | AI Service bằng FastAPI | AI Vision | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.3.3` | Tích hợp Google Vision API | AI Vision | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.3.4` | Hiển thị kết quả nhận diện | AI Vision | **Lê Văn Ngọc** | Thuận | Thuận | Đức |
| `1.4.1` | Đăng bài & chia sẻ trải nghiệm | Mạng xã hội | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.4.2` | Like / Comment / Follow | Mạng xã hội | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.4.3` | Viết & hiển thị Review | Mạng xã hội | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.4.4` | Chat thời gian thực (WebSocket) | Mạng xã hội | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.5.1` | Khám phá & tìm kiếm địa điểm | Lữ hành | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.5.2` | Danh sách & chi tiết Tour | Lữ hành | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.5.3` | Danh sách & chi tiết Khách sạn | Lữ hành | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Cả nhóm |
| `1.5.4` | Đặt Tour / Khách sạn & thanh toán | Lữ hành | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.6.1` | Dashboard quản trị | Quản trị | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.6.2` | Quản lý người dùng | Quản trị | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.6.3` | Quản lý địa danh | Quản trị | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.6.4` | Quản lý đặt chỗ | Quản trị | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.6.5` | Kiểm duyệt bài viết & cài đặt | Quản trị | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Cả nhóm |
| `1.7.1` | Kiểm thử tích hợp & chức năng | QA/DevOps | **Cả nhóm phối hợp** | Thuận | Thuận | Cả nhóm |
| `1.7.2` | Kiểm thử hiệu năng, bảo mật | QA/DevOps | **Cả nhóm phối hợp** | Thuận | Thuận | Cả nhóm |
| `1.7.3` | Triển khai Cloud & bàn giao | QA/DevOps | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Cả nhóm |

---

## 3. NGUYÊN TẮC CÁCH LY PHẠM VI CÔNG VIỆC CỦA TRẦN MINH THUẬN

1. **Giới Hạn Tác Vụ**:
   - Khi người dùng yêu cầu thực hiện phần việc của cá nhân Trần Minh Thuận, Agent **CHỈ ĐƯỢC PHÉP** can thiệp và viết code cho các gói:
     - `1.1.1`, `1.1.2`: Kiến trúc & Đặc tả
     - `1.3.1`, `1.3.2`, `1.3.3`: AI Service (FastAPI, Preprocessing, Google Vision API)
     - `1.7.3`: Docker, Docker Compose, CI/CD Cloud
2. **Quy Tắc Độc Lập**:
   - Không được tự ý hoàn thành thay hoặc ghi đè mã nguồn thuộc phần việc Backend CSDL của Hoàng Văn Đức (`1.1.3`, `1.2.1-BE`, `1.5.4-BE`...) hay Frontend của Lê Văn Ngọc (`1.3.4`, `1.4.1-1.4.3`...).
   - Chỉ khi người dùng đưa ra chỉ thị rõ ràng (ví dụ: *"hãy giả lập commit cho Hoàng Văn Đức hoàn thành 1.1.3"*), Agent mới thực hiện với đúng danh tính của kỹ sư đó.
