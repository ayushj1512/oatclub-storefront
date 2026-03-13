"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Crown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { motion } from "framer-motion";

/* ----------------------------- Shimmer ----------------------------- */
const ShimmerCard = () => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-white">
    <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
      <div className="absolute inset-0 shimmer" />
    </div>

    <div className="space-y-2 p-2.5 md:p-3">
      <div className="relative h-3 w-4/5 overflow-hidden rounded bg-black/5">
        <div className="absolute inset-0 shimmer" />
      </div>

      <div className="relative h-3.5 w-2/5 overflow-hidden rounded bg-black/5">
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

function formatMoney(n) {
  const num = toNum(n);
  return num.toLocaleString("en-IN");
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
  const base = toNum(product?.sale_price ?? product?.price ?? product?.currentPrice);

  const variantPrices = Array.isArray(product?.variants)
    ? product.variants.map((v) => toNum(v?.price)).filter((x) => x > 0)
    : [];

  const variantMin = variantPrices.length ? Math.min(...variantPrices) : 0;

  return base > 0 ? base : variantMin;
}

/* --------------------- derive compareAtPrice (ROBUST) --------------------- */
function getBestCompareAtPrice(product) {
  const compareBase = toNum(
    product?.compareAtPrice ??
      product?.compare_at_price ??
      product?.mrp ??
      product?.regular_price ??
      product?.originalPrice ??
      product?.compare_price
  );

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
  hideWishlistIcon = false,
}) {
  if (loading || !product) {
    return (
      <div className="pointer-events-none select-none">
        <ShimmerCard />
      </div>
    );
  }

  const pid = product?._id || product?.id || product?.productId;
  if (!pid) return null;

  const pcode = String(
    product?.productCode || product?.raw?.productCode || ""
  ).trim();
  if (!pcode) return null;

  const productName = product?.title || product?.name || "Product";

  const image = getSafeImage(product);
  const sale = getBestPrice(product);

  if (!image) return null;
  if (!sale || sale <= 0) return null;

  const compareAt = getBestCompareAtPrice(product);

  const isBestSeller = !!(
    product?.isBestSeller ??
    product?.raw?.isBestSeller
  );

  const isTrendingRaw = !!(
    product?.isTrending ??
    product?.raw?.isTrending
  );

  // ✅ if bestseller is present, do not show trending
  const isTrending = !isBestSeller && isTrendingRaw;

  // ✅ safer showCompare + discount calc
  const showCompare = compareAt > 0 && sale > 0 && compareAt > sale;
  const discount = showCompare ? Math.round(((compareAt - sale) / compareAt) * 100) : 0;

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

  const productLink = `/category/${category}/${formattedName}/${encodeURIComponent(pcode)}`;
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
      className="block h-full w-full overflow-hidden bg-white"
    >
      <div
        className="flex h-full flex-col transition-transform duration-300 md:hover:-translate-y-1"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* IMAGE */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-white">
          {(isBestSeller || isTrending) && (
            <div className="absolute left-2 top-2 z-10 flex max-w-[70%] flex-col items-start gap-1.5 md:left-2 md:top-2 md:gap-2">
              {isBestSeller && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[9px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md md:gap-1.5 md:px-2.5 md:py-1 md:text-[11px]">
                  <Crown className="h-3 w-3 text-yellow-400 md:h-3.5 md:w-3.5" />
                  <span className="truncate">BESTSELLER</span>
                </span>
              )}

              {isTrending && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2 py-1 text-[9px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md md:gap-1.5 md:px-2.5 md:py-1 md:text-[11px]">
                  <TrendingUp className="h-3 w-3 text-white md:h-3.5 md:w-3.5" />
                  <span className="truncate">TRENDING</span>
                </span>
              )}
            </div>
          )}

          <Image
            src={image}
            alt={productName}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {!hideWishlistIcon && (
            <motion.button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleWishlist}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/80 shadow-sm backdrop-blur-md transition hover:bg-white md:h-9 md:w-9"
            >
              <Heart
                className={
                  wishlisted
                    ? "h-4 w-4 fill-[#800020] text-[#800020] md:h-5 md:w-5"
                    : "h-4 w-4 text-black/60 md:h-5 md:w-5"
                }
              />
            </motion.button>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-1.5 p-2.5 md:gap-2 md:p-3">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-[12.5px] font-semibold leading-snug text-black md:min-h-[2.8rem] md:text-[15px]">
            {productName}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13px] font-semibold text-black md:text-[16px]">
              ₹{formatMoney(sale)}
            </span>

            {showCompare && (
              <span className="text-[11px] text-gray-500 line-through md:text-[14px]">
                ₹{formatMoney(compareAt)}
              </span>
            )}

            {discount > 0 && (
              <span className="text-[10.5px] font-semibold text-[#800020] md:text-[12px]">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}