"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProductStore } from "@/store/productStore";
import ProductCard from "@/components/common/ProductCard";

const FEATURE_IMAGE =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1765956745/miray/media/nhzqroykgtmg1modqikj.jpg";

export default function WinterDropSection() {
  const [localLoading, setLocalLoading] = useState(true);

  // ✅ read products directly from store
  const products = useProductStore((s) => s.allProducts);
  const fetchProductsByCategory = useProductStore(
    (s) => s.fetchProductsByCategory
  );

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLocalLoading(true);
        // ✅ fetch from winter-drops category
        await fetchProductsByCategory("all-clothing");
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

  // Strictly separate the products for unique rows
  const row1 = products.slice(0, 10);
  const row2 = products.slice(10, 20);

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 md:px-8 py-8 md:py-10">
        {/* Header Section */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">
              New Arrival
            </p>
            <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Winter Drops
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Freshly landed styles to keep you warm and sharp this season.
            </p>
          </div>
          <Link
            href="/winterdrops"
            className="hidden md:inline-flex text-sm font-semibold text-[#800020] hover:opacity-80 transition"
          >
            View All Drops →
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-start gap-6 md:gap-6">
          {/* Main Feature Banner */}
          <Link
            href="/winterdrops"
            className="block w-full md:w-[40%] lg:w-[38%] flex-none self-start"
          >
            <div className="relative w-full overflow-hidden bg-white aspect-[4/4] md:aspect-square rounded-2xl border border-gray-100">
              <Image
                src={FEATURE_IMAGE}
                alt="Winter Drops Collection"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700"
              />
            </div>
          </Link>

          {/* Product Grid Area */}
          <div className="w-full md:flex-1 min-w-0">
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
                </div>
              ) : products.length ? (
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 touch-pan-y overscroll-x-contain">
                    {row1.map((p) => (
                      <div key={p.id} className="flex-shrink-0 w-[240px]">
                        <ProductCard product={p} disableRecentlyViewed />
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  {row2.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 touch-pan-y overscroll-x-contain">
                      {row2.map((p) => (
                        <div key={p.id} className="flex-shrink-0 w-[240px]">
                          <ProductCard product={p} disableRecentlyViewed />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600 border rounded-xl p-10 text-center bg-gray-50">
                  Check back soon! Our Winter Drops are coming your way.
                </div>
              )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3 mt-4">
                <p className="text-sm font-bold text-gray-900">
                  Featured Picks
                </p>
                <Link
                  href="/winterdrops"
                  className="text-xs font-semibold text-[#800020]"
                >
                  View all →
                </Link>
              </div>

              {localLoading ? (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`msk-${i}`} className="flex-shrink-0 w-[180px]">
                      <ProductCard loading />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 touch-pan-y overscroll-x-contain">
                  {products.map((p) => (
                    <div key={`mob-${p.id}`} className="flex-shrink-0 w-[180px]">
                      <ProductCard
                        product={p}
                        disableRecentlyViewed
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
