"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useSearchStore } from "@/store/searchStore";
import ProductGrid from "@/components/common/ProductGrid";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

const normalizeProductForGrid = (product) => {
  if (!product?._id) return null;
  const imageList =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  return {
    id: product._id,
    _id: product._id,
    title: product.title || "",
    name: product.title || "",
    slug: product.slug || "",
    productCode: product.productCode || "",
    price: String(product.price ?? ""),
    sale_price:
      product.compareAtPrice && product.compareAtPrice > product.price
        ? String(product.price)
        : null,
    regular_price: product.compareAtPrice
      ? String(product.compareAtPrice)
      : String(product.price ?? ""),
    images: imageList.map((src) => ({ src })),
    thumbnail: product.thumbnail || "",
    image: product.thumbnail || product.images?.[0] || "",
    categories: Array.isArray(product.categories) ? product.categories : [],
    isBestSeller: !!product.isBestSeller,
    isTrending: !!product.isTrending,
    raw: product,
  };
};

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = (searchParams.get("q") || "").trim();
  const didInitRef = useRef(false);
  const loaderRef = useRef(null);

  const {
    query,
    setQuery,
    results,
    total,
    page,
    pages,
    loading,
    searched,
    error,
    searchProducts,
    loadMore,
    resetSearch,
  } = useSearchStore();

  const queryTrim = String(query || "").trim();
  const canSearch = queryTrim.length >= 2;
  const hasMore = page < pages;

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (!initialQuery) {
      resetSearch();
      return;
    }
    setQuery(initialQuery);
    if (initialQuery.length >= 2) searchProducts({ page: 1, query: initialQuery });
  }, [initialQuery, resetSearch, searchProducts, setQuery]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "300px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const gridProducts = useMemo(
    () => (results || []).map(normalizeProductForGrid).filter(Boolean),
    [results]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!queryTrim) {
      resetSearch();
      router.replace("/search");
      return;
    }
    if (!canSearch) return;
    router.replace(`/search?q=${encodeURIComponent(queryTrim)}`);
    await searchProducts({ page: 1, query: queryTrim });
  };

  const helperText = !queryTrim
    ? "SEARCH BY PRODUCT, CODE, CATEGORY OR COLOR"
    : !canSearch
      ? "TYPE AT LEAST 2 CHARACTERS"
      : loading && !gridProducts.length
        ? "SEARCHING THE EDIT"
        : error
          ? String(error).toUpperCase()
          : searched && !gridProducts.length
            ? `NO RESULTS FOR "${queryTrim}"`
            : gridProducts.length
              ? `${total} PRODUCTS FOUND`
              : "PRESS SEARCH TO FIND PRODUCTS";

  return (
    <main className="min-h-screen bg-white px-2.5 py-4 text-black md:px-6 md:py-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-3 border-b border-neutral-200 pb-3 md:mb-4 md:pb-4">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-black/45">
            OATCLUB SEARCH
          </p>
          <h1 className="mt-1.5 text-xl font-black uppercase leading-tight md:text-3xl">
            FIND YOUR NEXT EDIT
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="border-b border-neutral-200 pb-3 md:pb-4">
          <div className="grid gap-2 md:grid-cols-[1fr_150px]">
            <label className="flex h-10 items-center gap-2.5 border border-black/10 bg-white px-3 md:h-11">
              <Search className="h-3.5 w-3.5 text-black/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="SEARCH PRODUCT CODE, TITLE, CATEGORY"
                className="w-full bg-transparent text-[10px] font-bold uppercase tracking-[0.12em] text-black outline-none placeholder:text-black/35 md:text-xs"
              />
            </label>

            <button
              type="submit"
              disabled={!canSearch || loading}
              className="flex h-10 items-center justify-center gap-2 bg-black text-[9px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:bg-neutral-300 md:h-11 md:text-[10px]"
            >
              SEARCH
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>

        <p className="my-3 text-center text-[9px] font-black uppercase tracking-[0.2em] text-black/45 md:my-4 md:text-[10px]">
          {helperText}
        </p>

        {loading && !gridProducts.length ? (
          <UniversalLuxuryLoader />
        ) : canSearch ? (
          <>
            <ProductGrid products={gridProducts} loading={false} />
            <div ref={loaderRef} className="flex min-h-14 items-center justify-center py-3">
              {loading && gridProducts.length > 0 ? <UniversalLuxuryLoader /> : null}
              {!loading && hasMore ? (
                <button
                  type="button"
                  onClick={loadMore}
                  className="border border-black px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
                >
                  LOAD MORE
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
