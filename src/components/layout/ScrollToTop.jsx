"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+96px)] right-4 z-[90] md:bottom-6 md:right-6">
      <AnimatePresence>
        {isVisible && (
          <motion.button
            type="button"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
            whileTap={{ scale: 0.94 }}
            className="h-9 w-9 rounded-full bg-white/95 text-black/80 border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.12)] backdrop-blur flex items-center justify-center hover:text-black hover:border-black/20 transition"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
