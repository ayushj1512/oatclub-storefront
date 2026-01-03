"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useSizeChartStore } from "@/store/sizeChartStore";

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="py-3 border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex justify-between items-center w-full text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-black">
          {title}
        </span>
        {open ? (
          <Minus className="h-5 w-5 text-black" />
        ) : (
          <Plus className="h-5 w-5 text-black" />
        )}
      </button>

      <div
        className={`transition-all overflow-hidden duration-300 ${
          open ? "max-h-[900px] mt-3" : "max-h-0"
        }`}
      >
        {open ? children : null}
      </div>
    </div>
  );
}

export default function SizeGuideAccordion({
  categoryId,       // category _id
  categorySlug,     // optional: category slug if you have it
}) {
  const { items, fetchAll, loading } = useSizeChartStore();

  useEffect(() => {
    // ✅ Make sure store has charts
    if (!items || items.length === 0) fetchAll();
  }, [items?.length, fetchAll]);

  /* =========================================================
     Pick the correct chart from array
  ========================================================= */
  const activeChart = useMemo(() => {
    const list = Array.isArray(items) ? items : [];

    if (list.length === 0) return null;

    // ✅ 1) Exact match by categoryId
    if (categoryId) {
      const exact = list.find((chart) =>
        (chart?.categories || []).some(
          (c) => String(c?._id || c) === String(categoryId)
        )
      );
      if (exact) return exact;
    }

    // ✅ 2) Match by slug (optional)
    if (categorySlug) {
      const bySlug = list.find((chart) =>
        (chart?.categories || []).some(
          (c) => String(c?.slug || "").toLowerCase() === String(categorySlug).toLowerCase()
        )
      );
      if (bySlug) return bySlug;
    }

    // ✅ 3) Fallback: General chart (All Clothing)
    const general = list.find((chart) =>
      (chart?.title || "").toLowerCase().includes("general")
    );
    return general || null;
  }, [items, categoryId, categorySlug]);

  return (
    <Accordion title="Size Guide">
      <div className="text-gray-700 text-sm leading-relaxed space-y-4">
        {/* ✅ How to Measure */}
        <div className="space-y-2">
          <p className="font-medium text-black">How to Measure</p>
          <ul className="space-y-1">
            <li>
              • <strong>Bust:</strong> Measure around the fullest part of your
              chest.
            </li>
            <li>
              • <strong>Waist:</strong> Measure around the narrowest part of
              your waist.
            </li>
            <li>
              • <strong>Hips:</strong> Measure around the widest part of your
              hips.
            </li>
            <li>
              • <strong>Length:</strong> Measure from shoulder to hem.
            </li>
          </ul>
        </div>

        {/* ✅ Size Chart Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
           

            {activeChart?.unit && (
              <span className="text-xs text-gray-500 uppercase">
                {activeChart.unit}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-xs text-gray-400">Loading size chart...</p>
          )}

          {/* No Chart */}
          {!loading && !activeChart && (
            <p className="text-xs text-gray-500">
              Size chart not available for this category.
            </p>
          )}

          {/* Table */}
          {!loading &&
            activeChart?.headers?.length > 0 &&
            activeChart?.rows?.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      {activeChart.headers.map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 font-semibold whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {activeChart.rows.map((row, rIndex) => (
                      <tr
                        key={rIndex}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        {row.map((cell, cIndex) => (
                          <td
                            key={cIndex}
                            className="px-4 py-3 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* ✅ Optional Note */}
          {activeChart?.note && (
            <p className="text-xs text-gray-500 pt-2">{activeChart.note}</p>
          )}
        </div>
      </div>
    </Accordion>
  );
}
