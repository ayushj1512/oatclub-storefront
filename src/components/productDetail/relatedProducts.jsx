"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/common/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function toNum(v) {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function RelatedProducts({ productId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const base = process.env.NEXT_PUBLIC_WC_URL;
        const key = process.env.NEXT_PUBLIC_WC_KEY;
        const secret = process.env.NEXT_PUBLIC_WC_SECRET;

        console.log("[RelatedProducts] env", {
          base: !!base,
          key: !!key,
          secret: !!secret,
          productId,
        });

        const resProduct = await fetch(
          `${base}/wp-json/wc/v3/products/${productId}?consumer_key=${key}&consumer_secret=${secret}`,
          { cache: "no-store" }
        );

        const productData = await resProduct.json();
        const categoryIds = productData.categories?.map((c) => c.id) || [];

        console.log("[RelatedProducts] product categories", categoryIds);

        if (!categoryIds.length) {
          setRelated([]);
          return;
        }

        const resRelated = await fetch(
          `${base}/wp-json/wc/v3/products?category=${categoryIds[0]}&exclude=${productId}&per_page=20&consumer_key=${key}&consumer_secret=${secret}`,
          { cache: "no-store" }
        );

        const products = await resRelated.json();

        console.log(
          "[RelatedProducts] raw sample",
          Array.isArray(products) ? products?.[0] : products
        );

        const mapped = (Array.isArray(products) ? products : []).map((p) => {
          const computedPrice = toNum(p?.price || p?.regular_price || p?.sale_price);

          console.log("[RelatedProducts] price check", {
            id: p?.id,
            name: p?.name,
            price: p?.price,
            regular_price: p?.regular_price,
            sale_price: p?.sale_price,
            computedPrice,
          });

          return {
            id: p.id,
            name: p.name,
            // ✅ only one price field for ProductCard
            price: computedPrice,
            images: p.images || [],
            categories: p.categories || [],
          };
        });

        setRelated(mapped);
      } catch (err) {
        console.error("Related product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [productId]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;

    scrollRef.current.scrollTo({
      left: scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  const CARD_WRAP = "w-[160px] md:w-[210px] flex-shrink-0 snap-start";
  const CARD_HEIGHT = "h-[320px] md:h-[380px]";

  if (loading) {
    return (
      <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Similar Styles You’ll Love
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

  if (!related.length) return null;

  return (
    <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Related Products
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
        {related.map((p) => (
          <div key={p.id} className={`${CARD_WRAP} ${CARD_HEIGHT}`}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
