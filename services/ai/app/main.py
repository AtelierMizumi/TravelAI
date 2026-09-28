"""TravelAI AI Landmark Recognition Microservice Entrypoint."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.api.v1.endpoints.health import check_health
from app.config import get_settings
from app.core.handlers import register_exception_handlers
from app.schemas.health import HealthCheckResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("travelai.ai.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown routines."""
    settings = get_settings()
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)
    if settings.vision_mock_enabled:
        logger.info("AI Service is running in DETERMINISTIC MOCK MODE (vision_mock_enabled=True)")
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    """FastAPI Application Factory."""
    settings = get_settings()

    app = FastAPI(
        title="TravelAI Intelligent Landmark Recognition Microservice",
        description="High-performance AI Microservice for image preprocessing, validation, and landmark recognition.",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register RFC 7807 Problem Details Global Exception Handlers
    register_exception_handlers(app)

    # Register root health endpoint
    app.add_api_route(
        "/health",
        check_health,
        methods=["GET"],
        response_model=HealthCheckResponse,
        tags=["Health"],
        summary="Root Health Check",
    )

    # Mount API v1 router
    app.include_router(api_router, prefix=settings.api_prefix)

    return app


app = create_app()
