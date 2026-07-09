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
  const prices = products
    .map((p) => Number(p?.price))
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);

  return {
    priceMin: prices[0] || 0,
    priceMax: prices[prices.length - 1] || 0,
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
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const hasMore = useProductStore((s) => s.hasMore);
  const clearError = useProductStore((s) => s.clearError);
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

  const [displayProducts, setDisplayProducts] = useState([]);
  const [isInitialFetching, setIsInitialFetching] = useState(false);

  const lastFetchRef = useRef("");
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const facets = useMemo(() => buildFacets(allProducts || []), [allProducts]);

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

  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  useLayoutEffect(() => {
    if (!ready) return;

    clearError?.();
    setDisplayProducts([]);
    setIsInitialFetching(true);
  }, [ready, sort, clearError]);

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

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setIsInitialFetching(false);
      return;
    }

    setDisplayProducts(Array.isArray(allProducts) ? allProducts : []);
    setIsInitialFetching(false);
  }, [isLoading, allProducts, error]);

  const applyFilters = useCallback(() => {
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  }, [draftPriceMin, draftPriceMax]);

  const resetFilters = useCallback(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

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

    if (sort === "priceLowHigh") arr.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "priceHighLow") arr.sort((a, b) => getPrice(b) - getPrice(a));
    if (sort === "newest") arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

    return arr;
  }, [displayProducts, priceMin, priceMax, facets.priceMin, facets.priceMax, sort]);

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

    setTimeout(() => {
      loadingMoreRef.current = false;
    }, 350);
  }, [ready, isLoading, hasMore, fetchProducts, lastParams, page, sort]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreAll();
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [loadMoreAll]);

  const showInitialLoading =
    (isLoading || isInitialFetching) && displayProducts.length === 0;

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
    <div className="min-h-screen bg-white">
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

      <div className="w-full px-1 py-3 sm:px-2 sm:py-4 md:px-3">
        <div className="mb-1 px-1">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            {pageTitle}
          </h1>
        </div>

        <FilterSortBar
          category={pageTitle}
          showInitialLoading={showInitialLoading}
          sort={sort}
          setSort={setSort}
          sortOptions={SORT_OPTIONS}
          hideFilterButton
        />

        {!showInitialLoading && error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
            <button
              onClick={retry}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-2">
          <ProductGrid
            key={`all-clothing-${sort}`}
            products={list}
            loading={showInitialLoading}
          />
        </div>

        {!error && displayProducts.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-2">
            {hasMore() ? (
              <>
                <button
                  onClick={loadMoreAll}
                  disabled={isLoading}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>

                <div className="text-xs text-zinc-500">
                  Showing {list.length} items
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