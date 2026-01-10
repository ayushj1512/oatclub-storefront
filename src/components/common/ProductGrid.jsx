"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductGrid({ products = [], title = "", loading = false }) {
  const { initialize: initWishlist } = useWishlistStore();
  const { initialize: initCart } = useCartStore();
  const { initialize: initViewed } = useRecentlyViewedStore();

  const [mounted, setMounted] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const gridClassName = useMemo(
    () =>
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4",
    []
  );

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p?.id) : []),
    [products]
  );

  useEffect(() => {
    setMounted(true);
    initWishlist();
    initCart();
    initViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && safeProducts.length === 0) {
      setShowEmpty(false);
      const t = setTimeout(() => setShowEmpty(true), 8000);
      return () => clearTimeout(t);
    }
    setShowEmpty(false);
  }, [loading, safeProducts.length]);

  const shimmer = Array.from({ length: 12 });

  const renderCards = () =>
    loading
      ? shimmer.map((_, i) => (
          <motion.div key={i} layout className="w-full">
            <ProductCard loading />
          </motion.div>
        ))
      : safeProducts.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ProductCard product={p} />
          </motion.div>
        ));

  const isEmpty = !loading && safeProducts.length === 0;

  return (
    <section className="w-full bg-white px-3 md:px-4">
      {title && <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>}

      {isEmpty && !showEmpty ? (
        <div className="py-10">
          <UniversalLuxuryLoader />
        </div>
      ) : mounted ? (
        <motion.div layout className={gridClassName}>
          <AnimatePresence mode="popLayout" initial={false}>
            {renderCards()}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className={gridClassName}>
          {loading
            ? shimmer.map((_, i) => (
                <div key={i} className="w-full">
                  <ProductCard loading />
                </div>
              ))
            : safeProducts.map((p) => (
                <div key={p.id} className="w-full">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      )}

      {isEmpty && showEmpty && (
        <p className="text-gray-700 text-sm mt-4 text-center">No products found.</p>
      )}
    </section>
  );
}
