"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const SIZE_CHART = [
  { label: "To Fit Bust", XS: 32, S: 34, M: 36, L: 38, XL: 40 },
  { label: "To Fit Waist", XS: 25, S: 27, M: 29, L: 31, XL: 33 },
  { label: "To Fit Hip", XS: 33, S: 35, M: 37, L: 39, XL: 41 },
];

const SIZES = ["XS", "S", "M", "L", "XL"];

const formatMeasurement = (value, unit) => {
  if (unit === "cm") {
    return (value * 2.54).toFixed(1);
  }

  return value;
};

export default function SizeGuideSection() {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState("inch");

  return (
    <div className="border-t border-black/10 py-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-black md:text-lg">
          Size Guide
        </span>

        {open ? (
          <Minus className="h-5 w-5 text-black" />
        ) : (
          <Plus className="h-5 w-5 text-black" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "mt-4 max-h-[900px]" : "max-h-0"
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-black">
                Universal Size Chart
              </p>
              <p className="text-xs text-black/45">Body measurements</p>
            </div>

            <div className="flex rounded-full bg-black/[0.05] p-1">
              <button
                type="button"
                onClick={() => setUnit("inch")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  unit === "inch"
                    ? "bg-black text-white"
                    : "text-black/50 hover:text-black"
                }`}
              >
                Inches
              </button>

              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  unit === "cm"
                    ? "bg-black text-white"
                    : "text-black/50 hover:text-black"
                }`}
              >
                CM
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-black/[0.08]">
            <table className="w-full min-w-[540px] border-collapse text-sm">
              <thead>
                <tr className="bg-black/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                    Size
                  </th>

                  {SIZES.map((size) => (
                    <th
                      key={size}
                      className="px-4 py-3 text-center font-bold text-black"
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
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-black">
                      {row.label}
                    </td>

                    {SIZES.map((size) => (
                      <td
                        key={size}
                        className="px-4 py-3 text-center font-medium text-black/65"
                      >
                        {formatMeasurement(row[size], unit)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 text-sm leading-6 text-black/60">
            <p>
              <strong className="text-black">Bust:</strong> Measure around the
              fullest part of your chest.
            </p>

            <p>
              <strong className="text-black">Waist:</strong> Measure around the
              narrowest part of your waist.
            </p>

            <p>
              <strong className="text-black">Hip:</strong> Measure around the
              widest part of your hips.
            </p>
          </div>

          <p className="rounded-xl bg-black/[0.03] px-4 py-3 text-xs leading-5 text-black/50">
            Measurements are approximate. Choose the closest size based on your
            body measurements.
          </p>
        </div>
      </div>
    </div>
  );
}