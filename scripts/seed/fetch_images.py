#!/usr/bin/env python3
"""Download demo place images from Wikimedia Commons with their licence metadata.

Only CC0 / public domain / CC BY / CC BY-SA files are accepted. Writes data/seed/images/<key>.jpg and
rows for data/seed/ATTRIBUTION.md. Re-run safe: existing images are kept unless --force.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "data" / "seed"
API = "https://commons.wikimedia.org/w/api.php"
UA = "TravelAIDemoSeed/1.0 (university project demo; https://github.com/AtelierMizumi/TravelAI)"
ALLOWED = re.compile(r"^(CC0|Public domain|CC BY(-SA)? [234]\.0)", re.I)
QUERIES = {  # place key -> Commons search
    "ho-hoan-kiem": "Hoan Kiem Lake Hanoi Ngoc Son temple",
    "van-mieu": "Temple of Literature Hanoi Van Mieu",
    "vinh-ha-long": "Ha Long Bay limestone karsts",
    "dai-noi-hue": "Imperial City Hue Ngo Mon gate",
    "cau-rong": "Dragon Bridge Da Nang",
    "ba-na-hills": "Golden Bridge Ba Na Hills",
    "pho-co-hoi-an": "Hoi An ancient town",
    "nha-tho-duc-ba": "Notre-Dame Cathedral Basilica of Saigon",
    "cho-ben-thanh": "Ben Thanh Market Ho Chi Minh City",
    "phu-quoc": "Sao Beach Phu Quoc",
    "sa-pa": "Sapa rice terraces Muong Hoa valley",
    "trang-an": "Trang An Ninh Binh boat",
}


def call(params):
    url = API + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
        return json.load(r)


def strip_html(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def candidates(query):
    data = call({"action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
                 "gsrsearch": query + " filetype:bitmap", "gsrlimit": 25, "prop": "imageinfo",
                 "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 800})
    for page in sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        licence = strip_html(meta.get("LicenseShortName", {}).get("value"))
        if info.get("mime") != "image/jpeg" or not ALLOWED.match(licence):
            continue
        if info.get("width", 0) < 1200 or info.get("width", 0) < info.get("height", 0):
            continue  # want a landscape photo of decent size
        yield {"title": page["title"], "url": info["thumburl"], "page": info["descriptionurl"],
               "author": strip_html(meta.get("Artist", {}).get("value")) or "unknown", "license": licence}


def main(force=False):
    (ROOT / "images").mkdir(parents=True, exist_ok=True)
    rows = []
    for key, query in QUERIES.items():
        target = ROOT / "images" / f"{key}.jpg"
        chosen = None
        for cand in candidates(query):
            if target.exists() and not force:
                chosen = cand
                break
            req = urllib.request.Request(cand["url"], headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=60).read()
            if data[:3] == b"\xff\xd8\xff" and len(data) <= 400 * 1024:
                target.write_bytes(data)
                chosen = cand
                break
            time.sleep(1)
        if not chosen:
            print(f"!! no usable image for {key}", file=sys.stderr)
            continue
        print(f"{key}: {chosen['title']} | {chosen['license']} | {chosen['author'][:40]}")
        rows.append(f"| {key}.jpg | {chosen['title']} | {chosen['author'][:80]} | {chosen['license']} | {chosen['page']} |")
        time.sleep(1)
    (ROOT / "ATTRIBUTION.md").write_text(
        "# Image attribution\n\nPlace photos are copies from Wikimedia Commons, used under the licences listed.\n"
        "Authors retain their rights; see each source page.\n\n"
        "| File | Commons title | Author | Licence | Source |\n| --- | --- | --- | --- | --- |\n" + "\n".join(rows) + "\n",
        encoding="utf-8")


if __name__ == "__main__":
    main(force="--force" in sys.argv)
