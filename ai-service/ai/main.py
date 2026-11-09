
import os
import re
import json
import base64
import logging
import unicodedata
from pathlib import Path
from difflib import SequenceMatcher

import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import vision
from google.cloud.vision_v1.services.image_annotator.transports import (
    ImageAnnotatorRestTransport,
)

# ============================================================
# CONFIG
# ============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("travelai.ai")
# Stop repeated paid/unavailable Gemini requests for the current process.
gemini_blocked = False
gemini_last_error = None

BASE_DIR = Path(__file__).resolve().parent
MAX_IMAGE_SIZE = 10 * 1024 * 1024

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL", "gemini-3.5-flash-lite"
).strip()

WIKIMEDIA_USER_AGENT = os.getenv(
    "WIKIMEDIA_USER_AGENT",
    "TravelAI/1.0 (educational image recognition)"
)

if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    key_file = BASE_DIR / "service-account.json"
    if key_file.is_file():
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(key_file)

app = FastAPI(
    title="TravelAI Image Recognition",
    version="7.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "AI_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081,http://localhost:8084,http://127.0.0.1:8084"
    ).split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

http = requests.Session()
http.headers.update({
    "User-Agent": WIKIMEDIA_USER_AGENT
})

try:
    vision_client = vision.ImageAnnotatorClient(
        transport=ImageAnnotatorRestTransport()
    )
    logger.info("Google Vision REST ready")
except Exception:
    logger.exception("Google Vision initialization failed")
    vision_client = None


# ============================================================
# UTILITIES
# ============================================================

def normalize(value):
    text = str(value or "").casefold().replace("đ", "d")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )
    return re.sub(r"\s+", " ", re.sub(
        r"[^a-z0-9 ]", " ", text
    )).strip()


def similarity(a, b):
    a, b = normalize(a), normalize(b)
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    a_words, b_words = set(a.split()), set(b.split())
    overlap = len(a_words & b_words) / max(
        1, len(a_words | b_words)
    )
    sequence = SequenceMatcher(None, a, b).ratio()
    return 0.55 * overlap + 0.45 * sequence


def image_mime(content):
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if (
        len(content) >= 12
        and content[:4] == b"RIFF"
        and content[8:12] == b"WEBP"
    ):
        return "image/webp"
    return None


def clean_text(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def parse_json_text(text):
    text = str(text or "").strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


# ============================================================
# GOOGLE CLOUD VISION
# ============================================================

def analyze_google(content):
    if vision_client is None:
        raise HTTPException(503, "Google Cloud Vision chưa được cấu hình trên server.")

    try:
        response = vision_client.annotate_image({
            "image": vision.Image(content=content),
            "features": [
                {
                    "type_": vision.Feature.Type.LANDMARK_DETECTION,
                    "max_results": 12
                },
                {
                    "type_": vision.Feature.Type.WEB_DETECTION,
                    "max_results": 25
                },
                {
                    "type_": vision.Feature.Type.LABEL_DETECTION,
                    "max_results": 20
                },
                {
                    "type_": vision.Feature.Type.OBJECT_LOCALIZATION,
                    "max_results": 15
                },
                {
                    "type_": vision.Feature.Type.TEXT_DETECTION
                }
            ]
        }, timeout=30)

        if response.error.message:
            raise RuntimeError(response.error.message)

        landmarks = []
        for item in response.landmark_annotations:
            coords = None
            if item.locations:
                point = item.locations[0].lat_lng
                coords = {
                    "latitude": float(point.latitude),
                    "longitude": float(point.longitude)
                }
            landmarks.append({
                "name": item.description,
                "score": float(item.score),
                "coordinates": coords
            })

        web = response.web_detection
        entities = []
        guesses = []

        if web:
            entities = [
                {
                    "name": item.description,
                    "score": float(item.score)
                }
                for item in web.web_entities
                if item.description
            ]
            guesses = [
                item.label
                for item in web.best_guess_labels
                if item.label
            ]

        labels = [
            {
                "name": item.description,
                "score": float(item.score)
            }
            for item in response.label_annotations
            if item.description
        ]

        objects = [
            {
                "name": item.name,
                "score": float(item.score),
                "bounds": [{"x": float(vertex.x), "y": float(vertex.y)}
                           for vertex in item.bounding_poly.normalized_vertices]
            }
            for item in response.localized_object_annotations
            if item.name
        ]

        ocr = ""
        if response.full_text_annotation:
            ocr = response.full_text_annotation.text[:1000]

        for collection in (landmarks, entities, labels, objects):
            collection.sort(
                key=lambda row: row["score"],
                reverse=True
            )


        return {
            "landmarks": landmarks,
            "entities": entities,
            "guesses": guesses,
            "labels": labels,
            "objects": objects,
            "ocr": ocr
        }

    except Exception as error:
        logger.error("Google Vision request failed (%s)", type(error).__name__)
        raise HTTPException(502, "Google Cloud Vision không xử lý được yêu cầu. Kiểm tra quyền API, hạn mức và kết nối server.") from error


# ============================================================
# DYNAMIC CANDIDATES
# ============================================================

def build_candidates(signals):
    candidates = {}

    def add(name, score, source):
        name = clean_text(name)
        key = normalize(name)
        if not key or len(key) < 3:
            return

        if key not in candidates:
            candidates[key] = {
                "name": name,
                "rankingScore": 0.0,
                "sources": set()
            }

        candidates[key]["rankingScore"] += score
        candidates[key]["sources"].add(source)

    for entity in signals["entities"][:15]:
        add(
            entity["name"],
            min(entity["score"], 2.0) * 0.70,
            "web"
        )

    for landmark in signals["landmarks"]:
        agreement = max(
            (
                similarity(
                    landmark["name"], item["name"]
                )
                for item in signals["entities"][:15]
            ),
            default=0.0
        )

        weight = (
            1.0 if agreement >= 0.75
            else 0.5 if agreement >= 0.5
            else 0.15
        )

        add(
            landmark["name"],
            landmark["score"] * weight,
            "landmark"
        )

    ranked = []
    for row in candidates.values():
        sources = sorted(row["sources"])
        score = row["rankingScore"]

        if "web" in sources and "landmark" in sources:
            score += 0.2

        ranked.append({
            "name": row["name"],
            "rankingScore": round(score, 3),
            "source": "+".join(sources)
        })

    return sorted(
        ranked,
        key=lambda item: item["rankingScore"],
        reverse=True
    )[:10]


# ============================================================
# GEMINI MULTIMODAL ANALYSIS
# ============================================================

def analyze_gemini(content, mime, signals):
    global gemini_blocked, gemini_last_error
    # Gemini is deliberately disabled: this service does not require paid credits.
    return None
    if not GEMINI_API_KEY or gemini_blocked:
        return None

    evidence = {
        "landmarks": signals["landmarks"][:5],
        "webEntities": signals["entities"][:8],
        "bestGuesses": signals["guesses"][:3],
        "labels": signals["labels"][:12],
        "objects": signals["objects"][:8],
        "ocr": signals["ocr"][:400]
    }

    prompt = """
Bạn là hệ thống phân tích hình ảnh TravelAI.

Hãy QUAN SÁT TRỰC TIẾP ảnh đính kèm và sử dụng
thông tin Google Vision bên dưới như bằng chứng phụ.

QUY TẮC:
1. Tất cả câu mô tả, giải thích phải bằng TIẾNG VIỆT.
2. Nhận diện linh hoạt mọi loại ảnh: địa danh,
   món ăn, động vật, trang phục, đồ vật, cảnh vật...
3. Không dùng danh sách tên địa danh cố định.
4. Web Entities chỉ là gợi ý, không phải sự thật.
5. Nếu không chắc tên địa danh cụ thể, để
   exactName = null và mô tả cảnh thực sự thấy.
6. Không tự bịa vị trí, lịch sử, nguồn gốc,
   nguyên liệu hoặc thông tin không thể xác minh.
7. Nếu ảnh có nhiều đối tượng, mô tả đối tượng chính
   và các chi tiết quan trọng.
8. Nếu chỉ nhận ra loại đối tượng, vẫn trả displayName
   bằng tiếng Việt.
9. Nếu là tên riêng đã biết chắc, có thể giữ tên
   quốc tế trong exactName; displayName ưu tiên
   tên tiếng Việt thông dụng nếu biết.
10. Trả về JSON hợp lệ, không markdown.

CẤU TRÚC JSON:
{
  "displayName": "Tên hiển thị tiếng Việt",
  "exactName": null,
  "category": "place",
  "description": "Mô tả tự nhiên bằng tiếng Việt, 2-4 câu.",
  "recognitionStatus": "predicted",
  "reason": "Giải thích ngắn bằng tiếng Việt",
  "searchQuery": null,
  "locationHint": null
}

category có thể là:
place, nature, food, clothing, animal,
object, vehicle, plant, person, document,
art, general.

recognitionStatus:
identified: nhận diện tên riêng có bằng chứng mạnh.
predicted: dự đoán có cơ sở.
unknown: không đủ bằng chứng xác định tên riêng,
nhưng vẫn mô tả nội dung quan sát được.

searchQuery chỉ điền khi có tên riêng đủ rõ để
tìm Wikipedia. Nếu không chắc, đặt null.

locationHint là địa phương/quốc gia được hỗ trợ
bởi bằng chứng, không được đoán từ IP người dùng.

DỮ LIỆU GOOGLE VISION:
""" + json.dumps(evidence, ensure_ascii=False)

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{GEMINI_MODEL}:generateContent"
    )

    payload = {
        "contents": [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": mime,
                        "data": base64.b64encode(
                            content
                        ).decode("ascii")
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
            "maxOutputTokens": 1400
        }
    }

    try:
        response = requests.post(
            url,
            headers={
                "x-goog-api-key": GEMINI_API_KEY,
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        if not response.ok:
            error_text = response.text[:1400]
            gemini_last_error = f"HTTP {response.status_code}: {error_text}"
            logger.error("Gemini API failed: %s", gemini_last_error)
            if response.status_code in (401, 402, 403, 404):
                gemini_blocked = True
            return None

        data = response.json()
        candidates = data.get("candidates", [])

        if not candidates:
            logger.warning(
                "Gemini returned no candidates: %s",
                str(data)[:500]
            )
            return None

        parts = candidates[0].get(
            "content", {}
        ).get("parts", [])

        text = "".join(
            part.get("text", "")
            for part in parts
        )

        result = parse_json_text(text)

        if not isinstance(result, dict):
            return None

        description = clean_text(
            result.get("description")
        )
        display_name = clean_text(
            result.get("displayName")
        )

        if not description or not display_name:
            return None

        allowed_categories = {
            "place", "nature", "food", "clothing",
            "animal", "object", "vehicle", "plant",
            "person", "document", "art", "general"
        }

        category = result.get("category", "general")
        if category not in allowed_categories:
            category = "general"

        status = result.get(
            "recognitionStatus", "unknown"
        )
        if status not in {
            "identified", "predicted", "unknown"
        }:
            status = "unknown"

        exact_name = clean_text(
            result.get("exactName")
        ) or None

        # An uncertain proper name must not be
        # presented as a confirmed identity.
        if status == "unknown":
            exact_name = None

        search_query = clean_text(
            result.get("searchQuery")
        ) or None

        if not exact_name:
            search_query = None

        return {
            "displayName": display_name,
            "exactName": exact_name,
            "category": category,
            "description": description,
            "recognitionStatus": status,
            "reason": clean_text(
                result.get("reason")
            ),
            "searchQuery": search_query,
            "locationHint": clean_text(
                result.get("locationHint")
            ) or None
        }

    except (requests.RequestException, ValueError, KeyError):
        logger.exception("Gemini analysis failed")
        return None


# ============================================================
# GOOGLE VISION FALLBACK
# ============================================================

# Generic label translations for scene descriptions, not a database
# of named landmarks or individual products.
VI_LABELS = {
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
}


def scene_features(signals):
    """Use general category labels, never a list of named locations."""
    labels = {normalize(x["name"]): x["score"] for x in signals["labels"]}
    objects = {normalize(x["name"]): x["score"] for x in signals["objects"]}
    all_tags = set(labels) | set(objects)

    def has(*terms):
        return any(normalize(t) in all_tags for t in terms)

    if has("island", "archipelago", "bay", "sea", "ocean", "coast", "beach"):
        category, title = "nature", "Phong cảnh biển và đảo"
    elif has("mountain", "hill", "valley", "forest", "waterfall", "lake"):
        category, title = "nature", "Phong cảnh thiên nhiên"
    elif has("bridge", "cathedral", "church", "temple", "monument", "building", "architecture"):
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

    # Prefer scene labels over incidental small objects, e.g. a boat in a bay.
    priority = ["island", "sea", "beach", "mountain", "bridge", "cathedral",
                "church", "building", "food", "animal", "plant", "boat"]
    observed = []
    for term in priority:
        if term in all_tags and term in VI_LABELS:
            observed.append(VI_LABELS[term])
    for item in signals["labels"][:12] + signals["objects"][:5]:
        vi = VI_LABELS.get(normalize(item["name"]))
        if vi and vi not in observed:
            observed.append(vi)
    return category, title, observed[:7]


def fallback_analysis(signals):
    """Rank live Google evidence, never a list of known place names."""
    category, scene, observed = scene_features(signals)
    guesses = signals["guesses"][:3]
    # Remove image extensions / generic search terms from best-guess text.
    guess_tokens = []
    for guess in guesses:
        cleaned = re.sub(r"\.(?:png|jpe?g|webp|gif)\b", " ", guess, flags=re.I)
        guess_tokens.append(set(normalize(cleaned).split()) - {
            "image", "photo", "picture", "wallpaper", "stock", "png", "jpg", "jpeg"})

    # Merge duplicate entities; duplicates must not masquerade as independent evidence.
    merged = {}
    for item in signals["entities"]:
        key = normalize(item["name"])
        if key and (key not in merged or item["score"] > merged[key]["score"]):
            merged[key] = item
    ranked = sorted(merged.values(), key=lambda item: item["score"], reverse=True)
    first = ranked[0] if ranked else None
    second = ranked[1] if len(ranked) > 1 else None
    margin = first["score"] - second["score"] if first and second else 0.0

    # General landmark/scene vocabulary is not a hardcoded list of locations.
    place_words = {"bridge", "pagoda", "temple", "cathedral", "church",
                   "monument", "palace", "tower", "castle", "shrine", "mosque"}
    nature_words = {"mountain", "peak", "valley", "waterfall", "island", "bay"}
    guess_words = set().union(*guess_tokens) if guess_tokens else set()
    first_words = set(normalize(first["name"]).split()) if first else set()
    if category == "general":
        if (first_words | guess_words) & place_words:
            category, scene = "place", "Công trình kiến trúc"
        elif (first_words | guess_words) & nature_words:
            category, scene = "nature", "Phong cảnh thiên nhiên"

    # Guess overlap boosts only the already strongest candidate; no place-name rules.
    # Example: 'chua thien mu png' overlaps 'Thien Mu Pagoda' on 'thien mu'.
    guess_overlap = max((len(first_words & words) / max(1, len(first_words))
                         for words in guess_tokens), default=0.0)
    corroborated_landmark = next((l for l in signals["landmarks"]
        if l["score"] >= 0.8 and first and similarity(l["name"], first["name"]) >= 0.85), None)

    # A vague 'Vietnam islands' guess cannot prove which island is shown.
    specific_guess = guess_overlap >= 0.45 and len(first_words & guess_words) >= 2
    strong_margin = bool(first and first["score"] >= 1.35 and margin >= 0.33)
    moderate_margin = bool(first and first["score"] >= 1.02 and margin >= 0.22)
    exact = None
    if corroborated_landmark:
        exact = corroborated_landmark["name"]
    elif first and category in {"place", "nature"} and (
        strong_margin or (specific_guess and first["score"] >= 1.35 and margin >= 0.12) or (moderate_margin and (specific_guess or bool(first_words & place_words)))
    ):
        exact = first["name"]

    status = "predicted" if exact else "unknown"
    display = exact or scene
    details = ("Các đặc điểm được nhận diện gồm " + ", ".join(observed) + ".") if observed else (
        "Google Vision chưa cung cấp đủ nhãn để mô tả chi tiết cảnh vật.")
    if exact:
        description = (f"Google Vision dự đoán ảnh có thể là {exact}. " + details +
                       " Đây là dự đoán từ tín hiệu thị giác, chưa phải xác minh tuyệt đối.")
    else:
        description = f"Hình ảnh có thể thuộc nhóm {scene.lower()}. " + details
        if ranked:
            description += " Chưa đủ bằng chứng để khẳng định tên địa danh cụ thể."

    logger.info("Fallback ranking: top=%s margin=%.3f guessOverlap=%.2f category=%s",
                first["name"] if first else None, margin, guess_overlap, category)
    return {
        "displayName": display, "exactName": exact, "category": category,
        "description": description, "recognitionStatus": status,
        "reason": "Dự đoán dựa trên Google Vision và sự đồng thuận giữa các tín hiệu.",
        "searchQuery": exact, "locationHint": guesses[0] if guesses else None
    }


# ============================================================
# WIKIPEDIA - ENTITY MATCHING
# ============================================================

MEDIA_REJECTION_TERMS = {
    "studio album", "music album", "rock album",
    "singer songwriter", "television series",
    "feature film", "video game", "discography"
}


def wikipedia_lookup(query, category, location_hint=None):
    if not query:
        return None

    search_terms = []

    if location_hint:
        search_terms.append(
            f"{query} {location_hint}"
        )

    search_terms.append(query)

    # Prefer Vietnamese, but do not blindly accept
    # the first search result.
    for language in ("vi", "en"):
        endpoint = (
            f"https://{language}.wikipedia.org/w/api.php"
        )
        hits_by_id = {}

        for term in search_terms:
            try:
                response = http.get(
                    endpoint,
                    params={
                        "action": "query",
                        "list": "search",
                        "srsearch": term,
                        "srlimit": 8,
                        "format": "json"
                    },
                    timeout=10
                )
                response.raise_for_status()

                for hit in response.json().get(
                    "query", {}
                ).get("search", []):
                    pageid = hit.get("pageid")
                    if pageid:
                        hits_by_id[pageid] = hit.get(
                            "title", ""
                        )

            except (requests.RequestException, ValueError):
                logger.warning(
                    "Wikipedia search failed: %s",
                    language
                )

        if not hits_by_id:
            continue

        try:
            response = http.get(
                endpoint,
                params={
                    "action": "query",
                    "prop": "extracts|info|pageprops",
                    "pageids": "|".join(
                        map(str, hits_by_id.keys())
                    ),
                    "exintro": 1,
                    "explaintext": 1,
                    "exchars": 1100,
                    "inprop": "url",
                    "format": "json"
                },
                timeout=12
            )
            response.raise_for_status()

            pages = response.json().get(
                "query", {}
            ).get("pages", {})

            ranked = []

            for page in pages.values():
                if "disambiguation" in page.get(
                    "pageprops", {}
                ):
                    continue

                title = clean_text(
                    page.get("title")
                )
                extract = clean_text(
                    page.get("extract")
                )

                if not title or not extract:
                    continue

                title_match = similarity(query, title)

                if title_match < 0.62:
                    continue

                combined = normalize(
                    title + " " + extract
                )

                if category in {"place", "nature"}:
                    if any(
                        normalize(term) in combined
                        for term in MEDIA_REJECTION_TERMS
                    ):
                        continue

                location_match = 0.0

                if location_hint:
                    hint = normalize(location_hint)
                    if hint and hint in combined:
                        location_match = 0.35

                # Reject conflicting similarly named locations. A page
                # about Dragon Bridge in Ljubljana must not be used for
                # an image whose guess says Da Nang bridge.
                hint_words = [w for w in normalize(location_hint).split()
                              if len(w) >= 4 and w not in {
                                  "bridge", "church", "cathedral", "mountain",
                                  "island", "islands", "vietnam", "travel",
                                  "tourism", "peak", "hills", "river"}]
                if category in {"place", "nature"} and hint_words:
                    if not any(w in combined for w in hint_words):
                        continue
                # Prefer geographically supported pages; title similarity alone
                # is insufficient for ambiguous names such as Dragon Bridge.
                score = title_match + location_match

                ranked.append({
                    "score": score,
                    "title": title,
                    "extract": extract,
                    "url": page.get("fullurl"),
                    "language": language
                })

            ranked.sort(
                key=lambda item: item["score"],
                reverse=True
            )

            if not ranked:
                continue

            best = ranked[0]
            second = ranked[1] if len(ranked) > 1 else None

            # Avoid arbitrary selection between
            # similarly plausible articles.
            if (
                second
                and best["score"] - second["score"] < 0.08
            ):
                continue

            return {
                "title": best["title"],
                "description": best["extract"],
                "url": best["url"],
                "language": best["language"]
            }

        except (requests.RequestException, ValueError):
            logger.warning(
                "Wikipedia details failed: %s",
                language
            )

    return None


def wikipedia_vietnamese_title(wiki):
    """Resolve a matched article's Vietnamese interlanguage title if available."""
    if not wiki:
        return None
    if wiki["language"] == "vi":
        return wiki["title"]
    try:
        response = http.get("https://en.wikipedia.org/w/api.php", params={
            "action": "query", "titles": wiki["title"],
            "prop": "langlinks", "lllang": "vi", "format": "json"
        }, timeout=8)
        response.raise_for_status()
        pages = response.json().get("query", {}).get("pages", {})
        for page in pages.values():
            for item in page.get("langlinks", []):
                if item.get("lang") == "vi":
                    return clean_text(item.get("*")) or None
    except (requests.RequestException, ValueError):
        logger.warning("Could not fetch Vietnamese Wikipedia title")
    return None


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/places/summary")
def place_summary(name: str):
    name = clean_text(name)
    if not name or len(name) > 120:
        raise HTTPException(400, "Tên địa điểm không hợp lệ.")
    article = wikipedia_lookup(name, "place")
    if not article or article.get("language") != "vi":
        return {"found": False}
    return {"found": True, "title": article["title"], "description": article["description"], "url": article["url"]}

@app.get("/")
def home():
    return {
        "message": "TravelAI AI Service Running",
        "version": "7.4.0",
        "googleVisionConfigured": vision_client is not None,
        "geminiConfigured": bool(GEMINI_API_KEY),
        "geminiBlocked": gemini_blocked,
        "geminiModel": GEMINI_MODEL,
        "geminiLastError": gemini_last_error,
        "transport": "REST",
        "databaseRequired": False
    }


# ============================================================
# DETECT
# ============================================================

@app.post("/detect")
def detect(file: UploadFile = File(...), consent: bool = Form(False)):
    try:
        if not consent:
            raise HTTPException(400, "Cần đồng ý gửi ảnh không chứa dữ liệu cá nhân đến Google Cloud Vision.")
        content = file.file.read(MAX_IMAGE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Tệp ảnh trống."
            )

        if len(content) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Ảnh vượt quá 10 MB."
            )

        mime = image_mime(content)
        if not mime:
            raise HTTPException(
                status_code=400,
                detail="Chỉ hỗ trợ JPEG, PNG và WEBP."
            )

        signals = analyze_google(content)
        candidates = build_candidates(signals)

        analysis = None  # Gemini disabled: prepaid credits depleted

        used_gemini = analysis is not None

        if analysis is None:
            analysis = fallback_analysis(signals)

        name = analysis["exactName"]
        display_name = analysis["displayName"]
        category = analysis["category"]
        status = analysis["recognitionStatus"]

        # Only search for an explicitly identified
        # entity, never for generic image labels.
        wiki = None

        if name and analysis["searchQuery"] and category in ("place", "nature"):
            wiki = wikipedia_lookup(
                query=analysis["searchQuery"],
                category=category,
                location_hint=analysis["locationHint"]
            )

        # A verified Wikipedia article may supply the localized proper name.
        if wiki and not used_gemini:
            vi_title = wikipedia_vietnamese_title(wiki)
            if vi_title:
                display_name = vi_title
                analysis["displayName"] = vi_title

        # Add Vietnamese Wikipedia context when available; never copy
        # English extracts into the user-facing Vietnamese description.
        # The description from fallback stays conservative.
        # The Vietnamese Gemini description is
        # always the primary user-facing description.
        # English Wikipedia extracts are not copied
        # directly into the description field.
        description = analysis["description"]
        if wiki and wiki["language"] == "vi":
            description += " Thông tin tham khảo từ Wikipedia: " + wiki["description"][:650]

        coordinates = None

        if name:
            for landmark in signals["landmarks"]:
                if similarity(
                    name, landmark["name"]
                ) >= 0.85:
                    coordinates = landmark["coordinates"]
                    break

        result = {
            "success": bool(signals["labels"] or signals["objects"] or signals["entities"] or signals["landmarks"] or used_gemini),
            "location": display_name,
            "name": name,
            "displayName": display_name,
            "category": category,
            "description": description,
            "recognitionStatus": status,
            "isPrediction": status == "predicted",
            "reason": analysis["reason"],
            "source": (
                "gemini+google_vision"
                if used_gemini
                else "google_vision_fallback"
            ),
            "knowledgeSource": (
                "Wikipedia" if wiki else None
            ),
            "knowledgeUrl": (
                wiki["url"] if wiki else None
            ),
            "knowledgeTitle": (
                wiki["title"] if wiki else None
            ),
            "informationSource": wiki,
            "coordinates": coordinates,
            "city": None,
            "country": None,
            "placeId": None,
            "imageUrl": None,
            "inDatabase": False,
            "confidence": None,
            "confidenceType": "unavailable",
            "googleDetected": (
                signals["entities"][0]["name"]
                if signals["entities"] else None
            ),
            "ocrText": signals["ocr"],
            "labels": [
                item["name"]
                for item in signals["labels"]
            ],
            "objects": [
                item["name"]
                for item in signals["objects"]
            ],
            "objectBounds": [
                {"name": item["name"], "score": item["score"], "vertices": item.get("bounds", [])}
                for item in signals["objects"] if item.get("bounds")
            ],
            "candidates": candidates,
            "imageSummary": description,
            "sceneRecognized": bool(signals["labels"] or signals["objects"] or signals["entities"] or signals["landmarks"] or used_gemini),
            "exactNameRecognized": bool(name),
            "message": (
                "Đã phân tích ảnh"
                if used_gemini
                else "Đang sử dụng chế độ dự phòng"
            ),
            "engine": (
                "google_vision+gemini"
                if used_gemini
                else "google_vision"
            )
        }

        logger.info("Recognition completed: status=%s", status)

        return result

    finally:
        file.file.close()
