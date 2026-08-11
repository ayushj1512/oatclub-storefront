"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";

import { useProductStore } from "@/store/productStore";

const LIMIT = 200;
const MAX_SHIMMER_MS = 8000;

const getProductId = (product) =>
  String(product?.id || product?._id || product?.productId || "");

export default function IndependenceDaySalePage() {
  const pageTitle = "Independence Day Sale";

  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const clearError = useProductStore((state) => state.clearError);
  const storeError = useProductStore((state) => state.error);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [localError, setLocalError] = useState("");

  const timeoutRef = useRef(null);
  const firstRunRef = useRef(false);

  const combinedError = localError || storeError;

  const startTimeout = useCallback(() => {
    setTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
    }, MAX_SHIMMER_MS);
  }, []);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
  }, []);

  const loadSaleProducts = useCallback(async () => {
    clearError?.();

    setLoading(true);
    setTimedOut(false);
    setLocalError("");
    setProducts([]);

    startTimeout();

    try {
      /*
       * ============================================
       * 1. BESTSELLERS
       * ============================================
       */

      await fetchProducts({
        isActive: true,
        isDraft: false,
        isBestSeller: true,
        page: 1,
        limit: LIMIT,
        sort: "newest",
      });

      const bestsellerProducts = [
        ...(useProductStore.getState().allProducts || []),
      ];

      /*
       * ============================================
       * 2. TRENDING
       * ============================================
       */

      await fetchProducts({
        isActive: true,
        isDraft: false,
        isTrending: true,
        page: 1,
        limit: LIMIT,
        sort: "newest",
      });

      const trendingProducts = [
        ...(useProductStore.getState().allProducts || []),
      ];

      /*
       * ============================================
       * 3. MERGE + REMOVE DUPLICATES
       *
       * Bestseller comes first.
       * If same product is Bestseller + Trending,
       * it appears only once.
       * ============================================
       */

      const seen = new Set();

      const merged = [
        ...bestsellerProducts,
        ...trendingProducts,
      ].filter((product) => {
        const id = getProductId(product);

        if (!id || seen.has(id)) {
          return false;
        }

        seen.add(id);
        return true;
      });

      setProducts(merged);
    } catch (error) {
      console.error(
        "Independence Day Sale products error:",
        error,
      );

      setLocalError(
        error?.message ||
        "Failed to load Independence Day Sale products.",
      );
    } finally {
      stopTimeout();
      setLoading(false);
    }
  }, [
    clearError,
    fetchProducts,
    startTimeout,
    stopTimeout,
  ]);

  useEffect(() => {
    if (firstRunRef.current) return;

    firstRunRef.current = true;

    loadSaleProducts();

    return () => {
      stopTimeout();
    };
  }, [loadSaleProducts, stopTimeout]);

  const finalProducts = useMemo(() => {
    return Array.isArray(products)
      ? products
      : [];
  }, [products]);

  const retry = useCallback(() => {
    loadSaleProducts();
  }, [loadSaleProducts]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full pb-6 pt-2 sm:pt-3">
        {/* ============================================
            HEADING
        ============================================ */}

        <div className="px-2 sm:px-2.5 md:px-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Independence Day Special
          </p>

          <h1 className="mt-1 text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            {pageTitle}
          </h1>
        </div>

        {/* ============================================
            SORT BAR
        ============================================ */}

        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category={pageTitle}
            showInitialLoading={loading}
            hideFilterButton
            sort="newest"
            setSort={() => { }}
            sortOptions={[
              {
                label: "Featured",
                value: "newest",
              },
            ]}
          />
        </div>

        {/* ============================================
            TIMEOUT
        ============================================ */}

        {!loading &&
          timedOut &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <div className="mx-2 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">
              Taking longer than usual
            </div>

            <div className="mt-1 text-sm">
              Sale products are taking longer to load.
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

        {/* ============================================
            ERROR
        ============================================ */}

        {!loading && combinedError ? (
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

        {/* ============================================
            PRODUCT GRID
        ============================================ */}

        <div className="mt-2 w-full">
          <ProductGrid
            key="independence-day-sale-grid"
            products={finalProducts}
            loading={loading}
          />
        </div>

        {/* ============================================
            EMPTY STATE
        ============================================ */}

        {!loading &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-zinc-900">
              Sale products coming soon.
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Check back shortly for our Independence Day picks.
            </p>
          </div>
        ) : null}

        {/* ============================================
            PRODUCT COUNT
        ============================================ */}

        {!loading &&
          !combinedError &&
          finalProducts.length > 0 ? (
          <div className="mt-6 text-center text-xs text-zinc-500">
            Showing {finalProducts.length} Independence Day picks
          </div>
        ) : null}
      </div>
    </main>
  );
}
