"""Minimal in-process stand-in for the TravelAI REST API, used only by the seed tests."""
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class FakeBackend:
    def __init__(self):
        self.users = {}  # email -> password
        self.user_ids = {}  # email -> id
        self.provisions, self.linked, self.bookings, self.posts, self.chats = [], set(), [], [], []
        self.reviews = {}
        self.fail_cancel_once = False
        self.places, self.tours, self.hotels, self.offers, self.calendars = [], [], [], [], []
        self.writes = []            # (method, path)
        self.auth_headers = []      # Authorization header of each write
        self.fail_post_number = None  # make the Nth POST /api/places answer 500 once
        self._places_posts = 0
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def _send(self, status, body):
                data = json.dumps(body).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def _who(self):
                header = self.headers.get("Authorization") or ""
                return header.removeprefix("Bearer tok-") if header.startswith("Bearer tok-") else None

            def _body(self):
                length = int(self.headers.get("Content-Length") or 0)
                return json.loads(self.rfile.read(length) or b"{}")

            def do_GET(self):
                table = {"/api/places": outer.places, "/api/tours": outer.tours, "/api/hotels": outer.hotels,
                         "/api/booking/admin/offers": outer.offers, "/api/booking/admin/calendars": outer.calendars}
                who = self._who()
                if self.path == "/api/booking/bank":
                    cards = [c for c in outer.provisions if c["email"] == who and c["cardId"] in outer.linked]
                    return self._send(200, {"cards": [{"cardId": c["cardId"]} for c in cards]})
                if self.path == "/api/booking/offers":
                    return self._send(200, outer.offers)
                if self.path == "/api/booking/bookings":
                    return self._send(200, [b for b in outer.bookings if b["email"] == who])
                if self.path.startswith("/api/chat/conversation"):
                    return self._send(200, outer.chats)
                if self.path in ("/api/posts", "/api/posts/admin/all"):
                    uid = outer.user_ids.get(who)
                    return self._send(200, [dict(p, liked=uid in p["likes"]) for p in outer.posts])
                self._send(200, table.get(self.path, []))

            def do_PUT(self):
                self._body()
                if self.path.startswith("/api/posts/") and self.path.endswith("/approve"):
                    outer.posts[int(self.path.split("/")[3]) - 1]["status"] = "APPROVED"
                    return self._send(200, {})
                self._send(404, {})

            def do_POST(self):
                body = self._body()
                if not self.path.startswith("/api/auth/"):
                    outer.writes.append(("POST", self.path))
                    outer.auth_headers.append(self.headers.get("Authorization"))
                who = self._who()
                if self.path == "/api/booking/bank/accounts":
                    n = len(outer.provisions) + 1
                    email = next(e for e, i in outer.user_ids.items() if i == body["ownerId"])
                    outer.provisions.append({"email": email, "cardId": f"SIM-MC-{n}", "testCvv": f"TEST-{n}"})
                    return self._send(200, {"cardId": f"SIM-MC-{n}", "testCvv": f"TEST-{n}", "bankName": body["bankName"]})
                if self.path == "/api/booking/bank/link":
                    outer.linked.add(body["accountNumber"])
                    return self._send(200, {"status": "LINKED"})
                if self.path == "/api/booking/reviews":
                    rid = f"rev-{len(outer.reviews) + 1}"
                    outer.reviews[rid] = dict(body, email=who)
                    return self._send(200, {"id": rid, "digest": "digest-" + rid})
                if self.path.startswith("/api/booking/reviews/") and self.path.endswith("/pay"):
                    review = outer.reviews[self.path.split("/")[4]]
                    offer = next(o for o in outer.offers if o["id"] == review["offeringId"])
                    booking = {"id": f"bk-{len(outer.bookings) + 1}", "email": who, "status": "CONFIRMED",
                               "itinerary": {"name": offer["name"], "selection": {"offeringId": offer["id"]}}}
                    outer.bookings.append(booking)
                    return self._send(200, booking)
                if self.path.startswith("/api/booking/bookings/") and self.path.endswith("/cancel"):
                    if outer.fail_cancel_once:
                        outer.fail_cancel_once = False
                        return self._send(500, {"message": "boom"})
                    next(b for b in outer.bookings if b["id"] == self.path.split("/")[4])["status"] = "CANCELLED"
                    return self._send(200, {"status": "CANCELLED"})
                if self.path == "/api/posts":
                    post = {"id": len(outer.posts) + 1, "content": body["content"], "status": "PENDING", "likes": [],
                            "comments": [], "authorEmail": who}
                    outer.posts.append(post)
                    return self._send(200, post)
                if self.path.startswith("/api/posts/") and self.path.endswith("/like"):
                    post = outer.posts[int(self.path.split("/")[3]) - 1]
                    post["likes"].append(outer.user_ids[who])
                    return self._send(200, {"liked": True})
                if self.path.startswith("/api/posts/") and self.path.endswith("/comments"):
                    post = outer.posts[int(self.path.split("/")[3]) - 1]
                    post["comments"].append({"text": body["text"], "userId": outer.user_ids[who]})
                    return self._send(200, post)
                if self.path == "/api/chat/send":
                    if all(c["clientMessageId"] != body["clientMessageId"] for c in outer.chats):
                        outer.chats.append(body)
                    return self._send(200, {"ok": True})
                if self.path == "/api/places":
                    outer._places_posts += 1
                    if outer.fail_post_number == outer._places_posts:
                        outer.fail_post_number = None
                        return self._send(500, {"message": "boom"})
                    store = outer.places
                elif self.path == "/api/tours":
                    store = outer.tours
                elif self.path == "/api/hotels":
                    store = outer.hotels
                elif self.path == "/api/booking/offers":
                    body = dict(body, id=f"offer-{len(outer.offers) + 1}")
                    store = outer.offers
                elif self.path in ("/api/auth/login", "/api/auth/register"):
                    email, password = body.get("email"), body.get("password")
                    if self.path.endswith("login"):
                        if outer.users.get(email) != password:
                            return self._send(401, {"message": "denied"})
                    else:
                        if email in outer.users:
                            return self._send(400, {"message": "exists"})
                        outer.users[email] = password
                        outer.user_ids[email] = len(outer.users)
                    outer.writes.append(("AUTH", self.path))
                    return self._send(200, {"token": f"tok-{email}", "user": {"id": outer.user_ids.get(email, 1), "email": email}})
                elif self.path == "/api/booking/calendars":
                    store = outer.calendars
                else:
                    return self._send(404, {})
                if self.path != "/api/booking/offers":
                    body = dict(body, id=len(store) + 1)
                store.append(body)
                self._send(200, body)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)

    @property
    def base_url(self):
        return f"http://127.0.0.1:{self.server.server_address[1]}"

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *exc):
        self.server.shutdown()
        self.server.server_close()
