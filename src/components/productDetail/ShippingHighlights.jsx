"use client";

import { Plane, RotateCcw, ShieldCheck } from "lucide-react";

const ITEMS = [
  [ShieldCheck, "Secure & Trusted", "Quality checked before dispatch."],
  [Plane, "Fast Dispatch", "Ships within 24-48 hours when in stock."],
  [RotateCcw, "Easy Exchange", "Simple exchange support from your account."],
];

export default function ShippingHighlights() {
  return (
    <section className="bg-neutral-50 p-4">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">
        Shipping & Returns
      </p>
      <div className="grid gap-3">
        {ITEMS.map(([Icon, title, desc]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-white text-black">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-black">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-black/55">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
