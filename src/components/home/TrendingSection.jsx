"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function TrendingSection() {
  const { allProducts, isLoading, error, fetchProducts } = useProductStore();
  const fetchedRef = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProducts({ page: 1, limit: 60, isActive: true, sort: "newest" });
  }, [fetchProducts]);

  // ✅ scroll helper
  const scrollRow = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  // ✅ Randomize products once per data change (stable shuffle)
  const products = useMemo(() => {
    const list = (allProducts || []).filter((p) => p?.isInStock !== false);

    // shuffle
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 12);

    return shuffled.map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      price: Number(p.price || 0),
      originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.image || "/placeholder.png",
      slug: p.slug || p.id,
      on_sale: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price || 0),
      category: p.category,
      currency: p.currency,
    }));
  }, [allProducts]);

  const showShimmer = isLoading && !products.length;
  const showArrows = (products?.length || 0) > 2 || showShimmer;

  /* =======================
     SHIMMER STATE
  ======================= */
  if (showShimmer) {
    return (
      <section className="pt-10 px-4 bg-white">
        <h2 className="font-bogle text-xl md:text-3xl font-black text-center text-black mb-10 tracking-[0.28em] uppercase">
          Trending Now
        </h2>

        <div className="relative">
          {/* ✅ Left Arrow */}
          <button type="button" onClick={() => scrollRow("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition" aria-label="Scroll left">
            ←
          </button>

          {/* ✅ Right Arrow */}
          <button type="button" onClick={() => scrollRow("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition" aria-label="Scroll right">
            →
          </button>

          {/* ✅ Gradient edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

          <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
                <ProductCard loading />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  /* =======================
     REAL CONTENT
  ======================= */
  return (
    <motion.section className="pt-10 bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="w-full bg-black text-center mb-10">
        <h2 className="text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.28em]">
          Trending Now
        </h2>
      </div>

      {error && <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>}

      <div className="relative">
        {/* ✅ Left Arrow */}
        {showArrows && (
          <button type="button" onClick={() => scrollRow("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition" aria-label="Scroll left">
            ←
          </button>
        )}

        {/* ✅ Right Arrow */}
        {showArrows && (
          <button type="button" onClick={() => scrollRow("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition" aria-label="Scroll right">
            →
          </button>
        )}

        {/* ✅ Gradient edges */}
        {showArrows && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        )}

        {/* ✅ Slider */}
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-1">
          {products.map((p) => (
            <div key={p.id} className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
