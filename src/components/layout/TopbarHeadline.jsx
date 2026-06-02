"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function TopbarHeadline({ interval = 2800 }) {
  const items = useMemo(
    () => [
      "New Gingham Collection is Live",
      "Flat 10% OFF on First Order — Use Code FIRST10",
      "Shop Above ₹2499 & Get ₹500 OFF",
      "Denim Collection is Now Live",
      "Fresh Fits Dropped — Upgrade Your Wardrobe",
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items.length) return;

    const timer = setInterval(
      () => setActive((p) => (p + 1) % items.length),
      interval
    );

    return () => clearInterval(timer);
  }, [items, interval]);

  return (
    <div
      id="topbar-headline"
      data-topbar
      className="w-full border-b border-white/10 bg-black text-white"
    >
      <div className="relative flex h-8 items-center justify-center px-3 md:h-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 5, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(2px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute flex w-full items-center justify-center gap-2 px-3"
          >
            <Sparkles className="h-3 w-3 shrink-0 text-white/70" />

            <span className="max-w-[88%] truncate text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white md:text-xs md:tracking-[0.22em]">
              {items[active]}
            </span>

            <Sparkles className="h-3 w-3 shrink-0 text-white/70" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}