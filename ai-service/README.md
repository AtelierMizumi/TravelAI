# TravelAI image recognition

Web and React Native share the multipart `POST /detect` API backed by Google Cloud Vision. Existing JSON result fields are preserved. Send `file` and `consent=true` after explicit upload consent.

## Start the AI service

Install Python dependencies with `python3 -m pip install -r ai-service/requirements.txt` in a virtual environment.

From the repository root, in the Python environment containing FastAPI, uvicorn, python-multipart, requests and google-cloud-vision

```bash
python3 -m uvicorn ai.main:app --app-dir ai-service --host 0.0.0.0 --port 8000
```

The server loads `ai-service/ai/service-account.json` when `GOOGLE_APPLICATION_CREDENTIALS` is unset. Alternatively set that variable to an absolute credential path. The Google project needs the Vision API enabled and suitable permissions/quota. Keep JSON credentials on the server.

`GET /` reports `googleVisionConfigured`, indicating client initialization. A successful `/detect` verifies actual provider access. Provider/configuration failures return 502/503. Valid unrecognized images return 200 with `recognitionStatus=unknown`.

## Web

Run `npm run dev:web` from the repository root to start or reuse the required services. Web and native targets share `apps/mobile` and call AI port 8000 on the development hostname. For deployment, set `EXPO_PUBLIC_AI_API_URL` before starting/building Expo. Configure the deployed Web origin in `AI_ALLOWED_ORIGINS`.

## React Native

Run `npm start` in `apps/mobile`. Open **Nhận diện AI**, choose/take a photo, review consent and submit. Phone formats including HEIC are normalized to JPEG with a maximum long edge of 1600 pixels using Expo ImageManipulator.

During LAN development, the app derives the AI hostname from Expo's host URI, using port 8000. Phone and server must be mutually reachable. For tunnel mode, custom servers and release builds, set an explicit public URL and restart Expo

```bash
EXPO_PUBLIC_AI_API_URL=https://your-ai-server.example npm start
```

Server secrets stay in the Python environment. For Expo Web on another origin, set AI service `AI_ALLOWED_ORIGINS` to comma-separated exact origins. Local ports 5173, 8081 and 8084 are allowed by default. Add the exact LAN web origin if using a browser on another device. Production endpoints should use HTTPS.

## Verify

From the repository root

```bash
python3 -m unittest discover -s ai-service/tests -v
npm --prefix apps/mobile test
npm --prefix apps/mobile run lint
npm --prefix apps/mobile run typecheck
```

Contract tests mock provider calls and use synthetic image bytes. Android/iOS camera and LAN connectivity require physical-device verification.

## Verification on 2026-11-06

- Nine synthetic API contract tests passed, covering consent, invalid/empty/oversized uploads, unknown results, missing configuration, provider failure and CORS.
- A real Google Cloud Vision request using the existing server credential and the local Eiffel Tower sample returned HTTP 200, `success=true`, `displayName=Tháp Eiffel`, `recognitionStatus=predicted`, `engine=google_vision`.
- Frontend production build, mobile lint/typecheck and Android/iOS JavaScript bundle exports passed.
- Physical-device capture, permissions and LAN upload remain to be verified on Android/iOS. Bundle export is separate from a native binary/device run.
