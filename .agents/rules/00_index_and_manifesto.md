# 🛡️ TRAVELAI AGENT GOVERNANCE FRAMEWORK (TAGF-v2.0)
## MASTER ARCHITECTURE & OPERATIONAL INVARIANTS

> **Classification**: TOP-TIER ENTERPRISE SOFTWARE ENGINEERING STANDARD  
> **Target System**: TravelAI Platform (Monorepo Multi-Service Ecosystem)  
> **Effective Date**: Autumn Semester 2026 (12-Week Agile Cadence)  
> **Authoring Entity**: Office of the Tech Lead (Trần Minh Thuận)

---

## 1. PREAMBLE & CORE PHILOSOPHY

The **TravelAI Agent Governance Framework (TAGF)** establishes immutable, mathematically rigorous, and structurally unyielding operational standards for all automated coding agents, AI pair programmers, and technical contributors working within the TravelAI repository.

Every contribution, line of code, architectural artifact, commit message, and system diagram MUST adhere to the principle of **Zero-Sloppiness, Absolute Authenticity, and Enterprise Scalability**. Under no circumstance shall the repository reflect academic, makeshift, or retrofitted project artifacts.

---

## 2. PRECEDENCE HIERARCHY & COMPLIANCE PYRAMID

When resolving operational conflicts or ambiguity during task execution, the following strict precedence hierarchy applies in descending order:

```
┌────────────────────────────────────────────────────────┐
│ LEVEL 0: IMMUTABLE SAFETY & HYGIENE INVARIANTS         │
│ (Zero office/binary files, Quarantine legacy assets)   │
├────────────────────────────────────────────────────────┤
│ LEVEL 1: USER DIRECTIVES & ROLE BOUNDARIES             │
│ (Trần Minh Thuận's personal WBS scope enforcement)     │
├────────────────────────────────────────────────────────┤
│ LEVEL 2: TEMPORAL PACING & GIT GOVERNANCE              │
│ (Realistic timestamps, Conventional Commits, No bot ID)│
├────────────────────────────────────────────────────────┤
│ LEVEL 3: ARCHITECTURAL & CODE STANDARDS                │
│ (Spring Boot 3, FastAPI, React 18, PostgreSQL 16)      │
├────────────────────────────────────────────────────────┤
│ LEVEL 4: SPRINT LIFECYCLE & DEFINITION OF DONE         │
│ (WBS 1.1.1 - 1.7.3, GitHub Project #2 sync)            │
└────────────────────────────────────────────────────────┘
```

---

## 3. FRAMEWORK MODULE DIRECTORY

The governance rules are modularized into seven specialized sub-frameworks (all referenced via portable relative paths):

| Module File | Domain | Core Enforcements |
|---|---|---|
| [`01_provenance_quarantine_and_persona.md`](./01_provenance_quarantine_and_persona.md) | **Provenance & Persona** | Total quarantine of legacy reports, zero leak of school context, authentic startup/enterprise persona. |
| [`02_team_topology_and_role_boundaries.md`](./02_team_topology_and_role_boundaries.md) | **Team & Scope** | 3-member RACI matrix, strict isolation of Trần Minh Thuận's tasks, peer delegation rules. |
| [`03_git_governance_and_temporal_engine.md`](./03_git_governance_and_temporal_engine.md) | **Git & Timeline** | Temporal simulation engine, human-paced commits, Conventional Commits 1.0.0, zero-bot attribution. |
| [`04_file_hygiene_and_repository_purity.md`](./04_file_hygiene_and_repository_purity.md) | **File Hygiene** | Absolute ban on `.docx`, `.xlsx`, `.pdf`; directory sanitation; pre-commit verification protocol. |
| [`05_technical_architecture_and_code_standards.md`](./05_technical_architecture_and_code_standards.md) | **Tech Standards** | Spring Boot 3, FastAPI, React 18, PostgreSQL 16, RFC 7807 error format, Docker orchestration. |
| [`06_agile_lifecycle_and_definition_of_done.md`](./06_agile_lifecycle_and_definition_of_done.md) | **Agile & DoD** | 1 session/week (4-6h) sprint cadence, Definition of Ready, Definition of Done, Issue closing. |
| [`07_autonomous_session_orchestration.md`](./07_autonomous_session_orchestration.md) | **Autonomous Sessions** | 1-Prompt Sprint State Machine (Phases 1-7), RACI firewall, and Tech Lead review gatekeeper. |

---

## 4. AGENT SELF-CHECK INVARIANT BEFORE EVERY ACTION

Before emitting any response, executing any command, or staging any code file, the agent MUST evaluate the following four Boolean assertions:
1. `Assert(no_office_or_binary_files_staged == True)`
2. `Assert(target_wbs_package in authorized_user_scope == True)`
3. `Assert(commit_author != "Agent" and commit_author in engineering_team == True)`
4. `Assert(no_mention_of_school_or_legacy_report == True)`

If ANY assertion evaluates to `False`, the agent MUST abort the action and correct the state immediately.
