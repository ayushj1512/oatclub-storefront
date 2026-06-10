"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";

export default function CategoryMosaic() {
  const { settings, categoryBanners, fetchHomepageSettings } =
    useHomepageSettingsStore();

  useEffect(() => {
    if (!settings && !categoryBanners?.length) {
      fetchHomepageSettings();
    }
  }, [settings, categoryBanners, fetchHomepageSettings]);

  const items = useMemo(() => {
    return (categoryBanners || [])
      .filter((item) => item?.isActive !== false && item?.image)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        label: item.title || item.categoryName || "",
        subtitle: item.subtitle || "",
        href: item.link || `/category/${item.categorySlug}`,
        image: item.image,
      }));
  }, [categoryBanners]);

  if (!items.length) return null;

  return (
    <section className="w-full bg-white px-3 pb-5 text-black md:px-8 md:py-8">
      <div className="w-full">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-black/10 pb-3" />

        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
          {items.map((item, index) => (
            <Link
              key={`${item.label}-${item.href}-${index}`}
              href={item.href}
              className="group relative aspect-[4/5] overflow-hidden bg-neutral-100 md:aspect-[3/4]"
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 50vw, 620px"
                priority={index < 2}
                className="object-cover transition duration-500 group-hover:scale-[1.035]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-5">
                <span className="min-w-0">
                  <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-white drop-shadow md:text-sm">
                    {item.label}
                  </span>

                  {item.subtitle ? (
                    <span className="mt-1 hidden text-xs font-medium text-white/85 md:block">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>

                <span className="grid h-8 w-8 place-items-center border border-white/40 bg-white/15 text-white opacity-90 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/all-clothing"
          className="mt-3 flex h-10 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.18em] text-black md:hidden"
        >
          ALL CLOTHING
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}