# Requirement: Governance CI Gate (001-governance-check)

**Trạng thái**: In review · G1 cần ký lại (spec cập nhật 2026-11-21) · **Phạm vi**: WBS 1.8.2 (script gate, không đụng backend/frontend)

| Vai trò | Người | Gate |
|---|---|---|
| BA | Lê Văn Ngọc | G1 spec: **cần ký lại** (spec đã cập nhật) |
| QC | Trần Minh Thuận | G2 test plan: chờ ký · G4 nghiệm thu: chưa |
| Dev | Hoàng Văn Đức | G3 review code: chờ |

Chi tiết user story và acceptance scenarios: [spec.md](spec.md). Test case: [test-plan.md](test-plan.md). Breakdown việc: [tasks.md](tasks.md). Bug filing: [bugs/](bugs/).

## 1. Yêu cầu chức năng

| ID | Yêu cầu | Test case | Task |
|---|---|---|---|
| FR-001 | Chặn file tài liệu/binary (`.docx .pdf .xlsx .pptx .csv .ods` và các đuôi văn phòng khác) và `local_references/` nếu bị track | TC-02, TC-02b, TC-11 | A6, B4, B7 |
| FR-002 | Phát hiện secret pattern trong file đã track, trừ fixture tự kiểm thử; chỉ in `file:dòng`, không in nội dung khớp | TC-03, TC-10, TC-16 | A3, B3, T001 |
| FR-003 | Phát hiện đường dẫn tuyệt đối trên máy cá nhân, trừ placeholder `.env.example` | TC-06, TC-10 | A4, B3, C1 |
| FR-004 | Có base ref: subject commit đúng Conventional Commits `(#issue)`, không có trailer trợ lý AI | TC-01, TC-04, TC-05 | A1 |
| FR-005 | Có base ref: đổi `backend/src/main/`, `ai-service/` (trừ `tests/`), `apps/mobile/src|app` phải kèm test thật (nhận diện theo mẫu tên hoặc thư mục test, không theo chuỗi con "test"/"spec") | TC-07, TC-08, TC-09, TC-13, TC-14, TC-17, TC-18, TC-19 | A2, B2, B6, B8, T002 |
| FR-006 | Không có base ref: các kiểm tra lịch sử ghi SKIP, exit 0 | TC-12 | A5, B5 |
| FR-007 | Harness chạy độc lập, không cần Docker hay mạng | TC-01, TC-15 | B9 |
| FR-008 | Gate chỉ đọc file đã tracked (`git ls-files`, `git grep`), không đọc file untracked | Chưa có TC riêng (hành vi có sẵn, xem Edge Cases trong spec) | — |
| FR-009 | Base ref không resolve được thì FAIL với thông điệp rõ, không PASS lặng lẽ | TC-20 (**chưa đạt**, BUG-008) | T-004 (chưa làm) |

## 2. Giới hạn (constraints)

- **Chỉ bash**, chỉ dùng `git`, `grep`, `sed`, `mktemp`. Không thêm dependency.
- **Không gọi** docker, curl, wget trong harness (TC-15).
- **Không in** nội dung khớp của secret, chỉ in `file:dòng`.
- **Không sửa** code backend/frontend. `ci.yml` chỉ sửa ở D1, sau khi script đã có trên `main`.
- **Không push `main`**. Mọi thay đổi ở `spike/spec-kit`. PR chỉ tạo khi quality gate đạt.
- **Một người thực hiện một lúc**: không dùng multi-agent cho việc code trong giai đoạn này.
- **Commit** dùng git identity của người thực hiện. Trên máy chung, kiểm `git config user.email` trước mỗi commit.
- **Ngoại lệ test-first**: TC-11..15 và TC-02b viết sau code, ghi trong `plan.md` (Complexity Tracking) và chờ Đức duyệt chéo.

## 3. Tiêu chí nghiệm thu (quality gate để tạo PR)

Tiêu chí 1–3 đã đạt tại thời điểm viết. Tiêu chí 4 chưa đạt. Thêm tiêu chí 5: BUG-008 (FR-009) được sửa và TC-20 xanh, hoặc anh/Đức chấp nhận ghi nhận là lỗi đã biết.

1. `bash scripts/test-governance-check.sh` → 20/20 PASS.
2. `bash scripts/governance-check.sh origin/main` → ALL CHECKPOINTS PASS.
3. `/speckit-analyze` không còn CRITICAL hoặc HIGH.
4. G2 (QC ký test plan) và G3 (Dev review code) đã có chữ ký.

## 4. Ngoài phạm vi

- Thêm hook `.githooks/` (nằm ở branch feature gốc).
- Bỏ fallback "skipped" trong CI (D1): làm trong PR theo sau, sau khi script vào `main`.
- Bất kỳ thay đổi nào trong `backend/` hoặc `apps/mobile/`.
