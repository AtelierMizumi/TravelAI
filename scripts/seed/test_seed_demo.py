"""Catalog loader tests (run: python3 -I scripts/seed/test_seed_demo.py)."""
import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fake_backend import FakeBackend  # noqa: E402
import seed_demo  # noqa: E402

TOKEN = "synthetic-admin-token"


def run(backend, dry_run=False):
    api = seed_demo.Api(backend.base_url)
    seeder = seed_demo.Seeder(api, origin="https://demo.example", dry_run=dry_run, log=lambda *_: None)
    seeder.seed_catalog(TOKEN, seed_demo.load_dataset())
    return seeder


class CatalogSeedTest(unittest.TestCase):
    def test_first_run_creates_whole_catalog(self):
        with FakeBackend() as backend:
            run(backend)
            self.assertEqual(len(backend.places), 12)
            self.assertEqual(len(backend.tours), 8)
            self.assertEqual(len(backend.hotels), 8)
            self.assertEqual(len(backend.offers), 16)          # one offering per tour and per hotel
            self.assertEqual(len(backend.calendars), 2)
            self.assertTrue(all(h == f"Bearer {TOKEN}" for h in backend.auth_headers))

    def test_offers_link_to_catalog_rows(self):
        with FakeBackend() as backend:
            run(backend)
            tour_ids = {t["id"] for t in backend.tours}
            hotel_ids = {h["id"] for h in backend.hotels}
            for offer in backend.offers:
                self.assertIn(offer["kind"], ("TOUR", "HOTEL"))
                self.assertIn(offer["legacyId"], tour_ids if offer["kind"] == "TOUR" else hotel_ids)
                self.assertTrue(offer["active"])
                self.assertGreaterEqual(offer["policy"]["holdMinutes"], 1)
            tour_offer = next(o for o in backend.offers if o["kind"] == "TOUR")
            self.assertTrue(all(d["start"].endswith("Z") for d in tour_offer["departures"]))
            hotel_offer = next(o for o in backend.offers if o["kind"] == "HOTEL")
            self.assertEqual(len({r["id"] for r in hotel_offer["rooms"]}), len(hotel_offer["rooms"]))
            self.assertEqual(hotel_offer["checkInTime"], "14:00")

    def test_images_point_at_media_route_of_origin(self):
        with FakeBackend() as backend:
            run(backend)
            self.assertTrue(all(p["imageUrl"].startswith("https://demo.example/media/") for p in backend.places))

    def test_second_run_writes_nothing(self):
        with FakeBackend() as backend:
            run(backend)
            first = len(backend.writes)
            run(backend)
            self.assertEqual(len(backend.writes), first)
            self.assertEqual(len(backend.places), 12)
            self.assertEqual(len(backend.offers), 16)

    def test_dry_run_writes_nothing(self):
        with FakeBackend() as backend:
            seeder = run(backend, dry_run=True)
            self.assertEqual(backend.writes, [])
            self.assertGreater(seeder.planned, 0)

    def test_failure_midway_is_completed_by_rerun_without_duplicates(self):
        with FakeBackend() as backend:
            backend.fail_post_number = 4
            with self.assertRaises(seed_demo.SeedError):
                run(backend)
            self.assertEqual(len(backend.places), 3)
            run(backend)
            self.assertEqual(sorted(p["name"] for p in backend.places), sorted({p["name"] for p in backend.places}))
            self.assertEqual(len(backend.places), 12)
            self.assertEqual(len(backend.offers), 16)

    def test_token_never_appears_in_output(self):
        with FakeBackend() as backend:
            buffer = io.StringIO()
            with redirect_stdout(buffer):
                api = seed_demo.Api(backend.base_url)
                seeder = seed_demo.Seeder(api, origin="https://demo.example")
                seeder.seed_catalog(TOKEN, seed_demo.load_dataset())
            self.assertNotIn(TOKEN, buffer.getvalue())


class LoginTest(unittest.TestCase):
    def test_registers_once_then_logs_in(self):
        with FakeBackend() as backend:
            api = seed_demo.Api(backend.base_url)
            first = seed_demo.login_or_register(api, "admin@demo.travelai.test", "pw-synthetic", "Admin Demo")
            again = seed_demo.login_or_register(api, "admin@demo.travelai.test", "pw-synthetic", "Admin Demo")
            self.assertEqual(first, again)
            self.assertEqual(list(backend.users), ["admin@demo.travelai.test"])

    def test_dry_run_never_registers(self):
        with FakeBackend() as backend:
            api = seed_demo.Api(backend.base_url)
            token = seed_demo.login_or_register(api, "admin@demo.travelai.test", "pw", "Admin", allow_register=False)
            self.assertEqual(token, (None, None))
            self.assertEqual(backend.users, {})

    def test_dry_run_catalog_survives_missing_admin_rights(self):
        with FakeBackend() as backend:
            seeder = seed_demo.Seeder(seed_demo.Api(backend.base_url), origin="https://demo.example",
                                      dry_run=True, log=lambda *_: None)
            seeder.seed_catalog(None, seed_demo.load_dataset())
            self.assertEqual(backend.writes, [])

    def test_wrong_password_for_existing_user_is_an_error(self):
        with FakeBackend() as backend:
            backend.users["a@demo.travelai.test"] = "right"
            api = seed_demo.Api(backend.base_url)
            with self.assertRaises(seed_demo.SeedError):
                seed_demo.login_or_register(api, "a@demo.travelai.test", "wrong", "A")


if __name__ == "__main__":
    unittest.main()
