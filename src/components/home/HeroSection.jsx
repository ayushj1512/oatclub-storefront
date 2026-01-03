"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";
// ✅ update path according to your project structure

export default function HeroSection() {
  const { settings, loading, fetchHomepageSettings } =
    useHomepageSettingsStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const slideInterval = useRef(null);

  // Touch vars
  const startX = useRef(0);
  const endX = useRef(0);

  // ✅ Fetch once
  useEffect(() => {
    if (!settings) fetchHomepageSettings();
  }, [settings, fetchHomepageSettings]);

  // ✅ Extract & prepare hero banners safely
  const heroBanners = useMemo(() => {
    const banners = settings?.heroBanners || [];

    return banners
      .filter((b) => b.isActive && b.image) // only active with images
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [settings]);

  // ✅ Reset slide when banners change
  useEffect(() => {
    setCurrentSlide(0);
    setLoaded(false);
  }, [heroBanners.length]);

  // ✅ Autoplay controls
  const startAutoplay = () => {
    stopAutoplay();
    slideInterval.current = setInterval(nextSlide, 5000);
  };

  const stopAutoplay = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroBanners.length) % heroBanners.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // ✅ Touch swipe handlers
  const handleTouchStart = (e) => {
    stopAutoplay();
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    endX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = startX.current - endX.current;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    startAutoplay();
  };

  // ✅ Start autoplay only when banners exist
  useEffect(() => {
    if (heroBanners.length > 1) {
      startAutoplay();
      return () => stopAutoplay();
    }
  }, [heroBanners.length]);

  // ✅ If loading OR no banners, don't render slider
  if (loading && !settings) return null;
  if (!heroBanners.length) return null;

  return (
    <section
      className="relative w-full overflow-hidden touch-pan-y select-none bg-gray-100"
      style={{ paddingTop: "41.67%" }} // ✅ 1920 × 800 ratio
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🔥 SHIMMER */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      )}

      {/* SLIDER */}
      <div
        className={`absolute top-0 left-0 w-full h-full flex transition-transform duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroBanners.map((banner, index) => {
          const slideContent = (
            <div className="w-full h-full flex-shrink-0 relative">
              <Image
                src={banner.image}
                alt={banner.title || `Slide ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover object-center"
                onLoad={() => index === 0 && setLoaded(true)}
              />
            </div>
          );

          // ✅ If banner has link, wrap in Link
          return banner.link ? (
            <Link
              key={index}
              href={banner.link}
              className="w-full h-full flex-shrink-0"
            >
              {slideContent}
            </Link>
          ) : (
            <div key={index} className="w-full h-full flex-shrink-0">
              {slideContent}
            </div>
          );
        })}
      </div>

      {/* LEFT ARROW */}
      {heroBanners.length > 1 && (
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute top-1/2 left-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
        >
          &#10094;
        </button>
      )}

      {/* RIGHT ARROW */}
      {heroBanners.length > 1 && (
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute top-1/2 right-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
        >
          &#10095;
        </button>
      )}

      {/* DOTS */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {heroBanners.map((_, index) => (
            <span
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                currentSlide === index ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
