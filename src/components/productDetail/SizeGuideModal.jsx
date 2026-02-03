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
      <button onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Close" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-black/5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-black">Size Guide</h2>

                <div className="flex gap-1 border border-black/10 rounded-lg p-1">
                  <button
                    onClick={() => setUnit("inch")}
                    className={unit === "inch" ? "px-3 py-1 text-xs font-semibold rounded-md bg-black text-white" : "px-3 py-1 text-xs font-semibold rounded-md text-gray-600 hover:bg-black/5"}
                  >
                    IN
                  </button>
                  <button
                    onClick={() => setUnit("cm")}
                    className={unit === "cm" ? "px-3 py-1 text-xs font-semibold rounded-md bg-black text-white" : "px-3 py-1 text-xs font-semibold rounded-md text-gray-600 hover:bg-black/5"}
                  >
                    CM
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Measurements are approximate • Unit: {unit === "inch" ? "inches" : "cm"}
              </p>
            </div>

            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
            {loading && <p className="text-xs text-gray-400">Loading size chart…</p>}
            {!loading && !display && <p className="text-xs text-gray-500">Size chart not available.</p>}

            {!loading && display && (
              <div className="border border-black/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-black/5">
                  <p className="text-sm font-semibold text-black">{display.title}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black/5">
                        {display.headers.map((h, i) => (
                          <th
                            key={i}
                            className={i === 0 ? "px-5 py-3 text-left text-sm font-semibold text-gray-800 whitespace-nowrap" : "px-5 py-3 text-center text-sm font-semibold text-gray-800 whitespace-nowrap"}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {display.rows.map((r, i) => (
                        <tr key={i} className="border-b border-black/5 last:border-0">
                          {r.map((c, j) => (
                            <td
                              key={j}
                              className={j === 0 ? "px-5 py-3 text-left text-sm text-gray-700 font-medium whitespace-nowrap" : "px-5 py-3 text-center text-sm text-gray-700 whitespace-nowrap"}
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-black/5">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
