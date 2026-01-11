"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx > images.length - 1) setIdx(0);
  }, [images.length, idx]);

  const img = useMemo(() => images[idx] || null, [images, idx]);

  useEffect(() => {
    const el = ref.current?.children?.[idx];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [idx]);

  if (!images.length || !img) return null;

  const go = (d) => setIdx((p) => (p + d + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* MAIN IMAGE – BALANCED DESKTOP SIZE */}
      <div
        className="
          relative aspect-square min-h-80
          rounded-2xl overflow-hidden bg-white
          w-full
          md:w-[640px]
          lg:w-[720px]
          xl:w-[800px]
          2xl:w-[860px]
        "
      >
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100"
        >
          →
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) =>
                info.offset.x > 60 ? go(-1) : info.offset.x < -60 ? go(1) : null
              }
              className="relative w-full h-full"
              style={{ touchAction: "pan-y" }}
            >
              <Image
                src={img}
                alt="Product"
                fill
                priority
                className="object-contain p-4 md:p-6 select-none"
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 640px, (max-width: 1280px) 720px, (max-width: 1536px) 800px, 860px"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* THUMBNAILS */}
      <div
        className="
          relative w-full
          md:w-[640px]
          lg:w-[720px]
          xl:w-[800px]
          2xl:w-[860px]
        "
      >
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto no-scrollbar px-2 py-2 snap-x snap-mandatory scroll-smooth"
        >
          {images.map((x, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative shrink-0 rounded-xl overflow-hidden
                w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
                ${i === idx ? "ring-2 ring-black" : "opacity-60 hover:opacity-100"}`}
            >
              <Image
                src={x}
                alt=""
                fill
                className="object-contain p-2 bg-white"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
