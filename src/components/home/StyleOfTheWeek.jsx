"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

const toNum = (value) => {
  const next = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(next) ? next : 0;
};

const money = (value) => toNum(value).toLocaleString("en-IN");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getImage = (product) => {
  const image =
    product?.thumbnail ||
    product?.image ||
    product?.images?.[0]?.src ||
    product?.images?.[0] ||
    "/placeholder.png";
  return typeof image === "string" && image.trim() ? image : "/placeholder.png";
};

const categorySlug = (product) => {
  const list = Array.isArray(product?.categories) ? product.categories : [];
  const first = list[0];
  const picked =
    (typeof first === "object" ? first?.slug || first?.name : first) ||
    product?.category?.slug ||
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "") ||
    "products";
  return slugify(picked);
};

function normalize(product) {
  const title = product?.title || product?.name || "OATCLUB STYLE";
  const code = String(product?.productCode || product?.code || "").trim();
  return {
    id: product?._id || product?.id || product?.productId || code,
    title,
    code,
    image: getImage(product),
    price: toNum(product?.sale_price ?? product?.price),
    compareAt: toNum(product?.compareAtPrice ?? product?.compare_at_price ?? product?.mrp),
    link: `/category/${categorySlug(product)}/${slugify(product?.slug || title)}/${encodeURIComponent(code)}`,
  };
}

export default function StyleOfTheWeek() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        if (!BACKEND) return;
        const qs = new URLSearchParams({ page: "1", limit: "24", sort: "newest", isActive: "true" });
        const res = await fetch(`${BACKEND}/api/products?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        const products = Array.isArray(data?.products) ? data.products : [];
        const clean = products.map(normalize).filter((item) => item.code && item.image && item.price);
        if (clean.length) setProduct(clean[Math.floor(Math.random() * clean.length)]);
      } catch {}
    })();

    return () => controller.abort();
  }, []);

  const discount = useMemo(() => {
    if (!product?.compareAt || product.compareAt <= product.price) return 0;
    return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  }, [product]);

  if (!product) return null;

  return (
    <section className="bg-white px-3 py-4 text-black md:px-8 md:py-7">
      <div className="mx-auto max-w-md bg-neutral-50 p-2.5 md:max-w-[420px] md:p-3">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.24em] text-black/45 md:text-[9px] md:tracking-[0.3em]">
            <Sparkles className="h-3.5 w-3.5" />
            STYLE OF THE WEEK
          </p>
          {discount ? (
            <span className="bg-black px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white">
              {discount}% OFF
            </span>
          ) : null}
        </div>

        <Link href={product.link} className="group relative block aspect-[5/6] w-full overflow-hidden bg-white md:mx-auto md:h-[430px] md:aspect-auto md:max-w-[340px]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover transition duration-700 group-hover:scale-[1.025]"
          />
        </Link>

        <div className="bg-white px-3 py-3 text-center md:px-4 md:py-4">
          <h2 className="mx-auto max-w-md text-[15px] font-black uppercase leading-tight text-black md:text-2xl">
            {product.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[8.5px] font-bold uppercase leading-4 tracking-[0.08em] text-black/45 md:text-[9px]">
            ONE STANDOUT PIECE FROM THE CURRENT OATCLUB EDIT, PICKED TO BUILD THE WEEK AROUND.
          </p>

          <div className="mt-2.5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 md:gap-3">
            <span className="text-[12px] font-black uppercase tracking-[0.08em] text-black md:text-sm md:tracking-[0.1em]">
              RS. {money(product.price)}
            </span>
            {product.compareAt > product.price ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/35 line-through md:text-xs md:tracking-[0.1em]">
                RS. {money(product.compareAt)}
              </span>
            ) : null}
          </div>

          <Link
            href={product.link}
            className="mt-3 inline-flex items-center gap-2 border border-black px-4 py-2 text-[8.5px] font-black uppercase tracking-[0.18em] transition hover:bg-black hover:text-white md:text-[9px] md:tracking-[0.2em]"
          >
            VIEW
            <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
