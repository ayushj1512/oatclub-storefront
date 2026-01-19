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
activeCollection: null,

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

  if (p.sort) setIf("sort", sortMap[p.sort] || p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  // ✅ DEFAULT: only published products
  // if caller explicitly passes isActive, respect it, else force true
  if (p.isActive != null) setIf("isActive", p.isActive);
  else setIf("isActive", true);

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

  if (p.tag) setIf("tag", p.tag);
  if (Array.isArray(p.tags) && p.tags.length) setIf("tags", p.tags.join(","));

  setIf("page", p.page);
  setIf("limit", p.limit);
  setIf("search", p.search);
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

  if (p.sort) setIf("sort", sortMap[p.sort] || p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  // ✅ DEFAULT: only published products
  if (p.isActive != null) setIf("isActive", p.isActive);
  else setIf("isActive", true);

  const q = qs.toString();
  return `${BACKEND}/api/products/by-tag${q ? `?${q}` : ""}`;
};

// ✅ NEW: build url for category route
const buildCategoryUrl = (category, p = {}) => {
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

  if (p.sort) setIf("sort", sortMap[p.sort] || p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  // ✅ DEFAULT: only published products
  if (p.isActive != null) setIf("isActive", p.isActive);
  else setIf("isActive", true);

  if (p.sku) setIf("sku", p.sku);

  const q = qs.toString();
  return `${BACKEND}/api/products/by-category/${encodeURIComponent(
    String(category || "")
  )}${q ? `?${q}` : ""}`;
};

// ✅ NEW: build url for collection route
const buildCollectionUrl = (collection, p = {}) => {
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

  if (p.sort) setIf("sort", sortMap[p.sort] || p.sort);
  else if (p.sortOption && sortMap[p.sortOption])
    setIf("sort", sortMap[p.sortOption]);

  if (p.isActive != null) setIf("isActive", p.isActive);
  else setIf("isActive", true);

  if (p.sku) setIf("sku", p.sku);

  const q = qs.toString();
  return `${BACKEND}/api/products/by-collection/${encodeURIComponent(
    String(collection || "")
  )}${q ? `?${q}` : ""}`;
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
    if (!BACKEND)
      return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

    const { page = 1, limit = get().limit } = params;
    const rawCategory = params.category ?? null;

    const cleaned = sanitize(params);
    const url = buildUrl({ ...cleaned, page, limit });

    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    const myId = ++reqId;

    const prevActiveCategory = get().activeCategory;
    const categoryChanged = rawCategory !== prevActiveCategory;

    // ✅ NEW: Reset when sort changes too
    const prevParams = get().lastParams || {};
    const sortChanged =
      String(cleaned.sort || "") !== String(prevParams.sort || "");
    const shouldReset = categoryChanged || sortChanged;

    set(() => ({
      isLoading: true,
      error: null,
      activeCategory: rawCategory,
      lastParams: cleaned,
      ...(shouldReset ? { allProducts: [], page: 1, hasMoreFlag: true } : {}),
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
          const key = `vil_${listId}_${incoming
            .slice(0, 15)
            .map((p) => p.id)
            .join("_")}`;

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
          const key = `view_category_${String(rawCategory)
            .trim()
            .toLowerCase()}`;

          const { _lastMetaCategoryKey, _lastMetaCategoryAt } = get();
          const tooSoon = _lastMetaCategoryAt && now - _lastMetaCategoryAt < 1500;
          const sameKey = _lastMetaCategoryKey && _lastMetaCategoryKey === key;

          if (!(sameKey && tooSoon)) {
            await trackMeta("ViewContent", {
              content_type: "product_group",
              content_ids: [String(rawCategory)],
              content_name: String(rawCategory),
              currency: "INR",
              content_ids_product: incoming
                .slice(0, 10)
                .map((p) => String(p?.id))
                .filter(Boolean),
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
      if (e?.name !== "AbortError")
        set({ error: e.message || "Failed to load products" });

      set({ isLoading: false });
    }
  },
  /* =====================================================
            ✅ NEW: FETCH BY Category ROUTE
          ===================================================== */


 fetchProductsByCollection: async (collectionSlugOrId, params = {}) => {
  if (!BACKEND)
    return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

  const collection = String(collectionSlugOrId || "").trim();
  if (!collection) return;

  const { page = 1, limit = get().limit } = params;

  // ✅ IMPORTANT: hit backend controller route
  // GET /api/products/by-collection/:collection
  const qs = new URLSearchParams();
  const setIf = (k, v) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  };

  setIf("page", page);
  setIf("limit", limit);
  setIf("search", params.search);
  setIf("category", params.category);
  setIf("tags", Array.isArray(params.tags) ? params.tags.join(",") : params.tags);
  setIf("minPrice", params.minPrice);
  setIf("maxPrice", params.maxPrice);

  const sortMap = {
    default: "",
    priceLowHigh: "price_asc",
    priceHighLow: "price_desc",
    newest: "newest",
    rating: "rating",
    popularity: "popularity",
  };

  if (params.sort) setIf("sort", sortMap[params.sort] || params.sort);
  else if (params.sortOption && sortMap[params.sortOption])
    setIf("sort", sortMap[params.sortOption]);

  // ✅ DEFAULT: only published products
  if (params.isActive != null) setIf("isActive", params.isActive);
  else setIf("isActive", true);

  if (params.sku) setIf("sku", params.sku);

  const q = qs.toString();
  const url = `${BACKEND}/api/products/by-collection/${encodeURIComponent(
    collection
  )}${q ? `?${q}` : ""}`;

  if (ctrl) ctrl.abort();
  ctrl = new AbortController();
  const myId = ++reqId;

  /* ✅ detect collection + sort change (clean) */
  const prevCollection = String(get().activeCollection || "").toLowerCase();
  const nextCollection = collection.toLowerCase();
  const collectionChanged = prevCollection !== nextCollection;

  const prevParams = get().lastParams || {};
  const sortChanged =
    String(params.sort || "") !== String(prevParams.sort || "");

  const shouldReset = page === 1 || collectionChanged || sortChanged;

  set(() => ({
    isLoading: true,
    error: null,
    activeCollection: collection,
    lastParams: { ...params, collection },
    ...(shouldReset ? { allProducts: [], page: 1, hasMoreFlag: true } : {}),
  }));

  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const data = await safeJson(res);

    if (!res.ok) throw new Error(data?.message || "Failed to load products");
    if (myId !== reqId) return;

    const incoming = uniqBySlug((data?.products || []).map(normalize));

    /* ✅ GA4: view_item_list */
    try {
      if (page === 1 && incoming.length) {
        const listId = `col_${nextCollection}`;
        const key = `vil_${listId}_${incoming
          .slice(0, 15)
          .map((p) => p.id)
          .join("_")}`;

        if (!shouldSkipGA4(get, set, key, 1500)) {
          pushEcomEvent("view_item_list", {
            item_list_id: listId,
            item_list_name: String(collection),
            items: incoming.slice(0, 50).map((p) => ga4Item(p, 1)),
          });
        }
      }
    } catch (e) {
      console.warn("📈 GA4 collection view_item_list failed", e);
    }

    /* 🧾 META: Collection View (deduped) */
    try {
      if (collection && page === 1 && collectionChanged) {
        const now = Date.now();
        const key = `view_collection_${nextCollection}`;

        const { _lastMetaCategoryKey, _lastMetaCategoryAt } = get();
        const tooSoon =
          _lastMetaCategoryAt && now - _lastMetaCategoryAt < 1500;
        const sameKey = _lastMetaCategoryKey === key;

        if (!(sameKey && tooSoon)) {
          await trackMeta("ViewContent", {
            content_type: "product_group",
            content_ids: [String(collection)],
            content_name: String(collection),
            currency: "INR",
            content_ids_product: incoming
              .slice(0, 10)
              .map((p) => String(p?.id))
              .filter(Boolean),
          });

          set({ _lastMetaCategoryKey: key, _lastMetaCategoryAt: now });
        }
      }
    } catch (e) {
      console.warn("🧾 Meta Collection View failed", e);
    }

    set((state) => ({
      allProducts: page === 1 ? incoming : [...state.allProducts, ...incoming],
      page,
      hasMoreFlag: incoming.length === limit,
      isLoading: false,
    }));
  } catch (e) {
    if (e?.name !== "AbortError")
      set({ error: e.message || "Failed to load products" });

    set({ isLoading: false });
  }
},






        /* =====================================================
            ✅ NEW: FETCH BY TAG ROUTE
            GET /api/products/by-tag?tag=... OR tags=a,b
          ===================================================== */
        fetchProductsByTag: async (params = {}) => {
    if (!BACKEND)
      return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

    const { page = 1, limit = get().limit } = params;

    // ✅ use same cleaned params tracking like fetchProducts
    const cleaned = { ...params };

    const url = buildTagUrl({ ...cleaned, page, limit });

    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    const myId = ++reqId;

    // ✅ NEW: detect tag change + sort change
    const prevParams = get().lastParams || {};

    const tagKey = String(
      cleaned?.tag || (Array.isArray(cleaned?.tags) ? cleaned.tags.join(",") : "")
    )
      .trim()
      .toLowerCase();

    const prevTagKey = String(
      prevParams?.tag || (Array.isArray(prevParams?.tags) ? prevParams.tags.join(",") : "")
    )
      .trim()
      .toLowerCase();

    const tagChanged = tagKey !== prevTagKey;

    const sortChanged =
      String(cleaned.sort || "") !== String(prevParams.sort || "");

    const shouldReset = page === 1 || tagChanged || sortChanged;

    set(() => ({
      isLoading: true,
      error: null,
      lastParams: cleaned,
      ...(shouldReset ? { allProducts: [], page: 1, hasMoreFlag: true } : {}),
    }));

    try {
      const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      const data = await safeJson(res);

      if (!res.ok) throw new Error(data?.message || "Failed to load products");
      if (myId !== reqId) return;

      const incoming = uniqBySlug((data?.products || []).map(normalize));

      /* ✅ GA4: view_item_list for tag page (only page 1) */
      try {
        if (page === 1 && incoming.length) {
          const tagName =
            cleaned?.tag ||
            (Array.isArray(cleaned?.tags) ? cleaned.tags.join(",") : "tag");

          const listId = `tag_${String(tagName).trim().toLowerCase()}`;
          const key = `vil_${listId}_${incoming
            .slice(0, 15)
            .map((p) => p.id)
            .join("_")}`;

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
      if (e?.name !== "AbortError")
        set({ error: e.message || "Failed to load products" });

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
      fetchProductsByCategory: async (categorySlugOrId, params = {}) => {
  if (!BACKEND)
    return set({ error: "NEXT_PUBLIC_BACKEND_URL missing", isLoading: false });

  const category = String(categorySlugOrId || "").trim();
  if (!category) return;

  const { page = 1, limit = get().limit } = params;

  const url = buildCategoryUrl(category, { ...params, page, limit });

  if (ctrl) ctrl.abort();
  ctrl = new AbortController();
  const myId = ++reqId;

  // ✅ reset logic same like tag/category
  const prevActiveCategory = get().activeCategory;
  const categoryChanged = String(prevActiveCategory || "") !== category;

  const prevParams = get().lastParams || {};
  const sortChanged =
    String(params.sort || "") !== String(prevParams.sort || "");

  const shouldReset = page === 1 || categoryChanged || sortChanged;

  set(() => ({
    isLoading: true,
    error: null,
    activeCategory: category,
    lastParams: params,
    ...(shouldReset ? { allProducts: [], page: 1, hasMoreFlag: true } : {}),
  }));

  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const data = await safeJson(res);

    if (!res.ok) throw new Error(data?.message || "Failed to load products");
    if (myId !== reqId) return;

    const incoming = uniqBySlug((data?.products || []).map(normalize));

    /* ✅ GA4 view_item_list */
    try {
      if (page === 1 && incoming.length) {
        const listId = `cat_${category}`;
        const key = `vil_${listId}_${incoming
          .slice(0, 15)
          .map((p) => p.id)
          .join("_")}`;

        if (!shouldSkipGA4(get, set, key, 1500)) {
          pushEcomEvent("view_item_list", {
            item_list_id: listId,
            item_list_name: String(category),
            items: incoming.slice(0, 50).map((p) => ga4Item(p, 1)),
          });
        }
      }
    } catch (e) {
      console.warn("📈 GA4 category view_item_list failed", e);
    }

    /* 🧾 META category view */
    try {
      if (category && page === 1 && categoryChanged) {
        const now = Date.now();
        const key = `view_category_${category.toLowerCase()}`;

        const { _lastMetaCategoryKey, _lastMetaCategoryAt } = get();
        const tooSoon =
          _lastMetaCategoryAt && now - _lastMetaCategoryAt < 1500;
        const sameKey = _lastMetaCategoryKey === key;

        if (!(sameKey && tooSoon)) {
          await trackMeta("ViewContent", {
            content_type: "product_group",
            content_ids: [category],
            content_name: category,
            currency: "INR",
            content_ids_product: incoming
              .slice(0, 10)
              .map((p) => String(p?.id))
              .filter(Boolean),
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
    if (e?.name !== "AbortError")
      set({ error: e.message || "Failed to load products" });

    set({ isLoading: false });
  }
},

// ✅ PATCH ONLY: add this inside your zustand store (same level as fetchProductDetails)

fetchProductDetailsByCode: async (productCode) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");
  if (!productCode) throw new Error("productCode missing");

  // ✅ keep same abort behavior as fetchProductDetails
  if (ctrl) {
    try { ctrl.abort(); } catch {}
  }

  ctrl = new AbortController();
  const myId = ++reqId;

  set({ isLoading: true, error: null });

  const code = encodeURIComponent(String(productCode || "").trim());
  const url = `${BACKEND}/api/products/code/${code}`;

  try {
    const r = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const j = await safeJson(r);
    if (myId !== reqId) return null;

    if (!r.ok) throw new Error(j?.message || "Failed to load product by code");

    const prod = normalize(j);
    get().upsertProduct(prod);

    // ✅ (optional) GA4 view_item (same like fetchProductDetails)
    try {
      const k = `vi_${prod?.id || prod?.productCode || code}`;
      if (!shouldSkipGA4(get, set, k, 1500)) {
        pushEcomEvent("view_item", {
          currency: prod?.currency || "INR",
          value: Number(prod?.price || 0),
          items: [ga4Item(prod, 1)],
        });
      }
    } catch (e) {
      console.warn("📈 GA4 view_item (code) failed", e);
    }

    // ✅ (optional) META ViewContent (same like fetchProductDetails)
    try {
      const now = Date.now();
      const key = `view_product_${prod?.id || prod?.productCode || code}`;
      const { _lastMetaViewKey, _lastMetaViewAt } = get();

      const tooSoon = _lastMetaViewAt && now - _lastMetaViewAt < 1500;
      const sameKey = _lastMetaViewKey && _lastMetaViewKey === key;

      if (!(sameKey && tooSoon)) {
        await trackMeta("ViewContent", {
          content_type: "product",
          content_ids: prod?.id ? [String(prod.id)] : [],
          contents: prod?.id
            ? [{ id: String(prod.id), quantity: 1, item_price: Number(prod.price || 0) }]
            : [],
          value: Number(prod.price || 0),
          currency: prod.currency || "INR",
          content_name: prod.name || "",
          content_category: prod.category || "",
        });

        set({ _lastMetaViewKey: key, _lastMetaViewAt: now });
      }
    } catch (e) {
      console.warn("🧾 Meta ViewContent (code) failed", e);
    }

    set({ isLoading: false });
    return prod;
  } catch (err) {
    if (err?.name === "AbortError") return null;

    if (myId === reqId) {
      set({
        error: err.message || "Failed to load product by code",
        isLoading: false,
      });
    }

    throw err;
  } finally {
    if (myId === reqId) set({ isLoading: false });
  }
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

  fetchProductDetailsSafe: async (idOrSlug) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const controller = new AbortController();
  const param = encodeURIComponent(String(idOrSlug || ""));
  const tryUrls = [
    `${BACKEND}/api/products/details/${param}`,
    `${BACKEND}/api/products/${param}`,
  ];

  try {
    for (let i = 0; i < tryUrls.length; i++) {
      const r = await fetch(tryUrls[i], { cache: "no-store", signal: controller.signal });
      const j = await safeJson(r);

      if (r.ok) {
        const doc = j?.product || j?.data || j;
        const prod = normalize(doc);

        if (!prod?.id) return null;

        get().upsertProduct(prod);
        return prod;
      }

      if (i === tryUrls.length - 1) throw new Error(j?.message || "Failed to load product");
    }
  } catch {
    return null;
  }
},

fetchProductDetailsPerfect: async (idOrSlugOrObj, opts = {}) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const { force = false } = opts;

  // ✅ Step 1: Extract safe param from anything
  const raw =
    idOrSlugOrObj?._id ||
    idOrSlugOrObj?.id ||
    idOrSlugOrObj?.productId?._id ||
    idOrSlugOrObj?.productId?.id ||
    idOrSlugOrObj?.productId ||
    idOrSlugOrObj;

  const param = String(raw || "").trim();
  if (!param) return null;

  // ✅ Step 2: Check local cache (zustand)
  const cached = (get().allProducts || []).find(
    (p) => String(p?.id) === param || String(p?.slug) === param
  );

  if (cached && !force) return cached;

  // ✅ Step 3: Fetch without breaking other requests (no global abort)
  const controller = new AbortController();

  const urls = [
    `${BACKEND}/api/products/details/${encodeURIComponent(param)}`,
    `${BACKEND}/api/products/${encodeURIComponent(param)}`,
    `${BACKEND}/api/products/sku/${encodeURIComponent(param)}`,
  ];

  try {
    for (let i = 0; i < urls.length; i++) {
      const res = await fetch(urls[i], {
        cache: "no-store",
        signal: controller.signal,
      });

      const j = await safeJson(res);

      if (!res.ok) continue;

      // ✅ Step 4: Handle all backend response shapes
      const doc = j?.product || j?.data || j;

      // ✅ sku route returns {product, matchedVariant}
      const realDoc = doc?.product ? doc.product : doc;

      const prod = normalize(realDoc);

      if (!prod?.id) continue;

      // ✅ Step 5: store/update cache
      get().upsertProduct(prod);

      return prod;
    }

    return null;
  } catch (err) {
    if (err?.name === "AbortError") return null;
    console.error("❌ fetchProductDetailsPerfect error:", err);
    return null;
  }
},


/* =====================================================
   ✅ NEW: FETCH MULTIPLE PRODUCTS BY IDS (single fetch)
   POST /api/products/by-ids
   body: { ids: ["id1","id2"] } OR { ids: "id1,id2" }
===================================================== */
fetchProductsByIds: async (ids = [], opts = {}) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  // ✅ normalize ids input
  const list = Array.isArray(ids)
    ? ids
    : typeof ids === "string"
      ? ids.split(",").map((x) => x.trim()).filter(Boolean)
      : [];

  if (!list.length) return [];

  const { mergeIntoAllProducts = true } = opts;

  // ❗ NOTE: DO NOT abort global ctrl here, because it may cancel other list fetches
  const controller = new AbortController();

  try {
    const res = await fetch(`${BACKEND}/api/products/by-ids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: list }),
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || "Failed to load products by ids");

    const incoming = Array.isArray(data?.products) ? data.products : [];
    const normalized = incoming.map(normalize);

    // ✅ update cache
    if (mergeIntoAllProducts) {
      normalized.forEach((p) => get().upsertProduct(p));
    }

    return normalized;
  } catch (err) {
    if (err?.name === "AbortError") return [];
    console.error("❌ fetchProductsByIds error:", err);
    set({ error: err.message || "Failed to load products by ids" });
    return [];
  }
},


/* =====================================================
   ✅ NEW: FETCH MULTIPLE PRODUCTS BY PRODUCT CODES (single fetch)
   GET  /api/products/by-codes?codes=00229,00230
   POST /api/products/by-codes  body: { codes: ["00229","00230"] } OR { codes: "00229,00230" }
===================================================== */
fetchProductsByCodes: async (codes = [], opts = {}) => {
  if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  // ✅ normalize input (array/string)
  const list = Array.isArray(codes)
    ? codes
    : typeof codes === "string"
      ? codes.split(",").map((x) => String(x).trim()).filter(Boolean)
      : [];

  if (!list.length) return [];

  const { mergeIntoAllProducts = true, method = "POST" } = opts;

  // ❗ NOTE: DO NOT abort global ctrl here (it may cancel other list fetches)
  const controller = new AbortController();

  try {
    let res;

    if (String(method).toUpperCase() === "GET") {
      const qs = new URLSearchParams();
      qs.set("codes", list.join(","));

      res = await fetch(`${BACKEND}/api/products/by-codes?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
    } else {
      res = await fetch(`${BACKEND}/api/products/by-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: list }),
        cache: "no-store",
        signal: controller.signal,
      });
    }

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.message || "Failed to load products by codes");
    }

    const incoming = Array.isArray(data?.products) ? data.products : [];
    const normalized = incoming.map(normalize);

    // ✅ update cache
    if (mergeIntoAllProducts) {
      normalized.forEach((p) => get().upsertProduct(p));
    }

    return normalized;
  } catch (err) {
    if (err?.name === "AbortError") return [];
    console.error("❌ fetchProductsByCodes error:", err);
    set({ error: err.message || "Failed to load products by codes" });
    return [];
  }
},



        upsertProduct: (product) => {
  const p = product?.source === "backend" ? product : normalize(product);
  const all = get().allProducts || [];

  const pid = String(p?.id || p?.raw?._id || "").trim();
  if (!pid) return;

  const i = all.findIndex((x) => String(x?.id) === pid);

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
