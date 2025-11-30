"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------
   SHIMMER — unchanged (clean & minimal)
------------------------------------------------------------------- */
const ShimmerCard = () => (
  <div className="w-full bg-white border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-gray-200" />
    <div className="p-3 space-y-3">
      <div className="h-4 bg-gray-200 w-3/4" />
      <div className="h-4 bg-gray-200 w-1/2" />
    </div>
  </div>
);

/* ------------------------------------------------------------------
   SAFE IMAGE HELPER
------------------------------------------------------------------- */
function getSafeImage(product) {
  try {
    const img =
      product?.images?.[0]?.src ||
      product?.image ||
      product?.featured_image ||
      "";

    if (typeof img !== "string") return "/placeholder.png";
    if (img.trim().length < 5) return "/placeholder.png";
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http") || img.startsWith("/")) return img;

    return "/placeholder.png";
  } catch {
    return "/placeholder.png";
  }
}

/* ------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------- */
export default function ProductCard({
  product,
  loading = false,
  disableRecentlyViewed = false,
}) {
  if (loading || !product) return <ShimmerCard />;

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    initialize: initWishlist,
  } = useWishlistStore();

  const { addProduct } = useRecentlyViewedStore();

  /* Initialize wishlist */
  useEffect(() => {
    initWishlist?.();
  }, [initWishlist]);

  /* Add to Recently Viewed (Safely) */
  useEffect(() => {
    if (!product?.id) return;
    if (disableRecentlyViewed) return;

    // Avoid infinite loops + invalid images
    addProduct(product);
  }, [product, disableRecentlyViewed, addProduct]);

  /* 🛡 SAFE IMAGE */
  const image = useMemo(() => getSafeImage(product), [product]);

  /* PRICE FALLBACK */
  const price =
    product?.price ||
    product?.sale_price ||
    product?.regular_price ||
    "0";

  const isOnSale = Boolean(product?.on_sale);

  /* CATEGORY FALLBACK */
  const category =
    product?.categories?.[0]?.slug ||
    product?.categories?.[0]?.name ||
    "products";

  /* URL-SAFE NAME */
  const formattedName = String(product?.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  /* PRODUCT URL */
  const productLink = `/${category}/${formattedName}/${product.id}`;

  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  /* ------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */
  return (
    <Link
      href={productLink}
      className="group relative flex flex-col bg-white border border-gray-200 hover:border-gray-300 transition-all overflow-hidden w-full"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[3/4] bg-gray-50 p-2 overflow-hidden">
        <Image
          src={image}
          alt={product?.name || "Product"}
          fill
          loading="lazy"
          sizes="(max-width: 600px) 50vw, 220px"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#800020] text-white text-xs tracking-wide px-2 py-1">
            SALE
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <motion.button
          onClick={toggleWishlist}
          whileTap={{ scale: 0.85 }}
          animate={
            wishlisted
              ? { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
              : {}
          }
          className="absolute top-2 right-2 p-1 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all"
        >
          <Heart
            className={`w-6 h-6 ${
              wishlisted ? "text-[#800020] fill-[#800020]" : "text-gray-700"
            }`}
          />
        </motion.button>
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">
          {product?.name}
        </h3>

        <p className="text-lg font-semibold text-gray-900">₹{price}</p>
      </div>
    </Link>
  );
}
