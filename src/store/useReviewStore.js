// store/useReviewStore.js
import { create } from "zustand";

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "").trim();

const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const normalizeBreakdown = (b) => {
  const x = b || {};
  return {
    5: safeNum(x[5] ?? x["5"] ?? 0),
    4: safeNum(x[4] ?? x["4"] ?? 0),
    3: safeNum(x[3] ?? x["3"] ?? 0),
    2: safeNum(x[2] ?? x["2"] ?? 0),
    1: safeNum(x[1] ?? x["1"] ?? 0),
  };
};

const json = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
};

const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

/**
 * ✅ USER REQUIREMENT:
 * - DO NOT store "review draft" data in zustand
 * - DO NOT use cookies/localStorage/sessionStorage inside store
 *
 * This store:
 * - minimal UI state (loading/error)
 * - optional caching of fetched items (not drafts)
 */

export const useReviewStore = create((set, get) => ({
  /* ---------------- minimal state ---------------- */
  items: [],
  page: 1,
  totalPages: 1,
  limit: 6,

  averageRating: 0,
  totalReviews: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },

  sort: "latest", // latest | oldest | ratingHigh | ratingLow
  status: "approved", // kept for compatibility (public endpoint already filters approved)

  loading: false,
  loadingMore: false,
  submitting: false,
  deleting: false,
  error: "",

  /* ---------------- setters ---------------- */
  reset: () =>
    set({
      items: [],
      page: 1,
      totalPages: 1,
      limit: 6,
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      sort: "latest",
      status: "approved",
      loading: false,
      loadingMore: false,
      submitting: false,
      deleting: false,
      error: "",
    }),

  setSort: (sort) => set({ sort: sort || "latest" }),
  setStatus: (status) => set({ status: status || "approved" }),
  setLimit: (limit) =>
    set({ limit: Math.min(Math.max(Number(limit) || 6, 1), 50) }),

/* =========================================================
   ✅ Fetch reviews by productCode (pagination)
   Endpoint:
     GET /api/reviews/product-code/:productCode?page&limit&sort
   Response:
     { items: [], meta: { page, limit, total, totalPages } }

   Options:
    - keepCache (default true): store fetched items in zustand
      If you want absolutely no caching, pass keepCache:false.
========================================================= */
  fetchByProductCode: async ({
    productCode,
    page = 1,
    append = false,
    limit,
    sort,
    keepCache = true,
  }) => {
    const st = get();
    const finalLimit = limit ?? st.limit;
    const finalSort = sort ?? st.sort;

    const code = String(productCode || "").trim();
    if (!code) return null;

    try {
      set({
        error: "",
        loading: !append,
        loadingMore: append,
      });

      const url =
        `${API_BASE}/api/reviews/product-code/${encodeURIComponent(code)}` +
        buildQuery({ page, limit: finalLimit, sort: finalSort });

      const res = await fetch(url, { cache: "no-store" });
      const data = await json(res);

      const incoming = Array.isArray(data?.items) ? data.items : [];
      const meta = data?.meta || {};

      if (keepCache) {
        const nextItems = append ? [...(st.items || []), ...incoming] : incoming;

        set({
          items: nextItems,
          page: safeNum(meta?.page) || page,
          totalPages: safeNum(meta?.totalPages) || (append ? st.totalPages : 1),
          limit: safeNum(meta?.limit) || finalLimit,
          loading: false,
          loadingMore: false,
        });
      } else {
        set({ loading: false, loadingMore: false });
      }

      return data;
    } catch (e) {
      set({
        error: String(e?.message || e),
        loading: false,
        loadingMore: false,
      });
      return null;
    }
  },

  loadMoreByProductCode: async ({ productCode, keepCache = true } = {}) => {
    const st = get();
    const code = String(productCode || "").trim();
    if (!code) return null;
    if (st.loadingMore || st.loading) return null;
    if (st.page >= st.totalPages) return null;

    return get().fetchByProductCode({
      productCode: code,
      page: st.page + 1,
      append: true,
      keepCache,
    });
  },

  /* =========================================================
     ✅ Fetch rating summary by productCode
     GET /api/reviews/product-code/:productCode/summary

     Response:
       { productCode, averageRating, totalReviews, distribution }
  ========================================================= */
  fetchSummaryByProductCode: async ({ productCode, keepCache = true } = {}) => {
    const code = String(productCode || "").trim();
    if (!code) return null;

    try {
      set({ error: "", loading: true });

      const url = `${API_BASE}/api/reviews/product-code/${encodeURIComponent(code)}/summary`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await json(res);

      if (keepCache) {
        set({
          averageRating: safeNum(data?.averageRating),
          totalReviews: safeNum(data?.totalReviews),
          breakdown: normalizeBreakdown(data?.distribution),
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      return data;
    } catch (e) {
      set({ error: String(e?.message || e), loading: false });
      return null;
    }
  },

  /* =========================================================
     ✅ Create review (customer required)
     POST /api/reviews
     Body:
       { product, customer, rating, title, reviewText, verifiedPurchase, images: [] }
  ========================================================= */
  createReview: async ({ token, payload }) => {
    try {
      set({ submitting: true, error: "" });

      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload || {}),
      });

      const data = await json(res);

      // optional: prepend created review to cache
      const review = data?.review;
      if (review?._id) {
        set((s) => ({
          items: [review, ...(s.items || [])],
          // optimistic summary bump (safe-ish)
          totalReviews: (s.totalReviews || 0) + 1,
        }));
      }

      set({ submitting: false });
      return data;
    } catch (e) {
      set({ submitting: false, error: String(e?.message || e) });
      return null;
    }
  },

  /* =========================================================
     ✅ Create rating/review (customer optional)
     POST /api/reviews/rating
     Body:
       { product OR productCode, customer?, customerName?, customerEmail?, customerPhone?,
         rating, title?, reviewText?, verifiedPurchase?, images? }
  ========================================================= */
  createProductRating: async ({ token, payload }) => {
    try {
      set({ submitting: true, error: "" });

      const res = await fetch(`${API_BASE}/api/reviews/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload || {}),
      });

      const data = await json(res);

      const review = data?.review;
      if (review?._id) {
        set((s) => ({
          items: [review, ...(s.items || [])],
          totalReviews: (s.totalReviews || 0) + 1,
        }));
      }

      set({ submitting: false });
      return data;
    } catch (e) {
      set({ submitting: false, error: String(e?.message || e) });
      return null;
    }
  },

  /* =========================================================
     ✅ Update review
     PUT /api/reviews/:id
  ========================================================= */
  updateReview: async ({ token, reviewId, payload }) => {
    try {
      set({ submitting: true, error: "" });

      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload || {}),
      });

      const data = await json(res);
      const updated = data?.review;

      if (updated?._id) {
        set((s) => ({
          items: (s.items || []).map((r) =>
            String(r._id) === String(updated._id) ? updated : r
          ),
        }));
      }

      set({ submitting: false });
      return data;
    } catch (e) {
      set({ submitting: false, error: String(e?.message || e) });
      return null;
    }
  },

  /* =========================================================
     ✅ Delete review
     DELETE /api/reviews/:id
  ========================================================= */
  deleteReview: async ({ token, reviewId }) => {
    try {
      set({ deleting: true, error: "" });

      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await json(res);

      set((s) => ({
        items: (s.items || []).filter((r) => String(r._id) !== String(reviewId)),
        totalReviews: Math.max((s.totalReviews || 0) - 1, 0),
        deleting: false,
      }));

      return data;
    } catch (e) {
      set({ deleting: false, error: String(e?.message || e) });
      return null;
    }
  },

  /* ---------------- UI helpers ---------------- */
  canLoadMore: () => {
    const { page, totalPages, loading, loadingMore } = get();
    return !loading && !loadingMore && page < totalPages;
  },

  // reads from fetched cache only (not draft)
  getMyReviewFromCache: (customerId) => {
    const cid = String(customerId || "");
    if (!cid) return null;
    const items = get().items || [];
    return (
      items.find((r) => String(r?.customer?._id || r?.customer || "") === cid) || null
    );
  },
}));
