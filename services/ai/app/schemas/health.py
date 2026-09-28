"""Health check response schema."""

from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Service health status response."""

    status: str = Field(default="healthy", description="Current service health state")
    service: str = Field(default="travelai-ai-service", description="Service identifier name")
    version: str = Field(default="0.1.0", description="Service semantic version")
