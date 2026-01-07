"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const ref = useRef(null);

  // ✅ Fix: initial image should be set on first render
  const [img, setImg] = useState(() => images?.[0] || null);

  // ✅ Fix: keep img valid ONLY when needed (avoid flicker / blank)
  useEffect(() => {
    if (!images?.length) {
      setImg(null);
      return;
    }

    setImg((prev) => {
      // if prev exists and is still inside images, keep it
      if (prev && images.includes(prev)) return prev;
      // else set first one
      return images[0];
    });
  }, [images]);

  // ✅ current index
  const i = useMemo(() => {
    if (!img) return 0;
    const idx = images.indexOf(img);
    return idx === -1 ? 0 : idx;
  }, [images, img]);

  // ✅ scroll active thumb safely
  useEffect(() => {
    if (!images.length || !ref.current) return;
    const el = ref.current.children?.[i];
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [i, images.length]);

  // ✅ guard
  if (!images.length || !img) return null;

  const go = (dir) => {
    setImg(images[(i + dir + images.length) % images.length]);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ✅ Main Image */}
      <div className="relative aspect-square min-h-[320px] rounded-2xl overflow-hidden bg-white md:max-w-[520px] lg:max-w-[620px] xl:max-w-[720px] md:mx-auto">
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
                className="object-contain p-4 select-none"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ Thumbnails */}
      <div className="relative w-full md:max-w-[520px] lg:max-w-[620px] xl:max-w-[720px] md:mx-auto">
        <button
          type="button"
          onClick={() =>
            ref.current?.scrollBy({ left: -300, behavior: "smooth" })
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() =>
            ref.current?.scrollBy({ left: 300, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
        >
          →
        </button>

        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto no-scrollbar px-2 md:px-8 py-2 snap-x snap-mandatory scroll-smooth"
        >
          {images.map((x, idx) => (
            <button
              type="button"
              key={x} // ✅ Fix: stable key
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImg(x)}
              className={`relative shrink-0 rounded-xl overflow-hidden snap-start transition
                w-16 h-16 md:w-20 md:h-20 lg:w-[90px] lg:h-[90px]
                ${x === img ? "ring-2 ring-black opacity-100" : "opacity-60 hover:opacity-100"}
              `}
            >
              <Image
                src={x}
                alt={`Thumb ${idx}`}
                fill
                className="object-contain p-2 bg-white"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
