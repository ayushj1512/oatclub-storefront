"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/10 ${className}`}>
      <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

const CARD_WIDTH =
  "w-[48vw] shrink-0 sm:w-[34vw] md:w-[25vw] lg:w-[20vw]";

export default function RecentlyViewed() {
  const { items = [], initialize } = useRecentlyViewedStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        await initialize?.();
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [initialize]);

  if (!loading && !items.length) return null;

  return (
    <section className="w-full bg-white py-6 md:py-10">
      <div className="mb-4 flex items-end justify-between px-3 md:mb-6 md:px-6">
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

      <div className="no-scrollbar flex items-start gap-px overflow-x-auto scroll-smooth pb-2">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={CARD_WIDTH}>
                <Shimmer className="aspect-[3/4] w-full" />
                <Shimmer className="mx-2 mt-2 h-3 w-4/5 rounded" />
                <Shimmer className="mx-2 mt-2 h-3 w-2/5 rounded" />
              </div>
            ))
          : items.slice(0, 10).map((product) => (
              <div
                key={product.id || product._id || product.slug}
                className={CARD_WIDTH}
              >
                <ProductCard
                  product={product}
                  disableRecentlyViewed
                />
              </div>
            ))}
      </div>
    </section>
  );
}