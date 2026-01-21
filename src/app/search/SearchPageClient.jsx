"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { useSearchStore } from "@/store/searchStore";
import ProductGrid from "@/components/common/ProductGrid";

/* ---------- NORMALIZER (short + robust) ---------- */
const imgSrc = (x) =>
  typeof x === "string"
    ? x
    : x?.src || x?.url || x?.secure_url || x?.path || x?.location || "";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeProductForGrid = (p) => {
  if (!p) return null;

  return {
    id: p._id,
    _id: p._id,

    // ✅ ProductCard expects title/name both
    title: p.title,
    name: p.title,
    slug: p.slug,

    // ✅ VERY IMPORTANT: ProductCard needs productCode
    productCode: p.productCode || p?.raw?.productCode || "",

    price: String(p.price ?? ""),
    sale_price:
      p.compareAtPrice && p.compareAtPrice > p.price ? String(p.price) : null,
    regular_price: p.compareAtPrice ? String(p.compareAtPrice) : String(p.price),

    // ✅ ProductCard reads: images[0].src OR images[0]
    images: (p.images?.length ? p.images : p.thumbnail ? [p.thumbnail] : []).map(
      (src) => ({ src })
    ),

    thumbnail: p.thumbnail || "",
    image: p.thumbnail || p.images?.[0] || "",

    categories: Array.isArray(p.categories)
      ? p.categories
      : [],

    stock_status: p.isInStock ? "instock" : "outofstock",
    stock_quantity: p.stock ?? 0,

    // ✅ IMPORTANT: ProductCard checks product.raw.productCode
    raw: p,        // 👈 add this
    __raw: p,      // keep existing
  };
};



export default function SearchPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";

  const { query, setQuery, results, loading, total, searchProducts, resetSearch } =
    useSearchStore();

  const didInitRef = useRef(false);
  const lastUrlQueryRef = useRef(initialQuery.trim());

  const queryTrim = (query || "").trim();
  const canSearch = queryTrim.length >= 2;
  const effectiveLoading = canSearch ? loading : false;

  /* URL → Store sync (mount only) */
  useEffect(() => {
    const iq = initialQuery.trim();
    didInitRef.current = true;
    lastUrlQueryRef.current = iq;

    if (iq) {
      setQuery(iq);
      if (iq.length >= 2) searchProducts({ page: 1 });
    } else {
      resetSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Debounced search */
  useEffect(() => {
    if (!didInitRef.current) return;

    if (!queryTrim) {
      resetSearch();
      if (lastUrlQueryRef.current) {
        router.replace("/search");
        lastUrlQueryRef.current = "";
      }
      return;
    }

    if (!canSearch) {
      if (lastUrlQueryRef.current) {
        router.replace("/search");
        lastUrlQueryRef.current = "";
      }
      return;
    }

    const t = setTimeout(() => {
      searchProducts({ page: 1 });

      const nextUrl = `/search?q=${encodeURIComponent(queryTrim)}`;
      if (lastUrlQueryRef.current !== queryTrim) {
        router.replace(nextUrl);
        lastUrlQueryRef.current = queryTrim;
      }
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTrim]);

  const gridProducts = useMemo(
    () => (results || []).map(normalizeProductForGrid).filter((x) => x?.id),
    [results]
  );

  return (
    <section className="w-full min-h-screen bg-white px-4 py-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSearch) return;

          searchProducts({ page: 1 });

          const nextUrl = `/search?q=${encodeURIComponent(queryTrim)}`;
          if (lastUrlQueryRef.current !== queryTrim) {
            router.replace(nextUrl);
            lastUrlQueryRef.current = queryTrim;
          }
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

      <h2 className="text-sm text-black mb-4 text-center">
        {!queryTrim
          ? "Search for products"
          : !canSearch
          ? "Type at least 2 characters…"
          : effectiveLoading
          ? "Searching..."
          : gridProducts.length
          ? `Found ${total} products`
          : `No results for "${queryTrim}"`}
      </h2>

    

      {canSearch && (
        <ProductGrid products={gridProducts} loading={effectiveLoading} />
      )}
    </section>
  );
}
