"use client";

/** Generate event_id for dedup */
function eventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Cookie reader for _fbp/_fbc */
function getCookie(name) {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );

  return match ? decodeURIComponent(match[2]) : undefined;
}

/** Remove undefined/null/empty values */
function compactObject(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}

/**
 * ✅ trackMeta: Meta Pixel + CAPI dedup
 *
 * Usage:
 * await trackMeta("ViewContent", customData);
 * await trackMeta("Purchase", customData, userData);
 */
export async function trackMeta(
  eventName,
  customData = {},
  userData = {},
  opts = {}
) {
  const event_id = opts.event_id || eventId();

  const safeCustomData = compactObject(customData);

  // ✅ 1) Meta Pixel browser event
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, safeCustomData, {
      eventID: event_id,
    });
  }

  // ✅ 2) CAPI server event via Next API route
  const payload = {
    event_name: eventName,
    event_id,
    custom_data: safeCustomData,
    event_source_url:
      typeof window !== "undefined" ? window.location.href : undefined,

    /**
     * ✅ Do NOT hash here.
     * Keep frontend simple.
     * Hash/normalize user_data inside /api/meta/capi server route.
     */
    user_data: compactObject({
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      ...userData,
    }),
  };

  try {
    await fetch("/api/meta/capi", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(compactObject(payload)),
      keepalive: true,
    });
  } catch (e) {
    console.warn("Meta CAPI call failed", e);
  }

  return event_id;
}