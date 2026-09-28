---
name: travelai-sprint-workflow
description: >-
  Autonomous 1-prompt sprint execution SOP for TravelAI engineers (Thuận, Đức, Ngọc).
  Orchestrates context resolution, issue claiming, branch initialization, scope-isolated
  coding, verification, temporal commits, PR generation, and Tech Lead review gatekeeping.
---

# 🚀 TravelAI Autonomous Sprint Execution SOP

This skill defines the complete operational procedure for executing an end-to-end sprint work session triggered by **1 single prompt**. It enforces strict RACI boundaries, human-like temporal pacing, zero file-leakage hygiene, and human gatekeeping by Tech Lead Trần Minh Thuận (`@AtelierMizumi`).

---

## 1. Quick Reference: Engineering Topology & RACI Matrix

| Engineer | Role | GitHub Handle | Git Author Identity | Authorized WBS Modules |
|---|---|---|---|---|
| **Trần Minh Thuận** *(User)* | **Tech Lead, AI & DevOps** | `@AtelierMizumi` | `Minh Thuận Trần <thuanc177@gmail.com>` | `1.1.1`, `1.1.2`, `1.3.1`, `1.3.2`, `1.3.3`, `1.7.3` (`services/ai/`, arch docs, docker) |
| **Hoàng Văn Đức** | **Core Backend & DB** | `@duchayslay` | `Hoàng Văn Đức <hoangvanduc290805@gmail.com>` | `1.1.3`, `1.2.1`(BE), `1.2.2`(BE), `1.4.4`(BE), `1.5.1`(BE), `1.5.4`(BE), `1.6.1-1.6.4`(BE) (`services/backend/`) |
| **Lê Văn Ngọc** | **Frontend & UI/UX** | `@ngoctapcodee` | `Lê Văn Ngọc <ngoc492005@gmail.com>` | `1.2.1`(FE), `1.2.2`(FE), `1.3.4`, `1.4.1-1.4.3`, `1.4.4`(FE), `1.5.1-1.5.4`(FE), `1.6.1-1.6.5`(FE) (`services/client/`) |

---

## 2. GitHub Project Board #2 Metadata Reference

- **Owner**: `AtelierMizumi`
- **Project Number**: `2` (`PVT_kwHOBbhbZ84Bk25F`)
- **Status Field ID**: `PVTSSF_lAHOBbhbZ84Bk25Fzhjl5nY`
  - `Todo`: `f75ad846`
  - `In Progress`: `47fc9ee4`
  - `Done`: `98236657`

---

## 3. The 7-Phase Execution Workflow

```
[Prompt Trigger]
       │
       ▼
Phase 1: Resolver (WBS, Issue #, Assignee, Temporal Window)
       │
       ▼
Phase 2: Claim Issue & Update Board (Status: Todo -> In Progress)
       │
       ▼
Phase 3: Clean Branch Init (`feat/wbs-<id>-<slug>`)
       │
       ▼
Phase 4: Scope-Isolated Deep Coding & Local Verification
       │
       ▼
Phase 5: Temporal Commit & Remote Push (Human Pacing)
       │
       ▼
Phase 6: Pull Request Creation (DoD Checklist, `Closes #<id>`)
       │
       ▼
Phase 7: STOP AT GATEKEEPER ➔ Report PR link to Tech Lead for Review & Merge
```

### Phase 1: Context & RACI Resolver
1. Identify the engineer from the user prompt:
   - "Thuận" / "Lead" -> `@AtelierMizumi`
   - "Đức" / "Backend" -> `@duchayslay`
   - "Ngọc" / "Frontend" -> `@ngoctapcodee`
2. Determine target WBS package and linked GitHub Issue number (e.g., via `gh issue list -R AtelierMizumi/TravelAI`).
3. Verify that the task matches the engineer's authorized RACI scope.

### Phase 2: Claim Task & Sync Project Board #2
1. **Assign Issue**:
   ```bash
   gh issue edit <issue_id> --add-assignee "<github_handle>"
   ```
2. **Find Item ID on Project Board**:
   ```bash
   gh project item-list 2 --owner AtelierMizumi --format json
   ```
3. **Transition Status to "In Progress"**:
   ```bash
   gh project item-edit --project-id PVT_kwHOBbhbZ84Bk25F \
     --id <item_id> \
     --field-id PVTSSF_lAHOBbhbZ84Bk25Fzhjl5nY \
     --single-select-option-id 47fc9ee4
   ```

### Phase 3: Clean Branch Initialization
1. Ensure working tree is clean: `git status -s`.
2. Sync latest `main`:
   ```bash
   git checkout main && git pull origin main
   ```
3. Create feature branch:
   ```bash
   git checkout -b feat/wbs-<id>-<short-slug>
   ```

### Phase 4: Scope-Isolated Deep Coding & Verification
1. **RACI Enforcement**: Edit ONLY the designated microservice/directory:
   - Thuận: `services/ai/`, root `docker-compose.yml`, architecture docs.
   - Đức: `services/backend/` (Spring Boot, DDL, flyway).
   - Ngọc: `services/client/` (React, Tailwind, Vite).
2. **Quality & Zero-Pollution**:
   - Zero `.docx`, `.xlsx`, `.pdf`, or `local_references/` staged.
   - Zero debug statements (`print`, `console.log`, `System.out.println`).
   - Errors follow RFC 7807 Problem Details.
3. **Run Local Verification**:
   - AI Subsystem: `pytest services/ai/tests/`
   - Backend: `cd services/backend && ./mvnw test`
   - Frontend: `cd services/client && npm run build`

### Phase 5: Temporal Commit & Push
1. Stage modified files:
   ```bash
   git add <path/to/files>
   ```
2. Format Conventional Commit with realistic timestamp (working hours `09:30 - 22:30` within Sprint dates):
   ```bash
   GIT_AUTHOR_DATE="2026-09-28 14:15:00 +0700" \
   GIT_COMMITTER_DATE="2026-09-28 14:15:00 +0700" \
   git commit --author="<Author Name> <<Author Email>>" \
     -m "<type>(<scope>): <summary> (#<issue_id>)"
   ```
3. Push topic branch:
   ```bash
   git push -u origin feat/wbs-<id>-<short-slug>
   ```

### Phase 6: Automated Pull Request Generation
Create the Pull Request with auto-closing directive and complete DoD verification checklist:
```bash
gh pr create \
  --title "<type>(<scope>): <summary> (#<issue_id>)" \
  --body "$(cat << 'EOF'
## 🎯 Purpose & Scope
Closes #<issue_id> - Implements WBS <id>

## 📦 Key Deliverables & Changes
- ...

## 🧪 Verification & Test Results
- [x] Local test suite executed and passed
- [x] Zero office/binary files staged
- [x] RFC 7807 Problem Details compliant

## 📋 Definition of Done (DoD) Checklist
- [x] Code conforms to Clean Layered Architecture
- [x] Zero lingering debug logs
- [x] Conventional Commit linked to Issue #<issue_id>
- [x] Ready for Tech Lead Code Review
EOF
)"
```

### Phase 7: Human Gatekeeper Hand-off (STOP HERE)
🛑 **DO NOT MERGE THE PULL REQUEST**:
The agent must stop execution and return a structured report to the user:
```markdown
### ✅ Ca làm việc hoàn thành - Đang chờ Tech Lead duyệt PR

- **Kỹ sư phụ trách**: [Tên Kỹ Sư] (`@handle`)
- **Gói WBS & Issue**: WBS [id] - Issue #[issue_id]
- **Nhánh**: `feat/wbs-[id]-[slug]`
- **Pull Request**: [Link Pull Request trên GitHub]
- **Trạng thái kiểm thử**: 100% Passed (DoD Certified)

👉 *Mời Tech Lead @AtelierMizumi kiểm tra code và bấm Merge PR trên GitHub.*
```

---

## 4. Post-Merge Wrap-Up (After PR is merged on GitHub)

When notified that the PR has been merged:
1. Transition card on Project Board #2 to **Done**:
   ```bash
   gh project item-edit --project-id PVT_kwHOBbhbZ84Bk25F \
     --id <item_id> \
     --field-id PVTSSF_lAHOBbhbZ84Bk25Fzhjl5nY \
     --single-select-option-id 98236657
   ```
2. Verify linked issue is closed:
   ```bash
   gh issue view <issue_id> --json state
   ```
3. Clean up local branch:
   ```bash
   git checkout main && git pull origin main && git branch -d feat/wbs-<id>-<short-slug>
   ```
