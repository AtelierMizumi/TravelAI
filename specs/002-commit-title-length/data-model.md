# Data Model: Giới hạn độ dài tiêu đề commit

**Feature**: [spec.md](spec.md) · **Date**: 2026-11-21

## Thực thể

### Commit (trong phạm vi kiểm)

Một commit trong `base...HEAD`, không phải merge.

| Trường | Nguồn | Ràng buộc |
|---|---|---|
| `hash` | `git log --format=%h` | Mã rút gọn, chỉ dùng để in |
| `subject` | `git log --format=%s` | Dòng đầu tiên của message; không được in đầy đủ thân |
| `length` | `wc -m` trên `subject` | Số ký tự Unicode; `length > 72` là vi phạm |

Quan hệ: không có. Mỗi commit độc lập.

### Kết quả kiểm độ dài

| Trạng thái | Điều kiện | Exit ảnh hưởng |
|---|---|---|
| `PASS` | Có base ref và không commit nào có `length > 72` | Không |
| `FAIL` | Có base ref và ít nhất một commit có `length > 72` | `FAIL=1` |
| `SKIP` | Không có base ref | Không |

## Quy tắc

- Ngưỡng `72` là hằng số duy nhất. Nếu đổi ngưỡng, phải đổi cùng lúc spec, test và tài liệu.
- Tiêu đề rỗng không thuộc kiểm này (spec, Edge Cases); lỗi định dạng đã được kiểm ở TAGF-4.
