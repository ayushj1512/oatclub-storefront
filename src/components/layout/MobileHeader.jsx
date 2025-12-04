"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Search,
  Home,
  LayoutGrid,
  Heart,
  Info,
  Mail,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import WishlistButton from "@/components/header/WishlistButton";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  const router = useRouter();
  const { cart } = useCartStore?.() || { cart: [] };

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  // ✅ make header fixed only after scrolling past topbar
  useEffect(() => {
    const TOPBAR_HEIGHT = 36; // h-9 = 36px
    const onScroll = () => setIsSticky(window.scrollY > TOPBAR_HEIGHT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      setShowSearch(false);
      setSearchText("");
    }
  };

  // Lock body scroll + ESC close when drawer is open
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  const drawerVariants = {
    hidden: { x: "-100%" },
    show: { x: 0, transition: { type: "spring", stiffness: 320, damping: 34 } },
    exit: { x: "-100%", transition: { type: "spring", stiffness: 320, damping: 38 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Cart", href: "/cart", icon: ShoppingBag },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <header className={`md:hidden w-full bg-white shadow-md z-[9999] border-b border-gray-300 ${isSticky ? "fixed top-0 left-0" : "relative"}`}>
      {/* ───────────────────────────── TOP BAR ───────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Icon */}
        <button onClick={openMenu} aria-label="Open menu" className="text-black hover:text-[#800020] transition">
          <Menu size={26} />
        </button>

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight select-none text-[#800020]">
          MIRAY<span className="text-black">.</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button onClick={() => setShowSearch((s) => !s)} aria-label="Toggle search" className="text-black hover:text-[#800020] transition">
            <Search size={22} />
          </button>

          {/* Wishlist */}
          <WishlistButton size={22} />

          {/* Profile */}
          <Link href="/profile" className="text-black hover:text-[#800020] transition" aria-label="Profile">
            <User size={22} />
          </Link>
        </div>
      </div>

      {/* ───────────────────────────── SEARCH BAR ───────────────────────────── */}
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

      {/* ───────────────────────────── FULLSCREEN LEFT DRAWER ───────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/45 z-[60]"
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              className="fixed inset-0 z-[70] bg-white flex flex-col"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                <span className="inline-flex items-center gap-2 text-lg font-semibold text-black">Menu</span>
                <button onClick={closeMenu} aria-label="Close menu" className="text-black hover:text-[#800020] transition">
                  <X size={24} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col text-black font-medium">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className="px-5 py-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-3"
                    >
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/5 text-black">
                        <Icon size={18} />
                      </span>
                      <span className="text-[15px]">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Section */}
              <div className="mt-auto border-t border-gray-300 px-5 py-5">
                <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 text-black hover:text-[#800020] transition">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020]">
                    <User size={18} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">My Account</span>
                    <span className="text-xs text-gray-500">Orders • Profile • Settings</span>
                  </div>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
