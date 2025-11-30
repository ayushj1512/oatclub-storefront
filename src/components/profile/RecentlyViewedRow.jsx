"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";
import { ChevronRight } from "lucide-react";

const BRAND = { burgundy: "#800020" };

export default function RecentlyViewedRow() {
  const { items, initialize } = useRecentlyViewedStore();

  /* Load recently viewed once */
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!items || items.length === 0) return null;

  return (
    <section className="w-full px-4 py-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-900">Recently Viewed</h2>

        <Link
          href="/profile/recently-viewed"
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: BRAND.burgundy }}
        >
          Show More
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
        {items.map((item) => (
          <div
            key={item.id}
            className="snap-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-[150px]"
          >
            <ProductCard
              product={{
                ...item,

                // Force proper image object format so Next/Image works
                images: Array.isArray(item.images)
                  ? item.images
                  : [{ src: item.image || "/placeholder.png" }],
              }}
              disableRecentlyViewed
            />
          </div>
        ))}
      </div>
    </section>
  );
}
