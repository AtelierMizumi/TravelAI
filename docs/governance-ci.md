# Governance CI — từ luật thành checkpoint máy kiểm tra

Mỗi rule trong `AGENTS.md` / `.agents/rules/` (TAGF-v2.0) được chuyển thành
một checkpoint chạy được bằng máy, thay vì chỉ đọc bằng mắt.

## Mapping rule → check

| Rule | Checkpoint | script |
|---|---|---|
| TAGF-1: cấm file office/binary trong git | `git ls-files` không có `*.docx/*.pdf/*.csv/...` | `governance-check.sh` |
| TAGF-1: `local_references/` quarantine | không tracked `local_references/` hay `.zip` | `governance-check.sh` |
| TAGF-1/2: không secret trong source | quét pattern AWS key / private key / GitHub token (trừ `.env.example`) | `governance-check.sh` |
| TAGF-2: không absolute local path | quét `/home/<user>/`, `/Users/`, `C:\Users\` | `governance-check.sh` |
| TAGF-4: Conventional Commits + Issue ID | subject khớp `<type>(<scope>): summary (#issue)` trên commit của PR | `governance-check.sh origin/main` + `.githooks/commit-msg` |
| TAGF-2/4: không trailer ghi công AI | cấm `Co-Authored-By:` / `Generated with` | `governance-check.sh` + `.githooks/commit-msg` |
| Test-first (global AGENTS.md §3) | PR đổi `backend/src/main/`, `ai-service/` hay `apps/mobile/src|app` phải kèm file test | `governance-check.sh origin/main` |

Một số rule **không** machine-check được và vẫn cần người/bot review:
RACI scope theo WBS, DoR/DoD, sprint calendar, "không copy reference code".
Các rule này giữ nguyên trong `AGENTS.md` và do `reviewer` bot kiểm tra.

## Cách chạy

```bash
# Local (không có base — bỏ qua check commit range + test-first)
bash scripts/governance-check.sh

# Như CI trên PR (gate commit mới + test-first)
bash scripts/governance-check.sh origin/main

# Tự test chính script (fixture repo, RED→GREEN)
bash scripts/test-governance-check.sh

# Bật git hooks local
git config core.hooksPath .githooks
```

## CI

Job `governance` trong `.github/workflows/ci.yml` chạy cả hai lệnh trên
mỗi PR/push. Trên push vào `main`, range `origin/main...HEAD` rỗng nên
check commit là no-op theo thiết kế — gate thật nằm ở PR.

## Lưu ý

- History cũ có 2 commit vi phạm format/trailer (trước khi có gate).
  Gate chỉ áp cho commit mới trong PR, không rewrite history (TAGF-4).
- Heuristic test-first là cảnh báo cứng: đổi source mà không có test
  kèm theo sẽ fail CI. Muốn miễn trừ, kèm test hoặc ghi lý do trong PR.

## Hành vi SKIP khi không có base ref

Khi chạy local không truyền base ref (ví dụ `bash scripts/governance-check.sh`), hai kiểm tra phụ thuộc lịch sử commit ghi `SKIP` và script vẫn exit 0 (FR-006, TC-12):
- `TAGF-4 commit checks`: chỉ kiểm khi có `base...HEAD`.
- `test-first heuristic`: chỉ kiểm khi có base ref.

Trong CI PR, base ref luôn được truyền (`origin/main`), nên hai kiểm tra này chạy đầy đủ.

## Bộ test harness

`bash scripts/test-governance-check.sh` chạy 24 case (TC-01..TC-19, kèm TC-02 cho từng đuôi file). Gate chỉ in `file:dòng` khi phát hiện secret, không in nội dung khớp. Test thật được nhận diện theo mẫu tên (`*.test.*`, `*.spec.*`, `test_*.py`, `*_test.py`, `*Test.java`) hoặc thư mục `tests/`, `__tests__/`. Chi tiết ở [specs/001-governance-check/test-plan.md](../specs/001-governance-check/test-plan.md). Harness không gọi docker, curl hay wget và chạy được với công cụ cơ bản (TC-15).
