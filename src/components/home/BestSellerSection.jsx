"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";

/**
 * BestsellerFeatureRow.jsx (DIRECT FETCH)
 * ✅ Same UI as PolkaFeatureCollection
 * ✅ Fetches bestseller productIds then fetches products by ids
 * ✅ Supports both API shapes:
 *    - /api/bestseller/ids -> ["id1","id2"]
 *    - /api/bestseller     -> [{ _id, productId, ... }]
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// default endpoints (you can override via props)
const DEFAULT_IDS_ENDPOINTS = ["/api/bestseller/ids", "/api/bestseller"];
const PRODUCTS_BY_IDS_ENDPOINT = "/api/products/by-ids";

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
    category: "bestseller",
    currency: p?.currency || "INR",
    raw: p?.raw || p,
  };
};

const extractIds = (payload) => {
  // supports:
  // 1) ["id1","id2"]
  // 2) [{productId:"..."}, ...]
  // 3) { ids: [...] } (just in case)
  const raw = payload?.ids ?? payload;

  if (Array.isArray(raw)) {
    if (raw.length && typeof raw[0] === "string") return raw.map(String);
    return raw
      .map((x) => x?.productId || x?._id || x?.id)
      .filter(Boolean)
      .map(String);
  }

  return [];
};

async function fetchFirstOkJson(base, paths, signal) {
  let lastErr = null;
  for (const p of paths) {
    try {
      const res = await fetch(`${base}${p}`, { cache: "no-store", signal });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || `Request failed: ${p}`);
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to load bestseller ids");
}

export default function BestsellerFeatureRow({
  title = "BESTSELLERS",
  limit = 12,
  idsEndpoints = DEFAULT_IDS_ENDPOINTS, // try in order
}) {
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]); // product docs

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!BACKEND) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

        // 1) fetch bestseller ids (supports multiple endpoint shapes)
        const idsPayload = await fetchFirstOkJson(
          BACKEND,
          idsEndpoints,
          controller.signal
        );
        const ids = extractIds(idsPayload);

        if (!ids.length) {
          setItems([]);
          return;
        }

        // 2) fetch products by ids
        const res = await fetch(`${BACKEND}${PRODUCTS_BY_IDS_ENDPOINT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({ ids: ids.slice(0, limit) }),
        });

        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Failed to load products");

        setItems(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Something went wrong");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, idsEndpoints]);

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

const Header = () => (
  <div className="w-full text-center mb-2">
    <div className="relative bg-[#0a0a0a] py-3">
      {/* subtle top/bottom hairlines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />

      {/* soft center glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,transparent_55%)]" />

      <div className="relative flex items-center justify-center">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm md:text-base font-semibold uppercase tracking-[0.28em] text-white/95">
          Bestsellers
        </span>
      </div>
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
