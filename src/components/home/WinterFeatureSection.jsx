"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useProductStore } from "@/store/productStore";
import ProductCard from "@/components/common/ProductCard";

const FEATURE_IMAGE = "https://res.cloudinary.com/djtva6hec/image/upload/v1764769370/miray/media/je85fqppydk6wmiryuv1.png";

export default function WinterFeatureSection() {
  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    if (!allProducts?.length && !isLoading) fetchProducts?.();
  }, [allProducts?.length, isLoading, fetchProducts]);

  const products = useMemo(() => allProducts || [], [allProducts]);

  // ✅ More products per row
  const row1 = products.slice(0, 18);
  const row2 = products.slice(18, 36);

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 md:px-8 py-8 md:py-10">
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Featured</p>
            <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Winter Edit</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Cozy picks, premium fits, and fresh drops for the season.</p>
          </div>
          <Link href="/categories" className="hidden md:inline-flex text-sm font-semibold text-[#800020] hover:opacity-80 transition">
            View all →
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-start gap-6 md:gap-6">
          <Link href="/categories" className="block w-full md:w-[40%] lg:w-[38%] flex-none self-start">
            <div className="relative w-full overflow-hidden bg-white aspect-[4/4] md:aspect-square">
              <Image src={FEATURE_IMAGE} alt="Featured Banner" fill priority sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-center" />
            </div>
          </Link>

          <div className="w-full md:flex-1 min-w-0">
            <div className="hidden md:flex flex-col gap-2">
              {isLoading && !products.length ? (
                <>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`sk1-${i}`} className="flex-shrink-0 w-[220px]">
                        <ProductCard loading />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={`sk2-${i}`} className="flex-shrink-0 w-[220px]">
                        <ProductCard loading />
                      </div>
                    ))}
                  </div>
                </>
              ) : products.length ? (
                <>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {row1.map((p) => (
                      <div key={p.id} className="flex-shrink-0 w-[220px]">
                        <ProductCard product={p} disableRecentlyViewed />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-0">
                    {(row2.length ? row2 : row1).map((p) => (
                      <div key={`r2-${p.id}`} className="flex-shrink-0 w-[220px]">
                        <ProductCard product={p} disableRecentlyViewed />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No products found.</div>
              )}
            </div>

            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3 mt-4">
                <p className="text-sm font-bold text-gray-900">Picks For You</p>
                <Link href="/categories" className="text-xs font-semibold text-[#800020]">
                  View all →
                </Link>
              </div>

              {isLoading && !products.length ? (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`msk-${i}`} className="flex-shrink-0 w-[160px]">
                      <ProductCard loading />
                    </div>
                  ))}
                </div>
              ) : products.length ? (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {products.slice(0, 20).map((p) => (
                    <div key={p.id} className="flex-shrink-0 w-[160px]">
                      <ProductCard product={p} disableRecentlyViewed />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No products found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
