"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useSearchStore = create((set, get) => ({
  /* -----------------------------
     State
  ------------------------------ */
  query: "",
  results: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 20,

  filters: {
    category: null,
    tags: [],
    minPrice: null,
    maxPrice: null,
    sort: "newest",
  },

  loading: false,
  error: null,
  lastSearchedAt: null,

  /* -----------------------------
     Actions
  ------------------------------ */

  /**
   * Update search query
   */
  setQuery: (query) => set({ query }),

  /**
   * Update filters
   */
  setFilters: (next) =>
    set((state) => ({
      filters: { ...state.filters, ...next },
    })),

  /**
   * Reset everything
   */
  resetSearch: () =>
    set({
      query: "",
      results: [],
      total: 0,
      page: 1,
      pages: 1,
      error: null,
    }),

  /**
   * Perform search
   */
  searchProducts: async ({ page = 1 } = {}) => {
    const {
      query,
      limit,
      filters: { category, tags, minPrice, maxPrice, sort },
    } = get();

    if (!API_BASE) {
      return set({ error: "Search API not configured" });
    }

    if (!query || query.trim().length < 2) {
      return set({ results: [], total: 0, pages: 1 });
    }

    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      params.set("search", query);
      params.set("page", page);
      params.set("limit", limit);

      if (category) params.set("category", category);
      if (tags?.length) params.set("tags", tags.join(","));
      if (minPrice != null) params.set("minPrice", minPrice);
      if (maxPrice != null) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);

      const res = await fetch(
        `${API_BASE}/api/products?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Search request failed");
      }

      const data = await res.json();

      set({
        results: data.products || [],
        total: data.total || 0,
        page: data.page || page,
        pages: data.pages || 1,
        loading: false,
        lastSearchedAt: Date.now(),
      });

      /* --------------------------------
         📊 ANALYTICS: SEARCH APPEARANCE
      --------------------------------- */
      try {
        const analytics = useAnalyticsStore.getState();
        (data.products || []).forEach((p) => {
          analytics.trackSearchAppearance(p._id || p.id);
        });
      } catch (e) {
        console.warn("📊 Search analytics failed", e);
      }
    } catch (e) {
      set({
        loading: false,
        error: e.message || "Search failed",
      });
    }
  },

  /**
   * Load next page (pagination / infinite scroll)
   */
  loadMore: async () => {
    const { page, pages, loading } = get();
    if (loading || page >= pages) return;

    await get().searchProducts({ page: page + 1 });
  },
}));
