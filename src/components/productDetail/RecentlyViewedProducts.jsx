"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RecentlyViewedProducts() {
  const scrollRef = useRef(null);

  const items = useRecentlyViewedStore((s) => s.items);
  const initialize = useRecentlyViewedStore((s) => s.initialize);

  const [loadingLocal, setLoadingLocal] = useState(true);

  /* -------------------------------------------------------
     INIT FROM COOKIE (SAFE)
  ------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;
    try {
      initialize?.();
    } finally {
      if (mounted) setLoadingLocal(false);
    }
    return () => {
      mounted = false;
    };
  }, [initialize]);

  /* -------------------------------------------------------
     REMOVE DUPLICATES + REMOVE TOPMOST PRODUCT
  ------------------------------------------------------- */
  const uniqueItems = useMemo(() => {
    if (!items?.length) return [];

    const seen = new Set();

    const deduped = items.filter((p) => {
      const key = String(p?.id || p?.slug);
      if (!key) return false;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ✅ Remove the topmost product (current product)
    return deduped.slice(1);
  }, [items]);

  /* -------------------------------------------------------
     SCROLL HANDLER
  ------------------------------------------------------- */
  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;
    const delta = direction === "left" ? -clientWidth : clientWidth;

    scrollRef.current.scrollTo({
      left: scrollLeft + delta,
      behavior: "smooth",
    });
  };

  const CARD_WRAP = "w-[160px] md:w-[210px] flex-shrink-0 snap-start";
  const CARD_HEIGHT = "h-[320px] md:h-[380px]";

  /* -------------------------------------------------------
     LOADING STATE (SHIMMER)
  ------------------------------------------------------- */
  if (loadingLocal) {
    return (
      <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Recently Viewed
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`rv-shimmer-${i}`}
              className={`${CARD_WRAP} ${CARD_HEIGHT}`}
            >
              <ProductCard loading />
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------
     EMPTY STATE
  ------------------------------------------------------- */
  if (!uniqueItems.length) return null;

  /* -------------------------------------------------------
     NORMAL VIEW
  ------------------------------------------------------- */
  return (
    <section className="relative mt-12 w-full px-3 md:px-6 flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-black">
          Recently Viewed
        </h2>

        <div className="flex items-center gap-3">
          {/* View all */}
          <Link
            href="/profile/recently-viewed"
            className="text-sm font-semibold text-black/70 hover:text-black transition"
          >
            View all →
          </Link>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full
                       border border-black/10 hover:bg-black/5 transition"
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </button>

            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full
                       border border-black/10 hover:bg-black/5 transition"
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= FADE EDGES ================= */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

      {/* ================= SCROLLER ================= */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory
                 pb-2 scrollbar-hide"
      >
        {uniqueItems.map((p) => (
          <div
            key={String(p?.id || p?.slug)}
            className={`${CARD_WRAP} ${CARD_HEIGHT} snap-start`}
          >
            <ProductCard product={p} disableRecentlyViewed />
          </div>
        ))}
      </div>
    </section>
  );
}
