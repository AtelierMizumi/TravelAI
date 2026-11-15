# TravelAI 2.0 image-recognition service (FastAPI + Google Cloud Vision).
# Credentials are mounted at runtime via GOOGLE_APPLICATION_CREDENTIALS; never baked in.
# Build context is the repository root: the landmark catalog in shared/ is copied into the image.
# The optional local model file is not baked in; without it the service runs on Google Vision alone.
FROM python:3.12-slim
RUN groupadd --system travelai && useradd --system --gid travelai --no-create-home --shell /usr/sbin/nologin travelai
WORKDIR /app
COPY ai-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-service/ai ./ai
COPY ai-service/models ./models
COPY shared ./shared
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    LANDMARK_CATALOG_PATH=/app/shared/landmarks.json \
    LANDMARK_CLASSES_PATH=/app/models/classes.json \
    LANDMARK_MODEL_PATH=/app/models/landmark_classifier.onnx
USER travelai
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/', timeout=3)" || exit 1
CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
