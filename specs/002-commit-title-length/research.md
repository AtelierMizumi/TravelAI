# Research: Giới hạn độ dài tiêu đề commit

**Feature**: [spec.md](spec.md) · **Date**: 2026-11-21

## 1. Cách đo độ dài theo ký tự Unicode (FR-002)

**Decision**: `printf '%s' "$subject" | LC_ALL=C.UTF-8 wc -m`

**Rationale**: `wc -m` đếm ký tự khi locale là UTF-8, còn `wc -c` đếm byte. Tiêu đề tiếng Việt có dấu (ví dụ `ă`, `ệ`) chiếm 2–3 byte, nên đếm byte sẽ làm tiêu đề hợp lệ bị FAIL (Acceptance Scenario 3). `C.UTF-8` có sẵn trên Ubuntu runner và Arch, không cần cài thêm.

**Alternatives considered**:
- `${#subject}` trong bash: phụ thuộc locale của shell lúc chạy. Trên CI, locale mặc định có thể là `C`, khi đó đếm theo byte. Bị loại vì không cố định được.
- `python3 -c 'len(...)'`: chính xác, nhưng thêm phụ thuộc runtime cho một kiểm tra đơn giản, đi ngược nguyên tắc 7.
- `iconv` hay `awk`: thêm bước mà không có lợi thế so với `wc -m`.

**Rủi ro cần test**: nếu locale `C.UTF-8` không có trên máy nào đó, `wc -m` sẽ đếm theo byte. TC-22 phải bắt được điều này bằng tiêu đề tiếng Việt 70 ký tự / 80 byte.

## 2. Vị trí kiểm và SKIP (FR-004)

**Decision**: đặt kiểm trong khối `if [[ -n "$BASE" ]]` của TAGF-4, dùng cùng danh sách commit `--no-merges "$BASE"...HEAD`. Khi không có base, in dòng `SKIP  TAGF-4 title length (pass a base-ref ...)` và không đổi `FAIL`.

**Rationale**: cùng nguồn commit với kiểm định dạng, không phải viết lại lệnh `git log` và không lệch danh sách.

**Alternatives considered**: tạo khối riêng. Bị loại vì trùng logic base ref.

## 3. Liệt kê tất cả vi phạm (FR-005)

**Decision**: vòng `while read` tích lũy vào biến `BAD`, giống kiểm định dạng hiện có, không `exit` ở commit đầu tiên.

**Rationale**: nhất quán với mẫu có sẵn trong script.

## 4. Định dạng dòng in ra (FR-003)

**Decision**: mỗi vi phạm in `<hash rút gọn> <tiêu đề>`, lấy bằng `git log --format='%h %s'`. Không dùng `%b`.

**Rationale**: `%s` chỉ là dòng tiêu đề, nên thân commit không lọt vào log CI. Đây là bài học từ BUG-006 (secret bị in trong log).
