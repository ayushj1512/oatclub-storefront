"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Reusable Recommended Products section
 * Can later be wired to real products / collections
 */
export default function RecommendedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mt-16 max-w-[900px] mx-auto">
      <h2 className="text-2xl font-semibold text-[#2b0004]">
        Recommended Products
      </h2>
      <div className="h-[2px] bg-[#800020] w-20 rounded-full mt-2" />

      <div className="flex gap-5 mt-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
        {products.map((p) => (
          <Link
            key={p.id}
            href={p.link}
            className="snap-start flex-shrink-0 w-[160px] bg-white border rounded-xl shadow-sm hover:shadow-md transition-all p-3"
          >
            {/* IMAGE */}
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={p.image}
                alt={p.title}
                fill
                className="object-cover"
              />
            </div>

            {/* INFO */}
            <p className="text-sm font-medium mt-2 text-gray-800 line-clamp-2">
              {p.title}
            </p>

            <p className="text-[#800020] text-sm font-semibold">
              {p.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
