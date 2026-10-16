# 🔀 GIT GOVERNANCE
## RULESET 03: HONEST HISTORY, CONVENTIONAL COMMITS & BRANCHING

> **ID**: `TAGF-RULE-003`  
> **Scope**: All Git commands, branch names, PR workflows, schedule alignment checks.

---

## 1. HONEST HISTORY (INVARIANTS)

1. **Real timestamps.** Commits are created at the time they are actually made. NEVER set `GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`, `--date`, or rewrite history to change when work happened.
2. **Real authorship.** A commit is authored by the engineer running the session, using their own configured identity (`git config user.name` / `user.email`). NEVER use `--author`, `--reset-author` or environment overrides to commit as another person. The agent does not claim authorship either.
3. **No history rewriting on shared branches.** No force-push to `main` or to branches others use.
4. **Work pattern is irrelevant.** Evening-only or burst commits are normal for a team that studies during the day. No pacing, spacing or time-window rules apply to commits.

---

## 2. IDENTITY AND SCOPE CHECK (BEFORE THE FIRST COMMIT OF A SESSION)

```bash
git config user.email
```

| Engineer | Expected email | WBS packages (Ruleset 02) |
|---|---|---|
| Trần Minh Thuận | `thuanc177@gmail.com` | `1.1.1` `1.1.2` `1.1.3` `1.3.1` `1.3.2` `1.8.2` |
| Hoàng Văn Đức | `hoangvanduc290805@gmail.com` | per RACI |
| Lê Văn Ngọc | `ngoc492005@gmail.com` | per RACI |

- If the configured identity does not match the engineer named in the task, STOP and ask. Do not override the identity.
- If the requested files fall outside the engineer's WBS packages, STOP and ask (Ruleset 02, §3).

---

## 3. SCHEDULE ALIGNMENT CHECK (REPORT ONLY)

Compare today's real date with the sprint calendar and the WBS and report the status; never alter dates to fit it.

| Sprint | Date range | Focus |
|---|---|---|
| Sprint 1 | `2026-09-07` → `2026-09-20` | Initiation, Architecture, DB Modeling |
| Sprint 2 | `2026-09-21` → `2026-10-04` | Auth & Security, AI Microservice Foundation |
| Sprint 3 | `2026-10-05` → `2026-10-18` | Google Vision Integration, Destination Search |
| Sprint 4 | `2026-10-19` → `2026-11-01` | Review System, Booking Engine, Admin Portal |
| Sprint 5 | `2026-11-02` → `2026-11-15` | Social Feed, WebSocket Chat, Tour/Hotel Ext |
| Sprint 6 | `2026-11-16` → `2026-11-29` | Full QA, Load Testing, Cloud CI/CD Release |

Output a short status per engineer: active sprint, WBS packages due in it, packages done (closed issues / `Done` cards), packages behind schedule. If work is behind, say so and propose re-planning in the WBS or the board; do not hide it.

---

## 4. CONVENTIONAL COMMITS 1.0.0

```text
<type>(<scope>): <imperative summary> (#<issue_id>)
```

- **Types**: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.
- **Scopes**: `arch`, `ai`, `auth`, `place`, `booking`, `review`, `social`, `chat`, `admin`, `docker`, `ci`.

```bash
git commit -m "feat(arch): design microservice architecture, inter-service api contract and docker baseline (#2)"
git commit -m "feat(ai): implement image validation and normalization pipeline (#6)"
git commit -m "feat(auth): implement user registration and bcrypt password hashing (#4)"
```

---

## 5. BRANCHING & PR WORKFLOW (GITFLOW LITE)

1. **Branches**: `feat/wbs-<id>-<short-slug>`, `fix/wbs-<id>-<short-slug>`.
2. **Pull Requests**: description includes summary of changes, test scenarios executed, acceptance-criteria checklist, and `Closes #<issue_id>`.
3. **Review threads**: `required_review_thread_resolution: false` on `main`; automated reviews (e.g. Copilot) are advisory. Engineers resolve findings through commits and tests.
4. **Pre-commit check**: run `git status` and confirm that nothing from Ruleset 04's blacklist and nothing from `local_references/` is staged.
