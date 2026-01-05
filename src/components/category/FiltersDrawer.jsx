"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------------- helpers ---------------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* ============================================================
   PRICE RANGE SLIDER (same as your original)
============================================================ */
function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}) {
  const range = max - min || 1;

  const left = ((valueMin - min) / range) * 100;
  const right = ((valueMax - min) / range) * 100;

  const handleMin = (v) => {
    const val = clamp(Number(v), min, valueMax - 1);
    onChangeMin(val);
  };

  const handleMax = (v) => {
    const val = clamp(Number(v), valueMin + 1, max);
    onChangeMax(val);
  };

  return (
    <div className="mt-3">
      {/* Manual Boxes */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="number"
          value={valueMin}
          min={min}
          max={valueMax - 1}
          onChange={(e) => handleMin(e.target.value)}
          className="w-24 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 outline-none border border-zinc-200"
        />

        <input
          type="number"
          value={valueMax}
          min={valueMin + 1}
          max={max}
          onChange={(e) => handleMax(e.target.value)}
          className="w-24 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 text-right outline-none border border-zinc-200"
        />
      </div>

      {/* Slider */}
      <div className="relative mt-4 h-10">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-zinc-200" />

        {/* Filled Range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-blue-500"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
          }}
        />

        {/* Range Inputs */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => handleMin(e.target.value)}
          className="absolute w-full top-0 left-0 h-10 cursor-pointer bg-transparent"
          style={{ zIndex: valueMin > max - 100 ? 5 : 6 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => handleMax(e.target.value)}
          className="absolute w-full top-0 left-0 h-10 cursor-pointer bg-transparent"
          style={{ zIndex: 7 }}
        />

        {/* Knobs */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-blue-600 shadow-md"
          style={{ left: `calc(${left}% - 10px)` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-blue-600 shadow-md"
          style={{ left: `calc(${right}% - 10px)` }}
        />
      </div>

      <div className="mt-2 text-xs text-zinc-500">
        Range: ₹{valueMin} – ₹{valueMax}
      </div>
    </div>
  );
}

/* ============================================================
   FILTERS DRAWER COMPONENT ✅
============================================================ */
export default function FiltersDrawer({
  open,
  setOpen,

  drawerTop,
  drawerHeight,

  // facets
  facets,

  // draft filter states
  draftOnlyInStock,
  setDraftOnlyInStock,
  draftPriceMin,
  setDraftPriceMin,
  draftPriceMax,
  setDraftPriceMax,

  // actions
  applyFilters,
  resetFilters,
}) {
  // slider limits
  const sliderMin = facets?.priceMin ?? 0;
  const sliderMax = facets?.priceMax ?? 0;

  const safeDraftMin = draftPriceMin ?? sliderMin;
  const safeDraftMax = draftPriceMax ?? sliderMax;

  const changeMin = (v) => {
    const val = clamp(v, sliderMin, safeDraftMax - 1);
    setDraftPriceMin(val);
  };

  const changeMax = (v) => {
    const val = clamp(v, safeDraftMin + 1, sliderMax);
    setDraftPriceMax(val);
  };

  return (
    <>
      {/* BACKDROP */}
      <AnimatePresence>
        {open ? (
          <motion.button
            aria-label="Close filters"
            className="fixed left-0 right-0 bottom-0 z-40 bg-black/40"
            style={{ top: drawerTop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      {/* DRAWER */}
      <AnimatePresence>
        {open ? (
          <motion.aside
            className="fixed left-0 z-50 w-[320px] max-w-[85vw] bg-white shadow-2xl border-r border-zinc-200"
            style={{ top: drawerTop, height: drawerHeight }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-4 border-b border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-zinc-900">
                    Filters
                  </div>
                  <div className="text-xs text-zinc-500">
                    Choose what you want to see
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900"
                >
                  Close
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Availability */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-900">
                    Availability
                  </div>
                  <label className="mt-3 flex items-center gap-3 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={draftOnlyInStock}
                      onChange={(e) => setDraftOnlyInStock(e.target.checked)}
                    />
                    Show only available items
                  </label>
                </div>

                {/* Price Slider */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-900">
                    Filter by Price
                  </div>

                  <PriceRangeSlider
                    min={sliderMin}
                    max={sliderMax}
                    valueMin={safeDraftMin}
                    valueMax={safeDraftMax}
                    onChangeMin={changeMin}
                    onChangeMax={changeMax}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-zinc-200 flex items-center justify-between gap-3">
                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
