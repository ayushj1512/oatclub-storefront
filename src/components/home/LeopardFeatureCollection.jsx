"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";

/**
 * LeopardFeatureCollection.jsx (DIRECT FETCH)
 * ✅ Hits backend directly: /api/products/by-collection/:collection
 * ✅ No zustand store dependency (no overwrite issues)
 * ✅ Fast + optimized (small params + abort)
 * ✅ UI identical to your original Leopard section
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const COLLECTION_SLUG = "leopard-energy";

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
    category: "collection",
    currency: p?.currency || "INR",
    raw: p?.raw || p,
  };
};

export default function LeopardFeatureCollection() {
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]); // raw docs from backend

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

        const qs = new URLSearchParams();
        qs.set("page", "1");
        qs.set("limit", "12");
        qs.set("sort", "newest");
        qs.set("isActive", "true");
        // qs.set("mode", "card"); // ✅ enable if backend supports smaller payload

        const url = `${BACKEND}/api/products/by-collection/${encodeURIComponent(
          COLLECTION_SLUG
        )}?${qs.toString()}`;

        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Failed to load products");

        setCollection(data?.collection || null);
        setItems(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Something went wrong");
        setCollection(null);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

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

  // ✅ Original Leopard header kept same
  const Header = () => (
    <div className="w-full text-center mb-2 overflow-hidden">
      <div className="relative bg-black">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255,204,102,0.55) 0 14px, transparent 15px),
              radial-gradient(circle at 55% 55%, rgba(255,204,102,0.45) 0 12px, transparent 13px),
              radial-gradient(circle at 80% 25%, rgba(255,204,102,0.50) 0 10px, transparent 11px),
              radial-gradient(circle at 35% 80%, rgba(255,204,102,0.42) 0 16px, transparent 17px),
              radial-gradient(circle at 70% 78%, rgba(255,204,102,0.46) 0 14px, transparent 15px)
            `,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
        <h2 className="relative text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.28em] flex items-center justify-center gap-3">
          {collection?.name || "LEOPARD ENERGY"}
        </h2>
      </div>
    </div>
  );

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
      className={`pt-2 ${showShimmer ? "px-4" : ""} bg-white`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Header />
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
