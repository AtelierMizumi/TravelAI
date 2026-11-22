# Implementation Plan: Governance CI Gate

**Branch**: `spike/spec-kit` (feature id `001-governance-check`) | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)
**Dev**: Hoàng Văn Đức · **QC**: Trần Minh Thuận · **BA**: Lê Văn Ngọc

**Input**: [spec.md](spec.md), [test-plan.md](test-plan.md), [tasks.md](tasks.md), [constitution](../../.specify/memory/constitution.md), [roles](../../.specify/memory/roles.md)

## Summary

Đưa `scripts/governance-check.sh` vào `main` và làm cho nó đúng với cấu trúc monorepo hiện tại. Gate kiểm bốn nhóm: tài liệu/binary và `local_references/` bị track, secret và đường dẫn tuyệt đối, định dạng commit và trailer AI, và test-first theo layout thật. Harness `scripts/test-governance-check.sh` chứng minh từng hành vi bằng repo git tạm (20 case, TC-01..TC-15).

Cách tiếp cận: dùng bash thuần, không thêm phụ thuộc. Mỗi vi phạm là một case trong harness. Sửa code chỉ sau khi test đã phản ánh đúng hành vi mong muốn.

## Technical Context

**Language/Version**: Bash (`set -u`), chạy được trên bash 4+ của Ubuntu runner và Arch local
**Primary Dependencies**: `git`, `grep` (có `-E`, `-I`), `sed`, `mktemp`; không có dependency ngoài
**Storage**: N/A (đọc `git ls-files`, `git grep`, `git log`, `git diff`)
**Testing**: `scripts/test-governance-check.sh` (harness bash, mỗi case một repo tạm); chạy trong CI job `scripts`
**Target Platform**: GitHub Actions `ubuntu-latest` và máy local Linux
**Project Type**: CLI script / CI gate
**Performance Goals**: chạy hết dưới 10 giây trên repo cỡ TravelAI (không đo chính thức)
**Constraints**: không gọi docker, curl, wget (FR-007, TC-15); không ghi secret ra output (chỉ `file:line`); không sửa file ngoài phạm vi
**Scale/Scope**: một script (~70 dòng), một harness (~200 dòng), một tài liệu

## Constitution Check

*GATE: phải đạt trước Phase 0. Kiểm lại sau Phase 1.*

| Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|
| 1. Không lộ dữ liệu | PASS | BUG-005 đã sửa đường dẫn tuyệt đối trong plan đã track. Gate kiểm lại mỗi lần chạy. |
| 2. Test trước | **PASS CÓ NGOẠI LỆ** | TC-07, TC-08, TC-10 đỏ trước khi sửa. TC-11..15 và TC-02b viết sau code, không có bước đỏ. Ngoại lệ được ghi trong Complexity Tracking. |
| 3. Đúng vai trò | PASS (có điều kiện) | `git config user.email` khớp QC. Các gate G1–G4 còn chờ ký. Chồng lấn vai trò WBS 1.8.1 đang chờ xác nhận. |
| 4. Lịch sử git trung thực | PASS | Không commit ở bước plan. Commit sẽ dùng identity của người thực hiện. |
| 5. Không đụng phần người khác | PASS | Không sửa code backend hay frontend. CI job `.github/workflows/ci.yml` chỉ sửa ở Phase 4, sau merge. |
| 6. Không push `main` | PASS | Mọi thay đổi ở `spike/spec-kit`. PR chỉ tạo khi quality gate đạt. |
| 7. Đơn giản trước | PASS | Không thêm dependency, không thêm framework test. |

**Quality gate cho PR** (theo yêu cầu của nhóm): PR chỉ được tạo khi (a) `bash scripts/test-governance-check.sh` đạt 20/20, (b) `bash scripts/governance-check.sh origin/main` đạt ALL CHECKPOINTS PASS, (c) `/speckit-analyze` không còn CRITICAL hoặc HIGH, (d) người duyệt chéo (Đức cho code, Ngọc cho spec) xác nhận.

## Project Structure

### Documentation (feature này)

```text
specs/001-governance-check/
├── spec.md              # User stories, FR, SC
├── plan.md              # File này
├── research.md          # Phase 0: quyết định kỹ thuật
├── data-model.md        # Phase 1: thực thể Checkpoint và kết quả
├── contracts/
│   └── governance-check-cli.md   # Phase 1: giao diện CLI cho CI
├── quickstart.md        # Phase 1: cách chạy kiểm chứng
├── test-plan.md         # TC-01..TC-15, ánh xạ FR
├── tasks.md             # Phase 1..6 (/speckit-tasks đã tạo)
└── bugs/                # BUG-001..005, GAPS.md
```

### Source Code (repository root)

```text
scripts/
├── governance-check.sh          # Gate: TAGF-1, TAGF-2, TAGF-4, test-first
└── test-governance-check.sh     # Harness: TC-01..TC-15

docs/
└── governance-ci.md             # Mô tả gate, SKIP, harness

.github/workflows/
└── ci.yml                       # job governance (Phase 4, sau merge)
```

**Structure Decision**: một script và một harness trong `scripts/`, tài liệu trong `docs/`, đặc tả trong `specs/001-governance-check/`. Không tạo thư mục mới.

## Complexity Tracking

> Chỉ điền khi Constitution Check có vi phạm cần giải trình.

| Vi phạm | Lý do cần | Phương án đơn giản hơn bị loại vì |
|---|---|---|
| Nguyên tắc 2: TC-11..15 và TC-02b viết sau code, không có bước đỏ | Các hành vi này đã có trong script từ branch feature gốc. Phát hiện muộn khi phân tích khoảng trống (GAP-01..03) và báo cáo analyze (E1, E2, E4). | Bỏ test đặc tả thì không chứng minh được FR-001 (các đuôi khác), FR-006, FR-007. Tạo bước đỏ giả bằng cách tắt tính năng là phá test, bị cấm. Ghi nhận ngoại lệ là cách trung thực nhất. |
