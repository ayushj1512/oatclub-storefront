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

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL;

const PAGE_LIMIT = 200;
const MAX_SHIMMER_MS = 8000;

const getProductId = (product) =>
  String(
    product?.id ||
    product?._id ||
    product?.productId ||
    product?.raw?._id ||
    "",
  ).trim();

const normalizeProduct = (product = {}) => {
  const id = String(product?._id || product?.id || "");

  const images = Array.isArray(product?.images)
    ? product.images
    : [];

  const thumbnail =
    product?.thumbnail ||
    product?.image ||
    images[0] ||
    "/placeholder.png";

  return {
    ...product,

    id,
    productId: id,

    name:
      product?.name ||
      product?.title ||
      "",

    title:
      product?.title ||
      product?.name ||
      "",

    image: thumbnail,
    thumbnail,
    images,

    price: Number(product?.price || 0),

    compareAtPrice:
      product?.compareAtPrice ?? null,

    isBestSeller:
      Boolean(product?.isBestSeller),

    isTrending:
      Boolean(product?.isTrending),

    isActive:
      Boolean(product?.isActive),

    isDraft:
      Boolean(product?.isDraft),

    raw: product,
  };
};

const uniqueProducts = (products = []) => {
  const seen = new Set();

  return products.filter((product) => {
    const id = getProductId(product);

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
};

const fetchProductList = async (params = {}) => {
  if (!BACKEND) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL missing",
    );
  }

  const qs = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      qs.set(key, String(value));
    },
  );

  const response = await fetch(
    `${BACKEND}/api/products?${qs.toString()}`,
    {
      cache: "no-store",
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Failed to load products",
    );
  }

  return (
    Array.isArray(data?.products)
      ? data.products
      : []
  ).map(normalizeProduct);
};

export default function BestsellerPage() {
  const pageTitle = "Bestsellers";

  const [products, setProducts] =
    useState([]);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [timedOut, setTimedOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const timeoutRef = useRef(null);
  const firstRunRef = useRef(false);

  /* =========================================================
     TIMEOUT
  ========================================================= */

  const startTimeout = useCallback(() => {
    setTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(
        timeoutRef.current,
      );
    }

    timeoutRef.current =
      setTimeout(() => {
        setTimedOut(true);
        setInitialLoading(false);
      }, MAX_SHIMMER_MS);
  }, []);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(
        timeoutRef.current,
      );
    }

    timeoutRef.current = null;
  }, []);

  /* =========================================================
     FETCH:
     BESTSELLERS -> TRENDING -> END
  ========================================================= */
  const runInitial = useCallback(async () => {
    setInitialLoading(true);
    setTimedOut(false);
    setError("");
    setProducts([]);

    startTimeout();

    try {
      /* =========================
         1. BESTSELLERS
      ========================= */

      const bestsellers =
        await fetchProductList({
          isActive: true,
          isDraft: false,
          isBestSeller: true,
          page: 1,
          limit: PAGE_LIMIT,
          sort: "default",
        });

      /* =========================
         2. TRENDING
      ========================= */

      const trending =
        await fetchProductList({
          isActive: true,
          isDraft: false,
          isTrending: true,
          page: 1,
          limit: PAGE_LIMIT,
          sort: "default",
        });

      /* =========================
         3. DEDUPE
         Bestseller wins
      ========================= */

      const bestsellerIds = new Set(
        bestsellers
          .map(getProductId)
          .filter(Boolean),
      );

      const trendingOnly =
        trending.filter((product) => {
          const id = getProductId(product);

          return (
            id &&
            !bestsellerIds.has(id)
          );
        });

      /* =========================
         FINAL ORDER
      ========================= */

      setProducts(
        uniqueProducts([
          ...bestsellers,
          ...trendingOnly,
        ]),
      );
    } catch (err) {
      console.error(
        "Bestseller page error:",
        err,
      );

      setError(
        err?.message ||
        "Failed to load featured products.",
      );
    } finally {
      stopTimeout();
      setInitialLoading(false);
    }
  }, [
    startTimeout,
    stopTimeout,
  ]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (firstRunRef.current) {
      return;
    }

    firstRunRef.current = true;

    runInitial();

    return () => {
      stopTimeout();
    };
  }, [
    runInitial,
    stopTimeout,
  ]);

  /* =========================================================
     FINAL LIST
  ========================================================= */

  const finalList = useMemo(
    () =>
      Array.isArray(products)
        ? products
        : [],
    [products],
  );

  const retry = useCallback(() => {
    runInitial();
  }, [runInitial]);

  const showInitialLoading =
    initialLoading &&
    finalList.length === 0;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="w-full pb-4 pt-2 sm:pb-5 sm:pt-3">

        {/* Heading */}
        <div className="px-2 sm:px-2.5 md:px-3">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            {pageTitle}
          </h1>
        </div>

        {/* Sort */}
        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category={pageTitle}
            showInitialLoading={
              showInitialLoading
            }
            hideFilterButton
            sort="featured"
            setSort={() => { }}
            sortOptions={[
              {
                label: "Featured",
                value: "featured",
              },
            ]}
          />
        </div>

        {/* Timeout */}
        {!showInitialLoading &&
          timedOut &&
          !error &&
          finalList.length === 0 ? (
          <div className="mx-2 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 sm:mx-2.5 md:mx-3">
            <div className="font-semibold">
              Taking longer than usual
            </div>

            <div className="mt-1 text-sm">
              Products are taking longer
              to load. Please try again.
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
          error ? (
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
            key="bestseller-grid"
            products={finalList}
            loading={
              showInitialLoading
            }
          />
        </div>

        {/* Empty */}
        {!showInitialLoading &&
          !error &&
          finalList.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-zinc-900">
              No featured products
              available.
            </p>
          </div>
        ) : null}

        {/* Count */}
        {!showInitialLoading &&
          !error &&
          finalList.length > 0 ? (
          <div className="mt-5 text-center text-xs text-zinc-500">
            Showing{" "}
            {finalList.length}{" "}
            featured products
          </div>
        ) : null}
      </div>
    </main>
  );
}
