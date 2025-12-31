import crypto from "crypto";
import { headers } from "next/headers";

const API_VERSION = process.env.META_CAPI_API_VERSION || "v21.0";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function normEmail(email) {
  return email?.trim().toLowerCase();
}
function normPhone(phone) {
  return phone?.replace(/[^\d+]/g, "");
}

export async function POST(req) {
  if (!ACCESS_TOKEN || !PIXEL_ID) {
    return Response.json({ ok: false, error: "Missing META_CAPI_ACCESS_TOKEN / PIXEL_ID" }, { status: 500 });
  }

  const body = await req.json();
  const h = headers();

  const now = Math.floor(Date.now() / 1000);
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = h.get("user-agent");

  const { event_name, event_id, custom_data = {}, user_data = {}, event_source_url } = body || {};
  if (!event_name || !event_id) {
    return Response.json({ ok: false, error: "event_name and event_id required" }, { status: 400 });
  }

  const enrichedUserData = {
    ...user_data,
    client_ip_address: ip,
    client_user_agent: ua,
  };

  // hash if raw provided (optional)
  if (enrichedUserData.em) enrichedUserData.em = sha256(normEmail(enrichedUserData.em));
  if (enrichedUserData.ph) enrichedUserData.ph = sha256(normPhone(enrichedUserData.ph));

  const payload = {
    data: [
      {
        event_name,
        event_time: now,
        event_id,
        action_source: "website",
        event_source_url: event_source_url || h.get("referer") || undefined,
        user_data: enrichedUserData,
        custom_data,
      },
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
  return Response.json({ ok: res.ok, meta: json }, { status: res.ok ? 200 : 500 });
}
