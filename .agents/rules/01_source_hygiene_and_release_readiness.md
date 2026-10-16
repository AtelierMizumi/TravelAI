# 🧼 SOURCE REFINEMENT & RELEASE READINESS
## RULESET 01: REFERENCE QUARANTINE & CLEAN SUBMISSION

> **ID**: `TAGF-RULE-001`  
> **Scope**: Entire codebase, technical documentation, commit messages, PR descriptions.

---

## 1. PURPOSE

The repository is the deliverable. It must be complete, self-consistent and free of anything that does not belong in a finished submission: reference material, drafts, personal/machine-specific data and leftovers from development.

---

## 2. LOCAL REFERENCE QUARANTINE (`local_references/`)

- `local_references/` (including `learning_materials/`, `legacy_source/`, `legacy_specs/`) is a **local-only** area for slides, earlier baseline code and draft notes.
- It MUST stay in `.gitignore` at all times; `git add local_references/` is a critical violation.
- Never copy reference code or configuration into the repository as-is. Re-implement or refactor it so that it fits the current architecture, conventions and tests, and keep the license/attribution obligations of anything reused.
- Draft requirement files and spreadsheets (`.docx`, `.xlsx`, `.ods`, `.pdf`) stay local. Their content is represented in the repository as Markdown under `docs/` (see Ruleset 04).

---

## 3. SOURCE REFINEMENT CHECKLIST (RUN BEFORE EVERY PR AND BEFORE FINAL SUBMISSION)

1. **No stray artifacts**: no office/binary files, archives, compiled output, `.pyc`, IDE caches (`.ruff_cache`, `.vscode` unless intentionally shared), or temporary files in `git status`.
2. **No secrets or personal data**: no `.env` with real values, API keys, service-account JSON, tokens, or absolute local paths (`/home/...`). Only `.env.example` with placeholders.
3. **No development leftovers**: no debug output (`console.log`, `print`, `System.out.println`, `printStackTrace`), commented-out code blocks, unresolved `TODO`/`FIXME` without an issue number, or dead files.
4. **Consistent naming and language**: identifiers, package names, API paths and docs use one consistent convention; user-facing text and documentation language is chosen per document (Vietnamese or English) and kept uniform within it.
5. **Documentation matches the code**: README, architecture docs, API contracts and `docker-compose.yml` describe what actually runs. Setup steps are reproducible from a clean clone.
6. **Builds and tests pass from a clean clone**: `docker compose up --build` and each service's test command succeed with no manual steps beyond documented ones.
7. **Traceability**: every change is linked to a WBS package and issue (`#<id>`) through the commit message and PR.

---

## 4. AUTHORSHIP AND AI ASSISTANCE

- Commits belong to the engineer who runs the session and is responsible for the change; the agent does not take authorship of commits and never rewrites authorship (see Ruleset 03).
- The engineer reviews and understands all generated code before committing it.
- The repository does not need to hide the fact that AI tooling was used. If an assistant attribution trailer (e.g. `Co-Authored-By`) is added by the tooling, leave it as is; do not add rules or scripts that remove or disguise it. Follow the course's own policy on AI assistance and on disclosing it.
