"""Vision and Image Preprocessing Schemas."""

from pydantic import BaseModel, Field


class BoundingPoint(BaseModel):
    """Normalized or absolute polygon vertex point."""

    x: int = Field(..., description="X coordinate of the bounding vertex")
    y: int = Field(..., description="Y coordinate of the bounding vertex")


class ImageMetadata(BaseModel):
    """Normalized metadata for processed images."""

    original_width: int = Field(..., description="Original image width in pixels")
    original_height: int = Field(..., description="Original image height in pixels")
    processed_width: int = Field(..., description="Normalized image width in pixels")
    processed_height: int = Field(..., description="Normalized image height in pixels")
    format: str = Field(..., description="Image format (e.g. JPEG, PNG, WEBP)")
    content_type: str = Field(..., description="MIME content type")
    size_bytes: int = Field(..., description="File size in bytes after preprocessing")


class PreprocessResult(BaseModel):
    """Result of image preprocessing pipeline."""

    success: bool = Field(default=True, description="Indicates if preprocessing succeeded")
    message: str = Field(
        default="Image successfully preprocessed and normalized",
        description="Informational processing message",
    )
    metadata: ImageMetadata = Field(..., description="Metadata of the preprocessed image")


class LandmarkRecognitionResult(BaseModel):
    """Recognition result for a detected landmark."""

    landmark_name: str = Field(..., description="Identified landmark name")
    confidence: float = Field(..., description="Detection confidence score between 0.0 and 1.0")
    latitude: float | None = Field(None, description="Landmark geographic latitude if available")
    longitude: float | None = Field(None, description="Landmark geographic longitude if available")
    bounding_poly: list[BoundingPoint] = Field(
        default_factory=list,
        description="Bounding polygon vertices highlighting the recognized landmark",
    )
    metadata: ImageMetadata | None = Field(
        None,
        description="Preprocessing metadata of the analyzed image",
    )
