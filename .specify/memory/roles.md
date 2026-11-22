# Vai trò trong quy trình Spec Kit

Phân công áp dụng cho các feature trong `specs/`. Đây là vai trò theo quy trình spec, không thay đổi phân công WBS trong `AGENTS.md`.

| Vai trò | Người | GitHub | Git identity | Sở hữu artifact | Lệnh Spec Kit |
|---|---|---|---|---|---|
| **BA** (Business Analyst) | Lê Văn Ngọc | `@ngoctapcodee` | `Lê Văn Ngọc <ngoc492005@gmail.com>` | `spec.md`: user stories, FR, acceptance scenarios | `/speckit-specify`, `/speckit-clarify`, `/speckit-checklist` |
| **QC** (Quality Control) | Trần Minh Thuận | `@AtelierMizumi` | `Minh Thuận Trần <thuanc177@gmail.com>` | `test-plan.md`, `bugs/`, mục xác minh trong `tasks.md` | `/speckit-analyze`, xác nhận nghiệm thu |
| **Dev** (Developer) | Hoàng Văn Đức | `@duchayslay` | `Hoàng Văn Đức <hoangvanduc290805@gmail.com>` | `plan.md`, `tasks.md`, code | `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-converge` |

## Cổng duyệt (gate)

1. **G1 – BA ký spec**: `spec.md` có FR và acceptance scenarios đầy đủ. Ngọc duyệt trước khi QC viết test.
2. **G2 – QC ký test plan**: mỗi FR có ít nhất một TC, và các TC đỏ được xác nhận trước khi Dev code.
3. **G3 – Dev làm theo TDD**: Đức viết code theo `tasks.md`, không sửa hoặc xóa TC để qua test.
4. **G4 – QC nghiệm thu**: Thuận chạy lại test, đóng bug theo BUG-NNN, và tick mục xác minh cuối. Dev không tự đóng bug của mình.

## Quy tắc

- Một người không tự ký hai gate liên tiếp trên cùng một artifact nếu có người khác có thể duyệt.
- Commit dùng git identity của người thực hiện, theo bất biến 4 trong `AGENTS.md`. Không dùng identity của người khác.
- Khi phiên làm việc AI thay một vai trò, phải ghi rõ trong artifact và chờ người đúng vai trò duyệt.

## Trạng thái feature 001-governance-check

- G1 (BA Ngọc ký spec): **cần ký lại**. Spec được cập nhật ngày 2026-11-21 (FR-001..009, Assumptions, Edge Cases). Chữ ký cũ không còn áp dụng cho bản hiện tại.
- G2 (QC Thuận ký test plan): **chờ ký**; TC-01..15 cùng TC-02b đã có, 20/20 pass (TC-11..15 và TC-02b viết sau code, không đỏ trước).
- G3 (Dev Đức): **chờ**. Đức phụ trách backend trong `AGENTS.md`; phần script này là gate CI, Đức cần review. Code và test hôm nay được viết trong phiên của Thuận, nên Đức cần duyệt.
- G4 (QC nghiệm thu): **chưa**.

## Cần xác nhận: chồng lấn với WBS trong AGENTS.md

- `AGENTS.md` và `.agents/rules/02` giao Lê Văn Ngọc làm owner WBS `1.8.1` (QA/E2E) và Trần Minh Thuận làm Tech Lead. Quy trình spec ở trên giao Ngọc làm BA và Thuận làm QC.
- Chưa rõ hai vai trò này có chồng lấn về công việc kiểm thử không. Cần Thuận và Ngọc thống nhất, sau đó ghi quyết định vào file này.
- Trạng thái: **chờ xác nhận**.
