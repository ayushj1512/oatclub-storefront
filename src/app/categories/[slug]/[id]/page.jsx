"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { wcGet } from "@/lib/woocommerce";
import ProductGrid from "@/components/common/ProductGrid";
import FilterBar from "@/components/category/FilterBar";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryPage() {
  const { slug, id } = useParams();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const PER_PAGE = 20;

  const [sort, setSort] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState({});

  /* LOAD PRODUCTS */
  const loadProducts = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const res = await wcGet(
          `products?category=${id}&per_page=${PER_PAGE}&page=${pageNum}`
        );

        if (Array.isArray(res)) {
          setProducts((prev) => (pageNum === 1 ? res : [...prev, ...res]));
          setHasMore(res.length === PER_PAGE);
        }
      } catch {
        setHasMore(false);
      }
      setLoading(false);
    },
    [id]
  );

  useEffect(() => {
    setProducts([]);
    setFiltered([]);
    setPage(1);
    loadProducts(1);
  }, [id, loadProducts]);

  /* INFINITE SCROLL */
  useEffect(() => {
    if (!hasMore || loading) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const next = page + 1;
          setPage(next);
          loadProducts(next);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page, hasMore, loading, loadProducts]);

  /* ATTRIBUTE EXTRACTION */
  const attributes = useMemo(() => {
    const map = {};
    products.forEach((p) =>
      p.attributes?.forEach((att) => {
        if (!map[att.name]) map[att.name] = new Set();
        att.options?.forEach((o) => map[att.name].add(o));
      })
    );
    const out = {};
    Object.keys(map).forEach((k) => (out[k] = [...map[k]]));
    return out;
  }, [products]);

  /* FILTER + SORT */
  useEffect(() => {
    let list = [...products];

    // FILTERING
    Object.keys(selectedAttrs).forEach((attr) => {
      const vals = selectedAttrs[attr];
      if (vals.length === 0) return;

      list = list.filter((p) => {
        const att = p.attributes?.find((a) => a.name === attr);
        return att?.options?.some((opt) => vals.includes(opt));
      });
    });

    // SORTING
    if (sort === "low-high") list.sort((a, b) => a.price - b.price);
    if (sort === "high-low") list.sort((a, b) => b.price - a.price);
    if (sort === "newest")
      list.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    setFiltered(list);
  }, [products, selectedAttrs, sort]);

  /* FILTER ACTIONS */
  const toggleAttr = (attr, value) => {
    setSelectedAttrs((prev) => {
      const curr = prev[attr] || [];
      return curr.includes(value)
        ? { ...prev, [attr]: curr.filter((v) => v !== value) }
        : { ...prev, [attr]: [...curr, value] };
    });
  };

  const resetFilters = () => setSelectedAttrs({});

  const sortTabs = [
    { id: "featured", label: "Featured" },
    { id: "low-high", label: "Price: Low → High" },
    { id: "high-low", label: "Price: High → Low" },
    { id: "newest", label: "Newest" },
  ];

  const cleanName = slug.replace(/-/g, " ");

  return (
    <section className="w-full py-6 px-3 md:px-10 bg-white">
      <h1 className="text-xl md:text-2xl font-semibold capitalize text-black mb-4">
        {cleanName}
      </h1>

      {/* FILTER BAR (REUSABLE COMPONENT) */}
      <FilterBar
        sort={sort}
        setSort={setSort}
        sortTabs={sortTabs}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        attributes={attributes}
        selectedAttrs={selectedAttrs}
        toggleAttr={toggleAttr}
        resetFilters={resetFilters}
      />

      {/* GRID ANIMATION */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={sort + JSON.stringify(selectedAttrs)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <ProductGrid products={filtered} />
        </motion.div>
      </AnimatePresence>

      {/* INFINITE SCROLL TRIGGER */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="text-center text-xs text-gray-600 py-4"
        >
          Loading more…
        </div>
      )}
    </section>
  );
}
