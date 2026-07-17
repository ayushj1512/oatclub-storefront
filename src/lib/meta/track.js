"use client";

let builderPromise = null;
let parameterCapturePromise = null;

const META_STANDARD_EVENTS = new Set([
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

function generateEventId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCookie(name) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return undefined;

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function compactObject(object = {}) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

/* =========================================================
   PARAMETER BUILDER
========================================================= */

async function getParameterBuilder() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!builderPromise) {
    builderPromise = import("meta-capi-param-builder-clientjs")
      .then((module) => module?.default || module?.clientParamBuilder || module)
      .catch((error) => {
        builderPromise = null;

        console.warn("Meta Parameter Builder failed to load:", error);

        return null;
      });
  }

  return builderPromise;
}

export async function initializeMetaParameters() {
  if (typeof window === "undefined") {
    return {
      fbc: undefined,
      fbp: undefined,
    };
  }

  if (!parameterCapturePromise) {
    parameterCapturePromise = (async () => {
      const builder = await getParameterBuilder();

      try {
        if (typeof builder?.processAndCollectAllParams === "function") {
          await builder.processAndCollectAllParams(window.location.href);
        }
      } catch (error) {
        console.warn("Meta parameter capture failed:", error);
      }

      const fbc =
        typeof builder?.getFbc === "function" ? builder.getFbc() : undefined;

      const fbp =
        typeof builder?.getFbp === "function" ? builder.getFbp() : undefined;

      return compactObject({
        fbc: fbc || getCookie("_fbc"),
        fbp: fbp || getCookie("_fbp"),
      });
    })().catch((error) => {
      parameterCapturePromise = null;

      console.warn("Meta parameter initialization failed:", error);

      return compactObject({
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
      });
    });
  }

  return parameterCapturePromise;
}

async function getMetaBrowserData() {
  const captured = await initializeMetaParameters();

  return compactObject({
    fbc: captured?.fbc || getCookie("_fbc"),
    fbp: captured?.fbp || getCookie("_fbp"),
  });
}

/* =========================================================
   META TRACKER
========================================================= */

export async function trackMeta(
  eventName,
  customData = {},
  userData = {},
  options = {},
) {
  if (!eventName) return null;

  const event_id = options.event_id || options.eventId || generateEventId();

  const safeCustomData = compactObject(customData);

  /* =======================================================
     1. META PIXEL
  ======================================================= */

  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const method = META_STANDARD_EVENTS.has(eventName)
      ? "track"
      : "trackCustom";

    window.fbq(method, eventName, safeCustomData, {
      eventID: event_id,
    });
  }

  /* =======================================================
     2. PARAMETER BUILDER
  ======================================================= */

  const browserData = await getMetaBrowserData();

  const safeUserData = compactObject({
    ...userData,
    fbc: userData?.fbc || browserData?.fbc,
    fbp: userData?.fbp || browserData?.fbp,
  });

  const payload = compactObject({
    event_name: eventName,
    event_id,

    event_source_url:
      options.event_source_url ||
      options.eventSourceUrl ||
      (typeof window !== "undefined" ? window.location.href : undefined),
    custom_data: safeCustomData,
    user_data: safeUserData,
  });

  /* =======================================================
     3. CONVERSIONS API
  ======================================================= */

  try {
    const response = await fetch("/api/meta/capi", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
      keepalive: true,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn("Meta CAPI event failed:", {
        eventName,
        eventId: event_id,
        status: response.status,
        result,
      });
    } else if (process.env.NODE_ENV === "development") {
      console.log("✅ Meta CAPI event sent:", {
        eventName,
        eventId: event_id,
        fbc: Boolean(safeUserData.fbc),
        fbp: Boolean(safeUserData.fbp),
      });
    }
  } catch (error) {
    console.warn("Meta CAPI request failed:", {
      eventName,
      eventId: event_id,
      error,
    });
  }

  return event_id;
}
