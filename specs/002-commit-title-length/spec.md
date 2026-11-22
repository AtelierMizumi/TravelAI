# Feature Specification: Giới hạn độ dài tiêu đề commit

**Feature Branch**: `002-commit-title-length` (chưa tạo branch; feature làm trên `spike/spec-kit`)
**Created**: 2026-11-21
**Status**: Draft
**Input**: User description: "Gate kiểm tra commit không được có tiêu đề dài quá 72 ký tự"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chặn tiêu đề commit quá dài (Priority: P1)

Là tech lead, tôi muốn gate CI từ chối PR có commit mà dòng tiêu đề vượt 72 ký tự, để lịch sử git dễ đọc trên các công cụ như `git log --oneline` và giao diện GitHub.

**Why this priority**: tiêu đề quá dài bị cắt trong giao diện và làm khó tra cứu. Đây là lỗi lặp lại thường gặp, và gate là nơi duy nhất bắt được nó trước khi merge.

**Independent Test**: tạo một PR thử có một commit tiêu đề 73 ký tự và một commit tiêu đề 72 ký tự, rồi chạy gate với base ref. Kết quả mong đợi: commit 73 ký tự làm gate FAIL và chỉ ra commit đó; commit 72 ký tự không gây lỗi.

**Acceptance Scenarios**:

1. **Given** một commit trong `base...HEAD` có tiêu đề 73 ký tự, **When** gate chạy với base ref, **Then** gate FAIL, in ra mã commit ngắn và tiêu đề vi phạm (không in nội dung thân commit).
2. **Given** một commit có tiêu đề đúng 72 ký tự, **When** gate chạy với base ref, **Then** kiểm tra độ dài PASS.
3. **Given** tiêu đề có ký tự tiếng Việt có dấu, ví dụ 70 ký tự thường nhưng 80 byte UTF-8, **When** gate chạy, **Then** độ dài được tính theo ký tự, nên PASS.

### User Story 2 - Chạy local không cần base ref (Priority: P2)

Là dev, tôi muốn chạy gate trên máy cá nhân mà không cần base ref, và kiểm tra độ dài không gây lỗi khi chưa có lịch sử để so sánh.

**Why this priority**: đây là tiện ích phát triển, không chặn merge.

**Independent Test**: chạy gate không có tham số trên repo có commit tiêu đề dài. Kết quả mong đợi: dòng kiểm tra độ dài ghi SKIP, exit 0.

**Acceptance Scenarios**:

1. **Given** không có base ref, **When** gate chạy, **Then** kiểm tra độ dài ghi SKIP và không làm gate FAIL.

### Edge Cases

- Commit merge bị bỏ qua, giống kiểm tra định dạng commit hiện có.
- Tiêu đề rỗng là lỗi định dạng đã được kiểm ở chỗ khác, không thuộc phạm vi kiểm độ dài.
- Nhiều commit vi phạm cùng lúc: gate liệt kê tất cả, không dừng ở commit đầu tiên.
- Tiêu đề có `(#issue)` cuối dòng tính vào 72 ký tự, không tách riêng.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Khi có base ref, gate MUST kiểm mọi commit trong `base...HEAD`, trừ commit merge, và FAIL nếu dòng tiêu đề vượt 72 ký tự.
- **FR-002**: Độ dài MUST được đo theo số ký tự Unicode, không theo byte, để tiêu đề tiếng Việt không bị tính quá dài.
- **FR-003**: Khi FAIL, gate MUST in mã commit rút gọn và tiêu đề vi phạm, và MUST NOT in nội dung thân commit.
- **FR-004**: Khi không có base ref, kiểm tra độ dài MUST ghi SKIP và exit 0.
- **FR-005**: Gate MUST liệt kê tất cả commit vi phạm trong một lần chạy.

### Key Entities

- **Commit**: một đơn vị lịch sử git trong phạm vi kiểm, có tiêu đề (dòng đầu) và thân.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mọi commit có tiêu đề từ 73 ký tự trở lên trong phạm vi kiểm đều khiến gate FAIL, không có ngoại lệ.
- **SC-002**: Mọi commit có tiêu đề từ 72 ký tự trở xuống không bị gate coi là vi phạm độ dài.
- **SC-003**: Người đọc lịch sử `git log --oneline` không thấy tiêu đề bị cắt trên giao diện thông thường, tức là từ 72 ký tự trở xuống.

## Assumptions

- Giới hạn 72 ký tự là quy ước phổ biến cho tiêu đề commit, được chọn làm mặc định vì không có quy định nào trong `AGENTS.md`.
- Tiêu đề là dòng đầu tiên của message, tính đến ký tự xuống dòng.
- Kiểm tra này nằm trong gate hiện có, không tạo hook mới.
- Commit cũ ngoài `base...HEAD` không bị kiểm, giống các kiểm tra lịch sử khác.
- Việc thêm test và code thuộc giai đoạn plan và implement, không thuộc spec này.
