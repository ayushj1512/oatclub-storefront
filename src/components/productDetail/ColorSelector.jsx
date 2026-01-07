"use client";

import React from "react";
import { Check } from "lucide-react";

const COLOR_HEX = {
  black: "#111111",
  white: "#ffffff",
  grey: "#9ca3af",
  charcoal: "#374151",
  red: "#ef4444",
  maroon: "#800000",
  burgundy: "#800020",
  pink: "#ec4899",
  "hot-pink": "#ff1493",
  peach: "#ffb997",
  blue: "#3b82f6",
  "navy-blue": "#1e3a8a",
  "sky-blue": "#0ea5e9",
  teal: "#14b8a6",
  turquoise: "#06b6d4",
  green: "#22c55e",
  "olive-green": "#556b2f",
  "mint-green": "#98ff98",
  "lime-green": "#84cc16",
  yellow: "#facc15",
  mustard: "#eab308",
  orange: "#f97316",
  rust: "#b45309",
  purple: "#a855f7",
  lavender: "#c084fc",
  violet: "#8b5cf6",
  brown: "#92400e",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  khaki: "#c3b091",
  tan: "#d2b48c",
  gold: "#d4af37",
  silver: "#c0c0c0",
  multicolor:
    "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
};

const label = (v) =>
  String(v).replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export default function ColorSelector({
  colors = [],
  selectedColor,
  onSelect,
  title = "Select Color",
}) {
  if (!colors?.length) return null;

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-black">
          {title}
        </h3>
        {selectedColor && (
          <span className="text-[11px] font-medium text-black/60">
            {label(selectedColor)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {colors.map((c) => {
          const value = String(c).trim().toLowerCase();
          const active = selectedColor === value;

          const swatch = COLOR_HEX[value] || "#e5e7eb";
          const isGradient =
            typeof swatch === "string" && swatch.startsWith("linear-gradient");

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect?.(value)}
              className="group flex flex-col items-center gap-1.5"
              aria-label={`Select ${label(value)}`}
            >
              {/* Swatch */}
              <span
                className={`h-10 w-10 rounded-full border shadow-sm transition grid place-items-center ${
                  active
                    ? "border-black ring-2 ring-black/70 scale-[1.04]"
                    : "border-black/15 hover:border-black/30 group-hover:scale-[1.02]"
                }`}
                style={{
                  background: isGradient ? swatch : undefined,
                  backgroundColor: !isGradient ? swatch : undefined,
                }}
              >
                {/* white fix */}
                {value === "white" ? (
                  <span className="h-8 w-8 rounded-full border border-black/10 bg-white" />
                ) : null}

                {/* check icon */}
                {active ? (
                  <Check className="h-4 w-4 text-white drop-shadow" />
                ) : null}
              </span>

              {/* Label */}
              <span
                className={`text-[11px] font-medium ${
                  active ? "text-black" : "text-black/60"
                }`}
              >
                {label(value)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
