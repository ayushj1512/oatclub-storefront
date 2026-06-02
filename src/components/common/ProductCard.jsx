"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Crown, TrendingUp, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { motion } from "framer-motion";
import SizeSelectModal from "@/components/product/SizeSelectModal";

/* ----------------------------- Shimmer ----------------------------- */
const ShimmerCard = () => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-white">
    <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
      <div className="absolute inset-0 shimmer" />
    </div>

    <div className="space-y-2 pt-2.5">
      <div className="relative h-3 w-4/5 overflow-hidden bg-black/5">
        <div className="absolute inset-0 shimmer" />
      </div>

      <div className="relative h-3.5 w-2/5 overflow-hidden bg-black/5">
        <div className="absolute inset-0 shimmer" />
      </div>
    </div>
  </div>
);

/* ----------------------------- helpers ----------------------------- */
function toNum(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  return toNum(n).toLocaleString("en-IN");
}

function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

function getBestPrice(product) {
  const base = toNum(product?.sale_price ?? product?.price ?? product?.currentPrice);

  const variantPrices = Array.isArray(product?.variants)
    ? product.variants.map((v) => toNum(v?.price)).filter((x) => x > 0)
    : [];

  const variantMin = variantPrices.length ? Math.min(...variantPrices) : 0;

  return base > 0 ? base : variantMin;
}

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
      .map((v) => toNum(v?.compareAtPrice ?? v?.compare_at_price ?? v?.mrp))
      .filter((x) => x > 0)
    : [];

  const variantMax = variantComparePrices.length
    ? Math.max(...variantComparePrices)
    : 0;

  return compareBase > 0 ? compareBase : variantMax;
}

export default function ProductCard({
  product,
  loading = false,
  disableRecentlyViewed = false,
  hideWishlistIcon = false,
}) {
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
  const [sizeOpen, setSizeOpen] = useState(false);

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
    if (!product || disableRecentlyViewed) return;
    addProduct?.(product);
  }, [product, disableRecentlyViewed, addProduct]);

  const hoverImage = useMemo(() => getSafeHoverImage(product), [product]);
  const category = useMemo(() => getCategorySlug(product), [product]);
  const productName = product?.title || product?.name || "Product";

  const formattedName = useMemo(
    () => slugify(product?.slug || productName),
    [product?.slug, productName]
  );

  if (loading || !product) {
    return (
      <div className="pointer-events-none select-none">
        <ShimmerCard />
      </div>
    );
  }

  const pid = product?._id || product?.id || product?.productId;
  if (!pid) return null;

  const pcode = String(product?.productCode || product?.raw?.productCode || "").trim();
  if (!pcode) return null;

  const image = getSafeImage(product);
  const sale = getBestPrice(product);

  if (!image || !sale || sale <= 0) return null;

  const compareAt = getBestCompareAtPrice(product);

  const isBestSeller = !!(product?.isBestSeller ?? product?.raw?.isBestSeller);
  const isTrendingRaw = !!(product?.isTrending ?? product?.raw?.isTrending);
  const isTrending = !isBestSeller && isTrendingRaw;

  const showCompare = compareAt > 0 && sale > 0 && compareAt > sale;
  const discount = showCompare
    ? Math.round(((compareAt - sale) / compareAt) * 100)
    : 0;

  const productLink = `/category/${category}/${formattedName}/${encodeURIComponent(pcode)}`;
  const wishlisted = isInWishlist?.(pid);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(pid) : addToWishlist(product);
  };

  const openSizeModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSizeOpen(true);
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
    <>
      <Link
        href={productLink}
        onClick={handleProductClick}
        className="group block h-full w-full bg-white"
      >
        <div
          className="flex h-full flex-col transition-transform duration-300 md:hover:-translate-y-1"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            {(isBestSeller || isTrending) && (
              <div className="absolute left-2 top-2 z-10 flex max-w-[70%] flex-col items-start gap-1.5">
                {isBestSeller && (
                  <span className="inline-flex items-center gap-1 bg-black/70 px-2 py-1 text-[9px] font-bold tracking-wide text-white backdrop-blur-md">
                    <Crown className="h-3 w-3 text-white" />
                    BESTSELLER
                  </span>
                )}

                {isTrending && (
                  <span className="inline-flex items-center gap-1 bg-black/60 px-2 py-1 text-[9px] font-bold tracking-wide text-white backdrop-blur-md">
                    <TrendingUp className="h-3 w-3 text-white" />
                    TRENDING
                  </span>
                )}
              </div>
            )}

            <Image
              src={image}
              alt={productName}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              className={`object-cover transition duration-500 group-hover:scale-[1.03] ${isHovered ? "opacity-0" : "opacity-100"
                }`}
            />

            {canHover && hoverImage && (
              <Image
                src={hoverImage}
                alt={`${productName} Hover`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                className={`object-cover transition duration-500 group-hover:scale-[1.03] ${isHovered ? "opacity-100" : "opacity-0"
                  }`}
              />
            )}

            {!hideWishlistIcon && (
              <motion.button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleWishlist}
                whileTap={{ scale: 0.9 }}
                aria-label="Wishlist"
                className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center text-black transition hover:text-red-600 md:h-9 md:w-9"
              >
                <Heart
                  className={
                    wishlisted
                      ? "h-4 w-4 fill-current text-current md:h-5 md:w-5"
                      : "h-4 w-4 text-current md:h-5 md:w-5"
                  }
                />
              </motion.button>
            )}

            {/* Desktop hover Add to Cart */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 hidden translate-y-3 opacity-0 transition-all duration-300 md:block md:group-hover:translate-y-0 md:group-hover:opacity-100">
              <button
                type="button"
                onClick={openSizeModal}
                className="pointer-events-auto flex h-11 w-full items-center justify-center gap-2 bg-black text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2.5">
            <h3
              title={productName}
              className="
    line-clamp-2
    h-[34px]
    text-[12px]
    font-semibold
    uppercase
    leading-[17px]
    text-black
    md:h-[40px]
    md:text-[13px]
    md:leading-5
  "
            >
              {productName}
            </h3>

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[13px] font-bold text-black md:text-[15px]">
                ₹{formatMoney(sale)}
              </span>

              {showCompare && (
                <span className="text-[11px] text-black/40 line-through md:text-[13px]">
                  ₹{formatMoney(compareAt)}
                </span>
              )}

              {discount > 0 && (
                <span className="text-[10px] font-bold uppercase text-black/55 md:text-[11px]">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Mobile Add to Cart */}
            <button
              type="button"
              onClick={openSizeModal}
              className="mt-1 flex h-9 w-full items-center justify-center gap-2 bg-black text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 active:scale-[0.98] md:hidden"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </Link>

      <SizeSelectModal
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        product={product}
      />
    </>
  );
}