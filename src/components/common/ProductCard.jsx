"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductCard({ product }) {
  if (!product) return null;

  const {
    items,                // ✅ Correct key
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    initialize,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const { addProduct } = useRecentlyViewedStore();

  // ⭐ Load wishlist cookie on first render  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const image = product?.images?.[0]?.src || "/placeholder.png";
  const price =
    product?.price ||
    product?.sale_price ||
    product?.regular_price ||
    "0";

  const isOnSale = Boolean(product?.on_sale);
  const productLink = `/product/${product?.slug || product?.id}`;

  // ⭐ Correct wishlist check
  const isWishlisted = isInWishlist(product?.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  useEffect(() => {
    if (product?.id) addProduct(product);
  }, [product, addProduct]);

  return (
    <Link
      href={productLink}
      className="
        relative flex flex-col bg-white rounded-2xl shadow-sm 
        hover:shadow-md transition-all overflow-hidden 
        w-[160px] sm:w-[200px] md:w-[240px]
      "
    >
      <div className="relative w-full h-[220px] bg-gray-100 p-2">
        <Image
          src={image}
          alt={product?.name || "Product"}
          fill
          className="object-contain"
        />

        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            SALE
          </div>
        )}

        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
        >
          <Heart
            className={`w-5 h-5 ${
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-gray-500"
            }`}
          />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product?.name || "Untitled Product"}
        </h3>

        <p className="text-md font-semibold text-[#111827]">₹{price}</p>

        <button
          onClick={handleAddToCart}
          className="
            mt-2 flex items-center justify-center gap-2 text-sm 
            bg-black text-white py-2 rounded-lg 
            hover:bg-gray-900 transition
          "
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </Link>
  );
}
