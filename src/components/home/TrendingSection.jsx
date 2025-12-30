"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

export default function TrendingSection() {
  const { allProducts, isLoading, error, fetchProducts } = useProductStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProducts({ page: 1, limit: 60, isActive: true, sort: "newest" });
  }, [fetchProducts]);

  const products = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => p?.isInStock !== false)
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          productId: p.productId,
          name: p.name,
          price: Number(p.price || 0),
          originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          image: p.image || "/placeholder.png",
          slug: p.slug || p.id,
          on_sale: p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price || 0),
          category: p.category,
          currency: p.currency,
        })),
    [allProducts]
  );

if (isLoading && !products.length) {
  return (
    <section className="pt-10 px-4 bg-white">
<h2 className="font-bogle text-xl md:text-3xl font-black text-center text-black mb-10  uppercase">
  Trending Now
</h2>





      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
          >
            <ProductCard loading />
          </div>
        ))}
      </div>
    </section>
  );
}


  if (!products.length) return null;

return (
  <motion.section
    className="pt-10 px-4 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
   <h2 className="font-bogle text-xl md:text-3xl font-black text-center text-black mb-10 tracking-[0.28em] uppercase">
  Trending Now
</h2>


    {error && (
      <p className="text-sm text-red-600 text-center mb-3">
        ❌ {error}
      </p>
    )}

    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
      {products.map((p) => (
        <div
          key={p.id}
          className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  </motion.section>
);

}
