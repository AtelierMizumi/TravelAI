---
name: travelai-sprint-workflow
description: >-
  Standard operating procedure for executing TravelAI sprint tasks. Coordinates branch
  creation, scope verification (RACI matrix), validation testing, clean-room commit binding
  (#issue_id), and GitHub Project board status updates.
---

# TravelAI Sprint Execution Workflow

This skill guides engineers and AI agents through executing, testing, and shipping an assigned Work Breakdown Structure (WBS) task within the TravelAI platform.

---

## 1. Pre-Flight Verification & Scope Check

Before writing any code:
1. **Identify the Issue ID & WBS Code**:
   - Check the issue number on [GitHub Project Board #2](https://github.com/users/AtelierMizumi/projects/2).
2. **Verify Engineer Scope (RACI Matrix)**:
   - **Trần Minh Thuận**: Architecture (`1.1.1`, `1.1.2`), AI Vision Microservice (`1.3.1`, `1.3.2`, `1.3.3`), Cloud & Docker DevOps (`1.7.3`).
   - **Hoàng Văn Đức**: Database DDL (`1.1.3`), Core Spring Boot Backend (`1.2.1`, `1.2.2`, `1.4.4`, `1.5.1`, `1.5.4`, `1.6.1-1.6.4`).
   - **Lê Văn Ngọc**: React Frontend SPA (`1.2.1`, `1.2.2`, `1.3.4`, `1.4.1-1.4.4`, `1.5.1-1.5.4`, `1.6.1-1.6.5`).
3. **Move Board Card to `In Progress`**:
   - Update issue status on GitHub Project #2 to `In Progress`.

---

## 2. Branch Protocol

Always create a fresh topic branch from clean `main`:
```bash
git checkout main
git pull origin main
git checkout -b feat/wbs-<id>-<short-description>
```

---

## 3. Implementation & Test-Driven Verification

1. **Verify Contract Alignment**:
   - Check `docs/architecture/api_contract.md` to ensure request/response payloads match agreed DTOs and RFC 7807 Problem Details.
2. **Execute Local Validation / Tests**:
   - For AI service: Run pytest or the `vision-service-test-harness` skill.
   - For Backend: Run `./mvnw test` or Spring Boot test suites.
   - For Frontend: Run `npm run build` or Vite dev check.

---

## 4. Clean-Room Pre-Commit Audit

Always verify working tree purity before staging:
```bash
git status
```
- **Zero-Tolerance Invariant**: Ensure NO binary or office files (`*.docx`, `*.xlsx`, `*.ods`, `*.pdf`, `local_references/`) appear in untracked files.
- Stage only modified source code and documentation:
  ```bash
  git add <path/to/source/files>
  ```

---

## 5. Conventional Commit & Issue Binding

Formulate commit message strictly following Conventional Commits 1.0.0 bound to the Issue ID:
```bash
git commit -m "<type>(<scope>): <concise summary> (#<issue_id>)"
```
Examples:
- `feat(ai): implement image upload and normalization pipeline (#6)`
- `feat(backend): implement jwt authentication filter (#5)`
- `fix(client): resolve image crop ratio in landmark preview (#9)`

---

## 6. Project Board Synchronization

1. Push branch to remote:
   ```bash
   git push origin feat/wbs-<id>-<short-description>
   ```
2. When the deliverable meets 100% of Acceptance Criteria (DoD):
   - Move issue card on GitHub Project #2 to `Done`.
   - Close linked issue with commit reference.
