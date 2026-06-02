"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/10 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
    </div>
  );
}

export default function RecentlyViewed() {
  const { items, initialize } = useRecentlyViewedStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      await initialize?.();
      if (alive) setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [initialize]);

  if (!loading && !items?.length) return null;

  return (
    <section className="w-full bg-white py-6 md:py-10">
      <style
        dangerouslySetInnerHTML={{
          __html:
            ".no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}",
        }}
      />

      <div className="mb-4 flex items-end justify-between px-3 md:mb-6 md:px-16">
        {loading ? (
          <div className="space-y-2">
            <Shimmer className="h-5 w-40 rounded" />
            <Shimmer className="h-3 w-56 rounded" />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-black/45" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/40">
                Your Picks
              </p>
            </div>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-black md:text-3xl">
              Recently Viewed
            </h2>
          </div>
        )}

        {!loading && (
          <span className="hidden text-xs uppercase tracking-[0.22em] text-black/35 md:block">
            Continue Browsing
          </span>
        )}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-r from-white to-transparent md:block" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-white to-transparent md:block" />

        <div className="no-scrollbar flex items-start gap-2 overflow-x-auto scroll-smooth px-3 pb-2 md:gap-3 md:px-16">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[140px] shrink-0 sm:w-[155px] md:w-[190px]"
                >
                  <Shimmer className="aspect-[3/4] w-full rounded-2xl" />
                  <Shimmer className="mt-2 h-3 w-4/5 rounded" />
                  <Shimmer className="mt-2 h-3 w-2/5 rounded" />
                </div>
              ))
            : items.slice(0, 10).map((product) => (
                <div
                  key={product.id}
                  className="w-[140px] shrink-0 sm:w-[155px] md:w-[190px]"
                >
                  <ProductCard product={product} disableRecentlyViewed />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}