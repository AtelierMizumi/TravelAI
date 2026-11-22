# Tasks: Governance CI Gate

**Dev**: Hoàng Văn Đức · **Input**: [spec.md](spec.md) · [plan.md](plan.md) · [test-plan.md](test-plan.md) · [bugs/](bugs/)
**Quy ước**: `[x]` xong (đã xác minh) · `[ ]` chưa làm · mỗi task ghi FR/TC/BUG liên quan · `→` là phụ thuộc phải xong trước.

## Phase 1 – Test trước (Nguyên tắc 2)

- [x] B1 Cập nhật harness sang layout thật (`ai-service/`, `backend/src/main/java`, `apps/mobile`)
- [x] B2 Thêm TC-07, TC-08, TC-09 · FR-005 · thấy đỏ trước A2
- [x] B3 Thêm TC-10 · FR-002, FR-003 · thấy đỏ trước A3, A4
- [x] B4 Thêm TC-11 (`local_references/`) · FR-001 · đặc tả, không đỏ trước
- [x] B5 Thêm TC-12 (SKIP không base ref) · FR-006 · đặc tả, không đỏ trước
- [x] B6 Thêm TC-13 (`apps/mobile`) · FR-005 · đặc tả, không đỏ trước
- [x] B7 Mở rộng TC-02 cho `pdf`, `xlsx`, `pptx`, `csv`, `ods` · FR-001 · đặc tả
- [x] B8 Thêm TC-14 (`ai-service/tests/` là test change) · FR-005 · đặc tả
- [x] B9 Thêm TC-15 (harness chạy với công cụ cơ bản) · FR-007 · đặc tả, thực thi trong PATH tối thiểu

## Phase 2 – Sửa code (sau Phase 1)

- [x] A1 Lấy script từ `feat/wbs-1.8.2-docker-compose-integration` · BUG-001 · → B1
- [x] A2 Sửa regex test-first sang layout thật · BUG-002 · TC-07, TC-08, TC-09 · → B2
- [x] A3 Loại trừ `scripts/test-scan-secrets.sh` khỏi secret-scan · BUG-003 · TC-10 · → B3
- [x] A4 Loại trừ `.env.example` khỏi path-scan · BUG-004 · TC-10 · → B3
- [x] A5 Hành vi SKIP đã có sẵn trong script · FR-006 · TC-12 · → B5
- [x] A6 Hành vi `local_references/` đã có sẵn trong script · FR-001 · TC-11 · → B4

## Phase 3 – Tài liệu và dữ liệu

- [x] C1 Sửa đường dẫn tuyệt đối trong plan đã track · BUG-005 · TC-06
- [x] C2 Sửa dòng stale trong `docs/governance-ci.md` · BUG-002
- [x] C3 Cập nhật `docs/governance-ci.md` mô tả SKIP và TC-01..15 · → B4–B9
- [x] C4 Kiểm tra vai trò: `git config user.email` = `thuanc177@gmail.com` khớp QC Thuận (nguyên tắc 3)

## Phase 4 – CI wiring (chỉ sau khi merge vào `main`)

- [ ] D1 Bỏ nhánh fallback "skipped" trong `.github/workflows/ci.yml` · BUG-001 · → A1 đã merge vào `main`

## Phase 5 – Spec Kit và nghiệm thu

- [x] E1 `spec.md` có user stories P1..P3, FR-001..FR-007 và success criteria
- [x] E2 `test-plan.md` gắn từng TC với FR và BUG
- [x] E3 `bugs/` có khung bug filing, BUG-001..005, GAPS.md
- [x] E4 Traceability: FR-004 gắn TC-04, TC-05 tại task A1 (baseline); FR-007 gắn TC-15
- [ ] E5 Chạy lại `/speckit-analyze` sau khi duyệt các thay đổi này

## Phase 6 – Xác minh cuối

- [x] V1 `bash scripts/test-governance-check.sh` → 20/20 PASS
- [x] V2 `bash scripts/governance-check.sh origin/main` → ALL CHECKPOINTS PASS
- [x] V3 Chạy lại sau C3 và C4: 20/20 PASS, ALL CHECKPOINTS PASS

## Phase 7: Convergence

Phát hiện khi đối chiếu code với spec/plan/constitution (không đổi code ở bước này). Mỗi task ghi nguồn truy vết và loại gap.

- [x] T001 CRITICAL: Gate đang in nguyên nội dung dòng khớp secret trong TAGF-1/2 (`git grep -n` in cả dòng), nên khóa thật sẽ lộ vào log CI. Viết TC-16 trước (đầu ra không được chứa chuỗi khóa, chỉ có `file:dòng`), thấy đỏ, rồi sửa script để chỉ in `file:dòng`. per FR-002 + Contract "không in nội dung khớp" (contradicts) · Constitution 1
- [x] T002 HIGH: Heuristic test-first loại file bằng `grep -v '(test|spec)'` nên bỏ sót `InspectionService.java` và `contest.py` (thiếu test vẫn PASS). Viết TC-17 (file có "spec"/"test" trong tên thường vẫn phải FAIL khi thiếu test) và TC-18 (test thật theo tên `*_test.*`, `*Test.java`, `*.test.*`, `*.spec.*`, hoặc thư mục `tests/`/`__tests__/`) trước, thấy đỏ, rồi sửa regex. per FR-005 (partial)
- [x] T003 LOW: Cập nhật `test-plan.md` (TC-16..18), `requirement.md` (FR-002, FR-005) và `docs/governance-ci.md` theo hành vi mới sau T001–T002. per FR-002, FR-005 (partial, documentation)

## Phase 8: Bổ sung yêu cầu sau đánh giá checklist

- [ ] T-004 HIGH: Base ref không tồn tại làm gate PASS lặng lẽ (BUG-008). Viết TC-20 trước (base ref sai phải FAIL với thông điệp rõ), thấy đỏ, rồi sửa bằng `git rev-parse --verify`. per FR-009 (chưa đạt) · BUG-008
- [ ] T-005 LOW: Cập nhật `checklists/governance.md` sau khi reviewer xác nhận các mục đã tick tự động. per Checklist gate
- [ ] T-006 LOW: Ký lại G1 cho spec đã cập nhật (BA Ngọc). per roles.md G1
