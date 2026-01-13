"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ productId }) {
  const scrollRef = useRef(null);

  const allProducts = useProductStore((s) => s.allProducts) || [];
  const isLoading = useProductStore((s) => s.isLoading);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  const [loadingLocal, setLoadingLocal] = useState(true);

  // Ensure product list exists (no WC now)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!allProducts.length) await fetchProducts?.();
      } finally {
        if (mounted) setLoadingLocal(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts.length, productId]);

  const related = useMemo(() => {
    if (!allProducts.length || !productId) return [];
    const current = allProducts.find((p) => String(p?.productId || p?.id) === String(productId));
    if (!current) return [];

    const currentCat = String(current?.category || "").toLowerCase();
    const currentSub = String(current?.subcategoryId || "");
    const currentTags = Array.isArray(current?.tags) ? current.tags.map((t) => String(t).toLowerCase()) : [];

    const score = (p) => {
      let s = 0;
      if (String(p?.category || "").toLowerCase() && String(p?.category || "").toLowerCase() === currentCat) s += 3;
      if (currentSub && String(p?.subcategoryId || "") === currentSub) s += 2;
      const tags = Array.isArray(p?.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];
      if (tags.length && currentTags.length) {
        const set = new Set(tags);
        const overlap = currentTags.reduce((acc, t) => (set.has(t) ? acc + 1 : acc), 0);
        s += Math.min(3, overlap); // cap overlap points
      }
      return s;
    };

    const list = allProducts
      .filter((p) => String(p?.productId || p?.id) !== String(productId))
      .map((p) => ({ p, s: score(p) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
      .map((x) => x.p);

    return list;
  }, [allProducts, productId]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const delta = direction === "left" ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({ left: scrollLeft + delta, behavior: "smooth" });
  };

  const CARD_WRAP = "w-[160px] md:w-[210px] flex-shrink-0 snap-start";
  const CARD_HEIGHT = "h-[320px] md:h-[380px]";
  const loading = Boolean(loadingLocal || isLoading);

  if (loading) {
    return (
      <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Similar Styles You’ll Love</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`shimmer-${i}`} className={`${CARD_WRAP} ${CARD_HEIGHT}`}>
              <ProductCard loading />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!related.length) return null;

  return (
    <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">You’ll Love These</h2>

        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll("left")} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition" aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => scroll("right")} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition" aria-label="Scroll right">
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2">
        {related.map((p) => (
          <div key={String(p?.productId || p?.id)} className={`${CARD_WRAP} ${CARD_HEIGHT}`}>
            {/* ProductCard can keep using product.id for routing; we provide both anyway in store normalize */}
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
