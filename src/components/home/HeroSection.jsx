"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";

export default function HeroSection() {
  const { settings, loading, fetchHomepageSettings } =
    useHomepageSettingsStore();

  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const timer = useRef(null);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);
  const isPaused = useRef(false);
  const blockClick = useRef(false);

  useEffect(() => {
    if (!settings && !loading) fetchHomepageSettings();
  }, [settings, loading, fetchHomepageSettings]);

  const banners = useMemo(() => {
    return (settings?.heroBanners || [])
      .filter(
        (b) => b?.isActive && (b?.image || b?.desktopImage || b?.mobileImage)
      )
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [settings]);

  const firstImg =
    banners?.[0]?.image ||
    banners?.[0]?.desktopImage ||
    banners?.[0]?.mobileImage ||
    "";

  useEffect(() => {
    setCurrent(0);
    setLoaded(false);
    if (firstImg) requestAnimationFrame(() => setLoaded(true));
  }, [firstImg]);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
  };

  const start = () => {
    stop();

    if (banners.length > 1 && !isPaused.current) {
      timer.current = setInterval(() => {
        setCurrent((p) => (p + 1) % banners.length);
      }, 5000);
    }
  };

  const next = () => {
    if (banners.length > 1) {
      setCurrent((p) => (p + 1) % banners.length);
    }
  };

  const prev = () => {
    if (banners.length > 1) {
      setCurrent((p) => (p - 1 + banners.length) % banners.length);
    }
  };

  useEffect(() => {
    start();
    return stop;
  }, [banners.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || banners.length <= 1) return;

    const threshold = 50;
    const verticalLimit = 25;

    const onTouchStart = (e) => {
      isPaused.current = true;
      stop();

      blockClick.current = false;
      isSwiping.current = false;

      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      const diffX = startX.current - x;
      const diffY = startY.current - y;

      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > verticalLimit)
        return;

      if (Math.abs(diffX) > 10) {
        isSwiping.current = true;
        blockClick.current = true;
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (!isSwiping.current) {
        isPaused.current = false;
        start();
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const diffX = startX.current - endX;

      if (diffX > threshold) next();
      else if (diffX < -threshold) prev();

      isPaused.current = false;
      start();

      setTimeout(() => {
        blockClick.current = false;
      }, 200);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [banners.length]);

  if (loading && !settings) {
    return (
      <section className="relative w-full overflow-hidden bg-gray-100 pt-[133.33%] md:pt-[41.6667%]">
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full select-none overflow-hidden bg-gray-100 pt-[133.33%] md:pt-[41.6667%]"
      style={{
        touchAction: "pan-y",
      }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      )}

      <div
        className={`absolute inset-0 flex transition-transform duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => {
          const desktopImage = b.desktopImage || b.image || b.mobileImage;
          const mobileImage = b.mobileImage || desktopImage;

          const slide = (
            <div className="relative h-full w-full flex-shrink-0">
              <Image
                src={desktopImage}
                alt={b.title || `Slide ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="hidden object-cover md:block"
                onLoadingComplete={() => i === 0 && setLoaded(true)}
                onError={() => i === 0 && setLoaded(true)}
              />

              <Image
                src={mobileImage}
                alt={b.title || `Slide ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="block object-cover md:hidden"
                onLoadingComplete={() => i === 0 && setLoaded(true)}
                onError={() => i === 0 && setLoaded(true)}
              />
            </div>
          );

          const handleClick = (e) => {
            if (blockClick.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          };

          return b.link ? (
            <Link
              key={b._id || desktopImage || mobileImage || i}
              href={b.link}
              onClick={handleClick}
              className="h-full w-full flex-shrink-0"
            >
              {slide}
            </Link>
          ) : (
            <div
              key={b._id || desktopImage || mobileImage || i}
              className="h-full w-full flex-shrink-0"
            >
              {slide}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl leading-none text-white hover:bg-black/50 sm:flex"
            aria-label="Previous banner"
          >
            &#10094;
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl leading-none text-white hover:bg-black/50 sm:flex"
            aria-label="Next banner"
          >
            &#10095;
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 gap-2 md:flex">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2.5 w-2.5 rounded-full ${
                current === i ? "bg-white" : "bg-white/45"
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}