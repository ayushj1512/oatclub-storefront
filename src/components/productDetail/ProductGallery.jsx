"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const scrollRef = useRef(null);

  const selectedIndex = useMemo(
    () => images.findIndex((img) => img === selectedImage),
    [images, selectedImage]
  );

  if (!images.length) return null;

  const scrollThumbnails = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  // ✅ INFINITE PREV
  const goPrev = () => {
    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  // ✅ INFINITE NEXT
  const goNext = () => {
    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  // ✅ auto scroll selected thumb into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.children[selectedIndex];
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedIndex]);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* MAIN IMAGE */}
      <div
        className="relative w-full aspect-square rounded-2xl overflow-hidden 
        bg-white flex items-center justify-center md:max-w-[460px] md:mx-auto"
      >
        {/* LEFT ARROW (MAIN IMAGE) */}
        <button
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-2xl 
          transition opacity-60 hover:opacity-100"
        >
          ←
        </button>

        {/* RIGHT ARROW (MAIN IMAGE) */}
        <button
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-2xl 
          transition opacity-60 hover:opacity-100"
        >
          →
        </button>

        {/* MAIN IMAGE DISPLAY */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={selectedImage}
                alt="Product Image"
                fill
                priority
                className="object-contain p-4"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* THUMBNAILS */}
      <div className="relative md:max-w-[460px] md:mx-auto w-full">

        {/* LEFT ARROW (THUMBNAILS) */}
        <button
          onClick={() => scrollThumbnails("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-xl 
          opacity-50 hover:opacity-100 transition"
        >
          ←
        </button>

        {/* THUMBNAILS SCROLL */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar 
          px-6 py-2 scroll-smooth snap-x snap-mandatory"
        >
          {images.map((img, index) => {
            const active = selectedImage === img;

            return (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(img)}
                whileTap={{ scale: 0.92 }}
                className={`relative flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] 
                  rounded-xl overflow-hidden transition-all snap-start
                  ${active ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-2 bg-white"
                />
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT ARROW (THUMBNAILS) */}
        <button
          onClick={() => scrollThumbnails("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-xl 
          opacity-50 hover:opacity-100 transition"
        >
          →
        </button>
      </div>

    </div>
  );
}
