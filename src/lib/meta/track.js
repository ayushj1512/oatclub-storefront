"use client";

let builderPromise = null;
let parameterCapturePromise = null;

const META_IDENTITY_KEY = "oatclub_meta_identity";

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
   GENERAL HELPERS
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

function compactObject(object = {}) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

function getCookie(name) {
  if (typeof document === "undefined") return undefined;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return undefined;

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function getStoredIdentity() {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem(META_IDENTITY_KEY);

    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveStoredIdentity(identity = {}) {
  if (typeof window === "undefined") return;

  try {
    const current = getStoredIdentity();

    sessionStorage.setItem(
      META_IDENTITY_KEY,
      JSON.stringify(
        compactObject({
          ...current,
          ...identity,
        }),
      ),
    );
  } catch {
    // Storage may be unavailable in privacy mode.
  }
}

/* =========================================================
   USER DATA NORMALIZATION
========================================================= */

export function normalizeMetaEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function normalizeMetaPhone(value) {
  let phone = String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");

  if (!phone) return "";

  if (phone.startsWith("+")) {
    return phone.slice(1);
  }

  if (phone.startsWith("00")) {
    return phone.slice(2);
  }

  if (phone.length === 10) {
    return `91${phone}`;
  }

  if (phone.length === 11 && phone.startsWith("0")) {
    return `91${phone.slice(1)}`;
  }

  return phone;
}

export function normalizeMetaExternalId(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function normalizeMetaUserData(userData = {}) {
  const email = userData.email || userData.em || userData.customerEmail;

  const phone =
    userData.phone ||
    userData.ph ||
    userData.phoneNumber ||
    userData.customerPhone;

  const externalId =
    userData.external_id ||
    userData.externalId ||
    userData.customerId ||
    userData.userId ||
    userData.uid ||
    userData._id ||
    userData.id;

  return compactObject({
    email: normalizeMetaEmail(email),
    phone: normalizeMetaPhone(phone),

    external_id: normalizeMetaExternalId(externalId),

    first_name: String(
      userData.first_name || userData.firstName || userData.fn || "",
    )
      .trim()
      .toLowerCase(),

    last_name: String(
      userData.last_name || userData.lastName || userData.ln || "",
    )
      .trim()
      .toLowerCase(),

    city: String(userData.city || userData.ct || "")
      .trim()
      .toLowerCase(),

    state: String(userData.state || userData.st || "")
      .trim()
      .toLowerCase(),

    zip_code: String(
      userData.zip_code ||
        userData.zipCode ||
        userData.postalCode ||
        userData.zp ||
        "",
    )
      .trim()
      .toLowerCase(),

    country: String(
      userData.country || userData.countryCode || userData.country_code || "in",
    )
      .trim()
      .toLowerCase(),

    fbc: userData.fbc,
    fbp: userData.fbp,
  });
}

/**
 * Call this after:
 * - login
 * - signup
 * - customer profile fetch
 * - checkout contact information entry
 */
export function setMetaUserData(userData = {}) {
  const normalized = normalizeMetaUserData(userData);

  saveStoredIdentity(normalized);

  return normalized;
}

export function getMetaUserData(userData = {}) {
  return normalizeMetaUserData({
    ...getStoredIdentity(),
    ...userData,
  });
}

export function clearMetaUserData() {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(META_IDENTITY_KEY);
  } catch {
    // Ignore storage failure.
  }
}

/* =========================================================
   CATALOG HELPERS
========================================================= */

export function normalizeMetaValue(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export function getMetaProductGroupId(product = {}) {
  return String(
    product?.productGroupId ||
      product?.groupId ||
      product?.productId ||
      product?._id ||
      product?.id ||
      "",
  ).trim();
}

export function getMetaCatalogId({
  catalogId,
  metaCatalogId,
  sku,
  variantSku,
  productCode,
  code,
  size,
  selectedSize,
  productId,
  id,
} = {}) {
  const directId = normalizeMetaValue(
    catalogId || metaCatalogId || variantSku || sku,
  );

  if (directId) return directId;

  const normalizedCode = normalizeMetaValue(productCode || code);

  const normalizedSize = normalizeMetaValue(selectedSize || size);

  if (normalizedCode && normalizedSize) {
    return `${normalizedCode}-${normalizedSize}`;
  }

  return String(productId || id || "").trim();
}

/* =========================================================
   META PARAMETER BUILDER
========================================================= */

async function getParameterBuilder() {
  if (typeof window === "undefined") return null;

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

      const browserData = compactObject({
        fbc: fbc || getCookie("_fbc"),
        fbp: fbp || getCookie("_fbp"),
      });

      saveStoredIdentity(browserData);

      return browserData;
    })().catch((error) => {
      parameterCapturePromise = null;

      console.warn("Meta parameter initialization failed:", error);

      const browserData = compactObject({
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
      });

      saveStoredIdentity(browserData);

      return browserData;
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
  if (!eventName) {
    return {
      success: false,
      pixelSent: false,
      capiSent: false,
      eventId: null,
      error: "event_name is required",
    };
  }

  const eventId = options.event_id || options.eventId || generateEventId();

  const safeCustomData = compactObject(customData);

  let pixelSent = false;
  let capiSent = false;
  let capiError = null;

  /* =======================================================
     1. PIXEL — FIRE IMMEDIATELY WHEN AVAILABLE
  ======================================================= */

  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      const method = META_STANDARD_EVENTS.has(eventName)
        ? "track"
        : "trackCustom";

      window.fbq(method, eventName, safeCustomData, {
        eventID: eventId,
      });

      pixelSent = true;
    }
  } catch (error) {
    console.warn("Meta Pixel event failed:", {
      eventName,
      eventId,
      error,
    });
  }

  /* =======================================================
     2. CAPI PAYLOAD
  ======================================================= */

  try {
    const storedUserData = getMetaUserData(userData);

    /*
     * Do not block CAPI while Parameter Builder loads.
     * Cookies are collected immediately, while the builder
     * can enrich future events in the background.
     */
    const immediateBrowserData = compactObject({
      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
    });

    const safeUserData = compactObject({
      ...storedUserData,

      fbc: userData?.fbc || storedUserData?.fbc || immediateBrowserData?.fbc,

      fbp: userData?.fbp || storedUserData?.fbp || immediateBrowserData?.fbp,
    });

    saveStoredIdentity(safeUserData);

    const payload = compactObject({
      event_name: eventName,
      event_id: eventId,

      event_source_url:
        options.event_source_url ||
        options.eventSourceUrl ||
        (typeof window !== "undefined" ? window.location.href : undefined),

      custom_data: safeCustomData,
      user_data: safeUserData,
    });

    const response = await fetch("/api/meta/capi", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),

      keepalive: true,
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.message ||
          result?.error?.message ||
          `Meta CAPI failed with status ${response.status}`,
      );

      error.status = response.status;
      error.result = result;

      throw error;
    }

    capiSent = true;

    /*
     * Enrich stored fbc/fbp asynchronously without delaying
     * the current server event.
     */
    initializeMetaParameters().catch(() => null);

    if (process.env.NODE_ENV === "development" || options.debug) {
      console.log("✅ Meta event sent:", {
        eventName,
        eventId,
        pixelSent,
        capiSent,
        email: Boolean(safeUserData.email),
        phone: Boolean(safeUserData.phone),
        externalId: Boolean(safeUserData.external_id),
        fbc: Boolean(safeUserData.fbc),
        fbp: Boolean(safeUserData.fbp),
      });
    }
  } catch (error) {
    capiError = error;

    console.warn("Meta CAPI request failed:", {
      eventName,
      eventId,
      status: error?.status,
      result: error?.result,
      error,
    });
  }

  const response = {
    success: capiSent,
    eventId,
    pixelSent,
    capiSent,
    error: capiError,
  };

  if (!capiSent && options.throwOnCapiFailure) {
    const error = capiError || new Error("Meta Conversions API event failed.");

    error.metaResult = response;

    throw error;
  }

  return response;
}
