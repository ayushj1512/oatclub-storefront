"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ZoomIn, ZoomOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProductGallery({ images = [] }) {
  const safeImages = images.filter(Boolean).map(String);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const mobileRowRef = useRef(null);
  const mobileThumbRef = useRef(null);
  const lightboxStageRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const activeIndex = Math.min(active, safeImages.length - 1);
  const current = safeImages[activeIndex] || safeImages[0];
  const desktopImages = safeImages.length > 1 ? safeImages.slice(0, 6) : safeImages;
  const zoomed = zoomLevel > 1;

  const resetZoom = () => {
    setZoomLevel(1);
    requestAnimationFrame(() => {
      const stage = lightboxStageRef.current;
      if (!stage) return;
      stage.scrollTo({
        left: Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2),
        top: Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2),
        behavior: "auto",
      });
    });
  };

  const setZoom = (nextLevel) => {
    const next = Math.max(1, Math.min(3, nextLevel));
    setZoomLevel(next);
    requestAnimationFrame(() => {
      const stage = lightboxStageRef.current;
      if (!stage) return;
      stage.scrollTo({
        left: Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2),
        top: Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2),
        behavior: "smooth",
      });
    });
  };

  const showImage = (index) => {
    setActive(index);
    const row = mobileRowRef.current;
    if (row) row.scrollTo({ left: row.clientWidth * index, behavior: "smooth" });
    const thumb = mobileThumbRef.current?.querySelector(`[data-thumb="${index}"]`);
    thumb?.scrollIntoView?.({ behavior: "smooth", inline: "center", block: "nearest" });
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
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setZoomLevel(1);
    setLightboxOpen(false);
  };

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
    if (zoomed) return;
    const touch = event.changedTouches?.[0];
    if (!touch || safeImages.length < 2) return;

    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    if (Math.abs(diffX) < 42 || Math.abs(diffX) < Math.abs(diffY)) return;

    move(diffX < 0 ? "next" : "prev");
  };

  const toggleZoom = () => setZoom(zoomLevel >= 2.4 ? 1 : zoomLevel === 1 ? 1.8 : 2.6);

  const handleStagePointerDown = (event) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleStagePointerUp = (event) => {
    const diffX = event.clientX - pointerStartRef.current.x;
    const diffY = event.clientY - pointerStartRef.current.y;
    if (Math.hypot(diffX, diffY) > 10) return;
    toggleZoom();
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") {
        resetZoom();
        move("next");
      }
      if (event.key === "ArrowLeft") {
        resetZoom();
        move("prev");
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, lightboxOpen]);

  if (!safeImages.length) {
    return (
      <div className="w-full" aria-label="Product gallery loading">
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
              aria-label={`OPEN PRODUCT IMAGE ${index + 1}`}
            >
              <Image
                src={src}
                alt={`PRODUCT IMAGE ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-3">
            <div className="flex items-end justify-end gap-3">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="pointer-events-auto grid h-11 w-11 shrink-0 place-items-center border border-black/10 bg-white/92 text-black shadow-[0_12px_26px_rgba(0,0,0,0.16)] backdrop-blur"
                aria-label="OPEN PRODUCT IMAGE VIEWER"
              >
                <Expand className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex justify-center gap-1.5">
              {safeImages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => showImage(index)}
                  className={`pointer-events-auto h-1.5 transition-all ${
                    activeIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/25"
                  }`}
                  aria-label={`VIEW PRODUCT IMAGE ${index + 1}`}
                />
              ))}
            </div>
          </div>
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
          className="fixed inset-0 z-[90] bg-black/88 text-white backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="PRODUCT IMAGE VIEWER"
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <div className="absolute left-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 text-[10px] font-black uppercase tracking-[0.22em] text-white/55 md:left-6">
            {String(activeIndex + 1).padStart(2, "0")} / {String(safeImages.length).padStart(2, "0")}
          </div>

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-30 grid h-11 w-11 place-items-center bg-white text-black transition hover:bg-neutral-200 md:right-6"
            aria-label="CLOSE IMAGE VIEWER"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-20 hidden -translate-x-1/2 items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setZoom(zoomLevel - 0.5)}
              disabled={zoomLevel <= 1}
              className="grid h-10 w-10 place-items-center bg-white/12 text-white backdrop-blur transition hover:bg-white/22 disabled:opacity-30"
              aria-label="ZOOM OUT"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(zoomLevel + 0.5)}
              disabled={zoomLevel >= 3}
              className="grid h-10 w-10 place-items-center bg-white/12 text-white backdrop-blur transition hover:bg-white/22 disabled:opacity-30"
              aria-label="ZOOM IN"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  resetZoom();
                  move("prev");
                }}
                className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center bg-white/12 text-white backdrop-blur transition hover:bg-white/24 md:grid"
                aria-label="PREVIOUS IMAGE"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => {
                  resetZoom();
                  move("next");
                }}
                className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center bg-white/12 text-white backdrop-blur transition hover:bg-white/24 md:grid"
                aria-label="NEXT IMAGE"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="flex h-full w-full items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0px)+6.75rem)] pt-[calc(env(safe-area-inset-top,0px)+4.25rem)] md:px-20 md:pb-28 md:pt-20">
            <div
              role="button"
              tabIndex={0}
              onPointerDown={handleStagePointerDown}
              onPointerUp={handleStagePointerUp}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") toggleZoom();
              }}
              className={`relative h-full w-full ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              aria-label={zoomed ? "ZOOM OUT PRODUCT IMAGE" : "ZOOM IN PRODUCT IMAGE"}
            >
              <div
                ref={lightboxStageRef}
                className={`h-full w-full overscroll-contain ${
                  zoomed ? "overflow-auto touch-pan-x touch-pan-y" : "overflow-hidden"
                }`}
              >
                <div
                  className="flex min-h-full min-w-full items-center justify-center"
                  style={{
                    width: zoomed ? `${zoomLevel * 100}%` : "100%",
                    height: zoomed ? `${zoomLevel * 100}%` : "100%",
                  }}
                >
                  <img
                    src={current}
                    alt={`PRODUCT IMAGE ${activeIndex + 1}`}
                    className="max-h-full max-w-full select-none object-contain"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-black/45 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 backdrop-blur-md md:px-6">
            <div className="mb-3 flex items-center justify-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setZoom(zoomLevel - 0.5)}
                disabled={zoomLevel <= 1}
                className="grid h-10 w-10 place-items-center bg-white/12 text-white disabled:opacity-30"
                aria-label="ZOOM OUT"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <div className="flex h-10 min-w-20 items-center justify-center bg-white/10 text-[9px] font-black uppercase tracking-[0.18em] text-white/65">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                type="button"
                onClick={() => setZoom(zoomLevel + 0.5)}
                disabled={zoomLevel >= 3}
                className="grid h-10 w-10 place-items-center bg-white/12 text-white disabled:opacity-30"
                aria-label="ZOOM IN"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={mobileThumbRef}
              className="no-scrollbar mx-auto flex max-w-4xl gap-2 overflow-x-auto scroll-smooth pb-1"
            >
              {safeImages.map((src, index) => (
                <button
                  key={`${src}-lightbox-thumb-${index}`}
                  type="button"
                  data-thumb={index}
                  onClick={() => {
                    resetZoom();
                    showImage(index);
                  }}
                  className={`relative aspect-[4/5] w-12 shrink-0 overflow-hidden transition md:w-16 ${
                    activeIndex === index ? "ring-2 ring-white" : "opacity-55 hover:opacity-100"
                  }`}
                  aria-label={`VIEW IMAGE ${index + 1}`}
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
