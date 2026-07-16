"use client";

import {
  useCallback,
  useEffect,
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
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name: A → Z", value: "title_asc" },
];

const getProductPrice = (product) => {
  const value = String(product?.price ?? "").replace(/[^\d.]/g, "");
  return Number(value) || 0;
};

const buildFacets = (products = []) => {
  const prices = products
    .map(getProductPrice)
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);

  return {
    priceMin: prices[0] || 0,
    priceMax: prices[prices.length - 1] || 0,
  };
};

export default function CollabReadyPage() {
  const collabProducts = useProductStore(
    (state) => state.collabProducts
  );

  const collabLoading = useProductStore(
    (state) => state.collabLoading
  );

  const collabError = useProductStore(
    (state) => state.collabError
  );

  const collabHasMore = useProductStore(
    (state) => state.collabHasMore
  );

  const fetchAvailableForCollabProducts = useProductStore(
    (state) => state.fetchAvailableForCollabProducts
  );

  const loadMoreCollabProducts = useProductStore(
    (state) => state.loadMoreCollabProducts
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [draftPriceMin, setDraftPriceMin] = useState(null);
  const [draftPriceMax, setDraftPriceMax] = useState(null);

  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const facets = useMemo(
    () => buildFacets(collabProducts),
    [collabProducts]
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
    fetchAvailableForCollabProducts({
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [sort, fetchAvailableForCollabProducts]);

  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
    setDraftPriceMin(facets.priceMin);
    setDraftPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

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

  const visibleProducts = useMemo(() => {
    const products = Array.isArray(collabProducts)
      ? [...collabProducts]
      : [];

    if (!products.length) return [];

    const lower = Math.min(
      priceMin ?? facets.priceMin,
      priceMax ?? facets.priceMax
    );

    const upper = Math.max(
      priceMin ?? facets.priceMin,
      priceMax ?? facets.priceMax
    );

    return products.filter((product) => {
      const price = getProductPrice(product);

      if (!price) return true;

      return price >= lower && price <= upper;
    });
  }, [
    collabProducts,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
  ]);

  const loadMore = useCallback(() => {
    if (collabLoading) return;
    if (!collabHasMore) return;
    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;

    loadMoreCollabProducts();

    setTimeout(() => {
      loadingMoreRef.current = false;
    }, 350);
  }, [
    collabLoading,
    collabHasMore,
    loadMoreCollabProducts,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      {
        rootMargin: "800px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore]);

  const retry = useCallback(() => {
    fetchAvailableForCollabProducts({
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [fetchAvailableForCollabProducts, sort]);

  const showInitialLoading =
    collabLoading && collabProducts.length === 0;

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

      <div className="w-full pb-6 pt-2 sm:pt-3">
        <section className="px-2 sm:px-2.5 md:px-3">
          <div className="border-b border-black/10 pb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/45 sm:text-[10px]">
              OATCLUB Creator Edit
            </p>

            <h1 className="mt-1 text-xl font-black uppercase tracking-[-0.03em] text-black sm:text-2xl md:text-3xl">
              Collab Ready
            </h1>

            <p className="mt-1 max-w-xl text-xs leading-5 text-black/55 sm:text-sm">
              Selected styles currently available for creator and barter collaborations.
            </p>
          </div>
        </section>

        <div className="px-2 sm:px-2.5 md:px-3">
          <FilterSortBar
            category="Collab Ready"
            showInitialLoading={showInitialLoading}
            sort={sort}
            setSort={setSort}
            sortOptions={SORT_OPTIONS}
            setDrawerOpen={setDrawerOpen}
          />
        </div>

        {!showInitialLoading && collabError ? (
          <div className="mx-2 mt-3 border border-red-200 bg-red-50 p-3 text-red-700 sm:mx-2.5 md:mx-3">
            <div className="text-sm font-bold">
              Unable to load collab products
            </div>

            <div className="mt-1 text-xs">
              {collabError}
            </div>

            <button
              type="button"
              onClick={retry}
              className="mt-3 bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!showInitialLoading &&
        !collabError &&
        visibleProducts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-black">
              No collab-ready styles
            </p>

            <p className="mt-2 text-xs text-black/45">
              New collaboration products will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-2 w-full">
            <ProductGrid
              key={`collab-ready-${sort}`}
              products={visibleProducts}
              loading={showInitialLoading}
            />
          </div>
        )}

        {!collabError && collabProducts.length > 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 px-2">
            {collabHasMore ? (
              <>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={collabLoading}
                  className="h-10 min-w-32 border border-black bg-white px-5 text-[10px] font-black uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {collabLoading ? "Loading..." : "Load More"}
                </button>

                <p className="text-[10px] uppercase tracking-[0.08em] text-black/40">
                  Showing {visibleProducts.length} styles
                </p>
              </>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
                End of collection
              </p>
            )}
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-1 w-full" />
      </div>
    </main>
  );
}