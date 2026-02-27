// src/store/marqueeStore.js
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

const safe = (v) => (v == null ? "" : String(v));
const pad6 = (x) => {
  const s = safe(x).trim();
  if (!s) return "";
  if (/^\d+$/.test(s)) return s.padStart(6, "0");
  return s;
};

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg = data?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Frontend Marquee Store
 * - Loads public marquee list
 * - Provides click helper to navigate to product page (by productCode)
 */
export const useMarqueeStore = create(
  persist(
    (set, get) => ({
      marquee: [],
      loading: false,
      error: "",

      clearError: () => set({ error: "" }),

      fetchMarquee: async () => {
        set({ loading: true, error: "" });
        try {
          // ✅ your backend public route
          const data = await apiGet(`/api/marquee/public`);
          const list = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];

          set({ marquee: list, loading: false });
          return list;
        } catch (e) {
          set({ loading: false, error: e?.message || "Failed to load marquee" });
          return [];
        }
      },

      /**
       * Convert a marquee item to product page href
       * /products/[code]
       */
      getItemHref: (item) => {
        const code = pad6(item?.productCode);
        if (!code) return "";
        return `/products/${code}`;
      },
    }),
    {
      name: "miray_marquee_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (st) => ({
        // keep only cached marquee
        marquee: st.marquee,
      }),
      version: 1,
    }
  )
);