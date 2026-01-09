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

  // ✅ touch swipe refs
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);
  const isPaused = useRef(false);
  const blockClick = useRef(false);

  // ✅ fetch once only
  useEffect(() => {
    if (!settings && !loading) fetchHomepageSettings();
  }, [settings, loading, fetchHomepageSettings]);

  // ✅ banners
  const banners = useMemo(() => {
    return (settings?.heroBanners || [])
      .filter((b) => b?.isActive && b?.image)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [settings]);

  const firstImg = banners?.[0]?.image || "";

  // ✅ reset only when first banner image changes
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
    if (banners.length > 1)
      setCurrent((p) => (p + 1) % banners.length);
  };

  const prev = () => {
    if (banners.length > 1)
      setCurrent((p) => (p - 1 + banners.length) % banners.length);
  };

  // ✅ autoplay
  useEffect(() => {
    start();
    return stop;
  }, [banners.length]);

  // ✅ TOUCH HANDLERS (native, works 100%)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || banners.length <= 1) return;

    const threshold = 50; // swipe distance
    const verticalLimit = 25; // ignore if scrolling vertically

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

      // ✅ if user is scrolling vertically, do nothing
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > verticalLimit)
        return;

      // ✅ horizontal swipe detected
      if (Math.abs(diffX) > 10) {
        isSwiping.current = true;
        blockClick.current = true;
        e.preventDefault(); // ✅ IMPORTANT (needs passive:false)
      }
    };

    const onTouchEnd = (e) => {
      if (!isSwiping.current) {
        // resume autoplay
        isPaused.current = false;
        start();
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const diffX = startX.current - endX;

      if (diffX > threshold) next();
      else if (diffX < -threshold) prev();

      // ✅ resume autoplay
      isPaused.current = false;
      start();

      // ✅ allow click again after swipe
      setTimeout(() => {
        blockClick.current = false;
      }, 200);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false }); // ✅ must be false
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [banners.length]);

  // ✅ loading shimmer
  if (loading && !settings) {
    return (
      <section
        className="relative w-full bg-gray-100 overflow-hidden"
        style={{ paddingTop: "41.67%" }}
      >
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
      className="relative w-full overflow-hidden bg-gray-100 select-none"
      style={{
        paddingTop: "41.67%",
        touchAction: "pan-y", // ✅ allows vertical scroll but enables horizontal swipe
      }}
    >
      {/* ✅ Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      )}

      {/* ✅ Slider */}
      <div
        className={`absolute inset-0 flex transition-transform duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => {
          const slide = (
            <div className="w-full h-full flex-shrink-0 relative">
              <Image
                key={b.image}
                src={b.image}
                alt={b.title || `Slide ${i + 1}`}
                fill
                priority={i === 0}
                className="object-cover"
                onLoadingComplete={() => i === 0 && setLoaded(true)}
                onError={() => i === 0 && setLoaded(true)}
              />
            </div>
          );

          // ✅ block Link click if user swiped
          const handleClick = (e) => {
            if (blockClick.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          };

          return b.link ? (
            <Link
              key={b._id || b.image || i}
              href={b.link}
              onClick={handleClick}
              className="w-full h-full flex-shrink-0"
            >
              {slide}
            </Link>
          ) : (
            <div key={b._id || b.image || i} className="w-full h-full flex-shrink-0">
              {slide}
            </div>
          );
        })}
      </div>

      {/* ✅ arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute top-1/2 left-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
          >
            &#10094;
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute top-1/2 right-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
          >
            &#10095;
          </button>
        </>
      )}

      {/* ✅ dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                current === i ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
