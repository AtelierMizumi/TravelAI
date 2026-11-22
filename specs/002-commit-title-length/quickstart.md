# Quickstart: kiểm chứng giới hạn độ dài tiêu đề commit

**Feature**: [spec.md](spec.md) · **Contract**: [commit-length-output.md](contracts/commit-length-output.md)

## Điều kiện

- Chạy từ gốc repo, có `origin/main` (hoặc base ref khác).
- Locale `C.UTF-8` có sẵn: `locale -a | grep -i 'C.utf8'`.

## Chạy harness (QC và CI)

```bash
bash scripts/test-governance-check.sh
```

Kết quả mong đợi: toàn bộ case PASS, gồm TC-21..TC-24 (xem [test-plan.md](test-plan.md) khi đã tạo).

## Chạy gate

```bash
# Có base ref: kiểm độ dài trong base...HEAD
bash scripts/governance-check.sh origin/main

# Không có base ref: dòng độ dài ghi SKIP, exit 0
bash scripts/governance-check.sh
```

## Kiểm nhanh một tiêu đề tiếng Việt

```bash
printf '%s' 'Tiêu đề tiếng Việt có dấu ...' | LC_ALL=C.UTF-8 wc -m
```

Số in ra phải khớp số ký tự, không phải số byte (`wc -c`).
