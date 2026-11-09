# Caddy + Expo web bundle + demo images. Build from the repository root:
#   docker build -f deploy/web/Dockerfile --build-arg PUBLIC_ORIGIN=https://example.com .
# PUBLIC_ORIGIN is public (it ends up in the bundle); never pass a secret as a build argument.
FROM node:22-alpine AS build
WORKDIR /app
COPY apps/mobile/package.json apps/mobile/package-lock.json ./
RUN npm ci
COPY apps/mobile/ ./
ARG PUBLIC_ORIGIN
ENV EXPO_PUBLIC_API_URL=${PUBLIC_ORIGIN}/api \
    EXPO_PUBLIC_AI_API_URL=${PUBLIC_ORIGIN}/ai
RUN npx expo export -p web --output-dir dist

FROM caddy:2
LABEL org.opencontainers.image.source="https://github.com/AtelierMizumi/TravelAI"
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv/web
COPY data/seed/images /srv/media
