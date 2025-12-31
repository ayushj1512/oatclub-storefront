"use client";

/** Generate event_id for dedup */
function eventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Cookie reader for _fbp/_fbc */
function getCookie(name) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * ✅ trackMeta: Meta Pixel + CAPI (dedup)
 * Usage:
 * await trackMeta("AddToCart", {...customData}, {...userData})
 */
export async function trackMeta(eventName, customData = {}, userData = {}, opts = {}) {
  const event_id = opts.event_id || eventId();

  // 1) Pixel
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, customData, { eventID: event_id });
  }

  // 2) CAPI (server)
  const payload = {
    event_name: eventName,
    event_id,
    custom_data: customData,
    user_data: {
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      ...userData,
    },
  };

  try {
    await fetch("/api/meta/capi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (e) {
    console.warn("Meta CAPI call failed", e);
  }

  return event_id;
}
