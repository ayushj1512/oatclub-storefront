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

    <div className="p-2 md:p-3 space-y-2">
      <div className="relative h-3 w-4/5 bg-black/5 overflow-hidden rounded">
        <div className="absolute inset-0 shimmer" />
      </div>

      <div className="relative h-3.5 w-2/5 bg-black/5 overflow-hidden rounded">
        <div className="absolute inset-0 shimmer" />
      </div>
    </div>
  </div>
);

/* -------------------------- helpers -------------------------- */
function toNum(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* -------------------------- Safe image helper -------------------------- */
function getSafeImage(product) {
  try {
    const img =
      product?.thumbnail ||
      product?.images?.[0]?.src ||
      product?.images?.[0] ||
      product?.image ||
      product?.featured_image ||
      "";

    if (typeof img !== "string") return "";
    if (img.trim().length < 8) return "";
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http") || img.startsWith("/")) return img;

    return "";
  } catch {
    return "";
  }
}

/* -------------------------- Hover image helper -------------------------- */
function getSafeHoverImage(product) {
  try {
    const img = product?.images?.[1]?.src || product?.images?.[1] || "";
    if (typeof img !== "string") return null;
    if (img.trim().length < 8) return null;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return null;
  } catch {
    return null;
  }
}

/* --------------------- derive category slug robust --------------------- */
function getCategorySlug(product) {
  // ✅ API categories: ["all-clothing", "hoodies", ...]
  const arr = Array.isArray(product?.categories)
    ? product.categories
    : Array.isArray(product?.raw?.categories)
    ? product.raw.categories
    : [];

  const banned = ["all-clothing", "featured", "uncategorized"];

  const preferred =
    arr.find((c) => c && !banned.includes(String(c).toLowerCase())) ||
    arr[0] ||
    product?.category ||
    "products";

  return slugify(preferred);
}

/* --------------------- derive real sale price --------------------- */
function getBestPrice(product) {
  const base = toNum(product?.sale_price ?? product?.price);

  const variantPrices = Array.isArray(product?.variants)
    ? product.variants.map((v) => toNum(v?.price)).filter((x) => x > 0)
    : [];

  const variantMin = variantPrices.length ? Math.min(...variantPrices) : 0;

  return base > 0 ? base : variantMin;
}

/* --------------------- derive compareAtPrice --------------------- */
function getBestCompareAtPrice(product) {
  const compareBase = toNum(product?.compareAtPrice ?? product?.compare_at_price);

  const variantComparePrices = Array.isArray(product?.variants)
    ? product.variants
        .map((v) => toNum(v?.compareAtPrice ?? v?.compare_at_price))
        .filter((x) => x > 0)
    : [];

  const variantMax = variantComparePrices.length ? Math.max(...variantComparePrices) : 0;

  return compareBase > 0 ? compareBase : variantMax;
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

  // ✅ normalize id
  const pid = product?._id || product?.id || product?.productId;
  if (!pid) return null;

  // ✅ derive name (API gives title)
  const productName = product?.title || product?.name || "Product";

  // ✅ strict filters
  const image = getSafeImage(product);
  const sale = getBestPrice(product);

  // ❌ if image missing OR price 0 => never show
  if (!image) return null;
  if (!sale || sale <= 0) return null;

  const compareAt = getBestCompareAtPrice(product);
  const showCompare = compareAt > sale;

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
    if (disableRecentlyViewed) return;
    addProduct?.(product);
  }, [product, disableRecentlyViewed, addProduct]);

  const hoverImage = useMemo(() => getSafeHoverImage(product), [product]);

  const category = useMemo(() => getCategorySlug(product), [product]);

  const formattedName = useMemo(
    () => slugify(product?.slug || productName),
    [product?.slug, productName]
  );

  const productLink = `/category/${category}/${formattedName}/${pid}`;

  const wishlisted = isInWishlist?.(pid);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(pid) : addToWishlist(product);
  };

  const handleProductClick = () => {
    trackProductView?.(pid);
  };

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
          <Image
            src={image}
            alt={productName}
            fill
            loading="lazy"
            sizes="(max-width: 600px) 45vw, 220px"
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />

          {canHover && hoverImage && (
            <Image
              src={hoverImage}
              alt={`${productName} Hover`}
              fill
              loading="lazy"
              sizes="(max-width: 600px) 45vw, 220px"
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
            className="absolute top-2 right-2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm flex items-center justify-center z-10 transition hover:bg-white"
          >
            <Heart
              className={
                wishlisted
                  ? "w-4 h-4 md:w-5 md:h-5 text-[#800020] fill-[#800020]"
                  : "w-4 h-4 md:w-5 md:h-5 text-black/60"
              }
            />
          </motion.button>
        </div>

        {/* CONTENT */}
        <div className="p-2 md:p-3 flex flex-col gap-1.5 md:gap-2">
          <h3 className="text-[13px] md:text-[15px] font-semibold text-black leading-snug line-clamp-2">
            {productName}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-[14px] md:text-[16px] font-semibold text-black">
              ₹{sale}
            </span>

            {/* ✅ compareAtPrice show */}
            {showCompare && (
              <span className="text-[12px] md:text-[14px] text-gray-500 line-through">
                ₹{compareAt}
              </span>
            )}

            {/* ✅ optional discount badge */}
            {showCompare && (
              <span className="text-[11px] md:text-[12px] font-semibold text-green-700">
                {Math.round(((compareAt - sale) / compareAt) * 100)}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
