"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL"];

const SIZE_CHART = [
  { label: "Bust", XS: 32, S: 34, M: 36, L: 38, XL: 40 },
  { label: "Waist", XS: 25, S: 27, M: 29, L: 31, XL: 33 },
  { label: "Hip", XS: 33, S: 35, M: 37, L: 39, XL: 41 },
];

const formatMeasurement = (value, unit) =>
  unit === "cm" ? Math.round(value * 2.54) : value;

export default function SizeGuideModal({ open, onClose }) {
  const [unit, setUnit] = useState("inch");

  useEffect(() => {
    if (!open) return;

    setUnit("inch");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close size guide"
      />

      <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
          className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[22px]"
        >
          {/* Header */}
          <div className="border-b border-black/[0.07] px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                  OATCLUB Fit Guide
                </p>

                <h2
                  id="size-guide-title"
                  className="mt-0.5 text-xl font-semibold tracking-[-0.03em] text-black sm:text-2xl"
                >
                  Size Guide
                </h2>

                <p className="mt-0.5 text-[11px] leading-4 text-black/45 sm:text-xs">
                  Match your body measurement with the closest size.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.05] text-black transition hover:bg-black hover:text-white"
                aria-label="Close size guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex w-fit rounded-full bg-black/[0.05] p-0.5">
              <button
                type="button"
                onClick={() => setUnit("inch")}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition ${
                  unit === "inch"
                    ? "bg-black text-white shadow-sm"
                    : "text-black/50"
                }`}
              >
                Inches
              </button>

              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition ${
                  unit === "cm"
                    ? "bg-black text-white shadow-sm"
                    : "text-black/50"
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
            <div className="overflow-hidden rounded-xl border border-black/[0.08]">
              <div className="flex items-center justify-between bg-black/[0.03] px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-black sm:text-sm">
                    Universal Size Chart
                  </p>

                  <p className="mt-0.5 text-[10px] text-black/40">
                    {unit === "inch" ? "Measurements in inches" : "Measurements in centimeters"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-black/45 ring-1 ring-black/[0.06]">
                  Body Fit
                </span>
              </div>

              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-t border-black/[0.07]">
                    <th className="w-[24%] px-1.5 py-2.5 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-black/45 sm:px-3 sm:text-[10px]">
                      Size
                    </th>

                    {SIZES.map((size) => (
                      <th
                        key={size}
                        className="px-0.5 py-2.5 text-center text-[11px] font-bold text-black sm:px-2 sm:text-xs"
                      >
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-black/[0.07]"
                    >
                      <td className="px-1.5 py-2.5 text-left text-[10px] font-semibold text-black sm:px-3 sm:text-xs">
                        {row.label}
                      </td>

                      {SIZES.map((size) => (
                        <td
                          key={size}
                          className="px-0.5 py-2.5 text-center text-[10px] font-medium text-black/65 sm:px-2 sm:text-xs"
                        >
                          {formatMeasurement(row[size], unit)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measurement guide */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="rounded-xl bg-black/[0.03] p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/40">
                  Bust
                </p>
                <p className="mt-1 text-[10px] leading-4 text-black/55 sm:text-[11px]">
                  Around the fullest chest area.
                </p>
              </div>

              <div className="rounded-xl bg-black/[0.03] p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/40">
                  Waist
                </p>
                <p className="mt-1 text-[10px] leading-4 text-black/55 sm:text-[11px]">
                  Around the narrowest waist area.
                </p>
              </div>

              <div className="rounded-xl bg-black/[0.03] p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/40">
                  Hip
                </p>
                <p className="mt-1 text-[10px] leading-4 text-black/55 sm:text-[11px]">
                  Around the widest hip area.
                </p>
              </div>
            </div>

            <p className="mt-3 rounded-xl bg-black/[0.03] px-3 py-2.5 text-[10px] leading-4 text-black/50 sm:text-[11px]">
              Between two sizes? Choose the larger size for a relaxed fit or
              the smaller size for a closer fit.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-black/[0.07] px-3 py-3 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-full rounded-xl bg-black text-xs font-semibold text-white transition hover:bg-black/85 active:scale-[0.99]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}