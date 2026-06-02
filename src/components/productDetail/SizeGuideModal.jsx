"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useSizeChartStore } from "@/store/sizeChartStore";

/* ---------- helpers ---------- */
const norm = (s) => String(s || "").toLowerCase();
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]+/g, ""));
  return Number.isFinite(n) ? n : null;
};
const range = (s) => {
  const m = String(s ?? "").match(/([\d.]+)\s*(?:–|—|-)\s*([\d.]+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
const fmt = (x, d) => (d ? x.toFixed(d) : String(Math.round(x)));

const convert = (v, from, to) => {
  if (from === to) return v;
  const fx = (x) => (from === "cm" ? x / 2.54 : x * 2.54);
  const d = to === "inch" ? 1 : 0;

  const r = range(v);
  const n = num(v);
  if (r) return `${fmt(fx(r[0]), d)}–${fmt(fx(r[1]), d)}`;
  if (n != null) return fmt(fx(n), d);
  return v;
};

export default function SizeGuideModal({ open, onClose, categoryId, categorySlug }) {
  const { items, fetchAll, loading } = useSizeChartStore();
  const [unit, setUnit] = useState("inch"); // ✅ inches first

  // fetch once
  useEffect(() => {
    if (open && (!items || !items.length)) fetchAll?.();
  }, [open, items?.length, fetchAll]);

  // lock scroll + escape close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const chart = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return null;

    if (categoryId) {
      const hit = list.find((x) =>
        (x.categories || []).some((c) => String(c?._id || c) === String(categoryId))
      );
      if (hit) return hit;
    }

    if (categorySlug) {
      const hit = list.find((x) =>
        (x.categories || []).some((c) => typeof c !== "string" && norm(c.slug) === norm(categorySlug))
      );
      if (hit) return hit;
    }

    return list.find((x) => Array.isArray(x.categories) && x.categories.length === 0) || null;
  }, [items, categoryId, categorySlug]);

  // always start with inches when chart changes
  useEffect(() => {
    if (chart) setUnit("inch");
  }, [chart]);

  const display = useMemo(() => {
    if (!chart) return null;
    const from = chart.unit === "inch" ? "inch" : "cm";
    const headers = (chart.headers || []).map((h, i) =>
      i === 0 ? h : `${h} (${unit === "inch" ? "in" : "cm"})`
    );
    const rows = (chart.rows || []).map((r) =>
      r.slice(0, headers.length).map((c, i) => (i === 0 ? c : convert(c, from, unit)))
    );
    return { title: chart.title || "Size Chart", headers, rows };
  }, [chart, unit]);

  if (!open) return null;

 return (
  <div className="fixed inset-0 z-[100]">
    <button
      onClick={onClose}
      className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      aria-label="Close"
    />

    <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_80px_rgba(0,0,0,0.22)] sm:max-w-3xl sm:rounded-[32px]">
        {/* Header */}
        <div className="border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Oatclub Fit Guide
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-black">
                Size Guide
              </h2>

              <p className="mt-1 text-xs leading-5 text-black/45">
                Measurements are approximate. Pick the size closest to your body measurement.
              </p>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.04] text-black transition hover:bg-black hover:text-white active:scale-95"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="mt-5 inline-flex rounded-full bg-[#f5f5f5] p-1">
            <button
              onClick={() => setUnit("inch")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                unit === "inch"
                  ? "bg-black text-white shadow-sm"
                  : "text-black/50 hover:text-black"
              }`}
            >
              Inches
            </button>

            <button
              onClick={() => setUnit("cm")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                unit === "cm"
                  ? "bg-black text-white shadow-sm"
                  : "text-black/50 hover:text-black"
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[62vh] overflow-y-auto px-5 py-5 sm:px-6">
          {loading && (
            <div className="rounded-3xl bg-[#fafafa] p-5 text-sm font-medium text-black/45">
              Loading size chart…
            </div>
          )}

          {!loading && !display && (
            <div className="rounded-3xl bg-[#fafafa] p-5 text-sm font-medium text-black/50">
              Size chart not available for this product.
            </div>
          )}

          {!loading && display && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fafafa] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-black">
                    {display.title}
                  </p>
                  <p className="mt-0.5 text-xs text-black/40">
                    Unit: {unit === "inch" ? "inches" : "centimeters"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45 ring-1 ring-black/[0.06]">
                  Body Measurements
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      {display.headers.map((h, i) => (
                        <th
                          key={i}
                          className={`px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/45 ${
                            i === 0 ? "text-left" : "text-center"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {display.rows.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-black/[0.05] transition last:border-0 hover:bg-[#fafafa]"
                      >
                        {r.map((c, j) => (
                          <td
                            key={j}
                            className={`px-5 py-4 text-sm ${
                              j === 0
                                ? "text-left font-semibold text-black"
                                : "text-center font-medium text-black/60"
                            }`}
                          >
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-3xl bg-[#fafafa] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
              Fit Note
            </p>
            <p className="mt-1 text-sm leading-6 text-black/55">
              Between two sizes? Choose the larger size for a relaxed fit, or the smaller size for a closer fit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] bg-white px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-black/85 active:scale-[0.99] sm:w-auto sm:px-8"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
