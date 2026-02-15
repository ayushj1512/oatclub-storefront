"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function TopbarHeadline({ interval = 2800 }) {
  const items = useMemo(
    () => [
      "Use code FIRST10 to get 10% OFF on your first order 🎉",
      "Summer Collection is Live ☀️",
      "Curated with Love ❤️",
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % items.length),
      interval
    );
    return () => clearInterval(t);
  }, [items.length, interval]);

  return (
    <div
      id="topbar-headline"
      data-topbar
      className="w-full overflow-hidden bg-black text-white"
    >
      <div className="relative flex h-8 items-center justify-center px-3 md:h-9 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.07),transparent_60%)]" />

        <div className="relative flex w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute flex w-full items-center justify-center font-bebas"
            >
              <span className="max-w-[92%] truncate text-center text-[11px] uppercase tracking-[0.12em] text-white/95 sm:text-[12px] sm:tracking-[0.14em] md:text-[14px] md:tracking-[0.18em]">
                {items[active]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
