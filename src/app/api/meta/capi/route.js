import crypto from "crypto";

const API_VERSION = process.env.META_CAPI_API_VERSION || "v21.0";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

// ✅ Prefer server env var for pixel id
const PIXEL_ID =
  process.env.META_CAPI_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;

const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

// ✅ Force canonical site URL if you have it
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL; // e.g. https://mirayfashions.com

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
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
      clean(v); // recursive clean
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
    if (!ACCESS_TOKEN || !PIXEL_ID) {
      return Response.json(
        { ok: false, error: "Missing META_CAPI_ACCESS_TOKEN / PIXEL_ID" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // ✅ Use req.headers directly (always Headers object)
    const h = req.headers;

    const now = Math.floor(Date.now() / 1000);

    // ✅ Better IP extraction behind proxy/Vercel/Cloudflare
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;

    const ua = h.get("user-agent") || undefined;

    // ✅ Detect correct origin behind reverse proxy (fix base url issue)
    const proto = h.get("x-forwarded-proto") || "https";
    const host = h.get("x-forwarded-host") || h.get("host");
    const detectedOrigin = host ? `${proto}://${host}` : undefined;

    const {
      event_name,
      event_id,
      custom_data = {},
      user_data = {},
      event_source_url,
    } = body || {};

    if (!event_name || !event_id) {
      return Response.json(
        { ok: false, error: "event_name and event_id required" },
        { status: 400 }
      );
    }

    // ✅ final event_source_url priority:
    // 1) event_source_url passed by frontend (best)
    // 2) referer header
    // 3) NEXT_PUBLIC_SITE_URL (canonical)
    // 4) detected origin from x-forwarded headers
    const finalEventSourceUrl =
      event_source_url ||
      h.get("referer") ||
      SITE_URL ||
      detectedOrigin ||
      undefined;

    // ✅ enrich user data with ip + ua
    const enrichedUserData = clean({
      ...user_data,
      client_ip_address: ip,
      client_user_agent: ua,
    });

    // ✅ hash raw PII if provided (supports string OR array)
    if (enrichedUserData.em)
      enrichedUserData.em = hashField(enrichedUserData.em, normEmail);

    if (enrichedUserData.ph)
      enrichedUserData.ph = hashField(enrichedUserData.ph, normPhone);

    const payload = {
      data: [
        clean({
          event_name,
          event_time: now,
          event_id,
          action_source: "website",
          event_source_url: finalEventSourceUrl,
          user_data: enrichedUserData,
          custom_data,
        }),
      ],
      ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    // ✅ Return useful error information if Meta rejects
    if (!res.ok) {
      return Response.json(
        {
          ok: false,
          error: "Meta API rejected request",
          meta: json,
          sent_payload: payload,
          used_event_source_url: finalEventSourceUrl,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ok: true,
        meta: json,
        used_event_source_url: finalEventSourceUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Meta CAPI Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
