"""Image Preprocessing and Normalization Pipeline for TravelAI Vision Microservice."""

import io
import logging
from dataclasses import dataclass

from fastapi import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.config import Settings, get_settings
from app.core.exceptions import (
    PayloadTooLargeException,
    UnprocessableImageException,
    UnsupportedMediaTypeException,
)
from app.schemas.vision import ImageMetadata

logger = logging.getLogger("travelai.ai.preprocessor")


# Standard Magic Byte Signatures for allowed MIME types
MAGIC_SIGNATURES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
}


def sniff_mime_type(buffer: bytes) -> str | None:
    """Inspect buffer magic bytes to determine actual image MIME type."""
    if len(buffer) < 12:
        return None

    # Check JPEG
    if buffer.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"

    # Check PNG
    if buffer.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    # Check WebP (RIFF....WEBP)
    if buffer[:4] == b"RIFF" and buffer[8:12] == b"WEBP":
        return "image/webp"

    return None


@dataclass
class PreprocessedImage:
    """Container holding preprocessed image bytes and associated metadata."""

    buffer: bytes
    metadata: ImageMetadata
    pil_image: Image.Image
    content_type: str = "image/jpeg"


class ImagePreprocessor:
    """Service responsible for validating, normalizing, and compressing uploaded images."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.allowed_mimes: set[str] = set(self.settings.allowed_mime_types)
        self.max_size: int = self.settings.max_upload_size_bytes
        self.max_dimension: int = self.settings.max_image_dimension
        self.jpeg_quality: int = self.settings.jpeg_quality

    async def read_and_validate_upload(self, upload_file: UploadFile) -> bytes:
        """Stream upload file in chunks, enforcing hard byte limit and MIME validation."""
        chunk_size = 64 * 1024  # 64 KB
        total_read = 0
        chunks = []

        while True:
            chunk = await upload_file.read(chunk_size)
            if not chunk:
                break
            total_read += len(chunk)
            if total_read > self.max_size:
                max_mb = self.max_size // (1024 * 1024)
                raise PayloadTooLargeException(
                    detail=f"File size exceeds maximum allowed limit of {self.max_size} bytes ({max_mb}MB)"
                )
            chunks.append(chunk)

        raw_buffer = b"".join(chunks)

        if not raw_buffer:
            raise UnprocessableImageException(detail="Uploaded image buffer is empty.")

        # Validate MIME type using magic bytes
        sniffed_mime = sniff_mime_type(raw_buffer)
        declared_mime = upload_file.content_type

        # If magic bytes sniffed an unsupported type or failed to sniff recognized type
        effective_mime = sniffed_mime or declared_mime
        if not sniffed_mime or sniffed_mime not in self.allowed_mimes:
            allowed_list_str = ", ".join(sorted(self.allowed_mimes))
            reported_mime = effective_mime or "application/octet-stream"
            raise UnsupportedMediaTypeException(
                detail=f"File type {reported_mime} is not supported. Allowed: {allowed_list_str}"
            )

        return raw_buffer

    def process(self, raw_buffer: bytes) -> PreprocessedImage:
        """Execute full preprocessing pipeline on raw image buffer."""
        # 1. Enforce size limit on raw buffer
        if len(raw_buffer) > self.max_size:
            max_mb = self.max_size // (1024 * 1024)
            raise PayloadTooLargeException(
                detail=f"File size exceeds maximum allowed limit of {self.max_size} bytes ({max_mb}MB)"
            )

        # 2. Sniff magic bytes
        sniffed_mime = sniff_mime_type(raw_buffer)
        if not sniffed_mime or sniffed_mime not in self.allowed_mimes:
            allowed_list_str = ", ".join(sorted(self.allowed_mimes))
            reported_mime = sniffed_mime or "application/octet-stream"
            raise UnsupportedMediaTypeException(
                detail=f"File type {reported_mime} is not supported. Allowed: {allowed_list_str}"
            )

        # 3. Decode with Pillow and verify integrity
        try:
            pil_image = Image.open(io.BytesIO(raw_buffer))
            pil_image.load()  # Force load pixel data to detect corrupted streams
        except (UnidentifiedImageError, OSError, ValueError) as err:
            logger.warning("Corrupted image stream received: %s", str(err))
            raise UnprocessableImageException(
                detail="Unable to decode image buffer. File may be corrupted."
            ) from err

        original_width, original_height = pil_image.size

        # 4. Auto-orient EXIF orientation
        try:
            pil_image = ImageOps.exif_transpose(pil_image) or pil_image
        except Exception as err:
            logger.debug("EXIF transposition bypassed: %s", str(err))

        # 5. Normalize color channels to RGB
        if pil_image.mode in ("RGBA", "LA") or (
            pil_image.mode == "P" and "transparency" in pil_image.info
        ):
            # Convert alpha channels with clean white background
            rgba_image = pil_image.convert("RGBA")
            background = Image.new("RGB", rgba_image.size, (255, 255, 255))
            background.paste(rgba_image, mask=rgba_image.split()[3])
            pil_image = background
        elif pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")

        # 6. Resize if maximum dimension exceeds threshold
        cur_width, cur_height = pil_image.size
        max_dim = max(cur_width, cur_height)
        if max_dim > self.max_dimension:
            scale = self.max_dimension / max_dim
            new_width = max(1, int(round(cur_width * scale)))
            new_height = max(1, int(round(cur_height * scale)))
            pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        processed_width, processed_height = pil_image.size

        # 7. Compress and serialize to optimized JPEG in-memory stream
        output_stream = io.BytesIO()
        pil_image.save(
            output_stream,
            format="JPEG",
            quality=self.jpeg_quality,
            optimize=True,
        )
        compressed_bytes = output_stream.getvalue()

        metadata = ImageMetadata(
            original_width=original_width,
            original_height=original_height,
            processed_width=processed_width,
            processed_height=processed_height,
            format="JPEG",
            content_type="image/jpeg",
            size_bytes=len(compressed_bytes),
        )

        return PreprocessedImage(
            buffer=compressed_bytes,
            metadata=metadata,
            pil_image=pil_image,
            content_type="image/jpeg",
        )
