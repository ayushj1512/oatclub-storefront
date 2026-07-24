"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";

import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";

/* =========================================================
   CONSTANTS
========================================================= */

const IMAGE_AUTOPLAY_DELAY = 5000;
const MOBILE_BREAKPOINT = 768;

/* =========================================================
   HELPERS
========================================================= */

const sortActiveBanners = (items = []) =>
  [...(Array.isArray(items) ? items : [])]
    .filter(
      (banner) =>
        banner?.isActive !== false &&
        String(banner?.image || "").trim()
    )
    .sort(
      (firstBanner, secondBanner) =>
        Number(firstBanner?.sortOrder || 0) -
        Number(secondBanner?.sortOrder || 0)
    );

const isVideoUrl = (url = "") => {
  const cleanUrl = String(url || "")
    .split("?")[0]
    .toLowerCase();

  return (
    cleanUrl.includes("/video/upload/") ||
    /\.(mp4|webm|mov|m4v|ogg)$/i.test(cleanUrl)
  );
};

const getBannerKey = (banner, index) =>
  banner?._id ||
  banner?.clientId ||
  banner?.image ||
  `hero-banner-${index}`;

/* =========================================================
   HERO SECTION
========================================================= */

export default function HeroSection() {
  const {
    settings,
    loading,
    fetchHomepageSettings,
  } = useHomepageSettingsStore();

  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const videoRefs = useRef(new Map());

  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const isSwipingRef = useRef(false);
  const isPausedRef = useRef(false);
  const blockClickRef = useRef(false);

  /* =======================================================
     FETCH SETTINGS
  ======================================================= */

  useEffect(() => {
    if (!settings && !loading) {
      fetchHomepageSettings();
    }
  }, [settings, loading, fetchHomepageSettings]);

  /* =======================================================
     DEVICE DETECTION
  ======================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    const updateDevice = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateDevice();
    mediaQuery.addEventListener("change", updateDevice);

    return () => {
      mediaQuery.removeEventListener("change", updateDevice);
    };
  }, []);

  /* =======================================================
     SEPARATE BANNER ARRAYS
  ======================================================= */

  const desktopBanners = useMemo(
    () => sortActiveBanners(settings?.desktopHeroBanners || []),
    [settings?.desktopHeroBanners]
  );

  const mobileBanners = useMemo(
    () => sortActiveBanners(settings?.mobileHeroBanners || []),
    [settings?.mobileHeroBanners]
  );

  /*
   * Temporary fallback for old database records.
   * Remove this once all documents use separate arrays.
   */
  const legacyDesktopBanners = useMemo(() => {
    const legacy = Array.isArray(settings?.heroBanners)
      ? settings.heroBanners
      : [];

    return legacy
      .filter(
        (banner) =>
          banner?.isActive !== false &&
          (banner?.desktopImage || banner?.image)
      )
      .sort(
        (firstBanner, secondBanner) =>
          Number(firstBanner?.sortOrder || 0) -
          Number(secondBanner?.sortOrder || 0)
      )
      .map((banner) => ({
        ...banner,
        image: banner?.desktopImage || banner?.image || "",
      }));
  }, [settings?.heroBanners]);

  const legacyMobileBanners = useMemo(() => {
    const legacy = Array.isArray(settings?.heroBanners)
      ? settings.heroBanners
      : [];

    return legacy
      .filter(
        (banner) =>
          banner?.isActive !== false &&
          (banner?.mobileImage ||
            banner?.image ||
            banner?.desktopImage)
      )
      .sort(
        (firstBanner, secondBanner) =>
          Number(firstBanner?.sortOrder || 0) -
          Number(secondBanner?.sortOrder || 0)
      )
      .map((banner) => ({
        ...banner,
        image:
          banner?.mobileImage ||
          banner?.image ||
          banner?.desktopImage ||
          "",
      }));
  }, [settings?.heroBanners]);

  const banners = useMemo(() => {
    if (isMobile) {
      return mobileBanners.length
        ? mobileBanners
        : legacyMobileBanners;
    }

    return desktopBanners.length
      ? desktopBanners
      : legacyDesktopBanners;
  }, [
    isMobile,
    mobileBanners,
    desktopBanners,
    legacyMobileBanners,
    legacyDesktopBanners,
  ]);

  const activeBanner = banners[current];
  const activeMediaUrl = activeBanner?.image || "";
  const activeIsVideo = isVideoUrl(activeMediaUrl);
  const firstMedia = banners?.[0]?.image || "";

  /* =======================================================
     BASIC NAVIGATION
  ======================================================= */

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    if (banners.length <= 1) return;

    setCurrent(
      (previous) => (previous + 1) % banners.length
    );
  }, [banners.length]);

  const previous = useCallback(() => {
    if (banners.length <= 1) return;

    setCurrent(
      (previous) =>
        (previous - 1 + banners.length) % banners.length
    );
  }, [banners.length]);

  const goToSlide = useCallback(
    (index) => {
      if (index < 0 || index >= banners.length) return;
      setCurrent(index);
    },
    [banners.length]
  );

  /* =======================================================
     RESET WHEN DEVICE/BANNERS CHANGE
  ======================================================= */

  useEffect(() => {
    stopAutoplay();
    setCurrent(0);
    setLoaded(false);

    videoRefs.current.forEach((videoElement) => {
      if (!videoElement) return;

      videoElement.pause();
      videoElement.currentTime = 0;
    });

    if (!firstMedia) return;

    if (!isVideoUrl(firstMedia)) {
      const frame = requestAnimationFrame(() => {
        setLoaded(true);
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [firstMedia, isMobile, stopAutoplay]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [current, banners.length]);

  /* =======================================================
     IMAGE AUTOPLAY

     Images move after 5 seconds.
     Videos move only after they finish.
  ======================================================= */

  const startImageAutoplay = useCallback(() => {
    stopAutoplay();

    if (
      banners.length <= 1 ||
      isPausedRef.current ||
      activeIsVideo
    ) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      next();
    }, IMAGE_AUTOPLAY_DELAY);
  }, [
    activeIsVideo,
    banners.length,
    next,
    stopAutoplay,
  ]);

  useEffect(() => {
    startImageAutoplay();

    return stopAutoplay;
  }, [current, startImageAutoplay, stopAutoplay]);

  /* =======================================================
     PLAY ONLY ACTIVE VIDEO

     Works for both mobile and desktop.
     Video restarts from beginning when revisited.
  ======================================================= */

  useEffect(() => {
    stopAutoplay();

    videoRefs.current.forEach((videoElement, index) => {
      if (!videoElement) return;

      if (index === current && activeIsVideo) {
        videoElement.currentTime = 0;

        if (!isPausedRef.current) {
          videoElement.play().catch(() => {});
        }
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });

    if (!activeIsVideo) {
      startImageAutoplay();
    }
  }, [
    current,
    activeIsVideo,
    banners,
    startImageAutoplay,
    stopAutoplay,
  ]);

  /* =======================================================
     PAUSE / RESUME CURRENT MEDIA
  ======================================================= */

  const pauseCarousel = useCallback(() => {
    isPausedRef.current = true;
    stopAutoplay();

    const activeVideo = videoRefs.current.get(current);
    activeVideo?.pause();
  }, [current, stopAutoplay]);

  const resumeCarousel = useCallback(() => {
    isPausedRef.current = false;

    if (activeIsVideo) {
      const activeVideo = videoRefs.current.get(current);

      activeVideo?.play().catch(() => {});
      return;
    }

    startImageAutoplay();
  }, [activeIsVideo, current, startImageAutoplay]);

  /* =======================================================
     TOUCH SWIPE
  ======================================================= */

  useEffect(() => {
    const element = containerRef.current;

    if (!element || banners.length <= 1) {
      return;
    }

    const swipeThreshold = 50;
    const verticalLimit = 25;

    const handleTouchStart = (event) => {
      pauseCarousel();

      blockClickRef.current = false;
      isSwipingRef.current = false;

      startXRef.current = event.touches[0].clientX;
      startYRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;

      const differenceX = startXRef.current - currentX;
      const differenceY = startYRef.current - currentY;

      const isVerticalGesture =
        Math.abs(differenceY) > Math.abs(differenceX) &&
        Math.abs(differenceY) > verticalLimit;

      if (isVerticalGesture) return;

      if (Math.abs(differenceX) > 10) {
        isSwipingRef.current = true;
        blockClickRef.current = true;

        event.preventDefault();
      }
    };

    const handleTouchEnd = (event) => {
      if (!isSwipingRef.current) {
        resumeCarousel();
        return;
      }

      const endX = event.changedTouches[0].clientX;
      const differenceX = startXRef.current - endX;

      if (differenceX > swipeThreshold) {
        next();
      } else if (differenceX < -swipeThreshold) {
        previous();
      }

      isPausedRef.current = false;

      window.setTimeout(() => {
        blockClickRef.current = false;
      }, 200);
    };

    element.addEventListener(
      "touchstart",
      handleTouchStart,
      {
        passive: true,
      }
    );

    element.addEventListener(
      "touchmove",
      handleTouchMove,
      {
        passive: false,
      }
    );

    element.addEventListener(
      "touchend",
      handleTouchEnd,
      {
        passive: true,
      }
    );

    return () => {
      element.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      element.removeEventListener(
        "touchmove",
        handleTouchMove
      );

      element.removeEventListener(
        "touchend",
        handleTouchEnd
      );
    };
  }, [
    banners.length,
    next,
    pauseCarousel,
    previous,
    resumeCarousel,
  ]);

  /* =======================================================
     PAGE VISIBILITY
  ======================================================= */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseCarousel();
      } else {
        resumeCarousel();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [pauseCarousel, resumeCarousel]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading && !settings) {
    return (
      <section className="relative w-full overflow-hidden bg-gray-100 pt-[133.33%] md:pt-[41.6667%]">
        <div className="absolute inset-0 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      </section>
    );
  }

  if (!banners.length) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      ref={containerRef}
      className="relative w-full select-none overflow-hidden bg-gray-100 pt-[133.33%] md:pt-[41.6667%]"
      style={{
        touchAction: "pan-y",
      }}
      onMouseEnter={pauseCarousel}
      onMouseLeave={resumeCarousel}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      )}

      <div
        className={`absolute inset-0 flex transition-[transform,opacity] duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {banners.map((banner, index) => {
          const mediaUrl = banner?.image || "";
          const video = isVideoUrl(mediaUrl);

          const slide = (
            <div className="relative h-full w-full flex-shrink-0 overflow-hidden">
              {video ? (
                <video
                  ref={(element) => {
                    if (element) {
                      videoRefs.current.set(
                        index,
                        element
                      );
                    } else {
                      videoRefs.current.delete(index);
                    }
                  }}
                  src={mediaUrl}
                  muted
                  playsInline
                  preload={
                    index === 0
                      ? "auto"
                      : "metadata"
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                  onLoadedData={() => {
                    if (index === 0) {
                      setLoaded(true);
                    }
                  }}
                  onCanPlay={() => {
                    if (
                      index === current &&
                      !isPausedRef.current
                    ) {
                      videoRefs.current
                        .get(index)
                        ?.play()
                        .catch(() => {});
                    }

                    if (index === 0) {
                      setLoaded(true);
                    }
                  }}
                  onEnded={() => {
                    if (index === current) {
                      next();
                    }
                  }}
                  onError={() => {
                    if (index === 0) {
                      setLoaded(true);
                    }

                    if (index === current) {
                      next();
                    }
                  }}
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={
                    banner?.title ||
                    `Hero banner ${index + 1}`
                  }
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                  unoptimized
                  onLoad={() => {
                    if (index === 0) {
                      setLoaded(true);
                    }
                  }}
                  onError={() => {
                    if (index === 0) {
                      setLoaded(true);
                    }
                  }}
                />
              )}
            </div>
          );

          const handleClick = (event) => {
            if (blockClickRef.current) {
              event.preventDefault();
              event.stopPropagation();
            }
          };

          return banner?.link ? (
            <Link
              key={getBannerKey(banner, index)}
              href={banner.link}
              onClick={handleClick}
              className="h-full w-full flex-shrink-0"
              aria-label={
                banner?.title ||
                `Open banner ${index + 1}`
              }
            >
              {slide}
            </Link>
          ) : (
            <div
              key={getBannerKey(banner, index)}
              className="h-full w-full flex-shrink-0"
            >
              {slide}
            </div>
          );
        })}
      </div>

      {/* Desktop arrows */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl leading-none text-white transition hover:bg-black/50 md:flex"
            aria-label="Previous banner"
          >
            &#10094;
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 px-3 py-2 text-3xl leading-none text-white transition hover:bg-black/50 md:flex"
            aria-label="Next banner"
          >
            &#10095;
          </button>
        </>
      )}

      {/* Pagination */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {banners.map((banner, index) => (
            <button
              key={getBannerKey(banner, index)}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 w-2.5 rounded-full border border-black/10 transition ${
                current === index
                  ? "bg-white"
                  : "bg-white/45"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}