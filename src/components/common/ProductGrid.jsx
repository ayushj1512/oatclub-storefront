"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductGrid({ products = [], title = "", loading = false }) {
  const { initialize: initWishlist } = useWishlistStore();
  const { initialize: initCart } = useCartStore();
  const { initialize: initViewed } = useRecentlyViewedStore();

  /* INIT STORES */
  useEffect(() => {
    initWishlist();
    initCart();
    initViewed();
  }, []);

  const shimmerCount = 12;

  return (
    <section className="w-full bg-white px-3 md:px-4">
      {title && (
        <h2 className="text-lg md:text-xl font-semibold text-black mb-3">
          {title}
        </h2>
      )}

      {/* =============================================== */}
      {/* ANIMATED PRODUCT GRID */}
      {/* =============================================== */}
      <motion.div
        layout
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
          gap-2 sm:gap-3 md:gap-4
        "
      >
        <AnimatePresence mode="popLayout">
          {/* LOADING SHIMMER */}
          {loading &&
            Array.from({ length: shimmerCount }).map((_, i) => (
              <motion.div
                key={`shimmer-${i}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <ProductCard loading={true} />
              </motion.div>
            ))}

          {/* PRODUCTS */}
          {!loading &&
            products.map((product) => {
              if (!product || !product.id) return null;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.22 }}
                  className="w-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>

      {/* NO PRODUCTS */}
      {!loading && products.length === 0 && (
        <p className="text-gray-700 text-sm mt-4 text-center">
          No products found.
        </p>
      )}
    </section>
  );
}
