"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { motion } from "framer-motion";

/* ---------------------------------------------------
   SHIMMER SKELETON (Hydration-Safe, No Mismatch)
---------------------------------------------------- */
const ShimmerCard = () => {
  return (
    <div className="w-[160px] sm:w-[200px] md:w-[240px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-[220px] bg-gray-200" />
      <div className="p-3 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-lg mt-3" />
      </div>
    </div>
  );
};

/* ---------------------------------------------------
                 PRODUCT CARD
---------------------------------------------------- */
export default function ProductCard({ product, loading = false }) {
  /** CLIENT-SAFE: Show shimmer on SSR */
  if (loading || !product) return <ShimmerCard />;

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    initialize: initWishlist,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const { addProduct } = useRecentlyViewedStore();

  /* -----------------------------------
      INIT WISHLIST (Safe, Non-SSR)
  ----------------------------------- */
  useEffect(() => {
    try {
      initWishlist?.();
    } catch (_) {}
  }, []);

  /* -----------------------------------
      TRACK RECENTLY VIEWED
  ----------------------------------- */
  useEffect(() => {
    if (product?.id) addProduct(product);
  }, [product?.id]);

  /* -----------------------------------
      BASIC PRODUCT VALUES
  ----------------------------------- */
  const image = product?.images?.[0]?.src || "/placeholder.png";
  const price =
    product?.price ||
    product?.sale_price ||
    product?.regular_price ||
    "0";

  const isOnSale = Boolean(product?.on_sale);

  /* SEO ROUTING */
  const category =
    product?.categories?.[0]?.slug ||
    product?.categories?.[0]?.name ||
    "products";

  const formattedName = String(product?.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const productLink = `/${category}/${formattedName}/${product.id}`;

  /* Wishlist Logic */
  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        ...product,
        categories: product.categories || [],
        tags: product.tags || [],
        images: product.images || [],
      });
    }
  };

  /* Add To Cart */
  const addCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link
      href={productLink}
      className="
        relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
        hover:shadow-lg transition-all overflow-hidden
        w-[160px] sm:w-[200px] md:w-[240px]
      "
    >
      {/* IMAGE */}
      <div className="relative w-full h-[220px] bg-gray-50 p-3 rounded-t-2xl overflow-hidden">

        <Image
          src={image}
          alt={product?.name || "Product"}
          fill
          loading="lazy"
          className="object-contain transition-transform duration-500 hover:scale-105"
        />

        {/* SALE BADGE */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#800020] text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
            SALE
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <motion.button
          onClick={toggleWishlist}
          whileTap={{ scale: 0.75 }}
          animate={
            wishlisted
              ? { scale: [1, 1.25, 1], transition: { duration: 0.35 } }
              : {}
          }
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
        >
          <Heart
            className={`w-5 h-5 transition ${
              wishlisted
                ? "text-[#800020] fill-[#800020]"
                : "text-gray-600"
            }`}
          />
        </motion.button>
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product?.name}
        </h3>

        <p className="text-lg font-semibold text-gray-900">₹{price}</p>

        <button
          onClick={addCart}
          className="
            mt-3 flex items-center justify-center gap-2 text-sm
            bg-[#800020] text-white py-2 rounded-lg
            hover:bg-[#6a001a] transition-all shadow-sm active:scale-95
          "
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </Link>
  );
}
