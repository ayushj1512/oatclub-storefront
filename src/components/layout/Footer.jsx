"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Facebook, Instagram, Twitter, Mail, ChevronDown, ChevronUp } from "lucide-react";

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (section) => setOpenSection((p) => (p === section ? null : section));
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="w-full bg-black text-gray-300 pt-10 px-6 md:px-12 mt-16">
      {/* 🖥️ Desktop Layout */}
      <div className="hidden md:grid grid-cols-4 gap-10 max-w-7xl mx-auto">
        {/* Logo + Info */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-white">MIRAY<span className="text-[#800020]">.</span></h2>
          <p className="text-gray-400 text-sm max-w-sm">Redefining fashion with elegance and modern style. Discover curated collections that inspire confidence.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Quick Links</h3>
          <Link href="/" className="hover:text-[#800020]">Home</Link>
          <Link href="/categories" className="hover:text-[#800020]">Shop</Link>
          <Link href="/about" className="hover:text-[#800020]">About Us</Link>
          <Link href="/contact" className="hover:text-[#800020]">Contact</Link>
        </div>

        {/* Support (updated links) */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Support</h3>
          <Link href="/support" className="hover:text-[#800020]">Support</Link>
          <Link href="/faq" className="hover:text-[#800020]">FAQs</Link>
          <Link href="/shipping-policy" className="hover:text-[#800020]">Shipping Policy</Link>
          <Link href="/exchange-and-return" className="hover:text-[#800020]">Exchange & Return</Link>
          <Link href="/privacy-policy" className="hover:text-[#800020]">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-[#800020]">Terms & Conditions</Link>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Follow Us</h3>
          <div className="flex flex-row gap-4">
            <a href="#" className="hover:text-[#800020]" aria-label="Instagram"><Instagram /></a>
            <a href="#" className="hover:text-[#800020]" aria-label="Facebook"><Facebook /></a>
            <a href="#" className="hover:text-[#800020]" aria-label="Twitter"><Twitter /></a>
            <a href="mailto:info@mirayfashions.com" className="hover:text-[#800020]" aria-label="Email"><Mail /></a>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Layout */}
      <div className="md:hidden flex flex-col gap-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">MIRAY<span className="text-[#800020]">.</span></h2>
          <p className="text-gray-400 text-sm max-w-xs">Redefining fashion with elegance and modern style. Discover curated collections that inspire confidence.</p>
        </div>

        {/* Expandable Sections */}
        <div className="divide-y divide-gray-800 border-t border-b border-gray-800">
          {/* Quick Links */}
          <div>
            <button onClick={() => toggleSection("quick")} className="w-full flex justify-between items-center py-3 text-left text-white">
              <span className="text-lg font-semibold">Quick Links</span>
              {openSection === "quick" ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSection === "quick" && (
              <div className="flex flex-col gap-2 pb-3 pl-2 text-gray-400">
                <Link href="/" className="hover:text-[#800020]">Home</Link>
                <Link href="/categories" className="hover:text-[#800020]">Shop</Link>
                <Link href="/about" className="hover:text-[#800020]">About Us</Link>
                <Link href="/contact" className="hover:text-[#800020]">Contact</Link>
              </div>
            )}
          </div>

          {/* Support (updated links) */}
          <div>
            <button onClick={() => toggleSection("support")} className="w-full flex justify-between items-center py-3 text-left text-white">
              <span className="text-lg font-semibold">Support</span>
              {openSection === "support" ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSection === "support" && (
              <div className="flex flex-col gap-2 pb-3 pl-2 text-gray-400">
                <Link href="/support" className="hover:text-[#800020]">Support</Link>
                <Link href="/faq" className="hover:text-[#800020]">FAQs</Link>
                <Link href="/shipping-policy" className="hover:text-[#800020]">Shipping Policy</Link>
                <Link href="/exchange-and-return" className="hover:text-[#800020]">Exchange & Return</Link>
                <Link href="/privacy-policy" className="hover:text-[#800020]">Privacy Policy</Link>
                <Link href="/terms-and-conditions" className="hover:text-[#800020]">Terms & Conditions</Link>
              </div>
            )}
          </div>

          {/* Social */}
          <div>
            <button onClick={() => toggleSection("social")} className="w-full flex justify-between items-center py-3 text-left text-white">
              <span className="text-lg font-semibold">Follow Us</span>
              {openSection === "social" ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSection === "social" && (
              <div className="flex flex-row justify-start gap-4 pb-4 pl-2 text-gray-200">
                <a href="#" className="hover:text-[#800020]" aria-label="Instagram"><Instagram /></a>
                <a href="#" className="hover:text-[#800020]" aria-label="Facebook"><Facebook /></a>
                <a href="#" className="hover:text-[#800020]" aria-label="Twitter"><Twitter /></a>
                <a href="mailto:info@mirayfashions.com" className="hover:text-[#800020]" aria-label="Email"><Mail /></a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar (no hydration warning) */}
      <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        © {year} Miray Fashions. All rights reserved.
      </div>
    </footer>
  );
}
