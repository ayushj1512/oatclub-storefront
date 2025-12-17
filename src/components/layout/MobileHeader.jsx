"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ShoppingBag,
  User,
  Search,
} from "lucide-react";
import Image from "next/image";

import WishlistButton from "@/components/header/WishlistButton";
import MobileSidebarDrawer from "@/components/header/MobileSidebarDrawer";

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  const router = useRouter();
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* -------------------------------------------------------
     TOPBAR HEIGHT → STICKY LOGIC
  ------------------------------------------------------- */
  const topbarHRef = useRef(0);

  useEffect(() => {
    const measureTopbar = () => {
      const el =
        document.getElementById("topbar-headline") ||
        document.querySelector("[data-topbar]") ||
        document.querySelector(".topbar-headline");

      const h = el ? Math.round(el.getBoundingClientRect().height) : 0;
      topbarHRef.current = h;
      document.documentElement.style.setProperty("--app-topbar-h", `${h}px`);
      return h;
    };

    const onScroll = () => {
      const topbarH = measureTopbar();
      setIsSticky(window.scrollY > topbarH);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* -------------------------------------------------------
     HEADER HEIGHT CSS VAR (for layout spacing)
  ------------------------------------------------------- */
  useEffect(() => {
    const el = document.getElementById("mobile-header");
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty(
        "--app-header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`
      );
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);

    return () => ro.disconnect();
  }, [showSearch]);

  /* -------------------------------------------------------
     SEARCH HANDLER
  ------------------------------------------------------- */
  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      setShowSearch(false);
      setSearchText("");
    }
  };

  /* -------------------------------------------------------
     STICKY OFFSET
  ------------------------------------------------------- */
  const topbarH = `var(--app-topbar-h, 0px)`;
  const safeTop = `env(safe-area-inset-top, 0px)`;
  const headerTop = isSticky ? `calc(${topbarH} + ${safeTop})` : "0px";

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header
        id="mobile-header"
        className={[
          "md:hidden w-full bg-white shadow-md border-b border-gray-300",
          "z-[9999]",
          isSticky ? "fixed left-0 right-0" : "relative",
        ].join(" ")}
        style={{ top: headerTop }}
      >
        {/* TOP ROW */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={openMenu}
            aria-label="Open menu"
            className="shrink-0 text-black hover:text-[#800020] transition"
          >
            <Menu size={26} />
          </button>

          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex-1 flex items-center justify-center select-none"
          >
            <div className="relative h-8 w-full">
              <Image
                src={LOGO_URL}
                alt="Miray"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 60vw, 240px"
              />
            </div>
          </Link>

          <div className="shrink-0 flex items-center gap-4">
            <button
              onClick={() => setShowSearch((s) => !s)}
              aria-label="Toggle search"
              className="text-black hover:text-[#800020] transition"
            >
              <Search size={22} />
            </button>

            <WishlistButton size={22} />

            <button
              type="button"
              aria-label="Cart"
              onClick={() => router.push("/cart")}
              className="text-black hover:text-[#800020] transition"
            >
              <ShoppingBag size={22} />
            </button>

            <Link
              href="/profile"
              aria-label="Profile"
              className="text-black hover:text-[#800020] transition"
            >
              <User size={22} />
            </Link>
          </div>
        </div>

        {/* SEARCH BAR */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-t border-gray-300 px-4 py-2 shadow-inner"
            >
              <input
                type="text"
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= SIDEBAR DRAWER ================= */}
      <MobileSidebarDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
