"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroSection() {
  const slides = [
    "https://res.cloudinary.com/djtva6hec/image/upload/v1766311125/miray/media/vleq2qgmftsgidh7pfwl.jpg",
    "https://res.cloudinary.com/djtva6hec/image/upload/v1766311124/miray/media/mghrhltk92tavkrzkpo9.jpg",
    "https://res.cloudinary.com/djtva6hec/image/upload/v1766311123/miray/media/u7bf5werxsmgfhdoucdg.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false); // 🔥 shimmer control
  const slideInterval = useRef(null);

  // Touch vars
  const startX = useRef(0);
  const endX = useRef(0);

  const startAutoplay = () => {
    slideInterval.current = setInterval(nextSlide, 5000);
  };

  const stopAutoplay = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

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

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden touch-pan-y select-none bg-gray-100"
      style={{ paddingTop: "46.92%" }} // fixed aspect ratio (no CLS)
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🔥 SHIMMER PLACEHOLDER */}
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
        {slides.map((src, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0} // 🔥 LCP optimized
              className="object-cover object-center"
              onLoad={() => index === 0 && setLoaded(true)}
            />
          </div>
        ))}
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute top-1/2 left-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
      >
        &#10094;
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute top-1/2 right-4 -translate-y-1/2 text-white text-3xl bg-black/30 p-2 rounded-full hover:bg-black/50 z-20"
      >
        &#10095;
      </button>

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <span
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
