"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import { useCollectionStore } from "@/store/collectionStore";
import { Sparkles, ChevronDown } from "lucide-react";

const PAGE_SIZE = 20;

/* ✅ Compact Peach Theme */
const PEACH = {
  pageBg: "bg-gradient-to-b from-[#FFF7F2] via-[#FFFDFB] to-[#F7FAFF]",
  heroBg:
    "bg-[radial-gradient(900px_350px_at_10%_0%,rgba(255,200,170,0.40),transparent_55%),radial-gradient(700px_320px_at_95%_15%,rgba(196,225,255,0.50),transparent_50%),linear-gradient(to_bottom,rgba(255,255,255,0.88),rgba(255,255,255,0.75))]",
  badge: "bg-[#FFE8DC] text-[#7A3E2B] border-[#FFD5C2]",
};

const clampText = (t = "", max = 180) => {
  const s = String(t || "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
};

const titleCase = (input = "") => {
  const s = String(input || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  if (!s) return "";
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

const prettyName = (slug = "") => titleCase(decodeURIComponent(String(slug || "")));

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
];

function SortSelect({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full appearance-none rounded-xl border border-black/10 bg-white/80 px-3 py-2 pr-9 text-xs font-semibold text-zinc-900 shadow-sm outline-none focus:border-black/20"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
    </div>
  );
}

export default function CollectionPage() {
  const params = useParams();
  const collection = params?.collection_name;
  const ready = Boolean(collection);

  const fallbackName = useMemo(() => prettyName(collection), [collection]);

  const fetchCollection = useCollectionStore((s) => s.fetchOne);
  const collectionCurrent = useCollectionStore((s) => s.current);
  const collectionLoading = useCollectionStore((s) => s.loading);

  const allProducts = useProductStore((s) => s.allProducts);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const fetchProductsByCollection = useProductStore((s) => s.fetchProductsByCollection);
  const hasMore = useProductStore((s) => s.hasMore);
  const page = useProductStore((s) => s.page);
  const lastParams = useProductStore((s) => s.lastParams);

  const [sort, setSort] = useState("default");
  const [displayProducts, setDisplayProducts] = useState([]);
  const [isInitialFetching, setIsInitialFetching] = useState(false);

  const lastFetchRef = useRef("");

  useEffect(() => {
    if (!ready) return;
    fetchCollection(collection);
  }, [ready, collection, fetchCollection]);

  useLayoutEffect(() => {
    if (!ready) return;
    setDisplayProducts([]);
    setIsInitialFetching(true);
  }, [ready, collection, sort]);

  useEffect(() => {
    if (!ready) return;

    const key = JSON.stringify({ collection, sort });
    if (lastFetchRef.current === key) return;
    lastFetchRef.current = key;

    fetchProductsByCollection(collection, {
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [ready, collection, sort, fetchProductsByCollection]);

  useEffect(() => {
    if (isLoading) return;
    setDisplayProducts(Array.isArray(allProducts) ? allProducts : []);
    setIsInitialFetching(false);
  }, [isLoading, allProducts]);

  const list = useMemo(() => {
    const arr = Array.isArray(displayProducts) ? [...displayProducts] : [];
    const getPrice = (p) => Number(p?.price) || 0;

    if (sort === "priceLowHigh") arr.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sort === "priceHighLow") arr.sort((a, b) => getPrice(b) - getPrice(a));

    return arr;
  }, [displayProducts, sort]);

  const loadingMoreRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!ready || isLoading || loadingMoreRef.current || !hasMore()) return;

    loadingMoreRef.current = true;

    fetchProductsByCollection(collection, {
      ...(lastParams || {}),
      page: (page || 1) + 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
    });

    setTimeout(() => (loadingMoreRef.current = false), 300);
  }, [ready, isLoading, hasMore, fetchProductsByCollection, collection, lastParams, page, sort]);

  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), {
      rootMargin: "800px 0px",
    });

    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  const titleToShow = useMemo(() => {
    const n = collectionCurrent?.name || fallbackName;
    return titleCase(n);
  }, [collectionCurrent?.name, fallbackName]);

  const descRaw = (collectionCurrent?.description || "").trim();
  const descToShow = descRaw ? clampText(descRaw, 180) : "";

  return (
    <div className={`min-h-screen ${PEACH.pageBg}`}>
      {/* ✅ Compact Header */}
      <div className="px-4 pt-4">
        <div className="mx-auto ">
          <div className={`rounded-2xl border border-white/60 ${PEACH.heroBg} shadow-sm`}>
            <div className="p-4 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${PEACH.badge}`}>
                      <Sparkles className="h-3 w-3" />
                      Collection
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
                    {titleToShow}
                  </h1>

                  {!!descToShow && !collectionLoading && (
                    <p className="mt-1 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      {descToShow}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-auto">
                  <SortSelect value={sort} onChange={(v) => setSort(v)} />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
              Something went wrong
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 pb-6 pt-5">
        <div className="mx-auto max-w-7xl">
          <ProductGrid key={`${collection}-${sort}`} products={list} loading={isInitialFetching} />
          <div ref={sentinelRef} className="h-1" />
        </div>
      </div>
    </div>
  );
}