"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";

/* =======================
   SHIMMER UI
======================= */
function CategoryRowShimmer({ count = 8 }) {
  return (
    <div className="no-scrollbar flex items-start gap-4 overflow-x-auto px-4 md:justify-between md:gap-6 md:px-8 md:overflow-x-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 flex-col items-center md:min-w-0 md:flex-1"
        >
          <div className="relative h-[74px] w-[74px] overflow-hidden rounded-full bg-zinc-200 shadow-sm md:h-[94px] md:w-[94px]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
          </div>
          <div className="relative mt-2 h-3 w-14 overflow-hidden rounded bg-zinc-200">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */
export default function CategoryRow() {
  const router = useRouter();
  const [shimmerLoading, setShimmerLoading] = useState(true);

  const { settings, categoryRow, loading, fetchHomepageSettings } =
    useHomepageSettingsStore();

  useEffect(() => {
    if (!settings && !categoryRow?.length) fetchHomepageSettings();
  }, [settings, categoryRow, fetchHomepageSettings]);

  useEffect(() => {
    const t = setTimeout(() => setShimmerLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const items = useMemo(() => {
    const row = categoryRow?.length ? categoryRow : settings?.categoryRow || [];

    return row
      .filter((item) => {
        const hasMedia = item?.image || item?.video;
        const hasName = item?.name;
        const hasRoute =
          item?.navigationType === "custom"
            ? item?.customRoute
            : item?.slug;

        return item?.isActive !== false && hasName && hasMedia && hasRoute;
      })
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));
  }, [settings, categoryRow]);

  const handleNavigate = (item) => {
    if (!item) return;

    if (item.navigationType === "custom" && item.customRoute) {
      return router.push(item.customRoute);
    }

    if (!item.slug) return;

    if (item.slug === "all-clothing") return router.push("/all-clothing");
    if (item.slug === "new-arrivals") return router.push("/new-arrivals");

    if (item.navigationType === "collection") {
      return router.push(`/collection/${item.slug}`);
    }

    return router.push(`/category/${item.slug}`);
  };

  if (!loading && !items.length) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-zinc-50/70 py-5">
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar{display:none}
            .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
          `,
        }}
      />

      {loading || shimmerLoading ? (
        <CategoryRowShimmer />
      ) : (
        <div className="no-scrollbar flex items-start gap-4 overflow-x-auto overflow-y-hidden px-4 touch-pan-x overscroll-x-contain md:justify-between md:gap-6 md:px-8 md:overflow-x-hidden md:touch-auto">
          {items.map((item, idx) => (
            <button
              key={`${item.navigationType}-${item.slug || item.customRoute}-${idx}`}
              type="button"
              onClick={() => handleNavigate(item)}
              aria-label={item.name}
              className="group flex shrink-0 select-none flex-col items-center transition duration-200 hover:opacity-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:min-w-0 md:flex-1"
            >
              <div className="relative h-[74px] w-[74px] overflow-hidden rounded-full border border-zinc-200/80 bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md md:h-[94px] md:w-[94px]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : item.video ? (
                  <video
                    src={item.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-200" />
                )}
              </div>

              <p className="mt-2 w-full max-w-[90px] truncate px-1 text-center text-[12px] font-semibold leading-tight text-zinc-800 md:max-w-[120px] md:text-[13px]">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}