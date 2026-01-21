// store/bestsellerFrontendStore.js
// ✅ Ecommerce Frontend Bestseller Store (Zustand) - READ ONLY
// Reads bestseller productIds + (optional) bestseller products list
// Uses: NEXT_PUBLIC_BACKEND_URL from .env

import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BESTSELLER_API = `${BASE_URL}/api/bestseller`;
const PRODUCT_API = `${BASE_URL}/api/products`;

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
};

export const useBestsellerFrontendStore = create((set, get) => ({
  // ---------- STATE ----------
  ids: [], // bestseller productIds
  products: [], // bestseller products (optional)
  loadingIds: false,
  loadingProducts: false,
  error: null,

  // ---------- READ: productIds ----------
  fetchBestsellerIds: async () => {
    try {
      set({ loadingIds: true, error: null });
      const ids = await request(`${BESTSELLER_API}/ids`, { cache: "no-store" });
      set({ ids: Array.isArray(ids) ? ids.map(String) : [] });
      return get().ids;
    } catch (e) {
      set({ error: e.message });
      return [];
    } finally {
      set({ loadingIds: false });
    }
  },

  // ---------- READ: products by ids ----------
  // ✅ Preferred endpoint (if you have it): POST /api/products/by-ids { ids: [] }
  // If not available, tell me your products endpoint and I’ll tweak this.
  fetchBestsellerProducts: async () => {
    try {
      set({ loadingProducts: true, error: null });

      // ensure ids are loaded
      let ids = get().ids;
      if (!ids?.length) ids = await get().fetchBestsellerIds();

      if (!ids?.length) {
        set({ products: [] });
        return [];
      }

      const data = await request(`${PRODUCT_API}/by-ids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ ids }),
      });

      const list = data?.products || [];
      set({ products: Array.isArray(list) ? list : [] });
      return get().products;
    } catch (e) {
      set({ error: e.message, products: [] });
      return [];
    } finally {
      set({ loadingProducts: false });
    }
  },

  // ---------- Convenience ----------
  refresh: async () => {
    await get().fetchBestsellerIds();
    await get().fetchBestsellerProducts();
  },

  clearError: () => set({ error: null }),
}));
