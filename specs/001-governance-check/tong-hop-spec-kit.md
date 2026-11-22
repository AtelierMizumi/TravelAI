# Tổng hợp buổi làm việc với Spec Kit (2026-11-21)

Tài liệu này ghi lại những gì đã làm, những gì học được, và những gì còn lại. Mục nào chưa làm thì để chưa tick.

## 1. Đã làm

### Cài đặt và cấu trúc
- Cài `specify` 1.4.3, chạy `specify init --here --integration claude`. Tạo `.specify/` (templates, scripts, constitution) và `.claude/skills/speckit-*` (đã gitignore).
- Tạo branch `spike/spec-kit` từ `main`. Chưa commit, chưa push.

### Feature `001-governance-check` (WBS 1.8.2)
| Artifact | Trạng thái |
|---|---|
| `spec.md` | Đã có user story P1–P3, FR-001..009, SC-001..005, Assumptions, Edge Cases. Cần BA ký lại. |
| `requirement.md` | Đã đồng bộ với spec, có FR-001..009 kèm TC và task. |
| `test-plan.md` | TC-01..TC-19 (+TC-02b) đều PASS. TC-20 chưa viết. |
| `tasks.md` | Breakdown theo phase. Phase 1–7 xong. Phase 8 (T-004..006) chưa làm. |
| `bugs/` | BUG-001..007 đã sửa (BUG-001 sửa một phần). BUG-008 mở. GAPS.md đã đóng. |
| `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` | Đã tạo qua `/speckit-plan`. |
| `checklists/governance.md` | 27 mục, **đều chưa tick** (xem mục 3). |

### Sửa code (script và harness)
- **BUG-006 (Critical)**: gate in nguyên dòng chứa secret vào log CI. Đã sửa, chỉ in `file:dòng`. TC-16.
- **BUG-007 (High)**: test-first nhận nhầm file có "spec"/"test" trong tên. Đã sửa bằng mẫu tên thật. TC-17, TC-18, TC-19.
- **BUG-002..005**: layout cũ, false positive, đường dẫn tuyệt đối trong tài liệu. Đã sửa.
- Harness: 24/24 PASS. Gate trên repo thật: ALL CHECKPOINTS PASS.

### Lệnh slash đã chạy thật
| Lệnh | Kết quả |
|---|---|
| `/speckit-plan` | Chạy thật. Tạo plan và các artifact thiết kế. |
| `/speckit-analyze` | Chạy 3 lần. Lần 1: 1 CRITICAL, 2 HIGH, đã sửa. Lần 2–3: không còn CRITICAL hay HIGH. |
| `/speckit-checklist` | Chạy thật. Tạo 27 mục. |
| `/speckit-converge` | Chạy thật. Tìm ra T001 (CRITICAL) và T002 (HIGH), thêm vào Phase 7. |
| `/speckit-implement` | Chạy thật. Dừng ở cổng checklist, hỏi xác nhận, anh chọn yes, rồi làm T001–T003. |

### Lệnh chưa chạy thật (viết tay theo template)
`/speckit-constitution`, `/speckit-specify`, `/speckit-clarify`, `/speckit-tasks`. Nội dung có đủ nhưng không qua lệnh.

## 2. Học được gì

**Quy trình Spec Kit**
- Luồng: constitution → specify → clarify → checklist → plan → tasks → analyze → implement → converge. Mỗi lệnh có một loại artifact và một loại rủi ro ghi đè khác nhau.
- Template spec có mục bắt buộc **User Scenarios & Testing**. Khi viết lại spec, tôi đã bỏ mục này. `/speckit-analyze` bắt được (CRITICAL U1). Bài học: sửa spec là thay đổi lớn, phải chạy analyze sau mỗi lần sửa.
- `/speckit-analyze` chỉ đọc, phù hợp để chạy nhiều lần. Các finding có mã và mức độ, dễ theo dõi.
- `/speckit-converge` là lệnh có giá trị nhất trong buổi này. Nó đối chiếu code với spec và constitution, phát hiện hai lỗi mà test cũ không bắt được.
- `/speckit-checklist` tạo mục kiểm **chất lượng requirement**, không phải kiểm code. `[x]` là quyết định của reviewer, không phải của agent.
- `/speckit-implement` có cổng checklist: nếu có mục chưa tick thì hỏi xác nhận trước khi chạy.

**Kỹ thuật test**
- Test đặc tả hành vi đã có (viết sau code) không thể đỏ trước. Phải ghi rõ đây là hạn chế, không che giấu.
- Test lồng nhau (harness chạy harness) dễ bị lỗi thiết kế: khi có case đỏ có chủ đích, bản lồng exit 1 và TC-15 báo sai. Phải kiểm đúng thuộc tính cần kiểm (không thiếu công cụ), không kiểm "mọi case pass".
- `$0` là đường dẫn tương đối, sai khi `cd` sang thư mục tạm. Test kiểm `grep "$0"` đã PASS giả. Phát hiện được nhờ đọc lại test.
- Test chứng minh được một hành vi phải có bằng chứng thật: một case đỏ đúng lý do, không chỉ là case xanh.

**Quản trị**
- Checklist là của reviewer. Agent có thể đề xuất đạt, nhưng không được tick thay. Tôi đã tick 27 mục rồi bỏ tick lại khi nhận ra.
- Sửa spec đã ký G1 làm G1 mất hiệu lực. Phải ghi rõ trong roles.md và requirement.md.
- Máy chung: commit phải dùng identity của người thực hiện, kiểm `git config user.email` trước mỗi commit.

## 3. Phát hiện thêm trong dự án

1. **CI Governance đang bị bỏ qua trên `main`**: script không có trên `main` (BUG-001). CI in `skipped` và vẫn xanh.
2. **Gate in secret vào log CI** (BUG-006, Critical). Đã sửa.
3. **Test-first không hoạt động với layout hiện tại** (BUG-002, BUG-007). Regex dùng thư mục cũ, và chuỗi con "spec"/"test" lọt cả hai chiều.
4. **Base ref sai làm gate PASS lặng lẽ** (BUG-008, High). Chưa sửa.
5. **Tài liệu đã track chứa đường dẫn tuyệt đối trên máy** (BUG-005). Đã sửa.
6. **Chồng lấn vai trò**: `AGENTS.md` giao Ngọc owner QA `1.8.1`, quy trình spec giao Ngọc làm BA. Cần thống nhất.
7. **Các vai trò trong `AGENTS.md`** không khớp với phân công spec: Đức là backend, không phải Dev chung. Cần ghi rõ.

## 4. Chưa làm

| Việc | Lý do | Ai |
|---|---|---|
| Sửa BUG-008 (T-004), viết TC-20 | Chưa có thời gian, cần TDD | Dev Đức hoặc phiên sau |
| Ký lại G1 (T-006) | Spec đã đổi | BA Ngọc |
| Tick checklist 27 mục (T-005) | Quyền của reviewer | Reviewer |
| G2: ký test plan | Quyền của QC | Thuận |
| G3: review code, gồm T001 | Quyền của Dev | Đức |
| G4: nghiệm thu | Sau G2, G3 | Thuận |
| D1: bỏ fallback "skipped" trong CI | Chờ script vào `main` | Sau merge |
| Commit và tạo PR | Chưa đủ quality gate | Sau G2, G3 |
| Chạy lại `/speckit-analyze` (E5) | Cần chạy sau khi các thay đổi trên được duyệt | Phiên sau |
| Chạy thật `/speckit-constitution`, `/speckit-specify`, `/speckit-clarify`, `/speckit-tasks` | Đang viết tay | Học thêm |

## 5. Bước tiếp theo

1. Ngọc ký lại G1 trên bản spec mới.
2. Đức duyệt G3, gồm các thay đổi trong `scripts/`, harness và T001–T002.
3. Anh duyệt G2 (test plan) và các quyết định mới trong checklist.
4. Sửa BUG-008 (T-004) theo TDD, rồi tạo PR.
5. Sau khi merge, làm D1.
