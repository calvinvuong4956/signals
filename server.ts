// server.ts
//
// Serves the static site (index.html, script.js, style.css, hum.mp3, astronaut.glb, …)
// and a small JSON API for "Join the Constellation" — sign up, log in, and list the
// member nodes people have added to the network. Storage is Deno KV: no extra
// database to stand up, works the same locally (with --unstable-kv) and on Deno
// Deploy, which provides KV automatically for every deployed app.
//
// Local dev:   deno task start   (see deno.json)
// Deploy:      deployctl deploy / the existing "aliens-signals" Deno Deploy app

const ROOT = new URL(".", import.meta.url).pathname;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const kv = await Deno.openKv();

// ---------------------------------------------------------------------------
// tiny helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Salted SHA-256. Fine for a student-project sign-up form; a production app
// handling real user data should use bcrypt/argon2 instead.
async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

interface MemberNode {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  url: string | null;
  contact: string;
  isMember: true;
  joinedAt: string;
}

interface Account {
  email: string;
  salt: string;
  passwordHash: string;
  nodeId: string;
}

async function getSessionEmail(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const entry = await kv.get<{ email: string }>(["sessions", token]);
  return entry.value?.email ?? null;
}

// ---------------------------------------------------------------------------
// API handlers
// ---------------------------------------------------------------------------

async function handleSignup(req: Request): Promise<Response> {
  const body = await readJson(req);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return jsonResponse({ error: "Name, email and password are required." }, 400);
  }
  if (password.length < 6) {
    return jsonResponse({ error: "Password needs to be at least 6 characters." }, 400);
  }

  const existing = await kv.get<Account>(["accounts", email]);
  if (existing.value) {
    return jsonResponse({ error: "An account with that email already exists — log in instead." }, 409);
  }

  const salt = randomHex(8);
  const passwordHash = await hashPassword(password, salt);
  const nodeId = `member-${randomHex(6)}`;

  const node: MemberNode = {
    id: nodeId,
    name: name.slice(0, 120),
    role: (typeof body?.role === "string" && body.role.trim()) || "Member organisation",
    category: (typeof body?.sector === "string" && body.sector.trim()) || "business",
    description: typeof body?.description === "string" ? body.description.slice(0, 600) : "",
    url: typeof body?.website === "string" && body.website.trim() ? body.website.trim() : null,
    contact: email,
    isMember: true,
    joinedAt: new Date().toISOString(),
  };

  const account: Account = { email, salt, passwordHash, nodeId };

  await kv.set(["accounts", email], account);
  await kv.set(["members", nodeId], node);

  const token = randomHex(24);
  await kv.set(["sessions", token], { email });

  return jsonResponse({ token, node });
}

async function handleLogin(req: Request): Promise<Response> {
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonResponse({ error: "Email and password are required." }, 400);
  }

  const account = await kv.get<Account>(["accounts", email]);
  if (!account.value) {
    return jsonResponse({ error: "No account with that email." }, 404);
  }

  const check = await hashPassword(password, account.value.salt);
  if (check !== account.value.passwordHash) {
    return jsonResponse({ error: "Incorrect password." }, 401);
  }

  const node = await kv.get<MemberNode>(["members", account.value.nodeId]);
  const token = randomHex(24);
  await kv.set(["sessions", token], { email });

  return jsonResponse({ token, node: node.value });
}

async function handleMe(req: Request): Promise<Response> {
  const email = await getSessionEmail(req);
  if (!email) return jsonResponse({ error: "Not logged in." }, 401);

  const account = await kv.get<Account>(["accounts", email]);
  if (!account.value) return jsonResponse({ error: "Account not found." }, 404);

  const node = await kv.get<MemberNode>(["members", account.value.nodeId]);
  return jsonResponse({ node: node.value });
}

async function handleLogout(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token) await kv.delete(["sessions", token]);
  return jsonResponse({ ok: true });
}

async function handleMembers(): Promise<Response> {
  const members: MemberNode[] = [];
  for await (const entry of kv.list<MemberNode>({ prefix: ["members"] })) {
    members.push(entry.value);
  }
  return jsonResponse({ members });
}

// ---------------------------------------------------------------------------
// static files
// ---------------------------------------------------------------------------

async function serveStatic(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  pathname = pathname.replace(/\.\.+/g, ""); // no path traversal

  const filePath = ROOT + pathname.slice(1);

  let stat: Deno.FileInfo;
  try {
    stat = await Deno.stat(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (stat.isDirectory) {
    return serveStatic(new Request(new URL(pathname.replace(/\/?$/, "/index.html"), url)));
  }

  const dot = pathname.lastIndexOf(".");
  const ext = dot === -1 ? "" : pathname.slice(dot);
  const contentType = MIME[ext] || "application/octet-stream";

  const file = await Deno.open(filePath, { read: true });
  return new Response(file.readable, {
    headers: {
      "content-type": contentType,
      "content-length": String(stat.size),
    },
  });
}

// ---------------------------------------------------------------------------
// router
// ---------------------------------------------------------------------------

Deno.serve({ port: Number(Deno.env.get("PORT")) || 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/api/signup" && req.method === "POST") return handleSignup(req);
  if (url.pathname === "/api/login" && req.method === "POST") return handleLogin(req);
  if (url.pathname === "/api/logout" && req.method === "POST") return handleLogout(req);
  if (url.pathname === "/api/me" && req.method === "GET") return handleMe(req);
  if (url.pathname === "/api/members" && req.method === "GET") return handleMembers();

  return serveStatic(req);
});
