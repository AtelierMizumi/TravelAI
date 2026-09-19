# 🚀 TravelAI Core Backend (Spring Boot 3 + Spring Security 6)

Core Business & Security microservice for the TravelAI platform.

---

## 🛠️ Tech Stack & Specifications
- **Java**: 17+ (LTS)
- **Spring Boot**: 3.3.4
- **Spring Security**: 6.x (Stateless JWT + RBAC)
- **Spring Data JPA**: Hibernate 6
- **Database**: PostgreSQL 16
- **Token Engine**: JJWT (Java JWT) 0.12.6
- **Error Standard**: RFC 7807 Problem Details

---

## 🏛️ Clean Layered Architecture
```
com.travelai.core
├── controller/         # REST Controllers (AuthController, HealthController)
├── dto/
│   ├── request/        # Request Payloads (RegisterRequest, LoginRequest, TokenRefreshRequest)
│   └── response/       # Response Payloads (AuthResponse, TokenRefreshResponse, UserResponse)
├── exception/          # RFC 7807 GlobalExceptionHandler and Custom Exceptions
├── model/entity/       # JPA Entities (User, Role, RefreshToken)
├── repository/         # Spring Data JPA Repositories
├── security/           # JWT Provider, Auth Filter, UserDetails, SecurityConfig
└── service/            # Business Interfaces & Service Implementations
```

---

## 🔌 API Endpoints

### 1. Health Check
- `GET /api/v1/health`: Container and service health check (Public)

### 2. Authentication & Authorization
- `POST /api/v1/auth/register`: Register new traveler account (Public, 201 Created)
- `POST /api/v1/auth/login`: Authenticate with username or email, issue JWT & Refresh Token (Public, 200 OK)
- `POST /api/v1/auth/refresh`: Rotate and refresh access token via valid refresh token (Public, 200 OK)
- `POST /api/v1/auth/logout`: Revoke active refresh token (Authenticated, 200 OK)

---

## 🧪 Local Testing
```bash
./mvnw test
```
All 7 unit and integration tests validate:
- 201 Created on registration
- 400 Bad Request with RFC 7807 on duplicate email/username
- 401 Unauthorized on invalid credentials
- JWT signature generation and token parsing
