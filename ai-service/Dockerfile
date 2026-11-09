# TravelAI 2.0 image-recognition service (FastAPI + Google Cloud Vision).
# Credentials are mounted at runtime via GOOGLE_APPLICATION_CREDENTIALS; never baked in.
FROM python:3.12-slim
RUN groupadd --system travelai && useradd --system --gid travelai --no-create-home --shell /usr/sbin/nologin travelai
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ai ./ai
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
USER travelai
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/', timeout=3)" || exit 1
CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
