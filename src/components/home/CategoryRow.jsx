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
    <div className="no-scrollbar flex items-start gap-3 px-4 overflow-x-auto md:px-8 md:overflow-x-hidden md:justify-between">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 flex flex-col items-center md:flex-1 md:min-w-0"
        >
          <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          </div>

          <div className="mt-2 h-3 w-12 rounded bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
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

  const { settings, loading, fetchHomepageSettings } =
    useHomepageSettingsStore();

  // ✅ Fetch only once
  useEffect(() => {
    if (!settings) fetchHomepageSettings();
  }, [settings, fetchHomepageSettings]);

  // ✅ Premium feel shimmer delay
  useEffect(() => {
    const t = setTimeout(() => setShimmerLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // ✅ Extract categoryRow safely + filter + sort
  const categories = useMemo(() => {
    const row = settings?.categoryRow || [];
    return row
      .filter((item) => item?.isActive && item?.name)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));
  }, [settings]);

  const handleNavigate = (cat) => {
    if (cat?.slug) return router.push(`/category/${cat.slug}`);
    if (cat?.tag) return router.push(`/tag/${cat.tag}`);
  };

  // ✅ If no categories, don't render row
  if (!loading && !categories.length) return null;

  return (
    <section className="w-full bg-white py-4">
      {/* hide scrollbar cross-browser */}
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
        <div
          className="
            no-scrollbar
            flex items-start gap-3 px-4
            overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain

            md:px-8 md:gap-6
            md:overflow-x-hidden md:touch-auto
            md:justify-between
          "
        >
          {categories.map((cat, idx) => (
            <button
              key={`${cat?.name}-${idx}`}
              type="button"
              onClick={() => handleNavigate(cat)}
              aria-label={cat?.name}
              className="
                shrink-0 md:flex-1 md:min-w-0
                flex flex-col items-center select-none

                cursor-pointer
                transition
                hover:opacity-90
                active:scale-[0.97]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-black/30
                focus-visible:ring-offset-2
                focus-visible:ring-offset-white
              "
            >
              <div
                className="
                  w-[72px] h-[72px] md:w-[92px] md:h-[92px]
                  rounded-full overflow-hidden bg-black/5
                  cursor-pointer
                "
              >
                {cat?.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : cat?.video ? (
                  <video
                    src={cat.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <p className="mt-1 w-full px-1 text-center text-[12px] md:text-[13px] font-semibold leading-tight text-black/75 truncate">
                {cat?.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
