"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="w-full h-[90vh] flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-white via-gray-50 to-white overflow-hidden">
      {/* Left content */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 gap-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
        >
          Discover Your <span className="text-pink-500">Style</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-gray-600 text-lg md:text-xl"
        >
          Explore the latest trends in fashion, curated exclusively for you by
          Miray Fashions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-row gap-4 mt-4"
        >
          <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl hover:bg-gray-700 transition">
            Shop Now
          </button>
          <button className="border border-gray-900 text-gray-900 px-8 py-3 rounded-2xl hover:bg-gray-100 transition">
            Explore
          </button>
        </motion.div>
      </div>

      {/* Right image */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
          <Image
            src="/hero-fashion.jpg" // place this in /public
            alt="Miray Fashion Hero"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}
