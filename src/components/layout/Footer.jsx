"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col bg-gray-900 text-gray-200 py-10 px-8 mt-16">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Logo + Info */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            MIRAY<span className="text-pink-500">.</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            Redefining fashion with elegance and modern style. Discover curated collections that inspire confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Quick Links</h3>
          <Link href="/" className="hover:text-pink-400">Home</Link>
          <Link href="/categories" className="hover:text-pink-400">Shop</Link>
          <Link href="/about" className="hover:text-pink-400">About Us</Link>
          <Link href="/contact" className="hover:text-pink-400">Contact</Link>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Support</h3>
          <Link href="/faq" className="hover:text-pink-400">FAQs</Link>
          <Link href="/shipping" className="hover:text-pink-400">Shipping</Link>
          <Link href="/returns" className="hover:text-pink-400">Returns</Link>
          <Link href="/privacy" className="hover:text-pink-400">Privacy Policy</Link>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Follow Us</h3>
          <div className="flex flex-row gap-4">
            <a href="#" className="hover:text-pink-400"><Instagram /></a>
            <a href="#" className="hover:text-pink-400"><Facebook /></a>
            <a href="#" className="hover:text-pink-400"><Twitter /></a>
            <a href="mailto:info@mirayfashions.com" className="hover:text-pink-400"><Mail /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Miray Fashions. All rights reserved.
      </div>
    </footer>
  );
}
