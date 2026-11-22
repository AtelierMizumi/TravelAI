# Test Plan: Governance CI Gate

**QC**: Trần Minh Thuận · **Spec (BA Ngọc)**: [spec.md](spec.md) · **Harness**: `scripts/test-governance-check.sh`
**Cách chạy**: `bash scripts/test-governance-check.sh` (mỗi case dựng một repo git tạm). Kết quả hiện tại: **24/24 PASS**.

## Test cases

| ID | Mô tả | Requirement | Trạng thái | Bug liên quan |
|---|---|---|---|---|
| TC-01 | Repo sạch với commit đúng định dạng PASS; script tồn tại | FR-004, FR-007 | ✅ Pass | [BUG-001](bugs/BUG-001.md) |
| TC-02 | File `.docx` được track thì FAIL | FR-001 | ✅ Pass | — |
| TC-02b | File `.pdf`, `.xlsx`, `.pptx`, `.csv`, `.ods` được track thì FAIL (mỗi đuôi một case) | FR-001 | ✅ Pass (đặc tả) | — |
| TC-03 | Khóa AWS giả trong file track thì FAIL | FR-002 | ✅ Pass | — |
| TC-04 | Subject commit sai định dạng thì FAIL | FR-004 | ✅ Pass | — |
| TC-05 | Trailer `Co-Authored-By` thì FAIL | FR-004 | ✅ Pass | — |
| TC-06 | Đường dẫn tuyệt đối trong source thì FAIL | FR-003 | ✅ Pass | [BUG-005](bugs/BUG-005.md) |
| TC-07 | `ai-service/` đổi không kèm test thì FAIL | FR-005 | ✅ Pass (sau sửa) | [BUG-002](bugs/BUG-002.md) |
| TC-08 | `backend/src/main/` đổi không kèm test thì FAIL | FR-005 | ✅ Pass (sau sửa) | [BUG-002](bugs/BUG-002.md) |
| TC-09 | `backend/` đổi kèm test thì PASS | FR-005 | ✅ Pass | [BUG-002](bugs/BUG-002.md) |
| TC-10 | Fixture PEM trong `scripts/test-scan-secrets.sh` và `/home/you/` trong `.env.example` không bị flag | FR-002, FR-003 | ✅ Pass (sau sửa) | [BUG-003](bugs/BUG-003.md), [BUG-004](bugs/BUG-004.md) |
| TC-11 | `local_references/` bị track thì FAIL | FR-001 | ✅ Pass (đặc tả, viết sau code) | GAP-01 |
| TC-12 | Không truyền base ref thì commit/test-first ghi SKIP, exit 0 | FR-006 | ✅ Pass (đặc tả, viết sau code) | GAP-02 |
| TC-13 | `apps/mobile/src/*.tsx` đổi không kèm test thì FAIL | FR-005 | ✅ Pass (đặc tả, viết sau code) | GAP-03 |
| TC-14 | Thay đổi chỉ trong `ai-service/tests/` là test change, PASS | FR-005 | ✅ Pass (đặc tả, viết sau code) | — |
| TC-15 | Harness chạy được với PATH chỉ có công cụ cơ bản: chạy đến dòng tổng kết và không có lỗi `command not found` (không kiểm mọi case pass) | FR-007 | ✅ Pass (đặc tả, viết sau code) | — |
| TC-16 | Secret phát hiện chỉ in `file:dòng`, không in nội dung khớp | FR-002 | ✅ Pass (đỏ trước khi sửa) | [BUG-006](bugs/BUG-006.md) |
| TC-17 | File nguồn có "spec"/"test" trong tên (`InspectionService.java`, `contest.py`) vẫn FAIL khi thiếu test thật | FR-005 | ✅ Pass (đỏ trước khi sửa) | [BUG-007](bugs/BUG-007.md) |
| TC-18 | File không phải test có "test" trong tên (`docs/contest-notes.md`) không được tính là test change | FR-005 | ✅ Pass (đỏ trước khi sửa) | [BUG-007](bugs/BUG-007.md) |
| TC-19 | Test thật theo mẫu tên (`*.test.tsx`) thỏa test-first | FR-005 | ✅ Pass (đặc tả) | — |
| TC-20 | Base ref không tồn tại thì FAIL với thông điệp rõ, không PASS lặng lẽ | FR-009 | ⬜ **Chưa viết test** (đỏ hiện tại, xem BUG-008) | [BUG-008](bugs/BUG-008.md) |

## Ánh xạ FR → TC

| FR | Test case |
|---|---|
| FR-001 | TC-02, TC-02b, TC-11 |
| FR-002 | TC-03, TC-10, TC-16 |
| FR-003 | TC-06, TC-10 |
| FR-004 | TC-01, TC-04, TC-05 |
| FR-005 | TC-07, TC-08, TC-09, TC-13, TC-14, TC-17, TC-18, TC-19 |
| FR-006 | TC-12 |
| FR-007 | TC-01, TC-15 |
| FR-009 | TC-20 (chưa đạt) |

## Quy ước bug filing

Mỗi test case đỏ khi viết hoặc khi CI chạy phải có một file trong `bugs/BUG-NNN.md` theo khung:
`Tiêu đề · Mức độ (Critical/High/Medium/Low) · TC liên quan · Bước tái hiện (1 lệnh) · Kết quả mong đợi · Kết quả thực tế · Nguyên nhân gốc (root cause) · Test hồi quy · Trạng thái`.

Quy trình: tái hiện bằng một lệnh → tìm root cause trước khi sửa → thêm test hồi quy → sửa → xanh.
