"""Test fixtures and helpers."""

import io
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import Settings, get_settings
from app.main import create_app


def create_test_image(
    format_name: str = "JPEG",
    size: tuple[int, int] = (100, 100),
    color: tuple[int, int, int] = (255, 0, 0),
    mode: str = "RGB",
) -> bytes:
    """Generate in-memory valid image bytes."""
    img = Image.new(mode, size, color)
    buf = io.BytesIO()
    img.save(buf, format=format_name)
    return buf.getvalue()


@pytest.fixture
def sample_jpeg_bytes() -> bytes:
    """Valid small JPEG image bytes."""
    return create_test_image("JPEG", (200, 150), (10, 150, 200))


@pytest.fixture
def sample_png_rgba_bytes() -> bytes:
    """Valid PNG with RGBA transparency."""
    img = Image.new("RGBA", (300, 200), (0, 255, 0, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sample_webp_bytes() -> bytes:
    """Valid WebP image bytes."""
    return create_test_image("WEBP", (150, 150), (200, 100, 50))


@pytest.fixture
def sample_large_dimension_image() -> bytes:
    """Valid JPEG with dimension > 2048px (e.g. 3000 x 1500)."""
    return create_test_image("JPEG", (3000, 1500), (50, 50, 50))


@pytest.fixture
def sample_corrupted_bytes() -> bytes:
    """Bytes with JPEG header but corrupted pixel stream."""
    return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00corrupted_truncated_stream"


@pytest.fixture
def sample_fake_pdf_bytes() -> bytes:
    """PDF file disguised or plain."""
    return b"%PDF-1.4\n%Fake PDF binary file content\n%%EOF"


@pytest.fixture
def test_settings() -> Settings:
    """Override settings for test isolation."""
    return Settings(
        vision_mock_enabled=True,
        max_upload_size_bytes=10 * 1024 * 1024,
        max_image_dimension=2048,
    )


@pytest.fixture
def client(test_settings: Settings) -> Generator[TestClient, None, None]:
    """TestClient fixture with test settings."""
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
