import crypto from "crypto";

const ACCESS_TOKEN = process.env.SNAP_CAPI_TOKEN;
const TEST_EVENT_CODE = process.env.SNAP_CAPI_TEST_EVENT_CODE;

// ✅ Force canonical site URL if you have it
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL; // e.g. https://mirayfashions.com

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normEmail(email) {
  return email?.trim().toLowerCase();
}

function normPhone(phone) {
  return phone?.replace(/[^\d+]/g, "");
}

// ✅ Recursively remove undefined/null/empty keys
function clean(obj) {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach((k) => {
    const v = obj[k];

    if (v && typeof v === "object" && !Array.isArray(v)) {
      clean(v);
    }

    if (
      obj[k] === undefined ||
      obj[k] === null ||
      obj[k] === "" ||
      (typeof obj[k] === "object" &&
        !Array.isArray(obj[k]) &&
        Object.keys(obj[k]).length === 0)
    ) {
      delete obj[k];
    }
  });

  return obj;
}

// ✅ Helper: hash string OR array of strings
function hashField(value, normalizer) {
  if (!value) return value;

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((v) => sha256(normalizer(v)))
      .filter(Boolean);
  }

  return sha256(normalizer(value));
}

export async function POST(req) {
  try {
    if (!ACCESS_TOKEN) {
      return Response.json(
        { ok: false, error: "Missing SNAP_CAPI_TOKEN" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const h = req.headers;

    const now = Math.floor(Date.now() / 1000);

    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;

    const ua = h.get("user-agent") || undefined;

    const proto = h.get("x-forwarded-proto") || "https";
    const host = h.get("x-forwarded-host") || h.get("host");
    const detectedOrigin = host ? `${proto}://${host}` : undefined;

    const {
      event_name,
      event_id,
      properties = {},
      user = {},
      event_source_url,
    } = body || {};

    if (!event_name) {
      return Response.json(
        { ok: false, error: "event_name required" },
        { status: 400 }
      );
    }

    const finalEventId = event_id || crypto.randomUUID();

    const finalEventSourceUrl =
      event_source_url ||
      h.get("referer") ||
      SITE_URL ||
      detectedOrigin ||
      undefined;

    // ✅ enrich user with ip + ua
    const enrichedUser = clean({
      ...user,
      ip_address: user?.ip_address || ip,
      user_agent: user?.user_agent || ua,
    });

    // ✅ hash raw PII if provided (recommended)
    // Support both { email, phone } from your frontend
    if (enrichedUser.email)
      enrichedUser.email = hashField(enrichedUser.email, normEmail);

    if (enrichedUser.phone)
      enrichedUser.phone = hashField(enrichedUser.phone, normPhone);

    // Optional: if you ever pass uuid_c1 from cookie, keep it as-is (not hashed)
    // enrichedUser.uuid_c1 = ...

    const payload = clean({
      data: [
        clean({
          event_type: "WEB",
          event_name, // e.g. "ADD_CART", "START_CHECKOUT", "PURCHASE"
          timestamp: now,
          event_id: finalEventId,
          // Snapchat doesn't require event_source_url explicitly,
          // but we keep it in properties for debugging/consistency
          properties: clean({
            ...properties,
            event_source_url: finalEventSourceUrl,
          }),
          user: enrichedUser,
        }),
      ],
      ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    });

    const res = await fetch("https://tr.snapchat.com/v2/conversion", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
      return Response.json(
        {
          ok: false,
          error: "Snap API rejected request",
          snap_status: res.status,
          snap_body: text,
          sent_payload: payload,
          used_event_source_url: finalEventSourceUrl,
        },
        { status: 500 }
      );
    }

    return Response.json(
      { ok: true, snap_body: text, used_event_source_url: finalEventSourceUrl },
      { status: 200 }
    );
  } catch (err) {
    console.error("Snap CAPI Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
