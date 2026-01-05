"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const scrollRef = useRef(null);

  const selectedIndex = useMemo(() => images.findIndex((img) => img === selectedImage), [images, selectedImage]);

  if (!images.length) return null;

  const scrollThumbnails = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
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
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedIndex]);

  // ✅ swipe threshold (tweak if needed)
  const SWIPE_DISTANCE = 60;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* MAIN IMAGE */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white flex items-center justify-center md:max-w-[460px] md:mx-auto">
        {/* LEFT ARROW (MAIN IMAGE) */}
        <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-2xl transition opacity-60 hover:opacity-100 hidden md:block">
          ←
        </button>

        {/* RIGHT ARROW (MAIN IMAGE) */}
        <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-2xl transition opacity-60 hover:opacity-100 hidden md:block">
          →
        </button>

        {/* ✅ MAIN IMAGE DISPLAY WITH SWIPE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            {/* ✅ Swipe layer */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x > SWIPE_DISTANCE) goPrev();
                if (info.offset.x < -SWIPE_DISTANCE) goNext();
              }}
              className="relative w-full h-full"
              style={{ touchAction: "pan-y" }} // ✅ important for mobile swipe
            >
              <Image src={selectedImage} alt="Product Image" fill priority className="object-contain p-4 select-none" draggable={false} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ✅ Mobile hint dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {images.slice(0, 7).map((img, i) => {
            const active = img === selectedImage;
            return <span key={i} className={`h-1.5 w-1.5 rounded-full ${active ? "bg-black" : "bg-black/20"}`} />;
          })}
        </div>
      </div>

      {/* THUMBNAILS */}
      <div className="relative md:max-w-[460px] md:mx-auto w-full">
        {/* LEFT ARROW (THUMBNAILS) */}
        <button onClick={() => scrollThumbnails("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-xl opacity-50 hover:opacity-100 transition hidden md:block">
          ←
        </button>

        {/* THUMBNAILS SCROLL */}
        <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto no-scrollbar px-2 md:px-6 py-2 scroll-smooth snap-x snap-mandatory">
          {images.map((img, index) => {
            const active = selectedImage === img;

            return (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(img)}
                whileTap={{ scale: 0.92 }}
                className={`relative flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden transition-all snap-start ${active ? "ring-2 ring-black opacity-100" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-contain p-2 bg-white select-none" draggable={false} />
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT ARROW (THUMBNAILS) */}
        <button onClick={() => scrollThumbnails("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-xl opacity-50 hover:opacity-100 transition hidden md:block">
          →
        </button>
      </div>
    </div>
  );
}
