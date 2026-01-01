"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import { trackMeta } from "@/lib/meta/track";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// request control (abort + stale ignore + dedupe)
let ctrl = null;
let reqId = 0;

/* ---------------- helpers ---------------- */
const normalize = (p) => {
  const id = p?._id ? String(p._id) : "";
  const images = Array.isArray(p?.images) ? p.images : [];
  const thumb = p?.thumbnail || images[0] || "/placeholder.png";
  const stock = Number(p?.stock ?? 0);
  const isInStock = Boolean(p?.isInStock ?? stock > 0);

  return {
    id,
    productId: id,
    productCode: p?.productCode || "",
    productType:
      p?.productType ||
      (Array.isArray(p?.variants) && p.variants.length ? "variable" : "simple"),
  name: p?.name || p?.title || "",

    slug: p?.slug || "",
    price: Number(p?.price || 0),
    compareAtPrice: p?.compareAtPrice ?? null,
    currency: p?.currency || "INR",
    description: p?.shortDescription || p?.description || "",
    category: p?.category?.slug || "uncategorized",
    categoryId: p?.category?._id ? String(p.category._id) : null,
    subcategoryId: p?.subcategory?._id ? String(p.subcategory._id) : null,
    image: thumb,
    thumbnail: thumb,
    images,
    variants: Array.isArray(p?.variants) ? p.variants : [],
    stock,
    isInStock,
    tags: Array.isArray(p?.tags) ? p.tags : [],
    dateCreated: p?.createdAt || null,
    source: "backend",
    raw: p,
  };
};

const ga4Item = (p, qty = 1) =>
  mapItem(
    {
      _id: p?.id || p?._id,
      id: p?.id || p?._id,
      name: p?.name || p?.title,
      title: p?.name || p?.title,
      price: Number(p?.price ?? 0) || 0,
      category: p?.category || p?.categoryId || "",
      variant: "",
      sku: p?.sku || "",
    },
    qty
  );

const shouldSkipGA4 = (get, set, key, ms = 1500) => {
  const now = Date.now();
  const { _lastGA4Key, _lastGA4At } = get();
  if (_lastGA4Key === key && now - _lastGA4At < ms) return true;
  set({ _lastGA4Key: key, _lastGA4At: now });
  return false;
};

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = String(x?.slug || "")
      .trim()
      .toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const isBadCategory = (v) => {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  return (
    !s ||
    s === "all" ||
    s === "__no_match__" ||
    s === "undefined" ||
    s === "null"
  );
};

const sanitize = (p = {}) => {
  const x = { ...p };
  if (isBadCategory(x.category)) delete x.category;
  return x;
};

const buildUrl = (p = {}) => {
  const qs = new URLSearchParams();
  const setIf = (k, v) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  };

  setIf("page", p.page);
  setIf("limit", p.limit);
  setIf("search", p.search);

  if (p.category && !isBadCategory(p.category)) setIf("category", p.category);
  if (p.subcategory) setIf("subcategory", p.subcategory);

  setIf("collection", p.collection);

  if (Array.isArray(p.tags)) setIf("tags", p.tags.join(","));
  else setIf("tags", p.tags);

  setIf("minPrice", p.minPrice);
  setIf("maxPrice", p.maxPrice);

  const sortMap = {
    default: "",
    priceLowHigh: "price_asc",
    priceHighLow: "price_desc",
    newest: "newest",
    rating: "rating",
    popularity: "popularity",
  };

  if (p.sort) setIf("sort", p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  if (p.isActive != null) setIf("isActive", p.isActive);
  if (p.sku) setIf("sku", p.sku);

  const q = qs.toString();
  return `${BACKEND}/api/products${q ? `?${q}` : ""}`;
};

// ✅ NEW: build url for tag route
const buildTagUrl = (p = {}) => {
  const qs = new URLSearchParams();
  const setIf = (k, v) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  };

  // route supports tag OR tags[]
  if (p.tag) setIf("tag", p.tag);
  if (Array.isArray(p.tags) && p.tags.length) setIf("tags", p.tags.join(","));

  setIf("page", p.page);
  setIf("limit", p.limit);
  setIf("search", p.search);
  setIf("minPrice", p.minPrice);
  setIf("maxPrice", p.maxPrice);

  // allow same sort mapping
  const sortMap = {
    default: "",
    priceLowHigh: "price_asc",
    priceHighLow: "price_desc",
    newest: "newest",
    rating: "rating",
    popularity: "popularity",
  };

  if (p.sort) setIf("sort", p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  if (p.isActive != null) setIf("isActive", p.isActive);

  const q = qs.toString();
  return `${BACKEND}/api/products/by-tag${q ? `?${q}` : ""}`;
};

const isCastCategoryErr = (m = "") =>
  String(m).includes("Cast to ObjectId failed") &&
  String(m).includes('path "category"');

export const useProductStore = create(
  persist(
    (set, get) => ({
      allProducts: [],
      page: 1,
      limit: 20,
      hasMoreFlag: true,
  activeCategory: null,
  lastParams: {},
      hasMore: () => get().hasMoreFlag,
      isLoading: false,
      error: null,
_lastMetaViewKey: null,
_lastMetaViewAt: 0,
_lastGA4Key: null,
_lastGA4At: 0,
_lastMetaCategoryKey: null,
_lastMetaCategoryAt: 0,
      /* =====================================================
          ✅ MAIN FETCH (existing)
        ===================================================== */
    fetchProducts: async (params = {}) => {
  if (!BACKEND) return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

  const { page = 1, limit = get().limit } = params;
  const rawCategory = params.category ?? null;

  const cleaned = sanitize(params);
  const url = buildUrl({ ...cleaned, page, limit });

  if (ctrl) ctrl.abort();
  ctrl = new AbortController();
  const myId = ++reqId;

  const prevActiveCategory = get().activeCategory;
  const categoryChanged = rawCategory !== prevActiveCategory;

  set(() => ({
    isLoading: true,
    error: null,
    activeCategory: rawCategory,
    lastParams: cleaned,
    ...(categoryChanged ? { allProducts: [], page: 1, hasMoreFlag: true } : {}),
  }));

  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || "Failed to load products");
    if (myId !== reqId) return;

    const incoming = uniqBySlug((data?.products || []).map(normalize));

    /* ✅ GA4: view_item_list (only first page) */
    try {
      if (page === 1 && incoming.length) {
        const listId = rawCategory ? `cat_${rawCategory}` : "products";
        const key = `vil_${listId}_${incoming.slice(0, 15).map((p) => p.id).join("_")}`;
        if (!shouldSkipGA4(get, set, key, 1500)) {
          pushEcomEvent("view_item_list", {
            item_list_id: listId,
            item_list_name: rawCategory ? String(rawCategory) : "All Products",
            items: incoming.slice(0, 50).map((p) => ga4Item(p, 1)),
          });
        }
      }
    } catch (e) {
      console.warn("📈 GA4 view_item_list failed", e);
    }

    /* 🧾 META: Category View (same logic) */
    try {
      if (rawCategory && page === 1 && categoryChanged) {
        const now = Date.now();
        const key = `view_category_${String(rawCategory).trim().toLowerCase()}`;
        const { _lastMetaCategoryKey, _lastMetaCategoryAt } = get();
        const tooSoon = _lastMetaCategoryAt && now - _lastMetaCategoryAt < 1500;
        const sameKey = _lastMetaCategoryKey && _lastMetaCategoryKey === key;

        if (!(sameKey && tooSoon)) {
          await trackMeta("ViewContent", {
            content_type: "product_group",
            content_ids: [String(rawCategory)],
            content_name: String(rawCategory),
            currency: "INR",
            content_ids_product: incoming.slice(0, 10).map((p) => String(p?.id)).filter(Boolean),
          });

          set({ _lastMetaCategoryKey: key, _lastMetaCategoryAt: now });
        }
      }
    } catch (e) {
      console.warn("🧾 Meta Category View failed", e);
    }

    set((state) => ({
      allProducts: page === 1 ? incoming : [...state.allProducts, ...incoming],
      page,
      hasMoreFlag: incoming.length === limit,
      isLoading: false,
    }));
  } catch (e) {
    if (e?.name !== "AbortError") set({ error: e.message || "Failed to load products" });
    set({ isLoading: false });
  }
},



      /* =====================================================
          ✅ NEW: FETCH BY TAG ROUTE
          GET /api/products/by-tag?tag=... OR tags=a,b
        ===================================================== */
      fetchProductsByTag: async (params = {}) => {
  if (!BACKEND) return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

  const { page = 1, limit = get().limit } = params;
  const url = buildTagUrl({ ...params, page, limit });

  if (ctrl) ctrl.abort();
  ctrl = new AbortController();
  const myId = ++reqId;

  set({ isLoading: true, error: null });

  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || "Failed to load products");
    if (myId !== reqId) return;

    const incoming = uniqBySlug((data?.products || []).map(normalize));

    /* ✅ GA4: view_item_list for tag page (only page 1) */
    try {
      if (page === 1 && incoming.length) {
        const tagName = params?.tag || (Array.isArray(params?.tags) ? params.tags.join(",") : "tag");
        const listId = `tag_${String(tagName).trim().toLowerCase()}`;
        const key = `vil_${listId}_${incoming.slice(0, 15).map((p) => p.id).join("_")}`;

        if (!shouldSkipGA4(get, set, key, 1500)) {
          pushEcomEvent("view_item_list", {
            item_list_id: listId,
            item_list_name: String(tagName),
            items: incoming.slice(0, 50).map((p) => ga4Item(p, 1)),
          });
        }
      }
    } catch (e) {
      console.warn("📈 GA4 tag view_item_list failed", e);
    }

    set((state) => ({
      allProducts: page === 1 ? incoming : [...state.allProducts, ...incoming],
      page,
      hasMoreFlag: incoming.length === limit,
      isLoading: false,
    }));
  } catch (e) {
    if (e?.name !== "AbortError") set({ error: e.message || "Failed to load products" });
    set({ isLoading: false });
  }
},


    fetchProductDetails: async (idOrSlug) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  if (ctrl) {
    try { ctrl.abort(); } catch {}
  }

  ctrl = new AbortController();
  const myId = ++reqId;

  set({ isLoading: true, error: null });

  const param = encodeURIComponent(String(idOrSlug || ""));
  const tryUrls = [`${BACKEND}/api/products/details/${param}`, `${BACKEND}/api/products/${param}`];

  try {
    for (let i = 0; i < tryUrls.length; i++) {
      const r = await fetch(tryUrls[i], { cache: "no-store", signal: ctrl.signal });
      const j = await safeJson(r);
      if (myId !== reqId) return null;

      if (r.ok) {
        const prod = normalize(j);
        get().upsertProduct(prod);
        set({ isLoading: false });

        /* ✅ GA4: view_item (deduped) */
        try {
          const k = `vi_${prod?.id || prod?.slug || param}`;
          if (!shouldSkipGA4(get, set, k, 1500)) {
            pushEcomEvent("view_item", {
              currency: prod?.currency || "INR",
              value: Number(prod?.price || 0),
              items: [ga4Item(prod, 1)],
            });
          }
        } catch (e) {
          console.warn("📈 GA4 view_item failed", e);
        }

        /* 🧾 META: ViewContent (existing logic same) */
        try {
          const now = Date.now();
          const key = `view_product_${prod?.id || prod?.slug || param}`;
          const { _lastMetaViewKey, _lastMetaViewAt } = get();

          const tooSoon = _lastMetaViewAt && now - _lastMetaViewAt < 1500;
          const sameKey = _lastMetaViewKey && _lastMetaViewKey === key;

          if (!(sameKey && tooSoon)) {
            await trackMeta("ViewContent", {
              content_type: "product",
              content_ids: prod?.id ? [String(prod.id)] : [],
              contents: prod?.id ? [{ id: String(prod.id), quantity: 1, item_price: Number(prod.price || 0) }] : [],
              value: Number(prod.price || 0),
              currency: prod.currency || "INR",
              content_name: prod.name || "",
              content_category: prod.category || "",
            });

            set({ _lastMetaViewKey: key, _lastMetaViewAt: now });
          }
        } catch (e) {
          console.warn("🧾 Meta ViewContent failed", e);
        }

        return prod;
      }

      if (i === tryUrls.length - 1) throw new Error(j?.message || "Failed to load product");
    }
  } catch (err) {
    if (err?.name === "AbortError") return null;

    console.error("❌ fetchProductDetails error:", err);

    if (myId === reqId) set({ error: err.message || "Failed to load product", isLoading: false });
    throw err;
  } finally {
    if (myId === reqId) set({ isLoading: false });
  }

  return null;
},



      // Add this inside your zustand create store:
     fetchProductsByCategory: async (categorySlug, opts = {}) => {
  const slug = String(categorySlug || "").trim();
  if (!slug) return;

  const { activeCategory, isLoading } = get();

  // ✅ prevent duplicate request if same category already loaded
  if (!opts.force && String(activeCategory || "") === slug && !isLoading) {
    return;
  }

  // ✅ Reset pagination + fetch first page
  return get().fetchProducts({
    category: slug,
    page: 1,
    isActive: true,
  });
},


      fetchProductBySKU: async (sku) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");
  if (!sku) throw new Error("SKU missing");

  if (ctrl) ctrl.abort();
  ctrl = new AbortController();
  const myId = ++reqId;

  set({ isLoading: true, error: null });

  try {
    const param = encodeURIComponent(String(sku));
    const res = await fetch(`${BACKEND}/api/products/sku/${param}`, { cache: "no-store", signal: ctrl.signal });
    const data = await safeJson(res);

    if (!res.ok) throw new Error(data?.message || "Failed to load product by SKU");
    if (myId !== reqId) return { product: null, matchedVariant: null };

    const productDoc = data?.product || null;
    const matchedVariant = data?.matchedVariant || null;

    const product = productDoc ? normalize(productDoc) : null;
    if (product) get().upsertProduct(product);

    set({ isLoading: false });

    /* ✅ GA4: view_item (deduped) */
    try {
      if (product?.id) {
        const k = `vi_${product.id}`;
        if (!shouldSkipGA4(get, set, k, 1500)) {
          pushEcomEvent("view_item", {
            currency: product.currency || "INR",
            value: Number(product.price || 0),
            items: [ga4Item(product, 1)],
          });
        }
      }
    } catch (e) {
      console.warn("📈 GA4 view_item (sku) failed", e);
    }

    /* 🧾 META: ViewContent (deduped) */
    try {
      if (product?.id) {
        const now = Date.now();
        const key = `view_product_${product.id}`;
        const { _lastMetaViewKey, _lastMetaViewAt } = get();
        const tooSoon = _lastMetaViewAt && now - _lastMetaViewAt < 1500;
        const sameKey = _lastMetaViewKey && _lastMetaViewKey === key;

        if (!(sameKey && tooSoon)) {
          await trackMeta("ViewContent", {
            content_type: "product",
            content_ids: [String(product.id)],
            contents: [{ id: String(product.id), quantity: 1, item_price: Number(product.price || 0) }],
            value: Number(product.price || 0),
            currency: product.currency || "INR",
            content_name: product.name || "",
            content_category: product.category || "",
          });

          set({ _lastMetaViewKey: key, _lastMetaViewAt: now });
        }
      }
    } catch (e) {
      console.warn("🧾 Meta ViewContent (sku) failed", e);
    }

    return { product, matchedVariant };
  } catch (err) {
    if (err?.name !== "AbortError") set({ error: err.message || "Failed to load product by SKU" });
    set({ isLoading: false });
    throw err;
  }
},


      upsertProduct: (product) => {
        const p = product?.source === "backend" ? product : normalize(product);
        const all = get().allProducts || [];
        const i = all.findIndex((x) => String(x?.id) === String(p?.id));

        const updated =
          i >= 0 ? [...all.slice(0, i), p, ...all.slice(i + 1)] : [...all, p];

        set({ allProducts: updated });
      },

      loadMore: () => {
  const { page, hasMoreFlag, isLoading, lastParams } = get();
  if (!hasMoreFlag || isLoading) return;

  get().fetchProducts({
    ...lastParams,
    page: page + 1,
  });
},


      clearError: () => set({ error: null }),
    }),
    {
      name: "product-store",
      partialize: () => ({}),
    }
  )
);
