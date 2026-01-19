"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushToDataLayer, pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

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
      name: p?.name || p?.title,
      title: p?.name || p?.title,
      price: Number(p?.price ?? 0) || 0,
      category:
        p?.category?.name ||
        p?.category ||
        (Array.isArray(p?.categories) ? p.categories[0] : "") ||
        "",
      variant: p?.variant || "",
      sku: p?.sku || "",
    },
    1
  );

const uniqById = (arr = []) => {
  const map = new Map();
  for (const p of arr) {
    const id = p?._id || p?.id;
    if (!id) continue;
    if (!map.has(id)) map.set(id, p);
  }
  return Array.from(map.values());
};

const norm = (v) => String(v ?? "").trim().toLowerCase();
const safeArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const normalizeDigits = (s) => String(s || "").replace(/\D/g, "");
const stripLeadingZeros = (s) => String(s || "").replace(/^0+/, "") || "0";

const matchesProductCode = (productCode, q) => {
  const pc = norm(productCode);
  const qq = norm(q);
  if (!pc || !qq) return false;

  // exact (case-insensitive)
  if (pc === qq) return true;

  // numeric normalization: "000260" == "260"
  const pcNum = stripLeadingZeros(normalizeDigits(pc));
  const qNum = stripLeadingZeros(normalizeDigits(qq));
  if (pcNum && qNum && pcNum === qNum) return true;

  return false;
};

const matchesText = (text, q) => {
  const t = norm(text);
  const qq = norm(q);
  if (!t || !qq) return false;
  return t.includes(qq);
};

const productMatchesQuery = (p, q) => {
  if (!p) return false;

  // productCode match
  if (matchesProductCode(p.productCode, q)) return true;

  // title/name match
  if (matchesText(p.title || p.name, q)) return true;

  // tags match
  const tags = safeArr(p.tags).map(norm);
  if (tags.some((t) => t.includes(norm(q)))) return true;

  // category / categories match
  // your sample response has: categories: ["all-clothing", ...]
  const categories = safeArr(p.categories).map(norm);

  // sometimes category could be object or string
  const catField = p.category;
  const catCandidates = [
    ...(typeof catField === "string" ? [catField] : []),
    ...(catField?.name ? [catField.name] : []),
    ...(catField?.slug ? [catField.slug] : []),
  ].map(norm);

  if (
    categories.some((c) => c.includes(norm(q))) ||
    catCandidates.some((c) => c.includes(norm(q)))
  ) {
    return true;
  }

  return false;
};

const looksLikeCodeQuery = (q = "") => {
  const s = String(q).trim();
  // numbers or alpha-num with hyphen/underscore
  if (!s) return false;
  const isSimple = /^[a-z0-9-_]+$/i.test(s);
  const hasDigit = /\d/.test(s);
  return isSimple && hasDigit && s.length >= 3;
};

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

    const buildParams = (extra = {}) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (category) params.set("category", String(category));
      if (tags?.length) params.set("tags", tags.join(","));
      if (minPrice != null) params.set("minPrice", String(minPrice));
      if (maxPrice != null) params.set("maxPrice", String(maxPrice));
      if (sort) params.set("sort", String(sort));

      // ✅ ALWAYS published only
      params.set("isActive", "true");

      Object.entries(extra).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        params.set(k, String(v));
      });

      return params;
    };

    const fetchProducts = async (extraParams = {}) => {
      const params = buildParams(extraParams);

      const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Search request failed");

      const incoming = Array.isArray(data?.products) ? data.products : [];

      // ✅ drop inactive (extra safety)
      const publishedOnly = incoming.filter((p) => p?.isActive !== false);

      return {
        products: publishedOnly,
        total: data?.total || 0,
        page: data?.page || page,
        pages: data?.pages || 1,
      };
    };

    try {
      // ✅ Pass 1: backend "search"
      const primary = await fetchProducts({
        search: q,
        // backend can ignore this safely
        searchIn: "title,name,productCode,tags,categories,category,slug",
      });

      // ✅ Client-side validate primary results too (prevents "latest 20" bug)
      const primaryMatched = primary.products.filter((p) => productMatchesQuery(p, q));

      let merged = primaryMatched;

      // ✅ Only run multi-pass on first page (pagination stays sane)
      if (page === 1) {
        const codeLike = looksLikeCodeQuery(q);

        // We try multiple strategies, but ALWAYS validate response before merging
        const calls = [];

        // productCode/sku are useful for code-like queries
        calls.push(fetchProducts({ productCode: q }));
        calls.push(fetchProducts({ sku: q }));

        // tags/category/name based fallbacks help normal words too
        // (if backend supports these params)
        if (!codeLike) {
          calls.push(fetchProducts({ tags: q }));
          calls.push(fetchProducts({ category: q }));
          calls.push(fetchProducts({ name: q }));
          calls.push(fetchProducts({ title: q }));
          calls.push(fetchProducts({ slug: q }));
        }

        const settled = await Promise.allSettled(calls);

        const extras = settled
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value.products)
          // ✅ CRITICAL: only merge those which actually match query
          .filter((p) => productMatchesQuery(p, q));

        merged = uniqById([...merged, ...extras]);
      }

      const finalResults =
        page === 1 ? merged : uniqById([...(get().results || []), ...merged]);

      set({
        results: finalResults,
        total: page === 1 ? finalResults.length : Math.max(get().total || 0, finalResults.length),
        page: primary.page || page,
        pages: primary.pages || 1,
        loading: false,
        lastSearchedAt: Date.now(),
      });

      /* ✅ Analytics appearance */
      try {
        const analytics = useAnalyticsStore.getState();
        merged.forEach((p) => analytics.trackSearchAppearance(p._id || p.id));
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
            items: merged.slice(0, 20).map(ga4Item),
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
            content_ids: merged
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
