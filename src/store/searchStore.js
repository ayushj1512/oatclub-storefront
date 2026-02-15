// src/store/searchStore.js
"use client";

import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushToDataLayer, pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

/* ---------------- analytics helpers ---------------- */
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

/* ---------------- helpers ---------------- */
const norm = (v) => String(v ?? "").trim().toLowerCase();
const safeArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const uniqById = (arr = []) => {
  const map = new Map();
  for (const p of arr) {
    const id = p?._id || p?.id;
    if (!id) continue;
    if (!map.has(id)) map.set(id, p);
  }
  return Array.from(map.values());
};

const splitCSV = (q = "") =>
  Array.from(
    new Set(
      String(q || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
  );

// ✅ productCode is 5 digits in your DB (e.g. "00219")
const pad5 = (s) => {
  const d = String(s ?? "").replace(/\D/g, "");
  if (!d) return "";
  return d.slice(-5).padStart(5, "0"); // "219" -> "00219", "FEA-00219-XS" -> "00219"
};

const matchesProductCode = (productCode, q) => {
  const pc = pad5(productCode);
  const qq = pad5(q);
  if (!pc || !qq) return false;
  return pc === qq;
};

const matchesText = (text, q) => {
  const t = norm(text);
  const qq = norm(q);
  return !!(t && qq && t.includes(qq));
};

/**
 * Strict matcher (client safety):
 * ✅ productCode (5-digit normalize; supports "219", "00219", "FEA-00219-XS")
 * ✅ title/name
 * ✅ tags
 * ✅ categories / category.name/slug
 * ✅ colors
 * ✅ sku + variants.sku (exact/contains)
 */
const productMatchesToken = (p, token) => {
  if (!p) return false;
  const q = String(token || "").trim();
  if (!q) return false;

  // ✅ productCode match (handles 219 / 00219 / sku-with-code)
  if (matchesProductCode(p.productCode, q)) return true;

  // ✅ sku contains / exact
  if (matchesText(p.sku, q)) return true;

  // ✅ variants.sku contains / exact
  const vSkus = safeArr(p.variants).map((v) => v?.sku).filter(Boolean);
  if (vSkus.some((s) => matchesText(s, q) || norm(s) === norm(q))) return true;

  // ✅ title/name
  if (matchesText(p.title || p.name, q)) return true;

  // ✅ tags
  const tags = safeArr(p.tags).map(norm);
  if (tags.some((t) => t.includes(norm(q)))) return true;

  // ✅ categories + category object
  const categories = safeArr(p.categories).map(norm);
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

  // ✅ colors
  const colors = safeArr(p.colors).map(norm);
  if (colors.some((c) => c.includes(norm(q)))) return true;

  return false;
};

const productMatchesQuery = (p, tokens = []) => {
  if (!tokens?.length) return true;
  // ✅ comma-separated: ANY token match
  return tokens.some((t) => productMatchesToken(p, t));
};

// ✅ token is code-like if it contains any digits at all
const tokenLooksLikeProductCode = (t) => !!pad5(t);

/* ---------------- store ---------------- */
export const useSearchStore = create((set, get) => ({
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

    const raw = (query || "").trim();
    const tokens = splitCSV(raw);
    if (!raw || raw.length < 2) {
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

    // ✅ Build codes (5-digit normalized + deduped) from any token containing digits
    const codes = Array.from(
      new Set(tokens.map((t) => pad5(t)).filter(Boolean))
    );

    // ✅ "skus" helper tokens: the raw non-code tokens (names etc.)
    const skus = tokens.filter((t) => !tokenLooksLikeProductCode(t));

    const primaryExtra = {
      // preferred keys (if backend supports)
      q: raw,
      codes: codes.length ? codes.join(",") : undefined,
      skus: skus.length ? skus.join(",") : undefined,

      // backwards compatible keys (if backend uses these)
      search: raw,
      searchIn:
        "title,name,productCode,sku,tags,categories,category,slug,colors,variants.sku",
    };

    const fetchProducts = async (extraParams = {}) => {
      const params = buildParams(extraParams);
      const res = await fetch(
        `${API_BASE}/api/products?${params.toString()}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Search request failed");

      const incoming = Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data?.items)
        ? data.items
        : [];

      // extra safety: published only
      const publishedOnly = incoming.filter((p) => p?.isActive !== false);

      return {
        products: publishedOnly,
        page: data?.page || page,
        pages: data?.pages || 1,
      };
    };

    try {
      const primary = await fetchProducts(primaryExtra);

      // ✅ ALWAYS strict match (prevents "latest 20" bug)
      const matched = primary.products.filter((p) =>
        productMatchesQuery(p, tokens)
      );

      const finalResults =
        page === 1
          ? uniqById(matched)
          : uniqById([...(get().results || []), ...matched]);

      set({
        results: finalResults,
        total: finalResults.length,
        page: primary.page || page,
        pages: primary.pages || 1,
        loading: false,
        lastSearchedAt: Date.now(),
      });

      /* ✅ Analytics appearance */
      try {
        const analytics = useAnalyticsStore.getState();
        matched.forEach((p) => analytics.trackSearchAppearance(p._id || p.id));
      } catch (e) {
        console.warn("📊 Search analytics failed", e);
      }

      /* ✅ GA4: only page 1 (deduped) */
      try {
        const ga4Key = stableStringify({
          raw,
          category,
          tags,
          minPrice,
          maxPrice,
          sort,
          isActive: true,
        });
        const now = Date.now();
        const { _lastGA4SearchKey, _lastGA4SearchAt } = get();

        const tooSoon = _lastGA4SearchAt && now - _lastGA4SearchAt < 2500;
        const sameKey = _lastGA4SearchKey && _lastGA4SearchKey === ga4Key;

        if (page === 1 && !(sameKey && tooSoon)) {
          pushToDataLayer({ event: "search", search_term: raw });

          pushEcomEvent("view_search_results", {
            currency: "INR",
            items: finalResults.slice(0, 20).map(ga4Item),
          });

          set({ _lastGA4SearchKey: ga4Key, _lastGA4SearchAt: now });
        }
      } catch (e) {
        console.warn("📈 GA4 search events failed", e);
      }

      /* ✅ Meta Search: only page 1 */
      try {
        const metaKey = stableStringify({
          raw,
          category,
          tags,
          minPrice,
          maxPrice,
          sort,
          isActive: true,
        });
        const now = Date.now();
        const { _lastMetaSearchKey, _lastMetaSearchAt } = get();

        const tooSoon = _lastMetaSearchAt && now - _lastMetaSearchAt < 2500;
        const sameKey = _lastMetaSearchKey && _lastMetaSearchKey === metaKey;

        if (page === 1 && !(sameKey && tooSoon)) {
          await trackMeta("Search", {
            search_string: raw,
            content_category: category ? String(category) : undefined,
            content_ids: finalResults
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
