# Contract: đầu ra kiểm độ dài tiêu đề commit

**Feature**: [spec.md](../spec.md) · **Date**: 2026-11-21

Giao diện này là phần bổ sung cho [contract CLI của 001](../../001-governance-check/contracts/governance-check-cli.md). Các dòng khác không đổi.

## Lệnh

```bash
bash scripts/governance-check.sh <base-ref>
```

## Dòng đầu ra mới

| Điều kiện | Dòng | Exit |
|---|---|---|
| Không có base ref | `SKIP  TAGF-4 title length (pass a base-ref, e.g. origin/main, in PR CI)` | không đổi |
| Có base ref, tất cả tiêu đề ≤ 72 ký tự | `PASS  TAGF-4 commit titles <= 72 characters` | không đổi |
| Có base ref, có vi phạm | `FAIL  TAGF-4 commit title over 72 characters — <hash> <tiêu đề>; ...` | `1` |

## Quy tắc đầu ra

- Chỉ in `<hash rút gọn>` và tiêu đề. Không in thân commit (FR-003).
- Mỗi vi phạm nằm trong cùng một dòng `FAIL`, ngăn cách bằng `; ` (giống kiểm định dạng TAGF-4).
- Dòng trạng thái khớp mẫu `^(PASS|FAIL|SKIP)  ` để CI đọc được.
