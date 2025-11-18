"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { motion } from "framer-motion";

export default function TrendingSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    try {
      const res = await fetch("/api/wc/products");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }

      const mapped = data.map((p) => ({
        id: p.id,
        name: p.name || "",
        price: Number(p.price || 0),
        originalPrice: p.regular_price ? Number(p.regular_price) : null,
        images: p.images || [],
        image: p.images?.[0]?.src || "/placeholder.png",
        slug: p.slug || p.id,
        on_sale: p.on_sale,
      }));

      setProducts(mapped);
    } catch (err) {
      console.error("Trending Fetch Error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  // ---------------------------------------
  // LOADING SKELETON ROW
  // ---------------------------------------
  if (loading)
    return (
      <div className="py-10 px-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">Trending Now</h2>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="w-[160px] sm:w-[200px] md:w-[240px] aspect-[4/3] bg-gray-200 rounded-xl"
            />
          ))}
        </div>
      </div>
    );

  if (!products.length) return null;

  // ------------------------------------------------------
  // HORIZONTAL PRODUCT ROW
  // ------------------------------------------------------
  return (
    <motion.div
      className="py-10 px-4 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-4">Trending Now</h2>

      <div
        className="
          flex gap-4 overflow-x-auto scrollbar-hide 
          snap-x snap-mandatory
          pb-2
        "
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
