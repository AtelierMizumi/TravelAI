---
name: backend-auth-rfc7807-audit
description: >-
  Enterprise audit, verification and compliance harness for Spring Boot 3 Core Backend
  grounded in IETF RFC 9457/7807, OAuth 2.0 Security BCP (RFC 9700), OWASP ASVS v4.0.3,
  OWASP API Security Top 10 (2023), and NIST SP 800-63B.
---

# 🛡️ TravelAI Core Backend Security & RFC 9457 / RFC 7807 Audit Guide
## COMPLIANCE BENCHMARK: IETF RFC 9457/7807 | OAUTH 2.0 BCP | OWASP ASVS v4.0.3 | NIST SP 800-63B

This skill provides an automated and manual verification protocol for auditing Spring Boot 3 Core Backend implementations. Every backend module touching authentication, authorization, error formatting, database schema, or client CORS **MUST be audited against this benchmark before merging**.

---

## 1. Regulatory & Standards Mapping

| Standard | Identifier | Core Invariant Enforced in TravelAI |
|---|---|---|
| **IETF RFC 9457 / 7807** | Problem Details for HTTP APIs | Mandatory `Content-Type: application/problem+json`, standard problem members (`type`, `status`, `title`, `detail`, `instance`, `errors`), zero internal stack trace leakage. |
| **OAuth 2.0 Security BCP** | RFC 9700 / RFC 6749 / RFC 8252 | Single-use Refresh Token Rotation (RTR), immediate invalidation of prior tokens, token reuse/family compromise detection. |
| **OWASP ASVS v4.0.3** | V2 (Auth), V3 (Session), V8 (Crypto) | BCrypt work factor >= 10, constant-time comparison, minimum 128-bit token entropy, zero credentials in logs/exceptions/client payloads. |
| **OWASP API Security 2023** | API1 (BOLA), API2 (Auth), API3 (Mass Assignment), API8 (Misconfig) | Strict DTO binding, pre-check canonicalization, zero wildcard CORS with `Allow-Credentials: true`, explicit endpoint authorization. |
| **NIST SP 800-63B** | Digital Identity Guidelines §5.1.1 | Minimum 8-character passwords, allow all printable characters, active account status checks (`enabled == true`), no arbitrary composition blocks. |
| **PostgreSQL 16 / JPA** | Relational Data Integrity | Schema-level `UNIQUE` constraints on all 1-to-1 foreign keys, foreign key indexing, production `ddl-auto: validate`. |

---

## 2. Fool-Proof Verification Checklist (Pre-Merge Audit Gate)

### A. Authentication & Refresh Token Rotation (RTR)
- [ ] **Single-Use Refresh Tokens**: When `/api/v1/auth/refresh` receives a valid token:
  1. The incoming token is immediately deleted/invalidated from persistence (`deleteByUser(user)` + `flush()`).
  2. A new high-entropy token is minted (`createRefreshToken(user)`).
  3. Response payload returns BOTH the new access token AND the new refresh token.
- [ ] **Token Family Invalidation on Reuse**: Presenting an already-rotated or expired token MUST return HTTP 400 Bad Request or HTTP 403 Forbidden without disclosing system internals.
- [ ] **Active Account Status Check**: Both `refreshToken()` and `JwtAuthenticationFilter` MUST actively verify `user.isEnabled()`. If `false`, immediately block execution.

### B. Credential & Token Leakage Prevention
- [ ] **Zero Token Material in Exceptions**: `TokenRefreshException` and other security exceptions must NEVER accept or print raw tokens in their message:
  ```java
  // ❌ VIOLATION (Leaked in RFC 7807 detail & logs):
  super(String.format("Failed for token [%s]: %s", token, message));

  // ✅ COMPLIANT:
  super("Refresh token is expired or invalid. Please sign in again.");
  ```
- [ ] **Clean RFC 9457 Detail**: The `detail` property in the Problem Details JSON response must only contain safe, generic descriptions.
- [ ] **Log Sanitization**: Bearer tokens, refresh tokens, and passwords must never be logged.

### C. CORS Enterprise Hardening
- [ ] **Zero Reflective Wildcards with Credentials**:
  ```java
  // ❌ CRITICAL SECURITY VULNERABILITY (OWASP API8):
  configuration.setAllowedOriginPatterns(List.of("*"));
  configuration.setAllowCredentials(true);

  // ✅ COMPLIANT (Explicit Whitelist):
  configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
  configuration.setAllowCredentials(true);
  ```

### D. Data Canonicalization & Normalization
- [ ] **Pre-Check Sanitization**: During registration, input strings must be normalized BEFORE uniqueness lookups and persistence:
  ```java
  String normalizedUsername = request.getUsername() != null ? request.getUsername().trim() : "";
  String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

  if (userRepository.existsByUsername(normalizedUsername)) { throw new BadRequestException(...); }
  if (userRepository.existsByEmail(normalizedEmail)) { throw new BadRequestException(...); }
  ```
- [ ] **Case-Insensitive Email Login**: User lookup by username/email during login must support case-insensitive email queries:
  ```java
  String normalizedEmail = usernameOrEmail.trim().toLowerCase();
  User user = userRepository.findByUsernameOrEmail(usernameOrEmail.trim(), normalizedEmail)
          .orElseThrow(...);
  ```

### E. RFC 9457 / RFC 7807 Media-Type Compliance
- [ ] **MediaType**: Every Problem Details HTTP response MUST have `Content-Type: application/problem+json`.
- [ ] **Controllers & Global Exception Handler**:
  ```java
  private static final MediaType PROBLEM_JSON = MediaType.parseMediaType("application/problem+json");

  @ExceptionHandler(...)
  public ResponseEntity<ErrorResponse> handle(...) {
      return ResponseEntity.status(status).contentType(PROBLEM_JSON).body(errorResponse);
  }
  ```
- [ ] **AuthenticationEntryPoint**: `response.setContentType("application/problem+json");` must be explicitly configured for unauthenticated HTTP 401 responses.
- [ ] **ObjectMapper Optimization**: Inject Spring's managed `ObjectMapper` bean rather than re-instantiating `new ObjectMapper()` and scanning modules on each request.

### F. Database Schema & Configuration Integrity
- [ ] **OneToOne Unique Constraints**: Any entity with `@OneToOne` mapping (e.g. `RefreshToken.user`) MUST have an explicit `UNIQUE` constraint on the foreign key column in PostgreSQL DDL:
  ```sql
  CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)
  ```
- [ ] **Production DDL Safety**: In `application.yml`, production JPA `ddl-auto` must be configured as `validate`.
- [ ] **No Hardcoded Secrets**: Sensitive credentials in `application.yml` must not have fallback defaults committed to git.

---

## 3. Anti-Pattern vs. Compliant Pattern Reference Table

| Anti-Pattern (Vulnerable / Non-Compliant) | Compliant Pattern (Fool-Proof Standard) | Rationale & Standard |
|---|---|---|
| `allowedOriginPatterns("*")` + `allowCredentials(true)` | Whitelist explicit origins via `allowedOrigins(List.of(...))` | OWASP API8: Prevents arbitrary malicious sites from making credentialed API calls. |
| Returning old refresh token in `/refresh` | Revoke old token and mint new refresh token (RTR) | OAuth 2.0 Security BCP (RFC 9700): Limits blast radius of stolen refresh tokens. |
| `existsByUsername(rawInput)` before `.trim()` | `trim()` and `toLowerCase()` before repository checks | Eliminates 500 DB constraint crashes from casing/whitespace variations. |
| Embedding `token` in `TokenRefreshException` message | Generic message: `"Refresh token is expired or invalid."` | OWASP ASVS V8: Prevents token credential exposure via error responses and APM logs. |
| Header `Content-Type: application/json` on error | Header `Content-Type: application/problem+json` | IETF RFC 9457 / RFC 7807 Section 3 standard media type compliance. |
| `requestMatchers("/api/v1/auth/**").permitAll()` | `.requestMatchers("/register", "/login", "/refresh").permitAll()` | Protects `/logout` and prevents unauthenticated spoofed session termination. |
| Schema lacking `UNIQUE(user_id)` for `@OneToOne` | `user_id BIGINT NOT NULL UNIQUE` in DDL | PostgreSQL 16: Prevents concurrent race inserts that crash Hibernate proxy hydration. |
| `ddl-auto: update` in production configuration | `ddl-auto: ${SPRING_JPA_HIBERNATE_DDL_AUTO:validate}` | Production safety: Prevents accidental destructive table alterations at runtime. |

---

## 4. Verification & Testing Commands

To verify that the Spring Boot Core Backend meets all standards, execute the Maven test harness:

```bash
cd services/core
./mvnw clean test
```

### Mandatory Test Assertions in Integration Tests:
1. **Refresh Rotation Assertion**:
   ```java
   assertThat(refreshResponse.getRefreshToken(), not(equalTo(initialRefreshToken)));
   ```
2. **Single-Use Invalidation Assertion**:
   ```java
   mockMvc.perform(post("/api/v1/auth/refresh").content(initialRefreshTokenJson))
           .andExpect(status().isBadRequest());
   ```
3. **Problem Details Media-Type Assertion**:
   ```java
   .andExpect(result -> {
       String contentType = result.getResponse().getContentType();
       assert contentType != null && contentType.contains("application/problem+json");
   });
   ```
