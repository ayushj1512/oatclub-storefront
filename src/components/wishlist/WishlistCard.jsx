"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, HeartOff, ShoppingBag } from "lucide-react";

const validImage = (src) =>
  typeof src === "string" &&
  src.trim().length > 7 &&
  (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:"));

const toNum = (value) => {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const money = (value) => toNum(value).toLocaleString("en-IN");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const firstImage = (product) => {
  const image =
    product?.thumbnail ||
    product?.images?.[0]?.src ||
    product?.images?.[0] ||
    product?.image ||
    product?.featured_image ||
    product?.raw?.thumbnail ||
    "";
  return validImage(image) ? image : "/placeholder.png";
};

const categorySlug = (product) => {
  const list = Array.isArray(product?.categories)
    ? product.categories
    : Array.isArray(product?.raw?.categories)
      ? product.raw.categories
      : [];
  const banned = new Set(["all-clothing", "featured", "uncategorized"]);
  const picked =
    list.find((item) => !banned.has(slugify(item?.slug || item?.name || item))) ||
    list[0] ||
    product?.category ||
    "products";
  return slugify(picked?.slug || picked?.name || picked);
};

const bestPrice = (product) => {
  const base = toNum(product?.sale_price ?? product?.price ?? product?.currentPrice);
  const variants = Array.isArray(product?.variants)
    ? product.variants.map((variant) => toNum(variant?.price)).filter(Boolean)
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
        .map((variant) => toNum(variant?.compareAtPrice ?? variant?.compare_at_price ?? variant?.mrp))
        .filter(Boolean)
    : [];
  return base || (variants.length ? Math.max(...variants) : 0);
};

export default function WishlistCard({ product, onRemove, onMoveToBag }) {
  if (!product) return null;

  const id = product?._id || product?.id || product?.productId;
  const productCode = String(product?.productCode || product?.raw?.productCode || id || "").trim();
  const title = product?.title || product?.name || "OATCLUB PIECE";
  const image = firstImage(product);
  const price = bestPrice(product);
  const compareAt = comparePrice(product);
  const showCompare = compareAt > price;
  const discount = showCompare
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;
  const href = `/category/${categorySlug(product)}/${slugify(product?.slug || title)}/${encodeURIComponent(productCode)}`;
  const category = categorySlug(product).replace(/-/g, " ").toUpperCase();

  return (
    <article className="group relative flex h-full flex-col border border-neutral-200 bg-white transition duration-200 hover:border-black">
      <button
        type="button"
        onClick={() => onRemove?.(id)}
        className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center border border-neutral-200 bg-white/90 text-black backdrop-blur transition hover:border-black hover:bg-black hover:text-white"
        aria-label="Remove from wishlist"
        title="Remove from wishlist"
      >
        <HeartOff size={14} />
      </button>

      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden border-b border-neutral-200 bg-white">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-contain p-3 transition duration-300 group-hover:scale-[1.012]"
          />
          {discount > 0 ? (
            <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white">
              {discount}% OFF
            </span>
          ) : null}
          <span className="absolute bottom-2 left-2 border border-neutral-200 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-black/45">
            SAVED
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={href} className="block">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-black/35">
              {category}
            </p>
            <ArrowUpRight size={13} className="shrink-0 text-black/35 transition group-hover:text-black" />
          </div>

          <h3 className="line-clamp-2 min-h-[34px] text-[11px] font-black uppercase leading-[17px] tracking-[0.055em] text-black">
            {title}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 border-t border-neutral-100 pt-2">
          <span className="text-xs font-black uppercase tracking-[0.06em] text-black">
            RS. {money(price)}
          </span>
          {showCompare ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-black/35 line-through">
              RS. {money(compareAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-2 min-h-[16px]">
          {productCode ? (
            <p className="truncate text-[8px] font-black uppercase tracking-[0.16em] text-black/28">
              CODE {productCode}
            </p>
          ) : null}
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => onMoveToBag?.(product)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 bg-black px-3 text-[9px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
          >
            <ShoppingBag size={14} />
            MOVE TO BAG
          </button>
        </div>
      </div>
    </article>
  );
}
