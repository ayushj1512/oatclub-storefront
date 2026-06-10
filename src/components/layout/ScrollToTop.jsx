"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 360);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] right-3 z-[90] md:bottom-6 md:right-6">
      <AnimatePresence>
        {isVisible && (
          <motion.button
            type="button"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 480,
              damping: 34,
              mass: 0.8,
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            className="
              group relative flex h-10 w-10 items-center justify-center
              overflow-hidden rounded-full border border-black/10
              bg-white text-black shadow-[0_14px_35px_rgba(0,0,0,0.14)]
              backdrop-blur-xl transition-all duration-300
              hover:border-black hover:bg-black hover:text-white
              md:h-11 md:w-11
            "
          >
            <span className="absolute inset-0 rounded-full bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-all duration-300 group-hover:border-white/20 group-hover:bg-white group-hover:text-black">
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}