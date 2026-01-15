"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export default function ProductGallery({ images = [] }) {
  const thumbsRef = useRef(null);
  const modalThumbsRef = useRef(null);
  const downRef = useRef({ x: 0, y: 0, t: 0 });

  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  // modal zoom/pan
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

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

  // lock body scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // reset zoom/pan when image changes or modal opens
  useEffect(() => {
    if (!open) return;
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [idx, open]);

  // keyboard nav in modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  // keep active thumb centered (main thumbs)
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;

    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";

    const active = el.children?.[idx];
    if (active && typeof active.offsetLeft === "number") {
      const left =
        active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2;
      el.scrollLeft = left;
    }

    requestAnimationFrame(() => {
      el.style.scrollBehavior = prev || "smooth";
    });
  }, [idx]);

  // keep active thumb centered (modal thumbs)
  useEffect(() => {
    if (!open) return;
    const el = modalThumbsRef.current;
    if (!el) return;

    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";

    const active = el.children?.[idx];
    if (active && typeof active.offsetLeft === "number") {
      const left =
        active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2;
      el.scrollLeft = left;
    }

    requestAnimationFrame(() => {
      el.style.scrollBehavior = prev || "smooth";
    });
  }, [idx, open]);

  if (!images.length || !img) return null;

  const zoomBy = (d) =>
    setScale((s) => clamp(Number((s + d).toFixed(2)), 1, 4));

  const onMainPointerDown = (e) => {
    downRef.current = {
      x: e.clientX ?? 0,
      y: e.clientY ?? 0,
      t: Date.now(),
    };
  };

  const onMainPointerUp = (e) => {
    const dx = Math.abs((e.clientX ?? 0) - downRef.current.x);
    const dy = Math.abs((e.clientY ?? 0) - downRef.current.y);
    const dt = Date.now() - downRef.current.t;
    if (!dragging && dx < 8 && dy < 8 && dt < 350) setOpen(true);
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
                  className="object-contain p-2 sm:p-3 md:p-6 lg:p-8 select-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 640px, (max-width: 1280px) 760px, 980px"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* THUMBS (below main image) */}
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
                className="object-contain p-2 md:p-3 bg-white"
                draggable={false}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* MODAL VIEWER */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            {/* TOP BAR: only counter + zoom (optional), AND top-right cross */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <div className="text-white/80 text-xs sm:text-sm">
                {idx + 1} / {images.length}
              </div>

              <div className="flex items-center gap-2">
                {/* keep zoom buttons for desktop/tablet; hide on very small if you want */}
                <button
                  type="button"
                  onClick={() => zoomBy(-0.25)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm hidden sm:inline-flex"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => zoomBy(0.25)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm hidden sm:inline-flex"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPos({ x: 0, y: 0 });
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm hidden md:inline-flex"
                  aria-label="Reset"
                >
                  Reset
                </button>

                {/* TOP RIGHT CLOSE (always visible) */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-1 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg grid place-items-center"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* desktop arrows only */}
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-4xl text-white/70 hover:text-white hidden md:block"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-4xl text-white/70 hover:text-white hidden md:block"
              aria-label="Next image"
            >
              →
            </button>

            {/* modal content wrapper: image + thumbs BELOW (required) */}
            <div className="w-[94vw] max-w-[1100px] flex flex-col gap-3">
              <motion.div
                className="relative w-full h-[68vh] sm:h-[74vh] rounded-2xl overflow-hidden bg-black/20 shadow-2xl"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                onWheel={(e) => {
                  e.preventDefault();
                  const d = e.deltaY > 0 ? -0.15 : 0.15;
                  setScale((s) => clamp(Number((s + d).toFixed(2)), 1, 4));
                }}
              >
                {/* OUTER: swipe left/right ONLY when scale === 1 */}
                <motion.div
                  className="relative w-full h-full"
                  drag={scale === 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    if (scale !== 1) return;
                    if (info.offset.x > 60) go(-1);
                    else if (info.offset.x < -60) go(1);
                  }}
                  style={{ touchAction: scale === 1 ? "pan-y" : "none" }}
                >
                  {/* INNER: pan ONLY when zoomed */}
                  <motion.div
                    className="relative w-full h-full cursor-grab active:cursor-grabbing"
                    drag={scale > 1}
                    dragMomentum={false}
                    onDrag={(_, info) =>
                      setPos((p) => ({
                        x: p.x + info.delta.x,
                        y: p.y + info.delta.y,
                      }))
                    }
                    onDoubleClick={() => {
                      setScale((s) => (s === 1 ? 2 : 1));
                      setPos({ x: 0, y: 0 });
                    }}
                    style={{
                      scale,
                      x: pos.x,
                      y: pos.y,
                      touchAction: "none",
                    }}
                  >
                    <Image
                      src={img}
                      alt="Viewer"
                      fill
                      priority
                      draggable={false}
                      className="object-contain select-none"
                      sizes="(max-width: 768px) 94vw, 1100px"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* MODAL THUMBS (neeche baaki images) */}
              <div className="relative">
                <div
                  ref={modalThumbsRef}
                  className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-2 snap-x snap-mandatory scroll-smooth"
                >
                  {images.map((x, i) => (
                    <button
                      type="button"
                      key={`modal-${x}-${i}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setIdx(i)}
                      className={`relative shrink-0 rounded-xl overflow-hidden snap-start transition w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${
                        i === idx
                          ? "ring-2 ring-white opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`Select image ${i + 1}`}
                    >
                      <Image
                        src={x}
                        alt={`Modal thumb ${i + 1}`}
                        fill
                        className="object-contain p-2 bg-white"
                        draggable={false}
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* IMPORTANT: mobile prev/next overlay removed (as you asked) */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
