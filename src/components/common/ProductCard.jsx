"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { motion } from "framer-motion";

/* ----------------------------- Shimmer ----------------------------- */
const ShimmerCard = () => (
  <div className="w-full bg-white overflow-hidden flex flex-col h-full">
    <div className="relative aspect-[3/4] bg-black/5 overflow-hidden">
      <div className="absolute inset-0 shimmer" />
    </div>

    <div className="p-3 space-y-2">
      <div className="relative h-3.5 w-4/5 bg-black/5 overflow-hidden rounded">
        <div className="absolute inset-0 shimmer" />
      </div>

      <div className="relative h-4 w-2/5 bg-black/5 overflow-hidden rounded">
        <div className="absolute inset-0 shimmer" />
      </div>
    </div>
  </div>
);

/* -------------------------- Safe image helper -------------------------- */
function getSafeImage(product) {
  try {
    const img =
      product?.images?.[0]?.src ||
      product?.images?.[0] ||
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

/* -------------------------- Hover image helper -------------------------- */
function getSafeHoverImage(product) {
  try {
    const img =
      product?.images?.[1]?.src ||
      product?.images?.[1] ||
      "";

    if (typeof img !== "string") return null;
    if (img.trim().length < 5) return null;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http") || img.startsWith("/")) return img;

    return null;
  } catch {
    return null;
  }
}

function toNum(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function ProductCard({
  product,
  loading = false,
  disableRecentlyViewed = false,
}) {
  if (loading || !product) {
    return (
      <div className="pointer-events-none select-none">
        <ShimmerCard />
      </div>
    );
  }

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    initialize: initWishlist,
  } = useWishlistStore();

  const { addProduct } = useRecentlyViewedStore();
  const trackProductView = useAnalyticsStore((s) => s.trackProductView);

  const [canHover, setCanHover] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");

    setCanHover(mq.matches);

    const handler = (e) => setCanHover(e.matches);
    mq.addEventListener?.("change", handler);

    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    initWishlist?.();
  }, [initWishlist]);

  useEffect(() => {
    if (!product?.id || disableRecentlyViewed) return;
    addProduct(product);
  }, [product, disableRecentlyViewed, addProduct]);

  const image = useMemo(() => getSafeImage(product), [product]);
  const hoverImage = useMemo(() => getSafeHoverImage(product), [product]);

  const sale = toNum(product?.sale_price ?? product?.price);

  const category =
    product?.categories?.[0]?.slug ||
    product?.categories?.[0]?.name ||
    "products";

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

  const handleProductClick = () => {
    trackProductView(product.id);
  };

  // ✅ Desktop only hover handlers
  const handleEnter = () => {
    if (canHover && hoverImage) setIsHovered(true);
  };

  const handleLeave = () => {
    if (canHover && hoverImage) setIsHovered(false);
  };

  return (
    <Link
      href={productLink}
      onClick={handleProductClick}
      className="block w-full bg-white overflow-hidden h-full"
    >
      <div
        className="flex flex-col h-full transition-transform duration-300 hover:-translate-y-1"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* IMAGE */}
        <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
          {/* Primary image */}
          <Image
            src={image}
            alt={product?.name || "Product"}
            fill
            loading="lazy"
            sizes="(max-width: 600px) 50vw, 220px"
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Hover image */}
          {canHover && hoverImage && (
            <Image
              src={hoverImage}
              alt={product?.name || "Product Hover"}
              fill
              loading="lazy"
              sizes="(max-width: 600px) 50vw, 220px"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Wishlist */}
      <motion.button
  type="button"
  onClick={toggleWishlist}
  whileTap={{ scale: 0.9 }}
 className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm flex items-center justify-center z-10 transition hover:bg-white"
>
  <Heart
    className={
      wishlisted
        ? "w-5 h-5 text-[#800020] fill-[#800020]"
        : "w-5 h-5 text-black/60"
    }
  />
</motion.button>

        </div>

        {/* CONTENT */}
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-black leading-snug line-clamp-2">
            {product?.name}
          </h3>

          <div className="flex items-baseline gap-2">
            {sale != null ? (
              <span className="text-[16px] font-semibold text-black">
                ₹{sale}
              </span>
            ) : (
              <span className="text-[16px] font-semibold text-transparent">
                ₹
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
