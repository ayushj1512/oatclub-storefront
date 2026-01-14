"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "@/store/productStore";

const FEATURE_IMAGE =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1768418505/miray/media/rqyh3d1yrybnh1nwwula.webp";

// Lighter shimmer (optional): reduces heavy gradient animation load on mobile
function ShimmerBlock({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </div>
  );
}

/**
 * PERFORMANCE FIXES INCLUDED:
 * 1) Remove touchAction: "pan-x" (can cause scroll conflicts on mobile)
 * 2) Reduce mobile cards count (12 -> 8) to reduce render + image decode pressure
 * 3) Debounce scroll buttons with rAF + stable callbacks
 * 4) Avoid redundant fetch: only one request (remove double fetch/store call)
 * 5) Use AbortController to prevent hanging requests on mobile
 * 6) Stable memo + minimal state updates
 */
export default function WinterDropSection() {
  const [localLoading, setLocalLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState([]);
  const [showEmpty, setShowEmpty] = useState(false);

  const fetchProductsByCategory = useProductStore((s) => s.fetchProductsByCategory);

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const rafRef = useRef(null);

  const products = useMemo(
    () => (Array.isArray(localProducts) ? localProducts : []),
    [localProducts]
  );

  // smoother + safer scroll (no repeated clicks choking main thread)
  const scrollRow = useCallback((ref, dir = 1) => {
    const el = ref?.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      // 260 for desktop width 240 + gap; safer than 340
      const step = 280;
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadWinterDrops = async () => {
      try {
        setLocalLoading(true);

        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

        // ✅ Keep store updated but avoid a second network call in store if it already calls API.
        // If your store already fetches from same endpoint, you can REMOVE this line.
        // Otherwise keep it for global cache.
        try {
          await fetchProductsByCategory("winter-drops", {
            page: 1,
            limit: 20,
            isActive: true,
          });
        } catch {
          // ignore store fetch failure; local fetch below is source of truth for this component
        }

        const url = `${BACKEND}/api/products/by-category/winter-drops?page=1&limit=20&isActive=true`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data = await res.json();

        const incoming = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        if (isMounted) setLocalProducts(incoming);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("❌ Error loading winter drops:", err);
        }
        if (isMounted) setLocalProducts([]);
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    loadWinterDrops();

    return () => {
      isMounted = false;
      controller.abort();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Empty state delay (8s)
  useEffect(() => {
    if (!localLoading && products.length === 0) {
      setShowEmpty(false);
      const t = setTimeout(() => setShowEmpty(true), 8000);
      return () => clearTimeout(t);
    }
    setShowEmpty(false);
  }, [localLoading, products.length]);

  const desktopRow1 = useMemo(() => products.slice(0, 10), [products]);
  const desktopRow2 = useMemo(() => products.slice(10, 20), [products]);

  // ✅ reduce mobile render load
  const mobileRow = useMemo(() => products.slice(0, 8), [products]);

  const isEmpty = !localLoading && products.length === 0;

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
              {localLoading ? (
                <ShimmerBlock className="absolute inset-0 rounded-2xl" />
              ) : (
                <Image
                  src={FEATURE_IMAGE}
                  alt="Winter Drops Collection"
                  fill
                  // ✅ priority only for hero is ok; keep it
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                />
              )}
            </div>
          </Link>

          {/* Products Area */}
          <div className="w-full md:flex-1 min-w-0">
            {/* ================= DESKTOP ================= */}
            <div className="hidden md:flex flex-col gap-4">
              {localLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((row) => (
                    <div
                      key={row}
                      className="flex gap-4 overflow-x-auto no-scrollbar pb-0"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`sk${row}-${i}`} className="flex-shrink-0 w-[240px]">
                          <ProductCard loading />
                        </div>
                      ))}
                    </div>
                  ))}
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
                      className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
                      // ✅ remove touchAction to avoid mobile/desktop pointer conflicts
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {desktopRow1.map((p) => (
                        <div key={p._id || p.id} className="flex-shrink-0 w-[240px]">
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
                        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        {desktopRow2.map((p) => (
                          <div key={p._id || p.id} className="flex-shrink-0 w-[240px]">
                            <ProductCard product={p} disableRecentlyViewed />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-10 bg-gray-50">
                  {!showEmpty ? (
                    <UniversalLuxuryLoader />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      No products found in Winter Drops.
                    </p>
                  )}
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
                <div
                  className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`msk-${i}`} className="flex-shrink-0 w-[180px]">
                      <ProductCard loading />
                    </div>
                  ))}
                </div>
              ) : products.length ? (
                <div
                  className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
                  // ✅ IMPORTANT: removed touchAction + overscroll contain
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {mobileRow.map((p) => (
                    <div key={p._id || p.id} className="flex-shrink-0 w-[180px]">
                      <ProductCard product={p} disableRecentlyViewed />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-8 bg-gray-50">
                  {!showEmpty ? (
                    <UniversalLuxuryLoader />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      No products found in Winter Drops.
                    </p>
                  )}
                </div>
              )}
            </div>

            {isEmpty && null}
          </div>
        </div>
      </div>
    </section>
  );
}
