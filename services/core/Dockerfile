# ==============================================================================
# Multi-stage Dockerfile for TravelAI Core Backend (Spring Boot 3 + Java 17)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application with Maven
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Add unprivileged system user for security
RUN addgroup -S travelai && adduser -S travelai -G travelai

# Copy jar from builder
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R travelai:travelai /app

USER travelai

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
