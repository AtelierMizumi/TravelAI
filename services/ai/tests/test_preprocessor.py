"""Unit tests for ImagePreprocessor service."""

import io

import pytest
from PIL import Image

from app.config import Settings
from app.core.exceptions import (
    PayloadTooLargeException,
    UnprocessableImageException,
    UnsupportedMediaTypeException,
)
from app.services.preprocessor import ImagePreprocessor, sniff_mime_type


def test_sniff_mime_type_jpeg(sample_jpeg_bytes: bytes) -> None:
    """Sniff identifies JPEG magic bytes."""
    assert sniff_mime_type(sample_jpeg_bytes) == "image/jpeg"


def test_sniff_mime_type_png(sample_png_rgba_bytes: bytes) -> None:
    """Sniff identifies PNG magic bytes."""
    assert sniff_mime_type(sample_png_rgba_bytes) == "image/png"


def test_sniff_mime_type_webp(sample_webp_bytes: bytes) -> None:
    """Sniff identifies WebP magic bytes."""
    assert sniff_mime_type(sample_webp_bytes) == "image/webp"


def test_sniff_mime_type_invalid() -> None:
    """Sniff returns None for non-image or short bytes."""
    assert sniff_mime_type(b"%PDF-1.4 header") is None
    assert sniff_mime_type(b"short") is None


def test_process_valid_jpeg(sample_jpeg_bytes: bytes) -> None:
    """Valid JPEG should be successfully processed and normalized."""
    preprocessor = ImagePreprocessor()
    result = preprocessor.process(sample_jpeg_bytes)

    assert result.content_type == "image/jpeg"
    assert result.metadata.format == "JPEG"
    assert result.metadata.original_width == 200
    assert result.metadata.original_height == 150
    assert result.metadata.processed_width == 200
    assert result.metadata.processed_height == 150
    assert result.metadata.size_bytes == len(result.buffer)
    assert result.pil_image.mode == "RGB"


def test_process_png_rgba_conversion(sample_png_rgba_bytes: bytes) -> None:
    """PNG with RGBA alpha channel should be converted to RGB without error."""
    preprocessor = ImagePreprocessor()
    result = preprocessor.process(sample_png_rgba_bytes)

    assert result.pil_image.mode == "RGB"
    assert result.metadata.original_width == 300
    assert result.metadata.original_height == 200
    assert result.metadata.format == "JPEG"


def test_process_webp_conversion(sample_webp_bytes: bytes) -> None:
    """WebP image should be normalized to JPEG."""
    preprocessor = ImagePreprocessor()
    result = preprocessor.process(sample_webp_bytes)

    assert result.pil_image.mode == "RGB"
    assert result.metadata.format == "JPEG"
    assert result.metadata.processed_width == 150
    assert result.metadata.processed_height == 150


def test_process_resize_large_dimension(sample_large_dimension_image: bytes) -> None:
    """Image exceeding max_image_dimension (2048) should be downscaled proportionally."""
    settings = Settings(max_image_dimension=2048)
    preprocessor = ImagePreprocessor(settings=settings)
    result = preprocessor.process(sample_large_dimension_image)

    assert result.metadata.original_width == 3000
    assert result.metadata.original_height == 1500
    # Scaled down to max dimension 2048: 3000 -> 2048, 1500 -> 1024
    assert result.metadata.processed_width == 2048
    assert result.metadata.processed_height == 1024


def test_process_exif_transposition() -> None:
    """Image with EXIF orientation flag should be transposed to normal orientation."""
    # Create image with width 200, height 100, and EXIF orientation = 6 (90 degrees CW)
    img = Image.new("RGB", (200, 100), (255, 0, 0))
    exif = img.getexif()
    exif[0x0112] = 6  # Orientation tag: 6 = Rotate 90 CW

    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif)
    raw_bytes = buf.getvalue()

    preprocessor = ImagePreprocessor()
    result = preprocessor.process(raw_bytes)

    # Transposition rotates 90 CW, so width and height swap: 200x100 -> 100x200
    assert result.metadata.processed_width == 100
    assert result.metadata.processed_height == 200


def test_process_unsupported_mime_raises_415(sample_fake_pdf_bytes: bytes) -> None:
    """Unsupported file content raises UnsupportedMediaTypeException."""
    preprocessor = ImagePreprocessor()
    with pytest.raises(UnsupportedMediaTypeException) as exc_info:
        preprocessor.process(sample_fake_pdf_bytes)

    assert exc_info.value.status_code == 415
    assert "not supported" in exc_info.value.detail


def test_process_corrupted_image_raises_422(sample_corrupted_bytes: bytes) -> None:
    """Corrupted image stream raises UnprocessableImageException."""
    preprocessor = ImagePreprocessor()
    with pytest.raises(UnprocessableImageException) as exc_info:
        preprocessor.process(sample_corrupted_bytes)

    assert exc_info.value.status_code == 422
    assert "Unable to decode" in exc_info.value.detail


def test_process_payload_too_large_raises_413() -> None:
    """Payload exceeding max size limit raises PayloadTooLargeException."""
    settings = Settings(max_upload_size_bytes=100)  # Tiny 100-byte limit
    preprocessor = ImagePreprocessor(settings=settings)
    oversized_buffer = b"A" * 200

    with pytest.raises(PayloadTooLargeException) as exc_info:
        preprocessor.process(oversized_buffer)

    assert exc_info.value.status_code == 413
    assert "File size exceeds" in exc_info.value.detail
