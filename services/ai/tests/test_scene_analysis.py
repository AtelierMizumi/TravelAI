"""Unit tests for scene analysis (ported category scoring from v2 stack)."""

from app.services.scene_analysis import normalize, scene_features, similarity


def _signals(labels=None, objects=None) -> dict:
    return {
        "labels": [{"name": n, "score": s} for n, s in (labels or [])],
        "objects": [{"name": n, "score": s} for n, s in (objects or [])],
    }


def test_normalize_strips_vietnamese_diacritics() -> None:
    assert normalize("Tháp Rùa — Hồ Gươm") == "thap rua ho guom"


def test_scene_features_marks_sea_coastline_as_nature() -> None:
    category, title, observed = scene_features(_signals(labels=[("sea", 0.9), ("beach", 0.8)]))
    assert category == "nature"
    assert title == "Phong cảnh biển và đảo"
    assert observed[:2] == ["biển", "bãi biển"]


def test_scene_features_marks_temple_as_place() -> None:
    category, title, observed = scene_features(_signals(labels=[("temple", 0.7)]))
    assert category == "place"
    assert observed[0] == "đền thờ" or observed[0] == "chùa"


def test_scene_features_empty_signals_is_general() -> None:
    category, title, observed = scene_features(_signals())
    assert category == "general"
    assert observed == []


def test_similarity_prefers_same_place_name() -> None:
    assert similarity("Turtle Tower", "Turtle Tower") == 1.0
    assert similarity("Turtle Tower", "Ha Long Bay") < 0.4
