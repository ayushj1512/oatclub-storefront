"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ProductGrid from "@/components/common/ProductGrid";
import { useBestsellerFrontendStore } from "@/store/bestsellerStore";
import { useProductStore } from "@/store/productStore";
import { Flame } from "lucide-react";
import FilterSortBar from "@/components/category/FilterSortBar";

const PAGE_SIZE = 20;
const MAX_SHIMMER_MS = 8000;

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

export default function BestsellerPage() {
  const pageTitle = "Bestsellers";

  /* ---------------- bestseller store ---------------- */
  const ids = useBestsellerFrontendStore((s) => s.ids);
  const loadingIds = useBestsellerFrontendStore((s) => s.loadingIds);
  const errorBestseller = useBestsellerFrontendStore((s) => s.error);
  const fetchBestsellerIds = useBestsellerFrontendStore(
    (s) => s.fetchBestsellerIds
  );

  /* ---------------- product store ---------------- */
  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const errorProduct = useProductStore((s) => s.error);

  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchProductsByIds = useProductStore((s) => s.fetchProductsByIds);
  const hasMore = useProductStore((s) => s.hasMore);
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);
  const clearError = useProductStore((s) => s.clearError);

  /* ---------------- local state ---------------- */
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [bestsellersDone, setBestsellersDone] = useState(false);

  const timeoutRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const firstRunRef = useRef(false);

  const combinedError = errorBestseller || errorProduct;

  // ✅ shimmer only while initialLoading AND nothing to show yet
  const showInitialLoading =
    initialLoading &&
    (bestsellerProducts?.length || 0) === 0 &&
    ((allProducts?.length || 0) === 0);

  const bestsellerIdSet = useMemo(() => {
    return new Set(
      (bestsellerProducts || []).map((p) => String(p?.id)).filter(Boolean)
    );
  }, [bestsellerProducts]);

  // ✅ Normal products = allProducts minus bestsellers (no duplicates)
  const normalProducts = useMemo(() => {
    const src = Array.isArray(allProducts) ? allProducts : [];
    const out = src.filter((p) => p?.id && !bestsellerIdSet.has(String(p.id)));

    // backup sorting newest first
    out.sort((a, b) => getTimeValue(b) - getTimeValue(a));
    return out;
  }, [allProducts, bestsellerIdSet]);

  // ✅ Final list: bestsellers first, then normal products
  const finalList = useMemo(() => {
    return [...(bestsellerProducts || []), ...(normalProducts || [])];
  }, [bestsellerProducts, normalProducts]);

  const startTimeout = useCallback(() => {
    setTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setInitialLoading(false);
    }, MAX_SHIMMER_MS);
  }, []);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  /**
   * ✅ Initial flow:
   * 1) fetch bestseller ids
   * 2) fetch products by ids
   * 3) fetch normal products (newest)
   */
  const runInitial = useCallback(async () => {
    clearError?.();
    setInitialLoading(true);
    setTimedOut(false);
    setBestsellersDone(false);

    startTimeout();

    // 1) ids
    const gotIds = await fetchBestsellerIds();
    const bestsellerIds = (Array.isArray(gotIds) ? gotIds : ids || []).map(
      String
    );

    // 2) products by ids
    let bsList = [];
    if (bestsellerIds.length) {
      bsList = await fetchProductsByIds(bestsellerIds, {
        mergeIntoAllProducts: true,
      });
    }

    // ✅ keep exact order as ids
    const bsMap = new Map(
      (Array.isArray(bsList) ? bsList : []).map((p) => [String(p?.id), p])
    );

    const ordered = bestsellerIds.map((id) => bsMap.get(String(id))).filter(Boolean);
    setBestsellerProducts(ordered);

    // 3) normal products fetch (newest)
    await fetchProducts({
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort: "newest",
    });

    setBestsellersDone(true);
    stopTimeout();
    setInitialLoading(false);
  }, [
    PAGE_SIZE,
    clearError,
    fetchBestsellerIds,
    fetchProductsByIds,
    fetchProducts,
    ids,
    startTimeout,
    stopTimeout,
  ]);

  useEffect(() => {
    if (firstRunRef.current) return;
    firstRunRef.current = true;

    runInitial().catch((e) => {
      console.error("❌ bestseller init error:", e);
      stopTimeout();
      setInitialLoading(false);
    });

    return () => stopTimeout();
  }, [runInitial, stopTimeout]);

  /**
   * ✅ Load more normal products
   */
  const loadMore = useCallback(() => {
    if (!bestsellersDone) return;
    if (isLoading || loadingMoreRef.current) return;
    if (!hasMore?.()) return;

    loadingMoreRef.current = true;

    fetchProducts({
      ...(lastParams || {}),
      isActive: true,
      sort: "newest",
      page: (page || 1) + 1,
      limit: PAGE_SIZE,
    });

    setTimeout(() => {
      loadingMoreRef.current = false;
    }, 350);
  }, [bestsellersDone, isLoading, hasMore, fetchProducts, lastParams, page]);

  /**
   * ✅ Infinite scroll sentinel
   */
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadMore();
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  const retry = useCallback(() => {
    firstRunRef.current = false;
    setBestsellerProducts([]);
    runInitial().catch((e) => console.error("❌ retry error:", e));
  }, [runInitial]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* ✅ Heading */}
       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  {/* LEFT: Title + subtitle */}
  <div className="min-w-0">
    {/* Title row (mobile friendly: wraps nicely) */}
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
        <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent">
          Bestsellers
        </span>
      </h1>

      {/* Badge (icon + subtle animation) */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
        <Flame className="h-3.5 w-3.5 text-orange-500 animate-[pulse_1.2s_ease-in-out_infinite]" />
        <span className="leading-none">Trending</span>
      </span>
    </div>


    {/* Divider (mobile: full width, desktop: short accent line) */}
    <div/>
  </div>

  {/* RIGHT: Filter/Sort (mobile: full width, desktop: right aligned) */}
  <div className="w-full sm:w-auto sm:ml-auto">
    <div className="w-full sm:w-auto sm:flex sm:justify-end">
      <FilterSortBar
        category={pageTitle}
        showInitialLoading={showInitialLoading}
        hideFilterButton={true}
        sort={"newest"}
        setSort={() => {}}
        sortOptions={[{ label: "Default", value: "newest" }]}
      />
    </div>
  </div>
</div>

        {/* ✅ Timeout UI */}
        {!showInitialLoading && timedOut && !combinedError && finalList.length === 0 && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <div className="font-semibold">Taking longer than usual</div>
            <div className="text-sm mt-1">
              Network/backend slow ho sakta hai. Retry kar do.
            </div>
            <button
              onClick={retry}
              className="mt-3 rounded-xl bg-yellow-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* ✅ Error UI */}
        {!showInitialLoading && combinedError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm mt-1">{combinedError}</div>
            <button
              onClick={retry}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* ✅ Products */}
        <div className="mt-6">
          <ProductGrid
            key="bestseller-grid"
            products={finalList}
            loading={showInitialLoading}
            title=""
          />
        </div>

        {/* ✅ Load more */}
        {!combinedError && bestsellersDone && finalList.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore?.() ? (
              <>
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>
                <div className="text-xs text-zinc-500">
                  Showing {finalList.length} items —{" "}
                  {hasMore?.() ? "more items will load as you scroll" : "end"}
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-600">You’ve reached the end.</div>
            )}
          </div>
        )}

        {/* ✅ Infinite scroll trigger */}
        <div ref={sentinelRef} className="h-1 w-full" />
      </div>
    </div>
  );
}
