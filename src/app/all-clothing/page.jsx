"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";

import FiltersDrawer from "@/components/category/FiltersDrawer";
import FilterSortBar from "@/components/category/FilterSortBar";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "priceLowHigh" },
  { label: "Price: High → Low", value: "priceHighLow" },
];

const buildFacets = (products = []) => {
  const prices = [];
  for (const p of products || []) {
    const pr = Number(p?.price);
    if (Number.isFinite(pr) && pr > 0) prices.push(pr);
  }
  prices.sort((a, b) => a - b);

  return {
    priceMin: prices.length ? prices[0] : 0,
    priceMax: prices.length ? prices[prices.length - 1] : 0,
  };
};

const getTimeValue = (p) => {
  const t =
    p?.createdAt ||
    p?.updatedAt ||
    p?.created_at ||
    p?.updated_at ||
    p?.dateCreated ||
    p?.date;

  const ms = new Date(t).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

export default function AllClothingPage() {
  const ready = true;
  const pageTitle = "All Clothing";

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);

  // ✅ MAIN fetch (no category)
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  const hasMore = useProductStore((s) => s.hasMore);
  const clearError = useProductStore((s) => s.clearError);

  // ✅ needed for load more
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  // ✅ Applied filters (ONLY price now)
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // ✅ Draft filters (ONLY price now)
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

  // ✅ prevents flashing
  const [displayProducts, setDisplayProducts] = useState([]);
  const [isInitialFetching, setIsInitialFetching] = useState(false);

  const facets = useMemo(() => buildFacets(allProducts || []), [allProducts]);
  const lastFetchRef = useRef("");

  const drawerTop = useMemo(
    () =>
      `calc(var(--app-topbar-h,0px) + var(--app-header-h,0px) + env(safe-area-inset-top,0px))`,
    []
  );

  const drawerHeight = useMemo(
    () =>
      `calc(100dvh - var(--app-topbar-h,0px) - var(--app-header-h,0px) - env(safe-area-inset-top,0px))`,
    []
  );

  // ✅ Init price once facets update
  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  /**
   * ✅ Clear UI BEFORE PAINT on sort change
   */
  useLayoutEffect(() => {
    if (!ready) return;

    clearError?.();
    setDisplayProducts([]);
    setIsInitialFetching(true);
  }, [ready, sort, clearError]);

  // ✅ Fetch products on mount + when sort changes
  useEffect(() => {
    if (!ready) return;

    const key = JSON.stringify({ route: "all-clothing", sort });
    if (lastFetchRef.current === key) return;
    lastFetchRef.current = key;

    clearError?.();
    setDrawerOpen(false);

    fetchProducts({
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, sort, fetchProducts, clearError]);

  // ✅ Sync store -> displayProducts only after loading ends
  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setIsInitialFetching(false);
      return;
    }

    setDisplayProducts(Array.isArray(allProducts) ? allProducts : []);
    setIsInitialFetching(false);
  }, [isLoading, allProducts, error]);

  // ✅ Apply filters
  const applyFilters = () => {
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  };

  // ✅ Reset filters
  const resetFilters = useCallback(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  // ✅ Filter + sort list (client-side only) — NO STOCK FILTERING
  const list = useMemo(() => {
    let arr = Array.isArray(displayProducts) ? [...displayProducts] : [];

    const getPrice = (p) =>
      Number(String(p?.price ?? "").replace(/[^\d.]/g, "")) || 0;

    const lo = priceMin ?? facets.priceMin;
    const hi = priceMax ?? facets.priceMax;
    const minV = Math.min(lo, hi);
    const maxV = Math.max(lo, hi);

    arr = arr.filter((p) => {
      const pr = getPrice(p);
      if (!Number.isFinite(pr) || pr === 0) return true;
      return pr >= minV && pr <= maxV;
    });

    // ✅ your backend already sorts, but we keep client sort too
    if (sort === "priceLowHigh") arr.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sort === "priceHighLow")
      arr.sort((a, b) => getPrice(b) - getPrice(a));
    else if (sort === "newest")
      arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

    return arr;
  }, [displayProducts, priceMin, priceMax, facets.priceMin, facets.priceMax, sort]);

  // ✅ Load more (still uses fetchProducts)
  const loadingMoreRef = useRef(false);

  const loadMoreAll = useCallback(() => {
    if (!ready) return;
    if (isLoading || loadingMoreRef.current || !hasMore()) return;

    loadingMoreRef.current = true;

    fetchProducts({
      ...(lastParams || {}),
      page: (page || 1) + 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
    });

    setTimeout(() => (loadingMoreRef.current = false), 350);
  }, [ready, isLoading, hasMore, fetchProducts, lastParams, page, sort]);

  // ✅ Infinite scroll
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadMoreAll();
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [loadMoreAll]);

  const showInitialLoading =
    (isLoading || isInitialFetching) && (displayProducts?.length || 0) === 0;

  const retry = useCallback(() => {
    if (!ready) return;

    clearError?.();
    lastFetchRef.current = "";

    setDisplayProducts([]);
    setIsInitialFetching(true);

    fetchProducts({
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, sort, clearError, fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ✅ Drawer (stock props removed) */}
      <FiltersDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        drawerTop={drawerTop}
        drawerHeight={drawerHeight}
        facets={facets}
        draftPriceMin={draftPriceMin}
        setDraftPriceMin={setDraftPriceMin}
        draftPriceMax={draftPriceMax}
        setDraftPriceMax={setDraftPriceMax}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* ✅ Heading */}
        <div className="mb-2 sm:mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            {pageTitle}
          </h1>
        </div>

        {/* ✅ Sort Bar (inStockCount removed) */}
        <FilterSortBar
          category={pageTitle}
          showInitialLoading={showInitialLoading}
          sort={sort}
          setSort={setSort}
          sortOptions={SORT_OPTIONS}
          hideFilterButton={true}
        />

        {!showInitialLoading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm mt-1">{error}</div>
            <button
              onClick={retry}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products */}
        <div className="mt-6">
          <ProductGrid
            key={`all-clothing-${sort}`}
            products={list}
            loading={showInitialLoading}
          />
        </div>

        {/* Load More */}
        {!error && (displayProducts?.length || 0) > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore() ? (
              <>
                <button
                  onClick={loadMoreAll}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>
                <div className="text-xs text-zinc-500">
                  Showing {list.length} items —{" "}
                  {hasMore() ? "more items will load as you scroll" : "end"}
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-600">You’ve reached the end.</div>
            )}
          </div>
        )}

        <div ref={sentinelRef} className="h-1 w-full" />
      </div>
    </div>
  );
}
