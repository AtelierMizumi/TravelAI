"""Vision Recognition & Image Preprocessing Endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import get_landmark_recognition_service, get_preprocessor_service
from app.schemas.error import ProblemDetails
from app.schemas.vision import LandmarkRecognitionResult, PreprocessResult
from app.services.landmark_service import LandmarkRecognitionService
from app.services.preprocessor import ImagePreprocessor

logger = logging.getLogger("travelai.ai.vision_router")

router = APIRouter()


@router.post(
    "/recognize",
    response_model=LandmarkRecognitionResult,
    summary="Recognize Travel Landmark from Image",
    description="Validates, preprocesses, and analyzes an uploaded image to recognize travel landmarks.",
    responses={
        413: {"model": ProblemDetails, "description": "Payload Too Large (> 10MB)"},
        415: {"model": ProblemDetails, "description": "Unsupported Media Type"},
        422: {"model": ProblemDetails, "description": "Unprocessable Image or Validation Error"},
    },
)
async def recognize_landmark(
    image: Annotated[
        UploadFile, File(description="Uploaded landmark image (JPEG, PNG, WEBP, <= 10MB)")
    ],
    preprocessor: ImagePreprocessor = Depends(get_preprocessor_service),
    landmark_service: LandmarkRecognitionService = Depends(get_landmark_recognition_service),
) -> LandmarkRecognitionResult:
    """Preprocess uploaded image and trigger landmark recognition."""
    raw_buffer = await preprocessor.read_and_validate_upload(image)
    preprocessed = preprocessor.process(raw_buffer)
    result = await landmark_service.recognize(preprocessed)
    return result


@router.post(
    "/preprocess",
    response_model=PreprocessResult,
    summary="Validate and Preprocess Image Buffer",
    description="Dedicated preprocessing endpoint that inspects, validates, auto-orients, and resizes image buffers.",
    responses={
        413: {"model": ProblemDetails, "description": "Payload Too Large (> 10MB)"},
        415: {"model": ProblemDetails, "description": "Unsupported Media Type"},
        422: {"model": ProblemDetails, "description": "Unprocessable Image or Validation Error"},
    },
)
async def preprocess_image(
    image: Annotated[
        UploadFile, File(description="Uploaded image to normalize (JPEG, PNG, WEBP, <= 10MB)")
    ],
    preprocessor: ImagePreprocessor = Depends(get_preprocessor_service),
) -> PreprocessResult:
    """Validate and normalize image buffer returning metadata."""
    raw_buffer = await preprocessor.read_and_validate_upload(image)
    preprocessed = preprocessor.process(raw_buffer)
    return PreprocessResult(
        success=True,
        message="Image successfully validated, normalized, and preprocessed",
        metadata=preprocessed.metadata,
    )
