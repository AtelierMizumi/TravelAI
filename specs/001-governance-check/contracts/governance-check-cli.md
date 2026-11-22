# Contract: `scripts/governance-check.sh`

Giao diện CLI mà CI và người phát triển dùng. Thay đổi giao diện phải cập nhật file này và test tương ứng.

## Cách gọi

```bash
bash scripts/governance-check.sh [base-ref]
```

- `base-ref` (tùy chọn): ref git để kiểm lịch sử commit và test-first, ví dụ `origin/main`. Có thể đặt qua biến môi trường `BASE_REF`.
- Không có `base-ref`: các checkpoint TAGF-4 và test-first ghi `SKIP` (FR-006).

## Output

Mỗi checkpoint một dòng, theo định dạng:

```text
PASS  <mã> <mô tả>
FAIL  <mã> <mô tả> — <file:dòng hoặc danh sách>
SKIP  <mã> <lý do>
```

Dòng cuối là `Governance: ALL CHECKPOINTS PASS` hoặc `Governance: VIOLATIONS FOUND`.

## Exit code

| Code | Ý nghĩa |
|---|---|
| 0 | Không có FAIL (SKIP vẫn tính là 0) |
| 1 | Có ít nhất một FAIL |

## Đảm bảo

- Không in nội dung khớp của secret, chỉ in `file:line` (FR-002).
- Không gọi mạng và không cần Docker (FR-007).
- Không sửa file nào trong repo.

## Kiểm chứng

[test-governance-check.sh](../../../scripts/test-governance-check.sh) TC-01..TC-15 kiểm các đảm bảo trên.
