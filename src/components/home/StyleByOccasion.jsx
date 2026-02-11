"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHomeCollectionDesignStore, toImgSrc } from "@/store/homecollectiondesignstore";

/* =======================
   SHIMMER CARDS
======================= */
function OccasionShimmer({ count = 5 }) {
  return (
    <div className="no-scrollbar flex gap-4 px-4 overflow-x-auto md:justify-center md:overflow-visible md:max-w-[1400px] md:mx-auto md:px-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[150px] md:w-[260px]"
        >
          <div className="relative w-full h-[190px] md:h-[320px] rounded-2xl bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          </div>
          <div className="h-4 mt-3 bg-gray-200 rounded w-3/4 animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */

export default function StyleByOccasion() {
  const router = useRouter();

  const isLoading = useHomeCollectionDesignStore((s) => s.isLoading);
  const activeHomeCollections = useHomeCollectionDesignStore((s) => s.activeHomeCollections);
  const fetchActiveHomeCollections = useHomeCollectionDesignStore((s) => s.fetchActiveHomeCollections);

  const [minShimmer, setMinShimmer] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMinShimmer(false), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchActiveHomeCollections?.();
  }, [fetchActiveHomeCollections]);

  const loading = isLoading || minShimmer;

  const items = useMemo(() => {
    const arr = Array.isArray(activeHomeCollections) ? activeHomeCollections : [];
    return [...arr].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));
  }, [activeHomeCollections]);

  const handleClick = (slug) => {
    if (!slug) return;
    router.push(`/collection/${slug}`);
  };

  return (
    <section className="w-full bg-gray-50 pb-8 md:py-10">
      <div className="w-full bg-black text-center mb-6">
        <h2 className="text-white py-3 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em]">
          Style by Collection
        </h2>
      </div>

      {/* Hide scrollbar */}
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
        }}
      />

      {loading ? (
        <OccasionShimmer />
      ) : (
        <div className="no-scrollbar flex gap-4 px-4 overflow-x-auto md:justify-center md:overflow-visible md:max-w-[1400px] md:mx-auto md:px-6">
          {items.map((item) => (
            <div
              key={item?._id || item?.slug}
              onClick={() => handleClick(item?.slug)}
              className="flex-shrink-0 w-[150px] md:w-[260px] cursor-pointer group"
            >
              {/* Image */}
              <div className="relative w-full h-[190px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 border border-gray-200 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <Image
                  src={toImgSrc(item?.imageUrl)}
                  alt={item?.name || "Collection"}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 150px, 260px"
                />
              </div>

              {/* Heading */}
              <h3 className="mt-3 text-center text-sm md:text-base font-medium text-gray-800 tracking-wide transition-colors duration-300 group-hover:text-black">
                {item?.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
