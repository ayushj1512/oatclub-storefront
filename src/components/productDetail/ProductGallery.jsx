"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProductGallery({ images = [] }) {
  const safeImages = images.filter(Boolean).map(String);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mobileRowRef = useRef(null);
  const thumbRef = useRef(null);
  const lightboxRowRef = useRef(null);

  const activeIndex = Math.min(active, safeImages.length - 1);
  const desktopImages = safeImages.length > 1 ? safeImages.slice(0, 6) : safeImages;

  const showImage = (index) => {
    const next = Math.max(0, Math.min(index, safeImages.length - 1));
    setActive(next);

    mobileRowRef.current?.scrollTo({
      left: mobileRowRef.current.clientWidth * next,
      behavior: "smooth",
    });

    lightboxRowRef.current?.scrollTo({
      left: lightboxRowRef.current.clientWidth * next,
      behavior: "smooth",
    });

    thumbRef.current
      ?.querySelector(`[data-thumb="${next}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const move = (dir) => {
    if (safeImages.length < 2) return;
    const next =
      dir === "next"
        ? (activeIndex + 1) % safeImages.length
        : (activeIndex - 1 + safeImages.length) % safeImages.length;

    showImage(next);
  };

  const openLightbox = (index) => {
    setActive(index);
    setLightboxOpen(true);

    requestAnimationFrame(() => {
      lightboxRowRef.current?.scrollTo({
        left: lightboxRowRef.current.clientWidth * index,
        behavior: "auto",
      });
    });
  };

  const closeLightbox = () => setLightboxOpen(false);

  const handleMobileScroll = () => {
    const row = mobileRowRef.current;
    if (!row?.clientWidth) return;
    const next = Math.round(row.scrollLeft / row.clientWidth);
    if (next !== activeIndex) setActive(next);
  };

  const handleLightboxScroll = () => {
    const row = lightboxRowRef.current;
    if (!row?.clientWidth) return;
    const next = Math.round(row.scrollLeft / row.clientWidth);
    if (next !== activeIndex) setActive(next);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") move("next");
      if (e.key === "ArrowLeft") move("prev");
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, activeIndex]);

  if (!safeImages.length) {
    return (
      <div className="w-full">
        <div className="md:hidden">
          <div className="aspect-[3/4] w-screen animate-pulse bg-neutral-100" />
        </div>

        <div className="hidden grid-cols-2 gap-3 bg-white md:grid">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="aspect-[4/5] animate-pulse bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MOBILE GALLERY */}
      <div className="md:hidden">
        <div className="relative">
          <div
            ref={mobileRowRef}
            onScroll={handleMobileScroll}
            className="no-scrollbar flex w-screen snap-x snap-mandatory overflow-x-auto scroll-smooth bg-white"
          >
            {safeImages.map((src, index) => (
              <button
                key={`${src}-mobile-${index}`}
                type="button"
                onClick={() => openLightbox(index)}
                className="relative aspect-[3/4] w-screen shrink-0 snap-center bg-white"
              >
                <Image
                  src={src}
                  alt={`Product image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openLightbox(activeIndex)}
            className="absolute bottom-5 right-4 grid h-11 w-11 place-items-center rounded-full bg-black/80 text-white shadow-lg backdrop-blur"
            aria-label="Open image viewer"
          >
            <Expand className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {safeImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => showImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP GALLERY */}
      <div className="hidden grid-cols-2 gap-3 bg-white md:grid">
        {desktopImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/5] overflow-hidden bg-neutral-50"
          >
            <Image
              src={src}
              alt={`Product image ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1280px) 28vw, 360px"
              className="object-contain transition duration-500 group-hover:scale-[1.02]"
            />

            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      {/* LIGHTROOM STYLE LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black text-white"
          role="dialog"
          aria-modal="true"
        >
          {/* TOP BAR */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)] md:px-6">
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 backdrop-blur">
              {activeIndex + 1} / {safeImages.length}
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white hover:text-black"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MAIN SLIDER */}
          <div
            ref={lightboxRowRef}
            onScroll={handleLightboxScroll}
            className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {safeImages.map((src, index) => (
              <div
                key={`${src}-lightbox-${index}`}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3 pb-28 pt-20 md:px-20 md:pb-32"
              >
                <img
                  src={src}
                  alt={`Product image ${index + 1}`}
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                />
              </div>
            ))}
          </div>

          {/* DESKTOP ARROWS */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move("prev")}
                className="absolute left-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:grid"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => move("next")}
                className="absolute right-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:grid"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* BOTTOM THUMBNAILS */}
          <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-xl md:px-6">
            <div
              ref={thumbRef}
              className="no-scrollbar mx-auto flex max-w-5xl justify-start gap-2 overflow-x-auto scroll-smooth md:justify-center"
            >
              {safeImages.map((src, index) => (
                <button
                  key={`${src}-thumb-${index}`}
                  type="button"
                  data-thumb={index}
                  onClick={() => showImage(index)}
                  className={`relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md border transition md:w-16 ${
                    activeIndex === index
                      ? "border-white opacity-100"
                      : "border-white/10 opacity-45 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}