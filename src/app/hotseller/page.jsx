"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";
import { useProductStore } from "@/store/productStore";

const LIMIT = 200;
const MAX_SHIMMER_MS = 8000;

const getProductId = (product) =>
  String(
    product?.id ||
    product?._id ||
    product?.productId ||
    "",
  );

export default function HotsellerPage() {
  const fetchProducts = useProductStore(
    (state) => state.fetchProducts,
  );

  const clearError = useProductStore(
    (state) => state.clearError,
  );

  const storeError = useProductStore(
    (state) => state.error,
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [localError, setLocalError] = useState("");

  const timeoutRef = useRef(null);
  const firstRunRef = useRef(false);

  const combinedError = localError || storeError;

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

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
        ...(useProductStore.getState().allProducts ||
          []),
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
        ...(useProductStore.getState().allProducts ||
          []),
      ];

      const seen = new Set();

      const merged = [
        ...bestsellers,
        ...trending,
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
        "Hotseller products error:",
        error,
      );

      setLocalError(
        error?.message ||
        "Failed to load hotseller products.",
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
    loadProducts();

    return stopTimeout;
  }, [loadProducts, stopTimeout]);

  const finalProducts = useMemo(
    () =>
      Array.isArray(products) ? products : [],
    [products],
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full pb-6 pt-2 sm:pt-3">
        <div className="px-2 sm:px-2.5 md:px-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Trending Right Now 🔥
          </p>

          <h1 className="mt-1 text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            Hotseller
          </h1>
        </div>

        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category="Hotseller"
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

        {!loading &&
          timedOut &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <StatusBox
            title="Taking longer than usual"
            message="Hotseller products are taking longer to load."
            onRetry={loadProducts}
          />
        ) : null}

        {!loading && combinedError ? (
          <StatusBox
            error
            title="Something went wrong"
            message={combinedError}
            onRetry={loadProducts}
          />
        ) : null}

        <div className="mt-2 w-full">
          <ProductGrid
            key="hotseller-grid"
            products={finalProducts}
            loading={loading}
          />
        </div>

        {!loading &&
          !combinedError &&
          finalProducts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-zinc-900">
              Hotsellers coming soon.
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Check back shortly for trending
              styles.
            </p>
          </div>
        ) : null}

        {!loading &&
          !combinedError &&
          finalProducts.length > 0 ? (
          <div className="mt-6 text-center text-xs text-zinc-500">
            Showing {finalProducts.length} hot
            styles
          </div>
        ) : null}
      </div>
    </main>
  );
}

function StatusBox({
  title,
  message,
  onRetry,
  error = false,
}) {
  return (
    <div
      className={`mx-2 mt-3 rounded-xl border p-3 sm:mx-2.5 md:mx-3 ${error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-orange-200 bg-orange-50 text-orange-800"
        }`}
    >
      <div className="font-semibold">{title}</div>

      <div className="mt-1 text-sm">
        {message}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white ${error ? "bg-red-700" : "bg-orange-600"
          }`}
      >
        Retry
      </button>
    </div>
  );
}
