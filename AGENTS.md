# AI Agent Directives & Operational Rules - TravelAI
## TRAVELAI AGENT GOVERNANCE FRAMEWORK (TAGF-v2.0)

> **Hiệu lực**: Bắt buộc cho toàn bộ AI Agents, Subagents và Automated Tooling trong workspace `TravelAI`.  
> **Bộ quy chuẩn chi tiết**: Xem toàn bộ tại [`.agents/rules/`](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules).

---

## 🚨 6 NGUYÊN TẮC BẤT KHẢ XÂM PHẠM (IMMUTABLE INVARIANTS)

1. **Vệ Sinh Mã Nguồn & Cách Ly Thư Mục Nền (Zero-Leakage Quarantine)**:
   - **TUYỆT ĐỐI CẤM** `git add`, `commit`, hay `push` bất kỳ file văn phòng / tài liệu nhị phân nào: `.docx`, `.doc`, `.xlsx`, `.xls`, `.ods`, `.pdf`, `.pptx`, `.csv`.
   - Thư mục nền `travelai_original/` là tài nguyên tham khảo cục bộ, **BẮT BUỘC LUÔN BỊ GITIGNORE**, tuyệt đối không đưa vào Git index.
   - Luôn kiểm tra kỹ `git status` trước khi commit để đảm bảo không lọt file rác.
   - *Chi tiết*: [01_provenance_quarantine_and_persona.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/01_provenance_quarantine_and_persona.md) & [04_file_hygiene_and_repository_purity.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/04_file_hygiene_and_repository_purity.md).

2. **Giả Lập Dự Án Chuẩn Doanh Nghiệp (From Scratch & High-Tech Persona)**:
   - Toàn bộ codebase và documentation phải phản ánh một dự án phần mềm được thiết kế và xây dựng bài bản, chuyên nghiệp từ đầu.
   - **TUYỆT ĐỐI KHÔNG** để lộ bất kỳ thông tin nào cho thấy đây là đồ án làm lại, xào nấu lại, hay tái sử dụng từ báo cáo cũ.
   - Cấm nhắc tới các từ khóa học phần: "báo cáo đồ án", "đồ án chuyên ngành", "bài nộp học phần", "theo file docx", "nộp tuần 3", "thầy cô hướng dẫn".
   - *Chi tiết*: [01_provenance_quarantine_and_persona.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/01_provenance_quarantine_and_persona.md).

3. **Cơ Cấu Đội Ngũ 3 Kỹ Sư & Phân Việc Đúng Người (RACI Matrix)**:
   - Dự án được phát triển bởi 3 thành viên:
     - **Trần Minh Thuận** *(User)*: Tech Lead, AI & Integration Architect, PM - `Minh Thuận Trần <thuanc177@gmail.com>`.
     - **Hoàng Văn Đức**: Core Backend & Database Engineer - `Hoàng Văn Đức <duc.hoangvan.dev@gmail.com>`.
     - **Lê Văn Ngọc**: Frontend & UI/UX Specialist - `Lê Văn Ngọc <ngoc.levan.dev@gmail.com>`.
   - Khi thực hiện công việc cho Trần Minh Thuận, **CHỈ ĐƯỢC LÀM** các gói WBS thuộc phạm vi của Thuận:
     - `1.1.1`, `1.1.2`: Khởi động, yêu cầu và kiến trúc hệ thống đa dịch vụ.
     - `1.3.1`, `1.3.2`, `1.3.3`: Phân hệ AI (FastAPI, Preprocessing, Google Cloud Vision API).
     - `1.7.3`: Triển khai hạ tầng Docker, Docker Compose & CI/CD Cloud.
   - Không tự ý làm thay hoặc trộn lẫn công việc của Đức (Backend CSDL) hay Ngọc (Frontend) trừ khi có yêu cầu giả lập riêng.
   - *Chi tiết*: [02_team_topology_and_role_boundaries.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/02_team_topology_and_role_boundaries.md).

4. **Tác Giả Commit & Động Cơ Dòng Thời Gian (Temporal Simulation Engine)**:
   - Agent **KHÔNG BAO GIỜ** nhận mình là tác giả commit. Commits luôn thuộc về người dùng (`Minh Thuận Trần <thuanc177@gmail.com>`) hoặc 2 thành viên còn lại khi được yêu cầu.
   - Mô phỏng nhịp độ làm việc thực tế: **1 buổi / tuần (4-6 tiếng) vào cuối tuần** hoặc giờ hành chính/buổi tối (09:30 - 22:30).
   - Lịch trình 6 Sprints (12 tuần):
     - Sprint 1: 07/09/2026 - 20/09/2026
     - Sprint 2: 21/09/2026 - 04/10/2026
     - Sprint 3: 05/10/2026 - 18/10/2026
     - Sprint 4: 19/10/2026 - 01/11/2026
     - Sprint 5: 02/11/2026 - 15/11/2026
     - Sprint 6: 16/11/2026 - 29/11/2026
   - Sử dụng Conventional Commits 1.0.0 (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) có gắn mã Issue tương ứng (ví dụ: `feat(arch): design microservice architecture (#2)`).
   - *Chi tiết*: [03_git_governance_and_temporal_engine.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/03_git_governance_and_temporal_engine.md).

5. **Tiêu Chuẩn Công Nghệ & Kiến Trúc (Architecture & Tech Standards)**:
   - **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Axios.
   - **Core Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security 6, JWT, PostgreSQL 16. Định dạng lỗi chuẩn RFC 7807.
   - **AI Microservice**: Python 3.11, FastAPI, Pydantic v2, Google Cloud Vision SDK, Pillow/OpenCV.
   - **Containerization**: Dockerfile multi-stage build, root `docker-compose.yml` điều phối 4 services.
   - *Chi tiết*: [05_technical_architecture_and_code_standards.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/05_technical_architecture_and_code_standards.md).

6. **Tiêu Chuẩn Nghiệm Thu & Vòng Đời Sprint (DoR & DoD)**:
   - Áp dụng nghiêm ngặt Definition of Ready (DoR) và Definition of Done (DoD).
   - Mọi task hoàn thành phải đồng bộ trạng thái trên [GitHub Project Board #2](https://github.com/users/AtelierMizumi/projects/2) sang `Done` và đóng Issue liên kết.
   - *Chi tiết*: [06_agile_lifecycle_and_definition_of_done.md](file:///home/thuanc177/Projects/School/TravelAI/.agents/rules/06_agile_lifecycle_and_definition_of_done.md).
