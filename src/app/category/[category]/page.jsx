"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
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

const toNum = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

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

const getStockCount = (p) => {
  const productStock = toNum(p?.stock_quantity ?? p?.stock, 0);
  const variantStock = Array.isArray(p?.variants)
    ? Math.max(...p.variants.map((v) => toNum(v?.stock, 0)))
    : 0;

  return Math.max(productStock, variantStock);
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

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category;
  const ready = Boolean(category);

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const loadMore = useProductStore((s) => s.loadMore);
  const hasMore = useProductStore((s) => s.hasMore);
  const clearError = useProductStore((s) => s.clearError);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  // ✅ Applied filters
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // ✅ Draft filters (drawer ke liye)
  const [draftOnlyInStock, setDraftOnlyInStock] = useState(true);
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

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

  // ✅ Fetch products when category/sort changes
  useEffect(() => {
    if (!ready) return;

    const key = JSON.stringify({ category, sort });
    if (lastFetchRef.current === key) return;
    lastFetchRef.current = key;

    clearError?.();
    setDrawerOpen(false);

    setOnlyInStock(true);
    setDraftOnlyInStock(true);

    fetchProducts({
      category,
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, category, sort, fetchProducts, clearError]);

  // ✅ Apply filters
  const applyFilters = () => {
    setOnlyInStock(draftOnlyInStock);
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  };

  // ✅ Reset filters
  const resetFilters = useCallback(() => {
    setOnlyInStock(true);
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftOnlyInStock(true);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  // ✅ Filter + sort list
  const list = useMemo(() => {
    let arr = Array.isArray(allProducts) ? [...allProducts] : [];

    const getPrice = (p) =>
      Number(String(p?.price ?? "").replace(/[^\d.]/g, "")) || 0;

    if (onlyInStock) arr = arr.filter((p) => getStockCount(p) > 0);

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
    else if (sort === "priceHighLow")
      arr.sort((a, b) => getPrice(b) - getPrice(a));
    else if (sort === "newest")
      arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

    return arr;
  }, [
    allProducts,
    onlyInStock,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
    sort,
  ]);

  const inStockCount =
    allProducts?.filter((p) => getStockCount(p) > 0)?.length || 0;

  // ✅ Infinite scroll
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoading || loadingMoreRef.current || !hasMore()) return;
        loadingMoreRef.current = true;
        loadMore();
        setTimeout(() => (loadingMoreRef.current = false), 350);
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const showInitialLoading = isLoading && (allProducts?.length || 0) === 0;

  const retry = useCallback(() => {
    if (!ready) return;
    clearError?.();
    lastFetchRef.current = "";
    fetchProducts({
      category,
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, category, sort, clearError, fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ✅ Drawer (still there but button hidden) */}
      <FiltersDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        drawerTop={drawerTop}
        drawerHeight={drawerHeight}
        facets={facets}
        draftOnlyInStock={draftOnlyInStock}
        setDraftOnlyInStock={setDraftOnlyInStock}
        draftPriceMin={draftPriceMin}
        setDraftPriceMin={setDraftPriceMin}
        draftPriceMax={draftPriceMax}
        setDraftPriceMax={setDraftPriceMax}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        {/* ✅ Bar (FILTER BUTTON HIDDEN) */}
        <FilterSortBar
          category={category}
          inStockCount={inStockCount}
          showInitialLoading={showInitialLoading}
          sort={sort}
          setSort={setSort}
          sortOptions={SORT_OPTIONS}
          hideFilterButton={true}   // ✅ IMPORTANT: hides filter button
        />

        {/* Error */}
        {error && (
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
          <ProductGrid title="" products={list} loading={showInitialLoading} />
        </div>

        {/* Load More */}
        {!error && (allProducts?.length || 0) > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore() ? (
              <>
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>
                <div className="text-xs text-zinc-500">
                  Showing {list.length} items — {hasMore() ? "more items will load as you scroll" : "end"}
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
