"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { wcGet } from "@/lib/woocommerce";
import ProductGrid from "@/components/common/ProductGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryPage() {
  const { slug, id } = useParams();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("featured");

  // Filter drawer state (always used)
  const [filterOpen, setFilterOpen] = useState(false);

  // Attribute filter state
  const [selectedAttrs, setSelectedAttrs] = useState({});

  /** FETCH PRODUCTS **/
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await wcGet(`products?category=${id}&per_page=100`);
        setProducts(res);
        setFiltered(res);
      } catch {
        setProducts([]);
        setFiltered([]);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  /** EXTRACT ALL UNIQUE ATTRIBUTES **/
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

  /** FILTER LOGIC **/
  useEffect(() => {
    let list = [...products];

    Object.keys(selectedAttrs).forEach((attrName) => {
      const selectedValues = selectedAttrs[attrName];
      if (selectedValues.length === 0) return;

      list = list.filter((p) => {
        const att = p.attributes?.find((a) => a.name === attrName);
        if (!att) return false;
        return att.options.some((opt) => selectedValues.includes(opt));
      });
    });

    /** Sorting **/
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

  /** Toggle attribute (filtering) **/
  function toggleAttr(attr, value) {
    setSelectedAttrs((prev) => {
      const current = prev[attr] || [];
      if (current.includes(value)) {
        return { ...prev, [attr]: current.filter((v) => v !== value) };
      }

      return { ...prev, [attr]: [...current, value] };
    });
  }

  /** Reset filters */
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

  return (
    <section className="w-full py-10 px-6 md:px-10 bg-white min-h-[80vh]">
      {/* TITLE + FILTER BUTTON */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
          {cleanName}
        </h1>

        {/* Filter button visible everywhere */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-800 hover:bg-gray-50 shadow-sm"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* SORTING TAGS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {sortTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSort(tab.id)}
            className={`px-4 py-1.5 text-sm rounded-full border transition ${
              sort === tab.id
                ? "bg-[#800020] text-white border-[#800020]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">Loading products...</p>
      )}

      {!loading && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={sort + JSON.stringify(selectedAttrs)}
            initial={{ opacity: 0, y: 8 }}
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
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-600 mt-10">
          No products match your filters.
        </p>
      )}

      {/* FILTER DRAWER (ALWAYS USED) */}
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

/* ------------------------------------------------
       FILTER DRAWER (LEFT SLIDE PANEL)
------------------------------------------------- */
function FilterDrawer({
  open,
  onClose,
  attributes,
  selectedAttrs,
  toggleAttr,
  resetFilters,
}) {
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
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* DRAWER */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative w-72 max-w-[85%] h-full bg-white shadow-xl p-5 flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Filters */}
            <FilterSidebar
              attributes={attributes}
              selectedAttrs={selectedAttrs}
              toggleAttr={toggleAttr}
              resetFilters={resetFilters}
            />

            {/* Apply Button */}
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

/* ------------------------------------------------
       FILTER SIDEBAR CONTENT (INSIDE DRAWER)
------------------------------------------------- */
function FilterSidebar({
  attributes,
  selectedAttrs,
  toggleAttr,
  resetFilters,
}) {
  const active = Object.values(selectedAttrs).some(
    (arr) => arr.length > 0
  );

  return (
    <div className="space-y-6 overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">
          Filters{" "}
          {active && (
            <span className="text-[10px] text-[#800020]">(Active)</span>
          )}
        </span>
        <button
          onClick={resetFilters}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          Reset
        </button>
      </div>

      {/* ATTRIBUTE GROUPS */}
      {Object.keys(attributes).map((attrName) => (
        <CollapsibleAttrGroup
          key={attrName}
          title={attrName}
          options={attributes[attrName]}
          selected={selectedAttrs[attrName] || []}
          toggle={(v) => toggleAttr(attrName, v)}
        />
      ))}

      {!Object.keys(attributes).length && (
        <p className="text-xs text-gray-500">
          No attributes available for filtering.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------
       COLLAPSIBLE ATTRIBUTE GROUP COMPONENT
------------------------------------------------- */
function CollapsibleAttrGroup({ title, options, selected, toggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-3">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mt-3 flex flex-wrap gap-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {options.map((op) => {
              const active = selected.includes(op);
              return (
                <button
                  key={op}
                  onClick={() => toggle(op)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition ${
                    active
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {op}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
