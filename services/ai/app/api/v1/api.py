"""API v1 Router Aggregator."""

from fastapi import APIRouter

from app.api.v1.endpoints import health, vision

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(vision.router, prefix="/vision", tags=["Vision & Preprocessing"])
