"use client";

import ProductCard from "@/components/common/ProductCard";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RelatedProducts({ products = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="mt-16 px-6 md:px-16 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Related Products
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-gray-100 rounded-full hover:bg-pink-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-gray-100 rounded-full hover:bg-pink-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[200px] snap-center">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
