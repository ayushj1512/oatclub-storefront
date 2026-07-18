import { NextResponse } from "next/server";
import { ParamBuilder } from "capi-param-builder-nodejs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_VERSION =
  process.env.META_CAPI_API_VERSION || "v21.0";

const ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN || "";

const PIXEL_ID =
  process.env.META_CAPI_PIXEL_ID ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID ||
  "";

const TEST_EVENT_CODE =
  process.env.META_CAPI_TEST_EVENT_CODE || "";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://oatclub.in"
).replace(/\/$/, "");

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "ViewCart",
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
    Object.entries(object).filter(([, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    })
  );

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");

        if (index < 0) {
          return [cookie, ""];
        }

        const name = cookie.slice(0, index);
        const rawValue = cookie.slice(index + 1);

        try {
          return [name, decodeURIComponent(rawValue)];
        } catch {
          return [name, rawValue];
        }
      })
  );

const getClientIp = (headers) => {
  const forwardedFor =
    headers.get("x-forwarded-for") || "";

  return (
    forwardedFor.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    undefined
  );
};

const getRequestData = (request) => {
  const url = new URL(request.url);
  const headers = request.headers;

  return {
    host:
      headers.get("x-forwarded-host") ||
      headers.get("host") ||
      url.host,

    query: Object.fromEntries(
      url.searchParams.entries()
    ),

    cookies: parseCookies(
      headers.get("cookie") || ""
    ),

    referrer:
      headers.get("referer") || undefined,

    clientIp: getClientIp(headers),

    userAgent:
      headers.get("user-agent") || undefined,
  };
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeEmail = (value) => {
  const email = String(value || "")
    .trim()
    .toLowerCase();

  return email || undefined;
};

const normalizePhone = (value) => {
  if (!value) return undefined;

  let phone = String(value).replace(/\D/g, "");

  if (!phone) return undefined;

  if (
    phone.length === 11 &&
    phone.startsWith("0")
  ) {
    phone = phone.slice(1);
  }

  if (phone.length === 10) {
    phone = `91${phone}`;
  }

  return phone || undefined;
};

const normalizeText = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return normalized || undefined;
};

const normalizeCountry = (value) => {
  const country = String(value || "in")
    .trim()
    .toLowerCase();

  if (
    country === "india" ||
    country === "ind"
  ) {
    return "in";
  }

  return country || "in";
};

const normalizeGender = (value) => {
  const gender = String(value || "")
    .trim()
    .toLowerCase();

  if (
    gender === "female" ||
    gender === "woman"
  ) {
    return "f";
  }

  if (
    gender === "male" ||
    gender === "man"
  ) {
    return "m";
  }

  return ["f", "m"].includes(gender)
    ? gender
    : undefined;
};

const normalizeDateOfBirth = (value) => {
  if (!value) return undefined;

  const digits = String(value).replace(/\D/g, "");

  return digits.length === 8
    ? digits
    : undefined;
};

const getNameParts = (userData = {}) => {
  const fullName = String(
    firstValue(
      userData.name,
      userData.fullName,
      userData.full_name
    ) || ""
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: firstValue(
      userData.fn,
      userData.firstName,
      userData.first_name,
      fullName[0]
    ),

    lastName: firstValue(
      userData.ln,
      userData.lastName,
      userData.last_name,
      fullName.length > 1
        ? fullName.slice(1).join(" ")
        : undefined
    ),
  };
};

/* =========================================================
   HASHING
========================================================= */

const hashPII = (
  builder,
  value,
  type,
  normalizer = normalizeText
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const inputValues = Array.isArray(value)
    ? value
    : [value];

  const hashedValues = inputValues
    .map((item) => normalizer(item))
    .filter(Boolean)
    .map((item) => {
      try {
        return builder.getNormalizedAndHashedPII(
          String(item),
          type
        );
      } catch (error) {
        console.warn(
          `Meta ${type} hashing failed:`,
          error
        );

        return undefined;
      }
    })
    .filter(Boolean);

  if (!hashedValues.length) {
    return undefined;
  }

  return Array.isArray(value)
    ? hashedValues
    : hashedValues[0];
};

/* =========================================================
   USER DATA
========================================================= */

const buildUserData = ({
  builder,
  userData = {},
  cookies = {},
  clientIp,
  userAgent,
}) => {
  const { firstName, lastName } =
    getNameParts(userData);

  const email = firstValue(
    userData.em,
    userData.email,
    userData.customerEmail
  );

  const phone = firstValue(
    userData.ph,
    userData.phone,
    userData.mobile,
    userData.phoneNumber,
    userData.customerPhone
  );

  const externalId = firstValue(
    userData.external_id,
    userData.externalId,
    userData.customerId,
    userData.userId,
    userData.uid
  );

  const city = firstValue(
    userData.ct,
    userData.city
  );

  const state = firstValue(
    userData.st,
    userData.state
  );

  const zipCode = firstValue(
    userData.zp,
    userData.zip,
    userData.zipCode,
    userData.zip_code,
    userData.postalCode,
    userData.postal_code,
    userData.pincode
  );

  const country = firstValue(
    userData.country,
    userData.countryCode,
    userData.country_code,
    "in"
  );

  const dateOfBirth = firstValue(
    userData.db,
    userData.dob,
    userData.dateOfBirth,
    userData.date_of_birth
  );

  const gender = firstValue(
    userData.ge,
    userData.gender,
    userData.gen
  );

  /*
   * These values must remain unhashed.
   *
   * Client-provided values are preferred because the API
   * request URL normally does not contain the original fbclid.
   */
  const fbc = firstValue(
    userData.fbc,
    cookies._fbc,
    builder.getFbc?.()
  );

  const fbp = firstValue(
    userData.fbp,
    cookies._fbp,
    builder.getFbp?.()
  );

  return clean({
    em: hashPII(
      builder,
      email,
      "email",
      normalizeEmail
    ),

    ph: hashPII(
      builder,
      phone,
      "phone",
      normalizePhone
    ),

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
      city,
      "city"
    ),

    st: hashPII(
      builder,
      state,
      "state"
    ),

    zp: hashPII(
      builder,
      zipCode,
      "zip_code"
    ),

    country: hashPII(
      builder,
      country,
      "country",
      normalizeCountry
    ),

    db: hashPII(
      builder,
      dateOfBirth,
      "date_of_birth",
      normalizeDateOfBirth
    ),

    ge: hashPII(
      builder,
      gender,
      "gender",
      normalizeGender
    ),

    external_id: hashPII(
      builder,
      externalId,
      "external_id"
    ),

    fbc,
    fbp,

    client_ip_address:
      clientIp ||
      builder.getClientIpAddress?.() ||
      undefined,

    client_user_agent:
      userAgent || undefined,
  });
};

/* =========================================================
   CUSTOM DATA
========================================================= */

const normalizeCustomData = (
  customData = {}
) => {
  const contents = Array.isArray(
    customData.contents
  )
    ? customData.contents
        .map((item) =>
          clean({
            id:
              item?.id !== undefined
                ? String(item.id)
                : undefined,

            quantity:
              Number(item?.quantity) > 0
                ? Number(item.quantity)
                : undefined,

            item_price:
              Number.isFinite(
                Number(item?.item_price)
              )
                ? Number(item.item_price)
                : undefined,
          })
        )
        .filter((item) => item.id)
    : undefined;

  const contentIds = Array.isArray(
    customData.content_ids
  )
    ? customData.content_ids
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    : undefined;

  return clean({
    ...customData,

    value: Number.isFinite(
      Number(customData.value)
    )
      ? Number(customData.value)
      : undefined,

    currency:
      customData.currency ||
      (customData.value !== undefined
        ? "INR"
        : undefined),

    content_ids: contentIds,
    contents,
  });
};

/* =========================================================
   BUILDER COOKIES
========================================================= */

const applyBuilderCookies = (
  response,
  cookies = []
) => {
  for (const cookie of cookies) {
    if (!cookie?.name || !cookie?.value) {
      continue;
    }

    const isLocalhost =
      !cookie.domain ||
      cookie.domain === "localhost";

    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      maxAge:
        Number(cookie.maxAge) ||
        undefined,
      path: cookie.path || "/",
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      httpOnly: false,

      ...(isLocalhost
        ? {}
        : {
            domain: cookie.domain,
          }),
    });
  }

  return response;
};

/* =========================================================
   GET /api/meta/capi
========================================================= */

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(
      ACCESS_TOKEN && PIXEL_ID
    ),
    pixel_id: PIXEL_ID
      ? `${PIXEL_ID.slice(0, 4)}***`
      : null,
    api_version: API_VERSION,
    test_mode: Boolean(TEST_EVENT_CODE),
  });
}

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
        {
          status: 500,
        }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    const {
      event_name: eventName,
      event_id: eventId,
      event_time: eventTime,
      event_source_url: eventSourceUrl,
      custom_data: customData = {},
      user_data: userData = {},
    } = body || {};

    if (
      !eventName ||
      !ALLOWED_EVENTS.has(eventName)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "A valid event_name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "event_id is required for Pixel and CAPI deduplication",
        },
        {
          status: 400,
        }
      );
    }

    const requestData =
      getRequestData(request);

    const builder = new ParamBuilder([
      "oatclub.in",
      "www.oatclub.in",
      "localhost",
      "127.0.0.1",
    ]);

    let cookiesToSet = [];

    try {
      cookiesToSet =
        builder.processRequest(
          requestData.host,
          requestData.query,
          requestData.cookies,
          requestData.referrer,
          requestData.clientIp,
          null
        ) || [];
    } catch (error) {
      console.warn(
        "Meta ParamBuilder request processing failed:",
        error
      );
    }

    const finalSourceUrl =
      eventSourceUrl ||
      builder.getEventSourceUrl?.() ||
      requestData.referrer ||
      SITE_URL;

    const finalUserData = buildUserData({
      builder,
      userData,
      cookies: requestData.cookies,
      clientIp: requestData.clientIp,
      userAgent: requestData.userAgent,
    });

    const metaEvent = clean({
      event_name: eventName,

      event_id: String(eventId),

      event_time:
        Number(eventTime) > 0
          ? Math.floor(Number(eventTime))
          : Math.floor(Date.now() / 1000),

      action_source: "website",

      event_source_url: finalSourceUrl,

      user_data: finalUserData,

      custom_data:
        normalizeCustomData(customData),
    });

    const payload = {
      data: [metaEvent],

      ...(TEST_EVENT_CODE
        ? {
            test_event_code:
              TEST_EVENT_CODE,
          }
        : {}),
    };

    const metaUrl =
      `https://graph.facebook.com/` +
      `${API_VERSION}/${PIXEL_ID}/events`;

    const metaResponse = await fetch(
      metaUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${ACCESS_TOKEN}`,
        },

        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const metaResult =
      await metaResponse
        .json()
        .catch(() => null);

    if (!metaResponse.ok) {
      console.error(
        "Meta CAPI rejected event:",
        {
          eventName,
          eventId,
          status: metaResponse.status,
          metaResult,
        }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            metaResult?.error?.message ||
            "Meta API rejected the event",

          meta: metaResult,
        },
        {
          status: metaResponse.status,
        }
      );
    }

    const response =
      NextResponse.json({
        ok: true,

        event_name: eventName,
        event_id: String(eventId),

        events_received:
          metaResult?.events_received,

        messages:
          metaResult?.messages,

        fbtrace_id:
          metaResult?.fbtrace_id,

        match_data: {
          email: Boolean(
            finalUserData.em
          ),

          phone: Boolean(
            finalUserData.ph
          ),

          external_id: Boolean(
            finalUserData.external_id
          ),

          first_name: Boolean(
            finalUserData.fn
          ),

          last_name: Boolean(
            finalUserData.ln
          ),

          city: Boolean(
            finalUserData.ct
          ),

          state: Boolean(
            finalUserData.st
          ),

          zip_code: Boolean(
            finalUserData.zp
          ),

          country: Boolean(
            finalUserData.country
          ),

          fbc: Boolean(
            finalUserData.fbc
          ),

          fbp: Boolean(
            finalUserData.fbp
          ),

          client_ip_address: Boolean(
            finalUserData.client_ip_address
          ),

          client_user_agent: Boolean(
            finalUserData.client_user_agent
          ),
        },

        test_mode:
          Boolean(TEST_EVENT_CODE),
      });

    return applyBuilderCookies(
      response,

      cookiesToSet.length
        ? cookiesToSet
        : builder.getCookiesToSet?.() ||
            []
    );
  } catch (error) {
    console.error(
      "Meta CAPI route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Unable to send Meta CAPI event",
      },
      {
        status: 500,
      }
    );
  }
}