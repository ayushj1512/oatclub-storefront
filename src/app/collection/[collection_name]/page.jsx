"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import { useCollectionStore } from "@/store/collectionStore";
import { ChevronDown, Sparkles } from "lucide-react";

const PAGE_SIZE = 20;

const theme = {
  page: "bg-gradient-to-b from-[#FFF7F2] via-[#FFFDFB] to-[#F7FAFF]",
  hero:
    "bg-[radial-gradient(900px_350px_at_10%_0%,rgba(255,200,170,.4),transparent_55%),radial-gradient(700px_320px_at_95%_15%,rgba(196,225,255,.5),transparent_50%),linear-gradient(to_bottom,rgba(255,255,255,.88),rgba(255,255,255,.75))]",
  badge: "border-[#FFD5C2] bg-[#FFE8DC] text-[#7A3E2B]",
};

const sorts = [
  { value: "default", label: "Featured" },
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
];

const titleCase = (v = "") =>
  String(v)
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());

const shortText = (v = "", max = 180) => {
  const s = String(v || "").trim();
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
};

function SortSelect({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-black/10 bg-white/80 px-3 py-2 pr-9 text-xs font-semibold text-zinc-900 shadow-sm outline-none"
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
    </div>
  );
}

export default function CollectionPage() {
  const { collection_name } = useParams();

  const collection = String(collection_name || "").trim();
  const key = collection.toLowerCase();
  const ready = Boolean(collection);

  const [sort, setSort] = useState("default");
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const fetchCollection = useCollectionStore((s) => s.fetchOne);
  const collectionCurrent = useCollectionStore((s) => s.current);
  const collectionLoading = useCollectionStore((s) => s.loading);

  const {
    fetchProductsByCollection,
    productsByCollection = {},
    collectionPageBySlug = {},
    collectionHasMoreBySlug = {},
    collectionLoadingBySlug = {},
    error,
  } = useProductStore();

  const products = productsByCollection[key] || [];
  const page = collectionPageBySlug[key] || 1;
  const hasMore = collectionHasMoreBySlug[key] ?? true;
  const isLoading = collectionLoadingBySlug[key] || false;

  useEffect(() => {
    if (!ready) return;

    fetchCollection(collection);
    fetchProductsByCollection(collection, {
      page: 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
    });
  }, [ready, collection, sort, fetchCollection, fetchProductsByCollection]);

  const loadMore = useCallback(async () => {
    if (!ready || isLoading || !hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;

    await fetchProductsByCollection(collection, {
      page: page + 1,
      limit: PAGE_SIZE,
      sort,
      isActive: true,
    });

    loadingMoreRef.current = false;
  }, [ready, isLoading, hasMore, fetchProductsByCollection, collection, page, sort]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "800px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const title = titleCase(
    collectionCurrent?.name || decodeURIComponent(collection || "")
  );

  const description = shortText(collectionCurrent?.description || "");

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <div className="px-4 pt-4">
        <div className={`rounded-2xl border border-white/60 ${theme.hero} shadow-sm`}>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <span
                className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${theme.badge}`}
              >
                <Sparkles className="h-3 w-3" />
                Collection
              </span>

              <h1 className="text-lg font-bold leading-snug text-zinc-900 sm:text-xl">
                {title}
              </h1>

              {!!description && !collectionLoading && (
                <p className="mt-1 text-xs leading-relaxed text-zinc-700 sm:text-sm">
                  {description}
                </p>
              )}
            </div>

            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-5">
        <ProductGrid
          key={`${collection}-${sort}`}
          products={products}
          loading={isLoading && page === 1}
        />

        {isLoading && page > 1 && (
          <div className="py-5 text-center text-xs font-medium text-zinc-500">
            Loading more...
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}