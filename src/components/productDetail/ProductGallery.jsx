"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-3">

      {/* MAIN IMAGE */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center md:max-w-[420px] md:mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={selectedImage}
              alt="Product Image"
              fill
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* THUMBNAIL SCROLLER */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-1 md:max-w-[420px] md:mx-auto">
        {images.map((img, index) => {
          const active = selectedImage === img;

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedImage(img)}
              whileTap={{ scale: 0.92 }}
              className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden bg-gray-100 ${active ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain p-1"
              />
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
