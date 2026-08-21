"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";
import { useProductStore } from "@/store/productStore";

const LIMIT = 200;
const MAX_SHIMMER_MS = 8000;

const getProductId = (p) =>
  String(p?.id || p?._id || p?.productId || "");

export default function FestiveEditPage() {
  const pageTitle = "Festive Edit";

  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const clearError = useProductStore((s) => s.clearError);
  const storeError = useProductStore((s) => s.error);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [localError, setLocalError] = useState("");

  const timeoutRef = useRef(null);
  const firstRunRef = useRef(false);

  const combinedError = localError || storeError;

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const startTimeout = useCallback(() => {
    setTimedOut(false);
    stopTimeout();

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
    }, MAX_SHIMMER_MS);
  }, [stopTimeout]);

  const loadProducts = useCallback(async () => {
    clearError?.();
    setLoading(true);
    setTimedOut(false);
    setLocalError("");
    setProducts([]);
    startTimeout();

    try {
      await fetchProducts({
        isActive: true,
        isDraft: false,
        isBestSeller: true,
        page: 1,
        limit: LIMIT,
        sort: "newest",
      });

      const bestsellers = [
        ...(useProductStore.getState().allProducts || []),
      ];

      await fetchProducts({
        isActive: true,
        isDraft: false,
        isTrending: true,
        page: 1,
        limit: LIMIT,
        sort: "newest",
      });

      const trending = [
        ...(useProductStore.getState().allProducts || []),
      ];

      const seen = new Set();

      const merged = [...bestsellers, ...trending].filter((product) => {
        const id = getProductId(product);
        if (!id || seen.has(id)) return false;

        seen.add(id);
        return true;
      });

      setProducts(merged);
    } catch (error) {
      console.error("Festive Edit products error:", error);

      setLocalError(
        error?.message || "Failed to load Festive Edit products."
      );
    } finally {
      stopTimeout();
      setLoading(false);
    }
  }, [clearError, fetchProducts, startTimeout, stopTimeout]);

  useEffect(() => {
    if (firstRunRef.current) return;

    firstRunRef.current = true;
    loadProducts();

    return stopTimeout;
  }, [loadProducts, stopTimeout]);

  const finalProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full pb-6 pt-2 sm:pt-3">
        <div className="px-2 sm:px-2.5 md:px-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#e91e63]">
            Festive Picks
          </p>

          <h1 className="mt-1 text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            {pageTitle}
          </h1>
        </div>

        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category={pageTitle}
            showInitialLoading={loading}
            hideFilterButton
            sort="newest"
            setSort={() => { }}
            sortOptions={[{ label: "Featured", value: "newest" }]}
          />
        </div>

        {!loading &&
          timedOut &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <div className="mx-2 mt-3 rounded-xl border border-pink-200 bg-pink-50 p-3 text-pink-800 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">Taking longer than usual</div>

            <div className="mt-1 text-sm">
              Festive products are taking longer to load.
            </div>

            <button
              onClick={loadProducts}
              className="mt-3 rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && combinedError ? (
          <div className="mx-2 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">Something went wrong</div>

            <div className="mt-1 text-sm">{combinedError}</div>

            <button
              onClick={loadProducts}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-2 w-full">
          <ProductGrid
            key="festive-edit-grid"
            products={finalProducts}
            loading={loading}
          />
        </div>

        {!loading &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-zinc-900">
              Festive picks coming soon.
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Check back shortly for our festive edit.
            </p>
          </div>
        ) : null}

        {!loading &&
          !combinedError &&
          finalProducts.length > 0 ? (
          <div className="mt-6 text-center text-xs text-zinc-500">
            Showing {finalProducts.length} festive picks
          </div>
        ) : null}
      </div>
    </main>
  );
}
