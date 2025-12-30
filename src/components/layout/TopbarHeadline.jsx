"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function TopbarHeadline() {
  const items = useMemo(
    () => [
      "New arrivals just dropped — shop now",
      "Use code WELCOME5 for 5% off",
      "Gen-Z fits • Western vibes • Premium picks",
      "Use code FIRST10 for 10% off",
    ],
    []
  );

  const loop = useMemo(
    () => [...items, ...items, ...items, ...items],
    [items]
  );

  return (
   <div className="w-full overflow-hidden bg-black text-white">
  <div className="relative flex h-9 items-center">

    {/* top & bottom hairline borders */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    {/* subtle monochrome glow */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />

    {/* Infinite marquee */}
    <div className="flex whitespace-nowrap will-change-transform">

      {/* Track A */}
      <motion.div
        className="flex items-center font-bebas"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        <div className="flex items-center px-4">
          {loop.map((item, i) => (
            <span key={`a-${i}`} className="inline-flex items-center">
              <span className="text-[13px] md:text-[14px] tracking-[0.18em] uppercase text-white/95">
                {item}
              </span>
              <span
                aria-hidden
                className="mx-4 text-white/30 text-[14px] leading-none"
              >
                •
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Track B (clone for seamless loop) */}
      <motion.div
        className="flex items-center font-bebas"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        <div className="flex items-center px-4">
          {loop.map((item, i) => (
            <span key={`b-${i}`} className="inline-flex items-center">
              <span className="text-[13px] md:text-[14px] tracking-[0.18em] uppercase text-white/95">
                {item}
              </span>
              <span
                aria-hidden
                className="mx-4 text-white/30 text-[14px] leading-none"
              >
                •
              </span>
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  </div>
</div>

  );
}
