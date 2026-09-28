"""API Dependency Injection providers."""

from fastapi import Depends

from app.config import Settings, get_settings
from app.services.landmark_service import LandmarkRecognitionService
from app.services.preprocessor import ImagePreprocessor


def get_preprocessor_service(
    settings: Settings = Depends(get_settings),
) -> ImagePreprocessor:
    """Dependency provider for ImagePreprocessor."""
    return ImagePreprocessor(settings=settings)


def get_landmark_recognition_service(
    settings: Settings = Depends(get_settings),
) -> LandmarkRecognitionService:
    """Dependency provider for LandmarkRecognitionService."""
    return LandmarkRecognitionService(settings=settings)
