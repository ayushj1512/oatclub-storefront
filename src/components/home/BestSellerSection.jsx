"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const DEFAULT_IDS_ENDPOINTS = ["/api/bestseller/ids", "/api/bestseller"];
const PRODUCTS_BY_IDS_ENDPOINT = "/api/products/by-ids";

const slugify = (s = "") =>
  String(s).toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const uniqBySlug = (arr = []) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x?.slug || "").trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const normalizeCard = (p) => {
  const code = String(p?.productCode || p?.code || "").trim();
  const images = Array.isArray(p?.images) ? p.images : [];
  const image = p?.thumbnail || p?.image || images[0] || "/placeholder.png";

  return {
    id: p?._id || p?.id || p?.productId || code,
    productId: p?._id || p?.productId || p?.id,
    productCode: code,
    name: p?.title || p?.name || "Untitled",
    title: p?.title || p?.name || "Untitled",
    price: Number(p?.price || 0),
    compareAtPrice: p?.compareAtPrice ?? p?.compare_at_price ?? null,
    thumbnail: p?.thumbnail || image,
    images: images.length ? images : [image],
    slug: p?.slug || slugify(p?.title || p?.name || code),
    category: "bestseller",
    currency: p?.currency || "INR",
    raw: p?.raw || p,
  };
};

const extractIds = (payload) => {
  const raw = payload?.ids ?? payload;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((x) => (typeof x === "string" ? x : x?.productId || x?._id || x?.id))
    .filter(Boolean)
    .map(String);
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
  idsEndpoints = DEFAULT_IDS_ENDPOINTS,
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

        const idsPayload = await fetchFirstOkJson(BACKEND, idsEndpoints, controller.signal);
        const ids = extractIds(idsPayload);

        if (!ids.length) return setItems([]);

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
        if (e?.name !== "AbortError") {
          setError(e?.message || "Something went wrong");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, idsEndpoints]);

  const products = useMemo(
    () => uniqBySlug((items || []).map(normalizeCard)).filter((x) => x.productCode),
    [items]
  );

  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  if (!showShimmer && !products.length) return null;

  return (
    <motion.section
      className="bg-white pb-6 pt-3 md:pb-10 md:pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative mb-4 px-3 text-center md:mb-8">
        <h2 className="text-3xl font-bold leading-none tracking-tight text-black md:text-7xl">
          {title}
        </h2>

        <p className="mt-1 text-[11px] text-black/50 md:mt-2 md:text-sm">
          Loved by Oatclub girls
        </p>

        <button
          onClick={() => router.push("/bestseller")}
          className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-black/50 transition hover:text-black md:absolute md:right-16 md:top-3 md:mt-0 md:text-xs"
        >
          View All →
        </button>
      </div>

      {error && <p className="mb-3 text-center text-sm text-red-600">❌ {error}</p>}

      <div className="relative">
        {showArrows && (
          <>
            <button
              onClick={() => scrollRow("left")}
              className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-black hover:text-white md:flex"
            >
              ←
            </button>

            <button
              onClick={() => scrollRow("right")}
              className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-black hover:text-white md:flex"
            >
              →
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="no-scrollbar flex items-start gap-2 overflow-x-auto scroll-smooth px-1 pb-2 md:gap-3"
        >
          {showShimmer
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]">
                  <ProductCard loading />
                </div>
              ))
            : products.map((p) => (
                <div key={p.id} className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]">
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </motion.section>
  );
}