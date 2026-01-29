"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";
import { Sparkles } from "lucide-react";

import { useRecommendationStore } from "@/store/recommendationStore";
import { useProductStore } from "@/store/productStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

const PAGE_SIZE = 50; // ✅ was 20 — now at least 50 visible
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

export default function RecommendationPage() {
  const pageTitle = "Recommendation";

  /* ---------------- stores ---------------- */
  const recItems = useRecommendationStore((s) => s.items);
  const recLoading = useRecommendationStore((s) => s.loading);
  const build = useRecommendationStore((s) => s.build);

  const rvItems = useRecentlyViewedStore((s) => s.items);
  const rvInit = useRecentlyViewedStore((s) => s.initialize);

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const errorProduct = useProductStore((s) => s.error);

  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const hasMore = useProductStore((s) => s.hasMore);
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);
  const clearError = useProductStore((s) => s.clearError);

  /* ---------------- local state ---------------- */
  const [initialLoading, setInitialLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [done, setDone] = useState(false);
  const [sort, setSort] = useState("newest");
  const [error, setError] = useState("");

  const timeoutRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const firstRunRef = useRef(false);

  const combinedError = error || errorProduct;

  const showInitialLoading =
    initialLoading &&
    (recItems?.length || 0) === 0 &&
    (allProducts?.length || 0) === 0;

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
   * 1) init recently viewed cookie
   * 2) fetch bigger catalog chunk (50)
   * 3) build 50 recommendations
   */
  const runInitial = useCallback(async () => {
    clearError?.();
    setError("");
    setInitialLoading(true);
    setTimedOut(false);
    setDone(false);

    startTimeout();

    try {
      rvInit?.();

      // ✅ Fetch at least 50 products into catalog
      await fetchProducts({
        isActive: true,
        page: 1,
        limit: PAGE_SIZE,
        sort: "newest",
      });

      // ✅ Build at least 50 recommended products
      await build({
        limit: PAGE_SIZE,
        seedCount: 10,
        ensureCatalog: true,
        // ✅ fetch more candidates so scoring has options
        fetchParams: { isActive: true, page: 1, limit: 400, sort: "popularity" },
      });

      setDone(true);
      stopTimeout();
      setInitialLoading(false);
    } catch (e) {
      stopTimeout();
      setInitialLoading(false);
      setError(e?.message || "Something went wrong");
    }
  }, [clearError, rvInit, fetchProducts, build, startTimeout, stopTimeout]);

  useEffect(() => {
    if (firstRunRef.current) return;
    firstRunRef.current = true;

    runInitial().catch((e) => {
      console.error("❌ recommendation init error:", e);
      stopTimeout();
      setInitialLoading(false);
    });

    return () => stopTimeout();
  }, [runInitial, stopTimeout]);

  /**
   * ✅ Final list:
   * Recommendations first, then "more products" (excluding dupes)
   */
  const recSet = useMemo(() => {
    return new Set((recItems || []).map((p) => String(p?.id)).filter(Boolean));
  }, [recItems]);

  const normalProducts = useMemo(() => {
    const src = Array.isArray(allProducts) ? allProducts : [];
    const out = src.filter((p) => p?.id && !recSet.has(String(p.id)));

    if (sort === "newest") out.sort((a, b) => getTimeValue(b) - getTimeValue(a));
    if (sort === "priceLowHigh") out.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    if (sort === "priceHighLow") out.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    if (sort === "rating") out.sort((a, b) => (b?.averageRating || 0) - (a?.averageRating || 0));
    if (sort === "popularity")
      out.sort(
        (a, b) =>
          (b?.raw?.analytics?.views || b?.analytics?.views || 0) -
          (a?.raw?.analytics?.views || a?.analytics?.views || 0)
      );

    return out;
  }, [allProducts, recSet, sort]);

  const finalList = useMemo(() => {
    // ✅ ensure unique + big list
    const merged = [...(recItems || []), ...(normalProducts || [])];
    return uniqBySlug(merged);
  }, [recItems, normalProducts]);

  /**
   * ✅ Load more normal products (infinite)
   */
  const loadMore = useCallback(() => {
    if (!done) return;
    if (isLoading || loadingMoreRef.current) return;
    if (!hasMore?.()) return;

    loadingMoreRef.current = true;

    fetchProducts({
      ...(lastParams || {}),
      isActive: true,
      sort: "newest",
      page: (page || 1) + 1,
      limit: PAGE_SIZE, // ✅ keep 50 per page
    });

    setTimeout(() => {
      loadingMoreRef.current = false;
    }, 350);
  }, [done, isLoading, hasMore, fetchProducts, lastParams, page]);

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
    runInitial().catch((e) => console.error("❌ retry error:", e));
  }, [runInitial]);

  const hasRV = (rvItems?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* ✅ Heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent">
                  Recommended for you
                </span>
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-violet-600 animate-[pulse_1.2s_ease-in-out_infinite]" />
                <span className="leading-none">Personalized</span>
              </span>
            </div>

            {!hasRV ? (
              <div className="mt-2 text-sm text-zinc-600">
                View a few products first — we’ll personalize this page for you.
              </div>
            ) : (
              <div className="mt-2 text-sm text-zinc-600">
                Based on your recently viewed look.
              </div>
            )}
          </div>

          {/* RIGHT: Filter/Sort */}
          <div className="w-full sm:w-auto sm:ml-auto">
            <div className="w-full sm:w-auto sm:flex sm:justify-end">
              <FilterSortBar
                category={pageTitle}
                inStockCount={finalList.length}
                showInitialLoading={showInitialLoading}
                hideFilterButton={true}
                sort={sort}
                setSort={setSort}
                sortOptions={[
                  { label: "Newest", value: "newest" },
                  { label: "Price: Low to High", value: "priceLowHigh" },
                  { label: "Price: High to Low", value: "priceHighLow" },
                  { label: "Top Rated", value: "rating" },
                  { label: "Popularity", value: "popularity" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ✅ Timeout UI */}
        {!showInitialLoading && timedOut && !combinedError && finalList.length === 0 && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <div className="font-semibold">Taking longer than usual</div>
            <div className="text-sm mt-1">Network/backend slow ho sakta hai. Retry kar do.</div>
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

        {/* ✅ Empty State */}
        {!showInitialLoading && !combinedError && !hasRV && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-800">
            <div className="font-semibold">No recommendations yet</div>
            <div className="text-sm mt-1 text-zinc-600">
              Browse a few products and come back — this page will start filling up.
            </div>
          </div>
        )}

        {/* ✅ Products */}
        <div className="mt-6">
          <ProductGrid products={finalList} loading={showInitialLoading} title="" />
        </div>

        {/* ✅ Load more */}
        {!combinedError && done && finalList.length > 0 && (
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
