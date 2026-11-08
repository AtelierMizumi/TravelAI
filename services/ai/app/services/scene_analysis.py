"""Scene categorization from Google Vision label/object signals.

Ported (and re-implemented) from the experimental ai-service v2 stack in the
integration worktree: category is derived from general scene vocabulary only,
never from a hardcoded list of named locations, so unknown scenes simply
report a generic category instead of inventing a place name.
"""

import re
import unicodedata
from difflib import SequenceMatcher

# English scene tag -> Vietnamese display label (priority subset from v2 VI_LABELS).
VI_LABELS: dict[str, str] = {
    "body of water": "mặt nước", "boat": "thuyền",
    "watercraft": "phương tiện đường thủy", "sea": "biển",
    "coast": "bờ biển", "cliff": "vách đá",
    "rock": "đá", "natural landscape": "phong cảnh thiên nhiên",
    "island": "đảo", "mountain": "núi", "forest": "rừng",
    "beach": "bãi biển", "bridge": "cây cầu",
    "building": "tòa nhà", "church": "nhà thờ",
    "cathedral": "nhà thờ chính tòa", "architecture": "kiến trúc",
    "food": "thức ăn", "dish": "món ăn", "noodle": "mì hoặc bún",
    "animal": "động vật", "cat": "mèo", "dog": "chó",
    "car": "ô tô", "vehicle": "phương tiện",
    "tree": "cây", "flower": "hoa", "person": "người",
    "clothing": "quần áo", "dress": "váy",
    "sky": "bầu trời", "cloud": "mây", "river": "sông",
    "lake": "hồ", "waterfall": "thác nước",
    "landmark": "địa danh", "tourist attraction": "điểm tham quan",
    "temple": "đền thờ", "pagoda": "chùa",
}

_SCENE_PRIORITY = [
    "island", "sea", "beach", "mountain", "bridge", "cathedral",
    "church", "building", "food", "animal", "plant", "boat",
]


def normalize(value: object) -> str:
    """Lowercase ASCII-normalize text (strips Vietnamese diacritics)."""
    text = str(value or "").casefold().replace("đ", "d")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", text)).strip()


def clean_text(text: object) -> str:
    """Collapse whitespace in extracted text."""
    return re.sub(r"\s+", " ", str(text or "")).strip()


def similarity(a: str, b: str) -> float:
    """Blend of word overlap and sequence ratio, 0.0-1.0."""
    na, nb = normalize(a), normalize(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    a_words, b_words = set(na.split()), set(nb.split())
    overlap = len(a_words & b_words) / max(1, len(a_words | b_words))
    return 0.55 * overlap + 0.45 * SequenceMatcher(None, na, nb).ratio()


def scene_features(signals: dict) -> tuple[str, str, list[str]]:
    """Return (category, vietnamese_title, observed_labels) for a scene.

    Category only ever derives from generic tags, so callers can safely fall
    back to a description when no concrete landmark is known.
    """
    labels = {normalize(item.get("name", "")): item.get("score", 0.0) for item in signals.get("labels", [])}
    objects = {
        normalize(item.get("name", "")): item.get("score", 0.0) for item in signals.get("objects", [])
    }
    all_tags = set(labels) | set(objects)

    def has(*terms: str) -> bool:
        return any(normalize(term) in all_tags for term in terms)

    if has("island", "archipelago", "bay", "sea", "ocean", "coast", "beach"):
        category, title = "nature", "Phong cảnh biển và đảo"
    elif has("mountain", "hill", "valley", "forest", "waterfall", "lake"):
        category, title = "nature", "Phong cảnh thiên nhiên"
    elif has("bridge", "cathedral", "church", "temple", "monument", "building", "architecture", "pagoda"):
        category, title = "place", "Công trình kiến trúc"
    elif has("food", "dish", "cuisine", "meal"):
        category, title = "food", "Món ăn"
    elif has("dog", "cat", "animal", "bird", "mammal", "wildlife"):
        category, title = "animal", "Động vật"
    elif has("person", "people", "human", "face"):
        category, title = "person", "Con người"
    elif has("car", "vehicle", "motorcycle", "bus", "train"):
        category, title = "vehicle", "Phương tiện giao thông"
    elif has("plant", "flower", "tree"):
        category, title = "plant", "Thực vật"
    else:
        category, title = "general", "Nội dung hình ảnh"

    # Prefer scene labels over incidental small objects (e.g. a boat in a bay).
    observed: list[str] = []
    for term in _SCENE_PRIORITY:
        if term in all_tags and term in VI_LABELS:
            observed.append(VI_LABELS[term])
    for item in (signals.get("labels", []) + signals.get("objects", []))[:17]:
        vi_label = VI_LABELS.get(normalize(item.get("name", "")))
        if vi_label and vi_label not in observed:
            observed.append(vi_label)

    return category, title, observed[:7]
