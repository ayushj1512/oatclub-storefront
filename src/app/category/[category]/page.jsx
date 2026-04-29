"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import FiltersDrawer from "@/components/category/FiltersDrawer";
import FilterSortBar from "@/components/category/FilterSortBar";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Default", value: "newest" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const getPrice = (p) =>
  Number(String(p?.price ?? "").replace(/[^\d.]/g, "")) || 0;

const buildFacets = (products = []) => {
  const prices = products.map(getPrice).filter((p) => p > 0).sort((a, b) => a - b);

  return {
    priceMin: prices[0] || 0,
    priceMax: prices.at(-1) || 0,
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

const prettyCategory = (slug = "") =>
  decodeURIComponent(String(slug))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function CategoryPage() {
  const params = useParams();
  const category = String(params?.category || "").trim();
  const ready = Boolean(category);

  const categoryName = useMemo(() => prettyCategory(category), [category]);

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);
  const hasMore = useProductStore((s) => s.hasMore);
  const clearError = useProductStore((s) => s.clearError);
  const fetchProductsByCategory = useProductStore(
    (s) => s.fetchProductsByCategory
  );

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

  const drawerTop =
    "calc(var(--app-topbar-h,0px) + var(--app-header-h,0px) + env(safe-area-inset-top,0px))";

  const drawerHeight =
    "calc(100dvh - var(--app-topbar-h,0px) - var(--app-header-h,0px) - env(safe-area-inset-top,0px))";

  const baseParams = useMemo(
    () => ({
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
      card: 1,
    }),
    [sort]
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
  }, [ready, category, sort, clearError]);

  useEffect(() => {
    if (!ready) return;

    const key = JSON.stringify({ category, sort });
    if (lastFetchRef.current === key) return;

    lastFetchRef.current = key;
    clearError?.();
    setDrawerOpen(false);

    fetchProductsByCategory(category, baseParams);
  }, [ready, category, sort, baseParams, clearError, fetchProductsByCategory]);

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setIsInitialFetching(false);
      return;
    }

    setDisplayProducts(Array.isArray(allProducts) ? allProducts : []);
    setIsInitialFetching(false);
  }, [isLoading, allProducts, error]);

  const applyFilters = () => {
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  };

  const resetFilters = useCallback(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  const list = useMemo(() => {
    const lo = priceMin ?? facets.priceMin;
    const hi = priceMax ?? facets.priceMax;
    const minV = Math.min(lo, hi);
    const maxV = Math.max(lo, hi);

    const arr = [...(displayProducts || [])].filter((p) => {
      const price = getPrice(p);
      if (!price) return true;
      return price >= minV && price <= maxV;
    });

    if (sort === "price_asc") arr.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "price_desc") arr.sort((a, b) => getPrice(b) - getPrice(a));
    if (sort === "newest") arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

    return arr;
  }, [displayProducts, priceMin, priceMax, facets.priceMin, facets.priceMax, sort]);

  const loadMoreCategory = useCallback(() => {
    if (!ready || isLoading || loadingMoreRef.current || !hasMore()) return;

    loadingMoreRef.current = true;

    fetchProductsByCategory(category, {
      ...(lastParams || {}),
      page: (page || 1) + 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
      card: 1,
    }).finally?.(() => {
      loadingMoreRef.current = false;
    });

    setTimeout(() => {
      loadingMoreRef.current = false;
    }, 500);
  }, [
    ready,
    isLoading,
    hasMore,
    fetchProductsByCategory,
    category,
    lastParams,
    page,
    sort,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreCategory();
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [loadMoreCategory]);

  const showInitialLoading =
    (isLoading || isInitialFetching) && !displayProducts.length;

  const retry = useCallback(() => {
    if (!ready) return;

    clearError?.();
    lastFetchRef.current = "";
    setDisplayProducts([]);
    setIsInitialFetching(true);

    fetchProductsByCategory(category, baseParams);
  }, [ready, category, baseParams, clearError, fetchProductsByCategory]);

  return (
    <div className="min-h-screen bg-zinc-50">
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

      <div className="w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6 lg:px-8">
        <div className="mb-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
            {categoryName}
          </h1>
        </div>

        <FilterSortBar
          category={categoryName}
          showInitialLoading={showInitialLoading}
          sort={sort}
          setSort={setSort}
          sortOptions={SORT_OPTIONS}
          hideFilterButton
        />

        {!showInitialLoading && error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
            <div className="font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{error}</div>
            <button
              onClick={retry}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-6">
          <ProductGrid
            key={`${category}-${sort}`}
            products={list}
            loading={showInitialLoading}
          />
        </div>

        {!error && displayProducts.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {hasMore() ? (
              <>
                <button
                  onClick={loadMoreCategory}
                  disabled={isLoading}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-black/10 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>

                <div className="text-xs text-zinc-500">
                  Showing {list.length} items — more items will load as you scroll
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