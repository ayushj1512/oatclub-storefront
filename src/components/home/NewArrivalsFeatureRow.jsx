"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";

/**
 * NewArrivalsFeatureRow.jsx (DIRECT FETCH)
 * ✅ Same UI as BestsellerFeatureRow
 * ✅ Simple black header + minimal View All (like bestseller)
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const PAGE_ENDPOINT = "/api/products";

const slugify = (s = "") =>
  String(s)
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

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = String(x?.slug || "").trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};

const normalizeCard = (p) => {
  const code = String(p?.productCode || p?.code || "").trim();
  const imagesArr = Array.isArray(p?.images) ? p.images : [];
  const image = p?.thumbnail || p?.image || imagesArr[0] || "/placeholder.png";
  const id = p?._id || p?.id || p?.productId || code;

  return {
    id,
    productId: p?._id || p?.productId || p?.id,
    productCode: code,
    name: p?.title || p?.name || "Untitled",
    title: p?.title || p?.name || "Untitled",
    price: Number(p?.price || 0),
    compareAtPrice: p?.compareAtPrice ?? p?.compare_at_price ?? null,
    thumbnail: p?.thumbnail || image,
    images: imagesArr.length ? imagesArr : [image],
    slug: p?.slug || slugify(p?.title || p?.name || code),
    category: "new-arrivals",
    currency: p?.currency || "INR",
    raw: p?.raw || p,
  };
};

const extractProducts = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export default function NewArrivalsFeatureRow({
  title = "New Arrivals",
  limit = 12,
  showOnlyActive = true,
}) {
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

        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

        const qs = new URLSearchParams();
        qs.set("page", "1");
        qs.set("limit", String(limit));
        qs.set("sort", "newest");
        if (showOnlyActive) qs.set("isActive", "true");

        const res = await fetch(`${BACKEND}${PAGE_ENDPOINT}?${qs.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Failed to load new arrivals");

        setItems(extractProducts(data));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Something went wrong");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, showOnlyActive]);

  const products = useMemo(() => {
    const mapped = (Array.isArray(items) ? items : []).map(normalizeCard);
    return uniqBySlug(mapped).filter((x) => x.productCode);
  }, [items]);

  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  const ArrowBtn = ({ dir }) => (
    <button
      type="button"
      onClick={() => scrollRow(dir)}
      className={`absolute ${
        dir === "left" ? "left-2" : "right-2"
      } top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition`}
      aria-label={`Scroll ${dir}`}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );

  if (!showShimmer && !products.length) return null;

  return (
    <motion.section
      className={`bg-white ${showShimmer ? "px-4" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* ✅ SIMPLE HEADER + minimal View All (like bestseller) */}
      <div className="w-full bg-black text-center mb-6 relative">
        <h2 className="text-white py-3 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em]">
          {title}
        </h2>

        <button
          type="button"
          onClick={() => router.push("/new-arrivals")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs md:text-sm font-medium opacity-80 hover:opacity-100 transition"
        >
          View All →
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      ) : null}

      <div className="relative">
        {showArrows ? (
          <>
            <ArrowBtn dir="left" />
            <ArrowBtn dir="right" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        ) : null}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-1"
        >
          {showShimmer
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
                >
                  <ProductCard loading />
                </div>
              ))
            : products.map((p) => (
                <div
                  key={p.id}
                  className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </motion.section>
  );
}
