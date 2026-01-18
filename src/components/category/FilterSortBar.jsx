"use client";

import React from "react";

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "priceLowHigh" },
  { label: "Price: High → Low", value: "priceHighLow" },
];

export default function FilterSortBar({
  activeFilterCount = 0,
  sort,
  setSort,
  onOpenFilters,
}) {
  return (
    <div className="flex items-center gap-2 pb-4">
      {/* ✅ Filters Button */}
      {/* <button
        onClick={onOpenFilters}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
      >
        Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
      </button> */}

      {/* ✅ Sort Dropdown */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Sort: {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
