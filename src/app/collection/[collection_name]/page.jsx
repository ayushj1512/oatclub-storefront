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

// ✅ slug -> Proper Collection Name
const prettyName = (slug = "") =>
  decodeURIComponent(String(slug))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function CollectionPage() {
  const params = useParams();
  const collection = params?.collection_name;
  const ready = Boolean(collection);

  const collectionName = useMemo(
    () => prettyName(collection),
    [collection]
  );

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);

  const fetchProductsByCollection = useProductStore(
    (s) => s.fetchProductsByCollection
  );

  const hasMore = useProductStore((s) => s.hasMore);
  const clearError = useProductStore((s) => s.clearError);

  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const [onlyInStock, setOnlyInStock] = useState(true);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  const [draftOnlyInStock, setDraftOnlyInStock] = useState(true);
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

  const [displayProducts, setDisplayProducts] = useState([]);
  const [isInitialFetching, setIsInitialFetching] = useState(false);

  const facets = useMemo(
    () => buildFacets(allProducts || []),
    [allProducts]
  );

  const lastFetchRef = useRef("");

  const drawerTop = `calc(var(--app-topbar-h,0px) + var(--app-header-h,0px))`;
  const drawerHeight = `calc(100dvh - var(--app-topbar-h,0px) - var(--app-header-h,0px))`;

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
  }, [ready, collection, sort, clearError]);

  useEffect(() => {
    if (!ready) return;

    const key = JSON.stringify({ collection, sort });
    if (lastFetchRef.current === key) return;
    lastFetchRef.current = key;

    clearError?.();
    setDrawerOpen(false);

    fetchProductsByCollection(collection, {
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, collection, sort, fetchProductsByCollection, clearError]);

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
    setOnlyInStock(draftOnlyInStock);
    setPriceMin(draftPriceMin);
    setPriceMax(draftPriceMax);
    setDrawerOpen(false);
  };

  const resetFilters = useCallback(() => {
    setOnlyInStock(true);
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftOnlyInStock(true);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  const list = useMemo(() => {
    let arr = [...displayProducts];

    const getPrice = (p) => Number(p?.price) || 0;

    if (onlyInStock) arr = arr.filter((p) => getStockCount(p) > 0);

    const lo = priceMin ?? facets.priceMin;
    const hi = priceMax ?? facets.priceMax;
    const minV = Math.min(lo, hi);
    const maxV = Math.max(lo, hi);

    arr = arr.filter((p) => {
      const pr = getPrice(p);
      return !pr || (pr >= minV && pr <= maxV);
    });

    if (sort === "priceLowHigh") arr.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sort === "priceHighLow")
      arr.sort((a, b) => getPrice(b) - getPrice(a));
    else if (sort === "newest")
      arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

    return arr;
  }, [
    displayProducts,
    onlyInStock,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
    sort,
  ]);

  const inStockCount =
    displayProducts.filter((p) => getStockCount(p) > 0).length;

  const loadingMoreRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!ready || isLoading || loadingMoreRef.current || !hasMore()) return;

    loadingMoreRef.current = true;

    fetchProductsByCollection(collection, {
      ...(lastParams || {}),
      page: (page || 1) + 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
    });

    setTimeout(() => (loadingMoreRef.current = false), 350);
  }, [
    ready,
    isLoading,
    hasMore,
    fetchProductsByCollection,
    collection,
    lastParams,
    page,
    sort,
  ]);

  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && loadMore(),
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  const showInitialLoading =
    (isLoading || isInitialFetching) && displayProducts.length === 0;

  const retry = () => {
    clearError?.();
    lastFetchRef.current = "";
    setDisplayProducts([]);
    setIsInitialFetching(true);

    fetchProductsByCollection(collection, {
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
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

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold">{collectionName}</h1>
<div className="mt-2">   <FilterSortBar
          category={collectionName}
          inStockCount={inStockCount}
          showInitialLoading={showInitialLoading}
          sort={sort}
          setSort={setSort}
          sortOptions={SORT_OPTIONS}
          hideFilterButton
        /></div>
      

        {error && !showInitialLoading && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm">{error}</div>
            <button
              onClick={retry}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        )}

        <ProductGrid
          key={`${collection}-${sort}`}
          products={list}
          loading={showInitialLoading}
        />

        {!error && displayProducts.length > 0 && (
          <div className="mt-8 text-center">
            {hasMore() ? (
              <button
                onClick={loadMore}
                className="rounded-lg border px-4 py-2"
              >
                Load more
              </button>
            ) : (
              <div className="text-sm text-zinc-600">
                You’ve reached the end.
              </div>
            )}
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
