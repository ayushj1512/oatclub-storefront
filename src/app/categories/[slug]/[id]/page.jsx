"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { wcGet } from "@/lib/woocommerce";
import ProductGrid from "@/components/common/ProductGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryPage() {
  const { slug, id } = useParams();

  // PRODUCT STATES
  const [products, setProducts] = useState([]);        // all loaded so far
  const [filtered, setFiltered] = useState([]);        // filtered view
  const [loading, setLoading] = useState(true);

  // PAGINATION + INFINITE LOAD STATES
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const PER_PAGE = 20;

  // SORTING
  const [sort, setSort] = useState("featured");

  // FILTER DRAWER
  const [filterOpen, setFilterOpen] = useState(false);

  // ATTRIBUTE FILTERS
  const [selectedAttrs, setSelectedAttrs] = useState({});

  /* ============================================================
      LOAD PRODUCTS - WITH PAGINATION
     ============================================================ */
  const loadProducts = useCallback(
    async (pageNum = 1) => {
      setLoading(true);

      try {
        const res = await wcGet(
          `products?category=${id}&per_page=${PER_PAGE}&page=${pageNum}`
        );

        if (Array.isArray(res)) {
          if (pageNum === 1) {
            setProducts(res);
          } else {
            setProducts((prev) => [...prev, ...res]);
          }

          if (res.length < PER_PAGE) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch {
        setHasMore(false);
      }

      setLoading(false);
    },
    [id]
  );

  // INITIAL LOAD & WHEN CATEGORY CHANGES
  useEffect(() => {
    setProducts([]);
    setFiltered([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1);
  }, [id, loadProducts]);

  /* ============================================================
      INFINITE SCROLL (IntersectionObserver)
     ============================================================ */
  useEffect(() => {
    if (!hasMore || loading) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadProducts(nextPage);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page, hasMore, loading, loadProducts]);

  /* ============================================================
      EXTRACT UNIQUE ATTRIBUTES
     ============================================================ */
  const attributes = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      p.attributes?.forEach((att) => {
        const key = att.name;
        if (!map[key]) map[key] = new Set();
        att.options?.forEach((op) => map[key].add(op));
      });
    });

    const result = {};
    Object.keys(map).forEach((k) => (result[k] = Array.from(map[k])));

    return result;
  }, [products]);

  /* ============================================================
      FILTER + SORT LOGIC
     ============================================================ */
  useEffect(() => {
    let list = [...products];

    // FILTER
    Object.keys(selectedAttrs).forEach((attrName) => {
      const selectedValues = selectedAttrs[attrName];
      if (!selectedValues.length) return;

      list = list.filter((p) => {
        const att = p.attributes?.find((a) => a.name === attrName);
        if (!att) return false;
        return att.options.some((opt) => selectedValues.includes(opt));
      });
    });

    // SORT
    if (sort === "low-high") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "high-low") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "newest") {
      list.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created)
      );
    }

    setFiltered(list);
  }, [products, selectedAttrs, sort]);

  /* ============================================================
      FILTER ACTIONS
     ============================================================ */
  function toggleAttr(attr, value) {
    setSelectedAttrs((prev) => {
      const current = prev[attr] || [];

      return current.includes(value)
        ? { ...prev, [attr]: current.filter((v) => v !== value) }
        : { ...prev, [attr]: [...current, value] };
    });
  }

  function resetFilters() {
    setSelectedAttrs({});
  }

  const sortTabs = [
    { id: "featured", label: "Featured" },
    { id: "low-high", label: "Price: Low → High" },
    { id: "high-low", label: "Price: High → Low" },
    { id: "newest", label: "Newest" },
  ];

  const cleanName = slug.replace(/-/g, " ");

  /* ============================================================
      RENDER PAGE
     ============================================================ */
  return (
    <section className="w-full py-10 px-6 md:px-10 min-h-[80vh] bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold capitalize text-gray-900">
          {cleanName}
        </h1>

        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-800 hover:bg-gray-50 shadow-sm"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* SORT TAGS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {sortTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSort(t.id)}
            className={`px-4 py-1.5 text-sm rounded-full border transition ${
              sort === t.id
                ? "bg-[#800020] text-white border-[#800020]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading && products.length === 0 && (
        <p className="text-center text-gray-500">Loading products...</p>
      )}

      <AnimatePresence mode="popLayout">
        <motion.div
          key={sort + JSON.stringify(selectedAttrs)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ProductGrid
            products={filtered}
            title={`Showing ${filtered.length} products`}
          />
        </motion.div>
      </AnimatePresence>

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-600 mt-10">
          No products match your filters.
        </p>
      )}

      {/* INFINITE LOADING TRIGGER */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center py-8 text-gray-500 text-sm"
        >
          Loading more...
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-6">
          You've reached the end 🎉
        </p>
      )}

      {/* FILTER DRAWER */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        attributes={attributes}
        selectedAttrs={selectedAttrs}
        toggleAttr={toggleAttr}
        resetFilters={resetFilters}
      />
    </section>
  );
}

/* ============================================================
      FILTER DRAWER COMPONENT
   ============================================================ */
function FilterDrawer({ open, onClose, attributes, selectedAttrs, toggleAttr, resetFilters }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />

          {/* DRAWER */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative w-72 max-w-[85%] h-full bg-white shadow-xl p-5 flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button className="p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <FilterSidebar
              attributes={attributes}
              selectedAttrs={selectedAttrs}
              toggleAttr={toggleAttr}
              resetFilters={resetFilters}
            />

            <button
              onClick={onClose}
              className="mt-auto w-full py-2 rounded-full bg-[#800020] text-white text-sm font-medium"
            >
              Apply Filters
            </button>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
      FILTER SIDEBAR CONTENT
   ============================================================ */
function FilterSidebar({ attributes, selectedAttrs, toggleAttr, resetFilters }) {
  const active = Object.values(selectedAttrs).some((arr) => arr.length > 0);

  return (
    <div className="space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          Filters{" "}
          {active && <span className="text-[10px] text-[#800020]">(Active)</span>}
        </span>

        <button
          onClick={resetFilters}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          Reset
        </button>
      </div>

      {Object.keys(attributes).length === 0 && (
        <p className="text-xs text-gray-500">No attributes available.</p>
      )}

      {Object.keys(attributes).map((attr) => (
        <CollapsibleAttrGroup
          key={attr}
          title={attr}
          options={attributes[attr]}
          selected={selectedAttrs[attr] || []}
          toggle={(v) => toggleAttr(attr, v)}
        />
      ))}
    </div>
  );
}

/* ============================================================
      COLLAPSIBLE FILTER GROUPS
   ============================================================ */
function CollapsibleAttrGroup({ title, options, selected, toggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-sm font-medium">{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mt-3 flex flex-wrap gap-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((v) => {
              const active = selected.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggle(v)}
                  className={`px-3 py-1.5 text-xs rounded-full border ${
                    active
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
