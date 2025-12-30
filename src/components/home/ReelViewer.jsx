"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function ReelViewer({
  reels = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onClose = () => {},
}) {
  const [liked, setLiked] = useState(false);
  const reel = reels[currentIndex] || null;

  // direction for animation
  const [direction, setDirection] = useState(0);

  // --- prevent render-phase update warnings by deferring updates ---
  const scheduleRef = useRef({ raf: 0, queued: false });

  const scheduleIndexUpdate = useCallback((fn) => {
    // If we get called multiple times rapidly, only schedule one per frame.
    if (scheduleRef.current.queued) return;

    scheduleRef.current.queued = true;
    scheduleRef.current.raf = window.requestAnimationFrame(() => {
      scheduleRef.current.queued = false;
      fn();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scheduleRef.current.raf) cancelAnimationFrame(scheduleRef.current.raf);
    };
  }, []);

  const goNext = useCallback(() => {
    scheduleIndexUpdate(() => {
      setCurrentIndex((prev) => {
        if (prev < reels.length - 1) {
          setDirection(1);
          return prev + 1;
        }
        return prev;
      });
    });
  }, [reels.length, setCurrentIndex, scheduleIndexUpdate]);

  const goPrev = useCallback(() => {
    scheduleIndexUpdate(() => {
      setCurrentIndex((prev) => {
        if (prev > 0) {
          setDirection(-1);
          return prev - 1;
        }
        return prev;
      });
    });
  }, [setCurrentIndex, scheduleIndexUpdate]);

  /* Disable scroll on page while viewer open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  // Keyboard helpers (optional)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  /* Wheel */
  const wheelLockRef = useRef(false);
  const handleWheel = useCallback(
    (e) => {
      if (wheelLockRef.current) return;

      const dy = e.deltaY || 0;
      if (dy > 40) {
        wheelLockRef.current = true;
        goNext();
      } else if (dy < -40) {
        wheelLockRef.current = true;
        goPrev();
      }

      if (wheelLockRef.current) {
        window.setTimeout(() => {
          wheelLockRef.current = false;
        }, 450);
      }
    },
    [goNext, goPrev]
  );

  /**
   * ✅ Swipe up/down:
   * - works on mobile swipes
   * - ignores mostly-horizontal gestures
   * - lock prevents multiple navigations per swipe
   */
  const touchRef = useRef({
    startY: 0,
    startX: 0,
    startT: 0,
    active: false,
  });

  const swipeLockRef = useRef(false);

  const SWIPE_MIN_PX = 55;
  const SWIPE_MAX_X = 80;
  const SWIPE_MIN_VELOCITY = 0.35; // px/ms

  const handleTouchStart = useCallback((e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = {
      startY: t.clientY,
      startX: t.clientX,
      startT: performance.now(),
      active: true,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchRef.current.active) return;
      if (swipeLockRef.current) return;

      const t = e.touches?.[0];
      if (!t) return;

      const dy = touchRef.current.startY - t.clientY; // + = swipe up, - = swipe down
      const dx = Math.abs(touchRef.current.startX - t.clientX);

      // ignore horizontal gestures
      if (dx > SWIPE_MAX_X) return;

      const dt = Math.max(1, performance.now() - touchRef.current.startT);
      const velocity = Math.abs(dy) / dt;

      const shouldTrigger = Math.abs(dy) >= SWIPE_MIN_PX || velocity >= SWIPE_MIN_VELOCITY;
      if (!shouldTrigger) return;

      swipeLockRef.current = true;

      // stop browser scroll/overscroll
      e.preventDefault?.();

      if (dy > 0) goNext();
      else goPrev();

      window.setTimeout(() => {
        swipeLockRef.current = false;
      }, 450);
    },
    [goNext, goPrev]
  );

  const handleTouchEnd = useCallback(() => {
    touchRef.current.active = false;
  }, []);

  /* Reel slide variants */
  const slideVariants = useMemo(
    () => ({
      enter: (dir) => ({
        y: dir === 1 ? "100%" : "-100%",
        opacity: 0,
        position: "absolute",
        width: "100%",
        height: "100%",
      }),
      center: {
        y: 0,
        opacity: 1,
        position: "absolute",
        width: "100%",
        height: "100%",
      },
      exit: (dir) => ({
        y: dir === 1 ? "-100%" : "100%",
        opacity: 0,
        position: "absolute",
        width: "100%",
        height: "100%",
      }),
    }),
    []
  );

  if (!reel) return null;

return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/95 z-[9999] flex justify-center items-center"
    onWheel={handleWheel}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    onTouchCancel={handleTouchEnd}
    style={{ touchAction: "none" }}
  >
    {/* CLOSE */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition z-50"
      aria-label="Close"
    >
      <X size={22} />
    </button>

    {/* WRAPPER */}
    <div className="relative w-full max-w-sm h-full overflow-hidden flex items-center justify-center select-none">
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={reel.src}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <video
            src={reel.src}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-auto object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {/* RIGHT ACTIONS */}
      <div className="absolute right-4 bottom-40 flex flex-col gap-6 z-40">
        <button onClick={() => setLiked((v) => !v)} aria-label="Like">
          <div className="p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur">
            <Heart
              size={24}
              className={
                liked ? "text-red-500 fill-red-500" : "text-white"
              }
            />
          </div>
        </button>

        <button aria-label="Share">
          <div className="p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur">
            <Share2 size={24} className="text-white" />
          </div>
        </button>
      </div>

      {/* PRODUCT CARD */}
      <Link
        href={`/category/products/${reel.product.slug}/${reel.product.id}`}
        className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-3 flex flex-col gap-2 z-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 bg-gray-100 rounded-md overflow-hidden flex justify-center items-center">
            <Image
              src={reel.product.image}
              width={60}
              height={60}
              alt={reel.product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col flex-1 leading-tight">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {reel.product.name}
            </p>
            <p className="text-black font-semibold text-sm">
              ₹{reel.product.price}
            </p>
          </div>

          <div className="text-black/70 text-xl font-semibold pr-1">
            →
          </div>
        </div>

        <p className="text-gray-800 text-xs leading-snug">
          {reel.caption}
        </p>
        <p className="text-gray-500 text-[10px]">
          {reel.hashtags?.join(" ")}
        </p>
      </Link>
    </div>
  </motion.div>
);

}
