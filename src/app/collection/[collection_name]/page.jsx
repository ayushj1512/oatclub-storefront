"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import { useCollectionStore } from "@/store/collectionStore";

const PAGE_SIZE = 20;

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

const shortText = (v = "", max = 150) => {
  const s = String(v || "").trim();
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
};

function SortSelect({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-[190px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-full border border-black/10 bg-white px-4 pr-9 text-xs font-semibold text-black outline-none transition hover:border-black/25 focus:border-black/40"
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/50" />
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
  }, [
    ready,
    isLoading,
    hasMore,
    fetchProductsByCollection,
    collection,
    page,
    sort,
  ]);

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
    <main className="min-h-screen bg-white">
      <section className="px-3 pt-4 md:px-8 md:pt-6">
        <div className="rounded-[28px] border border-black/10 bg-white px-4 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.04)] md:px-8 md:py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-black/40" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/40">
                  Oatclub Collection
                </span>
              </div>

              <h1 className="text-2xl font-extrabold uppercase leading-tight text-black md:text-4xl">
                {title}
              </h1>

              {!!description && !collectionLoading && (
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-black/55 md:text-sm">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 md:block">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/35 md:hidden">
                Sort
              </p>
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white p-3 text-xs text-black">
            {error}
          </div>
        )}
      </section>

      <section className="px-3 pb-7 pt-5 md:px-8 md:pt-7">
        <ProductGrid
          key={`${collection}-${sort}`}
          products={products}
          loading={isLoading && page === 1}
        />

        {isLoading && page > 1 && (
          <div className="py-5 text-center text-xs font-medium uppercase tracking-[0.22em] text-black/35">
            Loading more...
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />
      </section>
    </main>
  );
}
