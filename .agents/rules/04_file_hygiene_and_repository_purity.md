# 🧹 FILE HYGIENE & REPOSITORY PURITY
## RULESET 04: STRICT BINARY EXCLUSION & CLEAN DIRECTORY TAXONOMY

> **ID**: `TAGF-RULE-004`  
> **Scope**: Git index configuration, .gitignore, workspace filesystem layout, media assets.

---

## 1. IMMUTABLE INVARIANT: ZERO OFFICE / BINARY DOCUMENTS IN GIT

### 1.1. Explicit File Extension Blacklist
Any file matching the following patterns appearing in `git status` (staged or untracked) represents a critical safety violation:

```text
*.docx, *.doc       # Microsoft Word Documents
*.xlsx, *.xls       # Microsoft Excel Spreadsheets
*.ods, *.odt        # OpenDocument Spreadsheets & Texts
*.pdf               # PDF Reports / Presentations
*.pptx, *.ppt       # PowerPoint Slides
*.csv               # Raw uncompressed CSV dumps (use database seeders instead)
*.zip, *.rar, *.tar # Archive files (unless explicitly configured binary test fixtures)
*.jar, *.war        # Compiled Java binaries (built inside Docker / CI only)
*.pyc, *.pyo        # Compiled Python bytecode
```

### 1.2. Recovery Protocol If Blacklisted Files Are Tracked
If a blacklisted document or binary is inadvertently indexed:
```bash
# 1. Unstage immediately without deleting local file on disk
git rm -rf --cached <path-to-file-or-dir>

# 2. Verify .gitignore rule presence
grep -q "<pattern>" .gitignore || echo "<pattern>" >> .gitignore

# 3. Verify clean index status
git status
```

---

## 2. ENTERPRISE REPOSITORY DIRECTORY LAYOUT

The TravelAI codebase is organized as a clean **Multi-Service Monorepo**:

```text
TravelAI/
├── .agents/                    # Agent Governance & Rules System
│   └── rules/                  # Modular TAGF-v2.0 Rulebooks (00 through 06)
├── .github/                    # GitHub Workflows (CI/CD), PR & Issue Templates
├── client/                     # High-Performance Frontend SPA (React 18 + Vite)
├── services/
│   ├── ai/                     # AI Microservice (Python 3.11 + FastAPI + Vision SDK)
│   └── core/                   # Core Business Backend (Java 17 + Spring Boot 3)
├── docs/                       # Technical Markdown Documentation
│   ├── architecture/           # System Architecture, Sequence Diagrams, API Contracts
│   └── specs/                  # Software Requirements Specification (SRS)
├── .gitignore                  # Comprehensive Multi-Stack Exclusion Filter
├── AGENTS.md                   # Supreme Agent Operational Directives
├── COLABORATION.md             # 3-Engineer Collaboration Guidebook (1 session/week)
├── docker-compose.yml          # Local 4-Container Orchestration (db, ai, core, client)
└── README.md                   # Central Technical Dashboard & Showcase
```

---

## 3. MEDIA ASSET CONVENTIONS

- Static UI assets must reside strictly within `client/public/` or `client/src/assets/`.
- Permitted formats: `.svg` (vector icons & logos), `.webp` (compressed travel hero photography), optimized `.png`.
- Single asset file size budget: `< 500 KB` per image to avoid Git LFS bloat.
