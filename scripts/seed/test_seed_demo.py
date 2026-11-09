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


USER_PASSWORD = "synthetic-user-password"


def run_all(backend, buffer=None):
    api = seed_demo.Api(backend.base_url)
    seeder = seed_demo.Seeder(api, origin="https://demo.example", log=print if buffer else (lambda *_: None))
    token, _ = seed_demo.login_or_register(api, "admin@demo.travelai.test", "synthetic-admin-password", "Admin")
    dataset = seed_demo.load_dataset()
    seeder.seed_catalog(token, dataset)
    seeder.seed_people(token, dataset, USER_PASSWORD)
    return seeder


class PeopleSeedTest(unittest.TestCase):
    def test_first_run_creates_people_money_bookings_and_community(self):
        with FakeBackend() as backend:
            run_all(backend)
            self.assertEqual(len([e for e in backend.users if e != "admin@demo.travelai.test"]), 4)
            self.assertEqual(len(backend.provisions), 4)
            self.assertEqual(len(backend.linked), 4)
            self.assertEqual(len(backend.bookings), 5)
            self.assertEqual(sorted(b["status"] for b in backend.bookings).count("CANCELLED"), 1)
            self.assertEqual(len(backend.posts), 6)
            self.assertTrue(all(p["status"] == "APPROVED" for p in backend.posts))
            self.assertEqual(sum(len(p["comments"]) for p in backend.posts), 3)
            self.assertEqual(sum(len(p["likes"]) for p in backend.posts), 5)
            self.assertEqual(len(backend.chats), 2)

    def test_second_run_adds_nothing(self):
        with FakeBackend() as backend:
            run_all(backend)
            snapshot = (len(backend.provisions), len(backend.bookings), len(backend.posts), len(backend.chats),
                        sum(len(p["comments"]) for p in backend.posts), sum(len(p["likes"]) for p in backend.posts))
            run_all(backend)
            self.assertEqual(snapshot, (len(backend.provisions), len(backend.bookings), len(backend.posts),
                                        len(backend.chats), sum(len(p["comments"]) for p in backend.posts),
                                        sum(len(p["likes"]) for p in backend.posts)))

    def test_second_run_performs_zero_writes(self):
        with FakeBackend() as backend:
            run_all(backend)
            data_writes = lambda: [w for w in backend.writes if w[0] != "AUTH"]  # logins are not data writes
            writes = data_writes()
            seeder = run_all(backend)
            self.assertEqual(data_writes(), writes)
            self.assertEqual(seeder.created, 0)

    def test_rerun_completes_a_cancellation_that_failed_midway(self):
        with FakeBackend() as backend:
            backend.fail_cancel_once = True
            with self.assertRaises(seed_demo.SeedError):
                run_all(backend)
            self.assertEqual(sum(b["status"] == "CANCELLED" for b in backend.bookings), 0)
            run_all(backend)
            self.assertEqual(len(backend.bookings), 5)
            self.assertEqual(sum(b["status"] == "CANCELLED" for b in backend.bookings), 1)

    def test_secrets_never_reach_the_output(self):
        with FakeBackend() as backend:
            buffer = io.StringIO()
            with redirect_stdout(buffer):
                run_all(backend, buffer)
            out = buffer.getvalue()
            self.assertNotIn(USER_PASSWORD, out)
            self.assertNotIn("TEST-", out)      # synthetic CVV
            self.assertNotIn("tok-", out)       # session tokens


if __name__ == "__main__":
    unittest.main()
