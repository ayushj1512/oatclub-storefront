"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Instagram,
  Play,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useProductStore } from "@/store/productStore";
import { useReelStore } from "@/store/reelStore";
import ReelViewer from "./ReelViewer";

function Shimmer({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/10 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export default function VideoRow() {
  const router = useRouter();

  const scrollerRef = useRef(null);
  const videoRefs = useRef([]);
  const fetchedProductsRef = useRef(false);
  const fetchedReelsRef = useRef(false);
  const fetchedReelProductsRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});
  const [readyMap, setReadyMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const {
    allProducts,
    fetchProducts,
    fetchProductsByIds,
  } = useProductStore();

  const {
    reels,
    fetchReels,
    loading: reelLoading,
  } = useReelStore();

  useEffect(() => {
    if (fetchedProductsRef.current) return;

    fetchedProductsRef.current = true;

    fetchProducts({
      page: 1,
      limit: 80,
      isActive: true,
    });
  }, [fetchProducts]);

  useEffect(() => {
    if (fetchedReelsRef.current) return;

    fetchedReelsRef.current = true;

    fetchReels({
      page: 1,
      limit: 20,
      isActive: true,
      placement: "home_row",
      sort: "priority",
    });
  }, [fetchReels]);

  useEffect(() => {
    if (
      !reels?.length ||
      fetchedReelProductsRef.current
    ) {
      return;
    }

    const productIds = [
      ...new Set(
        reels
          .map((reel) => reel?.product?.productId)
          .filter(Boolean)
          .map(String)
      ),
    ];

    if (!productIds.length) return;

    fetchedReelProductsRef.current = true;

    fetchProductsByIds(productIds, {
      mergeIntoAllProducts: true,
    });
  }, [reels, fetchProductsByIds]);

  const reelsWithProducts = useMemo(() => {
    if (!reels?.length) return [];

    return reels.map((reel) => {
      const snapshot = reel?.product || null;

      const productId = snapshot?.productId
        ? String(snapshot.productId)
        : "";

      const matchedProduct = productId
        ? allProducts?.find(
            (product) =>
              String(product?.id || product?._id) ===
              productId
          )
        : null;

      const product = {
        id:
          matchedProduct?.id ||
          matchedProduct?._id ||
          productId ||
          null,

        slug:
          matchedProduct?.slug ||
          snapshot?.slug ||
          null,

        name:
          matchedProduct?.name ||
          matchedProduct?.title ||
          snapshot?.name ||
          reel?.title ||
          "",

        image:
          matchedProduct?.image ||
          matchedProduct?.thumbnail ||
          matchedProduct?.images?.[0] ||
          snapshot?.image ||
          "/placeholder.png",

        price:
          matchedProduct?.price ??
          snapshot?.price ??
          0,

        category:
          matchedProduct?.category ||
          matchedProduct?.categories?.[1] ||
          "all-clothing",
      };

      return {
        ...reel,
        src: reel.video || reel.src,
        product: product.id ? product : null,
      };
    });
  }, [reels, allProducts]);

  useEffect(() => {
    if (!reelsWithProducts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play?.().catch(() => {});
          } else {
            video.pause?.();
          }
        });
      },
      {
        threshold: 0.6,
        rootMargin: "0px 20px",
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reelsWithProducts]);

  const isLoading =
    reelLoading && !reelsWithProducts.length;

  const toggleLike = (index) => {
    setLikes((current) => ({
      ...current,
      [index]: !current[index],
    }));
  };

  const shareReel = async (reel) => {
    try {
      const shareData = {
        title: reel.title || "OATCLUB Reel",
        text:
          reel.caption ||
          "Fashion in motion by OATCLUB",
        url:
          typeof window !== "undefined"
            ? window.location.href
            : reel.src,
      };

      if (navigator?.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator?.clipboard?.writeText(
        shareData.url
      );
    } catch {
      // Share cancelled.
    }
  };

  const scrollByCards = (direction) => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    const firstCard = scroller.querySelector(
      "[data-reel-card='true']"
    );

    const cardWidth =
      firstCard?.getBoundingClientRect?.().width || 210;

    scroller.scrollBy({
      left:
        (direction === "left" ? -1 : 1) *
        (cardWidth * 2 + 32),

      behavior: "smooth",
    });
  };

  const navigateToProduct = (event, product) => {
    event.stopPropagation();

    if (!product?.id || !product?.slug) return;

    router.push(
      `/category/${product.category}/${product.slug}/${product.id}`
    );
  };

  if (isLoading) {
    return <VideoRowSkeleton />;
  }

  if (!reelsWithProducts.length) {
    return null;
  }

  return (
    <>
      <section className="w-full overflow-hidden bg-black py-7 text-white md:py-14">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }

              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }

              .reel-scroll {
                scroll-padding-left: 16px;
                -webkit-overflow-scrolling: touch;
                overscroll-behavior-x: contain;
              }

              @media (min-width: 640px) {
                .reel-scroll {
                  scroll-padding-left: 24px;
                }
              }

              @media (min-width: 768px) {
                .reel-scroll {
                  scroll-padding-left: 40px;
                }
              }
            `,
          }}
        />

        {/* Heading */}

        <div className="mb-5 px-4 text-center md:mb-9">
          <div className="mb-2 flex items-center justify-center gap-2 text-white/45">
            <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] md:text-[10px] md:tracking-[0.32em]">
              @oatclub.in
            </span>
          </div>

          <h2 className="text-[26px] font-extrabold uppercase leading-none tracking-tight sm:text-3xl md:text-4xl">
            Fashion in Motion
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-[11px] leading-relaxed text-white/50 sm:text-xs md:mt-3 md:text-sm">
            To get featured, tag us on Instagram{" "}
            <span className="font-medium text-white">
              @oatclub.in
            </span>
          </p>
        </div>

        {/* Reel row */}

        <div className="relative">
          <button
            type="button"
            aria-label="Previous reels"
            onClick={() => scrollByCards("left")}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 md:flex"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Next reels"
            onClick={() => scrollByCards("right")}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 md:flex"
          >
            <ChevronRight size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="
              reel-scroll
              no-scrollbar
              flex
              snap-x
              snap-mandatory
              gap-3
              overflow-x-auto
              scroll-smooth
              px-4
              pb-2
              sm:gap-4
              sm:px-6
              md:px-10
            "
          >
            {reelsWithProducts.map((reel, index) => {
              const isReady = Boolean(readyMap[index]);
              const hasError = Boolean(errorMap[index]);

              return (
                <article
                  key={reel._id || reel.src}
                  data-reel-card="true"
                  onClick={() => setActiveIndex(index)}
                  className="
                    group
                    relative
                    flex
                    w-[72vw]
                    min-w-[72vw]
                    max-w-[280px]
                    cursor-pointer
                    snap-start
                    snap-always
                    flex-col
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-white/10
                    bg-white/[0.06]
                    shadow-[0_18px_45px_rgba(0,0,0,0.4)]
                    transition
                    duration-300
                    sm:w-[230px]
                    sm:min-w-[230px]
                    md:w-[190px]
                    md:min-w-[190px]
                    lg:w-[210px]
                    lg:min-w-[210px]
                    lg:hover:-translate-y-1
                    lg:hover:border-white/20
                  "
                >
                  {/* Video */}

                  <div className="relative aspect-[9/16] w-full bg-black">
                    {!isReady && !hasError && (
                      <div className="absolute inset-0 z-10 grid place-items-center bg-black">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      </div>
                    )}

                    {hasError ? (
                      <div className="absolute inset-0 grid place-items-center bg-black px-4 text-center text-xs text-white/60">
                        Video unavailable
                      </div>
                    ) : (
                      <video
                        ref={(element) => {
                          videoRefs.current[index] =
                            element;
                        }}
                        src={reel.src}
                        poster={reel.poster || undefined}
                        muted
                        loop
                        playsInline
                        preload={
                          index < 3 ? "metadata" : "none"
                        }
                        className="absolute inset-0 h-full w-full bg-black object-cover"
                        onLoadedData={(event) => {
                          setReadyMap((current) => ({
                            ...current,
                            [index]: true,
                          }));

                          event.currentTarget
                            .play?.()
                            .catch(() => {});
                        }}
                        onError={() =>
                          setErrorMap((current) => ({
                            ...current,
                            [index]: true,
                          }))
                        }
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

                    {/* Badge */}

                    <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                      OAT Reel
                    </div>

                    {/* Play indicator */}

                    <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-black shadow-xl">
                        <Play className="h-4 w-4 fill-black md:h-5 md:w-5" />
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
                      <button
                        type="button"
                        aria-label="Like reel"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleLike(index);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 backdrop-blur-md transition active:scale-95 md:h-8 md:w-8 md:hover:bg-white md:hover:text-black"
                      >
                        <Heart
                          size={16}
                          className={
                            likes[index]
                              ? "fill-white text-white md:group-hover:fill-current"
                              : "text-white"
                          }
                        />
                      </button>

                      <button
                        type="button"
                        aria-label="Share reel"
                        onClick={(event) => {
                          event.stopPropagation();
                          shareReel(reel);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-md transition active:scale-95 md:h-8 md:w-8 md:hover:bg-white md:hover:text-black"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>

                    {/* Mobile caption */}

                    <div className="absolute bottom-3 left-3 right-16 md:hidden">
                      <p className="line-clamp-2 text-xs font-medium leading-relaxed text-white">
                        {reel.title ||
                          reel.caption ||
                          "OATCLUB Reel"}
                      </p>
                    </div>
                  </div>

                  {/* Product */}

                  {reel.product && (
                    <button
                      type="button"
                      onClick={(event) =>
                        navigateToProduct(
                          event,
                          reel.product
                        )
                      }
                      className="flex min-h-[68px] w-full items-center gap-3 border-t border-white/10 bg-white/[0.06] p-3 text-left transition active:bg-white/10 md:min-h-0 md:gap-2 md:p-2.5 md:hover:bg-white/10"
                    >
                      <img
                        src={reel.product.image}
                        alt={reel.product.name}
                        loading="lazy"
                        className="h-12 w-10 shrink-0 rounded-lg bg-white/10 object-cover md:h-12 md:w-10"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-medium text-white/90 md:text-[11px]">
                          {reel.product.name}
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-white md:text-[11px]">
                          ₹
                          {Number(
                            reel.product.price || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <span className="shrink-0 text-lg text-white/50">
                        →
                      </span>
                    </button>
                  )}
                </article>
              );
            })}

            <div
              aria-hidden="true"
              className="w-1 shrink-0 md:hidden"
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40 sm:text-xs md:hidden">
            <span>Swipe to explore</span>
            <ChevronRight size={13} />
          </div>

          <p className="mt-4 hidden text-center text-xs text-white/35 md:block">
            Scroll left or right to explore reels
          </p>
        </div>
      </section>

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

function VideoRowSkeleton() {
  return (
    <section className="w-full overflow-hidden bg-black py-7 md:py-14">
      <div className="mb-5 px-4 text-center md:mb-9">
        <Shimmer className="mx-auto h-7 w-56 rounded md:h-9 md:w-64" />
        <Shimmer className="mx-auto mt-3 h-3 w-64 rounded md:w-72" />
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-6 md:px-10">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="w-[72vw] min-w-[72vw] max-w-[280px] overflow-hidden rounded-[24px] border border-white/10 bg-white/5 sm:w-[230px] sm:min-w-[230px] md:w-[190px] md:min-w-[190px] lg:w-[210px] lg:min-w-[210px]"
            >
              <Shimmer className="aspect-[9/16] w-full" />

              <div className="flex gap-3 border-t border-white/10 p-3">
                <Shimmer className="h-12 w-10 shrink-0 rounded-lg" />

                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3 w-3/4 rounded" />
                  <Shimmer className="h-3 w-1/3 rounded" />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}