"use client";

import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// session-based memory (not persisted)
const viewedInSession = new Set();

/* -----------------------------------------
   Supported analytics events
------------------------------------------ */
const EVENTS = {
  VIEW: "view",
  CART_ADD: "cart_add",
  WISHLIST_ADD: "wishlist_add",
  PURCHASE: "purchase",
  SEARCH: "search",
};

export const useAnalyticsStore = create(() => ({
  /**
   * 🔁 Generic product analytics tracker
   */
  trackProductEvent: async ({ productId, event }) => {
    try {
      if (!API_BASE) {
        console.warn("📊 [Analytics] API base missing");
        return;
      }

      if (!productId || !event) {
        console.warn("📊 [Analytics] productId or event missing");
        return;
      }

      const pid = String(productId);

      /* ---------------------------------
         Session dedupe ONLY for views
      ---------------------------------- */
      if (event === EVENTS.VIEW) {
        if (viewedInSession.has(pid)) {
          console.log(`📊 [Analytics] View skipped (session): ${pid}`);
          return;
        }
        viewedInSession.add(pid);
      }

      console.log(`📊 [Analytics] Tracking → ${event} | ${pid}`);

      // fire & forget
      fetch(`${API_BASE}/api/analytics/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pid,
          event,
        }),
        keepalive: true,
      }).catch((err) => {
        console.error("📊 [Analytics] API error", err);
      });
    } catch (err) {
      console.error("📊 [Analytics] Unexpected error", err);
    }
  },

  /* -----------------------------------------
     Convenience wrappers (DX friendly)
  ------------------------------------------ */

  trackProductView: (productId) =>
    useAnalyticsStore
      .getState()
      .trackProductEvent({ productId, event: EVENTS.VIEW }),

  trackAddToCart: (productId) =>
    useAnalyticsStore
      .getState()
      .trackProductEvent({ productId, event: EVENTS.CART_ADD }),

  trackWishlistAdd: (productId) =>
    useAnalyticsStore
      .getState()
      .trackProductEvent({ productId, event: EVENTS.WISHLIST_ADD }),

  trackPurchase: (productId) =>
    useAnalyticsStore
      .getState()
      .trackProductEvent({ productId, event: EVENTS.PURCHASE }),

  trackSearchAppearance: (productId) =>
    useAnalyticsStore
      .getState()
      .trackProductEvent({ productId, event: EVENTS.SEARCH }),

  /**
   * Optional: reset session views (rare)
   */
  resetSessionViews: () => {
    viewedInSession.clear();
    console.log("📊 [Analytics] Session views reset");
  },
}));

/* Export events enum (optional, for other stores) */
export { EVENTS };
