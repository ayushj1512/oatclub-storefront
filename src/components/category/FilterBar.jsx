"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";

const BRAND = {
  burgundy: "#800020",
};

export default function FilterBar({
  sort,
  setSort,
  sortTabs,
  filterOpen,
  setFilterOpen,
  attributes,
  selectedAttrs,
  toggleAttr,
  resetFilters,
}) {
  return (
    <>
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4 w-full">

        {/* DESKTOP SORT TAGS */}
        <div className="hidden md:flex gap-2 text-sm">
          {sortTabs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 whitespace-nowrap rounded-md border transition-all ${
                sort === s.id
                  ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                  : "bg-white text-black border-gray-300 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* MOBILE SORT DROPDOWN */}
        <div className="md:hidden w-1/2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-md text-xs bg-white text-black focus:outline-none focus:ring-1 focus:ring-[#800020]"
          >
            {sortTabs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-black text-white border border-black rounded-md text-xs md:text-sm hover:bg-black/90 transition-all"
        >
          <Filter size={16} className="text-white" />
          Filters
        </button>
      </div>

      {/* FILTER DRAWER */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        attributes={attributes}
        selectedAttrs={selectedAttrs}
        toggleAttr={toggleAttr}
        resetFilters={resetFilters}
      />
    </>
  );
}

/* -------------------------------------------------------------
   FILTER DRAWER
-------------------------------------------------------------- */
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {/* DRAWER */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-72 max-w-[85%] h-full bg-white shadow-2xl p-5 flex flex-col rounded-r-xl"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-black tracking-tight">Filters</h2>

              <button
                className="p-1.5 rounded-full hover:bg-gray-200 transition"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>

            <FilterContent
              attributes={attributes}
              selectedAttrs={selectedAttrs}
              toggleAttr={toggleAttr}
              resetFilters={resetFilters}
            />

            {/* APPLY BUTTON */}
            <button
              onClick={onClose}
              className="mt-5 w-full py-2 rounded-md text-white text-sm font-medium shadow-md transition"
              style={{ backgroundColor: BRAND.burgundy }}
            >
              Apply Filters
            </button>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------
   FILTER CONTENT
-------------------------------------------------------------- */
function FilterContent({ attributes, selectedAttrs, toggleAttr, resetFilters }) {
  const active = Object.values(selectedAttrs).some((arr) => arr.length > 0);

  return (
    <div className="space-y-6 overflow-y-auto text-xs pr-1">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-black text-sm">
          Filters{" "}
          {active && (
            <span className="text-[10px] text-[#800020] font-medium">(active)</span>
          )}
        </span>

        <button
          className="text-[11px] text-gray-700 hover:text-black transition"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {Object.keys(attributes).map((attr) => (
        <AttrGroup
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

/* -------------------------------------------------------------
   COLLAPSIBLE ATTRIBUTE GROUP
-------------------------------------------------------------- */
function AttrGroup({ title, options, selected, toggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-300 pb-3">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-1"
      >
        <span className="text-xs md:text-sm font-medium text-black capitalize">
          {title}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* OPTIONS */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mt-2 flex flex-wrap gap-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.23 }}
          >
            {options.map((op) => {
              const active = selected.includes(op);

              return (
                <button
                  key={op}
                  onClick={() => toggle(op)}
                  className={`px-3 py-1 rounded-md border text-xs md:text-sm transition-all ${
                    active
                      ? "bg-[#800020] text-white border-[#800020]"
                      : "bg-white text-black border-gray-400 hover:bg-gray-100"
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
