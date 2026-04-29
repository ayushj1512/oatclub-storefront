"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function TrendingSection() {
  const { allProducts, isLoading, error, fetchProductsByCategory } =
    useProductStore();

  const fetchedRef = useRef(false);
  const scrollRef = useRef(null);
  const [shuffleTick, setShuffleTick] = useState(0);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProductsByCategory("featured", {
      page: 1,
      limit: 60,
      isActive: true,
      sort: "newest",
      card: 1,
    });
  }, [fetchProductsByCategory]);

  useEffect(() => {
    const timer = setInterval(() => setShuffleTick((x) => x + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollRow = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const products = useMemo(() => {
    return [...(allProducts || [])]
      .filter((p) => p?.isActive !== false && p?.raw?.isActive !== false)
      .filter((p) => p?.isInStock !== false)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, [allProducts, shuffleTick]);

  const showShimmer = isLoading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  if (showShimmer) {
    return (
      <section className="pt-2 px-4 bg-white">
        <h2 className="font-bogle text-xl md:text-3xl font-black text-center text-black mb-10 tracking-[0.28em] uppercase">
          TRENDING
        </h2>

        <ProductRowShell
          scrollRef={scrollRef}
          showArrows
          scrollRow={scrollRow}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductShell key={i}>
              <ProductCard loading />
            </ProductShell>
          ))}
        </ProductRowShell>
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
          TRENDING
        </h2>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      )}

      <ProductRowShell
        scrollRef={scrollRef}
        showArrows={showArrows}
        scrollRow={scrollRow}
      >
        {products.map((product) => (
          <ProductShell key={`${product?._id || product?.id}_${shuffleTick}`}>
            <ProductCard product={product} />
          </ProductShell>
        ))}
      </ProductRowShell>
    </motion.section>
  );
}

function ProductRowShell({ children, scrollRef, showArrows, scrollRow }) {
  return (
    <div className="relative">
      {showArrows && (
        <>
          <ArrowButton side="left" onClick={() => scrollRow("left")}>
            ←
          </ArrowButton>
          <ArrowButton side="right" onClick={() => scrollRow("right")}>
            →
          </ArrowButton>

          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent" />
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-1"
      >
        {children}
      </div>
    </div>
  );
}

function ProductShell({ children }) {
  return (
    <div className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
      {children}
    </div>
  );
}

function ArrowButton({ side, onClick, children }) {
  const pos = side === "left" ? "left-2" : "right-2";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${pos} top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-xl text-black/70 shadow-sm transition hover:bg-white hover:text-black active:scale-95`}
      aria-label={`Scroll ${side}`}
    >
      {children}
    </button>
  );
}