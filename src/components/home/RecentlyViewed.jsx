"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import Image from "next/image";
import Link from "next/link";

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();

  // Load from cookies on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // No items → don't render
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-12">

      {/* Heading */}
      <div className="px-6 flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Recently Viewed
          </h2>
          <div className="h-[2px] w-16 bg-[#800020] mt-2 rounded-full"></div>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div className="flex gap-6 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">

        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="snap-start flex-shrink-0 w-[180px] md:w-[220px]"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.03]">

              {/* Image */}
              <div className="relative w-full aspect-[4/5] bg-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-all"></div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5">
                <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 leading-snug">
                  {item.name}
                </h3>

                <p className="text-[#800020] font-semibold text-sm md:text-base">
                  ₹{item.price}
                </p>
              </div>

            </div>
          </Link>
        ))}

      </div>
    </section>
  );
}
