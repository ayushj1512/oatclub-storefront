"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";

export default function RecentlyViewedRow() {
  const { items, initialize } = useRecentlyViewedStore();

  // Load recently viewed once
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Hide section if empty
  if (!items?.length) return null;

  return (
   <section className="w-full bg-white px-4 py-6 rounded-2xl ">

  {/* ================= HEADER ================= */}
  <div className="mb-3 flex items-center justify-between">
    <h2 className="text-sm font-semibold text-black">
      Recently Viewed
    </h2>

    <Link
      href="/profile/recently-viewed"
      className="inline-flex items-center gap-1 text-xs font-semibold
                 text-black/70 hover:text-black transition"
    >
      Show more <ChevronRight size={14} />
    </Link>
  </div>

  {/* ================= SCROLL ROW ================= */}
  <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
    {items.map((item) => (
      <div
        key={item.id}
        className="snap-start w-[120px] sm:w-[140px] md:w-[150px]
                   flex-shrink-0 rounded-xl"
      >
        <ProductCard
          disableRecentlyViewed
          product={{
            ...item,
            images: Array.isArray(item.images)
              ? item.images
              : [{ src: item.image || "/placeholder.png" }],
          }}
        />
      </div>
    ))}
  </div>
</section>

  );
}
