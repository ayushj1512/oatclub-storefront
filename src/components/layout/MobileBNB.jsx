"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ShoppingBag, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function MobileBNB() {
  const pathname = usePathname();
  const { cart } = useCartStore?.() || { cart: [] };
  const itemsCount = Array.isArray(cart) ? cart.length : 0;

  const tabs = useMemo(
    () => [
      { name: "Home", href: "/", icon: Home },
      { name: "Shop", href: "/shopall", icon: ShoppingBag },
      { name: "Categories", href: "/categories", icon: LayoutGrid },
      { name: "Cart", href: "/cart", icon: ShoppingCart, badge: itemsCount },
    ],
    [itemsCount]
  );

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const activeIndex = Math.max(0, tabs.findIndex((t) => isActive(t.href)));

  const wrapRef = useRef(null);
  const [metrics, setMetrics] = useState({ cellW: 0, cellX: 0 });

  const recalc = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 4; // gap-1 => 4px
    const cols = 4;
    const cellW = Math.max(0, (rect.width - gap * (cols - 1)) / cols);
    const cellX = activeIndex * (cellW + gap);
    setMetrics({ cellW, cellX });
  };

  useLayoutEffect(() => {
    recalc();
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);

    window.addEventListener("orientationchange", recalc);
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", recalc);
      window.removeEventListener("resize", recalc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const pillPadX = 6;
  const pillW = Math.max(0, metrics.cellW - pillPadX * 2);
  const pillX = metrics.cellX + pillPadX;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[80]">
      <div className="pb-[env(safe-area-inset-bottom)] bg-white border-t border-black/10 shadow-[0_-10px_30px_rgba(0,0,0,0.10)]">
        <div className="mx-auto max-w-md px-2 py-2">
          <div ref={wrapRef} className="relative grid grid-cols-4 gap-1">
            {/* ✅ IMPORTANT: pointer-events-none so it never blocks tapping */}
            <motion.div
              className="pointer-events-none absolute top-1 bottom-1 rounded-2xl bg-[#800020]/10"
              animate={{ width: pillW, x: pillX }}
              transition={{ type: "spring", stiffness: 520, damping: 38 }}
            />

            {tabs.map((t, idx) => {
              const Icon = t.icon;
              const active = idx === activeIndex;

              return (
                <Link
                  key={t.name}
                  href={t.href}
                  aria-label={t.name}
                  className="relative z-[1] block"
                >
                  <motion.div
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 700, damping: 32 }}
                    className="flex flex-col items-center justify-center py-2"
                  >
                    <motion.span
                      animate={{ y: active ? -2 : 0, scale: active ? 1.06 : 1, opacity: active ? 1 : 0.78 }}
                      transition={{ type: "spring", stiffness: 650, damping: 34 }}
                      className={[
                        "relative inline-flex items-center justify-center",
                        "h-9 w-12 rounded-2xl",
                        active ? "text-[#800020]" : "text-black/60",
                        "transition-colors",
                      ].join(" ")}
                    >
                      <Icon size={20} />

                      {/* Cart badge */}
                      {t.name === "Cart" && (t.badge || 0) > 0 && (
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={t.badge}
                            initial={{ scale: 0.6, opacity: 0, y: -3 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.6, opacity: 0, y: -3 }}
                            transition={{ type: "spring", stiffness: 900, damping: 30 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#800020] text-white text-[10px] font-semibold flex items-center justify-center leading-none shadow-[0_10px_20px_rgba(128,0,32,0.28)]"
                          >
                            {t.badge > 99 ? "99+" : t.badge}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.span>

                    <motion.span
                      animate={{ opacity: active ? 1 : 0.55, y: active ? 0 : 1 }}
                      transition={{ duration: 0.18 }}
                      className={[
                        "text-[10px] font-semibold tracking-wide",
                        active ? "text-[#800020]" : "text-black/50",
                      ].join(" ")}
                    >
                      {t.name}
                    </motion.span>

                    {/* Active underline */}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="bnb-underline"
                          initial={{ opacity: 0, scaleX: 0.6 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0.6 }}
                          transition={{ type: "spring", stiffness: 520, damping: 38 }}
                          className="mt-1 h-[2px] w-6 rounded-full bg-[#800020]"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
