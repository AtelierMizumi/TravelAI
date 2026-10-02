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

## 2. DEFINITION OF DONE (DoD) & REGULATORY COMPLIANCE GATES

A WBS work package may only transition to `Done` and close its linked GitHub Issue when the following checklist is 100% satisfied:

```markdown
- [ ] Code conforms to Clean Layered Architecture & Separation of Concerns
- [ ] Zero office/binary files (*.docx, *.xlsx, *.pdf, *.csv) staged or committed (Quarantine Isolation)
- [ ] Zero lingering debug logs (console.log, print, System.out.println, printStackTrace)
- [ ] API endpoints return schema-compliant JSON with RFC 9457 / RFC 7807 error formatting (`Content-Type: application/problem+json`)
- [ ] Zero credential, token material, or sensitive internal trace leakage in error responses or logs (OWASP ASVS V8)
- [ ] OAuth 2.0 Security BCP compliance: Refresh Token Rotation (RTR), single-use invalidation, and account enabled status enforcement
- [ ] Strict CORS security: explicit origin allowlist, zero wildcard `*` with `Allow-Credentials: true` (OWASP API8)
- [ ] Input canonicalization & validation: pre-check string trimming, lowercase email normalization, strict DTO binding (OWASP API3)
- [ ] Database schema purity: explicit UNIQUE constraints on 1-to-1 relationships, foreign key indexing, production `ddl-auto: validate`
- [ ] Local build and execution verification successfully passed (`./mvnw clean test`, `npm run build`, `pytest`)
- [ ] Comprehensive unit and integration test coverage for authentication, authorization, and business logic
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

## 4. 6-SPRINT PRODUCTION SCHEDULE & TRACEABILITY MATRIX (TAGF-v2.0)

### 🔹 Sprint 1 (Weeks 1 - 2): Initiation, Cloud Foundation & Database Schema
*Schedule: 2026-09-07 to 2026-09-20 | Lead: Trần Minh Thuận*
- [x] `[WBS 1.1.1]` Đặc tả yêu cầu & phạm vi doanh nghiệp (SRS) (Trần Minh Thuận) -> **Issue #1 (Closed)**
- [x] `[WBS 1.1.2]` Thiết kế kiến trúc Microservices & AI Gateway (Trần Minh Thuận) -> **Issue #2 (Closed)**
- [x] `[WBS 1.1.3]` Mô hình dữ liệu & Kịch bản CSDL PostgreSQL Enterprise (Trần Minh Thuận) -> **Issue #3 (Closed)**
- [ ] `[WBS 1.2.1]` Module xác thực bảo mật doanh nghiệp (JWT/OAuth2) (Hoàng Văn Đức) -> **Issue #4**
- [ ] `[WBS 1.2.2]` Giao diện & API Hồ sơ cá nhân (User Profile Service) (Lê Văn Ngọc) -> **Issue #5**

### 🔹 Sprint 2 (Weeks 3 - 4): Core AI Service & Location Discovery *(Current Sprint)*
*Schedule: 2026-09-21 to 2026-10-04 | Lead: Hoàng Văn Đức*
- [ ] `[WBS 1.3.1]` Giao diện tiếp nhận & Bộ tiền xử lý ảnh (Image Preprocessor) (Trần Minh Thuận) -> **Issue #6**
- [ ] `[WBS 1.3.2]` Dịch vụ AI nhận diện địa danh (FastAPI & Google Vision Cloud) (Trần Minh Thuận) -> **Issue #7**
- [ ] `[WBS 1.3.3]` Giao diện hiển thị kết quả & Gợi ý dịch vụ thông minh (Lê Văn Ngọc) -> **Issue #8**
- [ ] `[WBS 1.4.1]` Giao diện & API Khám phá địa điểm du lịch (Location Discovery) (Lê Văn Ngọc) -> **Issue #9**
- [ ] `[WBS 1.7.2]` Module quản lý danh mục địa danh du lịch (Location Management) (Hoàng Văn Đức) -> **Issue #18**

### 🔹 Sprint 3 (Weeks 5 - 6): Travel Catalog & Core Administration
*Schedule: 2026-10-05 to 2026-10-18 | Lead: Lê Văn Ngọc*
- [ ] `[WBS 1.4.2]` Module thông tin Tour du lịch (Tour Catalog Service) (Hoàng Văn Đức) -> **Issue #10**
- [ ] `[WBS 1.4.3]` Module thông tin Khách sạn & Lưu trú (Hotel Catalog Service) (Hoàng Văn Đức) -> **Issue #11**
- [ ] `[WBS 1.7.1]` Bảng điều khiển tổng quan quản trị (Admin Analytics Dashboard) (Lê Văn Ngọc) -> **Issue #17**
- [ ] `[WBS 1.7.3]` Module quản lý dịch vụ Khách sạn & Tour (Partner Services) (Hoàng Văn Đức) -> **Issue #19**
- [ ] `[WBS 1.7.4]` Module quản trị tài khoản người dùng & Phân quyền (RBAC Admin) (Hoàng Văn Đức) -> **Issue #20**

### 🔹 Sprint 4 (Weeks 7 - 8): Reviews, Social Feed & Real-time Messaging
*Schedule: 2026-10-19 to 2026-11-01 | Lead: Trần Minh Thuận*
- [ ] `[WBS 1.6.1]` Module đánh giá địa danh & dịch vụ (Review & Rating Service) (Hoàng Văn Đức) -> **Issue #14**
- [ ] `[WBS 1.6.2]` Bảng tin chia sẻ trải nghiệm du lịch (Social Travel Feed) (Lê Văn Ngọc) -> **Issue #15**
- [ ] `[WBS 1.6.3]` Hệ thống tin nhắn trực tuyến qua WebSocket (Real-time Messaging) (Hoàng Văn Đức) -> **Issue #16**
- [ ] `[WBS 1.7.6]` Module kiểm duyệt nội dung & Cấu hình hệ thống (System Config) (Lê Văn Ngọc) -> **Issue #22**

### 🔹 Sprint 5 (Weeks 9 - 10): Booking & Online Payment Gateway
*Schedule: 2026-11-02 to 2026-11-15 | Lead: Hoàng Văn Đức*
- [ ] `[WBS 1.5.1]` Quy trình đặt dịch vụ & Cổng thanh toán trực tuyến (Booking & Payment) (Hoàng Văn Đức) -> **Issue #12**
- [ ] `[WBS 1.5.2]` Module quản lý lịch sử đặt chỗ & Hủy dịch vụ (My Bookings Portal) (Lê Văn Ngọc) -> **Issue #13**
- [ ] `[WBS 1.7.5]` Module quản lý đơn đặt chỗ & Đối soát giao dịch (Booking Audit) (Hoàng Văn Đức) -> **Issue #21**

### 🔹 Sprint 6 (Weeks 11 - 12): Automated Testing, Docker Packaging & Cloud Production Launch
*Schedule: 2026-11-16 to 2026-11-29 | Lead: Lê Văn Ngọc*
- [ ] `[WBS 1.8.1]` Bộ kịch bản & Kiểm thử tích hợp tự động (Integration & E2E Testing) (Lê Văn Ngọc) -> **Issue #23**
- [ ] `[WBS 1.8.2]` Đóng gói ứng dụng & Triển khai hạ tầng Cloud (AWS/Docker/CI-CD) (Trần Minh Thuận) -> **Issue #24**
