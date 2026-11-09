# TravelAI 2.0, local setup with Docker

Runs the Spring Boot backend, the image-recognition service and PostgreSQL in Docker; the Expo app runs on the host.
All values below are placeholders; never commit real keys.

## 1. Secrets (outside the repository)

```bash
umask 077
mkdir -p ~/.local/share/travelai
openssl rand -base64 32 > ~/.local/share/travelai/message.key   # message-encryption key for the dev database
# Google service-account JSON with the Vision API enabled: keep it anywhere outside the repo, chmod 600
```

Create `.env` from `.env.example` and set `POSTGRES_PASSWORD`, `HOST_GCP_KEY` and `HOST_MESSAGE_KEY` (absolute paths). `.env` is git-ignored.

## 2. Start and stop

```bash
docker compose --profile v2 up -d --build postgres-v2 ai-v2 backend-v2
docker compose --profile v2 down        # always pass --profile v2; never add -v unless you want to drop the database
```

Name the services explicitly: a bare `up` would also start the default stack, which uses the same ports. Ports bind to `127.0.0.1`; set `V2_BIND_ADDR=0.0.0.0` to reach them from a phone over Wi-Fi (the image endpoint has no authentication, so use only on trusted networks).

## 3. Seed minimal data

A fresh database has no admin, tours, schedules or simulated bank accounts (`data.sql` only seeds one place). Using the API:

1. `POST /api/auth/register` for an admin and a customer, then promote the admin: `UPDATE users SET role='ADMIN' WHERE email='...'` (psql inside the database container).
2. As admin: `POST /api/tours`, then `POST /api/booking/offers` with `"id": null`, `"kind": "TOUR"`, `"legacyId": <tour id>`, all four policy values, and at least one departure.
3. As admin: `POST /api/booking/bank/accounts` (header `Idempotency-Key`, bank name must end with ` SIMULATED`). The response contains the card id (`SIM-MC-...`) and the one-time `testCvv`; the customer links it in the profile screen.

## 4. App

```bash
npm --prefix apps/mobile ci
cd apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:8080/api EXPO_PUBLIC_AI_API_URL=http://localhost:8000 npx expo start --web --port 8084
```

For Android over USB or Waydroid: `adb reverse tcp:8080 tcp:8080 && adb reverse tcp:8000 tcp:8000 && adb reverse tcp:8084 tcp:8084`, then start Expo without `--web` and open it in Expo Go.
