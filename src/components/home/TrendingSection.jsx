"use client";

import { useEffect, useMemo } from "react";
import ProductCard from "@/components/common/ProductCard";
import { motion } from "framer-motion";
import { useProductStore } from "@/store/productStore";

export default function TrendingSection() {
  const { filteredProducts, isLoading, fetchProducts, error } = useProductStore();

  useEffect(() => { fetchProducts({ limit: 60, isActive: true, sort: "newest" }); }, [fetchProducts]);

  const products = useMemo(
    () =>
      (filteredProducts || [])
        .filter((p) => p?.isInStock !== false)
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          productId: p.productId,
          name: p.name || "",
          price: Number(p.price || 0),
          originalPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
          image: p.image || "/placeholder.png",
          slug: p.slug || p.id,
          on_sale: p.compareAtPrice != null && Number(p.compareAtPrice) > Number(p.price || 0),
          category: p.category,
          currency: p.currency,
        })),
    [filteredProducts]
  );

  if (isLoading) {
    return (
      <section className="pt-10 px-4 bg-white">
        <h2 className="text-xl md:text-2xl font-extrabold text-center text-black mb-6 tracking-wide uppercase border-b-4 border-[#800020] w-fit mx-auto pb-1">Trending Now</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
              <ProductCard loading />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <motion.section className="pt-10 px-4 bg-white" initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-xl md:text-2xl font-extrabold text-center text-black mb-6 tracking-wide uppercase border-b-4 border-[#800020] w-fit mx-auto pb-1">Trending Now</h2>

      {error && <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {products.map((p) => (
          <div key={p.id} className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
