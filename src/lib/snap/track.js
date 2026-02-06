"use client";

/** Generate event_id for dedup */
function eventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * ✅ trackSnap: Snapchat Pixel + CAPI (dedupe)
 * IMPORTANT: this is a CLIENT file, so no "crypto" import from node.
 */
export async function trackSnap(eventName, properties = {}, user = {}, opts = {}) {
  const event_id = opts?.event_id || eventId();

  // 1) Pixel (browser)
  try {
    if (typeof window !== "undefined" && typeof window.snaptr === "function") {
      window.snaptr("track", eventName, { ...properties, event_id });
      console.log("👻 Snap Pixel tracked:", eventName, { event_id, properties });
    } else {
      console.log("👻 Snap Pixel not ready:", eventName);
    }
  } catch (e) {
    console.warn("👻 Snap Pixel track failed:", e);
  }

  // 2) CAPI (server via Next API route)
  try {
    const payload = {
      event_name: eventName,
      event_id,
      properties,
      event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
      user: { ...user },
    };

    await fetch("/api/snap/capi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    console.log("👻 Snap CAPI sent:", eventName, { event_id, properties });
  } catch (e) {
    console.warn("👻 Snap CAPI call failed:", e);
  }

  return event_id;
}
