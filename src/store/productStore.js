  "use client";

  import { create } from "zustand";
  import { persist } from "zustand/middleware";

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
      variants: Array.isArray(p?.variants) ? p.variants : [],
      stock,
      isInStock,
      tags: Array.isArray(p?.tags) ? p.tags : [],
      dateCreated: p?.createdAt || null,
      source: "backend",
      raw: p,
    };
  };

  const uniqBySlug = (arr = []) => {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const k = String(x?.slug || "").trim().toLowerCase();
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
    const s = String(v ?? "").trim().toLowerCase();
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

hasMore: () => get().hasMoreFlag,
        isLoading: false,
        error: null,

        /* =====================================================
          ✅ MAIN FETCH (existing)
        ===================================================== */
        fetchProducts: async (params = {}) => {
  if (!BACKEND) {
    set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });
    return;
  }

  const { page = 1, limit = get().limit } = params;
  const cleaned = sanitize(params);
  const url = buildUrl({ ...cleaned, page, limit });

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

    set((state) => {
      const merged =
        page === 1 ? incoming : [...state.allProducts, ...incoming];

      return {
        allProducts: merged,
        page,
       hasMoreFlag: incoming.length === limit,
        isLoading: false,
      };
    });
  } catch (e) {
    if (e?.name !== "AbortError") {
      set({ error: e.message || "Failed to load products" });
    }
    set({ isLoading: false });
  }
},


        /* =====================================================
          ✅ NEW: FETCH BY TAG ROUTE
          GET /api/products/by-tag?tag=... OR tags=a,b
        ===================================================== */
        fetchProductsByTag: async (params = {}) => {
  if (!BACKEND) {
    set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });
    return;
  }

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

    set((state) => ({
      allProducts: page === 1 ? incoming : [...state.allProducts, ...incoming],
      page,
     hasMoreFlag: incoming.length === limit,
      isLoading: false,
    }));
  } catch (e) {
    if (e?.name !== "AbortError") {
      set({ error: e.message || "Failed to load products" });
    }
    set({ isLoading: false });
  }
},


    fetchProductDetails: async (idOrSlug) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  // Abort previous request
  if (ctrl) {
    try {
      ctrl.abort();
    } catch (_) {
      // noop
    }
  }

  ctrl = new AbortController();
  const myId = ++reqId;

  set({ isLoading: true, error: null });

  const param = encodeURIComponent(String(idOrSlug || ""));
  const tryUrls = [
    `${BACKEND}/api/products/details/${param}`,
    `${BACKEND}/api/products/${param}`,
  ];

  try {
    for (let i = 0; i < tryUrls.length; i++) {
      const r = await fetch(tryUrls[i], {
        cache: "no-store",
        signal: ctrl.signal,
      });

      const j = await safeJson(r);

      // ✅ request was superseded
      if (myId !== reqId) return null;

      if (r.ok) {
        const prod = normalize(j);
        get().upsertProduct(prod);
        set({ isLoading: false });
        return prod;
      }

      // last URL failed
      if (i === tryUrls.length - 1) {
        throw new Error(j?.message || "Failed to load product");
      }
    }
  } catch (err) {
    // ✅ EXPECTED: AbortController cancellation
    if (err?.name === "AbortError") {
      return null; // silently ignore
    }

    console.error("❌ fetchProductDetails error:", err);

    if (myId === reqId) {
      set({
        error: err.message || "Failed to load product",
        isLoading: false,
      });
    }

    throw err;
  } finally {
    // only clear loading if this is still the active request
    if (myId === reqId) {
      set({ isLoading: false });
    }
  }

  return null;
},


        // Add this inside your zustand create store:
 fetchProductsByCategory: async (categorySlug) => {
  if (!categorySlug) return;

  // Reset pagination + fetch first page
  return get().fetchProducts({
    category: categorySlug,
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

          const param = encodeURIComponent(String(sku));
          const res = await fetch(`${BACKEND}/api/products/sku/${param}`, {
            cache: "no-store",
            signal: ctrl.signal,
          });
          const data = await safeJson(res);

          if (!res.ok) {
            set({ error: data?.message || "Failed to load product by SKU", isLoading: false });
            throw new Error(data?.message || "Failed to load product by SKU");
          }
          if (myId !== reqId) return { product: null, matchedVariant: null };

          const productDoc = data?.product || null;
          const matchedVariant = data?.matchedVariant || null;

          const product = productDoc ? normalize(productDoc) : null;
          if (product) get().upsertProduct(product);

          set({ isLoading: false });
          return { product, matchedVariant };
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
  const { page, hasMore, isLoading } = get();
  if (!hasMore || isLoading) return;

  get().fetchProducts({ page: page + 1 });
},


        clearError: () => set({ error: null }),
      }),
      {
        name: "product-store",
       partialize: () => ({}),
      }
    )
  );

