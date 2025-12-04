"use client";

import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { useMemo } from "react";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

export default function TopbarHeadline() {
  const items = useMemo(() => ["New arrivals just dropped — shop now", "Use code WELCOME5 for 5% off", "Gen-Z fits • Western vibes • Premium picks", "Use code FIRST10 for 10% off"], []);
  const loop = useMemo(() => [...items, ...items, ...items, ...items], [items]);

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="relative h-9 flex items-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#800020]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(128,0,32,0.18),transparent_55%)]" />

        {/* Two identical tracks => true infinite / seamless loop */}
        <div className="flex whitespace-nowrap will-change-transform">
          <motion.div className={`flex items-center ${bebas.className}`} animate={{ x: ["0%", "-100%"] }} transition={{ duration: 26, ease: "linear", repeat: Infinity }}>
            <div className="flex items-center px-4">
              {loop.map((item, i) => (
                <span key={`a-${i}`} className="inline-flex items-center">
                  <span className="text-[13px] md:text-[14px] tracking-[0.02em] uppercase text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]">{item}</span>
                  <span aria-hidden="true" className="mx-3 md:mx-4 text-[#800020] text-[15px] md:text-[17px] leading-none drop-shadow-[0_0_8px_rgba(128,0,32,0.65)]">|</span>
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div className={`flex items-center ${bebas.className}`} animate={{ x: ["0%", "-100%"] }} transition={{ duration: 26, ease: "linear", repeat: Infinity }}>
            <div className="flex items-center px-4">
              {loop.map((item, i) => (
                <span key={`b-${i}`} className="inline-flex items-center">
                  <span className="text-[13px] md:text-[14px] tracking-[0.02em] uppercase text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]">{item}</span>
                  <span aria-hidden="true" className="mx-3 md:mx-4 text-[#800020] text-[15px] md:text-[17px] leading-none drop-shadow-[0_0_8px_rgba(128,0,32,0.65)]">|</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
