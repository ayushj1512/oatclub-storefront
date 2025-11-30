"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ReelViewer({
  reels = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onClose = () => {},
}) {
  const [liked, setLiked] = useState(false);
  const reel = reels[currentIndex] || null;

  /* Disable scroll on page while viewer open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  if (!reel) return null;

  /* Track direction for slide animation */
  const [direction, setDirection] = useState(0);

  const goNext = () => {
    if (currentIndex < reels.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  /* Scroll change */
  const handleScroll = (e) => {
    if (e.deltaY > 40) goNext();
    if (e.deltaY < -40) goPrev();
  };

  /* Mobile swipe */
  let startY = 0;
  const handleTouchStart = (e) => (startY = e.touches[0].clientY);
  const handleTouchMove = (e) => {
    const diff = startY - e.touches[0].clientY;
    if (diff > 60) goNext();
    if (diff < -60) goPrev();
  };

  /* Reel slide variants (Instagram-like) */
  const slideVariants = {
    enter: (direction) => ({
      y: direction === 1 ? "100%" : "-100%",
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
    exit: (direction) => ({
      y: direction === 1 ? "-100%" : "100%",
      opacity: 0,
      position: "absolute",
      width: "100%",
      height: "100%",
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 z-[9999] flex justify-center items-center"
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 bg-black/40 rounded-full hover:bg-black/60 transition z-50"
      >
        <X size={22} />
      </button>

      {/* SLIDE WRAPPER */}
      <div className="relative w-full max-w-sm h-full overflow-hidden flex items-center justify-center select-none">

        {/* ANIMATE PRESENCE FOR REEL SLIDE */}
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

        {/* RIGHT ACTION BUTTONS */}
        <div className="absolute right-4 bottom-40 flex flex-col gap-6 z-40">
          <button onClick={() => setLiked(!liked)}>
            <div className="p-2 bg-black/40 rounded-md hover:bg-black/60 transition">
              <Heart
                size={24}
                className={liked ? "text-red-500 fill-red-500" : "text-white"}
              />
            </div>
          </button>

          <button>
            <div className="p-2 bg-black/40 rounded-md hover:bg-black/60 transition">
              <Share2 size={24} className="text-white" />
            </div>
          </button>
        </div>

        {/* PRODUCT CARD */}
        <Link
          href={`/products/${reel.product.slug}/${reel.product.id}`}
          className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-3 flex flex-col gap-2 z-50"
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
              <p className="text-[#800020] font-semibold text-sm">
                ₹{reel.product.price}
              </p>
            </div>

            <div className="text-[#800020] text-xl font-semibold pr-1">→</div>
          </div>

          <p className="text-gray-800 text-xs leading-snug">{reel.caption}</p>
          <p className="text-gray-500 text-[10px]">{reel.hashtags?.join(" ")}</p>
        </Link>
      </div>
    </motion.div>
  );
}
