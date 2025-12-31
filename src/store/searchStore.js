"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track"; // ✅ Meta Pixel + CAPI unified tracker

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

function stableStringify(obj) {
  try {
    return JSON.stringify(obj, Object.keys(obj).sort());
  } catch {
    return "";
  }
}

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

  // ✅ guards to prevent repeated firing for same query
  _lastMetaSearchKey: null,
  _lastMetaSearchAt: null,

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
      _lastMetaSearchKey: null,
      _lastMetaSearchAt: null,
    }),

  /**
   * Perform search
   */
  searchProducts: async ({ page = 1 } = {}) => {
    const state = get();
    const {
      query,
      limit,
      filters: { category, tags, minPrice, maxPrice, sort },
    } = state;

    if (!API_BASE) {
      return set({ error: "Search API not configured" });
    }

    const q = (query || "").trim();

    // ✅ basic guard
    if (!q || q.length < 2) {
      return set({
        results: [],
        total: 0,
        pages: 1,
        page: 1,
        error: null,
        loading: false,
      });
    }

    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      params.set("search", q);
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (category) params.set("category", String(category));
      if (tags?.length) params.set("tags", tags.join(","));
      if (minPrice != null) params.set("minPrice", String(minPrice));
      if (maxPrice != null) params.set("maxPrice", String(maxPrice));
      if (sort) params.set("sort", String(sort));

      const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Search request failed");
      }

      const data = await res.json();

      // ✅ if page=1 replace results, else append (supports infinite scroll)
      const incoming = data.products || [];
      const finalResults =
        page === 1 ? incoming : [...(get().results || []), ...incoming];

      set({
        results: finalResults,
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
        incoming.forEach((p) => {
          analytics.trackSearchAppearance(p._id || p.id);
        });
      } catch (e) {
        console.warn("📊 Search analytics failed", e);
      }

      /* --------------------------------
         🧾 META (PIXEL + CAPI): SEARCH EVENT (ONCE)
      --------------------------------- */
      try {
        // Build a stable key so same search doesn't fire repeatedly
        const metaKey = stableStringify({
          q,
          category,
          tags,
          minPrice,
          maxPrice,
          sort,
        });

        const now = Date.now();
        const { _lastMetaSearchKey, _lastMetaSearchAt } = get();

        const tooSoon = _lastMetaSearchAt && now - _lastMetaSearchAt < 2500;
        const sameKey = _lastMetaSearchKey && _lastMetaSearchKey === metaKey;

        // ✅ fire only if:
        // - this is first page (main search action), AND
        // - not duplicate within small window
        if (page === 1 && !(sameKey && tooSoon)) {
          await trackMeta("Search", {
            search_string: q,
            content_category: category ? String(category) : undefined,
            // result count helps optimization
            content_ids: incoming
              .slice(0, 20)
              .map((p) => String(p._id || p.id))
              .filter(Boolean),
          });

          set({
            _lastMetaSearchKey: metaKey,
            _lastMetaSearchAt: now,
          });
        }
      } catch (e) {
        console.warn("🧾 Meta Search event failed", e);
      }
    } catch (e) {
      set({
        loading: false,
        error: e?.message || "Search failed",
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
