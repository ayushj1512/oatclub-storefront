"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();

  useEffect(() => {
    initialize?.();
  }, [initialize]);

  if (!items?.length) return null;

 return (
  <section className="w-full py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
    {/* compact header */}
    <div className="px-4 md:px-6 mb-3 flex items-center justify-between">
      <h2 className="text-sm md:text-base font-semibold tracking-[0.15em] text-gray-900 uppercase">
        Recently Viewed
      </h2>

      <span className="h-px w-10 bg-gray-300" />
    </div>

    {/* compact row */}
    <div className="flex gap-2 overflow-x-auto px-4 md:px-6 pb-2 no-scrollbar snap-x snap-mandatory">
      {items.slice(0, 10).map((product) => (
        <div
          key={product.id}
          className="snap-start shrink-0 w-[132px] sm:w-[150px] md:w-[160px]"
        >
          <ProductCard product={product} disableRecentlyViewed />
        </div>
      ))}
    </div>
  </section>
);

}
