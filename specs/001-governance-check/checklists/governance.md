# Requirements Quality Checklist: Governance CI Gate

**Purpose**: Kiểm chất lượng của chính requirement (spec, FR, test plan, tasks), không kiểm code.
**Created**: 2026-11-21
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [test-plan.md](../test-plan.md) · [tasks.md](../tasks.md)
**Depth / Audience**: Chuẩn (mặc định) · Người duyệt PR · Mặc định, không nhập từ người dùng

**Note**: Checklist do `/speckit-checklist` sinh ra. Mục mới để `[ ]`. Chỉ người duyệt đánh `[x]` khi tiêu chí chất lượng requirement đã đạt.
**Review Ownership**: reviewer-owned. `[x]` không có nghĩa là implementation xong.

## Requirement Completeness

- [ ] CHK001 Có yêu cầu nào về hành vi khi script bị thiếu trên `main` (job CI skip) không, hay chỉ có yêu cầu cho khi script tồn tại? [Gap, Spec §User Story 1]
  - Đánh giá tự động (sau cập nhật spec): Spec Edge Case: vắng script trên nhánh thuộc D1, không thuộc spec này. (chờ reviewer xác nhận)
- [ ] CHK002 Có định nghĩa đầy đủ danh sách đuôi file bị cấm, hay FR-001 dựa vào "và các đuôi văn phòng khác" không có nguồn chuẩn? [Completeness, Spec §FR-001]
  - Đánh giá tự động (sau cập nhật spec): FR-001 liệt kê đủ đuôi, trùng script. (chờ reviewer xác nhận)
- [ ] CHK003 Yêu cầu có nêu rõ cách xử lý khi repo có submodule hoặc file đã bị xóa khỏi index nhưng còn trên đĩa không? [Gap]
  - Đánh giá tự động (sau cập nhật spec): Edge Case và Assumptions: submodule ngoài phạm vi; file đã xóa khỏi index theo `git ls-files`. (chờ reviewer xác nhận)
- [ ] CHK004 Có yêu cầu nào về định dạng và nội dung của dòng PASS/FAIL/SKIP, hay chỉ có mã và exit code? [Completeness, Contract]
  - Đánh giá tự động: Có: contracts/governance-check-cli.md định nghĩa định dạng dòng PASS/FAIL/SKIP và mã exit. (chờ reviewer xác nhận)

## Requirement Clarity

- [ ] CHK005 "Thư mục test" trong Edge Case được định nghĩa cụ thể (`tests/`, `test/`, `*_test.*`, `*.spec.*`) hay còn mơ hồ? [Ambiguity, Spec §Edge Cases]
  - Đánh giá tự động (sau cập nhật spec): FR-005 định nghĩa mẫu tên và thư mục test. (chờ reviewer xác nhận)
- [ ] CHK006 "Các kiểm tra phụ thuộc lịch sử commit" trong FR-006 có liệt kê rõ kiểm tra nào không? [Clarity, Spec §FR-006]
  - Đánh giá tự động (sau cập nhật spec): FR-006 liệt kê TAGF-4 và test-first. (chờ reviewer xác nhận)
- [ ] CHK007 "Định dạng Conventional Commits" trong FR-004 có định nghĩa tập type hợp lệ không, hay chỉ dựa vào regex trong script? [Clarity, Spec §FR-004]
  - Đánh giá tự động (sau cập nhật spec): FR-004 liệt kê type hợp lệ và mẫu scope. (chờ reviewer xác nhận)
- [ ] CHK008 "Đường dẫn tuyệt đối trên máy cá nhân" trong FR-003 có định nghĩa các mẫu cụ thể (`/home/`, `/Users/`, `C:\Users\`) không? [Clarity, Spec §FR-003]
  - Đánh giá tự động (sau cập nhật spec): FR-003 liệt kê ba mẫu đường dẫn tuyệt đối. (chờ reviewer xác nhận)

## Requirement Consistency

- [ ] CHK009 FR-005 nói `ai-service/` (trừ `tests/`) còn Edge Case nói `ai-service/tests/` là test change: hai mô tả có khớp nhau không? [Consistency, Spec §FR-005, Spec §Edge Cases]
  - Đánh giá tự động: Khớp: FR-005 loại `tests/` khỏi nguồn; Edge Case coi `ai-service/tests/` là test change. (chờ reviewer xác nhận)
- [ ] CHK010 Mục "Ngoài phạm vi" trong plan nói không sửa `docs/governance-ci.md`, nhưng tasks C2–C3 sửa file đó: yêu cầu nào đúng? [Conflict, Plan §Ngoài phạm vi, Tasks §C]
  - Đánh giá tự động: Đã giải quyết: plan không còn mục ngoài phạm vi; spec Assumptions đưa docs/governance-ci.md vào phạm vi, khớp tasks C2–C3. (chờ reviewer xác nhận)
- [ ] CHK011 Yêu cầu bỏ fallback "skipped" (D1) được đặt sau merge, còn research R5 nói cùng điều: có quyết định thống nhất trong plan và tasks không? [Consistency, Tasks §D1]
  - Đánh giá tự động: Khớp: research R5 và tasks D1 đều để bỏ fallback sau khi script vào main. (chờ reviewer xác nhận)
- [ ] CHK012 Trạng thái "In review" trong spec có khớp với trạng thái G1–G4 trong roles.md không? [Consistency, Roles]
  - Đánh giá tự động: Khớp: spec ghi In review; roles.md có G1 đã ký, G2–G4 chờ. (chờ reviewer xác nhận)

## Acceptance Criteria Quality

- [ ] CHK013 SC-002 có tiêu chí đo được độc lập với việc viết test không, hay chỉ "tất cả test đều PASS"? [Measurability, Spec §SC-002]
  - Đánh giá tự động: Đo được: đếm test PASS bằng harness và so với số FR (xem test-plan và quickstart). (chờ reviewer xác nhận)
- [ ] CHK014 SC-001 "Mọi FR có ít nhất một test case" có kiểm được tự động không, hay phụ thuộc vào ánh xạ tay trong test-plan? [Measurability, Spec §SC-001]
  - Đánh giá tự động (sau cập nhật spec): SC-001: ánh xạ FR→TC thủ công trong test-plan, nêu rõ là việc thủ công. (chờ reviewer xác nhận)
- [ ] CHK015 Có tiêu chí nào định lượng "chạy nhanh" (plan ghi "dưới 10 giây") và có được đưa vào spec không? [Gap, Plan §Technical Context]
  - Đánh giá tự động (sau cập nhật spec): SC-005: thời gian chạy không vượt timeout CI 10 phút. (chờ reviewer xác nhận)

## Scenario & Edge Case Coverage

- [ ] CHK016 Có yêu cầu nào cho trường hợp `origin/main` không tồn tại trong máy local không? [Coverage, Exception Flow]
  - Đánh giá tự động (sau cập nhật spec): FR-009 và Acceptance 2 của US3: base ref sai phải FAIL (chưa đạt, BUG-008). (chờ reviewer xác nhận)
- [ ] CHK017 Có yêu cầu nào cho trường hợp repo rỗng (chưa có commit) không? [Edge Case, Gap]
  - Đánh giá tự động (sau cập nhật spec): Edge Case: repo chưa có commit và không có base ref thì SKIP. (chờ reviewer xác nhận)
- [ ] CHK018 Có yêu cầu nào cho trường hợp file bị track nhưng nằm trong `.gitignore` không? [Edge Case, Gap]
  - Đánh giá tự động (sau cập nhật spec): FR-008 và Edge Case: chỉ kiểm file tracked, kể cả tracked nhưng ignored. (chờ reviewer xác nhận)
- [ ] CHK019 Có yêu cầu nào cho trường hợp commit merge không? FR-004 chỉ nói `--no-merges`, nhưng spec có ghi rõ điều này không? [Gap, Spec §FR-004]
  - Đánh giá tự động (sau cập nhật spec): Edge Case: merge commit không kiểm định dạng (`--no-merges`). (chờ reviewer xác nhận)

## Non-Functional Requirements

- [ ] CHK020 Yêu cầu bảo mật "không in nội dung secret" có quy định cách kiểm chứng không? [Measurability, Contract]
  - Đánh giá tự động: Có cách kiểm: TC-16 (không in nội dung secret). Yêu cầu nằm ở contract và requirement.md; spec FR-002 chưa nêu, nên nên bổ sung. (chờ reviewer xác nhận)
- [ ] CHK021 Yêu cầu "không gọi mạng" (FR-007) có định nghĩa phạm vi (chỉ harness, hay cả script gate) không? [Ambiguity, Spec §FR-007]
  - Đánh giá tự động (sau cập nhật spec): FR-007 áp dụng cho cả gate và harness. (chờ reviewer xác nhận)
- [ ] CHK022 Có yêu cầu nào về tương thích bash giữa Ubuntu runner và máy local không? [Gap, Plan §Technical Context]
  - Đánh giá tự động: Có: plan Technical Context ghi bash 4+ trên Ubuntu runner và Arch local. (chờ reviewer xác nhận)

## Dependencies & Assumptions

- [ ] CHK023 Assumption "layout monorepo theo AGENTS.md" có điều kiện kiểm lại khi AGENTS.md đổi không? [Assumption, Spec §Assumptions]
  - Đánh giá tự động (sau cập nhật spec): Assumptions: khi AGENTS.md đổi layout thì cập nhật mẫu test và regex trong cùng PR. (chờ reviewer xác nhận)
- [ ] CHK024 Yêu cầu phụ thuộc `origin/main` (CI) có ghi rõ remote tên `origin` là bắt buộc không? [Dependency, Gap]
  - Đánh giá tự động (sau cập nhật spec): Assumptions: CI dùng `origin`, chạy local không bắt buộc. (chờ reviewer xác nhận)

## Ambiguities & Conflicts

- [ ] CHK025 Ngoại lệ test-first (TC-11..15, TC-02b viết sau code) có được ghi trong spec, hay chỉ trong plan? [Traceability, Plan §Complexity Tracking]
  - Đánh giá tự động (sau cập nhật spec): Assumptions: ngoại lệ test-first ghi rõ TC-11..TC-19. (chờ reviewer xác nhận)
- [ ] CHK026 Chồng lấn vai trò Ngọc (BA trong spec, owner WBS 1.8.1) đã được ghi thành điều kiện trong spec hay chỉ trong roles.md? [Conflict, Roles]
  - Đánh giá tự động (sau cập nhật spec): Assumptions: chồng lấn vai trò là tạm thời, tham chiếu roles.md. (chờ reviewer xác nhận)
- [ ] CHK027 Có ID scheme thống nhất giữa FR, TC, BUG và task không (ví dụ TC-02b không theo mẫu TC-NN)? [Traceability]
  - Đánh giá tự động (sau cập nhật spec): Quy ước ID ở đầu spec: TC-NNx là biến thể của TC-NN. (chờ reviewer xác nhận)

## Đánh giá tự động (agent đề xuất, reviewer chưa xác nhận)

- Trạng thái hiện tại: **tất cả mục đã bỏ tick về `[ ]`**. Agent không được tick thay reviewer. Các mục dưới đây đã được agent kiểm đối chiếu và đề xuất đạt, chờ reviewer tick.
- Lượt 1: đề xuất 8 mục có bằng chứng sẵn (CHK004, 009, 010, 011, 012, 013, 020, 022).
- Lượt 2 (sau cập nhật spec): đề xuất thêm 19 mục vì spec đã có câu trả lời. Các quyết định mới do agent đề xuất và reviewer cần xác nhận:
  - base ref sai phải FAIL (FR-009, còn là BUG-008 chưa sửa);
  - loại merge commit khỏi kiểm định dạng;
  - submodule ngoài phạm vi;
  - chỉ kiểm file tracked.
- Chữ ký G1 của BA cần làm lại vì spec đã đổi.

## Notes

- Đánh `[x]` chỉ khi người duyệt xác nhận tiêu chí chất lượng requirement đã đạt
- Mục để `[ ]` nghĩa là cần làm rõ, sửa, hoặc chưa được duyệt
- `/speckit-implement` đọc trạng thái checkbox như gate và không sửa marker
- Ghi nhận xét trực tiếp bên dưới mục nếu cần
