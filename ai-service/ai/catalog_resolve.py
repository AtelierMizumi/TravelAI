"""Match Google Vision web candidates to the landmark catalog.

A candidate resolves only when its normalized text equals a landmark's name, Wikipedia title or one of
its explicit `webNames`. Region names such as "Ba Na Hills" or "Hà Nội" live in `aliases` and are
deliberately NOT used, and there is no fuzzy matching: a wrong landmark would attach wrong services.
"""
import re
import unicodedata

MIN_SCORE = 0.45   # weakest candidate score still treated as evidence
MARGIN = 0.10      # a leader closer than this to another landmark is not decided automatically


def _normalize(value):
    text = unicodedata.normalize("NFKD", str(value or "").casefold().replace("đ", "d"))
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", text)).strip()


def _names(row):
    names = [row.get("name"), row.get("wikipediaTitle"), *row.get("webNames", [])]
    return {key for key in (_normalize(name) for name in names) if key}


def resolve_catalog(candidates, landmarks, minimum=MIN_SCORE, margin=MARGIN):
    """Return {'best': row|None, 'matches': [{code, name, province, score}, ...]} for ranked candidates."""
    index = {}
    for code, row in landmarks.items():
        for key in _names(row):
            index.setdefault(key, code)
    scores = {}
    for item in candidates:
        score = float(item.get("rankingScore", 0))
        code = index.get(_normalize(item.get("name")))
        if code and score >= minimum and score > scores.get(code, 0):
            scores[code] = score
    ranked = sorted(scores.items(), key=lambda pair: pair[1], reverse=True)
    matches = [{"code": code, "name": landmarks[code]["name"], "province": landmarks[code]["province"],
                "score": round(score, 3)} for code, score in ranked]
    decided = bool(ranked) and (len(ranked) == 1 or ranked[0][1] - ranked[1][1] >= margin)
    return {"best": landmarks[ranked[0][0]] if decided else None, "matches": matches}
