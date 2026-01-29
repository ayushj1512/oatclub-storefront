"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";
import { useRecommendationStore } from "@/store/recommendationStore";

/**
 * RecommendationFeatureRow.jsx (FRONTEND ONLY)
 * ✅ Same UI pattern as bestseller row
 * ✅ Header updated: normal bold CAPS
 * ✅ "View All" -> /recommendation
 * ✅ Hide if no products
 */

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = String(x?.slug || "").trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

export default function RecommendationFeatureRow({
  title = "RECOMMENDED PRODUCTS",
  limit = 12,
  seedCount = 6,
  ensureCatalog = true,
  fetchParams = { page: 1, limit: 200, sort: "popularity" },
  viewAllHref = "/recommendation",
}) {
  const scrollRef = useRef(null);

  const { items, loading, build } = useRecommendationStore();
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        await build({ limit, seedCount, ensureCatalog, fetchParams });
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Something went wrong");
      }
    })();

    return () => {
      alive = false;
    };
  }, [limit, seedCount, ensureCatalog, build]);

  const products = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return uniqBySlug(list).filter((x) => x?.slug);
  }, [items]);

  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  const ArrowBtn = ({ dir }) => (
    <button
      type="button"
      onClick={() => scrollRow(dir)}
      className={`absolute ${
        dir === "left" ? "left-2" : "right-2"
      } top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition`}
      aria-label={`Scroll ${dir}`}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );

 const Header = () => (
  <div className="w-full mb-2">
    <div className="relative w-full bg-black py-3 px-3 sm:px-4">
      {/* subtle hairlines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />

      {/* soft center glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,transparent_55%)]" />

      <div className="relative flex items-center justify-between gap-3">
        {/* left spacer (keeps title perfectly centered even with button on right) */}
        <div className="w-20 sm:w-28" />

        {/* ✅ CENTER TITLE */}
        <h2 className="text-center flex-1 text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-[0.28em] text-white">
          {title}
        </h2>

        {/* ✅ VIEW ALL (right end) */}
        <div className="w-20 sm:w-28 flex justify-end">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition"
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  </div>
);


  // ✅ Hide entire section if there’s no data (and not loading shimmer)
  if (!showShimmer && !products.length) return null;

  return (
    <motion.section
      className={`pt-2 ${showShimmer ? "px-4" : ""} bg-white`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Header />

      {error ? (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      ) : null}

      <div className="relative">
        {showArrows ? (
          <>
            <ArrowBtn dir="left" />
            <ArrowBtn dir="right" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        ) : null}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-2"
        >
          {showShimmer
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
                >
                  <ProductCard loading />
                </div>
              ))
            : products.map((p) => (
                <div
                  key={p.id || p.slug}
                  className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </motion.section>
  );
}
