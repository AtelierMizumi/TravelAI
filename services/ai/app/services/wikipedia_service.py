"""Fail-open Wikipedia entity lookup for landmark descriptions.

Ported from the experimental ai-service v2 stack: prefers Vietnamese Wikipedia,
then English, and only returns after title-similarity + ambiguity checks so a
wrong article is never attached to a recognition result.
"""

import logging

import httpx

from app.services.scene_analysis import clean_text, normalize, similarity

logger = logging.getLogger("travelai.ai.wikipedia")

MEDIA_REJECTION_TERMS = {
    "studio album", "music album", "rock album",
    "singer songwriter", "television series",
    "feature film", "video game", "discography",
}

# Wikimedia requires a descriptive User-Agent identifying the app + contact;
# generic names are blocked with HTTP 403 (robot policy).
_USER_AGENT = (
    "TravelAI/1.0 (https://github.com/AtelierMizumi/TravelAI; "
    "contact contact@minhthuan.dev) ai-landmark-recognition"
)


def _search_titles(client: httpx.Client, endpoint: str, term: str) -> dict[int, str]:
    response = client.get(
        endpoint,
        params={
            "action": "query",
            "list": "search",
            "srsearch": term,
            "srlimit": 8,
            "format": "json",
        },
    )
    response.raise_for_status()
    hits: dict[int, str] = {}
    for hit in response.json().get("query", {}).get("search", []):
        pageid = hit.get("pageid")
        if pageid:
            hits[pageid] = hit.get("title", "")
    return hits


def _fetch_extracts(client: httpx.Client, endpoint: str, pageids: list[int]) -> dict:
    response = client.get(
        endpoint,
        params={
            "action": "query",
            "prop": "extracts|info|pageprops",
            "pageids": "|".join(map(str, pageids)),
            "exintro": 1,
            "explaintext": 1,
            "exchars": 1400,
            "inprop": "url",
            "format": "json",
        },
    )
    response.raise_for_status()
    return response.json().get("query", {}).get("pages", {})


def fetch_wikipedia_summary(
    query: str,
    category: str,
    location_hint: str | None = None,
    *,
    transport: httpx.BaseTransport | None = None,
    timeout: float = 8.0,
    max_chars: int = 400,
) -> dict | None:
    """Return {title, description, url, language} for a confident entity match.

    Never raises: any HTTP/JSON failure yields None so recognition degrades
    gracefully without the encyclopedic enrichment.
    """
    if not query:
        return None

    search_terms = [f"{query} {location_hint}"] if location_hint else []
    search_terms.append(query)

    try:
        with httpx.Client(
            transport=transport,
            timeout=timeout,
            headers={"User-Agent": _USER_AGENT},
        ) as client:
            for language in ("vi", "en"):
                endpoint = f"https://{language}.wikipedia.org/w/api.php"
                hits: dict[int, str] = {}
                for term in search_terms:
                    try:
                        hits.update(_search_titles(client, endpoint, term))
                    except (httpx.HTTPError, ValueError):
                        logger.warning("Wikipedia search failed (%s)", language)
                if not hits:
                    continue

                try:
                    pages = _fetch_extracts(client, endpoint, list(hits.keys()))
                except (httpx.HTTPError, ValueError):
                    logger.warning("Wikipedia details failed (%s)", language)
                    continue

                ranked: list[dict] = []
                for page in pages.values():
                    if "disambiguation" in page.get("pageprops", {}):
                        continue
                    title = clean_text(page.get("title"))
                    extract = clean_text(page.get("extract"))
                    if not title or not extract:
                        continue
                    title_match = similarity(query, title)
                    if title_match < 0.62:
                        continue
                    combined = normalize(title + " " + extract)
                    if category in {"place", "nature"} and any(
                        normalize(term) in combined for term in MEDIA_REJECTION_TERMS
                    ):
                        continue
                    location_match = 0.0
                    if location_hint:
                        hint = normalize(location_hint)
                        if hint and hint in combined:
                            location_match = 0.35
                    hint_words = [
                        word
                        for word in normalize(location_hint or "").split()
                        if len(word) >= 4
                        and word
                        not in {
                            "bridge", "church", "cathedral", "mountain",
                            "island", "islands", "vietnam", "travel",
                            "tourism", "peak", "hills", "river",
                        }
                    ]
                    if (
                        category in {"place", "nature"}
                        and hint_words
                        and not any(word in combined for word in hint_words)
                    ):
                        continue
                    ranked.append(
                        {
                            "score": title_match + location_match,
                            "title": title,
                            "extract": extract[:max_chars],
                            "url": page.get("fullurl"),
                            "language": language,
                        }
                    )

                ranked.sort(key=lambda item: item["score"], reverse=True)
                if not ranked:
                    continue
                best = ranked[0]
                second = ranked[1] if len(ranked) > 1 else None
                if second and best["score"] - second["score"] < 0.08:
                    continue  # ambiguous between two articles: attach neither
                return {
                    "title": best["title"],
                    "description": best["extract"],
                    "url": best["url"],
                    "language": best["language"],
                }
    except Exception:  # noqa: BLE001 - fail-open by design
        logger.warning("Wikipedia lookup failed for %r", query)

    return None
