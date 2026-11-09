"""Minimal in-process stand-in for the TravelAI REST API, used only by the seed tests."""
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class FakeBackend:
    def __init__(self):
        self.users = {}  # email -> password
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

            def _body(self):
                length = int(self.headers.get("Content-Length") or 0)
                return json.loads(self.rfile.read(length) or b"{}")

            def do_GET(self):
                table = {"/api/places": outer.places, "/api/tours": outer.tours, "/api/hotels": outer.hotels,
                         "/api/booking/admin/offers": outer.offers, "/api/booking/admin/calendars": outer.calendars}
                self._send(200, table.get(self.path, []))

            def do_POST(self):
                body = self._body()
                if not self.path.startswith("/api/auth/"):
                    outer.writes.append(("POST", self.path))
                    outer.auth_headers.append(self.headers.get("Authorization"))
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
                    outer.writes.append(("AUTH", self.path))
                    return self._send(200, {"token": f"tok-{email}", "user": {"id": len(outer.users), "email": email}})
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
