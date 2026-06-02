"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function ProductGallery({ images = [] }) {
  const thumbsRef = useRef(null);
  const downRef = useRef({ x: 0, y: 0, t: 0 });

  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const overlayRef = useRef(null);
  const imageAreaRef = useRef(null);

  // zoom / pan (overlay)
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const panRef = useRef({ active: false, sx: 0, sy: 0, bx: 0, by: 0 });
  const touchRef = useRef({
    mode: "none", // "swipe" | "pan" | "pinch"
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    pinchStartDist: 0,
    pinchStartScale: 1,
    pinchMid: { x: 0, y: 0 },
    base: { x: 0, y: 0 },
  });

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

  const resetZoom = useCallback(() => setZoom({ scale: 1, x: 0, y: 0 }), []);

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

  // overlay: lock scroll + keyboard + focus
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        resetZoom();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        resetZoom();
        go(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => imageAreaRef.current?.focus?.());

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, go, resetZoom]);

  // reset zoom when image changes or overlay closes
  useEffect(() => {
    if (lightboxOpen) resetZoom();
  }, [idx, lightboxOpen, resetZoom]);

  if (!images.length || !img) return null;

  // open overlay only on real tap/click (not swipe drag)
  const onMainPointerDown = (e) => {
    downRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0, t: Date.now() };
  };

  const onMainPointerUp = (e) => {
    const dx = Math.abs((e.clientX ?? 0) - downRef.current.x);
    const dy = Math.abs((e.clientY ?? 0) - downRef.current.y);
    const dt = Date.now() - downRef.current.t;

    if (!dragging && dx < 8 && dy < 8 && dt < 350) setLightboxOpen(true);
  };

  // ===== Overlay zoom/pan handlers =====
  const setScaleAroundPoint = useCallback((nextScale, px, py) => {
    setZoom((z) => {
      const scale = clamp(nextScale, 1, 4);
      if (scale === 1) return { scale: 1, x: 0, y: 0 };

      // zoom towards pointer (px,py are in container coords)
      const cx = px - (imageAreaRef.current?.getBoundingClientRect().width || 0) / 2;
      const cy = py - (imageAreaRef.current?.getBoundingClientRect().height || 0) / 2;

      const ratio = scale / z.scale;
      const x = (z.x - cx) * ratio + cx;
      const y = (z.y - cy) * ratio + cy;

      return { scale, x, y };
    });
  }, []);

  const onWheel = (e) => {
    if (!lightboxOpen) return;
    e.preventDefault();

    const rect = imageAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const delta = -e.deltaY; // up => zoom in
    const factor = delta > 0 ? 1.08 : 0.92;

    setZoom((z) => {
      const nextScale = clamp(z.scale * factor, 1, 4);
      if (nextScale === 1) return { scale: 1, x: 0, y: 0 };

      const cx = px - rect.width / 2;
      const cy = py - rect.height / 2;

      const ratio = nextScale / z.scale;
      const x = (z.x - cx) * ratio + cx;
      const y = (z.y - cy) * ratio + cy;

      return { scale: nextScale, x, y };
    });
  };

  const onDoubleClick = (e) => {
    const rect = imageAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setZoom((z) => {
      if (z.scale > 1) return { scale: 1, x: 0, y: 0 };
      // jump to 2x (feel free to change)
      return (() => {
        const nextScale = 2;
        const cx = px - rect.width / 2;
        const cy = py - rect.height / 2;
        const ratio = nextScale / 1;
        const x = (0 - cx) * ratio + cx;
        const y = (0 - cy) * ratio + cy;
        return { scale: nextScale, x, y };
      })();
    });
  };

  const onPointerDownOverlay = (e) => {
    e.stopPropagation();
    // pan only when zoomed
    if (zoom.scale <= 1) return;

    panRef.current = {
      active: true,
      sx: e.clientX,
      sy: e.clientY,
      bx: zoom.x,
      by: zoom.y,
    };
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMoveOverlay = (e) => {
    if (!panRef.current.active) return;
    const dx = e.clientX - panRef.current.sx;
    const dy = e.clientY - panRef.current.sy;

    setZoom((z) => ({ ...z, x: panRef.current.bx + dx, y: panRef.current.by + dy }));
  };

  const onPointerUpOverlay = () => {
    panRef.current.active = false;
  };

  // touch pinch + swipe
  const dist2 = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const mid2 = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

  const onTouchStart = (e) => {
    e.stopPropagation();
    if (!imageAreaRef.current) return;

    if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const rect = imageAreaRef.current.getBoundingClientRect();
      const m = mid2(t1, t2);

      touchRef.current = {
        ...touchRef.current,
        mode: "pinch",
        pinchStartDist: dist2(t1, t2),
        pinchStartScale: zoom.scale,
        pinchMid: { x: m.x - rect.left, y: m.y - rect.top },
        base: { x: zoom.x, y: zoom.y },
      };
      return;
    }

    const t = e.touches[0];
    touchRef.current = { ...touchRef.current, mode: zoom.scale > 1 ? "pan" : "swipe", x: t.clientX, y: t.clientY, dx: 0, dy: 0 };
  };

  const onTouchMove = (e) => {
    if (!imageAreaRef.current) return;

    if (touchRef.current.mode === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const rect = imageAreaRef.current.getBoundingClientRect();

      const nextScale = clamp(
        (dist2(t1, t2) / (touchRef.current.pinchStartDist || 1)) * touchRef.current.pinchStartScale,
        1,
        4
      );

      // scale around pinch midpoint
      const px = touchRef.current.pinchMid.x;
      const py = touchRef.current.pinchMid.y;

      setZoom((z) => {
        const prevScale = touchRef.current.pinchStartScale;
        const base = touchRef.current.base;
        if (nextScale === 1) return { scale: 1, x: 0, y: 0 };

        const cx = px - rect.width / 2;
        const cy = py - rect.height / 2;

        const ratio = nextScale / prevScale;
        const x = (base.x - cx) * ratio + cx;
        const y = (base.y - cy) * ratio + cy;

        return { scale: nextScale, x, y };
      });
      return;
    }

    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current.dx = dx;
    touchRef.current.dy = dy;

    if (touchRef.current.mode === "pan" && zoom.scale > 1) {
      e.preventDefault();
      setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
      touchRef.current.x = t.clientX;
      touchRef.current.y = t.clientY;
    }
  };

  const onTouchEnd = () => {
    const { mode, dx, dy } = touchRef.current;
    touchRef.current.mode = "none";

    // swipe navigation only when not zoomed
    if (mode !== "swipe" || zoom.scale > 1) return;
    if (Math.abs(dy) > Math.abs(dx)) return;

    const TH = 45;
    if (dx > TH) go(-1);
    else if (dx < -TH) go(1);
  };

 return (
  <div className="flex w-full flex-col gap-3">
    {/* MAIN IMAGE - FIXED 4:5 */}
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#f7f7f7]">
      <div className="relative aspect-[4/5] w-full">
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-xl shadow-sm backdrop-blur transition hover:bg-white md:block"
          aria-label="Previous image"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-xl shadow-sm backdrop-blur transition hover:bg-white md:block"
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
            className="relative h-full w-full"
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
              className="relative h-full w-full"
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
                className="cursor-zoom-in select-none object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 42vw"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    {/* THUMBS - 4:5 COVER */}
    <div className="relative w-full">
      <div
        ref={thumbsRef}
        className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth py-1"
      >
        {images.map((x, i) => (
          <button
            type="button"
            key={`${x}-${i}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIdx(i)}
            className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] transition md:w-20 lg:w-22 ${
              i === idx
                ? "ring-2 ring-black opacity-100"
                : "opacity-55 hover:opacity-100"
            }`}
            aria-label={`Select image ${i + 1}`}
          >
            <Image
              src={x}
              alt={`Thumb ${i + 1}`}
              fill
              draggable={false}
              className="object-cover object-center"
              sizes="96px"
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
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
          <motion.button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
            aria-label="Close"
            title="Close"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <X className="text-white" size={22} />
          </motion.button>

          {images.length > 1 ? (
            <>
              <motion.button
                type="button"
                onClick={() => {
                  resetZoom();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
                aria-label="Previous image"
                title="Previous"
              >
                <ChevronLeft className="text-white" size={34} />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  resetZoom();
                  go(1);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 transition hover:bg-white/20 active:scale-95"
                aria-label="Next image"
                title="Next"
              >
                <ChevronRight className="text-white" size={34} />
              </motion.button>
            </>
          ) : null}

          <motion.div
            ref={imageAreaRef}
            tabIndex={-1}
            className="relative h-[88vh] w-[94vw] overflow-hidden outline-none md:h-[90vh] md:w-[82vw]"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
            onWheel={onWheel}
            onDoubleClick={onDoubleClick}
            onPointerDown={onPointerDownOverlay}
            onPointerMove={onPointerMoveOverlay}
            onPointerUp={onPointerUpOverlay}
            onPointerCancel={onPointerUpOverlay}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              touchAction: "none",
              cursor: zoom.scale > 1 ? "grab" : "zoom-in",
            }}
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
                <motion.div
                  className="absolute inset-0"
                  style={{
                    transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                    transformOrigin: "center",
                    willChange: "transform",
                  }}
                >
                  <Image
                    src={img}
                    alt="Preview"
                    fill
                    priority
                    draggable={false}
                    className="pointer-events-none select-none object-contain"
                    sizes="100vw"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {images.length > 1 ? (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90"
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
