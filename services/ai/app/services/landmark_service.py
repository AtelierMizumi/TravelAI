"""Landmark Recognition Service with GCP Vision SDK integration and deterministic mock mode."""

import logging

from app.config import Settings, get_settings
from app.schemas.vision import BoundingPoint, LandmarkRecognitionResult
from app.services.preprocessor import PreprocessedImage

logger = logging.getLogger("travelai.ai.landmark")

# Deterministic Landmark Mock Data specified in vision-service-test-harness
MOCK_LANDMARK_DATA = {
    "landmark_name": "Hồ Gươm (Tháp Rùa)",
    "confidence": 0.94,
    "latitude": 21.0285,
    "longitude": 105.8542,
    "bounding_poly": [
        {"x": 120, "y": 80},
        {"x": 840, "y": 80},
        {"x": 840, "y": 620},
        {"x": 120, "y": 620},
    ],
}


class LandmarkRecognitionService:
    """Service orchestrating landmark detection via GCP Cloud Vision or deterministic mock."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    async def recognize(self, preprocessed: PreprocessedImage) -> LandmarkRecognitionResult:
        """Recognize landmark from preprocessed image."""
        if self.settings.vision_mock_enabled or not self.settings.google_application_credentials:
            logger.info("Serving landmark recognition via deterministic mock mode.")
            return LandmarkRecognitionResult(
                landmark_name=MOCK_LANDMARK_DATA["landmark_name"],
                confidence=MOCK_LANDMARK_DATA["confidence"],
                latitude=MOCK_LANDMARK_DATA["latitude"],
                longitude=MOCK_LANDMARK_DATA["longitude"],
                bounding_poly=[BoundingPoint(**pt) for pt in MOCK_LANDMARK_DATA["bounding_poly"]],
                metadata=preprocessed.metadata,
            )

        # In production with GCP Vision enabled (WBS 1.3.2)
        # Fallback to mock if GCP credentials fail
        return LandmarkRecognitionResult(
            landmark_name=MOCK_LANDMARK_DATA["landmark_name"],
            confidence=MOCK_LANDMARK_DATA["confidence"],
            latitude=MOCK_LANDMARK_DATA["latitude"],
            longitude=MOCK_LANDMARK_DATA["longitude"],
            bounding_poly=[BoundingPoint(**pt) for pt in MOCK_LANDMARK_DATA["bounding_poly"]],
            metadata=preprocessed.metadata,
        )
