"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useHomeCollectionDesignStore, toImgSrc } from "@/store/homecollectiondesignstore";

/* helpers */
const cap = (s = "") => s.toLowerCase().trim().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

/* shimmer */
const OccasionShimmer = ({ count = 5 }) => (
  <div className="no-scrollbar flex gap-5 px-4 overflow-x-auto">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[150px] md:w-[260px]">
        <div className="h-[190px] md:h-[320px] rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-4 mt-4 w-2/3 mx-auto rounded bg-gray-200 animate-pulse" />
      </div>
    ))}
  </div>
);

export default function StyleByOccasion() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const { isLoading, activeHomeCollections, fetchActiveHomeCollections } = useHomeCollectionDesignStore();

  const [minLoad, setMinLoad] = useState(true);

  useEffect(() => {
    fetchActiveHomeCollections?.();
    const t = setTimeout(() => setMinLoad(false), 250);
    return () => clearTimeout(t);
  }, [fetchActiveHomeCollections]);

  const items = useMemo(
    () => [...(activeHomeCollections || [])].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)),
    [activeHomeCollections]
  );

  const scroll = (x) => scrollRef.current?.scrollBy({ left: x, behavior: "smooth" });

  return (
    <section className="w-full bg-gray-50 pb-10 relative">
      <div className="bg-black text-center mb-8">
        <h2 className="py-4 text-white text-lg md:text-2xl font-medium uppercase tracking-[0.3em]">Style by Collection</h2>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />

      {isLoading || minLoad ? (
        <OccasionShimmer />
      ) : (
        <div className="relative">
          <button onClick={() => scroll(-320)} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-black hover:text-white transition">←</button>
          <button onClick={() => scroll(320)} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-black hover:text-white transition">→</button>

          <div ref={scrollRef} className="no-scrollbar flex gap-5 px-4 md:px-16 overflow-x-auto scroll-smooth">
            {items.map((item) => {
              const title = cap(item?.name);
              return (
                <div key={item?._id || item?.slug} onClick={() => router.push(`/collection/${item?.slug}`)} className="flex-shrink-0 w-[150px] md:w-[260px] cursor-pointer group">
                  <div className="relative h-[190px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-100 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <Image src={toImgSrc(item?.imageUrl)} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" sizes="(max-width:768px) 150px, 260px" />
                  </div>
                  <h3 className="mt-4 text-center text-sm md:text-base font-medium text-gray-900 tracking-wide transition-all duration-300 group-hover:tracking-wider">{title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
