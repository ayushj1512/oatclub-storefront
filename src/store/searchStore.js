"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushToDataLayer, pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

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

  searched: false,
  loading: false,
  error: null,
  lastSearchedAt: null,

  _lastMetaSearchKey: null,
  _lastMetaSearchAt: null,
  _lastGA4SearchKey: null,
  _lastGA4SearchAt: null,

  setQuery: (query) => set({ query }),
  setLimit: (limit) => set({ limit }),

  setFilters: (next) =>
    set((state) => ({
      filters: { ...state.filters, ...next },
    })),

  resetSearch: () =>
    set({
      query: "",
      results: [],
      total: 0,
      page: 1,
      pages: 1,
      searched: false,
      loading: false,
      error: null,
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

  searchProducts: async ({ page = 1, query: forcedQuery } = {}) => {
    const state = get();
    const filters = state.filters || {};
    const limit = state.limit;

    const trimmedQuery = String(forcedQuery ?? state.query ?? "").trim();
    const { category, tags = [], color, sortBy } = filters;

    if (!API_BASE) {
      return set({ error: "Search API not configured", loading: false });
    }

    if (!trimmedQuery && !category && !tags.length && !color) {
      return set({
        results: [],
        total: 0,
        page: 1,
        pages: 1,
        searched: false,
        loading: false,
        error: null,
      });
    }

    set({ loading: true, error: null, searched: true });

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("activeOnly", "true");
      params.set("excludeDrafts", "true");

      if (trimmedQuery) params.set("q", trimmedQuery);
      if (category) params.set("category", category);
      if (tags.length) params.set("tags", tags.join(","));
      if (color) params.set("color", color);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(
        `${API_BASE}/api/products/card-search?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Search failed");

      const incoming = Array.isArray(data?.products) ? data.products : [];
      const pagination = data?.pagination || {};

      const finalResults =
        page === 1 ? incoming : [...(get().results || []), ...incoming];

      set({
        query: trimmedQuery,
        results: finalResults,
        total: Number(pagination?.total || incoming.length || 0),
        page: Number(pagination?.page || page),
        pages: Number(pagination?.pages || 1),
        loading: false,
        error: null,
        searched: true,
        lastSearchedAt: Date.now(),
      });

      try {
        const analytics = useAnalyticsStore.getState();
        incoming.forEach((p) =>
          analytics.trackSearchAppearance?.(p?._id || p?.id)
        );
      } catch (e) {
        console.warn("Search analytics failed", e);
      }

      try {
        const key = stableStringify({
          query: trimmedQuery,
          category,
          tags,
          color,
          sortBy,
        });

        const now = Date.now();
        const { _lastGA4SearchKey, _lastGA4SearchAt } = get();

        if (
          page === 1 &&
          !(_lastGA4SearchKey === key && _lastGA4SearchAt && now - _lastGA4SearchAt < 2500)
        ) {
          pushToDataLayer({
            event: "search",
            search_term: trimmedQuery,
          });

          pushEcomEvent("view_search_results", {
            currency: "INR",
            items: finalResults.slice(0, 20).map(ga4Item),
          });

          set({
            _lastGA4SearchKey: key,
            _lastGA4SearchAt: now,
          });
        }
      } catch (e) {
        console.warn("GA4 search event failed", e);
      }

      try {
        const key = stableStringify({
          query: trimmedQuery,
          category,
          tags,
          color,
          sortBy,
        });

        const now = Date.now();
        const { _lastMetaSearchKey, _lastMetaSearchAt } = get();

        if (
          page === 1 &&
          !(_lastMetaSearchKey === key && _lastMetaSearchAt && now - _lastMetaSearchAt < 2500)
        ) {
          await trackMeta("Search", {
            search_string: trimmedQuery,
            content_category: category || undefined,
            content_ids: finalResults
              .slice(0, 20)
              .map((p) => String(p?._id || p?.id))
              .filter(Boolean),
          });

          set({
            _lastMetaSearchKey: key,
            _lastMetaSearchAt: now,
          });
        }
      } catch (e) {
        console.warn("Meta search event failed", e);
      }
    } catch (e) {
      set({
        loading: false,
        searched: true,
        error: e?.message || "Search failed",
      });
    }
  },

  loadMore: async () => {
    const { page, pages, loading } = get();
    if (loading || page >= pages) return;
    await get().searchProducts({ page: page + 1 });
  },
}));