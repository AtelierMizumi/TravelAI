# 🤝 CẨM NANG HỢP TÁC & VẬN HÀNH DỰ ÁN (COLABORATION GUIDE)

> **Dự án**: TravelAI - Intelligent Landmark Recognition & Travel Platform  
> **Mục tiêu**: Hướng dẫn quy chuẩn làm việc cho đội ngũ 3 kỹ sư phần mềm, tối ưu hóa năng suất với thời lượng làm việc tập trung **1 buổi / tuần (4 - 6 tiếng)** nhưng vẫn đảm bảo tiến độ và chất lượng doanh nghiệp.

---

## 👥 1. Cơ Cấu Đội Ngũ & Phân Vai Trách Nhiệm

| Thành Viên | Vai Trò Chính | GitHub & Email | Trách Nhiệm Kỹ Thuật | Phân Hệ Phụ Trách Trong WBS |
|---|---|---|---|---|
| **Trần Minh Thuận** | **Tech Lead, AI & Integration, PM** | `@AtelierMizumi`<br>`thuanc177@gmail.com` | Kiến trúc tổng thể, đặc tả yêu cầu, FastAPI AI Microservice, Google Cloud Vision API, Docker & CI/CD Cloud. | `1.1.1`, `1.1.2`, `1.3.1`, `1.3.2`, `1.3.3`, `1.7.3` |
| **Hoàng Văn Đức** | **Core Backend & Database Engineer** | `@duchayslay`<br>`hoangvanduc290805@gmail.com` | Spring Boot 3, thiết kế lược đồ CSDL PostgreSQL, bảo mật JWT/RBAC, Booking Engine, WebSocket Chat backend, Admin API. | `1.1.3`, `1.2.1` (BE), `1.2.2` (BE), `1.4.4` (BE), `1.5.1` (BE), `1.5.4` (BE), `1.6.1-1.6.4` (BE) |
| **Lê Văn Ngọc** | **Frontend & UI/UX Specialist** | `@ngoctapcodee`<br>`ngoc492005@gmail.com` | ReactJS 18, Vite, TailwindCSS, giao diện AI nhận diện, trang khám phá địa điểm, đánh giá review, mạng xã hội và chat. | `1.2.1` (FE), `1.2.2` (FE), `1.3.4`, `1.4.1`, `1.4.2`, `1.4.3`, `1.4.4` (FE), `1.5.1-1.5.4` (FE), `1.6.1-1.6.5` (FE) |

---

## ⏰ 2. Mô Thức Làm Việc Tối Ưu: 1 Buổi / Tuần (Sprint Focus Session)

Để không mất thời gian họp hành dàn trải, nhóm tổ chức **1 buổi làm việc tập trung cao độ mỗi tuần (4 - 6 tiếng)** vào ngày cuối tuần (Thứ Bảy hoặc Chủ Nhật). Quy trình gồm 4 khối thời gian tiêu chuẩn:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               LỊCH TRÌNH 1 BUỔI LÀM VIỆC TUẦN (WEEKLY SPRINT)               │
├───────────────┬───────────────────────────────┬──────────────┬──────────────┤
│ 08:30 - 08:45 │ 08:45 - 12:00                 │ 12:00 - 12:30│ 12:30 - 12:45│
│ (15 phút)     │ (3 tiếng 15 phút)             │ (30 phút)    │ (15 phút)    │
│ Sync & Standup│ Deep Work & Coding            │ Code Review  │ Wrap-up      │
│ Mở Project #2 │ Code trên nhánh feat/wbs-...  │ Tạo PR, test │ Đổi Done     │
│ Kéo task Todo │ Tự kiểm thử Unit / Local API  │ Merge main   │ Đóng Sprint  │
└───────────────┴───────────────────────────────┴──────────────┴──────────────┘
```

### Chi tiết 4 bước:
1. **Khối 1: Khởi Động & Kéo Việc (15 phút)**:
   - Cả 3 thành viên mở [GitHub Project Board #2](https://github.com/users/AtelierMizumi/projects/2).
   - Kiểm tra các Issue thuộc Sprint hiện tại đang ở cột `Todo`, kéo các Issue được phân công sang cột `In Progress`.
   - Thống nhất nhanh API contract giữa Frontend - Backend - AI Service trước khi gõ code.

2. **Khối 2: Tập Trung Hiện Thực Hóa (3 tiếng 15 phút)**:
   - Mỗi thành viên checkout nhánh tính năng từ `main`:
     ```bash
     git checkout main && git pull origin main
     git checkout -b feat/wbs-<id>-<ten-tinh-nang>
     ```
   - Lập trình tính năng, viết unit test hoặc kiểm tra API trên Postman / Swagger / Vite Localhost.

3. **Khối 3: Review Chéo & Hợp Nhất Mã Nguồn (30 phút)**:
   - Đẩy nhánh lên GitHub và tạo Pull Request (PR):
     ```bash
     git push origin feat/wbs-<id>-<ten-tinh-nang>
     ```
   - Gắn ít nhất 1 thành viên khác vào Review. Kiểm tra tính sạch sẽ của code, không có file thừa hoặc console log rác.
   - Khi đã Approve, merge PR vào nhánh `main`.

4. **Khối 4: Tổng Kết & Ghi Nhận Tiến Độ (15 phút)**:
   - Kéo thẻ công việc trên [GitHub Project #2](https://github.com/users/AtelierMizumi/projects/2) sang cột `Done`.
   - Đóng Issue liên kết nếu PR đã hoàn thành 100% tiêu chí nghiệm thu (Acceptance Criteria).

---

## 🌿 3. Quy Chuẩn Git & Quy Tắc Vàng

### 1. Quy tắc nhánh (Branching Rule):
- Nhánh chính: `main` (luôn luôn chạy được, ổn định).
- Nhánh tính năng: `feat/wbs-<id>-<mo-ta-ngan>` (ví dụ: `feat/wbs-1.1.2-architecture`, `feat/wbs-1.3.1-ai-upload`).
- Nhánh sửa lỗi: `fix/wbs-<id>-<mo-ta-loi>`.

### 2. Quy tắc Commit (Conventional Commits):
Bắt buộc có tiền tố và mã Issue để GitHub tự động liên kết thẻ trên Project:
```bash
git commit -m "feat(ai): setup fastapi image preprocessing pipeline (#6)"
git commit -m "feat(backend): implement user registration api with bcrypt (#4)"
git commit -m "docs(arch): update microservices sequence diagram (#2)"
```

### 3. Vệ sinh kho mã nguồn (BẮT BUỘC):
- **TUYỆT ĐỐI KHÔNG** commit các file văn phòng (`.docx`, `.xlsx`, `.ods`, `.pdf`) vào repo.
- Thư mục tài liệu ngoài lề (`local_references/`, `travelai_original/`) đã được cấu hình vĩnh viễn trong `.gitignore`.
- Mọi code đều phải được viết mới, tái cấu trúc hoặc tối ưu hóa sạch sẽ theo kiến trúc chuẩn.

### 4. Quản lý tài liệu tham khảo cá nhân (`local_references/`):
Để thuận tiện cho việc học tập, nghiên cứu các bài giảng lý thuyết và đối chiếu mã nguồn cũ mà không làm ảnh hưởng đến tính trong sạch của Git repository, dự án quy chuẩn thư mục **`local_references/`**:
```
local_references/
├── learning_materials/   # Slide bài giảng môn học, sách PDF, tài liệu quản trị dự án (Week-01 -> Week-07)
├── legacy_source/        # Mã nguồn tham khảo cũ (baseline) để đối chiếu giải thuật / logic nghiệp vụ
└── legacy_specs/         # Bản nháp yêu cầu, tài liệu thô, file WBS (.xlsx, .ods)
```
- **Nguyên tắc vận hành**:
  - Thư mục `local_references/` nằm trong `.gitignore` vĩnh viễn. Mọi thành viên tự do thêm/bớt slide, giáo trình, note cá nhân mà không sợ tạo rác Git hay gây merge conflict.
  - **Không bao giờ dùng `git add -f`** để ép Git theo dõi thư mục này.
  - Các tài liệu đặc tả chính thức của hệ thống (SRS, Architecture, API Contract) bắt buộc phải được biên soạn bằng Markdown và lưu trữ chuẩn mực trong thư mục `docs/`.

---

## 🚀 4. Lộ Trình 6 Sprints & Bảng Phân Công Nhiệm Vụ

| Sprint | Thời Gian | Mục Tiêu Cốt Lõi | Trần Minh Thuận (Lead/AI) | Hoàng Văn Đức (Core Backend) | Lê Văn Ngọc (Frontend) |
|---|---|---|---|---|---|
| **Sprint 1** | 07/09 - 20/09 | Khởi động & Kiến trúc | `1.1.1` Yêu cầu, `1.1.2` Kiến trúc | `1.1.3` Thiết kế CSDL PostgreSQL | Phối hợp UX & Flow |
| **Sprint 2** | 21/09 - 04/10 | Xác thực & AI Service | `1.3.1` Preprocessing, `1.3.2` FastAPI | `1.2.1` Auth API, `1.2.2` JWT Security | `1.2.1` UI Login, `1.2.2` UI Profile |
| **Sprint 3** | 05/10 - 18/10 | Nhận diện AI & Khám phá | `1.3.3` Google Vision API | `1.5.1` API Khám phá địa điểm | `1.3.4` UI Kết quả AI, `1.5.1` UI Khám phá |
| **Sprint 4** | 19/10 - 01/11 | Review, Booking & Admin *(Đạt 15/15 MVP)* | Hỗ trợ tích hợp liên dịch vụ | `1.5.4` Booking Engine, `1.6.1-1.6.3` Admin API | `1.4.3` UI Review, `1.5.4` UI Booking, `1.6.1-1.6.3` Admin UI |
| **Sprint 5** | 02/11 - 15/11 | Mạng xã hội & Chat Realtime *(Non-MVP)* | Tối ưu hóa tải AI & Async | `1.4.4` WebSocket STOMP, `1.6.4` Booking Admin | `1.4.1-1.4.2` Social UI, `1.4.4` Chat UI, `1.5.2-1.5.3` Tour/Hotel |
| **Sprint 6** | 16/11 - 29/11 | QA, Docker & Bàn giao | `1.7.3` Docker & Cloud DevOps | `1.7.1`, `1.7.2` Kiểm thử tải & bảo mật | `1.7.1`, `1.7.2` Kiểm thử UI & Responsive |

---

## 🛠️ 5. Lệnh Thường Dùng Khi Làm Việc
```bash
# Kiểm tra nhánh và trạng thái file sạch sẽ
git status

# Chuyển về nhánh main và lấy code mới nhất trước mỗi buổi làm việc
git checkout main && git pull origin main

# Tạo nhánh làm việc theo task WBS
git checkout -b feat/wbs-1.1.2-architecture

# Đẩy nhánh lên remote để tạo PR
git push -u origin feat/wbs-1.1.2-architecture
```
