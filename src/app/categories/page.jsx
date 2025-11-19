"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wcGet } from "@/lib/woocommerce";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await wcGet("products/categories?per_page=100");

        const filtered = data.filter(
          (cat) => cat.slug !== "uncategorized" && cat.count > 0
        );

        setCategories(filtered);
      } catch (err) {
        console.error("❌ Category Fetch Error:", err);
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full min-h-screen px-5 py-10 bg-white">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-8">
        Shop by Categories
      </h1>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[170px] bg-gray-200 rounded-2xl"
            />
          ))}
        </div>
      )}

      {/* Categories Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}/${cat.id}`}
              prefetch={true}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full h-[150px] md:h-[190px] flex items-center justify-center bg-gray-50 overflow-hidden">
                <Image
                  src={cat.image?.src || "/placeholder.png"}
                  alt={cat.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Category Info */}
              <div className="p-4 text-center">
                <h3 className="text-sm md:text-base font-semibold text-gray-800">
                  {cat.name}
                </h3>

                <p className="text-xs text-[#800020] mt-1 font-medium">
                  {cat.count} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Categories Found */}
      {!loading && categories.length === 0 && (
        <p className="text-center mt-10 text-gray-500 text-sm">
          No categories found.
        </p>
      )}
    </section>
  );
}
