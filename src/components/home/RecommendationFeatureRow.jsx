"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useRecommendationStore } from "@/store/recommendationStore";

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x?.slug || "").trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

function ViewAllCard({ href = "/recommendation" }) {
  return (
    <a
      href={href}
      className="group flex aspect-[55/46] w-full flex-col items-center justify-center bg-black p-4 text-center text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
    >
      <Sparkles className="mb-4 h-7 w-7 transition group-hover:scale-110" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
        Picked For You
      </p>

      <h3 className="mt-2 text-xl font-black uppercase leading-none tracking-tight md:text-2xl">
        VIEW ALL
      </h3>

      <p className="mt-2 text-xs uppercase tracking-wide opacity-70">
        Recommendations
      </p>

      <span className="mt-5 flex h-9 w-9 items-center justify-center rounded-full border border-current transition group-hover:translate-x-1">
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}

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
        if (alive) setError(e?.message || "Something went wrong");
      }
    })();

    return () => {
      alive = false;
    };
  }, [limit, seedCount, ensureCatalog, build, fetchParams]);

  const products = useMemo(
    () => uniqBySlug(Array.isArray(items) ? items : []).filter((x) => x?.slug),
    [items]
  );

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
      } top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-lg text-black transition hover:bg-black hover:text-white md:flex`}
      aria-label={`Scroll ${dir}`}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );

  if (!showShimmer && !products.length) return null;

  return (
    <motion.section
      className="bg-white pb-6 md:pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-4 bg-black px-3 py-3 text-center text-white md:mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
          OATCLUB PICKS
        </p>

        <h2 className="mt-1 text-sm font-black uppercase tracking-[0.2em] sm:text-base md:text-2xl">
          <span className="sm:hidden">Recommendations</span>
          <span className="hidden sm:inline">{title}</span>
        </h2>
      </div>

      {error && <p className="mb-3 text-center text-sm text-black">❌ {error}</p>}

      <div className="relative">
        {showArrows && (
          <>
            <ArrowBtn dir="left" />
            <ArrowBtn dir="right" />
          </>
        )}

        <div
  ref={scrollRef}
  className="no-scrollbar flex snap-x snap-mandatory gap-px overflow-x-auto scroll-smooth pb-2"
>
  {showShimmer ? (
    Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="w-[48vw] shrink-0 snap-start sm:w-[34vw] md:w-[25vw] lg:w-[20vw]"
      >
        <ProductCard loading />
      </div>
    ))
  ) : (
    <>
      {products.map((p) => (
        <div
          key={p.id || p.slug}
          className="w-[48vw] shrink-0 snap-start sm:w-[34vw] md:w-[25vw] lg:w-[20vw]"
        >
          <ProductCard product={p} />
        </div>
      ))}

      <div className="w-[48vw] shrink-0 snap-start sm:w-[34vw] md:w-[25vw] lg:w-[20vw]">
        <ViewAllCard href={viewAllHref} />
      </div>
    </>
  )}
</div>
      </div>
    </motion.section>
  );
}
