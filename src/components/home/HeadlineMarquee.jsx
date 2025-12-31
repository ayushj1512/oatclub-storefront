"use client";

import { Flame } from "lucide-react";

export default function HeadlineMarquee({ direction = "left" }) {
  const MIN_SPEED = 120; // 🔥 ultra-slow, all screens

  return (
    <div className="relative overflow-hidden bg-black py-4 select-none fire-strip">
      {/* Edge Fade */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      {/* Marquee */}
      <div
        className={`flex whitespace-nowrap gap-16 items-center animate-marquee-${direction}`}
        style={{
          animationDuration: `${MIN_SPEED}s`,
          animationTimingFunction: "linear",
        }}
      >
        {Array(14)
          .fill(0)
          .map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-5 text-white text-2xl md:text-3xl font-extrabold tracking-[0.18em] uppercase"
            >
              ALWAYS ON FIRE
              <span className="text-3xl md:text-4xl">
                <Flame
                  size={34}
                  className="text-[#ff3b5c] drop-shadow-lg"
                />
              </span>
            </span>
          ))}
      </div>
    </div>
  );
}