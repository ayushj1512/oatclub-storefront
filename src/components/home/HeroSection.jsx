"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";

export default function HeroSection() {
  const { settings, loading, fetchHomepageSettings } = useHomepageSettingsStore();
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef(null);

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

    // ✅ cached image fix (Next/Image sometimes doesn't fire onLoadingComplete)
    if (firstImg) requestAnimationFrame(() => setLoaded(true));
  }, [firstImg]);

  const stop = () => timer.current && clearInterval(timer.current);
  const next = () => banners.length > 1 && setCurrent((p) => (p + 1) % banners.length);
  const prev = () => banners.length > 1 && setCurrent((p) => (p - 1 + banners.length) % banners.length);

  // ✅ autoplay
  useEffect(() => {
    stop();
    if (banners.length > 1) timer.current = setInterval(next, 5000);
    return stop;
  }, [banners.length]);

  // ✅ loading shimmer
  if (loading && !settings) {
    return (
      <section className="relative w-full bg-gray-100 overflow-hidden" style={{ paddingTop: "41.67%" }}>
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gray-100" style={{ paddingTop: "41.67%" }}>
      {/* ✅ Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      )}

      {/* ✅ Slider */}
      <div
        className={`absolute inset-0 flex transition-transform duration-700 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => {
          const slide = (
            <div className="w-full h-full flex-shrink-0 relative">
              <Image
                key={b.image} // ✅ VERY IMPORTANT (forces remount)
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

          return b.link ? (
            <Link key={b._id || b.image || i} href={b.link} className="w-full h-full flex-shrink-0">
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
          <button onClick={prev} className="hidden sm:flex absolute top-1/2 left-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20">
            &#10094;
          </button>
          <button onClick={next} className="hidden sm:flex absolute top-1/2 right-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20">
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
              className={`w-3 h-3 rounded-full cursor-pointer ${current === i ? "bg-white" : "bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
