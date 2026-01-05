"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

/* 🔥 Shimmer block (JS only) */
function ShimmerBlock({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

// ✅ Fisher-Yates Shuffle (robust)
function shuffleArray(arr, seed = Math.random()) {
  const a = [...arr];

  // ✅ seeded randomness (stable per mount)
  let t = seed * 1e9;

  for (let i = a.length - 1; i > 0; i--) {
    t = (t * 9301 + 49297) % 233280; // pseudo random
    const r = t / 233280;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

export default function BestSellerSection() {
  const { allProducts, isLoading, error, fetchProducts } = useProductStore();
  const fetchedRef = useRef(false);
  const scrollRef = useRef(null);

  // ✅ keeps shuffle stable for this mount
  const seedRef = useRef(Math.random());

  // 🔁 Fetch once only (StrictMode safe)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProducts({
      page: 1,
      limit: 60,
      isActive: true,
      category: "best-sellers", // ✅ best-sellers category load
      sort: "newest",
    });
  }, [fetchProducts]);

  const products = useMemo(() => {
    const mapped =
      (allProducts || [])
        .filter((p) => p?.isInStock !== false)
        .map((p) => ({
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

    // ✅ shuffle full list then pick top 12
    return shuffleArray(mapped, seedRef.current).slice(0, 12);
  }, [allProducts]);

  // ✅ scroll helper
  const scrollRow = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const showArrows = (products?.length || 0) > 2 || isLoading;

  /* ================= SHIMMER LOADING ================= */
  if (isLoading && !products.length) {
    return (
      <section className="pt-10 px-4 bg-white">
        {/* Heading shimmer */}
        <div className="w-full text-center mb-6">
          <ShimmerBlock className="h-7 w-52 mx-auto rounded" />
        </div>

        {/* Slider wrapper */}
        <div className="relative">
          {/* ✅ LEFT ARROW */}
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>

          {/* ✅ RIGHT ARROW */}
          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>

          {/* ✅ Gradient edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Product shimmer row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory px-1"
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
      className="pt-10 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Heading */}
      <div className="w-full bg-black text-center mb-6">
        <h2 className="text-white py-3 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em]">
          Best Sellers
        </h2>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      )}

      {/* ✅ Slider wrapper */}
      <div className="relative">
        {/* ✅ LEFT ARROW */}
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

        {/* ✅ RIGHT ARROW */}
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

        {/* ✅ Gradient edges */}
        {showArrows && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        )}

        {/* Products */}
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
