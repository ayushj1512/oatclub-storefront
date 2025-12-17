"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  ShoppingBag,
  User,
  Home,
  LayoutGrid,
  Heart,
  Info,
  Mail,
} from "lucide-react";

/* ----------------------------------------------------
   FULLSCREEN MOBILE SIDEBAR DRAWER (PORTAL)
---------------------------------------------------- */
export default function MobileSidebarDrawer({ open, onClose }) {
  /* ---------------- body scroll lock (iOS safe) ---------------- */
  const scrollYRef = useRef(0);
  const prevBodyStyleRef = useRef({
    overflow: "",
    position: "",
    top: "",
    width: "",
    touchAction: "",
  });

  useEffect(() => {
    if (!open) return;

    const body = document.body;

    scrollYRef.current = window.scrollY || 0;
    prevBodyStyleRef.current = {
      overflow: body.style.overflow || "",
      position: body.style.position || "",
      top: body.style.top || "",
      width: body.style.width || "",
      touchAction: body.style.touchAction || "",
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = prevBodyStyleRef.current.overflow;
      body.style.position = prevBodyStyleRef.current.position;
      body.style.top = prevBodyStyleRef.current.top;
      body.style.width = prevBodyStyleRef.current.width;
      body.style.touchAction = prevBodyStyleRef.current.touchAction;

      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  /* ---------------- animations ---------------- */
  const drawerVariants = {
    hidden: { x: "-100%" },
    show: {
      x: 0,
      transition: { type: "spring", stiffness: 320, damping: 34 },
    },
    exit: {
      x: "-100%",
      transition: { type: "spring", stiffness: 320, damping: 38 },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  };

  /* ---------------- nav items ---------------- */
  const navItems = useMemo(
    () => [
      { name: "Home", href: "/", icon: Home },
      { name: "Categories", href: "/categories", icon: LayoutGrid },
      { name: "Wishlist", href: "/wishlist", icon: Heart },
      { name: "Cart", href: "/cart", icon: ShoppingBag },
      { name: "About", href: "/about", icon: Info },
      { name: "Contact", href: "/contact", icon: Mail },
    ],
    []
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/45 z-[999998]"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* DRAWER */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            className="fixed inset-0 z-[999999] bg-white flex flex-col w-screen h-[100svh]"
            variants={drawerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
              <span className="text-lg font-semibold text-black">Menu</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="text-black hover:text-[#800020] transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* NAV */}
            <nav className="flex flex-col text-black font-medium overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="px-5 py-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-3"
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/5">
                      <Icon size={18} />
                    </span>
                    <span className="text-[15px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ACCOUNT */}
            <div className="mt-auto border-t border-gray-300 px-5 py-5">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 text-black hover:text-[#800020] transition"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020]">
                  <User size={18} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">My Account</span>
                  <span className="text-xs text-gray-500">
                    Orders • Profile • Settings
                  </span>
                </div>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
