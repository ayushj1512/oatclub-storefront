"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProductGallery({ images = [] }) {
  const safeImages = images.filter(Boolean).map(String);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mobileRowRef = useRef(null);

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

  const handleMobileScroll = () => {
    const row = mobileRowRef.current;
    if (!row?.clientWidth) return;
    const next = Math.round(row.scrollLeft / row.clientWidth);
    if (next !== activeIndex) setActive(Math.max(0, Math.min(next, safeImages.length - 1)));
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
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
        <div className="fixed inset-0 z-[90] bg-white text-black">
          <div className="absolute left-3 top-3 z-10 text-[10px] font-black uppercase tracking-[0.22em] text-black/50 md:left-6 md:top-6">
            {String(activeIndex + 1).padStart(2, "0")} / {String(safeImages.length).padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:right-6 md:top-6"
            aria-label="CLOSE IMAGE VIEWER"
          >
            <X className="h-4 w-4" />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move("prev")}
                className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:left-6"
                aria-label="PREVIOUS IMAGE"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => move("next")}
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:right-6"
                aria-label="NEXT IMAGE"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="flex h-full w-full items-center justify-center px-4 py-16 md:px-20">
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
        </div>
      )}
    </div>
  );
}
