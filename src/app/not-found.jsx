"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center bg-white text-gray-900 relative overflow-hidden">

      {/* Soft Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[450px] h-[450px] bg-[#800020] blur-[180px] opacity-20 rounded-full"></div>
      </div>

      {/* Animated 404 Number */}
      <motion.h1
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-7xl sm:text-9xl font-extrabold tracking-tight"
      >
        <motion.span
          animate={{ 
            textShadow: [
              "0 0 10px rgba(128,0,32,0.5)",
              "0 0 25px rgba(128,0,32,0.8)",
              "0 0 10px rgba(128,0,32,0.5)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          404
        </motion.span>
      </motion.h1>

      {/* NOT FOUND Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-4 text-lg sm:text-xl font-medium tracking-wide text-gray-600"
      >
        Not Found
      </motion.p>

      {/* Floating subtle animation */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 sm:bottom-24 text-sm text-gray-400"
      >
        This page doesn’t exist.
      </motion.div>

      {/* Home Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 mt-12"
      >
        <Link
          href="/"
          className="
            px-8 py-3 rounded-full 
            bg-[#800020] text-white text-sm font-semibold 
            shadow-md hover:bg-[#65001b] 
            transition-all duration-300
          "
        >
          Go Back Home
        </Link>
      </motion.div>

      {/* Animated background lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="w-full h-px bg-gray-200/20 absolute"
            style={{ top: `${i * 7}%` }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </section>
  );
}
