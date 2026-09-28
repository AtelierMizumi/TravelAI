# AI Agent Directives & Operational Rules - TravelAI
## TRAVELAI AGENT GOVERNANCE FRAMEWORK (TAGF-v2.0)

> **Mandatory Status**: Enforced for all AI agents, subagents, and automated tooling operating within the `TravelAI` workspace.  
> **Detailed Modular Governance**: See [`.agents/rules/`](.agents/rules).

---

## 🚨 6 IMMUTABLE OPERATIONAL INVARIANTS

1. **Clean-Room Source Hygiene & Zero-Leakage Quarantine**:
   - **STRICTLY PROHIBITED** to `git add`, `commit`, or `push` any binary or office document files: `*.docx`, `*.doc`, `*.xlsx`, `*.xls`, `*.ods`, `*.pdf`, `*.pptx`, `*.csv`.
   - The reference directory `local_references/` (including `legacy_source/`, `legacy_specs/`, `learning_materials/`) is a local-only quarantine zone and **MUST REMAIN PERMANENTLY GITIGNORED**. Never index or commit it.
   - Always run and inspect `git status` prior to committing to ensure zero untracked garbage.
   - *References*: [01_provenance_quarantine_and_persona.md](.agents/rules/01_provenance_quarantine_and_persona.md) & [04_file_hygiene_and_repository_purity.md](.agents/rules/04_file_hygiene_and_repository_purity.md).

2. **Enterprise From-Scratch Persona**:
   - All code, configuration, and documentation must reflect a clean, professionally engineered system developed from scratch.
   - **NEVER LEAK** any indicators of university coursework, retrofitting, or legacy reports.
   - Banned terminology: "course project", "báo cáo đồ án", "đồ án chuyên ngành", "nộp tuần 3", "thầy cô", "từ file docx".
   - *References*: [01_provenance_quarantine_and_persona.md](.agents/rules/01_provenance_quarantine_and_persona.md).

3. **3-Engineer Team Topology & Scope Boundaries (RACI Matrix)**:
   - The platform is developed by three specialized software engineers:
     - **Trần Minh Thuận** *(User)*: Tech Lead, AI & Integration Architect, PM - GitHub: `@AtelierMizumi`, Git: `Minh Thuận Trần <thuanc177@gmail.com>`.
     - **Hoàng Văn Đức**: Core Backend & Database Engineer - GitHub: `@duchayslay`, Git: `Hoàng Văn Đức <hoangvanduc290805@gmail.com>`.
     - **Lê Văn Ngọc**: Frontend & UI/UX Specialist - GitHub: `@ngoctapcodee`, Git: `Lê Văn Ngọc <ngoc492005@gmail.com>`.
   - When executing work on behalf of Trần Minh Thuận, **STRICTLY RESTRICT** modifications to Thuận's authorized WBS packages:
     - `1.1.1`, `1.1.2`: Architecture, Requirements, and Contracts.
     - `1.3.1`, `1.3.2`, `1.3.3`: AI Vision Subsystem (FastAPI, Image Preprocessing, Google Cloud Vision SDK).
     - `1.7.3`: Docker, Docker Compose & CI/CD Cloud Deployment.
   - Do NOT autonomously execute or overwrite work belonging to Đức (Backend DB) or Ngọc (Frontend) unless explicitly requested to simulate their contributions.
   - *References*: [02_team_topology_and_role_boundaries.md](.agents/rules/02_team_topology_and_role_boundaries.md).

4. **Realistic Commit Authorship & Temporal Simulation Engine**:
   - The agent **NEVER CLAIMS** commit authorship. Commits always belong to the user (`Minh Thuận Trần <thuanc177@gmail.com>`) or fellow team members when simulating.
   - Emulate realistic human working cadence: **1 weekly focus session (4-6 hours) on weekends** or developer working hours (09:30 - 22:30).
   - 12-Week Production Schedule across 6 Sprints:
     - Sprint 1: `2026-09-07` - `2026-09-20`
     - Sprint 2: `2026-09-21` - `2026-10-04`
     - Sprint 3: `2026-10-05` - `2026-10-18`
     - Sprint 4: `2026-10-19` - `2026-11-01`
     - Sprint 5: `2026-11-02` - `2026-11-15`
     - Sprint 6: `2026-11-16` - `2026-11-29`
   - Use Conventional Commits 1.0.0 with mandatory Issue ID binding: `<type>(<scope>): <summary> (#<issue_id>)`.
   - *References*: [03_git_governance_and_temporal_engine.md](.agents/rules/03_git_governance_and_temporal_engine.md).

5. **Technical Architecture & Code Standards**:
   - **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Axios.
   - **Core Backend**: Java 17+, Spring Boot 3, Spring Data JPA, Spring Security 6, JWT, PostgreSQL 16. Error standard RFC 7807 Problem Details.
   - **AI Microservice**: Python 3.11+, FastAPI, Pydantic v2, Google Cloud Vision SDK, Pillow/OpenCV.
   - **Containerization**: Multi-stage Dockerfiles, root `docker-compose.yml` orchestrating all 4 containers.
   - *References*: [05_technical_architecture_and_code_standards.md](.agents/rules/05_technical_architecture_and_code_standards.md).

6. **Acceptance Criteria & Sprint Lifecycle (DoR & DoD)**:
   - Strictly enforce Definition of Ready (DoR) and Definition of Done (DoD).
   - Synchronize completed work packages on [GitHub Project Board #2](https://github.com/users/AtelierMizumi/projects/2) by moving cards to `Done` and closing linked issues.
   - *References*: [06_agile_lifecycle_and_definition_of_done.md](.agents/rules/06_agile_lifecycle_and_definition_of_done.md).
