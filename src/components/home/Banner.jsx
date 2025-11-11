"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const banners = [
  {
    title: "Festive Collection 2025",
    subtitle: "Elevate your celebrations with elegance.",
    buttonText: "Explore Now",
    image: "/banners/festive.jpg",
    link: "/categories/festive",
  },
  {
    title: "The Winter Edit",
    subtitle: "Stay warm, stay stylish — new arrivals are here.",
    buttonText: "Shop Winter",
    image: "/banners/winter.jpg",
    link: "/categories/winter",
  },
];

export default function Banner() {
  return (
    <section className="w-full flex flex-col md:flex-row overflow-hidden bg-gray-50 py-10">
      {banners.map((banner, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.7 }}
          className="relative flex-1 flex items-center justify-center cursor-pointer group"
        >
          <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover object-center brightness-90 group-hover:brightness-75 transition-all duration-500"
              priority
            />

            {/* Overlay Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold drop-shadow-md"
              >
                {banner.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl mt-3 text-gray-200"
              >
                {banner.subtitle}
              </motion.p>
              <motion.a
                href={banner.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 inline-block bg-white text-gray-900 px-8 py-3 rounded-2xl font-medium hover:bg-gray-100 transition"
              >
                {banner.buttonText}
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
