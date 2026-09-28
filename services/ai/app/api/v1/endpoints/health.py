"""Health Check Endpoint."""

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.schemas.health import HealthCheckResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Microservice Health Status",
    description="Returns the operational status, service name, and version.",
)
async def check_health(settings: Settings = Depends(get_settings)) -> HealthCheckResponse:
    """Service health probe."""
    return HealthCheckResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
    )
