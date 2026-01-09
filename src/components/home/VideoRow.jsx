"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { useReelStore } from "@/store/reelStore";
import ReelViewer from "./ReelViewer";

/* ============================
    ✅ Shimmer
============================ */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

/* ============================
    ✅ Main Component
============================ */
export default function VideoRow() {
  const router = useRouter();
  const scrollerRef = useRef(null);

  const videoRefs = useRef([]);

  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});
  const [readyMap, setReadyMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const { allProducts, fetchProducts } = useProductStore();
  const { reels, fetchReels, loading: reelLoading } = useReelStore();

  // ✅ Strict mode safe fetch
  const fetchedProductsRef = useRef(false);
  const fetchedReelsRef = useRef(false);

  /* ============================
      ✅ Fetch Products once
  ============================ */
  useEffect(() => {
    if (fetchedProductsRef.current) return;
    fetchedProductsRef.current = true;
    fetchProducts({ page: 1, limit: 80, isActive: true });
  }, [fetchProducts]);

  /* ============================
      ✅ Fetch Reels once
  ============================ */
  useEffect(() => {
    if (fetchedReelsRef.current) return;
    fetchedReelsRef.current = true;
    fetchReels({ page: 1, limit: 20, isActive: true });
  }, [fetchReels]);

  /* ============================
      ✅ Attach correct product (NO RANDOM FALLBACK)
  ============================ */
  const reelsWithProducts = useMemo(() => {
    if (!reels?.length) return [];

    return reels.map((reel) => {
      const reelSlug = String(reel?.slug || "").trim().toLowerCase();

      const matchedProduct = allProducts?.find(
        (p) => String(p?.slug || "").trim().toLowerCase() === reelSlug
      );

      return {
        ...reel,
        src: reel.video || reel.src,
        product: matchedProduct
          ? {
              id: matchedProduct.id || matchedProduct._id,
              name: matchedProduct.name,
              price: matchedProduct.price,
              image: matchedProduct.image || "/placeholder.png", // product image ok
              slug: matchedProduct.slug,
              category:
                matchedProduct.category?.slug ||
                matchedProduct.category ||
                "all-clothing",
            }
          : null,
      };
    });
  }, [reels, allProducts]);

  /* ============================
      ✅ AutoPlay only visible videos
      ✅ Pause when not visible
  ============================ */
  useEffect(() => {
    if (!reelsWithProducts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!video) return;

          if (entry.isIntersecting) {
            video.play?.().catch(() => {});
          } else {
            video.pause?.();
          }
        });
      },
      { threshold: 0.3 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));

    return () => observer.disconnect();
  }, [reelsWithProducts]);

  const isLoading = reelLoading || !reelsWithProducts.length;

  const toggleLike = (i) => setLikes((p) => ({ ...p, [i]: !p[i] }));

  const shareReel = async (r) => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: "Check this out!",
          text: r.caption || "",
          url: r.src,
        });
      }
    } catch {}
  };

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    const first = el.querySelector("[data-reel-card='true']");
    const w = first?.getBoundingClientRect?.().width || 200;

    el.scrollBy({
      left: (dir === "left" ? -1 : 1) * (w * 2.5 + 40),
      behavior: "smooth",
    });
  };

  const navigateToProduct = (e, product) => {
    e.stopPropagation();
    if (!product?.id || !product?.slug) return;

    router.push(`/category/${product.category}/${product.slug}/${product.id}`);
  };

  /* ============================
      ✅ Shimmer Loading UI
  ============================ */
  if (isLoading) {
    return (
      <section className="w-full flex flex-col bg-white py-10 md:py-14 overflow-hidden">
        <div className="flex justify-center mb-6">
          <Shimmer className="h-8 w-64 rounded" />
        </div>

        <div className="flex gap-4 px-6 md:px-10 overflow-x-auto no-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[160px] md:min-w-[220px] lg:min-w-[240px] border border-gray-200 rounded-xl overflow-hidden"
            >
              <Shimmer className="w-full aspect-[9/16]" />
              <div className="flex gap-3 p-3 border-t border-gray-200">
                <Shimmer className="w-12 h-14 rounded" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3 w-3/4 rounded" />
                  <Shimmer className="h-3 w-1/3 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ============================
      ✅ Main UI
  ============================ */
  return (
    <>
      <section className="w-full flex flex-col bg-white py-8 md:py-14 overflow-hidden">
        <div className="w-full bg-black text-center mb-5">
          <h2 className="text-white py-3 text-lg md:text-3xl font-semibold uppercase tracking-[0.22em]">
            Fashion In Motion
          </h2>
        </div>

        <div className="relative px-3 sm:px-6 md:px-10">
          {/* Desktop arrows */}
          <button
            onClick={() => scrollByCards("left")}
            className="hidden md:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
          >
            <ChevronLeft size={18} className="text-black" />
          </button>

          <button
            onClick={() => scrollByCards("right")}
            className="hidden md:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
          >
            <ChevronRight size={18} className="text-black" />
          </button>

          {/* ✅ Horizontal row scroller */}
          <div
            ref={scrollerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
          >
            {reelsWithProducts.map((reel, i) => {
              const isReady = !!readyMap[i];
              const isError = !!errorMap[i];

              return (
                <div
                  key={reel._id || reel.src}
                  data-reel-card="true"
                  onClick={() => setActiveIndex(i)}
                  className="
                    snap-start bg-white flex flex-col cursor-pointer relative
                    min-w-[130px] sm:min-w-[150px]
                    md:min-w-[170px] lg:min-w-[185px] xl:min-w-[200px]
                    max-w-[200px] md:max-w-[185px] lg:max-w-[200px]
                    border border-gray-200 rounded-xl overflow-hidden
                    hover:shadow-md transition
                  "
                >
                  {/* ✅ Reel Video Container */}
                  <div className="relative w-full aspect-[9/16] bg-black">
                    {/* ✅ Simple Loader until video ready */}
                    {!isReady && !isError && (
                      <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      </div>
                    )}

                    {/* ✅ Error fallback (optional but useful) */}
                    {isError ? (
                      <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xs">
                        Video unavailable
                      </div>
                    ) : (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[i] = el;
                        }}
                        src={reel.src}
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                        onLoadedData={(e) => {
                          setReadyMap((p) => ({ ...p, [i]: true }));
                          e.currentTarget.play?.().catch(() => {});
                        }}
                        onError={() => {
                          console.log("❌ Video failed:", reel.src);
                          setErrorMap((p) => ({ ...p, [i]: true }));
                        }}
                      />
                    )}

                    {/* Overlay buttons */}
                    <div className="absolute bottom-2 right-2 flex flex-col gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(i);
                        }}
                        className="p-2 bg-black/40 rounded-full backdrop-blur"
                      >
                        <Heart
                          size={16}
                          className={
                            likes[i] ? "text-red-500 fill-red-500" : "text-white"
                          }
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareReel(reel);
                        }}
                        className="p-2 bg-black/40 rounded-full backdrop-blur"
                      >
                        <Share2 size={16} className="text-white" />
                      </button>
                    </div>
                  </div>

                  {/* ✅ Product navigation */}
                  {reel.product && (
                    <div
                      onClick={(e) => navigateToProduct(e, reel.product)}
                      className="flex items-center gap-2 p-2 md:p-2.5 border-t border-gray-200 bg-white"
                    >
                      <img
                        src={reel.product.image}
                        alt={reel.product.name}
                        className="w-10 h-12 md:w-11 md:h-13 object-contain bg-gray-100 rounded-md"
                      />

                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-[11px] md:text-xs font-medium text-gray-900 line-clamp-1">
                          {reel.product.name}
                        </p>
                        <p className="text-black font-semibold text-[11px] md:text-xs">
                          ₹{reel.product.price}
                        </p>
                      </div>

                      <div className="text-black/70 text-base md:text-lg font-bold">
                        →
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile hint */}
          <p className="text-[11px] sm:text-xs text-gray-400 mt-3 text-center">
            Swipe left/right to explore reels
          </p>
        </div>
      </section>

      {/* ✅ Reel Viewer Modal */}
      {activeIndex !== null && (
        <ReelViewer
          reels={reelsWithProducts}
          currentIndex={activeIndex}
          setCurrentIndex={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
