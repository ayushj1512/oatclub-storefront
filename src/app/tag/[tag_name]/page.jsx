"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";
import { AnimatePresence, motion } from "framer-motion";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "priceLowHigh" },
  { label: "Price: High → Low", value: "priceHighLow" },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const toNum = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

const buildFacets = (products = []) => {
  const prices = [];
  const tags = new Set();
  for (const p of products || []) {
    const pr = Number(p?.price);
    if (Number.isFinite(pr)) prices.push(pr);
    for (const t of Array.isArray(p?.tags) ? p.tags : []) {
      const s = String(t || "").trim().toLowerCase();
      if (s) tags.add(s);
    }
  }
  prices.sort((a, b) => a - b);
  return {
    priceMin: prices.length ? prices[0] : 0,
    priceMax: prices.length ? prices[prices.length - 1] : 0,
    tags: Array.from(tags).sort(),
  };
};

export default function TagPage() {
  const { tag_name } = useParams();
  const tagName = String(tag_name || "");

  const {
    allProducts,
    isLoading,
    error,
    fetchProductsByTag,
    loadMore,
    hasMore,
    clearError,
  } = useProductStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [selectedTags, setSelectedTags] = useState(() => new Set());

  const facets = useMemo(() => buildFacets(allProducts), [allProducts]);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  useEffect(() => {
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  /** ✅ SINGLE SOURCE FETCH */
  useEffect(() => {
    if (!tagName) return;

    clearError?.();
    setDrawerOpen(false);
    setOnlyInStock(true);
    setSelectedTags(new Set());

    fetchProductsByTag({
      tag: tagName,
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  }, [tagName, sort]);

  const list = useMemo(() => {
    let arr = [...allProducts];

    if (onlyInStock) {
      arr = arr.filter((p) => p?.isInStock !== false && Number(p?.stock ?? 0) > 0);
    }

    const lo = priceMin ?? facets.priceMin;
    const hi = priceMax ?? facets.priceMax;
    const minV = Math.min(lo, hi);
    const maxV = Math.max(lo, hi);

    arr = arr.filter((p) => {
      const pr = Number(p?.price);
      return Number.isFinite(pr) && pr >= minV && pr <= maxV;
    });

    if (selectedTags.size) {
      arr = arr.filter((p) => {
        const tags = (Array.isArray(p?.tags) ? p.tags : []).map((t) =>
          String(t).toLowerCase()
        );
        for (const need of selectedTags) if (!tags.includes(need)) return false;
        return true;
      });
    }

    return arr;
  }, [
    allProducts,
    onlyInStock,
    priceMin,
    priceMax,
    facets.priceMin,
    facets.priceMax,
    selectedTags,
  ]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (!onlyInStock) n++;
    if (selectedTags.size) n++;
    if (priceMin !== facets.priceMin || priceMax !== facets.priceMax) n++;
    return n;
  }, [onlyInStock, selectedTags, priceMin, priceMax, facets.priceMin, facets.priceMax]);

  const resetFilters = useCallback(() => {
    setOnlyInStock(true);
    setSelectedTags(new Set());
    setPriceMin(facets.priceMin);
    setPriceMax(facets.priceMax);
  }, [facets.priceMin, facets.priceMax]);

  const toggleTag = (tag) => {
    const t = String(tag || "").trim().toLowerCase();
    if (!t) return;
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  /** Infinite scroll */
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (isLoading) return;
        if (!hasMore()) return;
        loadMore();
      },
      { rootMargin: "900px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [isLoading, hasMore, loadMore]);

  const showInitialLoading = isLoading && allProducts.length === 0;

  const retry = () => {
    clearError?.();
    fetchProductsByTag({
      tag: tagName,
      isActive: true,
      page: 1,
      limit: PAGE_SIZE,
      sort,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* UI BELOW IS UNCHANGED */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Tag: <span className="capitalize">{tagName}</span>
        </h1>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold">Error</div>
            <div className="text-sm mt-1">{error}</div>
            <button onClick={retry} className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">
              Retry
            </button>
          </div>
        )}

        <div className="mt-6">
          <ProductGrid products={list} loading={showInitialLoading} />
        </div>

        <div ref={sentinelRef} className="h-1 w-full" />
      </div>
    </div>
  );
}
