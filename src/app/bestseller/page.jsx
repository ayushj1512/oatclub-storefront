"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";

import { useBestsellerFrontendStore } from "@/store/bestsellerStore";
import { useProductStore } from "@/store/productStore";

const PAGE_SIZE = 20;
const MAX_SHIMMER_MS = 8000;

const getProductId = (product) =>
  String(product?.id || product?._id || "");

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

export default function BestsellerPage() {
  const pageTitle = "Bestsellers";

  /* ---------------- Bestseller store ---------------- */

  const ids = useBestsellerFrontendStore(
    (state) => state.ids
  );

  const errorBestseller = useBestsellerFrontendStore(
    (state) => state.error
  );

  const fetchBestsellerIds =
    useBestsellerFrontendStore(
      (state) => state.fetchBestsellerIds
    );

  /* ---------------- Product store ---------------- */

  const allProducts = useProductStore(
    (state) => state.allProducts
  );

  const isLoading = useProductStore(
    (state) => state.isLoading
  );

  const errorProduct = useProductStore(
    (state) => state.error
  );

  const fetchProducts = useProductStore(
    (state) => state.fetchProducts
  );

  const fetchProductsByIds = useProductStore(
    (state) => state.fetchProductsByIds
  );

  const hasMore = useProductStore(
    (state) => state.hasMore
  );

  const page = useProductStore(
    (state) => state.page
  );

  const lastParams = useProductStore(
    (state) => state.lastParams
  );

  const clearError = useProductStore(
    (state) => state.clearError
  );

  /* ---------------- Local state ---------------- */

  const [bestsellerProducts, setBestsellerProducts] =
    useState([]);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [timedOut, setTimedOut] =
    useState(false);

  const [bestsellersDone, setBestsellersDone] =
    useState(false);

  const timeoutRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const firstRunRef = useRef(false);
  const sentinelRef = useRef(null);

  const combinedError =
    errorBestseller || errorProduct;

  const showInitialLoading =
    initialLoading &&
    bestsellerProducts.length === 0 &&
    (!Array.isArray(allProducts) ||
      allProducts.length === 0);

  const bestsellerIdSet = useMemo(() => {
    return new Set(
      bestsellerProducts
        .map(getProductId)
        .filter(Boolean)
    );
  }, [bestsellerProducts]);

  const normalProducts = useMemo(() => {
    const source = Array.isArray(allProducts)
      ? [...allProducts]
      : [];

    return source
      .filter((product) => {
        const productId = getProductId(product);

        return (
          productId &&
          !bestsellerIdSet.has(productId)
        );
      })
      .sort(
        (first, second) =>
          getTimeValue(second) -
          getTimeValue(first)
      );
  }, [allProducts, bestsellerIdSet]);

  const finalList = useMemo(() => {
    return [
      ...bestsellerProducts,
      ...normalProducts,
    ];
  }, [bestsellerProducts, normalProducts]);

  const startTimeout = useCallback(() => {
    setTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setInitialLoading(false);
    }, MAX_SHIMMER_MS);
  }, []);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
  }, []);

  const runInitial = useCallback(async () => {
    clearError?.();

    setInitialLoading(true);
    setTimedOut(false);
    setBestsellersDone(false);

    startTimeout();

    try {
      const receivedIds =
        await fetchBestsellerIds();

      const bestsellerIds = (
        Array.isArray(receivedIds)
          ? receivedIds
          : ids || []
      )
        .map(String)
        .filter(Boolean);

      let fetchedBestsellers = [];

      if (bestsellerIds.length > 0) {
        const response =
          await fetchProductsByIds(
            bestsellerIds,
            {
              mergeIntoAllProducts: true,
            }
          );

        fetchedBestsellers =
          Array.isArray(response)
            ? response
            : [];
      }

      const bestsellerMap = new Map(
        fetchedBestsellers
          .map((product) => [
            getProductId(product),
            product,
          ])
          .filter(([productId]) => productId)
      );

      const orderedBestsellers =
        bestsellerIds
          .map((productId) =>
            bestsellerMap.get(
              String(productId)
            )
          )
          .filter(Boolean);

      setBestsellerProducts(
        orderedBestsellers
      );

      await fetchProducts({
        isActive: true,
        page: 1,
        limit: PAGE_SIZE,
        sort: "newest",
      });

      setBestsellersDone(true);
    } finally {
      stopTimeout();
      setInitialLoading(false);
    }
  }, [
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

    runInitial().catch((error) => {
      console.error(
        "Bestseller initialization error:",
        error
      );

      stopTimeout();
      setInitialLoading(false);
    });

    return () => {
      stopTimeout();
    };
  }, [runInitial, stopTimeout]);

  const loadMore = useCallback(() => {
    if (!bestsellersDone) return;
    if (isLoading) return;
    if (loadingMoreRef.current) return;
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
  }, [
    bestsellersDone,
    isLoading,
    hasMore,
    fetchProducts,
    lastParams,
    page,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          loadMore();
        },
        {
          rootMargin: "900px 0px",
        }
      );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  const retry = useCallback(() => {
    setBestsellerProducts([]);
    setBestsellersDone(false);
    setTimedOut(false);

    runInitial().catch((error) => {
      console.error(
        "Bestseller retry error:",
        error
      );
    });
  }, [runInitial]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
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
            hideFilterButton
            sort="newest"
            setSort={() => {}}
            sortOptions={[
              {
                label: "Default",
                value: "newest",
              },
            ]}
          />
        </div>

        {/* Timeout */}
        {!showInitialLoading &&
        timedOut &&
        !combinedError &&
        finalList.length === 0 ? (
          <div className="mx-2 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">
              Taking longer than usual
            </div>

            <div className="mt-1 text-sm">
              Products are taking longer to
              load. Please try again.
            </div>

            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Error */}
        {!showInitialLoading &&
        combinedError ? (
          <div className="mx-2 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">
              Something went wrong
            </div>

            <div className="mt-1 text-sm">
              {combinedError}
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
            key="bestseller-grid"
            products={finalList}
            loading={showInitialLoading}
          />
        </div>

        {/* Load more */}
        {!combinedError &&
        bestsellersDone &&
        finalList.length > 0 ? (
          <div className="mt-5 flex flex-col items-center gap-2 px-2">
            {hasMore?.() ? (
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
                  Showing {finalList.length}{" "}
                  items
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