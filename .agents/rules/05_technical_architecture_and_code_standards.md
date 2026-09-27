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
- **Authentication & RBAC**:
  - Stateless JWT authentication via `JwtAuthenticationFilter` extending `OncePerRequestFilter`.
  - Method-level authorization via `@PreAuthorize("hasRole('ADMIN')")` or SecurityFilterChain URL matchers.
- **Global Exception Handling (RFC 7807)**:
  - All exceptions intercepted via `@RestControllerAdvice`.
  - Return JSON error payloads adhering to **RFC 7807 Problem Details**:
    ```json
    {
      "type": "https://travelai.vn/errors/bad-request",
      "title": "Invalid Input Data",
      "status": 400,
      "detail": "Email already registered in system.",
      "timestamp": "2026-09-27T10:00:00Z"
    }
    ```
- **Database Query Optimization**:
  - Eliminate N+1 query antipatterns using `@EntityGraph` or `JOIN FETCH`.
  - Enforce database indexing on frequently filtered columns (`name`, `province`, `category_id`, `user_id`).

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
