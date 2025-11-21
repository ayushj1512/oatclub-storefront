"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, RefreshCcw, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#faf7f8] flex flex-col items-center justify-center px-6 py-16 text-center relative">

      {/* Soft Animated Glow */}
      <motion.div
        initial={{ opacity: 0.3, scale: 0.8 }}
        animate={{
          opacity: [0.3, 0.6, 0.4],
          scale: [0.95, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[380px] h-[380px] bg-[#ffdde6] blur-3xl rounded-full opacity-40 -z-10"
      />

      {/* Floating Ghost Icon */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{
          y: [ -10, 10, -10 ],
          opacity: 1,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center w-28 h-28 rounded-full bg-[#ffe6ee] shadow-inner"
      >
        <Ghost size={60} className="text-[#800020]" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl sm:text-4xl font-bold text-[#2b0004] mt-8"
      >
        Oops… This Page Vanished!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-gray-600 text-sm sm:text-base max-w-md mt-3"
      >
        Looks like this page slipped into the fashion void.  
        But don’t worry — let’s help you get back to something fabulous.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="flex gap-4 mt-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#800020] text-white px-6 py-2 rounded-full shadow hover:bg-[#6a001a] transition-all"
        >
          <ArrowLeft size={16} />
          Go Home
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-2 bg-white border border-[#800020] text-[#800020] px-6 py-2 rounded-full shadow-sm hover:bg-[#f8eaed] transition-all"
        >
          <Search size={16} />
          Browse Products
        </Link>
      </motion.div>

      {/* Reload */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        className="flex items-center gap-2 text-gray-500 text-sm mt-6 hover:text-[#800020] transition"
        onClick={() => window.location.reload()}
      >
        <RefreshCcw size={16} />
        Try Reloading
      </motion.button>

      {/* Bottom Accent */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "80px" }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="h-[3px] bg-[#800020] mt-10 rounded-full"
      />
    </div>
  );
}
