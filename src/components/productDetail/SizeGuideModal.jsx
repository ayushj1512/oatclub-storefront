"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useSizeChartStore } from "@/store/sizeChartStore";

export default function SizeGuideModal({
  open,
  onClose,
  categoryId,
  categorySlug,
}) {
  const { items, fetchAll, loading } = useSizeChartStore();

  // ✅ Ensure charts are loaded
  useEffect(() => {
    if (open && (!items || items.length === 0)) fetchAll();
  }, [open, items?.length, fetchAll]);

  // ✅ Lock body scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ✅ ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
        (chart?.categories || []).some((c) => {
          if (typeof c === "string") return false;
          return (
            String(c?.slug || "").toLowerCase() ===
            String(categorySlug).toLowerCase()
          );
        })
      );
      if (bySlug) return bySlug;
    }

    // ✅ 3) Fallback: default/general chart
    const general =
      list.find((chart) => chart?.isDefault === true) ||
      list.find((chart) =>
        (chart?.title || "").toLowerCase().includes("general")
      );

    return general || null;
  }, [items, categoryId, categorySlug]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* ✅ Overlay (soft + blur) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close size guide modal"
      />

      {/* ✅ Modal Shell */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
        <div
          className="
            w-full
            md:max-w-3xl
            bg-white
            rounded-t-3xl md:rounded-3xl
            shadow-2xl
            overflow-hidden
            border border-black/5
          "
        >
          {/* ✅ Header (sticky) */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md">
            <div className="flex items-start justify-between px-4 md:px-6 py-4 border-b border-black/5">
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold text-black">
                  Size Guide
                </h2>

                <p className="text-xs text-gray-500">
                  Find your perfect fit — measurements are approximate.
                </p>

                {activeChart?.unit && (
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Unit: {activeChart.unit}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>

          {/* ✅ Content */}
          <div className="px-4 md:px-6 py-5 max-h-[70vh] md:max-h-[75vh] overflow-y-auto">
            <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
              {/* ✅ How to Measure (clean card) */}
              <div className="rounded-2xl bg-gray-50/70 border border-black/5 p-4">
                <p className="font-medium text-black mb-2">How to Measure</p>
                <ul className="space-y-1 text-[13px] text-gray-700">
                  <li>
                    <span className="font-semibold text-black">Bust:</span>{" "}
                    Measure around the fullest part of your chest.
                  </li>
                  <li>
                    <span className="font-semibold text-black">Waist:</span>{" "}
                    Measure around the narrowest part of your waist.
                  </li>
                  <li>
                    <span className="font-semibold text-black">Hips:</span>{" "}
                    Measure around the widest part of your hips.
                  </li>
                  <li>
                    <span className="font-semibold text-black">Length:</span>{" "}
                    Measure from shoulder to hem.
                  </li>
                </ul>
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-xs text-gray-400">
                  Loading size chart...
                </div>
              )}

              {/* No Chart */}
              {!loading && !activeChart && (
                <div className="rounded-2xl bg-gray-50 border border-black/5 p-4 text-xs text-gray-500">
                  Size chart not available for this category.
                </div>
              )}

              {/* ✅ Table */}
              {!loading &&
                activeChart?.headers?.length > 0 &&
                activeChart?.rows?.length > 0 && (
                  <div className="rounded-2xl border border-black/5 overflow-hidden bg-white">
                    {/* Table header label */}
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-black/5">
                      <p className="text-sm font-semibold text-black">
                        {activeChart?.title || "Size Chart"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tap & scroll horizontally if needed.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-white">
                          <tr className="border-b border-black/5">
                            {activeChart.headers.map((h, i) => (
                              <th
                                key={i}
                                className="px-4 py-3 font-semibold text-[13px] text-black whitespace-nowrap"
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
                              className="
                                border-b border-black/5 last:border-b-0
                                hover:bg-gray-50/60
                                transition
                              "
                            >
                              {row
                                .slice(0, activeChart.headers.length)
                                .map((cell, cIndex) => (
                                  <td
                                    key={cIndex}
                                    className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap"
                                  >
                                    {cell}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* ✅ Optional Note */}
              {activeChart?.note && (
                <div className="text-xs text-gray-500 leading-relaxed">
                  {activeChart.note}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Footer (sticky, minimal) */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-black/5 px-4 md:px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="
                w-full md:w-auto
                px-5 py-2.5
                rounded-xl
                bg-black text-white
                text-sm font-semibold
                hover:opacity-90
                active:scale-[0.99]
                transition
              "
            >
              Close
            </button>
          </div>

          {/* ✅ Safe area padding (mobile) */}
          <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>
    </div>
  );
}
