"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Heart, User } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full flex flex-col bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full flex flex-row items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          MIRAY<span className="text-pink-500">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-row gap-8 text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Icons */}
        <div className="flex flex-row items-center gap-4">
          <Link href="/wishlist">
            <Heart className="w-5 h-5 text-gray-700 hover:text-pink-500 transition" />
          </Link>
          <Link href="/cart">
            <ShoppingBag className="w-5 h-5 text-gray-700 hover:text-pink-500 transition" />
          </Link>
          <Link href="/profile">
            <User className="w-5 h-5 text-gray-700 hover:text-pink-500 transition" />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 hover:text-pink-500 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="flex flex-col md:hidden bg-white border-t border-gray-100 text-gray-700 font-medium">
          {["Home", "Categories", "Wishlist", "About", "Contact"].map(
            (item, idx) => (
              <Link
                key={idx}
                href={`/${item.toLowerCase() === "home" ? "" : item.toLowerCase()}`}
                className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
