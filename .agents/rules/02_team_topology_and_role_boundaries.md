# 👥 TEAM TOPOLOGY & ROLE BOUNDARY ENFORCEMENT
## RULESET 02: 3-ENGINEER RACI MATRIX & PERSONAL SCOPE ISOLATION

> **ID**: `TAGF-RULE-002`  
> **Scope**: Work package allocation, WBS ownership, commit authorship attribution, review routing.

---

## 1. ENGINEERING TEAM TOPOLOGY

The TravelAI engineering team consists of three specialized software engineers:

| Engineer | Title & Specialization | GitHub Handle | Git Identity | Architectural Ownership |
|---|---|---|---|---|
| **Trần Minh Thuận** *(User)* | **Tech Lead, AI & Integration Architect, PM** | `@AtelierMizumi` | `Minh Thuận Trần <thuanc177@gmail.com>` | System Architecture, Sprint Orchestration, FastAPI AI Microservice, Google Cloud Vision SDK, Docker & Cloud DevOps. |
| **Hoàng Văn Đức** | **Core Backend & Database Engineer** | `@duchayslay` | `Hoàng Văn Đức <hoangvanduc290805@gmail.com>` | Java Spring Boot 3 Core, PostgreSQL Schema & DDL, JWT Auth & RBAC Security, Booking Engine, WebSocket Chat Backend. |
| **Lê Văn Ngọc** | **Frontend & UI/UX Specialist** *(Platform Author)* | `@ngoctapcodee` | `Lê Văn Ngọc <ngoc492005@gmail.com>` | React 18 SPA + Vite, TailwindCSS Design System, AI Recognition UI, Travel Discovery, Community Reviews & Social Feed. |

---

## 2. COMPREHENSIVE RACI MATRIX (25 WORK PACKAGES)

> **RACI Definitions**:  
> - **R (Responsible)**: The engineer who authors, tests, and commits the implementation.  
> - **A (Accountable)**: The Tech Lead (Trần Minh Thuận) who conducts code review and approves merge.  
> - **C (Consulted)**: Domain specialist consulted for interface contract alignment.  
> - **I (Informed)**: Team members notified upon feature completion.

| WBS ID | Work Package | Module | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|---|---|---|---|---|---|---|
| `1.1.1` | Project Initiation & Requirements | Initiation | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Whole Team |
| `1.1.2` | System Architecture Design | Initiation | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.1.3` | Relational DB Schema & Modeling | Initiation | **Hoàng Văn Đức** | Thuận | Thuận | Ngọc |
| `1.2.1` | User Registration & Auth | Auth/Security | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.2.2` | User Profile & JWT Security | Auth/Security | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.3.1` | Image Upload & Preprocessing | AI Vision | **Trần Minh Thuận** | Thuận | Ngọc | Đức |
| `1.3.2` | FastAPI AI Microservice | AI Vision | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.3.3` | Google Cloud Vision API Integration| AI Vision | **Trần Minh Thuận** | Thuận | Đức | Ngọc |
| `1.3.4` | AI Recognition Results UI | AI Vision | **Lê Văn Ngọc** | Thuận | Thuận | Đức |
| `1.4.1` | Travel Story Posting & Feed | Social | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.4.2` | Like / Comment / Follow Engine | Social | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.4.3` | Review & Rating System | Social | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.4.4` | Real-time WebSocket Chat | Social | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.5.1` | Destination Discovery & Search | Travel | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.5.2` | Tour Catalog & Detail Views | Travel | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.5.3` | Hotel Catalog & Detail Views | Travel | **Ngọc** (FE) + **Đức** (BE) | Thuận | Thuận | Whole Team |
| `1.5.4` | Booking & Payment Flow | Travel | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.6.1` | Executive Admin Dashboard | Admin | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.6.2` | User & Role Management | Admin | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.6.3` | Landmark & Place Catalog Admin | Admin | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.6.4` | Booking Reservation Admin | Admin | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.6.5` | Content Moderation & Settings | Admin | **Đức** (BE) + **Ngọc** (FE) | Thuận | Thuận | Whole Team |
| `1.7.1` | Cross-Service Integration Testing | QA/DevOps | **All Engineers** | Thuận | Thuận | Whole Team |
| `1.7.2` | Performance, Load & Sec Testing | QA/DevOps | **All Engineers** | Thuận | Thuận | Whole Team |
| `1.7.3` | Cloud Deployment & Docker Release| QA/DevOps | **Trần Minh Thuận** | Thuận | Đức, Ngọc | Whole Team |

---

## 3. STRICT ISOLATION OF TRẦN MINH THUẬN'S WORK SCOPE

1. **Authorized Work Scope for User**:
   - When executing coding tasks for Trần Minh Thuận, the agent is **STRICTLY RESTRICTED** to packages assigned to Thuận:
     - `1.1.1`, `1.1.2`: Architecture, Requirements, and Contracts.
     - `1.3.1`, `1.3.2`, `1.3.3`: AI Vision Pipeline, FastAPI Microservice, Google Cloud Vision SDK.
     - `1.7.3`: Docker, Docker Compose, CI/CD Cloud Deployment.
2. **Non-Interference Invariant**:
   - The agent MUST NOT autonomously generate, modify, or commit code for Hoàng Văn Đức's Core Backend / Database tasks or Lê Văn Ngọc's Frontend tasks unless explicitly commanded by the user with peer simulation instructions.
