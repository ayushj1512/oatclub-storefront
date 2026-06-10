"use client";

import { useState } from "react";
import { RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

const ITEMS = [
  [
    ShieldCheck,
    "Quality Checked",
    "Every piece is reviewed before dispatch.",
  ],
  [
    Sparkles,
    "Specially Curated",
    "Curated and prepared with care. Dispatch within 5–7 days.",
  ],
  [
    RotateCcw,
    "Easy Exchange",
    "Simple exchange support directly from your account.",
  ],
];

export default function ShippingHighlights() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-white py-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black">
          SHIPPING & RETURNS
        </span>

        <span className="text-base font-light leading-none text-black">
          {open ? "-" : "+"}
        </span>
      </button>

      {open ? (
        <div className="mt-2 grid gap-2">
          {ITEMS.map(([Icon, title, desc]) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">
                    {title}
                  </p>
                </div>

                <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}