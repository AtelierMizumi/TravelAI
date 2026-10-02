# 💻 TECHNICAL ARCHITECTURE & ENTERPRISE SECURITY STANDARDS
## RULESET 05: ENTERPRISE TECH STACK & REGULATORY COMPLIANCE SPECIFICATIONS

> **ID**: `TAGF-RULE-005`  
> **Regulatory Baselines**:  
> - **IETF RFC 9457 / RFC 7807**: Problem Details for HTTP APIs  
> - **IETF RFC 6749 / RFC 8252 / OAuth 2.0 Security BCP (RFC 9700)**: Token Lifecycle & Rotation  
> - **OWASP ASVS v4.0.3**: Application Security Verification Standard (Levels 1 & 2)  
> - **OWASP API Security Top 10 (2023)**: API1 (BOLA), API2 (Auth), API3 (Mass Assignment), API4 (Resource Consumption), API8 (Security Misconfiguration)  
> - **NIST SP 800-63B**: Digital Identity Guidelines (Authentication & Lifecycle Management)  
> **Scope**: Java Spring Boot 3, Python FastAPI, React 18 / Vite, PostgreSQL 16, Docker Compose.

---

## 1. FRONTEND QUALITY & SECURITY STANDARDS (REACT 18 + VITE)

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
- **Security & Operational Invariants**:
  - **Environment-Driven Configuration**: API URLs MUST be sourced exclusively from `import.meta.env.VITE_API_BASE_URL`. Never hardcode hostnames or ports.
  - **Concurrency-Safe Token Refresh Queue (Axios Interceptors)**:
    - When receiving an HTTP 401 response, Axios interceptors MUST queue outgoing concurrent requests while a single refresh token request is executed.
    - Prevents race conditions where multiple parallel requests fire duplicate refresh calls, violating single-use Refresh Token Rotation (RTR).
  - **Cross-Site Scripting (XSS) Prevention (OWASP ASVS V5)**:
    - Never render unescaped user content via `dangerouslySetInnerHTML`. If rich text is required, sanitize with `DOMPurify` before DOM insertion.
  - **Deterministic UI States**: Component states MUST handle all three operational conditions: `loading` (Skeleton Loader), `error` (Toast Notification / RFC 7807 Error Normalizer), and `success`.
  - **Source Hygiene**: Zero debug `console.log` statements permitted in committed code.

---

## 2. CORE BACKEND QUALITY & SECURITY STANDARDS (JAVA SPRING BOOT 3)

- **Runtime & Framework**: Java 17+ (Java 21 LTS Recommended), Spring Boot 3.x, Spring Data JPA, Spring Security 6.
- **Layered Clean Architecture**:
  ```text
  Controller Layer  -->  Service Layer (Interface + Impl)  -->  Repository Layer (JPA)  -->  Entity Layer
          │                       │
          ▼                       ▼
     DTO (Request/Response)  Custom Business Exceptions
  ```

### 2.1. Enterprise Authentication & Session Lifecycle (OAuth 2.0 BCP & NIST SP 800-63B)
- **Refresh Token Rotation (RTR)**:
  - The `/api/v1/auth/refresh` endpoint MUST enforce strict single-use token rotation.
  - Upon validating an incoming token:
    1. The old token is immediately invalidated/deleted from persistence (`refreshTokenRepository.delete(token)` + explicit flush).
    2. A newly generated cryptographic token (minimum 128 bits entropy via `UUID` or `SecureRandom`) is persisted.
    3. Both the new Access Token and new Refresh Token are returned in the response payload.
  - **Token Reuse Detection**: If a previously rotated or revoked refresh token is presented, the system MUST consider the token family compromised, revoke all active sessions/tokens for that user, and log a security audit warning.
- **Active Account Status Guard (OWASP ASVS V3)**:
  - Both `/api/v1/auth/refresh` and `JwtAuthenticationFilter` MUST actively verify `user.isEnabled()`.
  - If `enabled == false`, all requests MUST be rejected immediately (HTTP 401/403/400) to ensure administrative bans take effect across all existing sessions.
- **Zero Credential / Token Material Leakage**:
  - Exceptions (e.g., `TokenRefreshException`, `BadCredentialsException`), logs, and RFC 9457/7807 `detail` fields MUST NEVER echo raw refresh tokens, bearer JWTs, or password hashes. Always return sanitized, generic error descriptions.
- **Strict Endpoint-Level Authorization**:
  - NEVER use blanket wildcard `permitAll()` on authentication namespaces (e.g. `/api/v1/auth/**`).
  - Explicitly whitelist only public unauthenticated entrypoints: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`.
  - Sensitive endpoints such as `/api/v1/auth/logout` MUST mandate active authentication (`.anyRequest().authenticated()`).

### 2.2. Enterprise CORS Policy (OWASP API8: Security Misconfiguration)
- **Zero Reflective Wildcards with Credentials**:
  - When `allowCredentials(true)` is enabled, the CORS policy MUST NOT use wildcard `*` or reflective `allowedOriginPatterns("*")`.
  - Allowed origins MUST be restricted to an explicit trusted allowlist (`http://localhost:3000`, `http://localhost:5173`, production domains) configured via `app.cors.allowed-origins` in `application.yml`.

### 2.3. Data Normalization & Mass Assignment Defense (OWASP ASVS V5 & API3)
- **Canonicalization Before Validation & Uniqueness Checks**:
  - Usernames must be `.trim()`, and emails must be `.trim().toLowerCase()` BEFORE invoking uniqueness lookups (`existsByUsername`, `existsByEmail`) and before persistence.
  - Authentication queries by email must normalize input to lowercase or use case-insensitive SQL matching (`LOWER(u.email)`).
- **Strict DTO Binding**:
  - Controller endpoints MUST bind to dedicated Request DTOs with Bean Validation annotations (`@Valid`, `@NotNull`, `@Size`, `@Email`).
  - Never expose or bind JPA Entity models directly to Controller request parameters (Mass Assignment prevention).

### 2.4. Global Exception Handling & RFC 9457 / RFC 7807 Problem Details
- All exceptions intercepted via centralized `@RestControllerAdvice`.
- Every Problem Details response emitted by `@RestControllerAdvice`, `AuthenticationEntryPoint`, and `AccessDeniedHandler` MUST declare `Content-Type: application/problem+json` (RFC 9457 / RFC 7807 section 3).
- Standard JSON Error Schema:
  ```json
  {
    "type": "https://travelai.vn/errors/bad-request",
    "title": "Invalid Input Data",
    "status": 400,
    "detail": "Email already registered in system.",
    "instance": "/api/v1/auth/register",
    "timestamp": "2026-09-27T10:00:00Z",
    "errors": {
      "email": "Email address is already in use!"
    }
  }
  ```

### 2.5. Database Schema Integrity & Production Configuration (PostgreSQL 16)
- **OneToOne Unique Constraint Mandate**: Every `@OneToOne` association in JPA entities MUST be backed by an explicit `UNIQUE` constraint on the corresponding foreign key column in PostgreSQL DDL (e.g. `CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)`).
- **Production DDL Safety**: In `application.yml`, production JPA `ddl-auto` MUST be configured as `validate`. Auto-mutating schemas in production (`update` or `create-drop`) is strictly prohibited.
- **Fail-Fast Credential Injection**: Sensitive deployment credentials (`SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`) MUST NOT provide hardcoded fallback defaults for production deployment. If missing, the application must fail fast at startup.
- **Query Optimization**: Enforce indexing on foreign keys and search filters (`email`, `username`, `province`, `category_id`). Eliminate N+1 queries using `@EntityGraph` or `JOIN FETCH`.

### 2.6. Automated Testing Verification
- Every authentication and business module must be accompanied by integration tests (`@SpringBootTest` + `MockMvc`).
- Test suites must verify happy paths, edge cases, negative test cases (expired tokens, disabled accounts, duplicate conflicts), and assert `application/problem+json` content-type compliance.

---

## 3. AI MICROSERVICE STANDARDS (PYTHON FASTAPI & VISION SDK)

- **Runtime & Tooling**: Python 3.11+, FastAPI, Pydantic v2.
- **Input Validation & Resource Consumption Defense (OWASP API4)**:
  - Ingest multipart files via `UploadFile = File(...)`.
  - **Magic Byte Verification**: Never rely solely on client-supplied `Content-Type` headers. Validate file magic numbers (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF...WEBP`) via `python-magic` or header byte inspection.
  - **Bounded Payload Streaming**: Enforce strict stream size limits (< 10MB) during chunked ingestion to prevent memory exhaustion / DoS attacks.
  - Utilize `Pillow` / `OpenCV` to normalize dimensions (e.g., maximum width 1920px) before external dispatch.
- **Google Cloud Vision API Client Resilience**:
  - Singleton client: `vision.ImageAnnotatorClient()`.
  - Enforce a strict 5.0-second timeout budget on external GCP calls.
  - Implement graceful error handling and web-detection fallback without crashing the ASGI worker process.
- **RFC 9457 Error Alignment**: Microservice HTTP errors must return structured Problem Details consistent with Core Backend contracts.

---

## 4. CONTAINERIZATION & DEVOPS INFRASTRUCTURE

- Every service (`client`, `services/core`, `services/ai`) must provide a multi-stage `Dockerfile` leveraging minimal base images (`alpine` or `slim`), running as non-root users where possible.
- Root `docker-compose.yml` orchestrates all four containers (`client`, `core`, `ai`, `postgres`) with healthcheck dependency ordering:
  ```bash
  docker compose up -d
  ```
- Core Backend must await PostgreSQL `pg_isready` healthcheck before initializing connection pools.
