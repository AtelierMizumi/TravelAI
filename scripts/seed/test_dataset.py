"""Schema and content checks for data/seed (run: python3 -I -m unittest scripts/seed/test_dataset.py)."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "data" / "seed"
ALLOWED_LICENSES = ("CC0", "Public domain", "CC BY 2.0", "CC BY 3.0", "CC BY 4.0",
                    "CC BY-SA 2.0", "CC BY-SA 3.0", "CC BY-SA 4.0")


def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def attribution_rows():
    text = (ROOT / "ATTRIBUTION.md").read_text(encoding="utf-8")
    rows = {}
    for line in text.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 5 and cells[0].endswith(".jpg"):
            rows[cells[0]] = cells
    return rows


class DatasetTest(unittest.TestCase):
    def setUp(self):
        self.places = load("places.json")
        self.tours = load("tours.json")
        self.hotels = load("hotels.json")

    def test_counts(self):
        self.assertEqual(len(self.places), 12)
        self.assertEqual(len(self.tours), 8)
        self.assertEqual(len(self.hotels), 8)

    def test_places_are_complete_and_unique(self):
        names = [p["name"] for p in self.places]
        self.assertEqual(len(set(names)), len(names))
        for p in self.places:
            for field in ("key", "name", "province", "description", "image"):
                self.assertTrue(p.get(field), f"{p.get('key')} missing {field}")
            self.assertGreaterEqual(len(p["description"]), 60, p["key"])

    def test_images_exist_are_jpeg_small_and_attributed(self):
        rows = attribution_rows()
        for p in self.places:
            path = ROOT / "images" / p["image"]
            self.assertTrue(path.is_file(), f"missing image {p['image']}")
            data = path.read_bytes()
            self.assertEqual(data[:3], b"\xff\xd8\xff", f"{p['image']} is not a JPEG")
            self.assertLessEqual(len(data), 400 * 1024, f"{p['image']} too large")
            self.assertIn(p["image"], rows, f"{p['image']} has no attribution row")
            self.assertTrue(rows[p["image"]][3].startswith(ALLOWED_LICENSES), rows[p["image"]])
            self.assertTrue(rows[p["image"]][4].startswith("https://"), rows[p["image"]])

    def test_tours_reference_places_and_have_departures(self):
        keys = {p["key"] for p in self.places}
        for t in self.tours:
            self.assertIn(t["place"], keys, t["key"])
            self.assertGreater(t["price"], 0)
            self.assertGreaterEqual(len(t["departures"]), 2, t["key"])
            for d in t["departures"]:
                self.assertGreater(d["capacity"], 0)
                self.assertGreater(d["price"], 0)

    def test_hotels_reference_places_and_have_rooms(self):
        keys = {p["key"] for p in self.places}
        for h in self.hotels:
            self.assertIn(h["place"], keys, h["key"])
            self.assertGreaterEqual(len(h["rooms"]), 2, h["key"])
            for r in h["rooms"]:
                self.assertGreater(r["price"], 0)
                self.assertGreater(r["maxGuests"], 0)

    def test_only_demo_emails(self):
        blob = "".join((ROOT / n).read_text(encoding="utf-8") for n in ("places.json", "tours.json", "hotels.json"))
        for email in re.findall(r"[\w.+-]+@[\w.-]+", blob):
            self.assertTrue(email.endswith("@demo.travelai.test"), email)


if __name__ == "__main__":
    unittest.main()
