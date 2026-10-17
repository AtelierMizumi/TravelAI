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
├── controller/         # REST Controllers (AuthController, LocationController, HealthController)
├── dto/
│   ├── request/        # Request Payloads (RegisterRequest, LoginRequest, LocationRequest...)
│   └── response/       # Response Payloads (AuthResponse, LocationResponse, UserResponse...)
├── exception/          # RFC 7807 GlobalExceptionHandler and Custom Exceptions
├── model/entity/       # JPA Entities (User, Role, RefreshToken, Location)
├── repository/         # Spring Data JPA Repositories (UserRepository, LocationRepository...)
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

### 3. Location Management (WBS 1.7.2)
- `GET /api/v1/locations`: Get paginated locations list with keyword search, province/category filters (Public, 200 OK)
- `GET /api/v1/locations/{id}`: Get location details by ID (Public, 200 OK / 404 RFC 7807)
- `POST /api/v1/locations`: Admin create new destination location (Admin Role, 201 Created)
- `PUT /api/v1/locations/{id}`: Admin update location information (Admin Role, 200 OK)
- `DELETE /api/v1/locations/{id}`: Admin delete location (Admin Role, 204 No Content)

### 4. Tour Catalog Service (WBS 1.4.2)
- `GET /api/v1/tours`: Get paginated tours list with keyword search, location, province, maxPrice and duration filters (Public, 200 OK)
- `GET /api/v1/tours/{id}`: Get tour details, price, highlights, itinerary by ID (Public, 200 OK / 404 RFC 7807)
- `GET /api/v1/tours/by-location/{locationId}`: Get all active tours for a destination (Public, 200 OK)
- `POST /api/v1/tours`: Admin create new tour package linked to a landmark (Admin Role, 201 Created)
- `PUT /api/v1/tours/{id}`: Admin update tour package (Admin Role, 200 OK)
- `DELETE /api/v1/tours/{id}`: Admin delete tour package (Admin Role, 204 No Content)

---

## 🧪 Local Testing
```bash
./mvnw test
```
All unit and integration tests validate:
- Authentication, registration, JWT tokens, duplicate user/email checks
- Location CRUD operations, pagination, search by province/keyword
- Tour Catalog queries, pricing filters, landmark association, RBAC permissions
- Role-based access control (Admin endpoints vs Public endpoints)
- RFC 7807 Problem Details error compliance
