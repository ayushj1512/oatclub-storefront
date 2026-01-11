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
      {/* MAIN IMAGE (BIGGER ON DESKTOP) */}
      <div
        className="
          relative aspect-square
          min-h-80 md:min-h-[520px] lg:min-h-[600px] xl:min-h-[680px] 2xl:min-h-[760px]
          rounded-2xl overflow-hidden bg-white
          w-full
          md:max-w-[640px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[980px]
          md:mx-auto
        "
      >
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100"
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100"
          aria-label="Next image"
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
                className="object-contain p-4 md:p-6 lg:p-8 select-none"
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 640px, (max-width: 1280px) 760px, 980px"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* THUMBNAILS (ALSO A BIT BIGGER ON DESKTOP) */}
      <div
        className="
          relative w-full
          md:max-w-[640px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[980px]
          md:mx-auto
        "
      >
        <button
          type="button"
          onClick={() => ref.current?.scrollBy({ left: -320, behavior: "smooth" })}
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
          aria-label="Scroll thumbnails left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => ref.current?.scrollBy({ left: 320, behavior: "smooth" })}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
          aria-label="Scroll thumbnails right"
        >
          →
        </button>

        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto no-scrollbar px-2 md:px-10 py-2 snap-x snap-mandatory scroll-smooth"
        >
          {images.map((x, i) => (
            <button
              type="button"
              key={`${x}-${i}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIdx(i)}
              className={`
                relative shrink-0 rounded-xl overflow-hidden snap-start transition
                w-16 h-16 md:w-24 md:h-24 lg:w-[110px] lg:h-[110px] xl:w-[120px] xl:h-[120px]
                ${i === idx ? "ring-2 ring-black opacity-100" : "opacity-60 hover:opacity-100"}
              `}
              aria-label={`Select image ${i + 1}`}
            >
              <Image
                src={x}
                alt={`Thumb ${i + 1}`}
                fill
                className="object-contain p-2 md:p-3 bg-white"
                draggable={false}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
