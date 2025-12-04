"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();

  /* Load user’s saved recently viewed items once */
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!items || items.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-14">

      {/* Heading */}
      <div className="px-6 mb-7">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight uppercase text-center">
          Recently Viewed
        </h2>
        <div className="h-[2px] w-16 bg-[#800020] mt-2 rounded-full mx-auto"></div>
      </div>

      {/* Product Row (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">
        {items.map((product) => (
          <div
            key={product.id}
            className="snap-start flex-shrink-0 w-[160px] sm:w-[180px]"
          >
            <ProductCard product={product} disableRecentlyViewed />
          </div>
        ))}
      </div>

    </section>
  );
}
