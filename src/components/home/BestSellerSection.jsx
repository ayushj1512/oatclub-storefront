"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

/* 🔥 Shimmer block (JS only) */
function ShimmerBlock({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function BestSellerSection() {
  const { allProducts, isLoading, error, fetchProducts } = useProductStore();
  const fetchedRef = useRef(false);

  // 🔁 Fetch once only (StrictMode safe)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProducts({
      page: 1,
      limit: 60,
      isActive: true,
      category: "best-sellers",
      sort: "newest",
    });
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
          originalPrice: p.compareAtPrice
            ? Number(p.compareAtPrice)
            : null,
          image: p.image || "/placeholder.png",
          slug: p.slug || p.id,
          on_sale:
            p.compareAtPrice &&
            Number(p.compareAtPrice) > Number(p.price || 0),
          category: p.category,
          currency: p.currency,
        })),
    [allProducts]
  );

  /* ================= SHIMMER LOADING ================= */
  if (isLoading && !products.length) {
    return (
      <section className="pt-10 px-4 bg-white">
        {/* Heading shimmer */}
        <div className="w-full text-center mb-6">
          <ShimmerBlock className="h-7 w-52 mx-auto rounded" />
        </div>

        {/* Product shimmer row */}
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
      {/* Heading */}
    <div className="w-full bg-black text-center mb-6">
  <h2 className="text-white py-3 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em]">
    Best Sellers
  </h2>
</div>


      {error && (
        <p className="text-sm text-red-600 text-center mb-3">
          ❌ {error}
        </p>
      )}

      {/* Products */}
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
