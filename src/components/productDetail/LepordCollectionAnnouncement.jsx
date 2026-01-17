"use client";

import { Zap } from "lucide-react";

export default function LepordCollectionAnnouncement({ collections = [] }) {
  if (!Array.isArray(collections) || collections.length === 0) return null;

  const isPolka = collections.some((c) => c?.slug === "the-polka-edit");
  const isLeopard = collections.some((c) => c?.slug === "leopard-energy");

  // show nothing if neither collection matches
  if (!isPolka && !isLeopard) return null;

  const isPolkaMode = isPolka; // polka takes priority if both ever exist

  return (
    <div
      className={[
        "w-full md:w-fit md:max-w-full rounded-lg border px-3 py-2 md:px-4 md:py-3",
        isPolkaMode
          ? "border-white/15"
          : "bg-amber-50 border-amber-200",
      ].join(" ")}
      style={
        isPolkaMode
          ? {
              backgroundColor: "#000",
              backgroundImage:
                "radial-gradient(circle at 8px 8px, rgba(255,255,255,0.18) 1.5px, transparent 1.6px)",
              backgroundSize: "16px 16px",
            }
          : undefined
      }
    >
      <div className="flex items-center justify-center md:justify-start gap-2">
        <Zap
          size={16}
          className={isPolkaMode ? "text-white" : "text-amber-700"}
        />

        <p
          className={[
            "text-[12px] md:text-sm leading-snug",
            "text-center md:text-left",
            isPolkaMode ? "text-white" : "text-amber-900",
          ].join(" ")}
        >
          {isPolkaMode
            ? "Timeless polka dots with a modern edge"
            : "Bestseller • On Fire • Trending Now"}
        </p>
      </div>
    </div>
  );
}
