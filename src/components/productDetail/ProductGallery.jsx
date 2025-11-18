"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={selectedImage}
              alt="Product Image"
              fill
              className="object-cover object-center transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Row */}
      <div className="flex gap-3 justify-center md:justify-start overflow-x-auto scrollbar-hide">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition ${
              selectedImage === img
                ? "border-pink-500 shadow-md"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
