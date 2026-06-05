"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useWishlistStore } from "@/store/wishlistStore";

const validImage = (src) =>
  typeof src === "string" &&
  src.trim().length > 7 &&
  (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:"));

const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const money = (v) => toNum(v).toLocaleString("en-IN");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const firstImage = (product) => {
  const img =
    product?.thumbnail ||
    product?.images?.[0]?.src ||
    product?.images?.[0] ||
    product?.image ||
    product?.featured_image ||
    "";
  return validImage(img) ? img : "";
};

const hoverImage = (product) => {
  const img = product?.images?.[1]?.src || product?.images?.[1] || "";
  return validImage(img) ? img : "";
};

const categorySlug = (product) => {
  const list = Array.isArray(product?.categories)
    ? product.categories
    : Array.isArray(product?.raw?.categories)
      ? product.raw.categories
      : [];
  const banned = new Set(["all-clothing", "featured", "uncategorized"]);
  const picked =
    list.find((c) => !banned.has(String(c).toLowerCase())) ||
    list[0] ||
    product?.category ||
    "products";
  return slugify(picked);
};

const bestPrice = (product) => {
  const base = toNum(product?.sale_price ?? product?.price ?? product?.currentPrice);
  const variants = Array.isArray(product?.variants)
    ? product.variants.map((v) => toNum(v?.price)).filter(Boolean)
    : [];
  return base || (variants.length ? Math.min(...variants) : 0);
};

const comparePrice = (product) => {
  const base = toNum(
    product?.compareAtPrice ??
      product?.compare_at_price ??
      product?.mrp ??
      product?.regular_price ??
      product?.originalPrice ??
      product?.compare_price
  );
  const variants = Array.isArray(product?.variants)
    ? product.variants
        .map((v) => toNum(v?.compareAtPrice ?? v?.compare_at_price ?? v?.mrp))
        .filter(Boolean)
    : [];
  return base || (variants.length ? Math.max(...variants) : 0);
};

function ProductCardSkeleton() {
  return (
    <div className="select-none">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <div className="absolute inset-0 shimmer" />
      </div>
        <div className="space-y-2 pt-3">
        <div className="relative h-3 w-4/5 overflow-hidden bg-neutral-100">
          <div className="absolute inset-0 shimmer" />
        </div>
        <div className="relative h-3.5 w-2/5 overflow-hidden bg-neutral-100">
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({
  product,
  loading = false,
  disableRecentlyViewed = false,
  hideWishlistIcon = false,
}) {
  const { addToWishlist, removeFromWishlist, isInWishlist, initialize } =
    useWishlistStore();
  const addProduct = useRecentlyViewedStore((s) => s.addProduct);
  const trackProductView = useAnalyticsStore((s) => s.trackProductView);

  useEffect(() => {
    initialize?.();
  }, [initialize]);

  useEffect(() => {
    if (product && !disableRecentlyViewed) addProduct?.(product);
  }, [product, disableRecentlyViewed, addProduct]);

  const model = useMemo(() => {
    if (!product) return null;

    const productName = product.title || product.name || "Product";
    const productCode = String(
      product.productCode || product.raw?.productCode || ""
    ).trim();
    const id = product._id || product.id || product.productId;
    const image = firstImage(product);
    const price = bestPrice(product);
    const compareAt = comparePrice(product);
    const link = `/category/${categorySlug(product)}/${slugify(
      product.slug || productName
    )}/${encodeURIComponent(productCode)}`;

    const hover = hoverImage(product);

    return {
      id,
      productName,
      productCode,
      image,
      hover: hover && hover !== image ? hover : "",
      price,
      compareAt,
      link,
    };
  }, [product]);

  if (loading || !model) return <ProductCardSkeleton />;
  if (!model.id || !model.productCode || !model.image || !model.price) return null;

  const wishlisted = isInWishlist?.(model.id);
  const showCompare = model.compareAt > model.price;
  const discount = showCompare
    ? Math.round(((model.compareAt - model.price) / model.compareAt) * 100)
    : 0;
  const isBestSeller = !!(product?.isBestSeller ?? product?.raw?.isBestSeller);
  const isTrending = !isBestSeller && !!(product?.isTrending ?? product?.raw?.isTrending);

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    wishlisted ? removeFromWishlist(model.id) : addToWishlist(product);
  };

  return (
    <Link
      href={model.link}
      onClick={() => trackProductView?.(model.id)}
      className="group block h-full bg-white"
    >
      <div className="relative isolate aspect-[4/5] overflow-hidden bg-white">
        {(isBestSeller || isTrending) && (
          <div className="absolute left-2 top-2 z-20">
            {isBestSeller && <Badge label="Bestseller" />}
            {isTrending && <Badge label="Trending" />}
          </div>
        )}

        <Image
          src={model.image}
          alt={model.productName}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className="z-0 object-contain p-1 transition duration-300 md:group-hover:scale-[1.01]"
        />

        {model.hover && (
          <div className="pointer-events-none absolute inset-0 z-10 hidden bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
            <Image
              src={model.hover}
              alt={`${model.productName} alternate view`}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              className="object-contain p-1"
            />
          </div>
        )}

        {!hideWishlistIcon && (
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={wishlisted ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
            title={wishlisted ? "WISHLISTED" : "ADD TO WISHLIST"}
            className="group/wishlist absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center text-black transition duration-200 active:scale-95 md:right-3 md:top-3"
          >
            <Heart
              strokeWidth={2.15}
              className={`h-[18px] w-[18px] drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)] transition duration-200 ${
                wishlisted
                  ? "fill-black text-black"
                  : "fill-white/70 text-black/75 group-hover/wishlist:fill-black group-hover/wishlist:text-black"
              }`}
            />
          </button>
        )}
      </div>

      <div className="border-b border-neutral-200 pb-2.5 pt-2.5">
        <div>
          <h3
            title={model.productName}
            className="line-clamp-2 min-h-[30px] text-[10.5px] font-black uppercase leading-[15px] tracking-[0.06em] text-black md:min-h-[32px] md:text-[11px] md:leading-4"
          >
            {model.productName}
          </h3>
        </div>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="text-[11.5px] font-black uppercase tracking-[0.06em] text-black md:text-xs">
            RS. {money(model.price)}
          </span>
          {showCompare && (
            <span className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-black/35 line-through md:text-[10px]">
              RS. {money(model.compareAt)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[9px] font-black uppercase tracking-[0.08em] text-black/45">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Badge({ label }) {
  return (
    <span className="inline-flex bg-white/85 px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-black backdrop-blur">
      {label.toUpperCase()}
    </span>
  );
}
