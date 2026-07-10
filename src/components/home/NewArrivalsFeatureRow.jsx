"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const PAGE_ENDPOINT = "/api/products";

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const extractProducts = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.products || payload?.data || payload?.items || [];
};

const uniqBySlug = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.slug || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeCard = (product) => {
  const code = String(product?.productCode || product?.code || "").trim();
  const images = Array.isArray(product?.images) ? product.images : [];
  const image = product?.thumbnail || product?.image || images[0] || "/placeholder.png";
  const title = product?.title || product?.name || "Untitled";

  return {
    _id: product?._id || product?.id || product?.productId || code,
    id: product?._id || product?.id || product?.productId || code,
    productId: product?._id || product?.productId || product?.id,

    productCode: code,
    name: title,
    title,

    price: Number(product?.price || 0),
    compareAtPrice:
      product?.compareAtPrice ??
      product?.compare_at_price ??
      product?.mrp ??
      null,

    thumbnail: product?.thumbnail || image,
    image: product?.thumbnail || image,
    images: images.length ? images : [image],

    slug: product?.slug || slugify(title || code),
    category: "new-arrivals",
    categories: product?.categories || product?.raw?.categories || ["new-arrivals"],

    currency: product?.currency || "INR",

    // ✅ MOST IMPORTANT FOR SIZE PICKER
    productType: product?.productType || product?.raw?.productType,
    attributes: product?.attributes || product?.raw?.attributes || [],
    variants: product?.variants || product?.raw?.variants || [],

    // ✅ helpful for cart/store
    stock: product?.stock,
    isInStock: product?.isInStock,
    availableStock: product?.availableStock,

    raw: product?.raw || product,
  };
};

function ViewAllCard() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/new-arrivals")}
      className="group flex aspect-[4/5] w-full flex-col items-center justify-center border border-black bg-black p-4 text-center text-white transition hover:bg-white hover:text-black"
    >
      <Sparkles className="mb-4 h-6 w-6 transition group-hover:scale-110" />
      <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-70">
        OATCLUB
      </p>
      <h3 className="mt-2 text-xl font-black uppercase leading-none md:text-2xl">
        VIEW ALL
      </h3>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] opacity-70">
        NEW ARRIVALS
      </p>
      <span className="mt-5 grid h-9 w-9 place-items-center border border-current transition group-hover:translate-x-1">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

export default function NewArrivalsFeatureRow({ limit = 12, showOnlyActive = true }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL MISSING");

        const qs = new URLSearchParams({ page: "1", limit: String(limit), sort: "newest" });
        if (showOnlyActive) qs.set("isActive", "true");

        const res = await fetch(`${BACKEND}${PAGE_ENDPOINT}?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "FAILED TO LOAD NEW ARRIVALS");
        setItems(extractProducts(data));
      } catch (event) {
        if (event?.name !== "AbortError") {
          setError(event?.message || "SOMETHING WENT WRONG");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, showOnlyActive]);

  const products = useMemo(
    () => uniqBySlug(items.map(normalizeCard)).filter((item) => item.productCode),
    [items]
  );
  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (!showShimmer && !products.length) return null;

  return (
   <motion.section
  className="bg-[#fafafa] py-8 md:py-12"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.25 }}
>
  <div className="mb-5 flex flex-col gap-4 border-b border-neutral-200 px-3 pb-4 md:flex-row md:items-end md:justify-between md:px-6">
    <div>
      <h2 className="text-2xl font-black uppercase leading-tight text-black md:text-3xl">
        NEW ARRIVALS
      </h2>
    </div>

    <button
      type="button"
      onClick={() => router.push("/new-arrivals")}
      className="inline-flex w-fit items-center gap-2 border border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
    >
      VIEW ALL
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  </div>

  {error ? (
    <p className="mb-4 px-3 text-center text-xs font-black uppercase tracking-[0.16em] text-black/50">
      {error}
    </p>
  ) : null}

  <div className="relative">
    {showArrows ? (
      <>
        <button
          type="button"
          onClick={() => scrollRow("left")}
          className="absolute left-3 top-[40%] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:flex"
          aria-label="SCROLL LEFT"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => scrollRow("right")}
          className="absolute right-3 top-[40%] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:flex"
          aria-label="SCROLL RIGHT"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </>
    ) : null}

    <div
      ref={scrollRef}
      className="no-scrollbar flex items-start gap-px overflow-x-auto scroll-smooth pb-2"
    >
      {showShimmer ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="w-[48vw] shrink-0 sm:w-[34vw] md:w-[25vw] lg:w-[20vw]"
          >
            <ProductCard loading />
          </div>
        ))
      ) : (
        <>
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[48vw] shrink-0 sm:w-[34vw] md:w-[25vw] lg:w-[20vw]"
            >
              <ProductCard product={product} />
            </div>
          ))}

          <div className="w-[48vw] shrink-0 sm:w-[34vw] md:w-[25vw] lg:w-[20vw]">
            <ViewAllCard />
          </div>
        </>
      )}
    </div>
  </div>
</motion.section>
  );
}
