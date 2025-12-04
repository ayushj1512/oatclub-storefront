"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { motion } from "framer-motion";

export default function TrendingSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/wc/products");
        const data = await res.json();

        if (!mounted || !Array.isArray(data)) return;

        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name || "",
            price: Number(p.price || 0),
            originalPrice: p.regular_price ? Number(p.regular_price) : null,
            image: p.images?.[0]?.src || "/placeholder.png",
            slug: p.slug || p.id,
            on_sale: p.on_sale,
          }))
        );
      } catch (e) {
        console.error("Trending Fetch Error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  /* LOADING */
  if (loading) {
    return (
      <section className="pt-10 px-4 bg-white">
      <h2 className="text-xl md:text-2xl font-extrabold text-center text-black mb-6 tracking-wide uppercase border-b-4 border-[#800020] w-fit mx-auto pb-1">
  Trending Now
</h2>


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

  /* READY CONTENT */
  return (
    <motion.section
      className="pt-10 px-4 bg-white"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
     <h2 className="text-xl md:text-2xl font-extrabold text-center text-black mb-6 tracking-wide uppercase border-b-4 border-[#800020] w-fit mx-auto pb-1">
  Trending Now
</h2>


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
