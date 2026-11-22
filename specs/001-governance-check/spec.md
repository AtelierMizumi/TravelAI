# Feature Specification: Governance CI Gate

**Feature Branch**: `spike/spec-kit`
**Created**: 2026-11-21
**Updated**: 2026-11-21 (bổ sung yêu cầu từ đánh giá checklist; cần BA ký lại G1)
**Status**: In review (G1 cần ký lại, G2–G4 chờ; xem `.specify/memory/roles.md`)
**BA**: Lê Văn Ngọc · **QC**: Trần Minh Thuận · **Dev**: Hoàng Văn Đức · WBS 1.8.2
**Input**: CI gọi `scripts/governance-check.sh` nhưng file không có trên `main`, và các kiểm tra hiện có cho kết quả sai với cấu trúc monorepo hiện tại.

**Quy ước ID**: `FR-NNN` yêu cầu chức năng · `SC-NNN` tiêu chí thành công · `TC-NN` test case · `TC-NNx` biến thể cùng một TC (ví dụ `TC-02b` là biến thể của `TC-02`) · `BUG-NNN` lỗi · `T-NNN` task hội tụ.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gate chạy được trên `main` (Priority: P1)

Là tech lead, tôi muốn mỗi PR chạy `scripts/governance-check.sh origin/main` và nhận kết quả đúng, để phát hiện vi phạm TAGF trước khi merge.

**Why this priority**: job Governance trong CI đang bị bỏ qua vì thiếu file; không có gate thì các bất biến trong AGENTS.md chỉ là lời hứa.

**Independent Test**: chạy `bash scripts/test-governance-check.sh` và `bash scripts/governance-check.sh origin/main` trên branch. Kết quả mong đợi: tất cả test PASS và `ALL CHECKPOINTS PASS`.

**Acceptance Scenarios**:

1. **Given** một PR chỉ sửa `backend/src/main/java/**` mà không sửa test, **When** gate chạy với base ref, **Then** test-first báo FAIL (FR-005, TC-08).
2. **Given** một PR sửa `ai-service/**` kèm test, **When** gate chạy với base ref, **Then** PASS (FR-005, TC-09).
3. **Given** repo có fixture PEM có chủ đích trong `scripts/test-scan-secrets.sh` và placeholder `/home/you/` trong `.env.example`, **When** gate chạy, **Then** không báo nhầm (FR-002, FR-003, TC-10).
4. **Given** tài liệu đã commit chứa đường dẫn tuyệt đối trên máy, **When** gate chạy, **Then** FAIL và chỉ ra file:dòng (FR-003, TC-06).
5. **Given** một file nguồn có chữ "spec" hoặc "test" trong tên (ví dụ `InspectionService.java`) đổi mà không có test thật, **When** gate chạy với base ref, **Then** FAIL (FR-005, TC-17).

### User Story 2 - Quarantine tài liệu và binary (Priority: P2)

Là QC, tôi muốn gate chặn mọi file tài liệu nhị phân và `local_references/` nếu bị commit, để không lộ tài liệu tham khảo hay file văn phòng.

**Why this priority**: vi phạm loại này là lỗi nộp bài nghiêm trọng, nhưng ít xảy ra hơn lỗi CI.

**Independent Test**: thêm file có đuôi trong FR-001 hoặc file trong `local_references/` vào một repo tạm rồi chạy gate.

**Acceptance Scenarios**:

1. **Given** một file có đuôi thuộc FR-001 được track, **When** gate chạy, **Then** FAIL (FR-001, TC-02, TC-02b).
2. **Given** file trong `local_references/` được track, **When** gate chạy, **Then** FAIL (FR-001, TC-11).

### User Story 3 - Gate không phụ thuộc lịch sử khi chạy local (Priority: P3)

Là dev, tôi muốn chạy gate trên máy cá nhân mà không cần base ref, và không bị FAIL oan vì các kiểm tra cần lịch sử commit.

**Why this priority**: chỉ là tiện ích phát triển, không chặn merge.

**Independent Test**: chạy `bash scripts/governance-check.sh` không có tham số trên repo có commit sai định dạng.

**Acceptance Scenarios**:

1. **Given** không có base ref, **When** gate chạy, **Then** các kiểm tra commit và test-first ghi SKIP và exit 0 (FR-006, TC-12).
2. **Given** base ref được truyền nhưng không tồn tại trong repo, **When** gate chạy, **Then** FAIL với thông điệp nêu rõ base ref không resolve được (FR-009, TC-20 — chưa có test, xem BUG-008).

### Edge Cases

- Thư mục test nhận diện theo FR-005. Thay đổi chỉ trong `ai-service/tests/` là test change, không cần test bổ sung (TC-14).
- Harness chạy được chỉ với công cụ cơ bản, không cần Docker hay mạng (FR-007, TC-15).
- File tracked nhưng khớp `.gitignore` vẫn được kiểm vì gate chỉ đọc danh sách tracked (`git ls-files`). File untracked không được kiểm.
- Submodule không được kiểm nội dung (xem Assumptions).
- File đã xóa khỏi worktree nhưng còn trong index: gate đọc theo `git ls-files`, nên vẫn được coi là tracked cho đến khi commit xóa.
- Commit merge không bị kiểm định dạng (`--no-merges`), vì merge commit do công cụ sinh ra.
- Repo chưa có commit và không có base ref: các kiểm tra lịch sử SKIP, không FAIL.
- CI job Governance vắng script trên một nhánh: thuộc D1, xử lý sau khi script vào `main` (không thuộc phạm vi spec này).

## Requirements

### Functional Requirements

- **FR-001**: Gate MUST chặn file có đuôi `.docx`, `.doc`, `.xlsx`, `.xls`, `.ods`, `.odt`, `.pdf`, `.pptx`, `.ppt`, `.csv` và `local_references/` (kèm `local_references.zip`) nếu bị track. Danh sách này trùng với `scripts/governance-check.sh`.
- **FR-002**: Gate MUST phát hiện secret pattern (AWS access key, private key PEM, token GitHub `ghp_`, khóa `sk-`) trong file đã track, trừ fixture tự kiểm thử và `.env.example`. Gate MUST chỉ in `file:dòng`, không in nội dung khớp (TC-16).
- **FR-003**: Gate MUST phát hiện đường dẫn tuyệt đối trên máy cá nhân theo ba mẫu: `/home/<user>/`, `/Users/<user>/`, `C:\Users\`. Trừ placeholder trong `.env.example` và các file tài liệu quản trị được liệt kê trong script.
- **FR-004**: Khi có base ref, gate MUST kiểm subject commit (không tính merge commit) theo Conventional Commits `<type>(<scope>): <summary> (#<issue>)`. Type hợp lệ: `feat, fix, docs, chore, refactor, test, ci, build, perf, style, revert`. Scope là tùy chọn, khớp `[a-z0-9_-]+`. Gate MUST từ chối commit có trailer `Co-Authored-By`, `Generated with`, `Made with ... ChatGPT`, hoặc `Assisted by`.
- **FR-005**: Khi có base ref, gate MUST yêu cầu thay đổi trong `backend/src/main/`, `ai-service/` hoặc `apps/mobile/src|app` đi kèm ít nhất một file test thật. File test thật là file khớp một trong các mẫu: nằm trong thư mục `tests/`, `__tests__/` (hoặc `src/test/` của Java); tên `test_*.py`, `*_test.py`, `*Test.java`, `*.test.(ts|tsx|js)`, `*.spec.(ts|tsx|js)`. Chuỗi con "test" hoặc "spec" trong tên không đủ điều kiện (TC-17, TC-18, TC-19).
- **FR-006**: Khi không có base ref, hai kiểm tra phụ thuộc lịch sử commit là **TAGF-4 (định dạng commit)** và **test-first** MUST ghi SKIP và exit 0.
- **FR-007**: Bộ test `scripts/test-governance-check.sh` MUST chạy độc lập, không cần Docker, curl, wget hay mạng. Gate `scripts/governance-check.sh` MUST cũng không gọi mạng và không cần Docker.
- **FR-008**: Gate MUST chỉ đọc file đã tracked (theo `git ls-files` và `git grep`), không đọc file untracked.
- **FR-009**: Khi base ref được truyền nhưng không resolve được trong repo, gate MUST FAIL với thông điệp nêu rõ base ref không hợp lệ, không được PASS lặng lẽ. Trạng thái: **chưa đạt**, xem BUG-008 và T-004.

### Key Entities

- **Checkpoint**: một kiểm tra có mã TAGF, kết quả PASS / FAIL / SKIP.

## Success Criteria

- **SC-001**: Mọi FR có ít nhất một test case trong [test-plan.md](test-plan.md). Ánh xạ FR→TC được duy trì thủ công trong test-plan; kiểm tự động ánh xạ là việc tương lai, không nằm trong phạm vi này.
- **SC-002**: Mọi test case trong [test-plan.md](test-plan.md) đều PASS khi chạy `bash scripts/test-governance-check.sh`, và số test case không ít hơn số FR.
- **SC-003**: `bash scripts/governance-check.sh origin/main` trên repo thật kết thúc `ALL CHECKPOINTS PASS`.
- **SC-004**: Mỗi test case đỏ khi viết hoặc khi CI chạy đều có một file trong [bugs/](bugs/).
- **SC-005**: Gate hoàn thành trong thời gian timeout của CI job Governance (10 phút, theo `.github/workflows/ci.yml`).

## Assumptions

- Layout monorepo theo `AGENTS.md`: `backend/`, `ai-service/`, `apps/mobile/`. Khi `AGENTS.md` đổi layout, mẫu test (FR-005), regex `SRC` và các TC liên quan được cập nhật trong cùng PR.
- CI dùng remote tên `origin`. Chạy local không bắt buộc có `origin`.
- Phạm vi không gồm hook `.githooks/` (nằm ở branch feature gốc).
- Tài liệu `docs/governance-ci.md` nằm trong phạm vi để đồng bộ hành vi SKIP và các test mới.
- Submodule không được kiểm nội dung. Chưa có yêu cầu cho submodule.
- Ngoại lệ test-first: TC-11..TC-19 (trừ TC-17..TC-19 đã đỏ trước khi sửa) viết sau code, không có bước đỏ. Ghi nhận trong [plan.md](plan.md) (Complexity Tracking).
- Chồng lấn vai trò Ngọc (BA trong spec này, owner WBS `1.8.1` QA/E2E) là tạm thời, ghi trong [roles.md](../../.specify/memory/roles.md).
