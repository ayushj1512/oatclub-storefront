// src/store/searchStore.js
"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushToDataLayer, pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */
const stableStringify = (obj) => {
  try {
    return JSON.stringify(obj, Object.keys(obj).sort());
  } catch {
    return "";
  }
};

const ga4Item = (p) =>
  mapItem(
    {
      _id: p?._id || p?.id,
      id: p?._id || p?.id,
      name: p?.title || p?.name,
      title: p?.title || p?.name,
      price: Number(p?.price ?? 0) || 0,
      category:
        (Array.isArray(p?.categories) ? p.categories[0] : "") ||
        p?.category ||
        "",
      variant: p?.variant || "",
      sku: p?.sku || "",
    },
    1
  );

/* =========================================================
   STORE
========================================================= */
export const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 20,

  filters: {
    category: "",
    tags: [],
    color: "",
    sortBy: "relevance",
  },

  loading: false,
  error: null,
  lastSearchedAt: null,

  _lastMetaSearchKey: null,
  _lastMetaSearchAt: null,
  _lastGA4SearchKey: null,
  _lastGA4SearchAt: null,

  /* ---------------- setters ---------------- */
  setQuery: (query) => set({ query }),

  setFilters: (next) =>
    set((state) => ({
      filters: { ...state.filters, ...next },
    })),

  setLimit: (limit) => set({ limit }),

  /* ---------------- reset ---------------- */
  resetSearch: () =>
    set({
      query: "",
      results: [],
      total: 0,
      page: 1,
      pages: 1,
      error: null,
      loading: false,
      lastSearchedAt: null,
      filters: {
        category: "",
        tags: [],
        color: "",
        sortBy: "relevance",
      },
      _lastMetaSearchKey: null,
      _lastMetaSearchAt: null,
      _lastGA4SearchKey: null,
      _lastGA4SearchAt: null,
    }),

  /* ---------------- search ---------------- */
  searchProducts: async ({ page = 1 } = {}) => {
    const state = get();
    const { query, limit, filters } = state;
    const { category, tags, color, sortBy } = filters;

    if (!API_BASE) {
      return set({ error: "Search API not configured" });
    }

    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery && !category && !tags?.length && !color) {
      return set({
        results: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null,
      });
    }

    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("activeOnly", "true");
      params.set("excludeDrafts", "true");

      if (trimmedQuery) params.set("q", trimmedQuery);
      if (category) params.set("category", category);
      if (tags?.length) params.set("tags", tags.join(","));
      if (color) params.set("color", color);
      if (sortBy) params.set("sortBy", sortBy);

      const response = await fetch(
        `${API_BASE}/api/products/card-search?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Search failed");
      }

      const incoming = Array.isArray(data?.products) ? data.products : [];
      const pagination = data?.pagination || {};

      const finalResults =
        page === 1
          ? incoming
          : [...(get().results || []), ...incoming];

      set({
        results: finalResults,
        total: Number(pagination?.total || 0),
        page: Number(pagination?.page || page),
        pages: Number(pagination?.pages || 1),
        loading: false,
        error: null,
        lastSearchedAt: Date.now(),
      });

      /* ---------------- analytics ---------------- */
      try {
        const analytics = useAnalyticsStore.getState();
        incoming.forEach((p) =>
          analytics.trackSearchAppearance?.(p?._id || p?.id)
        );
      } catch (e) {
        console.warn("Search analytics failed", e);
      }

      /* ---------------- GA4 ---------------- */
      try {
        const ga4Key = stableStringify({
          query: trimmedQuery,
          category,
          tags,
          color,
          sortBy,
        });

        const now = Date.now();
        const { _lastGA4SearchKey, _lastGA4SearchAt } = get();

        const tooSoon = _lastGA4SearchAt && now - _lastGA4SearchAt < 2500;
        const sameKey = _lastGA4SearchKey === ga4Key;

        if (page === 1 && !(sameKey && tooSoon)) {
          pushToDataLayer({
            event: "search",
            search_term: trimmedQuery,
          });

          pushEcomEvent("view_search_results", {
            currency: "INR",
            items: finalResults.slice(0, 20).map(ga4Item),
          });

          set({
            _lastGA4SearchKey: ga4Key,
            _lastGA4SearchAt: now,
          });
        }
      } catch (e) {
        console.warn("GA4 search event failed", e);
      }

      /* ---------------- Meta ---------------- */
      try {
        const metaKey = stableStringify({
          query: trimmedQuery,
          category,
          tags,
          color,
          sortBy,
        });

        const now = Date.now();
        const { _lastMetaSearchKey, _lastMetaSearchAt } = get();

        const tooSoon = _lastMetaSearchAt && now - _lastMetaSearchAt < 2500;
        const sameKey = _lastMetaSearchKey === metaKey;

        if (page === 1 && !(sameKey && tooSoon)) {
          await trackMeta("Search", {
            search_string: trimmedQuery,
            content_category: category || undefined,
            content_ids: finalResults
              .slice(0, 20)
              .map((p) => String(p?._id || p?.id))
              .filter(Boolean),
          });

          set({
            _lastMetaSearchKey: metaKey,
            _lastMetaSearchAt: now,
          });
        }
      } catch (e) {
        console.warn("Meta search event failed", e);
      }
    } catch (e) {
      set({
        loading: false,
        error: e?.message || "Search failed",
      });
    }
  },

  /* ---------------- pagination ---------------- */
  loadMore: async () => {
    const { page, pages, loading } = get();
    if (loading || page >= pages) return;
    await get().searchProducts({ page: page + 1 });
  },
}));