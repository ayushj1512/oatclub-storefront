"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images = [] }) {
  const thumbsRef = useRef(null);
  const downRef = useRef({ x: 0, y: 0, t: 0 });

  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const overlayRef = useRef(null);
  const imageAreaRef = useRef(null);

  // swipe (overlay)
  const touch = useRef({ x: 0, y: 0, dx: 0, dy: 0, active: false });

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

  // center active thumb
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

  // smoother overlay: lock scroll + keyboard + focus
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus image area for accessibility
    requestAnimationFrame(() => {
      imageAreaRef.current?.focus?.();
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, go]);

  if (!images.length || !img) return null;

  // open overlay only on real tap/click (not swipe drag)
  const onMainPointerDown = (e) => {
    downRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, t: Date.now() };
  };

  const onMainPointerUp = (e) => {
    const dx = Math.abs((e.clientX ?? 0) - downRef.current.x);
    const dy = Math.abs((e.clientY ?? 0) - downRef.current.y);
    const dt = Date.now() - downRef.current.t;

    if (!dragging && dx < 8 && dy < 8 && dt < 350) {
      setLightboxOpen(true);
    }
  };

  // overlay swipe
  const onOverlayTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, dx: 0, dy: 0, active: true };
  };

  const onOverlayTouchMove = (e) => {
    if (!touch.current.active) return;
    const t = e.touches[0];
    touch.current.dx = t.clientX - touch.current.x;
    touch.current.dy = t.clientY - touch.current.y;
  };

  const onOverlayTouchEnd = () => {
    if (!touch.current.active) return;
    const { dx, dy } = touch.current;
    touch.current.active = false;

    if (Math.abs(dy) > Math.abs(dx)) return;

    const TH = 45; // a bit more sensitive = smoother UX
    if (dx > TH) go(-1);
    else if (dx < -TH) go(1);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* MAIN IMAGE */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-white md:mx-auto md:max-w-[640px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[980px]">
        <div className="relative w-full h-[78vw] min-h-[360px] max-h-[560px] md:h-auto md:aspect-square md:min-h-[520px] lg:min-h-[600px] xl:min-h-[680px] 2xl:min-h-[760px]">
          {/* desktop arrows */}
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100 transition"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-3xl hidden md:block opacity-60 hover:opacity-100 transition"
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
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
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
                whileTap={{ scale: 0.995 }}
              >
                <Image
                  src={img}
                  alt="Product"
                  fill
                  priority
                  draggable={false}
                  className="object-contain p-2 sm:p-3 md:p-6 lg:p-8 select-none cursor-zoom-in"
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
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100 transition"
          aria-label="Scroll thumbnails left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() =>
            thumbsRef.current?.scrollBy({ left: 320, behavior: "smooth" })
          }
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-2xl opacity-50 hover:opacity-100 transition"
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

      {/* FULLSCREEN OVERLAY / LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === overlayRef.current) setLightboxOpen(false);
            }}
            onTouchStart={(e) => {
              if (e.target === overlayRef.current) setLightboxOpen(false);
            }}
          >
            {/* Close (smooth hover/tap) */}
            <motion.button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
              aria-label="Close"
              title="Close"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <X className="text-white" size={22} />
            </motion.button>

            {/* Mobile arrows (visible on mobile; add md:flex if you want also desktop) */}
            {images.length > 1 ? (
              <>
                <motion.button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition md:hidden"
                  aria-label="Previous image"
                  title="Previous"
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -6, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ChevronLeft className="text-white" size={30} />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition md:hidden"
                  aria-label="Next image"
                  title="Next"
                  initial={{ x: 6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 6, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ChevronRight className="text-white" size={30} />
                </motion.button>
              </>
            ) : null}

            {/* Image wrapper */}
            <motion.div
              ref={imageAreaRef}
              tabIndex={-1}
              className="relative w-[92vw] h-[86vh] md:w-[86vw] md:h-[90vh] outline-none"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.stopPropagation();
                onOverlayTouchStart(e);
              }}
              onTouchMove={onOverlayTouchMove}
              onTouchEnd={onOverlayTouchEnd}
              style={{ touchAction: "pan-y" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={img}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Image
                    src={img}
                    alt="Preview"
                    fill
                    priority
                    draggable={false}
                    className="object-contain select-none"
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Desktop overlay arrows inside image area (nice + smooth) */}
              {images.length > 1 ? (
                <div className="hidden md:flex items-center justify-between absolute inset-y-0 left-0 right-0 px-3 pointer-events-none">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
                    aria-label="Previous image"
                    title="Previous"
                  >
                    <ChevronLeft className="text-white" size={34} />
                  </button>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
                    aria-label="Next image"
                    title="Next"
                  >
                    <ChevronRight className="text-white" size={34} />
                  </button>
                </div>
              ) : null}
            </motion.div>

            {/* Counter */}
            {images.length > 1 ? (
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm px-3 py-1 rounded-full bg-white/10"
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 6, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {idx + 1} / {images.length}
              </motion.div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
