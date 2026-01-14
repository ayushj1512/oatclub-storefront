"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { useSearchStore } from "@/store/searchStore";
import ProductGrid from "@/components/common/ProductGrid";

/* ---------------- SORT OPTIONS ---------------- */
const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "rating", label: "Top Rated" },
  { id: "popularity", label: "Most Popular" },
];

/* ---------------- NORMALIZER ---------------- */
const normalizeProductForGrid = (p) => {
  if (!p) return null;

  return {
    id: p._id,
    _id: p._id,
    name: p.title,
    slug: p.slug,

    price: String(p.price ?? ""),
    sale_price:
      p.compareAtPrice && p.compareAtPrice > p.price ? String(p.price) : null,
    regular_price: p.compareAtPrice ? String(p.compareAtPrice) : String(p.price),

    images: (p.images?.length ? p.images : p.thumbnail ? [p.thumbnail] : []).map(
      (src) => ({ src })
    ),

    image: p.thumbnail || p.images?.[0] || "",

    categories: Array.isArray(p.category)
      ? p.category.map((c) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
        }))
      : [],

    stock_status: p.isInStock ? "instock" : "outofstock",
    stock_quantity: p.stock ?? 0,

    __raw: p,
  };
};

export default function SearchPageClient() {
  const router = useRouter();
  const params = useSearchParams();

  const initialQuery = params.get("q") || "";

  const { query, setQuery, results, loading, total, searchProducts } =
    useSearchStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const queryTrim = (query || "").trim();

  // ✅ Only allow search + grid when user typed something meaningful
  const canSearch = queryTrim.length >= 2;

  // ✅ Even if store loading is true, ignore it until canSearch
  const effectiveLoading = canSearch ? loading : false;

  /* URL → Store sync */
  useEffect(() => {
    const iq = (initialQuery || "").trim();
    if (iq && iq !== query) {
      setQuery(iq);
      if (iq.length >= 2) searchProducts();
    }
    // eslint-disable-next-line
  }, []);

  /* Debounced search */
  useEffect(() => {
    if (!canSearch) {
      // ✅ keep url clean when cleared
      if (params.get("q")) router.replace("/search");
      return;
    }

    const t = setTimeout(() => {
      searchProducts();
      router.replace(`/search?q=${encodeURIComponent(queryTrim)}`);
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTrim]);

  /* ✅ NORMALIZED RESULTS */
  const gridProducts = useMemo(
    () => (results || []).map(normalizeProductForGrid).filter(Boolean),
    [results]
  );

  return (
    <section className="w-full min-h-screen bg-white px-4 py-6">
      {/* SEARCH BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSearch) return; // ✅ empty/short: do nothing
          searchProducts();
          router.replace(`/search?q=${encodeURIComponent(queryTrim)}`);
        }}
        className="flex items-center bg-gray-100 border border-gray-300 px-4 py-2 rounded-md shadow-sm mb-4"
      >
        <Search className="text-gray-700 w-5 h-5" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-3 bg-transparent outline-none text-sm text-black"
        />
      </form>

      {/* RESULTS HEADER */}
      <h2 className="text-sm text-black mb-4 text-center">
        {!canSearch
          ? "Search for products"
          : effectiveLoading
          ? "Searching..."
          : gridProducts.length
          ? `Found ${total} products`
          : `No results for "${queryTrim}"`}
      </h2>

      {/* ✅ DO NOT RENDER PRODUCT GRID UNTIL USER SEARCHES */}
      {canSearch ? (
        <ProductGrid products={gridProducts} loading={effectiveLoading} />
      ) : null}
    </section>
  );
}
