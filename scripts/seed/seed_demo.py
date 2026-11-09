#!/usr/bin/env python3
"""Idempotent demo-data loader for the TravelAI backend (stdlib only).

Everything goes through the public REST API, so the backend's own rules apply. Existing rows are looked
up first (by name / by kind+legacyId / by year), which makes re-runs safe and lets a run that failed
midway be completed by running it again. Tokens and passwords are never printed.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parents[2] / "data" / "seed"
POLICY = {"cancellationHours": 48, "reschedulingHours": 72, "graceMinutes": 30,
          "holdMinutes": 15, "holidayReschedulingHours": 120}


class SeedError(RuntimeError):
    pass


def load_dataset():
    names = ("places", "tours", "hotels", "calendars")
    return {n: json.loads((DATA / f"{n}.json").read_text(encoding="utf-8")) for n in names}


class Api:
    def __init__(self, base_url, timeout=30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def request(self, method, path, body=None, token=None, headers=None):
        data = None if body is None else json.dumps(body).encode()
        req = urllib.request.Request(self.base_url + path, data=data, method=method)
        req.add_header("Accept", "application/json")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        for key, value in (headers or {}).items():
            req.add_header(key, value)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                raw = response.read()
        except urllib.error.HTTPError as error:  # never echo the body: it may reflect input
            error.close()
            raise SeedError(f"{method} {path} -> HTTP {error.code}") from None
        except urllib.error.URLError as error:
            raise SeedError(f"{method} {path} -> {error.reason}") from None
        return json.loads(raw) if raw else None


def login_or_register(api, email, password, name, allow_register=True):
    """Return (token, user_id); registers the account only if the login is refused."""
    payload = {"email": email, "password": password}
    try:
        result = api.request("POST", "/api/auth/login", payload)
    except SeedError:
        if not allow_register:
            return None, None
        result = api.request("POST", "/api/auth/register", {**payload, "name": name})
    return result["token"], result["user"]["id"]


class Seeder:
    def __init__(self, api, origin, dry_run=False, log=print, today=None):
        self.api, self.origin, self.dry_run, self.log = api, origin.rstrip("/"), dry_run, log
        self.today = today or datetime.now(timezone.utc).date()
        self.planned = 0
        self.created = 0

    # -- helpers ---------------------------------------------------------
    def _write(self, token, path, body, headers=None):
        if self.dry_run:
            self.planned += 1
            return {"id": f"dry-{self.planned}"}
        result = self.api.request("POST", path, body, token, headers)
        self.created += 1
        return result

    def _image(self, filename):
        return f"{self.origin}/media/{filename}"

    # -- catalog ---------------------------------------------------------
    def seed_catalog(self, token, dataset):
        places = {p["key"]: self._ensure(token, "/api/places", p["name"], {
            "name": p["name"], "description": p["description"], "imageUrl": self._image(p["image"])})
            for p in dataset["places"]}
        by_key = {p["key"]: p for p in dataset["places"]}
        tour_ids = {}
        for t in dataset["tours"]:
            place = by_key[t["place"]]
            row = self._ensure(token, "/api/tours", t["name"], {
                "name": t["name"], "location": place["name"], "rating": 4.5, "price": t["price"],
                "durationDays": t["durationDays"], "maxGuests": t["maxGuests"], "status": "active",
                "description": t["description"], "image": self._image(place["image"])})
            tour_ids[t["key"]] = row["id"]
        hotel_ids = {}
        for h in dataset["hotels"]:
            place = by_key[h["place"]]
            row = self._ensure(token, "/api/hotels", h["name"], {
                "name": h["name"], "location": place["name"], "province": h["province"], "rating": h["rating"],
                "rooms": len(h["rooms"]), "price": min(r["price"] for r in h["rooms"]), "status": "active",
                "image": self._image(place["image"])})
            hotel_ids[h["key"]] = row["id"]
        self._seed_offers(token, dataset, tour_ids, hotel_ids)
        self._seed_calendars(token, dataset["calendars"])
        return places

    def _ensure(self, token, path, name, body):
        for row in self.api.request("GET", path) or []:
            if row.get("name") == name:
                return row
        self.log(f"create {path} {name}")
        return self._write(token, path, body)

    def _seed_offers(self, token, dataset, tour_ids, hotel_ids):
        existing = {(o["kind"], o["legacyId"]) for o in self._admin_get("/api/booking/admin/offers", token)}
        for t in dataset["tours"]:
            if ("TOUR", tour_ids[t["key"]]) in existing:
                continue
            departures = [{"start": self._start(d["daysFromNow"]), "capacity": d["capacity"],
                           "seats": [], "price": d["price"]} for d in t["departures"]]
            self.log(f"create offer TOUR {t['name']}")
            self._write(token, "/api/booking/offers", {
                "id": None, "kind": "TOUR", "legacyId": tour_ids[t["key"]], "name": t["name"], "active": True,
                "policy": POLICY, "departures": departures, "rooms": None,
                "checkInTime": None, "checkOutTime": None})
        for h in dataset["hotels"]:
            if ("HOTEL", hotel_ids[h["key"]]) in existing:
                continue
            rooms = [{"id": f"R{r['number']}", "number": r["number"], "maxGuests": r["maxGuests"],
                      "price": r["price"], "nightlyPrices": None} for r in h["rooms"]]
            self.log(f"create offer HOTEL {h['name']}")
            self._write(token, "/api/booking/offers", {
                "id": None, "kind": "HOTEL", "legacyId": hotel_ids[h["key"]], "name": h["name"], "active": True,
                "policy": POLICY, "departures": None, "rooms": rooms,
                "checkInTime": "14:00", "checkOutTime": "12:00"})

    def _seed_calendars(self, token, calendars):
        known = {c["year"] for c in self._admin_get("/api/booking/admin/calendars", token)}
        for c in calendars:
            if c["year"] not in known:
                self.log(f"publish holiday calendar {c['year']}")
                self._write(token, "/api/booking/calendars", c)

    def _admin_get(self, path, token):
        try:
            return self.api.request("GET", path, token=token) or []
        except SeedError:
            if self.dry_run:  # before the first real run the admin role may not exist yet
                return []
            raise

    def _start(self, days_from_now):
        moment = datetime.combine(self.today + timedelta(days=days_from_now), datetime.min.time(),
                                  tzinfo=timezone.utc) + timedelta(hours=1)  # 08:00 Vietnam time
        return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("ensure-admin", "catalog"))
    parser.add_argument("--base-url", default=os.environ.get("PUBLIC_ORIGIN"), required=not os.environ.get("PUBLIC_ORIGIN"))
    parser.add_argument("--admin-email", default="admin@demo.travelai.test")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    password = os.environ.get("SEED_ADMIN_PASSWORD")
    if not password:
        sys.exit("SEED_ADMIN_PASSWORD is required (set it in .env)")
    api = Api(args.base_url)
    try:
        token, _ = login_or_register(api, args.admin_email, password, "Quản trị viên Demo",
                                     allow_register=not args.dry_run)
        if args.command == "ensure-admin":
            print(f"admin account {'ready' if token else 'would be registered'}: {args.admin_email}")
            return
        seeder = Seeder(api, origin=args.base_url, dry_run=args.dry_run)
        seeder.seed_catalog(token, load_dataset())
    except SeedError as error:
        sys.exit(f"seed failed: {error}")
    print(f"done: created={seeder.created} planned={seeder.planned}")


if __name__ == "__main__":
    main()
