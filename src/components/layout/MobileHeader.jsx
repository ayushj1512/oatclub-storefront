"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import WishlistButton from "@/components/header/WishlistButton";

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const router = useRouter();
  const { cart } = useCartStore?.() || { cart: [] };

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      setShowSearch(false);
      setSearchText("");
    }
  };

  return (
    <header className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-50 border-b border-gray-300">

      {/* ───────────────────────────── TOP BAR ───────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Menu Icon */}
        <button
          onClick={() => setMenuOpen(true)}
          className="text-black hover:text-[#800020] transition"
        >
          <Menu size={26} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight select-none text-[#800020]"
        >
          MIRAY<span className="text-black">.</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-black hover:text-[#800020] transition"
          >
            <Search size={22} />
          </button>

          {/* Wishlist Component */}
          <WishlistButton size={22} />

          {/* Cart */}
          <Link href="/cart" className="relative text-black hover:text-[#800020] transition">
            <ShoppingBag size={22} />
            {cart?.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#800020] text-white text-[10px] rounded-full px-1">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link href="/profile" className="text-black hover:text-[#800020] transition">
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
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm
                       placeholder-gray-500 text-black
                       focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────── MENU DRAWER ───────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col border-r border-gray-300"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                <span className="text-lg font-semibold text-black">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-black hover:text-[#800020] transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col text-black font-medium">
                {[
                  { name: "Home", href: "/" },
                  { name: "Categories", href: "/categories" },
                  { name: "Wishlist", href: "/wishlist" },
                  { name: "Cart", href: "/cart" },
                  { name: "About", href: "/about" },
                  { name: "Contact", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-5 py-3 border-b border-gray-200 hover:bg-gray-100 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Bottom Section */}
              <div className="mt-auto border-t border-gray-300 px-5 py-4">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-black hover:text-[#800020] transition"
                >
                  <User size={18} />
                  <span>My Account</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </header>
  );
}
