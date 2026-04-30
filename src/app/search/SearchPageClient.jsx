"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";

import { useSearchStore } from "@/store/searchStore";
import ProductGrid from "@/components/common/ProductGrid";

const normalizeProductForGrid = (p) => {
  if (!p?._id) return null;

  const imageList =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : p.thumbnail
        ? [p.thumbnail]
        : [];

  return {
    id: p._id,
    _id: p._id,
    title: p.title || "",
    name: p.title || "",
    slug: p.slug || "",
    productCode: p.productCode || "",
    price: String(p.price ?? ""),
    sale_price:
      p.compareAtPrice && p.compareAtPrice > p.price ? String(p.price) : null,
    regular_price: p.compareAtPrice
      ? String(p.compareAtPrice)
      : String(p.price ?? ""),
    images: imageList.map((src) => ({ src })),
    thumbnail: p.thumbnail || "",
    image: p.thumbnail || p.images?.[0] || "",
    categories: Array.isArray(p.categories) ? p.categories : [],
    isBestSeller: !!p.isBestSeller,
    isTrending: !!p.isTrending,
    raw: p,
    __raw: p,
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

    if (initialQuery.length >= 2) {
      searchProducts({ page: 1, query: initialQuery });
    }
  }, [initialQuery, resetSearch, searchProducts, setQuery]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const gridProducts = useMemo(
    () => (results || []).map(normalizeProductForGrid).filter(Boolean),
    [results]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    ? "Search for products"
    : !canSearch
      ? "Type at least 2 characters..."
      : loading && !gridProducts.length
        ? "Searching..."
        : error
          ? error
          : searched && !gridProducts.length
            ? `No results for "${queryTrim}"`
            : gridProducts.length
              ? `Found ${total} products`
              : "Press search to find products";

  return (
    <section className="min-h-screen w-full bg-white px-3 py-4 sm:px-4 sm:py-6">
      <form onSubmit={handleSubmit} className="mb-4 w-full">
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
          <div className="flex h-11 w-full items-center gap-3 rounded-xl bg-gray-50 px-3 sm:flex-1">
            <Search className="h-4 w-4 shrink-0 text-gray-500" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, title, tag, category, color..."
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!canSearch || loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:min-w-[130px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            <span>{loading ? "Searching..." : "Search"}</span>

            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>

      <p className="mb-5 px-1 text-center text-sm text-gray-700">
        {helperText}
      </p>

      {canSearch && (
        <>
          <ProductGrid
            products={gridProducts}
            loading={loading && !gridProducts.length}
          />

          <div ref={loaderRef} className="flex h-16 items-center justify-center">
            {loading && gridProducts.length > 0 && (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            )}

            {!loading && hasMore && (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
              >
                Load more
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}