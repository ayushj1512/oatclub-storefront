"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useProductStore } from "@/store/productStore"; // ✅ use updated store (fetchProductsByCategory)

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
  const [localProducts, setLocalProducts] = useState([]);

  // ✅ use new store function
  const fetchProductsByCategory = useProductStore((s) => s.fetchProductsByCategory);

  // ✅ Refs for desktop rows
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  const scrollRow = (ref, dir = 1) => {
    if (!ref?.current) return;
    ref.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const products = useMemo(
    () => (Array.isArray(localProducts) ? localProducts : []),
    [localProducts]
  );

  useEffect(() => {
    let isMounted = true;

    const loadWinterDrops = async () => {
      try {
        setLocalLoading(true);

        // ✅ Use new route: /api/products/by-category/winter-drops
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

        // ✅ call store fetcher (optional - keeps analytics, cache, etc.)
        await fetchProductsByCategory("winter-drops", {
          page: 1,
          limit: 20,
          isActive: true,
        });

        // ✅ direct fetch to get clean array (because store returns no products sometimes)
        const url = `${BACKEND}/api/products/by-category/winter-drops?page=1&limit=20&isActive=true`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        const incoming = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        if (isMounted) setLocalProducts(incoming);
      } catch (err) {
        console.error("❌ Error loading winter drops:", err);
        if (isMounted) setLocalProducts([]);
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    loadWinterDrops();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const desktopRow1 = products.slice(0, 10);
  const desktopRow2 = products.slice(10, 20);
  const mobileRow = products.slice(0, 12);

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 py-8 md:py-10">
        {/* Header */}
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
            href="/category/winter-drops"
            className="text-sm font-semibold text-black hover:opacity-60 transition"
          >
            View All →
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-start gap-6 md:gap-6">
          {/* Feature Banner */}
          <Link
            href="/category/winter-drops"
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

          {/* Products Area */}
          <div className="w-full md:flex-1 min-w-0">
            {/* ================= DESKTOP (2 ROWS) ================= */}
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
                  {/* ROW 1 */}
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Scroll left"
                      onClick={() => scrollRow(row1Ref, -1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      aria-label="Scroll right"
                      onClick={() => scrollRow(row1Ref, 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
                    >
                      <ChevronRight size={20} />
                    </button>

                    <div
                      ref={row1Ref}
                      className="flex gap-4 overflow-x-auto no-scrollbar pb-2 overscroll-x-contain"
                      style={{
                        WebkitOverflowScrolling: "touch",
                        touchAction: "pan-x",
                      }}
                    >
                      {desktopRow1.map((p) => (
                        <div
                          key={p._id || p.id}
                          className="flex-shrink-0 w-[240px]"
                        >
                          <ProductCard product={p} disableRecentlyViewed />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ROW 2 */}
                  {desktopRow2.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        aria-label="Scroll left"
                        onClick={() => scrollRow(row2Ref, -1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        type="button"
                        aria-label="Scroll right"
                        onClick={() => scrollRow(row2Ref, 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-black/10 shadow hover:bg-white transition"
                      >
                        <ChevronRight size={20} />
                      </button>

                      <div
                        ref={row2Ref}
                        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 overscroll-x-contain"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          touchAction: "pan-x",
                        }}
                      >
                        {desktopRow2.map((p) => (
                          <div
                            key={p._id || p.id}
                            className="flex-shrink-0 w-[240px]"
                          >
                            <ProductCard product={p} disableRecentlyViewed />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 border border-gray-200 rounded-xl p-10 text-center bg-gray-50">
                  No products found in Winter Drops.
                </div>
              )}
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3 mt-4">
                <p className="text-sm font-bold text-black">Featured Picks</p>

                <Link
                  href="/category/winter-drops"
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
                <div
                  className="flex gap-3 overflow-x-auto pb-2 overscroll-x-contain"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-x",
                  }}
                >
                  {mobileRow.map((p) => (
                    <div key={p._id || p.id} className="flex-shrink-0 w-[180px]">
                      <ProductCard product={p} disableRecentlyViewed />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 border border-gray-200 rounded-xl p-8 text-center bg-gray-50 rounded-xl">
                  No products found in Winter Drops.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
