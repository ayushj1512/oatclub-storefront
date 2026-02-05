"use client";

import { create } from "zustand";

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
const API_ROOT = BASE ? `${BASE}/api` : "/api";
const REVIEWS_API = `${API_ROOT}/reviews`;

/* -------------------------
  helpers
------------------------- */
const safe = (v) => (v == null ? "" : String(v));
const norm = (v) => safe(v).trim();

const buildQS = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    const val = typeof v === "string" ? v.trim() : v;
    if (val === "" || (Array.isArray(val) && val.length === 0)) return;
    sp.set(k, String(val));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// If you use cookie auth, keep credentials: "include"
const apiFetch = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, credentials: "include" });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

/* -------------------------
  store (CUSTOMER ONLY)
------------------------- */
export const useReviewStore = create((set, get) => ({
  items: [],
  total: 0,

  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  error: "",
  lastCreated: null,

  clearError: () => set({ error: "" }),
  reset: () => set({ items: [], total: 0, error: "", lastCreated: null }),

  /* ============================================================
    CUSTOMER: FETCH REVIEWS
    GET /api/reviews?product=&productCode=&customer=&status=
  ============================================================ */
  fetchReviews: async ({ product, productCode, customer, status = "approved" } = {}) => {
    try {
      set({ loading: true, error: "" });

      const qs = buildQS({
        product: norm(product),
        productCode: norm(productCode),
        customer: norm(customer),
        status: norm(status),
      });

      const data = await apiFetch(`${REVIEWS_API}${qs}`, { method: "GET" });

      const items = Array.isArray(data) ? data : [];
      set({ items, total: items.length, loading: false });
      return items;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to load reviews" });
      return [];
    }
  },

  /* ============================================================
    CUSTOMER: CREATE REVIEW (supports images)
    POST /api/reviews
    multipart if images exist else JSON
  ============================================================ */
  createReview: async ({
    product,
    customer,
    rating,
    reviewText = "",
    title = "",
    verifiedPurchase = false,
    images = [], // File[]
  }) => {
    try {
      set({ creating: true, error: "", lastCreated: null });

      const p = norm(product);
      const c = norm(customer);
      const r = Number(rating);

      if (!p || !c || !Number.isFinite(r))
        throw new Error("Product, customer and rating are required");
      if (r < 1 || r > 5) throw new Error("Rating must be between 1 and 5");

      const hasFiles = Array.isArray(images) && images.length > 0;

      let data;

      if (hasFiles) {
        const fd = new FormData();
        fd.append("product", p);
        fd.append("customer", c);
        fd.append("rating", String(r));
        fd.append("reviewText", String(reviewText || ""));
        fd.append("title", String(title || ""));
        fd.append("verifiedPurchase", verifiedPurchase ? "true" : "false");

        // Must match multer field name on backend (likely upload.array("images"))
        for (const file of images) fd.append("images", file);

        data = await apiFetch(REVIEWS_API, { method: "POST", body: fd });
      } else {
        data = await apiFetch(REVIEWS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: p,
            customer: c,
            rating: r,
            reviewText,
            title,
            verifiedPurchase: !!verifiedPurchase,
          }),
        });
      }

      const created = data?.review || null;

      if (created) {
        set((s) => ({
          items: [created, ...s.items],
          total: s.total + 1,
          lastCreated: created,
        }));
      }

      set({ creating: false });
      return { ok: true, data };
    } catch (e) {
      set({ creating: false, error: e?.message || "Failed to create review" });
      return { ok: false, error: e?.message || "Failed to create review" };
    }
  },

  /* ============================================================
    CUSTOMER: UPDATE OWN REVIEW
    PUT /api/reviews/:id
  ============================================================ */
  updateReview: async (id, patch = {}) => {
    try {
      const reviewId = norm(id);
      if (!reviewId) throw new Error("Review id is required");

      // allow only safe customer fields
      const allowed = ["rating", "title", "reviewText"];
      const cleanPatch = {};
      for (const k of allowed) {
        if (patch?.[k] !== undefined) cleanPatch[k] = patch[k];
      }

      if (cleanPatch.rating !== undefined) {
        const r = Number(cleanPatch.rating);
        if (!Number.isFinite(r) || r < 1 || r > 5) throw new Error("Rating must be between 1 and 5");
        cleanPatch.rating = r;
      }

      set({ updating: true, error: "" });

      const data = await apiFetch(`${REVIEWS_API}/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPatch),
      });

      const updated = data?.review || null;

      if (updated) {
        set((s) => ({
          items: s.items.map((x) => (String(x?._id) === String(updated._id) ? updated : x)),
          updating: false,
        }));
      } else {
        set({ updating: false });
      }

      return { ok: true, data };
    } catch (e) {
      set({ updating: false, error: e?.message || "Failed to update review" });
      return { ok: false, error: e?.message || "Failed to update review" };
    }
  },

  /* ============================================================
    CUSTOMER: DELETE OWN REVIEW
    DELETE /api/reviews/:id
  ============================================================ */
  deleteReview: async (id) => {
    try {
      const reviewId = norm(id);
      if (!reviewId) throw new Error("Review id is required");

      set({ deleting: true, error: "" });

      const data = await apiFetch(`${REVIEWS_API}/${reviewId}`, { method: "DELETE" });

      set((s) => ({
        items: s.items.filter((x) => String(x?._id) !== String(reviewId)),
        total: Math.max((s.total || 0) - 1, 0),
        deleting: false,
      }));

      return { ok: true, data };
    } catch (e) {
      set({ deleting: false, error: e?.message || "Failed to delete review" });
      return { ok: false, error: e?.message || "Failed to delete review" };
    }
  },
}));
