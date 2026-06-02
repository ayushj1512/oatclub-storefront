"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useHomeCollectionDesignStore,
  toImgSrc,
} from "@/store/homecollectiondesignstore";

const cap = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const OccasionShimmer = ({ count = 5 }) => (
  <div className="no-scrollbar flex gap-3 overflow-x-auto px-3 md:gap-5 md:px-16">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-[132px] shrink-0 md:w-[260px]">
        <div className="h-[165px] rounded-xl bg-gray-200 animate-pulse md:h-[320px] md:rounded-2xl" />
        <div className="mx-auto mt-2 h-3 w-2/3 rounded bg-gray-200 animate-pulse md:mt-3 md:h-4" />
      </div>
    ))}
  </div>
);

export default function StyleByOccasion() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [minLoad, setMinLoad] = useState(true);

  const { isLoading, activeHomeCollections, fetchActiveHomeCollections } =
    useHomeCollectionDesignStore();

  useEffect(() => {
    fetchActiveHomeCollections?.();
    const t = setTimeout(() => setMinLoad(false), 250);
    return () => clearTimeout(t);
  }, [fetchActiveHomeCollections]);

  const items = useMemo(
    () =>
      [...(activeHomeCollections || [])].sort(
        (a, b) => (a?.position ?? 0) - (b?.position ?? 0)
      ),
    [activeHomeCollections]
  );

  const scroll = (x) =>
    scrollRef.current?.scrollBy({ left: x, behavior: "smooth" });

  return (
    <section className="relative w-full bg-white  pt-3 pb-5 md:pt-6">
      <style
        dangerouslySetInnerHTML={{
          __html:
            ".no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}",
        }}
      />

      <div className="mb-4 px-3 text-center md:mb-8 md:px-4">
      

        <h2 className="mt-1 text-3xl font-bold leading-none tracking-tight text-black md:text-7xl">
          COLLECTIONS
        </h2>

        <p className="mt-1 text-[11px] text-black/50 md:mt-2 md:text-sm">
          Designed for every version of you
        </p>
      </div>

      {isLoading || minLoad ? (
        <OccasionShimmer />
      ) : (
        <div className="relative">
          <button
            onClick={() => scroll(-320)}
            className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-black hover:text-white md:flex"
          >
            ←
          </button>

          <button
            onClick={() => scroll(320)}
            className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-black hover:text-white md:flex"
          >
            →
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-3 md:gap-5 md:px-16"
          >
            {items.map((item) => {
              const title = cap(item?.name);

              return (
                <div
                  key={item?._id || item?.slug}
                  onClick={() => router.push(`/collection/${item?.slug}`)}
                  className="group w-[132px] shrink-0 cursor-pointer md:w-[260px]"
                >
                  <div className="relative h-[165px] overflow-hidden rounded-xl bg-gray-100 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lg md:h-[320px] md:rounded-2xl">
                    <Image
                      src={toImgSrc(item?.imageUrl)}
                      alt={title}
                      fill
                      sizes="(max-width:768px) 132px, 260px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>

                  <h3 className="mt-2 text-center text-[13px] font-semibold tracking-wide text-black md:mt-4 md:text-base">
                    {title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}