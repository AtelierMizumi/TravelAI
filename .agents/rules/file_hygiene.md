# Quy Chuẩn Quản Lý File & Vệ Sinh Mã Nguồn (File Hygiene Rules)

## 1. Nghiêm Cấm Commit Các File Tài Liệu Văn Phòng / Binary Report
- **TUYỆT ĐỐI KHÔNG** được `git add`, `git commit` hoặc `git push` bất kỳ file tài liệu văn phòng hoặc báo cáo thô nào vào Git, bao gồm nhưng không giới hạn:
  - Microsoft Word: `*.docx`, `*.doc`
  - Microsoft Excel / Bảng tính: `*.xlsx`, `*.xls`, `*.ods`
  - Báo cáo PDF: `*.pdf`
  - Bài thuyết trình: `*.pptx`, `*.ppt`
  - File tạm OS/Editor: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`
- Nếu các file này tồn tại trên máy người dùng, chúng chỉ được phục vụ mục đích tham khảo nội bộ và **phải luôn nằm trong `.gitignore`**.

## 2. Tiêu Chuẩn File Trong Repository
- Repository chỉ chứa:
  1. Mã nguồn thực thi (ReactJS, Spring Boot, FastAPI, SQL scripts).
  2. File cấu hình chuẩn (Docker, Docker Compose, CI/CD GitHub Actions, application configs).
  3. Tài liệu kỹ thuật Markdown chuẩn (`.md`) với diagrams (Mermaid).
  4. Assets hình ảnh tối ưu phục vụ UI (`.svg`, `.png`, `.webp` dưới thư mục `assets/` hoặc `public/`).
