"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const [img, setImg] = useState(images[0]);
  const ref = useRef(null);

  const i = useMemo(() => images.indexOf(img), [images, img]);
  if (!images.length) return null;

  // ✅ next/prev (infinite)
  const go = (dir) => setImg(images[(i + dir + images.length) % images.length]);

  // ✅ auto-scroll active thumb into view
  useEffect(() => ref.current?.children?.[i]?.scrollIntoView({ behavior: "smooth", inline: "center" }), [i]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ✅ MAIN IMAGE (desktop bigger) */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white md:max-w-[520px] lg:max-w-[620px] xl:max-w-[720px] md:mx-auto">
        {/* arrows */}
        <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100">←</button>
        <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100">→</button>

        {/* image + swipe */}
        <AnimatePresence mode="wait">
          <motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => info.offset.x > 60 ? go(-1) : info.offset.x < -60 ? go(1) : null}
              className="relative w-full h-full"
              style={{ touchAction: "pan-y" }}
            >
              <Image src={img} alt="Product" fill priority className="object-contain p-4 select-none" draggable={false} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* dots (mobile) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {images.slice(0, 7).map((x, idx) => (
            <span key={idx} className={`h-1.5 w-1.5 rounded-full ${x === img ? "bg-black" : "bg-black/20"}`} />
          ))}
        </div>
      </div>

      {/* ✅ THUMBNAILS */}
      <div className="relative w-full md:max-w-[520px] lg:max-w-[620px] xl:max-w-[720px] md:mx-auto">
        <button onClick={() => ref.current?.scrollBy({ left: -300, behavior: "smooth" })} className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100">←</button>
        <button onClick={() => ref.current?.scrollBy({ left: 300, behavior: "smooth" })} className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100">→</button>

        <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar px-2 md:px-8 py-2 snap-x snap-mandatory scroll-smooth">
          {images.map((x, idx) => (
            <button
              key={idx}
              onClick={() => setImg(x)}
              className={`relative flex-shrink-0 rounded-xl overflow-hidden snap-start transition
                w-16 h-16 md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px]
                ${x === img ? "ring-2 ring-black opacity-100" : "opacity-60 hover:opacity-100"}
              `}
            >
              <Image src={x} alt={`Thumb ${idx}`} fill className="object-contain p-2 bg-white" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
