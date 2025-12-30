"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Reusable Recommended Products section
 * Premium black & white, hydration-safe
 */
export default function RecommendedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mt-16 max-w-[900px] mx-auto">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-black">
          Recommended Products
        </h2>
        <div className="h-px w-20 bg-black/30 mt-2" />
      </div>

      {/* PRODUCTS ROW */}
      <div className="flex gap-5 mt-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
        {products.map((p) => (
          <Link
            key={p.id}
            href={p.link}
            className="snap-start flex-shrink-0 w-[160px] bg-white border border-gray-200 rounded-xl transition hover:-translate-y-1 hover:shadow-md p-3"
          >
            {/* IMAGE */}
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={p.image}
                alt={p.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            {/* INFO */}
            <p className="text-sm font-medium mt-2 text-black line-clamp-2">
              {p.title}
            </p>

            <p className="text-black text-sm font-semibold">
              {p.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
