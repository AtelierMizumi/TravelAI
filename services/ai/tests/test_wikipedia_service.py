"""Unit tests for Wikipedia entity lookup (Vietnamese-first, fail-open)."""

import httpx

from app.services.wikipedia_service import MEDIA_REJECTION_TERMS, fetch_wikipedia_summary


def _transport(handler):
    return httpx.MockTransport(handler)


def test_fetch_returns_vietnamese_summary_on_title_match() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        host = request.url.host or ""
        params = dict(request.url.params)
        if "list" in params:
            if host.startswith("vi."):
                return httpx.Response(
                    200,
                    json={"query": {"search": [{"pageid": 1, "title": "Tháp Rùa"}]}},
                )
            return httpx.Response(
                200,
                json={"query": {"search": [{"pageid": 2, "title": "Turtle Tower"}]}},
            )
        pageid = params.get("pageids")
        if pageid == "2":
            return httpx.Response(
                200,
                json={
                    "query": {
                        "pages": {
                            "2": {
                                "title": "Turtle Tower",
                                "extract": "Turtle Tower is a small tower on an islet in Hoan Kiem Lake.",
                                "fullurl": "https://en.wikipedia.org/wiki/Turtle_Tower",
                            }
                        }
                    }
                },
            )
        return httpx.Response(
            200,
            json={
                "query": {
                    "pages": {
                        "1": {
                            "title": "Tháp Rùa",
                            "extract": "Tháp Rùa là một ngôi tháp nhỏ nằm trên đảo Ngọc Sơn.",
                            "fullurl": "https://vi.wikipedia.org/wiki/Thap_Rua",
                        }
                    }
                }
            },
        )

    result = fetch_wikipedia_summary(
        "Turtle Tower", category="place", transport=_transport(handler)
    )

    assert result is not None
    assert result["title"] in {"Tháp Rùa", "Turtle Tower"}
    assert result["language"] in {"vi", "en"}
    assert "Turtle Tower" in result["description"] or "Tháp Rùa" in result["description"]


def test_fetch_returns_none_on_http_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500)

    assert fetch_wikipedia_summary("Turtle Tower", category="place", transport=_transport(handler)) is None


def test_fetch_rejects_disambiguation_and_media_pages() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        params = dict(request.url.params)
        if "list" in params:
            return httpx.Response(
                200,
                json={"query": {"search": [{"pageid": 9, "title": "Rock album"}]}},
            )
        return httpx.Response(
            200,
            json={
                "query": {
                    "pages": {
                        "9": {
                            "title": "Rock album",
                            "extract": "A rock album is a music album...",
                            "fullurl": "https://en.wikipedia.org/wiki/Rock_album",
                        }
                    }
                }
            },
        )

    assert fetch_wikipedia_summary("Rock album", category="place", transport=_transport(handler)) is None


def test_fetch_requires_title_match_threshold() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        params = dict(request.url.params)
        if "list" in params:
            return httpx.Response(
                200,
                json={"query": {"search": [{"pageid": 3, "title": "Zebra Crossing Patterns"}]}},
            )
        return httpx.Response(
            200,
            json={
                "query": {
                    "pages": {
                        "3": {
                            "title": "Zebra Crossing Patterns",
                            "extract": "Unrelated article text about crossings.",
                            "fullurl": "https://en.wikipedia.org/wiki/Zebra_Crossing",
                        }
                    }
                }
            },
        )

    assert fetch_wikipedia_summary("Turtle Tower", category="place", transport=_transport(handler)) is None


def test_media_rejection_terms_constant() -> None:
    assert "rock album" in MEDIA_REJECTION_TERMS
