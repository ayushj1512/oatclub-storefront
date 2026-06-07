"use client";

import { useState } from "react";
import { Plane, RotateCcw, ShieldCheck } from "lucide-react";

const ITEMS = [
  [ShieldCheck, "Secure & Trusted", "Quality checked before dispatch."],
  [Plane, "Fast Dispatch", "Ships within 24-48 hours when in stock."],
  [RotateCcw, "Easy Exchange", "Simple exchange support from your account."],
];

export default function ShippingHighlights() {
  const [open, setOpen] = useState(true);

  return (
    <section className="border-y border-neutral-200 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black">
          SHIPPING & RETURNS
        </span>
        <span className="text-base font-light leading-none text-black">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div className="mt-2 grid gap-0 divide-y divide-neutral-200">
          {ITEMS.map(([Icon, title, desc]) => (
            <div key={title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-black" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">
                  {title}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-[0.06em] text-black/48">
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
