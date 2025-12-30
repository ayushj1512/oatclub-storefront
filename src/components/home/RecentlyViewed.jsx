"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";

/* 🔥 Shimmer block */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initialize?.();
      setLoading(false);
    };

    init();
  }, [initialize]);

  /* ❌ Nothing to show after load */
  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section className="w-full py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="px-4 md:px-6 mb-3 flex items-center justify-between">
        {loading ? (
          <Shimmer className="h-4 w-40 rounded" />
        ) : (
          <>
            <h2 className="text-sm md:text-base font-semibold tracking-[0.15em] text-gray-900 uppercase">
              Recently Viewed
            </h2>
            <span className="h-px w-10 bg-gray-300" />
          </>
        )}
      </div>

      {/* Row */}
      <div className="flex gap-2 overflow-x-auto px-4 md:px-6 pb-2 no-scrollbar snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[132px] sm:w-[150px] md:w-[160px]"
              >
                {/* ProductCard skeleton */}
                <div className="space-y-2">
                  <Shimmer className="w-full aspect-[3/4] rounded-lg" />
                  <Shimmer className="h-3 w-4/5 rounded" />
                  <Shimmer className="h-3 w-2/5 rounded" />
                </div>
              </div>
            ))
          : items.slice(0, 10).map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[132px] sm:w-[150px] md:w-[160px]"
              >
                <ProductCard
                  product={product}
                  disableRecentlyViewed
                />
              </div>
            ))}
      </div>
    </section>
  );
}
