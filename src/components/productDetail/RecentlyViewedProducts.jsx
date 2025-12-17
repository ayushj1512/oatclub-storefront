"use client";

import { useEffect, useRef, useState } from "react";
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
            <div key={`rv-shimmer-${i}`} className={`${CARD_WRAP} ${CARD_HEIGHT}`}>
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
  if (!items?.length) return null;

  /* -------------------------------------------------------
     NORMAL VIEW
  ------------------------------------------------------- */
  return (
    <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Recently Viewed
        </h2>

        <div className="flex items-center gap-3">
          {/* VIEW ALL */}
          <Link
            href="/profile/recently-viewed"
            className="text-sm font-semibold text-[#800020] hover:opacity-80 transition"
          >
            View All →
          </Link>

          {/* DESKTOP SCROLL CONTROLS */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* FADE EDGES */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

      {/* SCROLLER */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2"
      >
        {items.map((p) => (
          <div
            key={String(p?.id || p?.slug)}
            className={`${CARD_WRAP} ${CARD_HEIGHT}`}
          >
            <ProductCard product={p} disableRecentlyViewed />
          </div>
        ))}
      </div>
    </section>
  );
}
