"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore"; // ✅ adjust path if needed

/**
 * LeopardFeatureCollection.jsx
 * ✅ uses NEXT_PUBLIC_API_URL
 * ✅ fetches collection slug: leopard-energy
 * ✅ then fetches products in ONE call via store.fetchProductsByCodes()
 * ✅ short, neat, clean
 */

const BASE = String(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const COLLECTION_SLUG = "leopard-energy";

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function LeopardFeatureCollection() {
  const scrollRef = useRef(null);

  const fetchProductsByCodes = useProductStore((s) => s.fetchProductsByCodes);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]); // raw-ish product docs

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BASE}/api/collections`, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch collections (${res.status})`);

        const all = await res.json();
        const picked =
          (Array.isArray(all) && all.find((c) => c?.slug === COLLECTION_SLUG)) ||
          (Array.isArray(all) &&
            all.find((c) => String(c?.name || "").toLowerCase().includes("leopard"))) ||
          null;

        setCollection(picked);

        const list = Array.isArray(picked?.products) ? picked.products : [];
        if (!list.length) return setItems([]);

        // ✅ if already populated products, use directly
        const populated = list.some(
          (p) => p && (p?.title || p?.price || (Array.isArray(p?.images) && p.images.length))
        );
        if (populated) {
          return setItems(
            list
              .map((p) => ({ ...p, productCode: String(p?.productCode || p?.code || "").trim() }))
              .filter((p) => p?.productCode)
          );
        }

        // ✅ otherwise: fetch all by productCode (single request)
        const codes = Array.from(
          new Set(
            list
              .map((p) => String(p?.productCode || p?.code || "").trim())
              .filter(Boolean)
          )
        );

        const fetched = await fetchProductsByCodes(codes, { mergeIntoAllProducts: false });
        // store returns normalized objects -> keep raw for mapping below
        setItems((Array.isArray(fetched) ? fetched : []).map((p) => p?.raw || p));
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
  }, [fetchProductsByCodes]);

  const products = useMemo(() => {
    return (Array.isArray(items) ? items : [])
      .map((p) => {
        const image =
          (Array.isArray(p?.images) && p.images[0]) || p?.thumbnail || "/placeholder.png";
        const code = String(p?.productCode || p?.code || "").trim();

        return {
          id: p?._id || p?.id || code,
          productId: p?._id || p?.id,
          productCode: code,
          name: p?.title || p?.name || "Untitled",
          title: p?.title || p?.name || "Untitled",
          price: Number(p?.price || 0),
          compareAtPrice: p?.compareAtPrice ?? p?.compare_at_price ?? null,
          thumbnail: p?.thumbnail || image,
          images: Array.isArray(p?.images) ? p.images : [image],
          slug: p?.slug || slugify(p?.title || p?.name || code),
          category: "collection",
          currency: "INR",
          raw: p,
        };
      })
      .filter((x) => x.productCode);
  }, [items]);

  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  if (!loading && !collection) return null;
  if (!showShimmer && !products.length) return null;

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
      className={`absolute ${dir === "left" ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition`}
      aria-label={`Scroll ${dir}`}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );

  return (
    <motion.section
      className={`pt-2 ${showShimmer ? "px-4" : ""} bg-white`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Header />
      {error ? <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p> : null}

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
