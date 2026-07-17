import { NextResponse } from "next/server";
import { ParamBuilder } from "capi-param-builder-nodejs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_VERSION =
  process.env.META_CAPI_API_VERSION || "v21.0";

const ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN;

const PIXEL_ID =
  process.env.META_CAPI_PIXEL_ID ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID;

const TEST_EVENT_CODE =
  process.env.META_CAPI_TEST_EVENT_CODE;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://oatclub.in";

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
]);

/* =========================================================
   HELPERS
========================================================= */

const clean = (object = {}) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
    )
  );

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");

        if (index === -1) return [cookie, ""];

        return [
          cookie.slice(0, index),
          decodeURIComponent(cookie.slice(index + 1)),
        ];
      })
  );

const getRequestData = (request) => {
  const url = new URL(request.url);
  const headers = request.headers;

  return {
    host:
      headers.get("x-forwarded-host") ||
      headers.get("host") ||
      url.host,

    query: Object.fromEntries(url.searchParams.entries()),

    cookies: parseCookies(headers.get("cookie") || ""),

    referrer: headers.get("referer") || undefined,

    forwardedIp:
      headers.get("x-forwarded-for") ||
      headers.get("x-real-ip") ||
      undefined,

    userAgent:
      headers.get("user-agent") || undefined,
  };
};

const getNameParts = (userData = {}) => {
  const parts = String(userData.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName:
      userData.fn ||
      userData.firstName ||
      userData.first_name ||
      parts[0],

    lastName:
      userData.ln ||
      userData.lastName ||
      userData.last_name ||
      (parts.length > 1
        ? parts.slice(1).join(" ")
        : undefined),
  };
};

const normalizePhoneInput = (value) => {
  if (!value) return undefined;

  let phone = String(value).replace(/\D/g, "");

  if (phone.length === 10) {
    phone = `91${phone}`;
  }

  return phone || undefined;
};

const hashPII = (builder, value, type) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];

  const result = values
    .map((item) =>
      builder.getNormalizedAndHashedPII(
        String(item),
        type
      )
    )
    .filter(Boolean);

  if (!result.length) return undefined;

  return Array.isArray(value) ? result : result[0];
};

const buildUserData = ({
  builder,
  userData,
  userAgent,
  forwardedIp,
}) => {
  const { firstName, lastName } =
    getNameParts(userData);

  const email =
    userData.em || userData.email;

  const phone = normalizePhoneInput(
    userData.ph ||
      userData.phone ||
      userData.mobile
  );

  const externalId =
    userData.external_id ||
    userData.externalId ||
    userData.customerId;

  return clean({
    em: hashPII(builder, email, "email"),
    ph: hashPII(builder, phone, "phone"),

    fn: hashPII(
      builder,
      firstName,
      "first_name"
    ),

    ln: hashPII(
      builder,
      lastName,
      "last_name"
    ),

    ct: hashPII(
      builder,
      userData.ct || userData.city,
      "city"
    ),

    st: hashPII(
      builder,
      userData.st || userData.state,
      "state"
    ),

    zp: hashPII(
      builder,
      userData.zp ||
        userData.zip ||
        userData.postalCode ||
        userData.pincode,
      "zip_code"
    ),

    country: hashPII(
      builder,
      userData.country || "in",
      "country"
    ),

    db: hashPII(
      builder,
      userData.db ||
        userData.dob ||
        userData.dateOfBirth,
      "date_of_birth"
    ),

    ge: hashPII(
      builder,
      userData.ge ||
        userData.gender ||
        userData.gen,
      "gender"
    ),

    external_id: hashPII(
      builder,
      externalId,
      "external_id"
    ),

    /*
     * Never hash or lowercase these values.
     * Prefer values captured by the client SDK.
     */
    fbc:
      userData.fbc ||
      builder.getFbc() ||
      undefined,

    fbp:
      userData.fbp ||
      builder.getFbp() ||
      undefined,

    client_ip_address:
      builder.getClientIpAddress() ||
      forwardedIp?.split(",")[0]?.trim() ||
      undefined,

    client_user_agent: userAgent,
  });
};

const applyBuilderCookies = (
  response,
  cookies = []
) => {
  for (const cookie of cookies) {
    if (!cookie?.name || !cookie?.value) continue;

    const isLocalhost =
      !cookie.domain ||
      cookie.domain === "localhost";

    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      maxAge: Number(cookie.maxAge) || undefined,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      ...(isLocalhost
        ? {}
        : { domain: cookie.domain }),
    });
  }

  return response;
};

/* =========================================================
   POST /api/meta/capi
========================================================= */

export async function POST(request) {
  try {
    if (!ACCESS_TOKEN || !PIXEL_ID) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing META_CAPI_ACCESS_TOKEN or META_CAPI_PIXEL_ID",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      custom_data = {},
      user_data = {},
    } = body || {};

    if (
      !event_name ||
      !event_id ||
      !ALLOWED_EVENTS.has(event_name)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Valid event_name and event_id are required",
        },
        { status: 400 }
      );
    }

    const requestData = getRequestData(request);

    const builder = new ParamBuilder([
      "oatclub.in",
      "localhost",
    ]);

    /*
     * NextRequest is not a native IncomingMessage,
     * therefore processRequest is used with extracted data.
     */
    const cookiesToSet = builder.processRequest(
      requestData.host,
      requestData.query,
      requestData.cookies,
      requestData.referrer,
      requestData.forwardedIp,
      null
    );

    const finalEventSourceUrl =
      event_source_url ||
      builder.getEventSourceUrl() ||
      requestData.referrer ||
      SITE_URL;

    const metaEvent = clean({
      event_name,
      event_id,

      event_time:
        Number(event_time) ||
        Math.floor(Date.now() / 1000),

      action_source: "website",

      event_source_url: finalEventSourceUrl,

      referrer_url:
        builder.getReferrerUrl() ||
        requestData.referrer ||
        undefined,

      user_data: buildUserData({
        builder,
        userData: user_data,
        userAgent: requestData.userAgent,
        forwardedIp: requestData.forwardedIp,
      }),

      custom_data: clean(custom_data),
    });

    const payload = {
      data: [metaEvent],

      ...(TEST_EVENT_CODE
        ? {
            test_event_code: TEST_EVENT_CODE,
          }
        : {}),
    };

    const metaUrl =
      `https://graph.facebook.com/${API_VERSION}/` +
      `${PIXEL_ID}/events?access_token=` +
      encodeURIComponent(ACCESS_TOKEN);

    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const metaResult = await metaResponse
      .json()
      .catch(() => null);

    if (!metaResponse.ok) {
      console.error("Meta CAPI rejected event:", {
        event_name,
        event_id,
        metaResult,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Meta API rejected the event",
          meta: metaResult,
        },
        { status: metaResponse.status }
      );
    }

    const response = NextResponse.json({
      ok: true,
      event_name,
      event_id,
      events_received:
        metaResult?.events_received,
      messages: metaResult?.messages,
      fbtrace_id: metaResult?.fbtrace_id,

      match_data: {
        fbc: Boolean(metaEvent.user_data?.fbc),
        fbp: Boolean(metaEvent.user_data?.fbp),
        client_ip_address: Boolean(
          metaEvent.user_data?.client_ip_address
        ),
        client_user_agent: Boolean(
          metaEvent.user_data?.client_user_agent
        ),
      },
    });

    return applyBuilderCookies(
      response,
      cookiesToSet ||
        builder.getCookiesToSet?.() ||
        []
    );
  } catch (error) {
    console.error("Meta CAPI route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Unable to send Meta CAPI event",
      },
      { status: 500 }
    );
  }
}