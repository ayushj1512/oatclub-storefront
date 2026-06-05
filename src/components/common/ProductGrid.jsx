"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductGrid({ products = [], title = "", loading = false }) {
  const initWishlist = useWishlistStore((s) => s.initialize);
  const initCart = useCartStore((s) => s.initialize);
  const initViewed = useRecentlyViewedStore((s) => s.initialize);
  const [showEmpty, setShowEmpty] = useState(false);

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p?.id || p?._id) : []),
    [products]
  );

  useEffect(() => {
    initWishlist?.();
    initCart?.();
    initViewed?.();
  }, [initWishlist, initCart, initViewed]);

  useEffect(() => {
    if (loading || safeProducts.length) {
      setShowEmpty(false);
      return;
    }

    const timer = setTimeout(() => setShowEmpty(true), 1200);
    return () => clearTimeout(timer);
  }, [loading, safeProducts.length]);

  const gridClass =
    "grid grid-cols-2 gap-2 px-3 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:px-4";
  const skeleton = Array.from({ length: 8 });

  return (
    <section className="w-full bg-white">
      {title ? (
        <h2 className="mb-3 px-3 text-lg font-extrabold uppercase text-black md:px-4 md:text-xl">
          {title}
        </h2>
      ) : null}

      {!loading && !safeProducts.length && !showEmpty ? (
        <div className="py-10">
          <UniversalLuxuryLoader />
        </div>
      ) : (
        <div className={gridClass}>
          {loading
            ? skeleton.map((_, index) => <ProductCard key={index} loading />)
            : safeProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
        </div>
      )}

      {!loading && !safeProducts.length && showEmpty ? (
        <p className="mt-4 text-center text-sm text-black/55">No products found.</p>
      ) : null}
    </section>
  );
}
