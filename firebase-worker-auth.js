let _keyCache = { keys: {}, expiry: 0 };

async function getFirebasePublicKeys() {
  if (Date.now() < _keyCache.expiry) return _keyCache.keys;

  const res = await fetch(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  );
  if (!res.ok) throw new Error("Failed to fetch Firebase public keys");

  const { keys } = await res.json();
  const keyMap = {};

  for (const jwk of keys) {
    keyMap[jwk.kid] = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }

  _keyCache = { keys: keyMap, expiry: Date.now() + 60 * 60 * 1000 };
  return keyMap;
}

// ─── Verify Firebase ID token ─────────────────────────────────────────────────
// Returns { uid, email, name, emailVerified } or throws
export async function verifyFirebaseToken(idToken, env) {
  if (!idToken) throw new AuthError("No token provided");

  const parts = idToken.split(".");
  if (parts.length !== 3) throw new AuthError("Malformed token");

  let header, payload;
  try {
    header = JSON.parse(b64urlDecode(parts[0]));
    payload = JSON.parse(b64urlDecode(parts[1]));
  } catch {
    throw new AuthError("Invalid token encoding");
  }

  // ── Claim checks ──────────────────────────────────────────────────────────
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    throw new AuthError(
      "Token expired — client should call getIdToken(true) to refresh",
    );
  }

  if (payload.aud !== env.FIREBASE_PROJECT_ID) {
    throw new AuthError("Token audience mismatch");
  }

  if (
    payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`
  ) {
    throw new AuthError("Token issuer mismatch");
  }

  if (!payload.sub) throw new AuthError("Token missing uid");

  // ── Signature verification ─────────────────────────────────────────────────
  const keys = await getFirebasePublicKeys();
  const publicKey = keys[header.kid];
  if (!publicKey)
    throw new AuthError("Unknown signing key — token may be stale, retry");

  const enc = new TextEncoder();
  const signingInput = enc.encode(`${parts[0]}.${parts[1]}`);
  const sigBytes = Uint8Array.from(b64urlDecode(parts[2]), (c) =>
    c.charCodeAt(0),
  );

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    sigBytes,
    signingInput,
  );
  if (!valid) throw new AuthError("Invalid token signature");

  return {
    uid: payload.sub,
    email: payload.email || null,
    name: payload.name || null,
    emailVerified: payload.email_verified || false,
    picture: payload.picture || null,
  };
}

function b64urlDecode(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return atob(padded);
}

export class AuthError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "AuthError";
    this.status = 401;
  }
}

// ─── Auth middleware for your Worker routes ───────────────────────────────────
// Usage: const { uid, email, plan } = await requireFirebaseAuth(request, env);
export async function requireFirebaseAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";

  // Firebase ID token: "Bearer eyJhb..."
  if (authHeader.startsWith("Bearer eyJ")) {
    const idToken = authHeader.slice(7);
    const firebaseUser = await verifyFirebaseToken(idToken, env);

    // Load plan from KV (Firebase only knows about auth, not billing)
    const planRecord = await env.USERS.get(`plan:${firebaseUser.uid}`, {
      type: "json",
    });
    const plan = planRecord?.plan || "free";

    return { ...firebaseUser, plan, planRecord };
  }

  // API key auth (Pro/Business users only): "Bearer vl_live_xxx"
  if (authHeader.startsWith("Bearer vl_live_")) {
    const apiKey = authHeader.slice(7);
    const keyRecord = await env.USERS.get(`apikey:${apiKey}`, { type: "json" });

    if (!keyRecord || !keyRecord.active) {
      throw new AuthError("Invalid or revoked API key");
    }

    // Non-blocking: update lastUsed
    env.USERS.put(
      `apikey:${apiKey}`,
      JSON.stringify({
        ...keyRecord,
        lastUsed: Date.now(),
      }),
    );

    const planRecord = await env.USERS.get(`plan:${keyRecord.uid}`, {
      type: "json",
    });
    const plan = planRecord?.plan || "free";

    return {
      uid: keyRecord.uid,
      email: keyRecord.email || null,
      name: null,
      plan,
      planRecord,
      viaApiKey: true,
    };
  }

  throw new AuthError(
    "No valid Authorization header. Send Firebase ID token or API key.",
  );
}

// ─── Plan config ──────────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    exportsPerMonth: 25,
    maxFileMB: 100,
    watermark: true,
    apiAccess: false,
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 19,
    exportsPerMonth: 500,
    maxFileMB: 1000,
    watermark: false,
    apiAccess: true,
    // env.STRIPE_PRO_PRICE_ID
  },
  business: {
    name: "Business",
    price: 79,
    exportsPerMonth: -1, // unlimited
    maxFileMB: 2000,
    watermark: false,
    apiAccess: true,
    // env.STRIPE_BUSINESS_PRICE_ID
  },
};

// ─── Usage tracking ───────────────────────────────────────────────────────────
function usageKey(uid) {
  const d = new Date();
  return `usage:${uid}:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function checkAndIncrementUsage(uid, plan, env) {
  const config = PLANS[plan] || PLANS.free;
  if (config.exportsPerMonth === -1) return; // unlimited

  const key = usageKey(uid);
  const current = parseInt((await env.USERS.get(key)) || "0");

  if (current >= config.exportsPerMonth) {
    throw new Error(
      `Monthly limit reached (${config.exportsPerMonth} exports on ${config.name} plan). ` +
        `Upgrade at videolid.com/pricing`,
    );
  }

  // Atomic increment with 35-day TTL (auto-resets after month)
  await env.USERS.put(key, String(current + 1), {
    expirationTtl: 35 * 24 * 60 * 60,
  });
}

export async function getUsage(uid, plan, env) {
  const config = PLANS[plan] || PLANS.free;
  const count = parseInt((await env.USERS.get(usageKey(uid))) || "0");
  const reset = new Date();
  reset.setMonth(reset.getMonth() + 1, 1);
  reset.setHours(0, 0, 0, 0);

  return {
    plan,
    planName: config.name,
    exportsUsed: count,
    exportsLimit:
      config.exportsPerMonth === -1 ? "unlimited" : config.exportsPerMonth,
    maxFileMB: config.maxFileMB,
    watermark: config.watermark,
    apiAccess: config.apiAccess,
    resetDate: reset.toISOString().split("T")[0],
  };
}

// ─── R2 path helpers ──────────────────────────────────────────────────────────
// Files are always scoped to the user's Firebase UID
// inputs/{uid}/{jobId}/filename.mp4
// outputs/{uid}/{jobId}/filename_compressed.mp4
export const r2Path = {
  input: (uid, jobId, fileName) => `inputs/${uid}/${jobId}/${fileName}`,
  output: (uid, jobId, fileName) => `outputs/${uid}/${jobId}/${fileName}`,
};

// ─── API key management (Pro/Business only) ───────────────────────────────────
function generateApiKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return (
    "vl_live_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export async function createApiKey(uid, email, name, env) {
  const config =
    PLANS[
      (await env.USERS.get(`plan:${uid}`, { type: "json" }))?.plan || "free"
    ];
  if (!config.apiAccess)
    throw new Error("API keys require Pro or Business plan");

  const key = generateApiKey();
  const index = JSON.parse((await env.USERS.get(`keyindex:${uid}`)) || "[]");
  index.push(key);

  await Promise.all([
    env.USERS.put(
      `apikey:${key}`,
      JSON.stringify({
        uid,
        email,
        name: name || "My Key",
        createdAt: Date.now(),
        lastUsed: null,
        active: true,
      }),
    ),
    env.USERS.put(`keyindex:${uid}`, JSON.stringify(index)),
  ]);

  return key;
}

export async function listApiKeys(uid, env) {
  const index = JSON.parse((await env.USERS.get(`keyindex:${uid}`)) || "[]");
  const keys = await Promise.all(
    index.map(async (k) => {
      const rec = await env.USERS.get(`apikey:${k}`, { type: "json" });
      if (!rec || !rec.active) return null;
      return {
        maskedKey: `${k.slice(0, 15)}${"*".repeat(16)}`,
        fullKey: k,
        name: rec.name,
        createdAt: rec.createdAt,
        lastUsed: rec.lastUsed,
      };
    }),
  );
  return keys.filter(Boolean);
}

export async function revokeApiKey(uid, key, env) {
  const rec = await env.USERS.get(`apikey:${key}`, { type: "json" });
  if (!rec || rec.uid !== uid) throw new Error("Key not found");
  await env.USERS.put(
    `apikey:${key}`,
    JSON.stringify({ ...rec, active: false }),
  );
}

// ─── Stripe billing (tied to Firebase UID) ────────────────────────────────────
export async function createCheckoutSession(uid, email, plan, env) {
  if (!["pro", "business"].includes(plan)) throw new Error("Invalid plan");
  const priceId =
    plan === "pro" ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_BUSINESS_PRICE_ID;

  let planRecord = (await env.USERS.get(`plan:${uid}`, { type: "json" })) || {};
  let customerId = planRecord.stripeCustomerId;

  if (!customerId) {
    const customer = await stripeRequest(env, "POST", "/v1/customers", {
      email,
      metadata: { firebase_uid: uid },
    });
    customerId = customer.id;
    planRecord = { ...planRecord, stripeCustomerId: customerId };
    await env.USERS.put(`plan:${uid}`, JSON.stringify(planRecord));
  }

  const session = await stripeRequest(env, "POST", "/v1/checkout/sessions", {
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${env.APP_URL}/pricing`,
    metadata: { firebase_uid: uid, plan },
    subscription_data: { metadata: { firebase_uid: uid, plan } },
  });

  return session.url;
}

export async function createPortalSession(uid, env) {
  const planRecord = await env.USERS.get(`plan:${uid}`, { type: "json" });
  if (!planRecord?.stripeCustomerId) throw new Error("No active subscription");

  const session = await stripeRequest(
    env,
    "POST",
    "/v1/billing_portal/sessions",
    {
      customer: planRecord.stripeCustomerId,
      return_url: `${env.APP_URL}/dashboard`,
    },
  );
  return session.url;
}

export async function handleStripeWebhook(request, env, origin) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();
  const event = await verifyStripeWebhook(body, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!event) return errorResponse("Invalid webhook signature", 400, origin);

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const uid = s.metadata?.firebase_uid;
      const plan = s.metadata?.plan;
      if (uid && plan) await setPlan(uid, plan, s.subscription, env);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const uid = sub.metadata?.firebase_uid;
      if (!uid) break;
      const priceId = sub.items?.data?.[0]?.price?.id;
      const plan =
        priceId === env.STRIPE_PRO_PRICE_ID
          ? "pro"
          : priceId === env.STRIPE_BUSINESS_PRICE_ID
            ? "business"
            : "free";
      await setPlan(uid, plan, sub.id, env);
      break;
    }
    case "customer.subscription.deleted": {
      const uid = event.data.object.metadata?.firebase_uid;
      if (uid) await setPlan(uid, "free", null, env);
      break;
    }
  }

  return jsonResponse({ received: true }, 200, origin);
}

async function setPlan(uid, plan, subscriptionId, env) {
  const existing = (await env.USERS.get(`plan:${uid}`, { type: "json" })) || {};
  await env.USERS.put(
    `plan:${uid}`,
    JSON.stringify({
      ...existing,
      plan,
      stripeSubscriptionId: subscriptionId,
      updatedAt: Date.now(),
    }),
  );
}

// ─── Stripe helpers ───────────────────────────────────────────────────────────
async function stripeRequest(env, method, path, data) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data ? new URLSearchParams(flattenParams(data)).toString() : null,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${json.error?.message}`);
  return json;
}

function flattenParams(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object")
          Object.assign(out, flattenParams(item, `${key}[${i}]`));
        else out[`${key}[${i}]`] = String(item);
      });
    } else if (typeof v === "object") {
      Object.assign(out, flattenParams(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

async function verifyStripeWebhook(body, sig, secret) {
  try {
    const parts = Object.fromEntries(sig.split(",").map((p) => p.split("=")));
    const timestamp = parts["t"];
    if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) return null;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigData = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(`${timestamp}.${body}`),
    );
    const computed = Array.from(new Uint8Array(sigData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computed !== parts["v1"]) return null;
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// ─── Response helpers ─────────────────────────────────────────────────────────
export const jsonResponse = (data, status = 200, origin) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

export const errorResponse = (msg, status = 400, origin) =>
  jsonResponse({ error: msg }, status, origin);
