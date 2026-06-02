"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const PAGE_ENDPOINT = "/api/products";

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

function MarqueeTitle() {
  const lines = [
    "NEW ARRIVALS ARE HOT",
    "OWN ALL TRENDS",
    "HOT DROPS JUST LANDED",
    "FRESH FITS DAILY",
  ];

  return (
    <div className="overflow-hidden bg-black py-3 text-white">
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[...lines, ...lines, ...lines, ...lines].map((text, i) => (
          <div
            key={i}
            className="mx-4 flex shrink-0 items-center gap-2 text-sm font-black uppercase tracking-[0.16em] md:text-xl"
          >
            <span>{text}</span>
            <Flame className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          animation: oat-marquee 18s linear infinite;
        }

        @keyframes oat-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function ViewAllCard() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/new-arrivals")}
      className="group flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden bg-black p-4 text-center text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
    >
      <Flame className="mb-4 h-7 w-7 transition group-hover:scale-110" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
        Oatclub
      </p>

      <h3 className="mt-2 text-xl font-black uppercase leading-none tracking-tight md:text-2xl">
        View All
      </h3>

      <p className="mt-2 text-xs uppercase tracking-wide opacity-70">
        New Arrivals
      </p>

      <span className="mt-5 flex h-9 w-9 items-center justify-center rounded-full border border-current transition group-hover:translate-x-1">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

export default function NewArrivalsFeatureRow({
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

        const qs = new URLSearchParams({
          page: "1",
          limit: String(limit),
          sort: "newest",
        });

        if (showOnlyActive) qs.set("isActive", "true");

        const res = await fetch(`${BACKEND}${PAGE_ENDPOINT}?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await safeJson(res);
        if (!res.ok)
          throw new Error(data?.message || "Failed to load new arrivals");

        setItems(extractProducts(data));
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
  }, [limit, showOnlyActive]);

  const products = useMemo(
    () => uniqBySlug(items.map(normalizeCard)).filter((x) => x.productCode),
    [items]
  );

  const showShimmer = loading && !products.length;
  const showArrows = products.length > 2 || showShimmer;

  const scrollRow = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (!showShimmer && !products.length) return null;

  return (
    <motion.section
      className="bg-white pb-6 md:pb-10 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <MarqueeTitle />

      {error && <p className="my-3 text-center text-sm text-black">❌ {error}</p>}

      <div className="relative mt-4">
        {showArrows && (
          <>
            <button
              onClick={() => scrollRow("left")}
              className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-black transition hover:bg-black hover:text-white md:flex"
            >
              ←
            </button>

            <button
              onClick={() => scrollRow("right")}
              className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-black transition hover:bg-black hover:text-white md:flex"
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
            : (
              <>
                {products.map((p) => (
                  <div key={p.id} className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]">
                    <ProductCard product={p} />
                  </div>
                ))}

                <div className="w-[160px] shrink-0 sm:w-[200px] md:w-[240px]">
                  <ViewAllCard />
                </div>
              </>
            )}
        </div>
      </div>
    </motion.section>
  );
}