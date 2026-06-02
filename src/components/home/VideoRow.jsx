"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { useReelStore } from "@/store/reelStore";
import ReelViewer from "./ReelViewer";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-white/10 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}

export default function VideoRow() {
  const router = useRouter();
  const scrollerRef = useRef(null);
  const videoRefs = useRef([]);

  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});
  const [readyMap, setReadyMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const { allProducts, fetchProducts, fetchProductsByIds } = useProductStore();
  const { reels, fetchReels, loading: reelLoading } = useReelStore();

  const fetchedProductsRef = useRef(false);
  const fetchedReelsRef = useRef(false);
  const fetchedReelProductsRef = useRef(false);

  useEffect(() => {
    if (fetchedProductsRef.current) return;
    fetchedProductsRef.current = true;
    fetchProducts({ page: 1, limit: 80, isActive: true });
  }, [fetchProducts]);

  useEffect(() => {
    if (fetchedReelsRef.current) return;
    fetchedReelsRef.current = true;
    fetchReels({ page: 1, limit: 20, isActive: true });
  }, [fetchReels]);

  useEffect(() => {
    if (!reels?.length || fetchedReelProductsRef.current) return;

    const ids = reels
      .map((r) => r?.product?.productId)
      .filter(Boolean)
      .map(String);

    if (!ids.length) return;

    fetchedReelProductsRef.current = true;
    fetchProductsByIds(ids, { mergeIntoAllProducts: true });
  }, [reels, fetchProductsByIds]);

  const reelsWithProducts = useMemo(() => {
    if (!reels?.length) return [];

    return reels.map((reel) => {
      const apiProd = reel?.product || null;
      const pid = apiProd?.productId ? String(apiProd.productId) : "";
      const matched = pid ? allProducts?.find((p) => String(p?.id) === pid) : null;

      const product = {
        id: matched?.id || pid || null,
        slug: matched?.slug || apiProd?.slug || null,
        name: matched?.name || reel?.title || "",
        image: matched?.image || apiProd?.image || "/placeholder.png",
        price: matched?.price ?? apiProd?.price ?? 0,
        category: matched?.category || "all-clothing",
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

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) target.play?.().catch(() => { });
          else target.pause?.();
        });
      },
      { threshold: 0.35 }
    );

    videoRefs.current.forEach((v) => v && obs.observe(v));
    return () => obs.disconnect();
  }, [reelsWithProducts]);

  const isLoading = reelLoading || !reelsWithProducts.length;

  const toggleLike = (i) => setLikes((p) => ({ ...p, [i]: !p[i] }));

  const shareReel = async (r) => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: "Oatclub Reel",
          text: r.caption || "Fashion in motion by Oatclub",
          url: r.src,
        });
      }
    } catch { }
  };

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    const first = el.querySelector("[data-reel-card='true']");
    const w = first?.getBoundingClientRect?.().width || 180;

    el.scrollBy({
      left: (dir === "left" ? -1 : 1) * (w * 2.4 + 40),
      behavior: "smooth",
    });
  };

  const navigateToProduct = (e, product) => {
    e.stopPropagation();
    if (!product?.id || !product?.slug) return;
    router.push(`/category/${product.category}/${product.slug}/${product.id}`);
  };

  if (isLoading) {
    return (
      <section className="w-full overflow-hidden bg-black py-8 md:py-14">
        <div className="mb-6 px-4 text-center">
          <Shimmer className="mx-auto h-8 w-64 rounded" />
          <Shimmer className="mx-auto mt-3 h-3 w-72 rounded" />
        </div>

        <div className="flex gap-3 overflow-x-auto px-3 md:gap-4 md:px-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[140px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:min-w-[200px]"
            >
              <Shimmer className="aspect-[9/16] w-full" />
              <div className="flex gap-3 border-t border-white/10 p-3">
                <Shimmer className="h-12 w-10 rounded-lg" />
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

  return (
    <>
      <section className="w-full overflow-hidden bg-black py-8 text-white md:py-14">
        <style
          dangerouslySetInnerHTML={{
            __html:
              ".no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}",
          }}
        />

        <div className="mb-6 px-4 text-center md:mb-9">
          <div className="mb-2 flex items-center justify-center gap-2 text-white/45">
            <Instagram className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em]">
              @oatclub.in
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-none tracking-tight md:text-7xl">
            Fashion In Motion
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-white/50 md:text-sm">
            To get featured, tag us on Instagram{" "}
            <span className="font-medium text-white">@oatclub.in</span>
          </p>
        </div>

        <div className="relative px-3 sm:px-6 md:px-10">
          <button
            onClick={() => scrollByCards("left")}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 md:flex"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => scrollByCards("right")}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 md:flex"
          >
            <ChevronRight size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="
    no-scrollbar
    flex
    snap-x
    snap-mandatory
    justify-center
    gap-3
    overflow-x-auto
    scroll-smooth
    pb-2
    md:gap-4
  "
          >
            {reelsWithProducts.map((reel, i) => {
              const isReady = !!readyMap[i];
              const isError = !!errorMap[i];

              return (
                <div
                  key={reel._id || reel.src}
                  data-reel-card="true"
                  onClick={() => setActiveIndex(i)}
                  className="group relative flex min-w-[140px] max-w-[140px] cursor-pointer snap-start flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:min-w-[155px] sm:max-w-[155px] md:min-w-[190px] md:max-w-[190px] lg:min-w-[210px] lg:max-w-[210px]"
                >
                  <div className="relative aspect-[9/16] w-full bg-black">
                    {!isReady && !isError && (
                      <div className="absolute inset-0 z-10 grid place-items-center bg-black">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      </div>
                    )}

                    {isError ? (
                      <div className="absolute inset-0 grid place-items-center bg-black px-3 text-center text-xs text-white/60">
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
                        className="absolute inset-0 h-full w-full bg-black object-cover"
                        onLoadedData={(e) => {
                          setReadyMap((p) => ({ ...p, [i]: true }));
                          e.currentTarget.play?.().catch(() => { });
                        }}
                        onError={() => setErrorMap((p) => ({ ...p, [i]: true }))}
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10 opacity-80" />

                    <div className="absolute left-2 top-2 rounded-full bg-white/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                      OAT REEL
                    </div>

                    <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-black shadow-xl">
                        <Play className="h-5 w-5 fill-black" />
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 z-20 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(i);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur transition hover:bg-white hover:text-black"
                      >
                        <Heart
                          size={15}
                          className={
                            likes[i] ? "fill-white text-white" : "text-white"
                          }
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareReel(reel);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur transition hover:bg-white hover:text-black"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>

                  {reel.product && (
                    <div
                      onClick={(e) => navigateToProduct(e, reel.product)}
                      className="flex items-center gap-2 border-t border-white/10 bg-white/[0.06] p-2.5 transition hover:bg-white/10"
                    >
                      <img
                        src={reel.product.image}
                        alt={reel.product.name}
                        className="h-12 w-10 rounded-lg bg-white/10 object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-medium text-white/90">
                          {reel.product.name}
                        </p>
                        <p className="text-[11px] font-semibold text-white">
                          ₹{reel.product.price}
                        </p>
                      </div>

                      <span className="text-white/50 transition group-hover:text-white">
                        →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[11px] text-white/35 sm:text-xs">
            Swipe left/right to explore reels
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