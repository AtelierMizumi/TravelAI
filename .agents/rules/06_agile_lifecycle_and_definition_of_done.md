# 📈 AGILE LIFECYCLE & DEFINITION OF DONE
## RULESET 06: CADENCE EXECUTION & ACCEPTANCE CRITERIA ENFORCEMENT

> **ID**: `TAGF-RULE-006`  
> **Scope**: Sprint coordination, GitHub Project Board #2 status transitions, DoR & DoD standards.

---

## 1. DEFINITION OF READY (DoR)

A WBS work package may only transition from `Todo` to `In Progress` when it simultaneously satisfies four prerequisites:
1. **Unambiguous Scope**: Stated objective, deliverables, and boundary in the issue.
2. **Measurable Acceptance Criteria**: At least two verifiable pass/fail conditions.
3. **Dependencies Resolved**: Upstream work packages completed or mock stubs provided.
4. **Engineer Assigned**: Strictly routed to the designated engineer (Thuận, Đức, or Ngọc).

---

## 2. DEFINITION OF DONE (DoD)

A WBS work package may only transition to `Done` and close its linked GitHub Issue when the following checklist is 100% satisfied:

```markdown
- [ ] Code conforms to Clean Layered Architecture conventions
- [ ] Zero office/binary files (*.docx, *.xlsx, *.pdf) staged or committed
- [ ] Zero lingering debug logs (console.log, print, System.out.println)
- [ ] API endpoints return schema-compliant JSON with RFC 7807 error formatting
- [ ] Local build and execution verification successfully passed
- [ ] Conventional Commit authored with Issue ID reference: `<type>(<scope>): <desc> (#<id>)`
- [ ] Card on GitHub Project Board #2 transitioned to "Done" column
- [ ] Linked GitHub Issue officially closed with resolution note
```

---

## 3. WEEKLY SPRINT SESSION PROTOCOL (1 SESSION / WEEK: 4-6 HOURS)

When executing weekly focused development sessions, the team follows a synchronized 4-phase protocol:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WEEKLY 4-PHASE SPRINT PROTOCOL                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: SYNC-UP & TASK CLAIMING (00:00 - 00:15)                            │
│ - Open Project #2: https://github.com/users/AtelierMizumi/projects/2        │
│ - Confirm current sprint tasks in "Todo"                                    │
│ - Drag assigned work packages to "In Progress"                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: DEEP WORK & CODING (00:15 - 03:30)                                 │
│ - Checkout branch: git checkout -b feat/wbs-<id>-<slug>                     │
│ - Implement features, write unit tests, verify local runtime                │
│ - Enforce zero office/binary file hygiene                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: CODE REVIEW & MERGE (03:30 - 04:00)                                │
│ - Push branch: git push -u origin feat/wbs-...                              │
│ - Create Pull Request with (#<issue_id>)                                    │
│ - Cross-peer review, verify DoD, merge into main                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: WRAP-UP & PROJECT SYNC (04:00 - 04:15)                             │
│ - Transition Project #2 card to "Done"                                      │
│ - Verify linked issue is automatically closed                               │
│ - Record sprint milestone progress                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 6-SPRINT PRODUCTION SCHEDULE & TRACEABILITY MATRIX

### 🔹 Sprint 1 (Weeks 1 - 2): Initiation & Architecture
- [x] `[WBS 1.1.1]` Project Initiation & Requirements (Trần Minh Thuận) -> **Issue #1 (Closed)**
- [x] `[WBS 1.1.2]` Microservice Architecture Design (Trần Minh Thuận) -> **Issue #2 (Closed)**
- [ ] `[WBS 1.1.3]` Relational DB Schema & PostgreSQL (Hoàng Văn Đức) -> **Issue #3**

### 🔹 Sprint 2 (Weeks 3 - 4): Auth & AI Microservice Foundation *(Current Sprint)*
- [ ] `[WBS 1.2.1]` User Registration & Login (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #4**
- [ ] `[WBS 1.2.2]` User Profile & JWT Security (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #5**
- [ ] `[WBS 1.3.1]` Image Upload & Preprocessing Pipeline (Trần Minh Thuận) -> **Issue #6**
- [ ] `[WBS 1.3.2]` FastAPI AI Microservice Engine (Trần Minh Thuận) -> **Issue #7**

### 🔹 Sprint 3 (Weeks 5 - 6): AI Vision & Destination Discovery
- [ ] `[WBS 1.3.3]` Google Cloud Vision API Integration (Trần Minh Thuận) -> **Issue #8**
- [ ] `[WBS 1.3.4]` AI Recognition Results Interface (Lê Văn Ngọc) -> **Issue #9**
- [ ] `[WBS 1.5.1]` Travel Destination Discovery & Search (Lê Văn Ngọc FE + Hoàng Văn Đức BE) -> **Issue #10**

### 🔹 Sprint 4 (Weeks 7 - 8): Reviews, Booking & Admin Portal *(100% Core MVP)*
- [ ] `[WBS 1.4.3]` Community Review & Rating System (Lê Văn Ngọc) -> **Issue #11**
- [ ] `[WBS 1.5.4]` Tour / Hotel Reservation & Payment (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #12**
- [ ] `[WBS 1.6.1]` Executive Admin Dashboard (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #13**
- [ ] `[WBS 1.6.2]` User & Access Management (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #14**
- [ ] `[WBS 1.6.3]` Landmark & Place Catalog Management (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #15**

### 🔹 Sprint 5 (Weeks 9 - 10): Social Feed, Realtime Chat & Catalog Expansion
- [ ] `[WBS 1.4.1]` Travel Story Posting & Feed (Lê Văn Ngọc FE + Hoàng Văn Đức BE) -> **Issue #16**
- [ ] `[WBS 1.4.2]` Like / Comment / Follow Interactions (Lê Văn Ngọc) -> **Issue #17**
- [ ] `[WBS 1.4.4]` Real-time WebSocket STOMP Chat (Hoàng Văn Đức BE + Lê Văn Ngọc FE) -> **Issue #18**
- [ ] `[WBS 1.5.2]` Tour Package Catalog & Itinerary (Lê Văn Ngọc) -> **Issue #19**
- [ ] `[WBS 1.5.3]` Hotel Catalog & Room Showcase (Lê Văn Ngọc) -> **Issue #20**
- [ ] `[WBS 1.6.4]` Reservation Booking Admin Portal (Hoàng Văn Đức) -> **Issue #21**
- [ ] `[WBS 1.6.5]` Content Moderation & Platform Config (Lê Văn Ngọc UI + Hoàng Văn Đức BE) -> **Issue #22**

### 🔹 Sprint 6 (Weeks 11 - 12): QA, Load Testing, Docker & Cloud Release
- [ ] `[WBS 1.7.1]` Cross-Service End-to-End Integration Testing (All Engineers) -> **Issue #23**
- [ ] `[WBS 1.7.2]` Performance, Load & Security Hardening (All Engineers) -> **Issue #24**
- [ ] `[WBS 1.7.3]` Multi-Container Docker Cloud Deployment (Trần Minh Thuận) -> **Issue #25**
