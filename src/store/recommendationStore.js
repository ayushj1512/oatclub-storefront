"use client";

import { create } from "zustand";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useProductStore } from "@/store/productStore";

/* ---------------- helpers ---------------- */
const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const normStr = (s) => String(s || "").trim().toLowerCase();
const uniqBy = (arr, keyFn) => {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

const intersectionSize = (a = [], b = []) => {
  const A = new Set((a || []).map(normStr).filter(Boolean));
  let n = 0;
  for (const x of (b || []).map(normStr)) if (x && A.has(x)) n++;
  return n;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Score candidate product based on multiple recently viewed seeds.
 * You can tune weights as you like.
 */
const scoreCandidate = (candidate, seeds = []) => {
  const cCats = toArr(candidate?.categories);
  const cTags = toArr(candidate?.tags);
  const cColors = toArr(candidate?.colors);
  const cPrice = Number(candidate?.price || 0);
  const cRating = Number(candidate?.averageRating || 0);
  const cViews = Number(candidate?.analytics?.views || 0);
  const cPurch = Number(candidate?.analytics?.purchases || 0);

  let score = 0;

  for (const s of seeds) {
    const sCats = toArr(s?.categories);
    const sTags = toArr(s?.tags);
    const sColors = toArr(s?.colors);
    const sPrice = Number(s?.price || 0);

    // overlaps
    const catO = intersectionSize(cCats, sCats);
    const tagO = intersectionSize(cTags, sTags);
    const colorO = intersectionSize(cColors, sColors);

    // price closeness (within ±30% => boost)
    let priceBoost = 0;
    if (sPrice > 0 && cPrice > 0) {
      const diff = Math.abs(cPrice - sPrice) / sPrice; // 0..∞
      priceBoost = diff <= 0.3 ? 2 : diff <= 0.6 ? 1 : 0;
    }

    score += catO * 5 + tagO * 3 + colorO * 2 + priceBoost;
  }

  // popularity micro-boost (don’t dominate relevance)
  score += cRating * 0.5;
  score += cPurch * 0.02;
  score += cViews * 0.001;

  return score;
};

export const useRecommendationStore = create((set, get) => ({
  items: [], // recommended products (normalized-ish)
  seed: [],  // last N recently viewed used
  loading: false,

  /**
   * Build recommendations from current recentlyViewed + productStore cache.
   * Options:
   * - limit: output count
   * - seedCount: how many recently viewed products to use
   * - ensureCatalog: fetch products if catalog is empty/too small
   * - fetchParams: optional params to fetchProducts if needed
   */
  build: async ({
    limit = 12,
    seedCount = 5,
    ensureCatalog = true,
    fetchParams = { page: 1, limit: 200, sort: "popularity" },
  } = {}) => {
    set({ loading: true });

    try {
      const rv = useRecentlyViewedStore.getState().items || [];
      const seeds = rv.slice(0, seedCount);

      // If no seeds, nothing to recommend
      if (!seeds.length) {
        set({ items: [], seed: [], loading: false });
        return [];
      }

      const productState = useProductStore.getState();
      let catalog = productState.allProducts || [];

      // If catalog empty, optionally fetch some products
      if (ensureCatalog && catalog.length < 30 && productState.fetchProducts) {
        try {
          await productState.fetchProducts(fetchParams);
          catalog = useProductStore.getState().allProducts || [];
        } catch {
          // ignore fetch failure, proceed with whatever we have
          catalog = useProductStore.getState().allProducts || [];
        }
      }

      // Build exclusion set (recently viewed IDs + slugs)
      const excludeIds = new Set(seeds.map((p) => String(p?.id || p?._id || "")));
      const excludeSlugs = new Set(seeds.map((p) => normStr(p?.slug)));

      // Dedup catalog by slug (best stable key in your app)
      const catalogUniq = uniqBy(catalog, (p) => normStr(p?.slug));

      // filter candidates
      const candidates = catalogUniq.filter((p) => {
        const id = String(p?.id || p?._id || "");
        const slug = normStr(p?.slug);

        if (!slug) return false;
        if (excludeIds.has(id)) return false;
        if (excludeSlugs.has(slug)) return false;

        // basic safety
        if (p?.isActive === false) return false;
        if (p?.isInStock === false) return false;

        return true;
      });

      // score + sort
      const scored = candidates
        .map((p) => ({ p, score: scoreCandidate(p?.raw || p, seeds) }))
        .sort((a, b) => b.score - a.score);

      // pick top
      const out = scored.slice(0, limit).map((x) => x.p);

      set({
        items: out,
        seed: seeds,
        loading: false,
      });

      return out;
    } catch (e) {
      set({ items: [], seed: [], loading: false });
      return [];
    }
  },

  clear: () => set({ items: [], seed: [], loading: false }),
}));
