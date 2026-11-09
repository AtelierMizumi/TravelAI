// Two-browser-context E2E for community visibility (Task 8).
// Two independent Playwright browser contexts (separate storage, cookies,
// tokens) exercise the real backend HTTP API end to end:
//   A creates a PENDING post -> B cannot see it (feed/user endpoints,
//   like/comment/share all 403) -> admin approves -> B sees it + can like.
// Requires env: E2E_BASE_URL (backend origin), CHROMIUM_PATH (optional),
// E2E_ADMIN_EMAIL (pre-promoted to ADMIN by the runner via psql).
import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('E2E_BASE_URL is required');
const adminEmail = process.env.E2E_ADMIN_EMAIL;
if (!adminEmail) throw new Error('E2E_ADMIN_EMAIL is required (promoted by runner)');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--no-sandbox'],
});

const password = 'SyntheticE2E!1';
const email = (tag) => `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

async function register(ctx, name, mail) {
  const res = await ctx.request.post(`${base}/api/auth/register`, {
    data: { name, email: mail, password },
  });
  assert.equal(res.status(), 200, `register ${mail}: ${await res.text()}`);
  return (await res.json()).token;
}

async function login(ctx, mail) {
  const res = await ctx.request.post(`${base}/api/auth/login`, {
    data: { email: mail, password },
  });
  assert.equal(res.status(), 200, `login ${mail}: ${await res.text()}`);
  return (await res.json()).token;
}

try {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();

  // Admin account is created + promoted by the runner; only log in here.
  const adminToken = await login(ctxA, adminEmail);
  const tokenA = await register(ctxA, 'user-a', email('a'));
  const tokenB = await register(ctxB, 'user-b', email('b'));

  // A creates a PENDING post.
  const created = await ctxA.request.post(`${base}/api/posts`, {
    headers: authHeaders(tokenA),
    data: { content: 'E2E post from A' },
  });
  assert.equal(created.status(), 200);
  const post = await created.json();
  assert.equal(post.status, 'PENDING');
  const postId = post.id;

  // B feed must not contain it.
  const feedB = await (await ctxB.request.get(`${base}/api/posts`, { headers: authHeaders(tokenB) })).json();
  assert.ok(!feedB.some((p) => p.id === postId), 'B feed must not contain pending post');

  // B cannot see it via the author's user feed.
  const userFeedB = await (await ctxB.request.get(`${base}/api/posts/user/${post.authorId}`, {
    headers: authHeaders(tokenB),
  })).json();
  assert.ok(!userFeedB.some((p) => p.id === postId), 'B user feed must hide pending post');

  // B cannot like/comment/share by direct id.
  for (const [path, data] of [
    [`/api/posts/${postId}/like`, {}],
    [`/api/posts/${postId}/comments`, { text: 'x' }],
    [`/api/posts/${postId}/share`, { caption: 'x' }],
  ]) {
    const r = await ctxB.request.post(`${base}${path}`, { headers: authHeaders(tokenB), data });
    assert.equal(r.status(), 403, `${path} should be 403, got ${r.status()}`);
  }

  // Admin approves.
  const approve = await ctxA.request.put(`${base}/api/posts/${postId}/approve`, {
    headers: authHeaders(adminToken),
  });
  assert.equal(approve.status(), 200, 'approve should succeed for admin');

  // After approval B sees it and can like.
  const feedB2 = await (await ctxB.request.get(`${base}/api/posts`, { headers: authHeaders(tokenB) })).json();
  assert.ok(feedB2.some((p) => p.id === postId), 'B feed must contain approved post');
  const like = await ctxB.request.post(`${base}/api/posts/${postId}/like`, {
    headers: authHeaders(tokenB),
    data: {},
  });
  assert.equal(like.status(), 200);
  assert.equal((await like.json()).liked, true);

  console.log('PASS two-browser E2E: pending hidden from B, approved visible + likeable');
} finally {
  await browser.close();
}
