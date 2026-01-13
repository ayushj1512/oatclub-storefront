"use client";

import { useEffect, useMemo, useState } from "react";
import { Plane, ShieldCheck, ThumbsUp } from "lucide-react";

const GREEN = "#16a34a";

const SLIDES = [
{ icon: Plane, title: "Free Shipping", desc: "Free shipping on every order." },
  { icon: ShieldCheck, title: "Fast Dispatch", desc: "Ships within 24–48 hours." },
  { icon: ThumbsUp, title: "Easy Returns", desc: "Hassle-free return window." },
];

export default function ShippingHighlightsSlider({ intervalMs = 2400 }) {
  const len = SLIDES.length;
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(Boolean(mq?.matches));
    sync();
    mq?.addEventListener?.("change", sync);
    return () => mq?.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (reduce || len <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % len), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, reduce, len]);

  if (!len) return null;

  const idx = ((active % len) + len) % len;
  const cur = SLIDES[idx] || SLIDES[0];
  const Icon = cur?.icon || Plane;

  const progress = useMemo(
    () => (len <= 1 ? 0 : (idx / (len - 1)) * 100),
    [idx, len]
  );

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4">
      {/* ✅ nicer presentation: header + slide card */}
      <div className="flex items-center justify-between">
   <p className="text-[11px] tracking-[0.32em] uppercase text-black/55">
  Secure & Trusted
</p>


<span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-black inline-flex items-center gap-1.5">
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/[0.04]">
    <span className="text-[10px] leading-none" style={{ color: "#16a34a" }}>
      ✓
    </span>
  </span>
  Verified
</span>


      </div>

      {/* slide */}
      <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.02] px-3.5 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
            <Icon className="h-5 w-5" style={{ color: GREEN }} />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-black leading-tight">
              {cur.title}
            </p>
            <p className="mt-0.5 text-xs md:text-sm text-black/70 leading-snug">
              {cur.desc}
            </p>
          </div>
        </div>
      </div>

      {/* route */}
      <div className="mt-4 relative">
        <div className="h-[2px] w-full bg-black/10 rounded-full" />
        <div
          className="absolute left-0 top-0 h-[2px] rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: GREEN,
            transition: reduce ? "none" : "width 500ms ease",
          }}
        />

        {/* dots */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full flex justify-between">
          {SLIDES.map((_, i) => {
            const on = i <= idx;
            return (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-black/15"
                style={{
                  backgroundColor: on ? GREEN : "white",
                  boxShadow: on ? "0 0 0 4px rgba(22,163,74,0.12)" : "none",
                  transition: reduce ? "none" : "all 350ms ease",
                }}
              />
            );
          })}
        </div>

        {/* moving icon */}
        <div
          className="absolute -top-4"
          style={{
            left: `calc(${progress}% - 14px)`,
            transition: reduce ? "none" : "left 520ms ease",
          }}
          aria-hidden="true"
        >
          <div
            className={[
              "rounded-full border border-black/10 bg-white p-2 shadow-sm",
              reduce ? "" : "animate-[bump_700ms_ease-in-out_infinite]",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" style={{ color: GREEN }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bump {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </section>
  );
}
