"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useEffect, useRef, useState } from "react";

export default function ProductRow({ title, products = [] }) {
  const rowRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = rowRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  useEffect(() => {
    updateScrollButtons();
    const el = rowRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [products.length]);

  if (!products.length) return null;

  return (
    <section className="px-4 md:px-8">
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-[#2b0004] mb-4">
          {title}
        </h2>
      )}

      <div className="relative">
        {/* Left Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // ✅ focus scroll prevent
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center transition
            ${canScrollLeft ? "hover:bg-gray-100" : "opacity-40 cursor-not-allowed"}
          `}
        >
          <ChevronLeft />
        </button>

        {/* Products Row */}
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {products.map((product) => (
            <div
              key={product?._id || product?.id} // ✅ FIXED KEY
              className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // ✅ focus scroll prevent
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center transition
            ${canScrollRight ? "hover:bg-gray-100" : "opacity-40 cursor-not-allowed"}
          `}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
