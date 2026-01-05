"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function formatINR(n) {
  const x = Number(n || 0);
  return x.toLocaleString("en-IN");
}

/* ============================================================
   PREMIUM PRICE RANGE SLIDER (Tailwind version)
============================================================ */
function PriceRangeCard({ min, max, valueMin, valueMax, onMin, onMax }) {
  const range = max - min || 1;

  const left = ((valueMin - min) / range) * 100;
  const right = ((valueMax - min) / range) * 100;

  return (
    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      {/* Title */}
      <div className="text-lg font-bold text-zinc-900">
        Price <span className="font-medium">Range</span>
      </div>

      {/* Values */}
      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
        <div>₹{formatINR(valueMin)}</div>
        <div className="text-zinc-400">—</div>
        <div>₹{formatINR(valueMax)}</div>
      </div>

      {/* Current Range */}
      <div className="mt-2 text-xs text-zinc-500">
        Current Range:{" "}
        <span className="font-semibold text-zinc-800">
          ₹{formatINR(valueMax - valueMin)}
        </span>
      </div>

      {/* Labels */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
        <span>₹{formatINR(min)}</span>
        <span>₹{formatINR(max)}</span>
      </div>

      {/* Slider Area */}
      <div className="relative mt-3 h-10">
        {/* Base Track */}
        <div className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-zinc-300" />

        {/* Active Track */}
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-blue-600"
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
          onChange={(e) => onMin(e.target.value)}
          className="absolute left-0 top-0 h-10 w-full cursor-pointer bg-transparent appearance-none"
          style={{ zIndex: valueMin > max - 50 ? 5 : 6 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => onMax(e.target.value)}
          className="absolute left-0 top-0 h-10 w-full cursor-pointer bg-transparent appearance-none"
          style={{ zIndex: 7 }}
        />

        {/* Knobs */}
        <div
          className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 rounded-full border border-zinc-700 bg-white shadow-md"
          style={{ left: `calc(${left}% - 8px)` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 rounded-full border border-zinc-700 bg-white shadow-md"
          style={{ left: `calc(${right}% - 8px)` }}
        />
      </div>

      {/* Manual Inputs */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <input
          type="number"
          value={valueMin}
          min={min}
          max={valueMax - 1}
          onChange={(e) => onMin(e.target.value)}
          className="w-28 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-blue-500"
        />

        <input
          type="number"
          value={valueMax}
          min={valueMin + 1}
          max={max}
          onChange={(e) => onMax(e.target.value)}
          className="w-28 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-right text-sm font-semibold text-zinc-900 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

/* ============================================================
   FILTER DRAWER COMPONENT ✅
============================================================ */
export default function FiltersDrawer({
  open,
  setOpen,
  drawerTop,
  drawerHeight,
  facets,
  draftOnlyInStock,
  setDraftOnlyInStock,
  draftPriceMin,
  setDraftPriceMin,
  draftPriceMax,
  setDraftPriceMax,
  applyFilters,
  resetFilters,
}) {
  const min = facets?.priceMin ?? 0;
  const max = facets?.priceMax ?? 0;

  const safeMin = draftPriceMin ?? min;
  const safeMax = draftPriceMax ?? max;

  const onMin = (v) =>
    setDraftPriceMin(clamp(Number(v), min, safeMax - 1));

  const onMax = (v) =>
    setDraftPriceMax(clamp(Number(v), safeMin + 1, max));

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close filters"
            className="fixed left-0 right-0 bottom-0 z-40 bg-black/40"
            style={{ top: drawerTop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed left-0 z-50 w-[340px] max-w-[90vw] bg-white shadow-2xl border-r border-zinc-200"
            style={{ top: drawerTop, height: drawerHeight }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-4 border-b border-zinc-200 flex justify-between">
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
                {/* Stock */}
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

                {/* Price */}
                <PriceRangeCard
                  min={min}
                  max={max}
                  valueMin={safeMin}
                  valueMax={safeMax}
                  onMin={onMin}
                  onMax={onMax}
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-zinc-200 flex justify-between gap-3">
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
        )}
      </AnimatePresence>
    </>
  );
}
