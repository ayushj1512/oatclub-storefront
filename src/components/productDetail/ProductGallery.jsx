"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Play,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cleanMedia = (items = []) =>
  Array.from(
    new Set(
      (Array.isArray(items) ? items : [])
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : String(item?.url || "").trim(),
        )
        .filter(Boolean),
    ),
  );

const isVideoUrl = (url = "") =>
  /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url) ||
  String(url).includes("/video/upload/");

function GalleryMedia({
  src,
  index,
  priority = false,
  contain = false,
  lightbox = false,
}) {
  const video = isVideoUrl(src);

  if (video) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload={index === 0 ? "auto" : "metadata"}
        controls={lightbox}
        className={
          lightbox
            ? "max-h-full max-w-full object-contain"
            : `h-full w-full ${contain ? "object-contain" : "object-cover"}`
        }
      />
    );
  }

  if (lightbox) {
    return (
      <img
        src={src}
        alt={`Product image ${index + 1}`}
        draggable={false}
        className="max-h-full max-w-full select-none object-contain"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={`Product image ${index + 1}`}
      fill
      priority={priority}
      sizes="(max-width: 1280px) 100vw, 360px"
      className={`transition duration-500 ${
        contain ? "object-contain" : "object-cover"
      }`}
    />
  );
}

function MediaBadge({ src }) {
  if (!isVideoUrl(src)) return null;

  return (
    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
      <Play className="h-3 w-3 fill-current" />
      Video
    </span>
  );
}

export default function ProductGallery({ images = [] }) {
  const safeMedia = cleanMedia(images);

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mobileRowRef = useRef(null);
  const thumbRef = useRef(null);
  const lightboxRowRef = useRef(null);

  const activeIndex = Math.min(
    active,
    Math.max(0, safeMedia.length - 1),
  );

  const desktopMedia =
    safeMedia.length > 1 ? safeMedia.slice(0, 6) : safeMedia;

  const showMedia = (index) => {
    const next = Math.max(
      0,
      Math.min(index, safeMedia.length - 1),
    );

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
      ?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
  };

  const move = (direction) => {
    if (safeMedia.length < 2) return;

    const next =
      direction === "next"
        ? (activeIndex + 1) % safeMedia.length
        : (activeIndex - 1 + safeMedia.length) %
          safeMedia.length;

    showMedia(next);
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

    if (next !== activeIndex) {
      setActive(next);
    }
  };

  const handleLightboxScroll = () => {
    const row = lightboxRowRef.current;
    if (!row?.clientWidth) return;

    const next = Math.round(row.scrollLeft / row.clientWidth);

    if (next !== activeIndex) {
      setActive(next);
    }
  };

  useEffect(() => {
    setActive(0);
    setLightboxOpen(false);
  }, [images]);

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
  }, [lightboxOpen, activeIndex, safeMedia.length]);

  if (!safeMedia.length) {
    return (
      <div className="w-full">
        <div className="xl:hidden">
          <div className="aspect-[3/4] w-screen animate-pulse bg-neutral-100" />
        </div>

        <div className="hidden grid-cols-2 gap-3 bg-white xl:grid">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-[4/5] animate-pulse bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile gallery */}
      <div className="xl:hidden">
        <div className="relative">
          <div
            ref={mobileRowRef}
            onScroll={handleMobileScroll}
            className="no-scrollbar flex w-screen snap-x snap-mandatory overflow-x-auto scroll-smooth bg-white"
          >
            {safeMedia.map((src, index) => (
              <div
                key={`${src}-mobile-${index}`}
                className="relative aspect-[3/4] w-screen shrink-0 snap-center overflow-hidden bg-white"
              >
                <GalleryMedia
                  src={src}
                  index={index}
                  priority={index === 0}
                />

                <MediaBadge src={src} />

                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="absolute inset-0 z-10"
                  aria-label={`Open product media ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openLightbox(activeIndex)}
            className="absolute bottom-5 right-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/80 text-white shadow-lg backdrop-blur"
            aria-label="Open product media viewer"
          >
            <Expand className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {safeMedia.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => showMedia(index)}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index
                    ? "w-6 bg-black"
                    : "w-1.5 bg-black/25"
                }`}
                aria-label={`View product media ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop gallery */}
      <div className="hidden grid-cols-2 gap-3 bg-white xl:grid">
        {desktopMedia.map((src, index) => (
          <div
            key={`${src}-desktop-${index}`}
            className="group relative aspect-[4/5] overflow-hidden bg-neutral-50"
          >
            <GalleryMedia
              src={src}
              index={index}
              priority={index === 0}
              contain
            />

            <MediaBadge src={src} />

            <button
              type="button"
              onClick={() => openLightbox(index)}
              className="absolute inset-0 z-10"
              aria-label={`Open product media ${index + 1}`}
            />

            <span className="pointer-events-none absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[9999] bg-black text-white"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)] md:px-6">
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 backdrop-blur">
              {activeIndex + 1} / {safeMedia.length}
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black"
              aria-label="Close media viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={lightboxRowRef}
            onScroll={handleLightboxScroll}
            className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {safeMedia.map((src, index) => (
              <div
                key={`${src}-lightbox-${index}`}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3 pb-28 pt-20 md:px-20 md:pb-32"
              >
                <GalleryMedia
                  src={src}
                  index={index}
                  lightbox
                />
              </div>
            ))}
          </div>

          {safeMedia.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => move("prev")}
                className="absolute left-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:grid"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => move("next")}
                className="absolute right-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:grid"
                aria-label="Next media"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-xl md:px-6">
            <div
              ref={thumbRef}
              className="no-scrollbar mx-auto flex max-w-5xl justify-start gap-2 overflow-x-auto scroll-smooth md:justify-center"
            >
              {safeMedia.map((src, index) => (
                <button
                  key={`${src}-thumb-${index}`}
                  type="button"
                  data-thumb={index}
                  onClick={() => showMedia(index)}
                  className={`relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md border transition md:w-16 ${
                    activeIndex === index
                      ? "border-white opacity-100"
                      : "border-white/10 opacity-45 hover:opacity-100"
                  }`}
                  aria-label={`View product media ${index + 1}`}
                >
                  {isVideoUrl(src) ? (
                    <>
                      <video
                        src={src}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute inset-0 grid place-items-center bg-black/15">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </span>
                    </>
                  ) : (
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}