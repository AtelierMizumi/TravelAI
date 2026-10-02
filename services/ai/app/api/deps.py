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


_landmark_service_instance: LandmarkRecognitionService | None = None


def get_landmark_recognition_service(
    settings: Settings = Depends(get_settings),
) -> LandmarkRecognitionService:
    """Dependency provider for singleton LandmarkRecognitionService."""
    global _landmark_service_instance
    if _landmark_service_instance is None or _landmark_service_instance.settings != settings:
        _landmark_service_instance = LandmarkRecognitionService(settings=settings)
    return _landmark_service_instance


def reset_landmark_recognition_service() -> None:
    """Reset the singleton instance (useful in test harnesses)."""
    global _landmark_service_instance
    _landmark_service_instance = None
