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
  const fetchProductsByCategory = useProductStore(
    (s) => s.fetchProductsByCategory
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const ids = useMemo(() => {
    if (!Array.isArray(productIds)) return [];
    return [...new Set(productIds.map((x) => String(x).trim()).filter(Boolean))];
  }, [productIds]);

  const tagList = useMemo(() => {
    if (!Array.isArray(tags)) return [];
    return [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))];
  }, [tags]);

  const tagKey = tagList.join(",");
  const categoryKey = String(category || "").trim();

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);

        if (ids.length) {
          const results = await Promise.allSettled(
            ids.map((id) => fetchProductDetailsSafe(id))
          );

          const list = results
            .filter((r) => r.status === "fulfilled" && r.value)
            .map((r) => r.value)
            .filter(Boolean)
            .slice(0, limit);

          if (!cancelled) setProducts(list);
          return;
        }

        if (tagList.length) {
          await fetchProductsByTag({
            tags: tagList,
            page: 1,
            limit,
            isActive: true,
            sort: "newest",
            card: 1,
          });

          const list = useProductStore.getState().allProducts || [];
          if (!cancelled) setProducts(list.slice(0, limit));
          return;
        }

        if (categoryKey) {
          await fetchProductsByCategory(categoryKey, {
            page: 1,
            limit,
            isActive: true,
            sort: "newest",
            card: 1,
          });

          const list = useProductStore.getState().allProducts || [];
          if (!cancelled) setProducts(list.slice(0, limit));
          return;
        }

        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    ids,
    tagKey,
    categoryKey,
    limit,
    fetchProductDetailsSafe,
    fetchProductsByTag,
    fetchProductsByCategory,
  ]);

  if (!ids.length && !tagList.length && !categoryKey) return null;

  if (loading) {
    return (
      <section className="mt-10">
        <p className="text-sm text-zinc-500">Loading recommended products…</p>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="mt-10">
        <p className="text-sm text-zinc-500">
          No recommended products found for this blog.
        </p>
      </section>
    );
  }

  const scrollBy = (dir = 1) => {
    rowRef.current?.scrollBy({
      left: dir * 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            Recommended Products
          </h2>
          <div className="mt-2 h-px w-20 bg-black/30" />
          <p className="mt-1 text-sm text-zinc-500">
            Showing <b>{products.length}</b> products
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <ArrowButton onClick={() => scrollBy(-1)} label="Scroll left">
            <ChevronLeft size={18} />
          </ArrowButton>

          <ArrowButton onClick={() => scrollBy(1)} label="Scroll right">
            <ChevronRight size={18} />
          </ArrowButton>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6"
      >
        {products.map((product, index) => (
          <div
            key={product?._id || product?.id || product?.productCode || index}
            className="snap-start w-[170px] flex-shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:w-[200px] md:w-[220px]"
          >
            <ProductCard product={product} disableRecentlyViewed />
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrowButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/10 transition hover:bg-zinc-50 active:scale-95"
    >
      {children}
    </button>
  );
}