"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, ChevronUp, ChevronDown } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState(0);

  const reel = reels?.[currentIndex] || null;
  if (!reel) return null;

  const hashtags = reel?.hashtags || [];

  // ---- Product normalization (handles your API shape) ----
  const rawProduct = reel?.product || null;

  const productId =
    rawProduct?.id ||
    rawProduct?._id ||
    rawProduct?.productId ||
    null;

  const productSlug = rawProduct?.slug || null;

  const productName =
    (rawProduct?.name && String(rawProduct.name).trim()) ||
    reel?.title ||
    "View product";

  const productImage =
    (rawProduct?.image && String(rawProduct.image).trim()) ||
    "/placeholder.png";

  const rawPrice = rawProduct?.price;
  const priceNumber =
    typeof rawPrice === "number" ? rawPrice : Number(rawPrice);

  const hasValidPrice =
    Number.isFinite(priceNumber) && priceNumber > 0;

  // ✅ no RAF: nav lock to prevent spam + the React warning
  const navLockRef = useRef(false);

  const goNext = useCallback(() => {
    if (navLockRef.current) return;
    navLockRef.current = true;

    setDirection(1);
    setExpanded(false);

    setCurrentIndex((prev) => Math.min(prev + 1, reels.length - 1));

    window.setTimeout(() => {
      navLockRef.current = false;
    }, 250);
  }, [reels.length, setCurrentIndex]);

  const goPrev = useCallback(() => {
    if (navLockRef.current) return;
    navLockRef.current = true;

    setDirection(-1);
    setExpanded(false);

    setCurrentIndex((prev) => Math.max(prev - 1, 0));

    window.setTimeout(() => {
      navLockRef.current = false;
    }, 250);
  }, [setCurrentIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

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

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    },
    [goNext, goPrev]
  );

  const touchRef = useRef({
    startY: 0,
    startX: 0,
    startT: 0,
    active: false,
  });

  const swipeLockRef = useRef(false);

  const SWIPE_MIN_PX = 55;
  const SWIPE_MAX_X = 80;
  const SWIPE_MIN_VELOCITY = 0.35;

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

      const dy = touchRef.current.startY - t.clientY;
      const dx = Math.abs(touchRef.current.startX - t.clientX);

      if (dx > SWIPE_MAX_X) return;

      const dt = Math.max(1, performance.now() - touchRef.current.startT);
      const velocity = Math.abs(dy) / dt;

      const shouldTrigger =
        Math.abs(dy) >= SWIPE_MIN_PX || velocity >= SWIPE_MIN_VELOCITY;
      if (!shouldTrigger) return;

      swipeLockRef.current = true;
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

  const canNavigateToProduct = Boolean(productSlug && productId);

  const ProductRow = ({ children }) => (
    <div className="px-3 py-2 flex items-center gap-2">{children}</div>
  );

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
        <div className="absolute right-4 bottom-32 flex flex-col gap-5 z-40">
          <button onClick={() => setLiked((v) => !v)} aria-label="Like">
            <div className="p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur">
              <Heart
                size={22}
                className={liked ? "text-red-500 fill-red-500" : "text-white"}
              />
            </div>
          </button>

          <button aria-label="Share">
            <div className="p-2 bg-black/50 rounded-md hover:bg-black/70 transition backdrop-blur">
              <Share2 size={22} className="text-white" />
            </div>
          </button>
        </div>

        {/* ✅ PRODUCT CARD (no borders + price 0 handled) */}
        <div className="absolute bottom-3 left-3 right-3 z-50">
          <motion.div
            layout
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {canNavigateToProduct ? (
              <Link
                href={`/category/products/${productSlug}/${productId}`}
                className="block"
              >
                <ProductRow>
                  <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={productImage}
                      width={45}
                      height={45}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 leading-tight min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">
                      {productName}
                    </p>

                    {/* ✅ Price: hide ₹0 */}
                    {hasValidPrice ? (
                      <p className="text-black font-bold text-[13px]">
                        ₹{priceNumber}
                      </p>
                    ) : (
                      <p className="text-gray-500 font-medium text-[12px]">
                        View price
                      </p>
                    )}
                  </div>

                  <div className="text-black/70 text-lg font-bold pr-1">→</div>
                </ProductRow>
              </Link>
            ) : (
              <div className="px-3 py-3 text-[12px] text-gray-700">
                Product not linked for this reel
              </div>
            )}

            {/* Expand toggle (no border) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setExpanded((v) => !v);
              }}
              className="w-full flex justify-center items-center gap-1 text-[12px] text-gray-600 py-1"
            >
              {expanded ? "Less" : "More"}
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {/* Expand content (no border) */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-3 py-2 max-h-[180px] overflow-y-auto"
                >
                  {reel.caption ? (
                    <p className="text-gray-700 text-[12px] leading-snug mb-2 whitespace-pre-line">
                      {reel.caption}
                    </p>
                  ) : null}

                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-[2px] bg-gray-100 rounded-full text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
