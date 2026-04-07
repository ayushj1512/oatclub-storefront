"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

import { useSearchStore } from "@/store/searchStore";
import ProductGrid from "@/components/common/ProductGrid";

/* =========================================================
   HELPERS
========================================================= */
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

  const {
    query,
    setQuery,
    results,
    total,
    loading,
    searchProducts,
    resetSearch,
  } = useSearchStore();

  const didInitRef = useRef(false);

  const queryTrim = String(query || "").trim();
  const canSearch = queryTrim.length >= 2;
  const effectiveLoading = canSearch ? loading : false;

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (!initialQuery) {
      resetSearch();
      return;
    }

    setQuery(initialQuery);

    if (initialQuery.length >= 2) {
      searchProducts({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    await searchProducts({ page: 1 });
    router.replace(`/search?q=${encodeURIComponent(queryTrim)}`);
  };

  const helperText = !queryTrim
    ? "Search for products"
    : !canSearch
      ? "Type at least 2 characters..."
      : effectiveLoading
        ? "Searching..."
        : gridProducts.length
          ? `Found ${total} products`
          : `No results for "${queryTrim}"`;

  return (
    <section className="min-h-screen w-full bg-white px-3 py-4 sm:px-4 sm:py-6">
      <form onSubmit={handleSubmit} className="mb-4 w-full">
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-11 w-full items-center gap-3 rounded-xl bg-gray-50 px-3 sm:flex-1">
            <Search className="h-4.5 w-4.5 shrink-0 text-gray-500" />
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
            <Search className="h-4 w-4" />
            <span>{loading ? "Searching..." : "Search"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>

      <p className="mb-5 px-1 text-center text-sm text-gray-700">{helperText}</p>

      {canSearch && (
        <ProductGrid products={gridProducts} loading={effectiveLoading} />
      )}
    </section>
  );
}