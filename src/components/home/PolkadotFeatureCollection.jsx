"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";

/**
 * PolkadotFeatureCollection.jsx
 * ✅ uses NEXT_PUBLIC_API_URL from .env
 * ✅ hits: `${NEXT_PUBLIC_API_URL}/api/collections`
 * ✅ picks slug: the-polka-edit
 * ✅ header has visible polka-dot background (no emoji)
 */

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PolkadotFeatureCollection() {
  const scrollRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const url = `${base.replace(/\/$/, "")}/api/collections`;

        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch collections (${res.status})`);
        }

        const data = await res.json();
        if (!alive) return;

        const picked =
          (Array.isArray(data) &&
            data.find((c) => c?.slug === "the-polka-edit")) ||
          (Array.isArray(data) &&
            data.find((c) =>
              String(c?.name || "").toLowerCase().includes("polka")
            )) ||
          null;

        setCollection(picked);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Something went wrong");
        setCollection(null);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const scrollRow = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const products = useMemo(() => {
    const list = Array.isArray(collection?.products) ? collection.products : [];

    return list.map((p) => {
      const image =
        (Array.isArray(p?.images) && p.images[0]) || "/placeholder.png";

      return {
        id: p?._id,
        productId: p?._id,
        name: p?.title || "Untitled",
        price: Number(p?.price || 0),
        originalPrice: null,
        image,
        slug: slugify(p?.title || p?._id),
        on_sale: false,
        category: "collection",
        currency: "INR",
        raw: p,
      };
    });
  }, [collection]);

  const showShimmer = isLoading && !products.length;
  const showArrows = (products?.length || 0) > 2 || showShimmer;

  // If not found + not loading, hide section
  if (!isLoading && !collection) return null;

  // ✅ Visible polka-dot header (no gradient hiding dots)
  const Header = () => (
    <div className="w-full text-center mb-2 overflow-hidden">
      <div
        className="relative"
        style={{
          backgroundColor: "#0a0a0a",
        }}
      >
        {/* Polka dots (layer 1) */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 1,
            backgroundImage: `
              radial-gradient(circle, rgba(255,255,255,0.18) 0 4px, transparent 5px)
            `,
            backgroundSize: "26px 26px",
            backgroundPosition: "0 0",
          }}
        />

        {/* Polka dots (layer 2) - offset to feel more "real" */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 1,
            backgroundImage: `
              radial-gradient(circle, rgba(255,255,255,0.10) 0 4px, transparent 5px)
            `,
            backgroundSize: "26px 26px",
            backgroundPosition: "13px 13px",
          }}
        />

        {/* Very light vignette only (doesn't kill dots) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15" />

        <h2 className="relative text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.28em]">
          {collection?.name || "THE POLKA EDIT"}
        </h2>
      </div>
    </div>
  );

  if (showShimmer) {
    return (
      <section className="pt-2 px-4 bg-white">
        <Header />

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory px-1"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
              >
                <ProductCard loading />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <motion.section
      className="pt-2 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Header />

      {error ? (
        <p className="text-sm text-red-600 text-center mb-3">❌ {error}</p>
      ) : null}

      <div className="relative">
        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>
        )}

        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>
        )}

        {showArrows && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar scroll-smooth px-1"
        >
          {products.map((p) => (
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
