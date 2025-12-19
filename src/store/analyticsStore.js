"use client";

import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// session-based memory (not persisted)
const viewedInSession = new Set();

export const useAnalyticsStore = create(() => ({
  /**
   * Track product view (once per session per product)
   */
  trackProductView: async (productId) => {
    try {
      if (!API_BASE) {
        console.warn("📊 [Analytics] API base missing");
        return;
      }

      if (!productId) {
        console.warn("📊 [Analytics] productId missing");
        return;
      }

      const pid = String(productId);

      // ✅ prevent multiple hits in same session
      if (viewedInSession.has(pid)) {
        console.log(`📊 [Analytics] Skipped (already tracked): ${pid}`);
        return;
      }

      viewedInSession.add(pid);

      console.log(`📊 [Analytics] Tracking product view → ${pid}`);

      // fire & forget
      fetch(`${API_BASE}/api/analytics/product-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
        keepalive: true, // survives route change
      })
        .then(() => {
          console.log(`📊 [Analytics] API hit success → ${pid}`);
        })
        .catch((err) => {
          console.error(`📊 [Analytics] API hit failed → ${pid}`, err);
        });
    } catch (err) {
      console.error("📊 [Analytics] Unexpected error", err);
    }
  },

  /**
   * Optional: reset session views (rarely needed)
   */
  resetSessionViews: () => {
    viewedInSession.clear();
    console.log("📊 [Analytics] Session views reset");
  },
}));
