"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { useCategoryStore } from "@/store/categoryStore";
import { useProductStore } from "@/store/productStore";

const slugOf = (c = {}) =>
  String(c.slug || c.name || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x?.slug || "").toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

function ViewAllCard({ href, label }) {
  return (
    <Link
      href={href}
      className="group flex aspect-[4/5] w-full flex-col items-center justify-center bg-black p-4 text-center text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
        Oatclub
      </p>

      <h3 className="mt-2 text-xl font-black uppercase leading-none tracking-tight">
        Shop All
      </h3>

      <p className="mt-2 text-xs uppercase tracking-wide opacity-70">
        {label}
      </p>

      <span className="mt-5 flex h-9 w-9 items-center justify-center rounded-full border border-current transition group-hover:translate-x-1">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function ShopByCategoryRow({
  title = "SHOP THE DROP",
  subtitle = "Pick a vibe. Swipe the fits.",
  limit = 12,
}) {
  const scrollRef = useRef(null);

  const { categories, loading: catLoading, fetchCategories } = useCategoryStore();
  const { allProducts, isLoading, error, fetchProductsByCategory } =
    useProductStore();

  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    fetchCategories({});
  }, [fetchCategories]);

  const tabs = useMemo(
    () =>
      (categories || [])
        .filter((c) => !c?.parent)
        .map((c) => ({ id: c._id, name: c.name, slug: slugOf(c) }))
        .filter((c) => c.slug),
    [categories]
  );

  useEffect(() => {
    if (!activeSlug && tabs.length) setActiveSlug(tabs[0].slug);
  }, [tabs, activeSlug]);

  const activeTab = tabs.find((x) => x.slug === activeSlug);

  useEffect(() => {
    if (!activeSlug) return;

    fetchProductsByCategory(activeSlug, {
      page: 1,
      limit,
      sort: "popularity",
      isActive: true,
    });
  }, [activeSlug, limit, fetchProductsByCategory]);

  const products = useMemo(
    () => uniqBySlug(allProducts || []).slice(0, limit),
    [allProducts, limit]
  );

  const showShimmer = (catLoading || isLoading) && !products.length;

  const scrollRow = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (!showShimmer && !tabs.length) return null;

  return (
    <section className="bg-white pt-6">
      <div className="mb-5 px-3 text-center">
      
        <h2 className="mt-1 text-4xl font-black uppercase leading-none tracking-tight text-black md:text-6xl">
          {title}
        </h2>


        <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto px-3 pb-3 md:justify-center">
  {tabs.map((tab) => {
    const active = activeSlug === tab.slug;

    return (
      <button
        key={tab.id || tab.slug}
        onClick={() => setActiveSlug(tab.slug)}
        className={`
          shrink-0 border px-5 text-xs font-medium transition-all duration-300
          ${active ? "h-11 scale-110" : "h-10 scale-100"}
          ${
            active
              ? "border-black bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              : "border-black/10 text-black hover:border-black hover:bg-white"
          }
        `}
      >
        {tab.name}
      </button>
    );
  })}
</div>
      </div>

      {error && <p className="mb-3 text-center text-sm text-black">❌ {error}</p>}

      <div className="relative">
        <button
          onClick={() => scrollRow("left")}
          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-black hover:bg-black hover:text-white md:flex"
        >
          ←
        </button>

        <button
          onClick={() => scrollRow("right")}
          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-black hover:bg-black hover:text-white md:flex"
        >
          →
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-1 pb-2 md:gap-3"
        >
          {showShimmer ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]"
              >
                <ProductCard loading />
              </div>
            ))
          ) : (
            <>
              {products.map((p) => (
                <div
                  key={p.id || p.slug}
                  className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}

              {activeTab && (
                <div className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]">
                  <ViewAllCard
                    href={`/category/${activeTab.slug}`}
                    label={activeTab.name}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}