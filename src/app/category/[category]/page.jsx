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
  const tags = new Set();
  for (const p of products || []) {
    const pr = Number(p?.price);
    if (Number.isFinite(pr)) prices.push(pr);
    for (const t of Array.isArray(p?.tags) ? p.tags : []) {
      const s = String(t || "").trim().toLowerCase();
      if (s) tags.add(s);
    }
  }
  prices.sort((a, b) => a - b);
  return {
    priceMin: prices.length ? prices[0] : 0,
    priceMax: prices.length ? prices[prices.length - 1] : 0,
    tags: Array.from(tags).sort(),
  };
};

export default function CategoryPage() {
  const { category } = useParams() || {};

  const {
  allProducts,
  isLoading,
  error,
  fetchProducts,
  loadMore,
  hasMore,
  clearError,
} = useProductStore();


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest"); // ✅ match API sort
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [selectedTags, setSelectedTags] = useState(() => new Set());

  const facets = useMemo(() => buildFacets(allProducts || []), [allProducts]);
  const [priceMin, setPriceMin] = useState(null);
const [priceMax, setPriceMax] = useState(null);


  // ✅ prevent duplicate fetch in dev StrictMode
  const lastFetchRef = useRef("");

  const drawerTop = useMemo(
    () => `calc(var(--app-topbar-h,0px) + var(--app-header-h,0px) + env(safe-area-inset-top,0px))`,
    []
  );
  const drawerHeight = useMemo(
    () => `calc(100dvh - var(--app-topbar-h,0px) - var(--app-header-h,0px) - env(safe-area-inset-top,0px))`,
    []
  );

  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);



  useEffect(() => {
  if (!category) return;

  clearError?.();

  // reset UI filters on category change
  setDrawerOpen(false);
  setOnlyInStock(true);
  setSelectedTags(new Set());

  fetchProducts({
    category,
    isActive: true,
    page: 1,
    limit: PAGE_SIZE,
    sort,
  });
}, [category, sort]);



const list = useMemo(() => {
  let arr = Array.isArray(allProducts) ? [...allProducts] : [];

  if (onlyInStock) {
    arr = arr.filter((p) => {
      if (p?.stock_status) return p.stock_status === "instock";
      if (typeof p?.in_stock === "boolean") return p.in_stock;
      if (typeof p?.stock_quantity === "number") return p.stock_quantity > 0;
      if (typeof p?.isInStock === "boolean") return p.isInStock;
      return true;
    });
  }

  const lo = priceMin ?? facets.priceMin;
  const hi = priceMax ?? facets.priceMax;
  const minV = Math.min(lo, hi);
  const maxV = Math.max(lo, hi);

  arr = arr.filter((p) => {
    const pr = Number(p?.price);
    return Number.isFinite(pr) && pr >= minV && pr <= maxV;
  });

  if (selectedTags.size > 0) {
    arr = arr.filter((p) => {
      const tags = Array.isArray(p?.tags)
        ? p.tags.map((t) => String(t).toLowerCase())
        : [];
      for (const need of selectedTags) {
        if (!tags.includes(need)) return false;
      }
      return true;
    });
  }

  return arr;
}, [
  allProducts,
  onlyInStock,
  priceMin,
  priceMax,
  facets.priceMin,
  facets.priceMax,
  selectedTags,
]);



  const totalAvailable = allProducts.length;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (!onlyInStock) n++;
    if (selectedTags.size) n++;
    if (priceMin !== facets.priceMin || priceMax !== facets.priceMax) n++;
    return n;
  }, [onlyInStock, selectedTags, priceMin, priceMax, facets.priceMin, facets.priceMax]);

  const resetFilters = useCallback(() => {
    setOnlyInStock(true);
    setSelectedTags(new Set());
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  const toggleTag = (tag) => {
    const t = String(tag || "").trim().toLowerCase();
    if (!t) return;
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  // infinite scroll
  const loadingMoreRef = useRef(false);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
if (isLoading) return;
if (!hasMore()) return;

loadMore();

setTimeout(() => {
  loadingMoreRef.current = false;
}, 300);
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // lock body scroll when drawer open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [drawerOpen]);

  const showInitialLoading = isLoading && (allProducts?.length || 0) === 0;

  const retry = useCallback(() => {
    if (!category) return;
    clearError?.();
    lastFetchRef.current = "";
    fetchProducts({ category, isActive: true, page: 1, limit: PAGE_SIZE, sort: "newest" });
  }, [category, clearError, fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-50">
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
                  <div className="text-base font-semibold text-zinc-900">Filters</div>
                  <div className="text-xs text-zinc-500">Real-time from API payload</div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-900">Availability</div>
                  <label className="mt-3 flex items-center gap-3 text-sm text-zinc-700">
                    <input type="checkbox" className="h-4 w-4" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                    Show only in-stock products
                  </label>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-zinc-900">Price</div>
                    <div className="text-xs text-zinc-500">
                      {facets.priceMin} – {facets.priceMax}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-zinc-500 w-10">Min</div>
                      <input
                        type="number"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                        value={priceMin}
                        min={facets.priceMin}
                        max={facets.priceMax}
                        onChange={(e) => setPriceMin(clamp(toNum(e.target.value, facets.priceMin), facets.priceMin, facets.priceMax))}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs text-zinc-500 w-10">Max</div>
                      <input
                        type="number"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                        value={priceMax}
                        min={facets.priceMin}
                        max={facets.priceMax}
                        onChange={(e) => setPriceMax(clamp(toNum(e.target.value, facets.priceMax), facets.priceMin, facets.priceMax))}
                      />
                    </div>

                    <div className="text-[11px] text-zinc-500">Changes apply instantly.</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-zinc-900">Tags</div>
                    <div className="text-xs text-zinc-500">{facets.tags.length ? `${facets.tags.length} total` : "None"}</div>
                  </div>

                  {!facets.tags.length ? (
                    <div className="mt-3 text-sm text-zinc-600">No tags found for this category.</div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {facets.tags.map((t) => {
                        const active = selectedTags.has(t);
                        return (
                          <button
                            key={t}
                            onClick={() => toggleTag(t)}
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold border transition",
                              active ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50",
                            ].join(" ")}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-4 border-t border-zinc-200 flex items-center justify-between gap-3">
                <button onClick={resetFilters} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900">
                  Reset
                </button>
                <button onClick={() => setDrawerOpen(false)} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 capitalize">{category || "Category"}</h1>
         <p className="text-sm text-zinc-600">
  {showInitialLoading
    ? "Loading..."
    : `${totalAvailable} products loaded`}
</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
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

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Error</div>
            <div className="text-sm mt-1">{error}</div>
            <button onClick={retry} className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          <ProductGrid title="" products={list} loading={showInitialLoading} />
        </div>

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
  Showing {list.length} items
  {hasMore() ? " — loading more as you scroll" : " — you’ve reached the end"}
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
