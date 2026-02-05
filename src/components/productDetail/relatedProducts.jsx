"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const str = (v) => (v == null ? "" : String(v));
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

export default function RelatedProducts({ currentProduct }) {
  const scrollRef = useRef(null);

  const fetchProductsByIds = useProductStore((s) => s.fetchProductsByIds);
  const allProducts = useProductStore((s) => s.allProducts) || [];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const raw = currentProduct?.raw || currentProduct || null;

  const selfId = str(raw?._id || raw?.id || raw?.productId);

  // ✅ your response has: collections[0].products[{product:"id", productCode:"00279"}]
  const relatedIds = useMemo(() => {
    const cols = Array.isArray(raw?.collections) ? raw.collections : [];
    const first = cols[0];
    const products = Array.isArray(first?.products) ? first.products : [];
    return uniq(
      products
        .map((x) => str(x?.product))
        .filter((id) => id && id !== selfId)
    );
  }, [raw, selfId]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      try {
        // ✅ Priority 1: fetch by collection product IDs
        if (relatedIds.length && typeof fetchProductsByIds === "function") {
          const fetched = await fetchProductsByIds(relatedIds, {
            mergeIntoAllProducts: true,
          });

          if (!mounted) return;

          setItems(Array.isArray(fetched) ? fetched : []);
          return;
        }

        // ✅ Fallback: if backend didn’t send collection list,
        // show anything from cache except self (better than blank)
        const fallback = (allProducts || []).filter(
          (p) => str(p?.id || p?.productId) && str(p?.id || p?.productId) !== selfId
        );

        if (!mounted) return;
        setItems(fallback.slice(0, 20));
      } catch (e) {
        if (!mounted) return;
        console.error("RelatedProducts failed:", e);
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [relatedIds.join(","), fetchProductsByIds, selfId]); // keep stable

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const delta = direction === "left" ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({ left: scrollLeft + delta, behavior: "smooth" });
  };

  const CARD_WRAP = "w-[160px] md:w-[210px] flex-shrink-0 snap-start";
  const CARD_HEIGHT = "h-[320px] md:h-[380px]";

  if (loading) {
    return (
      <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            You’ll Love These
          </h2>
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

  if (!items.length) return null;

  return (
    <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          You’ll Love These
        </h2>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2"
      >
        {items.map((p) => (
          <div key={str(p?.id || p?.productId)} className={`${CARD_WRAP} ${CARD_HEIGHT}`}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
