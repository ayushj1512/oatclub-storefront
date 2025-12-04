"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useRef } from "react";

export default function ProductRow({ title, products }) {
  const rowRef = useRef(null);

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className=" px-4 md:px-8">
      {/* Title */}
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-[#2b0004] mb-4">
          {title}
        </h2>
      )}

      <div className="relative">
        {/* Left Button */}
       <button onClick={scrollLeft} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition"><ChevronLeft /></button>


        {/* Products Row */}
        <div
          ref={rowRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right Button */}
      <button onClick={scrollRight} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition"><ChevronRight /></button>

      </div>
    </section>
  );
}
