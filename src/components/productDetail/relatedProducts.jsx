"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/common/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ productId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Fetch related products
  useEffect(() => {
    async function fetchRelated() {
      try {
        const resProduct = await fetch(
          `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products/${productId}?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
        );

        const productData = await resProduct.json();
        const categoryIds = productData.categories?.map((c) => c.id) || [];

        if (!categoryIds.length) {
          setRelated([]);
          return;
        }

        const resRelated = await fetch(
          `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products?category=${categoryIds[0]}&exclude=${productId}&per_page=20&consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
        );

        const products = await resRelated.json();

        const mapped = products.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price || 0),
          images: p.images || [],
          on_sale: p.on_sale || false,
          sale_price: p.sale_price,
          regular_price: p.regular_price,
        }));

        setRelated(mapped);
      } catch (err) {
        console.error("Related product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [productId]);

  // Scroll logic
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;

    scrollRef.current.scrollTo({
      left: scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  /* ===========================
       LOADING STATE
  =========================== */
  if (loading) {
    return (
      <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Similar Styles You’ll Love
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`shimmer-${i}`}
              className="min-w-[160px] md:min-w-[200px] flex-shrink-0"
            >
              <ProductCard loading={true} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!related.length) return null;

  /* ===========================
        RENDER RELATED
  =========================== */
  return (
    <section className="mt-10 px-3 md:px-6 w-full relative flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Related Products
        </h2>

        {/* SCROLL BUTTONS — HIDDEN ON MOBILE */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Edge Fade (kept for style) */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent"></div>

      {/* Scroll Row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2"
      >
        {related.map((product) => (
          <div
            key={product.id}
            className="min-w-[160px] md:min-w-[200px] snap-start flex-shrink-0"
          >
            <ProductCard product={product} lazy={true} />
          </div>
        ))}
      </div>
    </section>
  );
}
