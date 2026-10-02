---
name: backend-auth-rfc7807-audit
description: >-
  Audit, verification and testing guidelines for Spring Boot 3 Core Backend authentication,
  Refresh Token Rotation (RTR), RFC 7807 Problem Details (application/problem+json),
  input normalization, database integrity constraints, and enterprise CORS security.
---

# 🛡️ TravelAI Core Backend Security & RFC 7807 Audit Guide

This skill provides an automated and manual verification protocol for auditing Spring Boot 3 Core Backend authentication, authorization, and error handling implementations. Use this skill whenever implementing, reviewing, or debugging backend authentication or API error contracts.

---

## 1. Security & Compliance Invariant Checklist

### A. Refresh Token Rotation (RTR)
- [ ] **Single-Use Refresh Tokens**: When `/api/v1/auth/refresh` receives a valid token:
  1. The incoming token is immediately invalidated or deleted from persistence (`refreshTokenRepository.delete(token)`).
  2. A new refresh token is minted and persisted (`createRefreshToken(user)`).
  3. The response returns BOTH the new access token AND the newly minted refresh token.
- [ ] **No Token Reuse**: Attempting to reuse an already-used or expired refresh token MUST return HTTP 403 Forbidden or 400 Bad Request.
- [ ] **Account Status Enforcement**: When refreshing tokens, `user.isEnabled()` MUST be evaluated. If `false`, the operation MUST abort with HTTP 400/403.

### B. Credential & Token Leakage Prevention
- [ ] **Zero Token Material in Exceptions**: Exceptions (e.g. `TokenRefreshException`) must NEVER incorporate the token string in exception messages.
- [ ] **Clean RFC 7807 Detail**: The `detail` property in the Problem Details JSON response must only contain safe, generic descriptions (e.g. `"Refresh token is expired or invalid. Please sign in again."`).
- [ ] **Log Sanitization**: Authentication tokens, refresh tokens, and passwords must never be logged in raw form.

### C. CORS Enterprise Hardening
- [ ] **No Wildcard with Credentials**: If `configuration.setAllowCredentials(true)` is set, `configuration.setAllowedOriginPatterns(List.of("*"))` is strictly forbidden.
- [ ] **Explicit Origin Whitelist**: Allowed origins must be explicitly listed (e.g. `http://localhost:3000`, `http://localhost:5173`) and dynamically bound to `app.cors.allowed-origins`.

### D. Data Normalization Invariants
- [ ] **Pre-Check Sanitization**: During registration, input strings must be normalized before uniqueness lookups:
  ```java
  String normalizedUsername = request.getUsername().trim();
  String normalizedEmail = request.getEmail().trim().toLowerCase();
  if (userRepository.existsByUsername(normalizedUsername)) { ... }
  if (userRepository.existsByEmail(normalizedEmail)) { ... }
  ```
- [ ] **Case-Insensitive Email Login**: User lookup by username/email during login must support case-insensitive email queries so that users can log in regardless of input casing.

### E. RFC 7807 Media-Type Compliance
- [ ] **MediaType**: Every Problem Details HTTP response MUST have `Content-Type: application/problem+json`.
- [ ] **Spring Controllers & Handlers**:
  ```java
  private static final MediaType PROBLEM_JSON = MediaType.parseMediaType("application/problem+json");

  @ExceptionHandler(...)
  public ResponseEntity<ErrorResponse> handle(...) {
      return ResponseEntity.status(status).contentType(PROBLEM_JSON).body(errorResponse);
  }
  ```
- [ ] **AuthenticationEntryPoint**: `response.setContentType("application/problem+json");` must be set for HTTP 401 unauthorized responses.

### F. Database Schema & Configuration Integrity
- [ ] **OneToOne Unique Constraints**: Any entity with `@OneToOne` mapping (e.g. `RefreshToken.user`) MUST have an explicit `UNIQUE` constraint on the foreign key column in PostgreSQL DDL (`CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)`).
- [ ] **Production DDL Safety**: In `application.yml`, production JPA `ddl-auto` must be configured as `validate`.
- [ ] **No Hardcoded Secrets**: Sensitive credentials in `application.yml` must not have fallback defaults committed to git.

---

## 2. Verification Commands

To verify that the Spring Boot Core Backend meets all standards, execute the Maven test harness:

```bash
cd services/core
./mvnw clean test
```

Inspect output to ensure 100% of integration test suites pass with zero warnings.
