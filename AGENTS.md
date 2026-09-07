# AI Agent Directives & Operational Rules - TravelAI

## 🚨 BẮT BUỘC TUÂN THỦ (MANDATORY OPERATIONAL DIRECTIVES)

1. **Vệ Sinh File & Không Commit Tài Liệu Báo Cáo / Office Files**:
   - TUYỆT ĐỐI KHÔNG commit bất kỳ file `.docx`, `.doc`, `.xlsx`, `.xls`, `.ods`, `.pdf`, `.pptx` nào vào kho mã nguồn.
   - Mọi tài liệu nghiệp vụ phải được thể hiện dưới dạng Markdown (`.md`) hoặc sơ đồ Mermaid.
   - Luôn duy trì `.gitignore` đầy đủ và kiểm tra kỹ trước khi commit (`git status`).

2. **Giả Lập Dự Án Chuẩn Doanh Nghiệp (From Scratch & High-Tech Persona)**:
   - Toàn bộ codebase và documentation phải phản ánh dự án được phát triển bài bản, chuyên nghiệp từ đầu.
   - Tuyệt đối không để lộ từ ngữ liên quan đến đồ án trường học, báo cáo môn học, bài tập lớn, hoặc file nguồn gốc ngoài đời.
   - Giữ tác phong kỹ sư phần mềm chuyên nghiệp (Software Engineer / Tech Lead).

3. **Tác Giả Commit & Dòng Thời Gian (Realistic Commit Authoring & Timing)**:
   - Agent **KHÔNG BAO GIỜ** nhận mình là tác giả commit. Commits luôn thuộc về người dùng hoặc các kỹ sư trong nhóm 3 người.
   - Thời gian commit phải hợp lý theo lịch làm việc thực tế của con người (giờ hành chính hoặc buổi tối từ 09:30 - 22:30), khớp với lịch trình Sprint:
     - Sprint 1: 07/09/2026 - 20/09/2026
     - Sprint 2: 21/09/2026 - 04/10/2026
     - Sprint 3: 05/10/2026 - 18/10/2026
     - Sprint 4: 19/10/2026 - 01/11/2026
     - Sprint 5: 02/11/2026 - 15/11/2026
     - Sprint 6: 16/11/2026 - 29/11/2026
   - Sử dụng Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) có gắn mã Issue tương ứng.

4. **Tuân Thủ WBS & Cơ Cấu 3 Kỹ Sư**:
   - Phân chia công việc theo đúng chuyên môn của 3 thành viên:
     - Lead / AI & Integration (FastAPI, Google Vision API, Docker)
     - Backend & Database (Spring Boot 3, PostgreSQL, JWT, Booking, Admin)
     - Frontend & UI/UX (ReactJS, Vite, Tailwind, Reviews, Social, Chat)
   - Tất cả 25 gói công việc đã được đồng bộ trên GitHub Issues (#1 đến #25) và GitHub Projects #2.
