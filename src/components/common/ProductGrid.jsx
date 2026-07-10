"use client";

import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/common/ProductCard";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductGrid({
  products = [],
  title = "",
  loading = false,
}) {
  const initWishlist = useWishlistStore((state) => state.initialize);
  const initCart = useCartStore((state) => state.initialize);
  const initViewed = useRecentlyViewedStore((state) => state.initialize);

  const [showEmpty, setShowEmpty] = useState(false);

  const safeProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter(
      (product) => product?.id || product?._id
    );
  }, [products]);

  useEffect(() => {
    initWishlist?.();
    initCart?.();
    initViewed?.();
  }, [initWishlist, initCart, initViewed]);

  useEffect(() => {
    if (loading || safeProducts.length > 0) {
      setShowEmpty(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowEmpty(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [loading, safeProducts.length]);

  const skeletonItems = Array.from({ length: 8 });

  return (
    <section className="w-full overflow-hidden bg-white">
      {title ? (
        <h2 className="mb-2 px-1 text-lg font-extrabold uppercase text-black sm:px-2 md:text-xl">
          {title}
        </h2>
      ) : null}

      {!loading && safeProducts.length === 0 && !showEmpty ? (
        <div className="py-10">
          <UniversalLuxuryLoader />
        </div>
      ) : (
        <div
          className="
            grid w-full grid-cols-2
            gap-x-[3px] gap-y-2
            px-1
            sm:grid-cols-3 sm:gap-x-1.5 sm:gap-y-3 sm:px-1.5
            md:grid-cols-4 md:gap-x-2 md:gap-y-4 md:px-2
          "
        >
          {loading
            ? skeletonItems.map((_, index) => (
                <ProductCard
                  key={`skeleton-${index}`}
                  loading
                />
              ))
            : safeProducts.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
        </div>
      )}

      {!loading && safeProducts.length === 0 && showEmpty ? (
        <p className="mt-4 text-center text-sm text-black/55">
          No products found.
        </p>
      ) : null}
    </section>
  );
}