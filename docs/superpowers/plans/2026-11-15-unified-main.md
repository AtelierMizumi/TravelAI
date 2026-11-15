# Unified `main` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Land one coherent v2-based `main` containing the best of all three engineers' work, then align GitHub and every submission document to it.

**Architecture:** `release/unified` = v2 head + merge of `origin/main`; targeted ports re-implemented test-first; v1 tree removed last; one PR to `main`.

**Tech Stack:** Spring Boot 3.5 / JDK 25 / Postgres 16; Expo (React Native web); FastAPI (Python 3.12); GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-15-unified-main-design.md`

## Global Constraints
- Never commit binaries (`*.pdf *.docx *.xlsx *.zip *.pyc *.onnx *.jpg` samples), keys or personal contact data.
- Commit messages: `<type>(<scope>): <summary> (#<issue>)`, no assistant trailers; real dates and identity.
- Safety tag `pre-final-merge` on `origin/main` before the merge; no force-push.
- Every port is test-first: red for the right reason, then green.

## Review Focus
- Delete of a tour/hotel/place that has bookings must be refused, not cascade.
- A local-model prediction on an out-of-class image must never attach services or be reported as confirmed.
- Missing model file must not crash `ai-service` start or `/detect`.
- Province aliases (Quảng Nam → Đà Nẵng, Thừa Thiên Huế → Huế) and unknown provinces return no invented services.
- Release path must not redeploy the live site as a side effect of the merge.

---

### Task 1: Baseline merge
**Files:** `.env.example`, `.github/workflows/ci.yml`, `docker-compose.yml`
- [ ] **Step 1:** `git tag pre-final-merge origin/main && git push origin pre-final-merge`
- [ ] **Step 2:** In `release/unified`: `git merge origin/main`; resolve the 3 conflicts taking the v2 side (7-job CI, v2 compose, v2 env), keep `main`-only content that v2 lacks.
- [ ] **Step 3:** Verify: `docker compose -f docker-compose.yml config -q` exits 0; commit.

### Task 2: Delete guard (Đức #54 intent)
**Files:** Create `backend/src/test/java/com/travelai/backend/catalog/DeleteGuardIntegrationTest.java`; Modify `TourController.java`, `HotelController.java`, `PlaceController.java`
**Interfaces:** Produces: `DELETE /api/{tours|hotels|places}/{id}` → `409` with `{message}` when bookings or dependent offerings exist.
- [ ] **Step 1:** Test: create tour + booking → delete returns 409 and the row remains; delete of an unreferenced tour returns 200.
- [ ] **Step 2:** Run `./mvnw -Dtest=DeleteGuardIntegrationTest test` → FAIL (delete currently returns 200).
- [ ] **Step 3:** Implement the existence check via the booking repositories; same for hotel and place.
- [ ] **Step 4:** Re-run → PASS; run whole backend suite. Commit.

### Task 3: Ngọc catalog patch
**Files:** apply `git diff ngoc/main~1 ngoc/main` limited to `backend/`, `apps/mobile/`, `shared/`, `scripts/download-landmark-model.py`, `ai-service/` (excluding sample images, `docs/`).
- [ ] **Step 1:** `git diff ngoc/main~1 ngoc/main -- <paths> | git apply --3way`; resolve overlaps with the hardened v2 `PlaceController`/`TourController`.
- [ ] **Step 2:** Add tests for the Review Focus province cases in `LandmarkCatalogTest`; confirm red before fixing any gap.
- [ ] **Step 3:** `./mvnw test`, app lint/test/tsc → green. Commit as `feat(catalog): …` crediting the source commit in the body.

### Task 4: Local classifier, optional
**Files:** `ai-service/ai/landmark_model.py`, `ai-service/ai/main.py`, `ai-service/tests/test_detection_api.py`, `ai-service/requirements.txt`
- [ ] **Step 1:** Tests: no model file → `/detect` unchanged; model-only prediction → `isPrediction=true`, no provinceServices; classes.json/model order mismatch → local model disabled.
- [ ] **Step 2:** Run → FAIL where behavior is missing; fix; run `python -m unittest discover -s tests -v` → PASS. Commit.

### Task 5: Remove v1 tree
**Files:** delete `services/`, `client/`; modify compose, CI, scripts, `README.md`, `AGENTS.md` paths.
- [ ] **Step 1:** `grep -rn "services/core\|services/ai\|client/" . --include=* -l` → fix each reference.
- [ ] **Step 2:** `git rm -r services client`; compose/CI/smoke still green. Commit.

### Task 6: PR to `main`
- [ ] **Step 1:** Push `release/unified`; open PR "feat(v2): unified main (#48)" replacing #57; all CI jobs `SUCCESS`.
- [ ] **Step 2:** Merge (merge commit); close #56, #57, #45, #52, #53 with explanatory comments; tag `v2.0-submission`.

### Task 7: GitHub alignment
- [ ] **Step 1:** Update Project items and issue states per the verified WBS status (see minutes), create issue P8 for ONNX calibration, comment on #51/#7.

### Task 8: Documents
- [ ] **Step 1:** Rewrite 01, 02, 03 (`risks.json`), 04, 05 and minutes 06 from the final tree; rebuild outputs into `~/Downloads/TravelAI_QLDA_Nop_bai/`; produce the form lookup sheet.
