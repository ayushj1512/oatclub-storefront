"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import { AnimatePresence, motion } from "framer-motion";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "priceLowHigh" },
  { label: "Price: High → Low", value: "priceHighLow" },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
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
    p?.dateCreated ||   // ✅ ADD THIS
    p?.date;

  const ms = new Date(t).getTime();
  return Number.isFinite(ms) ? ms : 0;
};


/* ============================================================
   WORKING PREMIUM PRICE RANGE SLIDER
   - Both thumbs work ✅
   - Manual entry ✅
============================================================ */
function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}) {
  const range = max - min || 1;

  const left = ((valueMin - min) / range) * 100;
  const right = ((valueMax - min) / range) * 100;

  const handleMin = (v) => {
    const val = clamp(Number(v), min, valueMax - 1);
    onChangeMin(val);
  };

  const handleMax = (v) => {
    const val = clamp(Number(v), valueMin + 1, max);
    onChangeMax(val);
  };

  return (
    <div className="mt-3">
      {/* Manual Boxes */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="number"
          value={valueMin}
          min={min}
          max={valueMax - 1}
          onChange={(e) => handleMin(e.target.value)}
          className="w-24 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 outline-none border border-zinc-200"
        />

        <input
          type="number"
          value={valueMax}
          min={valueMin + 1}
          max={max}
          onChange={(e) => handleMax(e.target.value)}
          className="w-24 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 text-right outline-none border border-zinc-200"
        />
      </div>

      {/* Slider */}
      <div className="relative mt-4 h-10">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-zinc-200" />

        {/* Filled Range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-blue-500"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
          }}
        />

        {/* Range Inputs (IMPORTANT FIX ✅) */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => handleMin(e.target.value)}
          className="absolute w-full top-0 left-0 h-10 cursor-pointer bg-transparent"
          style={{ zIndex: valueMin > max - 100 ? 5 : 6 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => handleMax(e.target.value)}
          className="absolute w-full top-0 left-0 h-10 cursor-pointer bg-transparent"
          style={{ zIndex: 7 }}
        />

        {/* Knobs */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-blue-600 shadow-md"
          style={{ left: `calc(${left}% - 10px)` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-blue-600 shadow-md"
          style={{ left: `calc(${right}% - 10px)` }}
        />
      </div>

      <div className="mt-2 text-xs text-zinc-500">
        Range: ₹{valueMin} – ₹{valueMax}
      </div>
    </div>
  );
}

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

  // Applied Filters
  const [onlyInStock, setOnlyInStock] = useState(true);
  const facets = useMemo(() => buildFacets(allProducts || []), [allProducts]);

  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // Draft Filters
  const [draftOnlyInStock, setDraftOnlyInStock] = useState(true);
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

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

  // Init price
  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);

    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  // Fetch products
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

  // Apply Filters
  const applyFilters = () => {
    setOnlyInStock(draftOnlyInStock);
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  };

  // Reset
  const resetFilters = useCallback(() => {
    setOnlyInStock(true);
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);

    setDraftOnlyInStock(true);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  /* ============================================================
     FILTER + SORT LIST ✅ (FIXED SORTING)
  ============================================================ */
 const list = useMemo(() => {
  let arr = Array.isArray(allProducts) ? [...allProducts] : [];

  const getPrice = (p) =>
    Number(String(p?.price ?? "").replace(/[^\d.]/g, "")) || 0;

  // ✅ filter: stock
  if (onlyInStock) {
    arr = arr.filter((p) => getStockCount(p) > 0);
  }

  // ✅ filter: price
  const lo = priceMin ?? facets.priceMin;
  const hi = priceMax ?? facets.priceMax;
  const minV = Math.min(lo, hi);
  const maxV = Math.max(lo, hi);

  arr = arr.filter((p) => {
    const pr = getPrice(p);
    if (!Number.isFinite(pr) || pr === 0) return true;
    return pr >= minV && pr <= maxV;
  });

  // ✅ SORTING
  if (sort === "priceLowHigh") {
    arr.sort((a, b) => getPrice(a) - getPrice(b));
  } else if (sort === "priceHighLow") {
    arr.sort((a, b) => getPrice(b) - getPrice(a));
  } else if (sort === "newest") {
    arr.sort((a, b) => getTimeValue(b) - getTimeValue(a)); // ✅ use global
  }

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

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (!onlyInStock) n++;
    if (priceMin !== facets.priceMin || priceMax !== facets.priceMax) n++;
    return n;
  }, [onlyInStock, priceMin, priceMax, facets.priceMin, facets.priceMax]);

  // Infinite scroll
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (isLoading) return;
        if (loadingMoreRef.current) return;
        if (!hasMore()) return;

        loadingMoreRef.current = true;
        loadMore();

        setTimeout(() => {
          loadingMoreRef.current = false;
        }, 350);
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // Lock scroll
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [drawerOpen]);

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

  // Slider limits
  const sliderMin = facets.priceMin ?? 0;
  const sliderMax = facets.priceMax ?? 0;

  const safeDraftMin = draftPriceMin ?? sliderMin;
  const safeDraftMax = draftPriceMax ?? sliderMax;

  const changeMin = (v) => {
    const val = clamp(v, sliderMin, safeDraftMax - 1);
    setDraftPriceMin(val);
  };

  const changeMax = (v) => {
    const val = clamp(v, safeDraftMin + 1, sliderMax);
    setDraftPriceMax(val);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* BACKDROP */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.button
            aria-label="Close filters"
            className="fixed left-0 right-0 bottom-0 z-40 bg-black/40"
            style={{ top: drawerTop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      {/* DRAWER */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.aside
            className="fixed left-0 z-50 w-[320px] max-w-[85vw] bg-white shadow-2xl border-r border-zinc-200"
            style={{ top: drawerTop, height: drawerHeight }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div className="h-full flex flex-col">
              <div className="px-4 py-4 border-b border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-zinc-900">
                    Filters
                  </div>
                  <div className="text-xs text-zinc-500">
                    Choose what you want to see
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Availability */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-900">
                    Availability
                  </div>
                  <label className="mt-3 flex items-center gap-3 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={draftOnlyInStock}
                      onChange={(e) => setDraftOnlyInStock(e.target.checked)}
                    />
                    Show only available items
                  </label>
                </div>

                {/* Premium Price Slider */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-900">
                    Filter by Price
                  </div>

                  <PriceRangeSlider
                    min={sliderMin}
                    max={sliderMax}
                    valueMin={safeDraftMin}
                    valueMax={safeDraftMax}
                    onChangeMin={changeMin}
                    onChangeMax={changeMax}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-zinc-200 flex items-center justify-between gap-3">
                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* MAIN */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 capitalize">
              {category || "Category"}
            </h1>
            <p className="text-sm text-zinc-600">
              {showInitialLoading ? "Loading..." : `${inStockCount} products`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDraftOnlyInStock(onlyInStock);
                setDraftPriceMin(priceMin ?? facets.priceMin);
                setDraftPriceMax(priceMax ?? facets.priceMax);
                setDrawerOpen(true);
              }}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
            >
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error ? (
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
        ) : null}

        {/* Products */}
        <div className="mt-6">
          <ProductGrid title="" products={list} loading={showInitialLoading} />
        </div>

        {/* Load More */}
        {!error && (allProducts?.length || 0) > 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore() ? (
              <>
                <button
                  onClick={() => loadMore()}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>
                <div className="text-xs text-zinc-500">
                  Showing {list.length} items{" "}
                  {hasMore()
                    ? " — more items will load as you scroll"
                    : " — end"}
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-600">You’ve reached the end.</div>
            )}
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-1 w-full" />
      </div>
    </div>
  );
}
