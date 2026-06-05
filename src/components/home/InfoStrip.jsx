"use client";

import { BadgeCheck, Sparkles, TrendingUp } from "lucide-react";

const TRUST_ITEMS = [
  {
    title: "CURATED EDITS",
    desc: "STYLES PICKED TO FEEL CURRENT, CLEAN AND EASY TO WEAR.",
    Icon: Sparkles,
  },
  {
    title: "QUALITY CHECKED",
    desc: "PRODUCTS REVIEWED FOR FINISH, FABRIC FEEL AND EVERYDAY COMFORT.",
    Icon: BadgeCheck,
  },
  {
    title: "TREND AWARE",
    desc: "FRESH SILHOUETTES WITHOUT MAKING YOUR WARDROBE FEEL LOUD.",
    Icon: TrendingUp,
  },
];

export default function InfoStrip() {
  return (
    <section className="w-full bg-white px-3 py-8 text-black md:px-8 md:py-10">
      <div className="border-y border-neutral-200">
        <div className="grid divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TRUST_ITEMS.map(({ title, desc, Icon }) => (
            <div key={title} className="flex gap-3 px-2 py-5 md:px-6">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-black" />
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                  {title}
                </h3>
                <p className="mt-2 max-w-sm text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
