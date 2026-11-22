# Implementation Plan: Giới hạn độ dài tiêu đề commit

**Branch**: `spike/spec-kit` (feature id `002-commit-title-length`; chưa tạo branch riêng) | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)
**BA**: Lê Văn Ngọc · **QC**: Trần Minh Thuận · **Dev**: Hoàng Văn Đức

**Input**: [spec.md](spec.md), [constitution](../../.specify/memory/constitution.md), [roles](../../.specify/memory/roles.md)

## Summary

Thêm một kiểm tra vào `scripts/governance-check.sh`: khi có base ref, mọi commit trong `base...HEAD` (trừ merge) có dòng tiêu đề dài quá 72 ký tự Unicode thì gate FAIL và liệt kê mã commit ngắn cùng tiêu đề vi phạm. Không có base ref thì dòng kiểm tra ghi SKIP và exit 0. Kiểm tra nằm trong khối TAGF-4 hiện có, không thêm hook hay file script mới.

Cách tiếp cận: bash thuần, đo độ dài bằng `wc -m` dưới locale `C.UTF-8` (xem [research.md](research.md)). Mỗi hành vi là một case trong harness `scripts/test-governance-check.sh`, viết và thấy đỏ trước khi sửa script.

## Technical Context

**Language/Version**: Bash (`set -u`), bash 4+ trên Ubuntu runner và Arch local
**Primary Dependencies**: `git`, `wc` (có `-m`), `locale` `C.UTF-8` có sẵn trên Ubuntu runner và Arch; không thêm dependency
**Storage**: N/A (đọc `git log --format=%s` trong `base...HEAD`)
**Testing**: `scripts/test-governance-check.sh` (harness bash, mỗi case một repo git tạm); chạy trong CI job `scripts`
**Target Platform**: GitHub Actions `ubuntu-latest` và máy local Linux
**Project Type**: CLI script / CI gate
**Performance Goals**: không đáng kể (một lệnh `git log` và `wc` cho mỗi commit trong PR)
**Constraints**: không in thân commit (FR-003); không gọi mạng; không đổi hành vi các kiểm tra TAGF-1/2/4 hiện có
**Scale/Scope**: thêm khoảng 10 dòng vào script, khoảng 4 case vào harness, cập nhật `docs/governance-ci.md`

## Constitution Check

*GATE: phải đạt trước Phase 0. Kiểm lại sau Phase 1.*

| Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|
| 1. Không lộ dữ liệu | PASS | Chỉ in mã commit ngắn và tiêu đề; thân commit không được in (FR-003, TC-24). Tiêu đề có thể chứa thông tin nhạy cảm nhưng đã nằm trong lịch sử git và log CI hiện có. |
| 2. Test trước | PASS | Các TC-21..TC-24 phải viết trước và thấy đỏ trước khi sửa script. TC-23 (SKIP) đặc tả hành vi đã có một phần nhưng chưa có dòng SKIP riêng cho độ dài; vẫn viết trước. |
| 3. Đúng vai trò | PASS (có điều kiện) | Spec do BA Ngọc soạn, cần ký G1 trước khi QC viết test. Test plan do QC Thuận ký G2. Code do Dev Đức làm theo G3. Xem [roles](../../.specify/memory/roles.md). |
| 4. Lịch sử git trung thực | PASS | Commit dùng identity của người thực hiện, kiểm `git config user.email` trước khi commit. |
| 5. Không đụng phần người khác | PASS | Chỉ sửa `scripts/`, `docs/governance-ci.md` và `specs/002-commit-title-length/`. Không sửa `.github/workflows/ci.yml` (job đã gọi script). |
| 6. Không push `main` | PASS | Chỉ làm trên `spike/spec-kit`. PR chỉ tạo khi quality gate đạt. |
| 7. Đơn giản trước | PASS | Không thêm file script, không thêm dependency. Giới hạn 72 là hằng số duy nhất. |

**Quality gate cho PR** (theo nhóm, giống 001): (a) `bash scripts/test-governance-check.sh` toàn PASS, gồm TC-21..TC-24; (b) `bash scripts/governance-check.sh origin/main` đạt ALL CHECKPOINTS PASS; (c) `/speckit-analyze` không còn CRITICAL hoặc HIGH; (d) Đức duyệt code, Ngọc duyệt spec.

## Project Structure

### Documentation (feature này)

```text
specs/002-commit-title-length/
├── spec.md                       # User stories, FR-001..005, SC-001..003
├── plan.md                       # File này
├── research.md                   # Phase 0: đo độ dài Unicode, SKIP
├── data-model.md                 # Phase 1: thực thể Commit và kết quả kiểm
├── contracts/
│   └── commit-length-output.md   # Phase 1: dòng PASS/FAIL/SKIP mà CI đọc
├── quickstart.md                 # Phase 1: cách chạy kiểm chứng
├── test-plan.md                  # Sẽ tạo ở bước test (QC)
├── tasks.md                      # Sẽ tạo bởi /speckit-tasks
└── checklists/requirements.md    # Checklist chất lượng spec (đã có)
```

### Source Code (repository root)

```text
scripts/
├── governance-check.sh           # Thêm kiểm độ dài tiêu đề trong khối TAGF-4
└── test-governance-check.sh      # Thêm TC-21..TC-24

docs/
└── governance-ci.md              # Mô tả kiểm độ dài và SKIP
```

**Structure Decision**: sửa hai file hiện có trong `scripts/` và một tài liệu. Không tạo thư mục hay script mới. Lý do: FR-001 và FR-004 đều nằm trong khối TAGF-4 đang gated theo base ref; tách file sẽ tạo thêm đường gọi không cần thiết.

## Complexity Tracking

> Không có vi phạm cần giải trình. Các TC-21..TC-24 viết trước code, đúng nguyên tắc 2.
