"use client";

import { useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductGrid({ products = [], title, loading = false }) {
  const { initialize: initWishlist } = useWishlistStore();
  const { initialize: initCart } = useCartStore();
  const { initialize: initViewed } = useRecentlyViewedStore();

  // Initialize global stores once
  useEffect(() => {
    initWishlist();
    initCart();
    initViewed();
  }, [initWishlist, initCart, initViewed]);

  // Number of shimmer cards while loading
  const shimmerCount = 12;

  return (
    <section className="w-full flex flex-col items-center py-4 px-3 md:px-6 bg-white">
      {/* Title */}
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h2>
      )}

      {/* Loading State → Shimmer Cards */}
      {loading && (
        <div
          className="
            flex flex-wrap justify-center 
            gap-3 sm:gap-4 md:gap-5 
            w-full
          "
        >
          {Array.from({ length: shimmerCount }).map((_, i) => (
            <div
              key={`shimmer-${i}`}
              className="
                w-[48%] 
                sm:w-[31%] 
                md:w-[22%] 
                lg:w-[19%] 
                xl:w-[17%]
                2xl:w-[15%]
                flex justify-center
              "
            >
              <ProductCard loading={true} />
            </div>
          ))}
        </div>
      )}

      {/* Show Products */}
      {!loading && products.length > 0 ? (
        <div
          className="
            flex flex-wrap justify-center 
            gap-3 sm:gap-4 md:gap-5 
            w-full
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="
                w-[48%] 
                sm:w-[31%] 
                md:w-[22%] 
                lg:w-[19%] 
                xl:w-[17%]
                2xl:w-[15%]
                flex justify-center
              "
            >
              <ProductCard product={product} loading={false} />
            </div>
          ))}
        </div>
      ) : null}

      {/* No products */}
      {!loading && products.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No products found.</p>
      )}
    </section>
  );
}
