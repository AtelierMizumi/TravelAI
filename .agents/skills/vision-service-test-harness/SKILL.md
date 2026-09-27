---
name: vision-service-test-harness
description: >-
  Testing and validation harness for the FastAPI AI Landmark Recognition microservice.
  Validates image preprocessing, MIME validation, mock Google Cloud Vision responses,
  and RFC 7807 error formats without requiring real GCP credentials.
---

# Vision Service Testing & Validation Harness

This skill provides testing protocols and mock harnesses for developing, debugging, and verifying the TravelAI FastAPI AI Recognition microservice (`services/ai`).

---

## 1. Local Development without GCP Billing (Mock Mode)

To develop and test landmark recognition locally without real Google Cloud Vision credentials:
- Set environment variable: `VISION_MOCK_ENABLED=true`
- When mock mode is enabled, the service uses a deterministic mock landmark provider:
  ```python
  # Deterministic Landmark Mock Data for Local Testing
  MOCK_LANDMARK_RESPONSE = {
      "landmark_name": "Hồ Gươm (Tháp Rùa)",
      "confidence": 0.94,
      "latitude": 21.0285,
      "longitude": 105.8542,
      "bounding_poly": [
          {"x": 120, "y": 80},
          {"x": 840, "y": 80},
          {"x": 840, "y": 620},
          {"x": 120, "y": 620}
      ]
  }
  ```

---

## 2. API Validation Checklist

### 2.1. Health Check Endpoint
- **URL**: `GET /health`
- **Expected Status**: `200 OK`
- **Response Shape**:
  ```json
  {
    "status": "healthy",
    "service": "travelai-ai-service",
    "version": "0.1.0"
  }
  ```

### 2.2. Image Preprocessing & Upload (`WBS 1.3.1`)
- **URL**: `POST /api/v1/vision/recognize`
- **Content-Type**: `multipart/form-data`
- **Field**: `image` (binary file)
- **Validation Rules**:
  - Allowed MIME: `image/jpeg`, `image/png`, `image/webp`.
  - Max Size: 10 MB.
  - Image Normalization: Auto-orient EXIF orientation, convert RGBA to RGB, resize if max dimension > 2048px.

### 2.3. Negative Tests & Error Handling (RFC 7807 Problem Details)
Ensure the following scenarios return RFC 7807 compliant payloads:
1. **Invalid MIME Type (e.g. uploading a `.pdf` or `.exe`)**:
   - Status: `415 Unsupported Media Type`
   - Content-Type: `application/problem+json`
   - Response:
     ```json
     {
       "type": "https://api.travelai.internal/errors/unsupported-media-type",
       "title": "Unsupported Media Type",
       "status": 415,
       "detail": "File type application/pdf is not supported. Allowed: image/jpeg, image/png, image/webp"
     }
     ```
2. **File Exceeds Size Limit (> 10MB)**:
   - Status: `413 Payload Too Large`
3. **Corrupted Image Buffer**:
   - Status: `422 Unprocessable Content`

---

## 3. Quick CLI Verification Commands

```bash
# 1. Run unit and integration tests
cd services/ai
pytest tests/ -v

# 2. Run Ruff linter and formatter check
ruff check .
ruff format --check .

# 3. Test endpoint with sample image via curl
curl -X POST "http://localhost:8001/api/v1/vision/recognize" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@sample_landmark.jpg"
```
