# 💻 TECHNICAL ARCHITECTURE & CODE STANDARDS
## RULESET 05: ENTERPRISE TECH STACK SPECIFICATIONS

> **ID**: `TAGF-RULE-005`  
> **Scope**: Java, Python, JavaScript/React, Dockerfile, SQL source code.

---

## 1. FRONTEND QUALITY STANDARDS (REACT 18 + VITE)

- **Runtime & Tooling**: React 18+, Vite, modern ES6+ / JSX.
- **Styling & UI Tokens**: TailwindCSS utility framework with curated design tokens, Lucide React Icons.
- **Directory Layout (`client/src/`)**:
  ```text
  client/src/
  ├── components/       # Reusable Atomic UI Elements (Button, Modal, Card, Navbar)
  ├── pages/            # Top-level Route Views (Home, Recognize, Places, Booking)
  ├── services/         # HTTP Clients (Axios instance, interceptors, API endpoints)
  ├── hooks/            # Custom React Hooks
  ├── context/          # Global Context Providers (AuthContext, CartContext, ThemeContext)
  └── utils/            # Pure helpers and formatters (currency, date-time, string)
  ```
- **Code Standards**:
  - API URLs MUST be sourced from `import.meta.env.VITE_API_BASE_URL`.
  - Component states MUST handle all three operational conditions: `loading` (Skeleton Loader), `error` (Toast Notification / Error Boundary), and `success`.
  - Zero debug `console.log` statements permitted in committed code.

---

## 2. CORE BACKEND QUALITY STANDARDS (JAVA SPRING BOOT 3)

- **Runtime & Framework**: Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security 6.
- **Layered Clean Architecture**:
  ```text
  Controller Layer  -->  Service Layer (Interface + Impl)  -->  Repository Layer (JPA)  -->  Entity Layer
          │                       │
          ▼                       ▼
     DTO (Request/Response)  Custom Business Exceptions
  ```
- **Enterprise Authentication, Token Lifecycle & Security Invariants**:
  - **Refresh Token Rotation (RTR)**: The `/api/v1/auth/refresh` endpoint MUST enforce single-use token rotation. Upon validating an existing refresh token, the system MUST revoke/delete the old token, persist a newly generated refresh token, and return both access and refresh tokens. Stolen refresh tokens must not remain reusable.
  - **Zero Credential / Token Material Leakage**: Exceptions (e.g., `TokenRefreshException`), RFC 7807 `detail` payloads, and logs MUST NEVER echo raw refresh tokens, bearer tokens, or hashed credentials. Always return clean, generic error messages.
  - **Active Account Status Check**: Both `refreshToken()` and `JwtAuthenticationFilter` MUST actively verify `user.isEnabled()`. If `enabled == false`, access must be blocked immediately (HTTP 400/401/403) to prevent disabled/banned accounts from continuing to issue or use tokens.
  - **Endpoint Authorization Granularity**: Never use blanket wildcard `permitAll()` on auth namespaces (e.g. `/api/v1/auth/**`). Explicitly whitelist only public endpoints (`/register`, `/login`, `/refresh`), and mandate authentication on sensitive endpoints such as `/logout`.
  - **Enterprise CORS Policy**: When `allowCredentials(true)` is enabled, the CORS policy MUST NOT use wildcard `*` or reflective `allowedOriginPatterns("*")`. Allowed origins must be restricted to an explicit trusted list (`app.cors.allowed-origins` configured in `application.yml`).
  - **Data Normalization Before Lookups & Uniqueness Checks**: Usernames must be `.trim()`, and emails must be `.trim().toLowerCase()` BEFORE invoking uniqueness checks (`existsByUsername`, `existsByEmail`) and before database persistence to prevent unique constraint race crashes (HTTP 500). Authentication queries by email must normalize input to lowercase or use case-insensitive SQL matching.
- **Global Exception Handling & RFC 7807 Problem Details**:
  - All exceptions intercepted via `@RestControllerAdvice`.
  - All Problem Details responses emitted by `@RestControllerAdvice`, `AuthenticationEntryPoint`, and `AccessDeniedHandler` MUST declare `Content-Type: application/problem+json` (as standardized in RFC 7807).
  - Return JSON error payloads adhering to **RFC 7807 Problem Details**:
    ```json
    {
      "type": "https://travelai.vn/errors/bad-request",
      "title": "Invalid Input Data",
      "status": 400,
      "detail": "Email already registered in system.",
      "instance": "/api/v1/auth/register",
      "timestamp": "2026-09-27T10:00:00Z"
    }
    ```
- **Database Query Optimization & Integrity Standards**:
  - Eliminate N+1 query antipatterns using `@EntityGraph` or `JOIN FETCH`.
  - Enforce database indexing on frequently filtered columns (`name`, `province`, `category_id`, `user_id`).
  - Every `@OneToOne` association in JPA entities MUST be enforced with an explicit `UNIQUE` constraint on the corresponding foreign key column in PostgreSQL DDL (e.g. `CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)`).
  - Production database configuration in `application.yml` MUST use `ddl-auto: validate` (never `update`).
  - Sensitive credentials (passwords, JWT secrets) in `application.yml` MUST NOT provide hardcoded fallback defaults for production deployment.
- **Automated Testing Coverage**:
  - All authentication and security endpoints (`/register`, `/login`, `/refresh`, `/logout`) must be covered by integration tests in `AuthControllerTest`, verifying both happy paths and negative test cases (expired token, disabled user, invalid credentials, duplicate conflicts, RFC 7807 content-type).

---

## 3. AI MICROSERVICE STANDARDS (PYTHON FASTAPI)

- **Runtime & Tooling**: Python 3.11+, FastAPI, Pydantic v2.
- **Image Processing Pipeline**:
  - Ingest multipart files via `UploadFile = File(...)`.
  - Validate MIME types (`image/jpeg`, `image/png`, `image/webp`) and limit payloads to `< 10MB` in memory streams.
  - Utilize `Pillow` / `OpenCV` to normalize dimensions (e.g., maximum width 1920px) before invoking Google Cloud Vision API to minimize latency and bandwidth.
- **Google Cloud Vision API Client**:
  - Initialize singleton client: `vision.ImageAnnotatorClient()`.
  - Enforce a 5.0-second timeout budget; if timeout occurs, trigger web-detection fallback or return an error payload safely **without crashing the worker process**.

---

## 4. CONTAINERIZATION & DOCKER COMPOSE

- Every service (`client`, `services/core`, `services/ai`) must provide a multi-stage `Dockerfile` leveraging minimal base images (`alpine` or `slim`).
- The root `docker-compose.yml` must orchestrate all four containers with a single command:
  ```bash
  docker compose up -d
  ```
- Enforce service dependency ordering using PostgreSQL `healthcheck` before launching Core Backend.
