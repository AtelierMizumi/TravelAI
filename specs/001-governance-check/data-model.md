# Data Model: Governance CI Gate

Feature này không có lưu trữ. Các thực thể dưới đây là khái niệm trong script và output.

## Checkpoint

Một kiểm tra có mã TAGF, được script in ra một dòng.

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `status` | enum | `PASS` \| `FAIL` \| `SKIP` |
| `id` | string | Mã TAGF, ví dụ `TAGF-1`, `TAGF-2`, `TAGF-4`, `test-first` |
| `message` | string | Mô tả ngắn; khi FAIL có thêm `— file:dòng` hoặc danh sách file |

**Quy tắc**: `status = FAIL` ở bất kỳ checkpoint nào làm exit code là 1. `SKIP` không làm đổi exit code.

## Violation

Một vi phạm cụ thể trong một Checkpoint FAIL.

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `file` | path | Đường dẫn tương đối từ gốc repo |
| `line` | int? | Có khi là kết quả `grep -n` |
| `rule` | string | Mã TAGF của Checkpoint sinh ra |

**Quy tắc**: output không in nội dung khớp của secret (chỉ `file:line`), để tránh lộ dữ liệu trong log CI.

## Quan hệ

- Một gate chạy gồm nhiều Checkpoint, mỗi Checkpoint có 0..n Violation.
- Exit code là tổng hợp: 0 nếu không có FAIL, 1 nếu có ít nhất một FAIL.
