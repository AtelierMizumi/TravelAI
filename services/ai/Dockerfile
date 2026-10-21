# ==============================================================================
# Multi-stage Dockerfile for TravelAI AI Microservice (FastAPI + Google Cloud Vision)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Resolve dependencies from uv.lock into an isolated virtualenv
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.13.3 /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /build

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# ------------------------------------------------------------------------------
# Stage 2: Minimal runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

RUN groupadd --system travelai \
    && useradd --system --gid travelai --no-create-home --shell /usr/sbin/nologin travelai

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY app ./app

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

USER travelai

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import os, urllib.request; urllib.request.urlopen('http://localhost:%s/health' % os.environ.get('PORT', '8000'), timeout=3)" || exit 1

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
