# Multi-stage build for the TravelAI 2.0 Spring Boot backend (Java 25).
FROM eclipse-temurin:25-jdk AS build
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package && cp target/*.jar /build/app.jar

FROM eclipse-temurin:25-jre AS runner
RUN groupadd --system travelai && useradd --system --gid travelai --no-create-home --shell /usr/sbin/nologin travelai
WORKDIR /app
COPY --from=build /build/app.jar app.jar
USER travelai
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080 && printf "GET /api/places HTTP/1.0\r\n\r\n" >&3 && head -1 <&3 | grep -q " 200 "' || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
