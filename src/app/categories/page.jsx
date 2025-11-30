"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { wcGet } from "@/lib/woocommerce";
import { motion } from "framer-motion";

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
    <section className="w-full min-h-screen px-4 py-6 bg-white">
      {/* HEADER */}
      <h1 className="text-xl md:text-2xl font-semibold text-center text-black mb-6">
        Shop by Categories
      </h1>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[150px] bg-gray-300" />
          ))}
        </div>
      )}

      {/* GRID */}
      {!loading && (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={`/categories/${cat.slug}/${cat.id}`}
                prefetch={true}
                className="group border border-gray-300 bg-white overflow-hidden block"
              >
                {/* IMAGE */}
                <div className="relative w-full h-[130px] md:h-[160px] bg-gray-100 flex items-center justify-center overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={cat.image?.src || "/placeholder.png"}
                      alt={cat.name}
                      fill
                      className="object-contain p-3"
                    />
                  </motion.div>
                </div>

                {/* TEXT */}
                <div className="px-2 py-3 text-center">
                  <h3 className="text-sm md:text-base text-black font-medium">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-black/80 mt-0.5">
                    {cat.count} Products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {!loading && categories.length === 0 && (
        <p className="text-center mt-10 text-gray-700 text-sm">
          No categories found.
        </p>
      )}
    </section>
  );
}
