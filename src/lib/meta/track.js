"use client";

let builderPromise = null;
let parameterCapturePromise = null;

/* =========================================================
   HELPERS
========================================================= */

/** Generate event_id for Pixel + CAPI deduplication */
function generateEventId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

/** Read a browser cookie safely */
function getCookie(name) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(
    cookie.split("=").slice(1).join("=")
  );
}

/** Remove undefined, null and empty-string values */
function compactObject(object = {}) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
}

/**
 * Load Meta Parameter Builder only inside the browser.
 *
 * Dynamic import prevents the browser-only SDK from being
 * evaluated during Next.js server rendering.
 */
async function getParameterBuilder() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!builderPromise) {
    builderPromise = import(
      "meta-capi-param-builder-clientjs"
    )
      .then((module) => {
        /*
         * Supports the common package export shapes:
         * - default export
         * - clientParamBuilder named export
         * - module namespace export
         */
        return (
          module?.default ||
          module?.clientParamBuilder ||
          module
        );
      })
      .catch((error) => {
        builderPromise = null;

        console.warn(
          "Meta Parameter Builder failed to load:",
          error
        );

        return null;
      });
  }

  return builderPromise;
}

/**
 * Capture Meta parameters as early as possible.
 *
 * This:
 * - reads fbclid from the current landing-page URL
 * - creates/preserves _fbc
 * - creates/preserves _fbp
 * - stores the values in first-party cookies
 */
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

      if (
        builder &&
        typeof builder.processAndCollectAllParams ===
          "function"
      ) {
        try {
          await builder.processAndCollectAllParams(
            window.location.href
          );
        } catch (error) {
          console.warn(
            "Meta parameter capture failed:",
            error
          );
        }
      }

      const fbc =
        typeof builder?.getFbc === "function"
          ? builder.getFbc()
          : getCookie("_fbc");

      const fbp =
        typeof builder?.getFbp === "function"
          ? builder.getFbp()
          : getCookie("_fbp");

      return compactObject({
        fbc: fbc || getCookie("_fbc"),
        fbp: fbp || getCookie("_fbp"),
      });
    })().catch((error) => {
      parameterCapturePromise = null;

      console.warn(
        "Meta parameter initialization failed:",
        error
      );

      return compactObject({
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
      });
    });
  }

  return parameterCapturePromise;
}

/**
 * Read the latest Meta browser identifiers.
 *
 * Parameter Builder is initialized first so an incoming
 * fbclid can be converted into a valid _fbc cookie.
 */
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

/**
 * Track an event through:
 * 1. Meta Pixel in the browser
 * 2. Meta Conversions API through the Next.js API route
 *
 * The same event_id is used for both channels so Meta can
 * deduplicate the browser and server events.
 *
 * Usage:
 *
 * await trackMeta("ViewContent", customData);
 *
 * await trackMeta(
 *   "Purchase",
 *   customData,
 *   userData,
 *   { event_id: `purchase_${orderId}` }
 * );
 */
export async function trackMeta(
  eventName,
  customData = {},
  userData = {},
  options = {}
) {
  if (!eventName) {
    return null;
  }

  const event_id =
    options.event_id ||
    options.eventId ||
    generateEventId();

  const safeCustomData = compactObject(customData);

  /* =======================================================
     1. META PIXEL
  ======================================================= */

  if (
    typeof window !== "undefined" &&
    typeof window.fbq === "function"
  ) {
    window.fbq(
      "track",
      eventName,
      safeCustomData,
      {
        eventID: event_id,
      }
    );
  }

  /* =======================================================
     2. PARAMETER BUILDER
  ======================================================= */

  const browserData = await getMetaBrowserData();

  /*
   * Do not normalize, lowercase or hash fbc/fbp.
   * Preserve the exact values returned by Meta's SDK.
   *
   * Personal information remains raw here and will be
   * normalized and hashed once inside /api/meta/capi.
   */
  const safeUserData = compactObject({
    ...userData,

    /*
     * Explicit values can be passed when available,
     * otherwise use Parameter Builder values.
     */
    fbc: userData?.fbc || browserData?.fbc,
    fbp: userData?.fbp || browserData?.fbp,
  });

  const payload = compactObject({
    event_name: eventName,
    event_id,

    event_source_url:
      typeof window !== "undefined"
        ? window.location.href
        : undefined,

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

      /*
       * Allows tracking requests to continue while the user
       * navigates away or closes the page.
       */
      keepalive: true,
    });

    const result = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      console.warn("Meta CAPI event failed:", {
        eventName,
        eventId: event_id,
        status: response.status,
        result,
      });
    } else if (
      process.env.NODE_ENV === "development"
    ) {
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

