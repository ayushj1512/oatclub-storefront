// store/collectionStore.js
"use client";

import { create } from "zustand";

const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
const API_ROOT = BASE_URL ? `${BASE_URL}/api` : "/api";

/* ---------------- helpers ---------------- */
const safe = (v) => (v == null ? "" : String(v));
const norm = (v) => safe(v).trim();
const uniqBy = (arr, keyFn) => {
  const seen = new Set();
  const out = [];
  for (const x of arr || []) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

// Ensure products are in NEW format: [{ product, productCode }]
// Supports inputs:
// - ["productId1", "productId2"]
// - [{ product: "id", productCode: "ABC" }]
// - [{ _id: "id", productCode: "ABC" }] (if you pass product objects)
// - [{ product: { _id: "id" }, productCode: "ABC" }]
const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return uniqBy(
    products
      .map((p) => {
        // old: "id"
        if (typeof p === "string") return { product: p, productCode: "" };

        // if p itself is an ObjectId-ish string stored in object
        if (p && typeof p === "object") {
          // if passed product object { _id, ... }
          if (p._id && !p.product) return { product: p._id, productCode: norm(p.productCode) };

          // if passed { product: "id" }
          if (typeof p.product === "string") return { product: p.product, productCode: norm(p.productCode) };

          // if passed { product: {_id:"id"} }
          if (p.product && typeof p.product === "object" && p.product._id)
            return { product: p.product._id, productCode: norm(p.productCode) };
        }

        return null;
      })
      .filter(Boolean),
    (x) => safe(x.product)
  );
};

const toQuery = (obj = {}) => {
  const qs = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v == null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
    else qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

const jsonFetch = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

/* ---------------- store ---------------- */
export const useCollectionStore = create((set, get) => ({
  // data
  items: [],
  current: null,
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },

  // ui state
  loading: false,
  saving: false,
  deleting: false,
  error: "",

  // filters (optional use)
  filters: {
    q: "",
    activeOnly: false,
    type: "",
    category: "",
    tag: "",
  },

  setFilters: (patch = {}) =>
    set((s) => ({ filters: { ...s.filters, ...patch } })),

  clearError: () => set({ error: "" }),

  /* ============================================================
     FETCH ALL
     NOTE: Your backend currently returns ALL collections (no pagination).
     We still keep pagination fields in store for future use.
  ============================================================ */
  fetchAll: async (opts = {}) => {
    const { force = false } = opts;
    const { loading, items } = get();
    if (loading) return;
    if (!force && Array.isArray(items) && items.length > 0) return;

    set({ loading: true, error: "" });
    try {
      const data = await jsonFetch(`${API_ROOT}/collections`);
      const list = Array.isArray(data) ? data : data?.collections || [];
      set({
        items: list,
        loading: false,
        pagination: {
          page: 1,
          limit: list.length || 0,
          total: list.length || 0,
          pages: 1,
        },
      });
      return list;
    } catch (e) {
      set({ loading: false, error: e?.message || "Fetch failed" });
      return null;
    }
  },

  /* ============================================================
     FETCH ONE (by id or slug)
  ============================================================ */
  fetchOne: async (idOrSlug) => {
    const key = norm(idOrSlug);
    if (!key) return null;

    set({ loading: true, error: "" });
    try {
      const data = await jsonFetch(`${API_ROOT}/collections/${encodeURIComponent(key)}`);
      set({ current: data, loading: false });

      // also upsert into list
      set((s) => ({
        items: uniqBy(
          [data, ...(s.items || [])].filter(Boolean),
          (x) => safe(x._id)
        ),
      }));

      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Fetch failed" });
      return null;
    }
  },

  /* ============================================================
     CREATE
     - sends products in [{ product, productCode }] format
     - expects backend response: { collection }
  ============================================================ */
  create: async (payload, { token } = {}) => {
    const body = { ...(payload || {}) };
    if (body.products) body.products = normalizeProducts(body.products);

    set({ saving: true, error: "" });
    try {
      const data = await jsonFetch(`${API_ROOT}/collections`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const created = data?.collection || data;
      set((s) => ({
        items: uniqBy([created, ...(s.items || [])].filter(Boolean), (x) => safe(x._id)),
        current: created,
        saving: false,
      }));
      return created;
    } catch (e) {
      set({ saving: false, error: e?.message || "Create failed" });
      return null;
    }
  },

  /* ============================================================
     UPDATE
     - expects backend response: { collection }
  ============================================================ */
  update: async (id, updates, { token } = {}) => {
    const _id = norm(id);
    if (!_id) return null;

    const body = { ...(updates || {}) };
    if (body.products) body.products = normalizeProducts(body.products);

    set({ saving: true, error: "" });
    try {
      const data = await jsonFetch(`${API_ROOT}/collections/${encodeURIComponent(_id)}`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const updated = data?.collection || data;
      set((s) => ({
        items: (s.items || []).map((x) => (safe(x._id) === safe(updated._id) ? updated : x)),
        current: s.current && safe(s.current._id) === safe(updated._id) ? updated : s.current,
        saving: false,
      }));
      return updated;
    } catch (e) {
      set({ saving: false, error: e?.message || "Update failed" });
      return null;
    }
  },

  /* ============================================================
     DELETE
  ============================================================ */
  remove: async (id, { token } = {}) => {
    const _id = norm(id);
    if (!_id) return false;

    set({ deleting: true, error: "" });
    try {
      await jsonFetch(`${API_ROOT}/collections/${encodeURIComponent(_id)}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      set((s) => ({
        items: (s.items || []).filter((x) => safe(x._id) !== _id),
        current: s.current && safe(s.current._id) === _id ? null : s.current,
        deleting: false,
      }));
      return true;
    } catch (e) {
      set({ deleting: false, error: e?.message || "Delete failed" });
      return false;
    }
  },

  /* ============================================================
     CLIENT-SIDE SEARCH / FILTER (since backend doesn't support it yet)
     - use for frontend list screens
  ============================================================ */
  getFiltered: () => {
    const { items, filters } = get();
    const q = norm(filters.q).toLowerCase();
    const type = norm(filters.type).toLowerCase();
    const category = norm(filters.category);
    const tag = norm(filters.tag);
    const activeOnly = !!filters.activeOnly;

    return (items || []).filter((c) => {
      if (activeOnly && !c?.isActive) return false;
      if (type && String(c?.type || "").toLowerCase() !== type) return false;
      if (category && safe(c?.category?._id || c?.category) !== category) return false;
      if (tag) {
        const tags = (c?.tags || []).map((t) => safe(t?._id || t));
        if (!tags.includes(tag)) return false;
      }
      if (!q) return true;

      const hay = [
        c?.name,
        c?.slug,
        c?.description,
        ...(c?.products || []).map((p) => p?.productCode),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  },

  /* ============================================================
     OPTIONAL: Query-string based fetch (if you add backend filters later)
     - currently unused, safe to keep
  ============================================================ */
  fetchWithQuery: async (query = {}, opts = {}) => {
    const { loading } = get();
    if (loading) return null;

    const qs = toQuery(query);
    set({ loading: true, error: "" });
    try {
      const data = await jsonFetch(`${API_ROOT}/collections${qs}`);
      const list = Array.isArray(data) ? data : data?.collections || [];
      set({ items: list, loading: false });
      return list;
    } catch (e) {
      set({ loading: false, error: e?.message || "Fetch failed" });
      return null;
    }
  },
}));
