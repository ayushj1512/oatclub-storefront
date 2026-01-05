"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function RecommendedProducts({
  productIds = [],
  tags = [],
  category = "",
  limit = 10,
}) {
  const rowRef = useRef(null);

  const fetchProductDetailsSafe = useProductStore(
    (s) => s.fetchProductDetailsSafe
  );
  const fetchProductsByTag = useProductStore((s) => s.fetchProductsByTag);
  const fetchProductsByCategory = useProductStore((s) => s.fetchProductsByCategory);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ normalize IDs
  const ids = useMemo(() => {
    if (!Array.isArray(productIds)) return [];
    return Array.from(new Set(productIds.map((x) => String(x).trim()).filter(Boolean)));
  }, [productIds]);

  // ✅ normalize tags
  const tagKey = useMemo(() => {
    if (!Array.isArray(tags)) return "";
    return tags.map((t) => String(t).trim()).filter(Boolean).join(",");
  }, [tags]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // ✅ CASE 1: productIds exist → fetch exact products
        if (ids.length) {
          const results = await Promise.allSettled(
            ids.map((id) => fetchProductDetailsSafe(id))
          );

          const out = results
            .filter((r) => r.status === "fulfilled" && r.value)
            .map((r) => r.value);

          if (!cancelled) setProducts(out.slice(0, limit));
          return;
        }

        // ✅ CASE 2: fallback → fetch by tags
        if (tagKey) {
          await fetchProductsByTag({ tags: tagKey.split(","), page: 1, limit });
          const list = useProductStore.getState().allProducts || [];
          if (!cancelled) setProducts(list.slice(0, limit));
          return;
        }

        // ✅ CASE 3: fallback → fetch by category
        if (category) {
          await fetchProductsByCategory(category);
          const list = useProductStore.getState().allProducts || [];
          if (!cancelled) setProducts(list.slice(0, limit));
          return;
        }

        // ✅ nothing found
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ids.join(","), tagKey, category, limit, fetchProductDetailsSafe, fetchProductsByTag, fetchProductsByCategory]);

  // ✅ If nothing to recommend at all
  if (!ids.length && !tagKey && !category) return null;

  if (loading) {
    return (
      <section className="max-w-[1100px] mx-auto">
        <p className="text-sm text-gray-500">Loading recommended products…</p>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="max-w-[1100px] mx-auto">
        <p className="text-sm text-gray-500">
          No recommended products found for this blog.
        </p>
      </section>
    );
  }

  const scrollBy = (dir = 1) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir * 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10 max-w-[1100px] mx-auto">
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            Recommended Products
          </h2>
          <div className="h-px w-20 bg-black/30 mt-2" />
          <p className="text-sm text-gray-500 mt-1">
            Showing <b>{products.length}</b> products
          </p>
        </div>

        {/* SLIDER */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => scrollBy(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* PRODUCTS */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6"
      >
        {products.map((product, index) => (
          <div
            key={product.id ?? index}
            className="snap-start flex-shrink-0 w-[170px] sm:w-[200px] md:w-[220px] rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <ProductCard product={product} disableRecentlyViewed />
          </div>
        ))}
      </div>
    </section>
  );
}
