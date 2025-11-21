"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import Image from "next/image";
import Link from "next/link";

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();

  /** Load once from cookies */
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!items || items.length === 0) return null;

  /** Validate items */
  const safeItems = items.filter((item) => {
    const img =
      item?.images?.[0]?.src ||
      item?.image ||
      "/placeholder.png";

    return typeof img === "string" && img.length > 5;
  });

  if (safeItems.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-14">

      {/* Heading */}
      <div className="px-6 mb-7">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
          Recently Viewed
        </h2>
        <div className="h-[2px] w-16 bg-[#800020] mt-2 rounded-full"></div>
      </div>

      {/* Product Row */}
      <div className="flex gap-6 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">

        {safeItems.map((item) => {
          const img =
            item?.images?.[0]?.src ||
            item?.image ||
            "/placeholder.png";

          const category = item?.categories?.[0]?.slug || "products";
          const productLink = `/${category}/${item.slug || item.id}`;

          return (
            <Link
              key={item.id}
              href={productLink}
              className="snap-start flex-shrink-0 w-[190px] md:w-[230px] group"
            >
              <div
                className="
                  bg-white border border-gray-200 rounded-2xl
                  shadow-sm hover:shadow-xl
                  transition-all duration-300 overflow-hidden
                  group-hover:-translate-y-1 group-hover:scale-[1.03]
                  relative
                "
              >

                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] bg-white overflow-hidden rounded-t-2xl">
                  <Image
                    src={img}
                    alt={item.name || "Product"}
                    fill
                    loading="lazy"
                    className="
                      object-contain p-3
                      transition-transform duration-500
                      group-hover:scale-110
                    "
                  />

                  {/* Soft overlay hover */}
                  <div className="
                    absolute inset-0 bg-gradient-to-t 
                    from-black/10 via-black/0 to-transparent
                    group-hover:from-black/20
                    transition-all
                  "></div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-1.5">
                  <h3 className="
                    text-sm md:text-[15px] font-medium text-gray-900 
                    leading-snug line-clamp-2
                  ">
                    {item.name}
                  </h3>

                  <p className="
                    text-[#800020] font-semibold text-sm md:text-base
                  ">
                    ₹{item.price}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

      </div>
    </section>
  );
}
