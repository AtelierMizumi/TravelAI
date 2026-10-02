"""Landmark Recognition Service with Google Cloud Vision SDK integration and deterministic mock mode."""

import asyncio
import logging
import time
import uuid
from collections import deque
from datetime import UTC, datetime

from google.api_core.exceptions import GoogleAPICallError, RetryError
from google.auth.exceptions import GoogleAuthError
from google.cloud import vision

from app.config import Settings, get_settings
from app.core.exceptions import VisionProviderException, VisionTimeoutException
from app.schemas.vision import (
    BoundingPoint,
    LandmarkRecognitionResult,
    RecognitionHistoryEntry,
)
from app.services.preprocessor import PreprocessedImage

logger = logging.getLogger("travelai.ai.landmark")

# Deterministic Landmark Mock Data specified in vision-service-test-harness
MOCK_LANDMARK_DATA = {
    "landmark_name": "Hồ Gươm (Tháp Rùa)",
    "confidence": 0.94,
    "latitude": 21.0285,
    "longitude": 105.8542,
    "description": "Di tích lịch sử văn hóa quốc gia đặc biệt tại trung tâm thủ đô Hà Nội.",
    "matched_keywords": ["hồ gươm", "tháp rùa", "hoan kiem lake"],
    "bounding_poly": [
        {"x": 120, "y": 80},
        {"x": 840, "y": 80},
        {"x": 840, "y": 620},
        {"x": 120, "y": 620},
    ],
}


class LandmarkRecognitionService:
    """Service orchestrating landmark detection via GCP Cloud Vision or deterministic mock."""

    def __init__(
        self,
        settings: Settings | None = None,
        vision_client: vision.ImageAnnotatorClient | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self._vision_client = vision_client
        self._history: deque[RecognitionHistoryEntry] = deque(
            maxlen=self.settings.vision_max_history_entries
        )

    def _get_client(self) -> vision.ImageAnnotatorClient:
        """Lazily initialize and return the Google Cloud Vision client."""
        if self._vision_client is None:
            try:
                if self.settings.google_application_credentials:
                    self._vision_client = vision.ImageAnnotatorClient.from_service_account_json(
                        self.settings.google_application_credentials
                    )
                else:
                    self._vision_client = vision.ImageAnnotatorClient()
            except (GoogleAuthError, Exception) as exc:
                logger.error("Failed to initialize Google Cloud Vision client: %s", str(exc))
                raise VisionProviderException(
                    detail="Google Cloud Vision client initialization failed. Check GCP credentials."
                ) from exc
        return self._vision_client

    def get_history(self, limit: int = 50) -> list[RecognitionHistoryEntry]:
        """Return the most recent recognition history entries."""
        entries = list(self._history)
        entries.reverse()  # most recent first
        return entries[:limit]

    def clear_history(self) -> None:
        """Clear all stored recognition history entries."""
        self._history.clear()

    async def recognize(self, preprocessed: PreprocessedImage) -> LandmarkRecognitionResult:
        """Recognize landmark from preprocessed image."""
        start_time = time.perf_counter()
        req_id = str(uuid.uuid4())

        if self.settings.vision_mock_enabled or (
            not self.settings.google_application_credentials and self.settings.vision_mock_enabled
        ):
            logger.info("Serving landmark recognition via deterministic mock mode.")
            result = LandmarkRecognitionResult(
                landmark_name=MOCK_LANDMARK_DATA["landmark_name"],
                confidence=MOCK_LANDMARK_DATA["confidence"],
                latitude=MOCK_LANDMARK_DATA["latitude"],
                longitude=MOCK_LANDMARK_DATA["longitude"],
                bounding_poly=[BoundingPoint(**pt) for pt in MOCK_LANDMARK_DATA["bounding_poly"]],
                metadata=preprocessed.metadata,
                success=True,
                description=MOCK_LANDMARK_DATA["description"],
                matched_keywords=MOCK_LANDMARK_DATA["matched_keywords"],
                detection_type="LANDMARK_DETECTION",
            )
        else:
            result = await self._recognize_with_vision(preprocessed)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Audit and history logging
        history_entry = RecognitionHistoryEntry(
            id=req_id,
            timestamp=datetime.now(UTC).isoformat(),
            landmark_name=result.landmark_name,
            confidence=result.confidence,
            latitude=result.latitude,
            longitude=result.longitude,
            detection_type=result.detection_type,
            success=result.success,
            latency_ms=latency_ms,
            image_metadata=result.metadata,
        )
        self._history.append(history_entry)

        logger.info(
            "Recognition complete: id=%s landmark='%s' confidence=%.2f type=%s latency=%.1fms",
            req_id,
            result.landmark_name,
            result.confidence,
            result.detection_type,
            latency_ms,
        )

        return result

    async def _recognize_with_vision(
        self, preprocessed: PreprocessedImage
    ) -> LandmarkRecognitionResult:
        """Invoke Google Cloud Vision Landmark Detection with Web Detection fallback."""
        try:
            client = self._get_client()
            image = vision.Image(content=preprocessed.buffer)

            # Enforce strict 5.0-second timeout budget per Rule 05
            timeout = self.settings.vision_timeout_seconds

            # Step 1: Execute landmark detection in thread pool to prevent blocking event loop
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(client.landmark_detection, image=image, timeout=timeout),
                    timeout=timeout,
                )
            except TimeoutError as exc:
                logger.warning("Landmark detection exceeded timeout budget (%.1fs)", timeout)
                raise VisionTimeoutException(
                    detail=f"Google Cloud Vision landmark detection exceeded {timeout}s timeout."
                ) from exc

            if response.error.code != 0:
                logger.error("Vision API error response: %s", response.error.message)
                raise VisionProviderException(
                    detail=f"Google Cloud Vision API error: {response.error.message}"
                )

            # Check if any landmarks were detected
            if response.landmark_annotations:
                top_landmark = response.landmark_annotations[0]
                lat: float | None = None
                lng: float | None = None
                if top_landmark.locations and top_landmark.locations[0].lat_lng:
                    lat = float(top_landmark.locations[0].lat_lng.latitude)
                    lng = float(top_landmark.locations[0].lat_lng.longitude)

                bounding_poly = [
                    BoundingPoint(x=vertex.x, y=vertex.y)
                    for vertex in top_landmark.bounding_poly.vertices
                ]

                matched_keywords = [
                    lm.description.strip()
                    for lm in response.landmark_annotations[:5]
                    if lm.description
                ]

                return LandmarkRecognitionResult(
                    landmark_name=top_landmark.description.strip(),
                    confidence=round(float(top_landmark.score), 2),
                    latitude=lat,
                    longitude=lng,
                    bounding_poly=bounding_poly,
                    metadata=preprocessed.metadata,
                    success=True,
                    description=f"Recognized landmark: {top_landmark.description.strip()}",
                    matched_keywords=matched_keywords,
                    detection_type="LANDMARK_DETECTION",
                )

            # Step 2: Fallback to Web Detection if no direct landmark found
            logger.info("No landmark annotations found, initiating Web Detection fallback.")
            try:
                web_response = await asyncio.wait_for(
                    asyncio.to_thread(client.web_detection, image=image, timeout=timeout),
                    timeout=timeout,
                )
            except TimeoutError as exc:
                logger.warning("Web detection fallback exceeded timeout budget (%.1fs)", timeout)
                raise VisionTimeoutException(
                    detail=f"Google Cloud Vision web detection exceeded {timeout}s timeout."
                ) from exc

            if web_response.error.code != 0:
                logger.error("Vision Web API error: %s", web_response.error.message)
                raise VisionProviderException(
                    detail=f"Google Cloud Vision Web API error: {web_response.error.message}"
                )

            web_detection = web_response.web_detection
            best_guess = (
                web_detection.best_guess_labels[0].label
                if web_detection.best_guess_labels
                else None
            )

            matched_keywords = [
                entity.description.strip()
                for entity in web_detection.web_entities[:5]
                if entity.description
            ]

            if best_guess:
                return LandmarkRecognitionResult(
                    landmark_name=best_guess.strip(),
                    confidence=0.75,
                    latitude=None,
                    longitude=None,
                    bounding_poly=[],
                    metadata=preprocessed.metadata,
                    success=True,
                    description=f"Inferred landmark via web detection: {best_guess.strip()}",
                    matched_keywords=matched_keywords,
                    detection_type="WEB_DETECTION",
                )

            if web_detection.web_entities and web_detection.web_entities[0].description:
                top_entity = web_detection.web_entities[0]
                return LandmarkRecognitionResult(
                    landmark_name=top_entity.description.strip(),
                    confidence=round(float(top_entity.score or 0.7), 2),
                    latitude=None,
                    longitude=None,
                    bounding_poly=[],
                    metadata=preprocessed.metadata,
                    success=True,
                    description=f"Inferred entity via web detection: {top_entity.description.strip()}",
                    matched_keywords=matched_keywords,
                    detection_type="WEB_DETECTION",
                )

            # No landmark or web entity could be identified
            return LandmarkRecognitionResult(
                landmark_name=None,
                confidence=0.0,
                latitude=None,
                longitude=None,
                bounding_poly=[],
                metadata=preprocessed.metadata,
                success=False,
                description="Không nhận diện được danh lam thắng cảnh trong bức ảnh.",
                matched_keywords=[],
                detection_type="UNKNOWN",
            )

        except (GoogleAPICallError, RetryError) as exc:
            logger.exception("Google Cloud Vision API call error: %s", str(exc))
            raise VisionProviderException(
                detail=f"Google Cloud Vision API failed: {exc.message if hasattr(exc, 'message') else str(exc)}"
            ) from exc
