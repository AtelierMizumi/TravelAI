# Quickstart: kiểm chứng Governance CI Gate

## Yêu cầu

- `git`, `bash` 4+, `grep`, `sed`, `mktemp`.
- Repo có ít nhất một commit trên `origin/main` (cho chế độ có base ref).

## Bước 1: chạy harness

```bash
bash scripts/test-governance-check.sh
```

Kỳ vọng: `PASS=20 FAIL=0`, exit 0.

## Bước 2: chạy gate trên repo thật

```bash
git fetch origin main
bash scripts/governance-check.sh origin/main
```

Kỳ vọng: 7 dòng PASS và `Governance: ALL CHECKPOINTS PASS`, exit 0.

## Bước 3: chạy chế độ local (không base ref)

```bash
bash scripts/governance-check.sh
```

Kỳ vọng: các dòng `SKIP` cho TAGF-4 và test-first, exit 0.

## Khi gate đỏ

1. Đọc dòng `FAIL` và `file:line` trong output.
2. Tra mã trong [contracts/governance-check-cli.md](contracts/governance-check-cli.md) và [spec.md](spec.md).
3. Tái hiện bằng một lệnh, tạo file `bugs/BUG-NNN.md` theo khung trong [test-plan.md](test-plan.md).
4. Thêm test trước, thấy đỏ, rồi mới sửa.
