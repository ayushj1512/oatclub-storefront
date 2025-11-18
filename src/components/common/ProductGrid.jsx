"use client";

import { useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductGrid({ products = [], title }) {
  const { initialize: initWishlist } = useWishlistStore();
  const { initialize: initCart } = useCartStore();
  const { initialize: initViewed } = useRecentlyViewedStore();

  // ✅ Initialize all stores when ProductGrid mounts
  useEffect(() => {
    initWishlist();
    initCart();
    initViewed();
  }, [initWishlist, initCart, initViewed]);

  return (
    <section className="w-full flex flex-col items-center py-10 px-6 md:px-10 bg-gray-50">
      {/* Optional Section Title */}
      {title && (
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 text-center">
          {title}
        </h2>
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 justify-items-center">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm md:text-base mt-6">
          No products found.
        </p>
      )}
    </section>
  );
}
