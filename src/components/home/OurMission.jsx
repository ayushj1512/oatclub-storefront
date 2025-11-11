"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function OurMission() {
  return (
    <section className="w-full flex flex-col md:flex-row items-center bg-gray-50 py-16 px-8">
      {/* IMAGE SECTION */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="flex-1 flex justify-center mb-10 md:mb-0"
      >
        <div className="relative w-[90%] md:w-[80%] h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/images/our-mission.jpg"
            alt="Our Mission - Miray Fashions"
            fill
            className="object-cover object-center"
          />
        </div>
      </motion.div>

      {/* TEXT SECTION */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="flex-1 flex flex-col justify-center text-center md:text-left px-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Mission
        </h2>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
          At <span className="font-semibold text-pink-500">Miray Fashions</span>,
          our mission is to redefine luxury fashion by making it accessible,
          sustainable, and proudly made in India. We aim to empower confident
          self-expression through timeless designs crafted with care, quality,
          and love.
        </p>
        <p className="text-gray-600 text-sm md:text-base">
          Every stitch tells a story — from ethically sourced fabrics to the
          artisans who bring our vision to life. Together, we’re shaping the
          future of Indian fashion.
        </p>
      </motion.div>
    </section>
  );
}
