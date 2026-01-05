"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProductStore } from "@/store/productStore";
import ProductCard from "@/components/common/ProductCard";

const FEATURE_IMAGE =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1765956745/miray/media/nhzqroykgtmg1modqikj.jpg";

function ShimmerBlock({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function WinterDropSection() {
  const [localLoading, setLocalLoading] = useState(true);

  const products = useProductStore((s) => s.allProducts);
  const fetchProductsByCategory = useProductStore(
    (s) => s.fetchProductsByCategory
  );

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLocalLoading(true);
        await fetchProductsByCategory("winter-drops");
      } catch (err) {
        console.error("Error loading winter drops:", err);
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [fetchProductsByCategory]);

  // ✅ Desktop 2 rows
  const desktopRow1 = products.slice(0, 10);
  const desktopRow2 = products.slice(10, 20);

  // ✅ Mobile only 1 row
  const mobileRow = products.slice(0, 12);

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 md:px-8 py-8 md:py-10">
        {/* Header Section */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 tracking-[0.22em] uppercase">
              New Arrival
            </p>

            <h2 className="text-xl md:text-3xl font-extrabold text-black tracking-tight">
              Winter Drops
            </h2>

            <p className="text-sm md:text-base text-gray-600 mt-1">
              Freshly landed styles to keep you warm and sharp this season.
            </p>
          </div>

          <Link
            href="/winterdrops"
            className="hidden md:inline-flex text-sm font-semibold text-black hover:opacity-60 transition"
          >
            View All →
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-start gap-6 md:gap-6">
          {/* Main Feature Banner */}
          <Link
            href="/winterdrops"
            className="block w-full md:w-[40%] lg:w-[38%] flex-none self-start"
          >
            <div className="relative w-full overflow-hidden aspect-[4/4] md:aspect-square rounded-2xl border border-gray-200 bg-gray-100">
              {localLoading && (
                <ShimmerBlock className="absolute inset-0 rounded-2xl" />
              )}

              {!localLoading && (
                <Image
                  src={FEATURE_IMAGE}
                  alt="Winter Drops Collection"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                />
              )}
            </div>
          </Link>

          {/* Product Grid Area */}
          <div className="w-full md:flex-1 min-w-0">
            {/* =================== ✅ DESKTOP VIEW (2 ROWS) =================== */}
            <div className="hidden md:flex flex-col gap-4">
              {localLoading ? (
                <div className="space-y-4">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`sk1-${i}`} className="flex-shrink-0 w-[240px]">
                        <ProductCard loading />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`sk2-${i}`} className="flex-shrink-0 w-[240px]">
                        <ProductCard loading />
                      </div>
                    ))}
                  </div>
                </div>
              ) : products.length ? (
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 touch-pan-y overscroll-x-contain">
                    {desktopRow1.map((p) => (
                      <div key={p.id} className="flex-shrink-0 w-[240px]">
                        <ProductCard product={p} disableRecentlyViewed />
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  {desktopRow2.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 touch-pan-y overscroll-x-contain">
                      {desktopRow2.map((p) => (
                        <div key={p.id} className="flex-shrink-0 w-[240px]">
                          <ProductCard product={p} disableRecentlyViewed />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 border border-gray-200 rounded-xl p-10 text-center bg-gray-50">
                  Check back soon! Our Winter Drops are coming your way.
                </div>
              )}
            </div>

            {/* =================== ✅ MOBILE VIEW (SINGLE ROW) =================== */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3 mt-4">
                <p className="text-sm font-bold text-black">Featured Picks</p>

                <Link
                  href="/winterdrops"
                  className="text-xs font-semibold text-black hover:opacity-60 transition"
                >
                  View all →
                </Link>
              </div>

              {localLoading ? (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`msk-${i}`} className="flex-shrink-0 w-[180px]">
                      <ProductCard loading />
                    </div>
                  ))}
                </div>
              ) : products.length ? (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 touch-pan-y overscroll-x-contain">
                  {mobileRow.map((p) => (
                    <div key={`mob-${p.id}`} className="flex-shrink-0 w-[180px]">
                      <ProductCard product={p} disableRecentlyViewed />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 border border-gray-200 rounded-xl p-8 text-center bg-gray-50 rounded-xl">
                  Check back soon! Our Winter Drops are coming your way.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
