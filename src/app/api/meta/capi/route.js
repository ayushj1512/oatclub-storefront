import crypto from "crypto";

const API_VERSION = process.env.META_CAPI_API_VERSION || "v21.0";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

const PIXEL_ID =
  process.env.META_CAPI_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;

const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value || ""))
    .digest("hex");
}

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const v = String(value).trim().toLowerCase();
  return v || undefined;
}

function normEmail(value) {
  return cleanString(value);
}

function normPhone(value) {
  if (!value) return undefined;

  let phone = String(value).replace(/\D/g, "");

  if (phone.length === 10) {
    phone = `91${phone}`;
  }

  return phone || undefined;
}

function normText(value) {
  return cleanString(value);
}

function normCountry(value) {
  return cleanString(value || "in");
}

function normZip(value) {
  return String(value || "").replace(/\D/g, "") || undefined;
}

function normDob(value) {
  if (!value) return undefined;

  const raw = String(value).trim();

  if (/^\d{8}$/.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
}

function normGender(value) {
  const v = cleanString(value);
  if (!v) return undefined;

  if (["m", "male"].includes(v)) return "m";
  if (["f", "female"].includes(v)) return "f";

  return undefined;
}

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
      (Array.isArray(obj[k]) && obj[k].length === 0) ||
      (typeof obj[k] === "object" &&
        !Array.isArray(obj[k]) &&
        Object.keys(obj[k]).length === 0)
    ) {
      delete obj[k];
    }
  });

  return obj;
}

function hashField(value, normalizer = normText) {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    const hashed = value
      .map((v) => normalizer(v))
      .filter(Boolean)
      .map((v) => sha256(v));

    return hashed.length ? hashed : undefined;
  }

  const normalized = normalizer(value);
  return normalized ? sha256(normalized) : undefined;
}

function buildMetaUserData(userData = {}, ip, ua) {
  const rawName = userData.name || "";
  const nameParts = String(rawName).trim().split(/\s+/).filter(Boolean);

  const normalized = {
    external_id:
      userData.external_id || userData.externalId || userData.customerId,

    em: userData.em || userData.email,
    ph: userData.ph || userData.phone || userData.mobile,

    fn: userData.fn || userData.firstName || nameParts[0],
    ln:
      userData.ln ||
      userData.lastName ||
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined),

    ct: userData.ct || userData.city,
    st: userData.st || userData.state,
    country: userData.country || "in",

    zp: userData.zp || userData.zip || userData.pincode,
    db: userData.db || userData.dob,
    ge: userData.ge || userData.gender || userData.gen,

    fbp: userData.fbp,
    fbc: userData.fbc,

    client_ip_address: ip,
    client_user_agent: ua,
  };

  return clean({
    external_id: hashField(normalized.external_id, normText),

    em: hashField(normalized.em, normEmail),
    ph: hashField(normalized.ph, normPhone),

    fn: hashField(normalized.fn, normText),
    ln: hashField(normalized.ln, normText),

    ct: hashField(normalized.ct, normText),
    st: hashField(normalized.st, normText),
    country: hashField(normalized.country, normCountry),

    zp: hashField(normalized.zp, normZip),
    db: hashField(normalized.db, normDob),
    ge: hashField(normalized.ge, normGender),

    fbp: normalized.fbp,
    fbc: normalized.fbc,

    client_ip_address: normalized.client_ip_address,
    client_user_agent: normalized.client_user_agent,
  });
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

    const finalEventSourceUrl =
      event_source_url ||
      h.get("referer") ||
      SITE_URL ||
      detectedOrigin ||
      undefined;

    const enrichedUserData = buildMetaUserData(user_data, ip, ua);

    const payload = {
      data: [
        clean({
          event_name,
          event_time: now,
          event_id,
          action_source: "website",
          event_source_url: finalEventSourceUrl,
          user_data: enrichedUserData,
          custom_data: clean(custom_data),
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