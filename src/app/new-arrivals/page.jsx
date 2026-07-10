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
import FiltersDrawer from "@/components/category/FiltersDrawer";
import FilterSortBar from "@/components/category/FilterSortBar";

import { useProductStore } from "@/store/productStore";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Newest (Default)", value: "newest" },
  { label: "Price: Low → High", value: "priceLowHigh" },
  { label: "Price: High → Low", value: "priceHighLow" },
];

const buildFacets = (products = []) => {
  const prices = products
    .map((product) => Number(product?.price))
    .filter(
      (price) => Number.isFinite(price) && price > 0
    )
    .sort((a, b) => a - b);

  return {
    priceMin: prices[0] || 0,
    priceMax: prices[prices.length - 1] || 0,
  };
};

const getProductPrice = (product) => {
  const value = String(product?.price ?? "").replace(
    /[^\d.]/g,
    ""
  );

  return Number(value) || 0;
};

const getTimeValue = (product) => {
  const time =
    product?.createdAt ||
    product?.updatedAt ||
    product?.created_at ||
    product?.updated_at ||
    product?.dateCreated ||
    product?.date;

  const milliseconds = new Date(time).getTime();

  return Number.isFinite(milliseconds)
    ? milliseconds
    : 0;
};

export default function NewArrivalsPage() {
  const ready = true;
  const pageTitle = "New Arrivals";

  const allProducts = useProductStore(
    (state) => state.allProducts
  );

  const isLoading = useProductStore(
    (state) => state.isLoading
  );

  const error = useProductStore(
    (state) => state.error
  );

  const fetchProducts = useProductStore(
    (state) => state.fetchProducts
  );

  const hasMore = useProductStore(
    (state) => state.hasMore
  );

  const clearError = useProductStore(
    (state) => state.clearError
  );

  const page = useProductStore(
    (state) => state.page
  );

  const lastParams = useProductStore(
    (state) => state.lastParams
  );

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [sort, setSort] = useState("newest");

  const [priceMin, setPriceMin] =
    useState(null);

  const [priceMax, setPriceMax] =
    useState(null);

  const [draftPriceMin, setDraftPriceMin] =
    useState(null);

  const [draftPriceMax, setDraftPriceMax] =
    useState(null);

  const [displayProducts, setDisplayProducts] =
    useState([]);

  const [
    isInitialFetching,
    setIsInitialFetching,
  ] = useState(false);

  const lastFetchRef = useRef("");
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const facets = useMemo(
    () => buildFacets(allProducts || []),
    [allProducts]
  );

  const drawerTop = useMemo(
    () =>
      "calc(var(--app-topbar-h, 0px) + var(--app-header-h, 0px) + env(safe-area-inset-top, 0px))",
    []
  );

  const drawerHeight = useMemo(
    () =>
      "calc(100dvh - var(--app-topbar-h, 0px) - var(--app-header-h, 0px) - env(safe-area-inset-top, 0px))",
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

    const fetchKey = JSON.stringify({
      route: "new-arrivals",
      sort,
    });

    if (lastFetchRef.current === fetchKey) {
      return;
    }

    lastFetchRef.current = fetchKey;

    clearError?.();
    setDrawerOpen(false);

    fetchProducts({
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [
    ready,
    sort,
    fetchProducts,
    clearError,
  ]);

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setIsInitialFetching(false);
      return;
    }

    setDisplayProducts(
      Array.isArray(allProducts)
        ? allProducts
        : []
    );

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
    let products = Array.isArray(displayProducts)
      ? [...displayProducts]
      : [];

    const lowerPrice =
      priceMin ?? facets.priceMin;

    const upperPrice =
      priceMax ?? facets.priceMax;

    const minimum = Math.min(
      lowerPrice,
      upperPrice
    );

    const maximum = Math.max(
      lowerPrice,
      upperPrice
    );

    products = products.filter((product) => {
      const price = getProductPrice(product);

      if (
        !Number.isFinite(price) ||
        price === 0
      ) {
        return true;
      }

      return (
        price >= minimum &&
        price <= maximum
      );
    });

    if (sort === "priceLowHigh") {
      products.sort(
        (first, second) =>
          getProductPrice(first) -
          getProductPrice(second)
      );
    } else if (sort === "priceHighLow") {
      products.sort(
        (first, second) =>
          getProductPrice(second) -
          getProductPrice(first)
      );
    } else {
      products.sort(
        (first, second) =>
          getTimeValue(second) -
          getTimeValue(first)
      );
    }

    return products;
  }, [
    displayProducts,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
    sort,
  ]);

  const loadMore = useCallback(() => {
    if (!ready) return;
    if (isLoading) return;
    if (loadingMoreRef.current) return;
    if (!hasMore()) return;

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
  }, [
    ready,
    isLoading,
    hasMore,
    fetchProducts,
    lastParams,
    page,
    sort,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          loadMore();
        },
        {
          rootMargin: "900px 0px",
        }
      );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore]);

  const showInitialLoading =
    (isLoading || isInitialFetching) &&
    displayProducts.length === 0;

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
  }, [
    ready,
    sort,
    clearError,
    fetchProducts,
  ]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
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

      <div className="w-full pb-4 pt-2 sm:pb-5 sm:pt-3">
        {/* Heading */}
        <div className="px-2 sm:px-2.5 md:px-3">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            {pageTitle}
          </h1>
        </div>

        {/* Sort bar */}
        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category={pageTitle}
            showInitialLoading={
              showInitialLoading
            }
            sort={sort}
            setSort={setSort}
            sortOptions={SORT_OPTIONS}
            hideFilterButton
          />
        </div>

        {/* Error */}
        {!showInitialLoading && error ? (
          <div className="mx-2 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">
              Something went wrong
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>

            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Product grid */}
        <div className="mt-2 w-full">
          <ProductGrid
            key={`new-arrivals-${sort}`}
            products={list}
            loading={showInitialLoading}
          />
        </div>

        {/* Load more */}
        {!error &&
        displayProducts.length > 0 ? (
          <div className="mt-5 flex flex-col items-center gap-2 px-2">
            {hasMore() ? (
              <>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "Loading..."
                    : "Load more"}
                </button>

                <div className="text-center text-xs text-zinc-500">
                  Showing {list.length} items
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-600">
                You’ve reached the end.
              </div>
            )}
          </div>
        ) : null}

        <div
          ref={sentinelRef}
          className="h-1 w-full"
        />
      </div>
    </main>
  );
}