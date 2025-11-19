"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/common/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ productId }) {
  const [related, setRelated] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const resProduct = await fetch(
          `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products/${productId}?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
        );

        const productData = await resProduct.json();
        const categoryIds = productData.categories?.map((c) => c.id) || [];

        if (!categoryIds.length) return;

        const resRelated = await fetch(
          `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products?category=${categoryIds[0]}&exclude=${productId}&per_page=20&consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`
        );

        const products = await resRelated.json();
        setRelated(products);
      } catch (err) {
        console.error("Related product fetch error:", err);
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

  if (!related.length) return null;

  return (
    <section className="mt-20 px-4 md:px-6 w-full relative flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 w-full">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Related Products
        </h2>

        {/* Scroll Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-gray-100 rounded-full hover:bg-pink-100 shadow-sm transition duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-gray-100 rounded-full hover:bg-pink-100 shadow-sm transition duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Edge Fade */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>

      {/* FULL-WIDTH FLEX SCROLL ROW */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto w-full scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
      >
        {related.map((product) => (
          <div
            key={product.id}
            className="min-w-[200px] md:min-w-[240px] snap-center flex-shrink-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
