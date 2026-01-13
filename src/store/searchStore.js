"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushToDataLayer, pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const stableStringify = (obj) => {
  try { return JSON.stringify(obj, Object.keys(obj).sort()); }
  catch { return ""; }
};

const ga4Item = (p) =>
  mapItem(
    {
      _id: p?._id || p?.id,
      id: p?._id || p?.id,
      name: p?.name || p?.title,
      title: p?.name || p?.title,
      price: Number(p?.price ?? 0) || 0,
      category: p?.category?.name || p?.category || "",
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
  filters: { category: null, tags: [], minPrice: null, maxPrice: null, sort: "newest" },
  loading: false,
  error: null,
  lastSearchedAt: null,

  _lastMetaSearchKey: null,
  _lastMetaSearchAt: null,
  _lastGA4SearchKey: null,
  _lastGA4SearchAt: null,

  setQuery: (query) => set({ query }),
  setFilters: (next) => set((s) => ({ filters: { ...s.filters, ...next } })),

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
      _lastGA4SearchKey: null,
      _lastGA4SearchAt: null,
    }),

  searchProducts: async ({ page = 1 } = {}) => {
  const state = get();
  const {
    query,
    limit,
    filters: { category, tags, minPrice, maxPrice, sort },
  } = state;

  if (!API_BASE) return set({ error: "Search API not configured" });

  const q = (query || "").trim();
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

    // ✅ ALWAYS: only published products
    params.set("isActive", "true");

    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Search request failed");

    const incoming = Array.isArray(data?.products) ? data.products : [];

    // ✅ Extra safety: if backend ever returns inactive, drop them
    const publishedOnly = incoming.filter((p) => p?.isActive !== false);

    const finalResults =
      page === 1
        ? publishedOnly
        : [...(get().results || []), ...publishedOnly];

    set({
      results: finalResults,
      total: data?.total || 0,
      page: data?.page || page,
      pages: data?.pages || 1,
      loading: false,
      lastSearchedAt: Date.now(),
    });

    /* ✅ Analytics appearance */
    try {
      const analytics = useAnalyticsStore.getState();
      publishedOnly.forEach((p) =>
        analytics.trackSearchAppearance(p._id || p.id)
      );
    } catch (e) {
      console.warn("📊 Search analytics failed", e);
    }

    /* ✅ GA4: search + view_search_results (ONLY for page=1 + deduped) */
    try {
      const ga4Key = stableStringify({ q, category, tags, minPrice, maxPrice, sort, isActive: true });
      const now = Date.now();
      const { _lastGA4SearchKey, _lastGA4SearchAt } = get();

      const tooSoon = _lastGA4SearchAt && now - _lastGA4SearchAt < 2500;
      const sameKey = _lastGA4SearchKey && _lastGA4SearchKey === ga4Key;

      if (page === 1 && !(sameKey && tooSoon)) {
        pushToDataLayer({ event: "search", search_term: q });

        pushEcomEvent("view_search_results", {
          currency: "INR",
          items: publishedOnly.slice(0, 20).map(ga4Item),
        });

        set({ _lastGA4SearchKey: ga4Key, _lastGA4SearchAt: now });
      }
    } catch (e) {
      console.warn("📈 GA4 search events failed", e);
    }

    /* ✅ Meta Search */
    try {
      const metaKey = stableStringify({ q, category, tags, minPrice, maxPrice, sort, isActive: true });
      const now = Date.now();
      const { _lastMetaSearchKey, _lastMetaSearchAt } = get();

      const tooSoon = _lastMetaSearchAt && now - _lastMetaSearchAt < 2500;
      const sameKey = _lastMetaSearchKey && _lastMetaSearchKey === metaKey;

      if (page === 1 && !(sameKey && tooSoon)) {
        await trackMeta("Search", {
          search_string: q,
          content_category: category ? String(category) : undefined,
          content_ids: publishedOnly
            .slice(0, 20)
            .map((p) => String(p._id || p.id))
            .filter(Boolean),
        });

        set({ _lastMetaSearchKey: metaKey, _lastMetaSearchAt: now });
      }
    } catch (e) {
      console.warn("🧾 Meta Search event failed", e);
    }
  } catch (e) {
    set({ loading: false, error: e?.message || "Search failed" });
  }
},


  loadMore: async () => {
    const { page, pages, loading } = get();
    if (loading || page >= pages) return;
    await get().searchProducts({ page: page + 1 });
  },
}));
