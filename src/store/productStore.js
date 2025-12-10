"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

/* ---------------- helpers ---------------- */
const normalizeBackendProduct = (p) => {
  const mongoId = p?._id ? String(p._id) : "";
  const images = Array.isArray(p?.images) ? p.images : [];
  const thumb = p?.thumbnail || images?.[0] || "/placeholder.png";

  const variants = Array.isArray(p?.variants) ? p.variants : [];

  const stock = Number(p?.stock ?? 0);
  const isInStock = Boolean(p?.isInStock ?? stock > 0);

  return {
    id: mongoId,
    productId: mongoId,

    productCode: p?.productCode || "",
    productType:
      p?.productType ||
      (Array.isArray(p?.variants) && p.variants.length ? "variable" : "simple"),

    name: p?.title || "",
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

    variants,

    stock,
    isInStock,

    tags: Array.isArray(p?.tags) ? p.tags : [],
    dateCreated: p?.createdAt || null,

    source: "backend",
    raw: p,
  };
};

const uniqBySlug = (arr) => {
  const seen = new Set();
  const out = [];
  for (const x of arr || []) {
    const k = String(x?.slug || "").trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** ✅ treat these as invalid category values */
const isBadCategory = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return (
    !s ||
    s === "all" ||
    s === "__no_match__" ||
    s === "undefined" ||
    s === "null"
  );
};

/** ✅ sanitize params BEFORE building query */
const sanitizeParams = (params = {}) => {
  const clean = { ...params };

  // Never send these to backend
  if (isBadCategory(clean.category)) delete clean.category;

  // If your UI sometimes sets category to something like "__no_match__"
  // this guarantees it cannot escape to API.
  return clean;
};

const buildQS = (params = {}) => {
  const qs = new URLSearchParams();

  const setIf = (k, v) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  };

  setIf("page", params.page);
  setIf("limit", params.limit);
  setIf("search", params.search);

  if (params.category && !isBadCategory(params.category)) setIf("category", params.category);
  if (params.subcategory) setIf("subcategory", params.subcategory);

  setIf("collection", params.collection);

  if (Array.isArray(params.tags)) setIf("tags", params.tags.join(","));
  else setIf("tags", params.tags);

  setIf("minPrice", params.minPrice);
  setIf("maxPrice", params.maxPrice);

  // map UI sort -> backend sort keys (if you use this)
  const sortMap = {
    default: "",
    priceLowHigh: "price_asc",
    priceHighLow: "price_desc",
    newest: "newest",
    rating: "rating",
    popularity: "popularity",
  };

  if (params.sort) setIf("sort", params.sort);
  else if (params.sortOption && sortMap[params.sortOption]) setIf("sort", sortMap[params.sortOption]);

  if (params.isActive != null) setIf("isActive", params.isActive);

  if (params.sku) setIf("sku", params.sku);

  return qs;
};

const looksLikeCastObjectIdError = (msg = "") =>
  String(msg).includes("Cast to ObjectId failed") &&
  String(msg).includes('path "category"');

export const useProductStore = create(
  persist(
    (set, get) => ({
      allProducts: [],
      visibleProducts: [],
      filteredProducts: [],

      searchQuery: "",
      selectedCategory: "all",
      sortOption: "default",

      visibleCount: 20,
      LOAD_STEP: 20,

      isLoading: false,
      error: null,

      /* =====================================================
         ✅ GET /api/products (bulletproof)
      ===================================================== */
      fetchProducts: async (params = {}) => {
        if (!BACKEND) {
          const msg = "NEXT_PUBLIC_BACKEND_URL missing";
          set({ error: msg, isLoading: false });
          return [];
        }

        set({ isLoading: true, error: null });

        // ✅ hard sanitize
        const cleaned = sanitizeParams(params);

        const run = async (p) => {
          const qs = buildQS(p);
          const url = `${BACKEND}/api/products${qs.toString() ? `?${qs.toString()}` : ""}`;
          const res = await fetch(url, { cache: "no-store" });
          const data = await safeJson(res);
          if (!res.ok) throw new Error(data?.message || "Failed to load products");
          return data;
        };

        try {
          const data = await run(cleaned);

          const mapped = Array.isArray(data?.products)
            ? data.products.map(normalizeBackendProduct)
            : [];
          const unique = uniqBySlug(mapped);

          const initial = unique.slice(0, get().LOAD_STEP);

          set({
            allProducts: unique,
            visibleProducts: initial,
            filteredProducts: initial,
            visibleCount: initial.length,
            isLoading: false,
          });

          return unique;
        } catch (err) {
          // ✅ if backend still throws CastError, retry once WITHOUT category
          const msg = err?.message || "Failed to load products";

          if (looksLikeCastObjectIdError(msg) && cleaned?.category) {
            try {
              const retryParams = { ...cleaned };
              delete retryParams.category;

              const data = await run(retryParams);

              const mapped = Array.isArray(data?.products)
                ? data.products.map(normalizeBackendProduct)
                : [];
              const unique = uniqBySlug(mapped);

              const initial = unique.slice(0, get().LOAD_STEP);

              set({
                allProducts: unique,
                visibleProducts: initial,
                filteredProducts: initial,
                visibleCount: initial.length,
                isLoading: false,
                error: null,
              });

              return unique;
            } catch (retryErr) {
              const retryMsg = retryErr?.message || msg;
              console.error("❌ Product fetch error (retry failed):", retryErr);
              set({ error: retryMsg, isLoading: false });
              return [];
            }
          }

          console.error("❌ Product fetch error:", err);
          set({ error: msg, isLoading: false });
          return [];
        }
      },

      /* =====================================================
         ✅ SINGLE PRODUCT
      ===================================================== */
      fetchProductDetails: async (idOrSlug) => {
        try {
          if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

          set({ isLoading: true, error: null });

          const param = encodeURIComponent(String(idOrSlug || ""));

          const r1 = await fetch(`${BACKEND}/api/products/details/${param}`, { cache: "no-store" });
          const j1 = await safeJson(r1);

          let doc = null;

          if (r1.ok) doc = j1;
          else {
            const r2 = await fetch(`${BACKEND}/api/products/${param}`, { cache: "no-store" });
            const j2 = await safeJson(r2);
            if (!r2.ok) throw new Error(j2?.message || j1?.message || "Failed to load product");
            doc = j2;
          }

          const normalized = normalizeBackendProduct(doc);
          get().upsertProduct(normalized);

          set({ isLoading: false });
          return normalized;
        } catch (e) {
          set({ error: e?.message || "Failed to load product", isLoading: false });
          throw e;
        }
      },

      /* =====================================================
         ✅ GET BY SKU
      ===================================================== */
      fetchProductBySKU: async (sku) => {
        try {
          if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");
          if (!sku) throw new Error("SKU missing");

          set({ isLoading: true, error: null });

          const param = encodeURIComponent(String(sku));
          const res = await fetch(`${BACKEND}/api/products/sku/${param}`, { cache: "no-store" });
          const data = await safeJson(res);

          if (!res.ok) throw new Error(data?.message || "Failed to load product by SKU");

          const productDoc = data?.product || null;
          const matchedVariant = data?.matchedVariant || null;

          const normalized = productDoc ? normalizeBackendProduct(productDoc) : null;
          if (normalized) get().upsertProduct(normalized);

          set({ isLoading: false });
          return { product: normalized, matchedVariant };
        } catch (e) {
          set({ error: e?.message || "Failed to load product by SKU", isLoading: false });
          throw e;
        }
      },

      /* =====================================================
         LOAD MORE
      ===================================================== */
      loadMore: () => {
        const { visibleCount, LOAD_STEP, allProducts } = get();
        const newCount = visibleCount + LOAD_STEP;
        const newVisible = (allProducts || []).slice(0, newCount);
        set({ visibleCount: newCount, visibleProducts: newVisible });
        get().applyFilters();
      },

      hasMore: () => {
        const { visibleCount, allProducts } = get();
        return visibleCount < (allProducts || []).length;
      },

      /* =====================================================
         SEARCH / CATEGORY / SORT (client-side)
      ===================================================== */
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      setCategory: (category) => {
        set({ selectedCategory: category });
        get().applyFilters();
      },

      setSortOption: (option) => {
        set({ sortOption: option });
        get().applyFilters();
      },

      applyFilters: () => {
        const { visibleProducts, searchQuery, selectedCategory, sortOption } = get();
        let filtered = [...(visibleProducts || [])];

        if (searchQuery) {
          const q = String(searchQuery).toLowerCase();
          filtered = filtered.filter(
            (p) =>
              String(p?.name || "").toLowerCase().includes(q) ||
              String(p?.description || "").toLowerCase().includes(q) ||
              String(p?.slug || "").toLowerCase().includes(q) ||
              String(p?.productCode || "").toLowerCase().includes(q)
          );
        }

        if (selectedCategory !== "all") {
          const c = String(selectedCategory).toLowerCase();
          filtered = filtered.filter((p) => String(p?.category || "").toLowerCase() === c);
        }

        if (sortOption === "priceLowHigh") filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        else if (sortOption === "priceHighLow") filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        else if (sortOption === "newest") filtered.sort((a, b) => new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0));

        set({ filteredProducts: filtered });
      },

      upsertProduct: (product) => {
        const p = product?.source === "backend" ? product : normalizeBackendProduct(product);
        const current = get().allProducts || [];
        const idx = current.findIndex((x) => String(x?.id) === String(p?.id));

        const updated = idx >= 0 ? [...current.slice(0, idx), p, ...current.slice(idx + 1)] : [...current, p];
        set({ allProducts: updated });

        const newVisible = updated.slice(0, get().visibleCount);
        set({ visibleProducts: newVisible });

        get().applyFilters();
      },

      removeProduct: (id) => {
        const updated = (get().allProducts || []).filter((p) => String(p?.id) !== String(id));
        set({ allProducts: updated });

        const newVisible = updated.slice(0, get().visibleCount);
        set({ visibleProducts: newVisible });

        get().applyFilters();
      },

      resetVisible: () => {
        const all = get().allProducts || [];
        const initial = all.slice(0, get().LOAD_STEP);
        set({ visibleCount: initial.length, visibleProducts: initial });
        get().applyFilters();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "product-store",
      partialize: (s) => ({
        allProducts: s.allProducts,
        selectedCategory: s.selectedCategory,
        sortOption: s.sortOption,
      }),
    }
  )
);
