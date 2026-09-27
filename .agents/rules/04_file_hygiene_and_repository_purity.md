# 🧹 VỆ SINH MÃ NGUỒN & CÁCH LY TÀI SẢN NHỊ PHÂN (FILE HYGIENE & REPO PURITY)
## RULESET 04: STRICT EXCLUSION & CLEAN DIRECTORY TAXONOMY

> **ID**: `TAGF-RULE-004`  
> **Phạm vi**: Cấu hình Git index, .gitignore, cấu trúc thư mục, quy chuẩn asset đa phương tiện.

---

## 1. NGUYÊN TẮC BẤT KHẢ XÂM PHẠM: KHÔNG TÀI LIỆU VĂN PHÒNG / NHỊ PHÂN TRONG GIT

### 1.1. Danh Sách Đuôi File Bị Cấm Tuyệt Đối (Blacklisted Extensions)
Bất kỳ file nào có định dạng sau đây nếu xuất hiện trong `git status` (staged hoặc untracked) đều là dấu hiệu vi phạm và phải bị loại bỏ ngay lập tức:

```text
*.docx, *.doc       # Microsoft Word Documents
*.xlsx, *.xls       # Microsoft Excel Spreadsheets
*.ods, *.odt        # OpenDocument Spreadsheets & Texts
*.pdf               # PDF Reports / Presentations
*.pptx, *.ppt       # PowerPoint Slides
*.csv               # Raw uncompressed CSV dumps (sử dụng database seeder thay thế)
*.zip, *.rar, *.tar # Archive files (trừ khi là asset đặc thù kiểm thử được cấu hình riêng)
*.jar, *.war        # Compiled Java binaries (chỉ build trong Docker hoặc CI/CD)
*.pyc, *.pyo        # Compiled Python bytecode
```

### 1.2. Biện Pháp Khắc Phục Nếu Lỡ Track File Rác
Nếu phát hiện một file văn phòng hoặc file nhị phân lọt vào Git Index:
```bash
# 1. Hủy tracking ngay lập tức nhưng vẫn giữ file trên ổ cứng local
git rm -rf --cached <ten-file-hoac-thu-muc>

# 2. Cập nhật .gitignore để chặn vĩnh viễn
echo "<pattern>" >> .gitignore

# 3. Kiểm tra lại trạng thái
git status
```

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN DOANH NGHIỆP (CLEAN DIRECTORY TAXONOMY)

Kho mã nguồn TravelAI được tổ chức theo mô hình **Monorepo đa dịch vụ (Multi-Service Monorepo)**:

```text
TravelAI/
├── .agents/                    # Hệ thống quy chuẩn thông minh của Agent
│   └── rules/                  # Bộ quy chuẩn TAGF-v2.0 (00 đến 06)
├── .github/                    # Cấu hình GitHub Actions, PR templates, Issue templates
├── client/                     # Frontend SPA: React 18, Vite, TailwindCSS
├── services/
│   ├── ai/                     # AI Microservice: Python 3.11, FastAPI, Google Vision SDK
│   └── core/                   # Core Business Backend: Java 17, Spring Boot 3
├── docs/                       # Tài liệu kỹ thuật Markdown chuẩn
│   ├── architecture/           # Sơ đồ kiến trúc, sequence diagrams, API contracts
│   └── specs/                  # Đặc tả yêu cầu phần mềm (SRS), dữ liệu nghiệp vụ
├── .gitignore                  # Bộ lọc loại trừ toàn diện
├── AGENTS.md                   # Chỉ thị vận hành tối cao cho Agent
├── COLABORATION.md             # Cẩm nang làm việc nhóm 3 kỹ sư (1 buổi/tuần)
├── docker-compose.yml          # Điều phối 4 container (db, ai-service, backend, client)
└── README.md                   # Bảng điều khiển tài liệu trung tâm
```

---

## 3. TIÊU CHUẨN TÀI NGUYÊN ĐỒ HỌA (ASSET INTEGRITY)

- Hình ảnh UI chỉ được lưu trữ trong thư mục `client/public/` hoặc `client/src/assets/`.
- Định dạng bắt buộc: `.svg` (ưu tiên cho icon, logo vector), `.webp` (ưu tiên cho ảnh nền du lịch), `.png` (ảnh nén tối ưu).
- Dung lượng mỗi ảnh UI tĩnh không được vượt quá **500 KB** (tránh làm phình to Git database).
