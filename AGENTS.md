# AI Agent Directives & Operational Rules - TravelAI

## 🚨 BẮT BUỘC TUÂN THỦ (MANDATORY OPERATIONAL DIRECTIVES)

1. **Vệ Sinh Kho Mã Nguồn & Cách Ly Thư Mục Nền**:
   - **TUYỆT ĐỐI KHÔNG** commit bất kỳ file `.docx`, `.doc`, `.xlsx`, `.xls`, `.ods`, `.pdf`, `.pptx` nào vào Git.
   - Thư mục nền `travelai_original/` là tài nguyên tham khảo cục bộ, **BẮT BUỘC PHẢI LUÔN BỊ GITIGNORE**, tuyệt đối không đưa vào Git index.
   - Mọi tài liệu kỹ thuật phải được viết dưới dạng Markdown (`.md`) hoặc sơ đồ Mermaid.
   - Luôn kiểm tra kỹ `git status` trước khi commit để đảm bảo không lọt file rác.

2. **Giả Lập Dự Án Chuẩn Doanh Nghiệp (From Scratch & High-Tech Persona)**:
   - Toàn bộ codebase và documentation phải phản ánh một dự án phần mềm được thiết kế và xây dựng bài bản, chuyên nghiệp từ đầu.
   - **TUYỆT ĐỐI KHÔNG** để lộ bất kỳ thông tin nào cho thấy đây là đồ án làm lại, xào nấu lại, hay tái sử dụng từ báo cáo cũ.
   - Không được nhắc tới các cụm từ: "báo cáo đồ án", "đồ án chuyên ngành", "bài nộp học phần", "theo file docx", "nộp tuần 3", "thầy cô hướng dẫn".

3. **Cơ Cấu Đội Ngũ 3 Kỹ Sư & Phân Việc Đúng Người**:
   - Dự án được phát triển bởi 3 thành viên:
     - **Trần Minh Thuận** (User / Tech Lead, AI & Integration, PM) - `Minh Thuận Trần <thuanc177@gmail.com>`.
     - **Hoàng Văn Đức** (Core Backend & Database Engineer - Spring Boot 3, PostgreSQL, JWT, Booking, Admin).
     - **Lê Văn Ngọc** (Frontend & UI/UX Specialist - ReactJS 18, TailwindCSS, State Management).
   - Khi thực hiện công việc cho Trần Minh Thuận, **CHỈ ĐƯỢC LÀM** các gói WBS thuộc phạm vi của Thuận:
     - `1.1.1`, `1.1.2`: Khởi động, yêu cầu và kiến trúc hệ thống đa dịch vụ.
     - `1.3.1`, `1.3.2`, `1.3.3`: Phân hệ AI (FastAPI, Preprocessing, Google Cloud Vision API).
     - `1.7.3`: Triển khai hạ tầng Docker, Docker Compose & CI/CD Cloud.
   - Không tự ý làm thay hoặc trộn lẫn công việc của Đức (Backend CSDL) hay Ngọc (Frontend) trừ khi có yêu cầu giả lập riêng.

4. **Tác Giả Commit & Dòng Thời Gian (Realistic Commit Authoring & Timing)**:
   - Agent **KHÔNG BAO GIỜ** nhận mình là tác giả commit. Commits luôn thuộc về người dùng (`Minh Thuận Trần <thuanc177@gmail.com>`) hoặc 2 thành viên còn lại khi được yêu cầu.
   - Mô phỏng đúng nhịp độ làm việc thực tế: **1 buổi / tuần (4-6 tiếng) vào cuối tuần** hoặc giờ hành chính/buổi tối (09:30 - 22:30).
   - Lịch trình 6 Sprints (12 tuần):
     - Sprint 1: 07/09/2026 - 20/09/2026
     - Sprint 2: 21/09/2026 - 04/10/2026
     - Sprint 3: 05/10/2026 - 18/10/2026
     - Sprint 4: 19/10/2026 - 01/11/2026
     - Sprint 5: 02/11/2026 - 15/11/2026
     - Sprint 6: 16/11/2026 - 29/11/2026
   - Sử dụng Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) có gắn mã Issue tương ứng (ví dụ: `feat(arch): design microservice architecture (#2)`).
