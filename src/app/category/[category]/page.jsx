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
import FiltersDrawer from "@/components/category/FiltersDrawer";
import FilterSortBar from "@/components/category/FilterSortBar";

import { useProductStore } from "@/store/productStore";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Default", value: "newest" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const getPrice = (product) => {
  const value = String(product?.price ?? "").replace(/[^\d.]/g, "");
  return Number(value) || 0;
};

const buildFacets = (products = []) => {
  const prices = products
    .map(getPrice)
    .filter((price) => price > 0)
    .sort((a, b) => a - b);

  return {
    priceMin: prices[0] || 0,
    priceMax: prices[prices.length - 1] || 0,
  };
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

  return Number.isFinite(milliseconds) ? milliseconds : 0;
};

const prettyCategory = (slug = "") =>
  decodeURIComponent(String(slug))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default function CategoryPage() {
  const params = useParams();

  const category = String(params?.category || "").trim();
  const ready = Boolean(category);

  const categoryName = useMemo(
    () => prettyCategory(category),
    [category]
  );

  const allProducts = useProductStore(
    (state) => state.allProducts
  );

  const isLoading = useProductStore(
    (state) => state.isLoading
  );

  const error = useProductStore(
    (state) => state.error
  );

  const page = useProductStore(
    (state) => state.page
  );

  const lastParams = useProductStore(
    (state) => state.lastParams
  );

  const hasMore = useProductStore(
    (state) => state.hasMore
  );

  const clearError = useProductStore(
    (state) => state.clearError
  );

  const fetchProductsByCategory = useProductStore(
    (state) => state.fetchProductsByCategory
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  const [draftPriceMin, setDraftPriceMin] =
    useState(null);

  const [draftPriceMax, setDraftPriceMax] =
    useState(null);

  const [displayProducts, setDisplayProducts] =
    useState([]);

  const [isInitialFetching, setIsInitialFetching] =
    useState(false);

  const lastFetchRef = useRef("");
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const facets = useMemo(
    () => buildFacets(allProducts || []),
    [allProducts]
  );

  const drawerTop =
    "calc(var(--app-topbar-h, 0px) + var(--app-header-h, 0px) + env(safe-area-inset-top, 0px))";

  const drawerHeight =
    "calc(100dvh - var(--app-topbar-h, 0px) - var(--app-header-h, 0px) - env(safe-area-inset-top, 0px))";

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

    const fetchKey = JSON.stringify({
      category,
      sort,
    });

    if (lastFetchRef.current === fetchKey) {
      return;
    }

    lastFetchRef.current = fetchKey;

    clearError?.();
    setDrawerOpen(false);

    fetchProductsByCategory(
      category,
      baseParams
    );
  }, [
    ready,
    category,
    sort,
    baseParams,
    clearError,
    fetchProductsByCategory,
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

    const products = Array.isArray(displayProducts)
      ? [...displayProducts]
      : [];

    const filteredProducts = products.filter(
      (product) => {
        const price = getPrice(product);

        if (!price) {
          return true;
        }

        return (
          price >= minimum &&
          price <= maximum
        );
      }
    );

    if (sort === "price_asc") {
      filteredProducts.sort(
        (first, second) =>
          getPrice(first) -
          getPrice(second)
      );
    }

    if (sort === "price_desc") {
      filteredProducts.sort(
        (first, second) =>
          getPrice(second) -
          getPrice(first)
      );
    }

    if (sort === "newest") {
      filteredProducts.sort(
        (first, second) =>
          getTimeValue(second) -
          getTimeValue(first)
      );
    }

    return filteredProducts;
  }, [
    displayProducts,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
    sort,
  ]);

  const loadMoreCategory = useCallback(() => {
    if (!ready) return;
    if (isLoading) return;
    if (loadingMoreRef.current) return;
    if (!hasMore()) return;

    loadingMoreRef.current = true;

    const request =
      fetchProductsByCategory(category, {
        ...(lastParams || {}),
        page: (page || 1) + 1,
        limit: PAGE_SIZE,
        sort,
        isActive: true,
        card: 1,
      });

    Promise.resolve(request).finally(() => {
      loadingMoreRef.current = false;
    });
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

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadMoreCategory();
          }
        },
        {
          rootMargin: "900px 0px",
        }
      );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreCategory]);

  const showInitialLoading =
    (isLoading || isInitialFetching) &&
    displayProducts.length === 0;

  const retry = useCallback(() => {
    if (!ready) return;

    clearError?.();

    lastFetchRef.current = "";

    setDisplayProducts([]);
    setIsInitialFetching(true);

    fetchProductsByCategory(
      category,
      baseParams
    );
  }, [
    ready,
    category,
    baseParams,
    clearError,
    fetchProductsByCategory,
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
            {categoryName}
          </h1>
        </div>

        {/* Sort bar */}
        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category={categoryName}
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

        {/* Products */}
        <div className="mt-2 w-full">
          <ProductGrid
            key={`${category}-${sort}`}
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
                  onClick={loadMoreCategory}
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