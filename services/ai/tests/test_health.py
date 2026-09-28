"""Tests for Health Check endpoint."""

from fastapi.testclient import TestClient


def test_root_health_check(client: TestClient) -> None:
    """Verify root GET /health returns 200 OK and expected structure."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "travelai-ai-service"
    assert data["version"] == "0.1.0"


def test_api_v1_health_check(client: TestClient) -> None:
    """Verify GET /api/v1/health returns 200 OK and expected structure."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "travelai-ai-service"
    assert data["version"] == "0.1.0"
