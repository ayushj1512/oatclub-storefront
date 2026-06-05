"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProductGallery({ images = [] }) {
  const safeImages = images.filter(Boolean).map(String);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mobileRowRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const activeIndex = Math.min(active, safeImages.length - 1);
  const current = safeImages[activeIndex] || safeImages[0];
  const desktopImages = safeImages.length > 1 ? safeImages.slice(0, 6) : safeImages;

  const showImage = (index) => {
    setActive(index);
    const row = mobileRowRef.current;
    if (row) row.scrollTo({ left: row.clientWidth * index, behavior: "smooth" });
  };

  const move = (direction) => {
    const next =
      direction === "next"
        ? (activeIndex + 1) % safeImages.length
        : (activeIndex - 1 + safeImages.length) % safeImages.length;
    showImage(next);
  };

  const openLightbox = (index) => {
    setActive(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const handleMobileScroll = () => {
    const row = mobileRowRef.current;
    if (!row?.clientWidth) return;
    const next = Math.round(row.scrollLeft / row.clientWidth);
    if (next !== activeIndex) setActive(Math.max(0, Math.min(next, safeImages.length - 1)));
  };

  const handleLightboxTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLightboxTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch || safeImages.length < 2) return;

    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    if (Math.abs(diffX) < 42 || Math.abs(diffX) < Math.abs(diffY)) return;

    move(diffX < 0 ? "next" : "prev");
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") move("next");
      if (event.key === "ArrowLeft") move("prev");
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, lightboxOpen]);

  if (!safeImages.length) return null;

  return (
    <div className="w-full">
      <div className="md:hidden">
        <div
          ref={mobileRowRef}
          onScroll={handleMobileScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth bg-white"
        >
          {safeImages.map((src, index) => (
            <button
              key={`${src}-mobile-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-white"
              aria-label={`OPEN PRODUCT IMAGE ${index + 1}`}
            >
              <Image
                src={src}
                alt={`PRODUCT IMAGE ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-contain"
              />
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {safeImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => showImage(index)}
                className={`h-1.5 transition-all ${
                  activeIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/20"
                }`}
                aria-label={`VIEW PRODUCT IMAGE ${index + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="inline-flex items-center gap-2 border border-black px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-black"
          >
            <Expand className="h-3 w-3" />
            VIEW
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {safeImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => showImage(index)}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden border bg-white ${
                activeIndex === index ? "border-black" : "border-transparent opacity-55"
              }`}
              aria-label={`VIEW PRODUCT IMAGE ${index + 1}`}
            >
              <Image
                src={src}
                alt={`PRODUCT THUMBNAIL ${index + 1}`}
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-2 gap-3 bg-white md:grid">
        {desktopImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/5] overflow-hidden bg-white"
            aria-label={`OPEN PRODUCT IMAGE ${index + 1}`}
          >
            <Image
              src={src}
              alt={`PRODUCT IMAGE ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1280px) 28vw, 360px"
              className="object-contain transition duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center border border-black/10 bg-white/90 text-black opacity-0 transition group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[90] bg-white text-black"
          role="dialog"
          aria-modal="true"
          aria-label="PRODUCT IMAGE VIEWER"
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <div className="absolute left-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-10 text-[10px] font-black uppercase tracking-[0.22em] text-black/50 md:left-6 md:top-6">
            {String(activeIndex + 1).padStart(2, "0")} / {String(safeImages.length).padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-3 top-[calc(env(safe-area-inset-top,0px)+0.55rem)] z-20 grid h-11 w-11 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:right-6 md:top-6 md:h-10 md:w-10"
            aria-label="CLOSE IMAGE VIEWER"
          >
            <X className="h-5 w-5 md:h-4 md:w-4" />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move("prev")}
                className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:grid md:left-6"
                aria-label="PREVIOUS IMAGE"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => move("next")}
                className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:grid md:right-6"
                aria-label="NEXT IMAGE"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="flex h-full w-full items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] pt-[calc(env(safe-area-inset-top,0px)+4rem)] md:px-20 md:py-16">
            <div className="relative h-full w-full">
              <Image
                src={current}
                alt={`PRODUCT IMAGE ${activeIndex + 1}`}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 md:hidden">
            <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
              <button
                type="button"
                onClick={() => move("prev")}
                disabled={safeImages.length < 2}
                className="grid h-11 place-items-center border border-black/15 text-black disabled:opacity-25"
                aria-label="PREVIOUS IMAGE"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white"
              >
                <X className="h-4 w-4" />
                CLOSE
              </button>
              <button
                type="button"
                onClick={() => move("next")}
                disabled={safeImages.length < 2}
                className="grid h-11 place-items-center border border-black/15 text-black disabled:opacity-25"
                aria-label="NEXT IMAGE"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[8px] font-black uppercase tracking-[0.18em] text-black/35">
              SWIPE TO BROWSE
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
