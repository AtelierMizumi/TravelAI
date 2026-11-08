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
| Test-first (global AGENTS.md §3) | PR đổi `services/` hay `client/src/` phải kèm file test | `governance-check.sh origin/main` |

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
