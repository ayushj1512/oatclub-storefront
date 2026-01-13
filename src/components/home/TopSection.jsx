"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function TopSectionFeatured() {
  const { allProducts, isLoading, error, fetchProductsByCategory } =
    useProductStore();

  const fetchedRef = useRef(false);
  const scrollRef = useRef(null);

  // ✅ keep one source of truth
  const CATEGORY = "top"; // <-- set this to "tops" if your DB stores "tops"
  const ACCEPT = new Set(["top", "tops"]); // ✅ safety: accept both

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProductsByCategory(CATEGORY, {
      page: 1,
      limit: 60,
      isActive: true,
      sort: "newest",
    });
  }, [fetchProductsByCategory]);

  const scrollRow = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const products = useMemo(() => {
    const list = (allProducts || [])
      .filter((p) => p?.raw?.isActive !== false)
      .filter((p) => p?.isInStock !== false)
      .filter((p) => {
        const cats = Array.isArray(p?.raw?.categories)
          ? p.raw.categories
          : Array.isArray(p?.categories)
          ? p.categories
          : [];

        return cats.some((c) => ACCEPT.has(String(c || "").trim().toLowerCase()));
      });

    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 12);

    return shuffled.map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      price: Number(p.price || 0),
      originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.image || "/placeholder.png",
      slug: p.slug || p.id,
      on_sale:
        p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price || 0),
      category: p.category,
      currency: p.currency,
    }));
  }, [allProducts]);

  const showShimmer = isLoading && !products.length;
  const showArrows = (products?.length || 0) > 2 || showShimmer;

  if (showShimmer) {
    return (
      <section className="pt-2 px-4 bg-white">
        <div className="w-full bg-black text-center mb-10">
          <h2 className="text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.28em]">
            Tops
          </h2>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory px-1"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
              >
                <ProductCard loading />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <motion.section
      className="pt-2 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="w-full bg-black text-center mb-10">
        <h2 className="text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.28em]">
          Tops
        </h2>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      )}

      <div className="relative">
        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>
        )}

        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>
        )}

        {showArrows && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-1"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}