"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import ReelViewer from "./ReelViewer";

/* 🎥 VIDEOS STAY SAME */
const reels = [
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/137cf091405223837c47fd9297cd5504.mp4",
    caption: "Unleashing western vibes with a soft glam ✨",
    hashtags: ["#MirayFashions", "#WesternVibes", "#OOTD"],
    slug: "western-denim-jacket",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/60c4f113d46da5d704fb36d7212ce5a3.mp4",
    caption: "Summer silhouettes done right ☀️",
    hashtags: ["#SummerWear", "#BohoStyle"],
    slug: "summer-floral-dress",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/4165e18da252f877d3fc38542ef8734d.mp4",
    caption: "Burgundy mood — soft glam + classy fits ❤️",
    hashtags: ["#BurgundyLove", "#MirayFashions"],
    slug: "burgundy-bodycon-dress",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/103d7a1184e604c1f2173abaadd7e2f4.mp4",
    caption: "Sleek western fusion outfit ✨",
    hashtags: ["#FusionWear", "#WesternEdit"],
    slug: "western-coord-set",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/88ea3bd7609ac14b35c0dd9d89a586a1.mp4",
    caption: "Elegant, effortless, everyday chic 🤍",
    hashtags: ["#EverydayChic", "#FashionDaily"],
    slug: "white-minimal-dress",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/ebbdaaa759e439cca326d4096286575b.mp4",
    caption: "Soft glam outfit that never fails 💖",
    hashtags: ["#SoftGlam", "#GlowEdit"],
    slug: "soft-glam-top",
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/b354e2323463863d462b14f1f8d71bdc_t4.mp4",
    caption: "Aesthetic vibes all day ✨🎥",
    hashtags: ["#AestheticFit", "#OOTD"],
    slug: "aesthetic-streetwear-set",
  },
];

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}


export default function VideoRow() {
  const router = useRouter();
  const scrollerRef = useRef(null);
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});

  const { allProducts, fetchProducts } = useProductStore();

 const fetchedRef = useRef(false);

useEffect(() => {
  if (fetchedRef.current) return;
  fetchedRef.current = true;

  fetchProducts({ page: 1, limit: 50, isActive: true });
}, [fetchProducts]);





  /* 🔗 Attach realtime product */
  const reelsWithProducts = useMemo(() => {
    if (!allProducts?.length) return [];

    return reels.map((reel, i) => {
      const product =
        allProducts.find((p) => p.slug === reel.slug) ||
        allProducts[i % allProducts.length];

      return {
        ...reel,
        product: product
          ? {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image || "/placeholder.png",
              slug: product.slug,
              category: product.category?.slug || "all",
            }
          : null,
      };
    });
  }, [allProducts]);

useEffect(() => {
  if (!reelsWithProducts.length) return;

  videoRefs.current.forEach((v) => v?.play?.().catch(() => {}));
}, [reelsWithProducts.length]);

const isLoading = !reelsWithProducts.length;

  const toggleLike = (i) => setLikes((p) => ({ ...p, [i]: !p[i] }));

  const shareReel = async (r) => {
    try {
      if (navigator?.share)
        await navigator.share({
          title: "Check this out!",
          text: r.caption,
          url: r.src,
        });
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
    if (!product) return;

    router.push(
      `/category/${product.category}/${product.slug}/${product.id}`
    );
  };

 if (isLoading) {
  return (
    <section className="w-full flex flex-col bg-white py-10 md:py-14 overflow-hidden">
      {/* Heading shimmer */}
      <div className="flex justify-center mb-6">
        <Shimmer className="h-8 w-64 rounded" />
      </div>

      {/* Reel shimmer row */}
      <div className="flex gap-4 px-6 md:px-10 overflow-x-auto no-scrollbar">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[160px] md:min-w-[220px] lg:min-w-[240px] border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Video shimmer */}
            <Shimmer className="w-full aspect-[9/16]" />

            {/* Product strip shimmer */}
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


 return (
  <>
    <section className="w-full flex flex-col bg-white py-10 md:py-14 overflow-hidden">
      <h2 className="text-xl md:text-3xl font-extrabold text-center text-black border-b border-black pb-2 w-fit mx-auto mb-6 tracking-[0.25em] uppercase">
        Fashion In Motion
      </h2>

      <div className="relative px-6 md:px-10">
        {/* Left Arrow */}
        <button
          onClick={() => scrollByCards("left")}
          className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scrollByCards("right")}
          className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
        >
          <ChevronRight size={18} className="text-black" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
        >
          {reelsWithProducts.map((reel, i) => (
            <div
              key={reel.src}
              data-reel-card="true"
              onClick={() => setActiveIndex(i)}
              className="snap-start bg-white flex flex-col cursor-pointer relative min-w-[160px] md:min-w-[220px] lg:min-w-[240px] border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Reel */}
              <div className="relative w-full aspect-[9/16] bg-black">
                <video
               ref={(el) => {
  if (el) videoRefs.current[i] = el;
}}
                  src={reel.src}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(i);
                    }}
                    className="p-2 bg-black/40 rounded-full backdrop-blur"
                  >
                    <Heart
                      size={18}
                      className={
                        likes[i]
                          ? "text-red-500 fill-red-500"
                          : "text-white"
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
                    <Share2 size={18} className="text-white" />
                  </button>
                </div>
              </div>

              {/* 🔗 PRODUCT NAVIGATION */}
              {reel.product && (
                <div
                  onClick={(e) => navigateToProduct(e, reel.product)}
                  className="flex items-center gap-3 p-3 border-t border-gray-200 bg-white"
                >
                  <img
                    src={reel.product.image}
                    alt={reel.product.name}
                    className="w-12 h-14 md:w-14 md:h-16 object-contain bg-gray-100"
                  />

                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-[11px] md:text-sm font-medium text-gray-900 line-clamp-1">
                      {reel.product.name}
                    </p>
                    <p className="text-black font-semibold text-xs md:text-sm">
                      ₹{reel.product.price}
                    </p>
                  </div>

                  <div className="text-black/70 text-lg md:text-xl font-bold">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
