"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { motion } from "framer-motion";

/* ----------------------------- Shimmer ----------------------------- */
const ShimmerCard = () => (
  <div className="w-full bg-white overflow-hidden flex flex-col h-full">
    <div className="aspect-[3/4] bg-black/5 animate-pulse" />
    <div className="p-3 space-y-2 animate-pulse">
      <div className="h-3.5 bg-black/5 w-4/5" />
      <div className="h-4 bg-black/5 w-2/5" />
    </div>
  </div>
);

/* -------------------------- Safe image helper -------------------------- */
function getSafeImage(product) {
  try {
    const img = product?.images?.[0]?.src || product?.image || product?.featured_image || "";
    if (typeof img !== "string") return "/placeholder.png";
    if (img.trim().length < 5) return "/placeholder.png";
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return "/placeholder.png";
  } catch {
    return "/placeholder.png";
  }
}

function toNum(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function ProductCard({ product, loading = false, disableRecentlyViewed = false }) {
  if (loading || !product) return <ShimmerCard />;

  const { addToWishlist, removeFromWishlist, isInWishlist, initialize: initWishlist } =
    useWishlistStore();
  const { addProduct } = useRecentlyViewedStore();

  useEffect(() => {
    initWishlist?.();
  }, [initWishlist]);

  useEffect(() => {
    if (!product?.id) return;
    if (disableRecentlyViewed) return;
    addProduct(product);
  }, [product, disableRecentlyViewed, addProduct]);

  const image = useMemo(() => getSafeImage(product), [product]);

  const sale = toNum(product?.sale_price ?? product?.price);

  const category = product?.categories?.[0]?.slug || product?.categories?.[0]?.name || "products";
  const formattedName = String(product?.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const productLink = `/category/${category}/${formattedName}/${product.id}`;

  const wishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  return (
    <Link
      href={productLink}
      className="group block w-full bg-white overflow-hidden h-full"
    >
      {/* Card wrapper: makes all cards equal height in a grid */}
      <div className="flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 active:translate-y-0">
        {/* IMAGE (fixed ratio => consistent) */}
        <div className="relative w-full aspect-[3/4] bg-white">
          <Image
            src={image}
            alt={product?.name || "Product"}
            fill
            loading="lazy"
            sizes="(max-width: 600px) 50vw, 220px"
            className="object-cover"
          />

          {/* Wishlist icon (top-right) */}
          <motion.button
            type="button"
            onClick={toggleWishlist}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-transparent"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={
                wishlisted
                  ? "w-6 h-6 text-[#800020] fill-[#800020]"
                  : "w-6 h-6 text-black/70"
              }
            />
          </motion.button>
        </div>

        {/* CONTENT (consistent lines => consistent height) */}
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-black leading-snug line-clamp-2">
            {product?.name}
          </h3>

          {/* Keep this row always present, so card heights match perfectly */}
          <div className="flex items-baseline gap-2">
            {sale != null ? (
              <span className="text-[16px] font-semibold text-black">₹{sale}</span>
            ) : (
              <span className="text-[16px] font-semibold text-transparent select-none">₹</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
