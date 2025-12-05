"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

/* ---------------- small helpers ---------------- */
const normalizeBackendProduct = (p) => {
  const mongoId = p?._id ? String(p._id) : "";
  const images = Array.isArray(p?.images) ? p.images : [];
  const thumb = p?.thumbnail || images?.[0] || "/placeholder.png";

  return {
    id: mongoId, // UI key (same as productId)
    productId: mongoId, // ✅ MUST use in cart/order payloads
    productCode: p?.productCode || "",
    name: p?.title || "",
    slug: p?.slug || "",
    price: Number(p?.price || 0),
    compareAtPrice: p?.compareAtPrice ?? null,
    description: p?.shortDescription || p?.description || "",
    category: p?.category?.slug || "uncategorized",
    categoryId: p?.category?._id ? String(p.category._id) : null,
    subcategoryId: p?.subcategory?._id ? String(p.subcategory._id) : null,
    image: thumb,
    thumbnail: thumb,
    images,
    variants: Array.isArray(p?.variants) ? p.variants : [],
    productType: p?.productType || (Array.isArray(p?.variants) && p.variants.length ? "variable" : "simple"),
    stock: Number(p?.stock ?? 0),
    isInStock: Boolean(p?.isInStock ?? true),
    tags: Array.isArray(p?.tags) ? p.tags : [],
    currency: p?.currency || "INR",
    dateCreated: p?.createdAt || null,
    source: "backend",
    raw: p, // optional: keep original doc if your UI needs it
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
         ✅ ONLY MERN BACKEND
         GET /api/products
      ===================================================== */
      fetchProducts: async (params = {}) => {
        try {
          if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

          set({ isLoading: true, error: null });

          const qs = new URLSearchParams();
          if (params.page) qs.set("page", String(params.page));
          if (params.limit) qs.set("limit", String(params.limit));
          if (params.search) qs.set("search", String(params.search));
          if (params.category && params.category !== "all") qs.set("category", String(params.category));
          if (params.subcategory) qs.set("subcategory", String(params.subcategory));
          if (params.collection) qs.set("collection", String(params.collection));
          if (params.tags) qs.set("tags", String(params.tags));
          if (params.minPrice) qs.set("minPrice", String(params.minPrice));
          if (params.maxPrice) qs.set("maxPrice", String(params.maxPrice));
          if (params.sort) qs.set("sort", String(params.sort));
          if (params.isActive != null) qs.set("isActive", String(params.isActive));

          const url = `${BACKEND}/api/products${qs.toString() ? `?${qs.toString()}` : ""}`;
          const res = await fetch(url, { cache: "no-store" });
          const data = await safeJson(res);

          if (!res.ok) throw new Error(data?.message || "Failed to load products");

          const mapped = Array.isArray(data?.products) ? data.products.map(normalizeBackendProduct) : [];
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
          console.error("❌ Product fetch error:", err);
          set({ error: err?.message || "Failed to load products", isLoading: false });
          return [];
        }
      },

      /* =====================================================
         ✅ SINGLE PRODUCT
         - GET /api/products/details/:idOrSlug
         - GET /api/products/:idOrSlug (fallback)
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
         SEARCH / CATEGORY / SORT
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

      /* =====================================================
         FILTER + SORT (runs on visibleProducts)
      ===================================================== */
      applyFilters: () => {
        const { visibleProducts, searchQuery, selectedCategory, sortOption } = get();
        let filtered = [...(visibleProducts || [])];

        if (searchQuery) {
          const q = String(searchQuery).toLowerCase();
          filtered = filtered.filter(
            (p) =>
              String(p?.name || "").toLowerCase().includes(q) ||
              String(p?.description || "").toLowerCase().includes(q)
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

      /* =====================================================
         UPSERT / REMOVE
      ===================================================== */
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
