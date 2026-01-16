"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductGallery({ images = [] }) {
  const thumbsRef = useRef(null);
  const downRef = useRef({ x: 0, y: 0, t: 0 });

  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (idx > images.length - 1) setIdx(0);
  }, [idx, images.length]);

  const img = useMemo(() => images[idx] || null, [images, idx]);

  const go = useCallback(
    (d) => {
      if (!images.length) return;
      setIdx((p) => (p + d + images.length) % images.length);
    },
    [images.length]
  );

  // keep active thumb centered
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;

    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";

    const active = el.children?.[idx];
    if (active && typeof active.offsetLeft === "number") {
      el.scrollLeft =
        active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2;
    }

    requestAnimationFrame(() => {
      el.style.scrollBehavior = prev || "smooth";
    });
  }, [idx]);

  if (!images.length || !img) return null;

  const onMainPointerDown = (e) => {
    downRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, t: Date.now() };
  };

  const onMainPointerUp = (e) => {
    const dx = Math.abs((e.clientX ?? 0) - downRef.current.x);
    const dy = Math.abs((e.clientY ?? 0) - downRef.current.y);
    const dt = Date.now() - downRef.current.t;
    // no modal now — just keep tap/click noop (or you can add your own action here)
    if (!dragging && dx < 8 && dy < 8 && dt < 350) return;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* MAIN IMAGE */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-white md:mx-auto md:max-w-[640px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[980px]">
        <div className="relative w-full h-[78vw] min-h-[360px] max-h-[560px] md:h-auto md:aspect-square md:min-h-[520px] lg:min-h-[600px] xl:min-h-[680px] 2xl:min-h-[760px]">
          {/* desktop arrows only */}
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
                onDragStart={() => setDragging(true)}
                onDragEnd={(_, info) => {
                  setDragging(false);
                  if (info.offset.x > 60) go(-1);
                  else if (info.offset.x < -60) go(1);
                }}
                className="relative w-full h-full"
                style={{ touchAction: "pan-y" }}
                onPointerDown={onMainPointerDown}
                onPointerUp={onMainPointerUp}
              >
                <Image
                  src={img}
                  alt="Product"
                  fill
                  priority
                  draggable={false}
                  className="object-contain p-2 sm:p-3 md:p-6 lg:p-8 select-none"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 640px, (max-width: 1280px) 760px, 980px"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* THUMBS */}
      <div className="relative w-full md:max-w-[640px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[980px] md:mx-auto">
        <button
          type="button"
          onClick={() =>
            thumbsRef.current?.scrollBy({ left: -320, behavior: "smooth" })
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
          aria-label="Scroll thumbnails left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() =>
            thumbsRef.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100"
          aria-label="Scroll thumbnails right"
        >
          →
        </button>

        <div
          ref={thumbsRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-2 md:px-10 py-2 snap-x snap-mandatory scroll-smooth"
        >
          {images.map((x, i) => (
            <button
              type="button"
              key={`${x}-${i}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIdx(i)}
              className={`relative shrink-0 rounded-xl overflow-hidden snap-start transition w-16 h-16 md:w-24 md:h-24 lg:w-[110px] lg:h-[110px] xl:w-[120px] xl:h-[120px] ${
                i === idx
                  ? "ring-2 ring-black opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Select image ${i + 1}`}
            >
              <Image
                src={x}
                alt={`Thumb ${i + 1}`}
                fill
                draggable={false}
                className="object-contain p-2 md:p-3 bg-white"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
