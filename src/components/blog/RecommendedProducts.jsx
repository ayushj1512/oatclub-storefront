"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function RecommendedProducts({
  productIds = [],
  tags = [],
  category = "",
  limit = 10,
}) {
  const rowRef = useRef(null);

  const fetchProductDetailsSafe = useProductStore((s) => s.fetchProductDetailsSafe);
  const fetchProductsByTag = useProductStore((s) => s.fetchProductsByTag);
  const fetchProductsByCategory = useProductStore((s) => s.fetchProductsByCategory);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const ids = useMemo(
    () => [...new Set((productIds || []).map((x) => String(x).trim()).filter(Boolean))],
    [productIds]
  );

  const tagList = useMemo(
    () => [...new Set((tags || []).map((t) => String(t).trim()).filter(Boolean))],
    [tags]
  );

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

          if (!cancelled) {
            setProducts((useProductStore.getState().allProducts || []).slice(0, limit));
          }
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

          if (!cancelled) {
            setProducts((useProductStore.getState().allProducts || []).slice(0, limit));
          }
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

  const scrollBy = (dir = 1) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="mt-8 border-y-2 border-black py-5">
        <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-black/60">
          Loading The Oatclub Picks…
        </p>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 border-y-2 border-black py-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/50">
          Style Desk Selects
        </p>

        <h2 className="mt-1 font-serif text-3xl font-black uppercase leading-none tracking-tight text-black md:text-5xl">
          Recommended Products
        </h2>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-black/60">
          OWN ALL TRENDS
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between border-b border-black pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/60">
          Showing {products.length} curated fits
        </p>

        <div className="hidden gap-2 sm:flex">
          <ArrowButton onClick={() => scrollBy(-1)} label="Scroll left">
            <ChevronLeft size={16} />
          </ArrowButton>

          <ArrowButton onClick={() => scrollBy(1)} label="Scroll right">
            <ChevronRight size={16} />
          </ArrowButton>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-4 md:gap-3"
      >
        {products.map((product, index) => (
          <div
            key={product?._id || product?.id || product?.productCode || index}
            className="w-[160px] shrink-0 snap-start border border-black bg-white sm:w-[200px] md:w-[220px]"
          >
            <ProductCard product={product} disableRecentlyViewed />
          </div>
        ))}

        <Link
          href="/new-arrivals"
          className="flex aspect-[4/5] w-[160px] shrink-0 snap-start flex-col items-center justify-center border border-black bg-black p-4 text-center text-white transition hover:bg-white hover:text-black sm:w-[200px] md:w-[220px]"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">
            Oatclub
          </p>

          <h3 className="mt-2 font-serif text-3xl font-black uppercase leading-none">
            Shop More
          </h3>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
            Curated Fits
          </p>

          <span className="mt-5 grid h-9 w-9 place-items-center border border-current">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
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
      className="grid h-9 w-9 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}