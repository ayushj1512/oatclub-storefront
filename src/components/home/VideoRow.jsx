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

export default function VideoRow() {
  const router = useRouter();
  const scrollerRef = useRef(null);
  const videoRefs = useRef([]);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});

  const { allProducts, fetchProducts } = useProductStore();

  /* fetch products once */
  useEffect(() => {
    fetchProducts({ page: 1, limit: 50, isActive: true });
  }, [fetchProducts]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    videoRefs.current.forEach((v) => v?.play?.().catch(() => {}));
  }, [mounted]);

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

  if (!mounted || !reelsWithProducts.length) return null;

  return (
    <>
      <section className="w-full flex flex-col bg-white py-10 md:py-14 overflow-hidden">
        <h2 className="text-xl md:text-3xl font-extrabold text-center text-black border-b-4 border-[#800020] pb-1 w-fit mx-auto mb-6 tracking-wide uppercase">
          Fashion In Motion
        </h2>

        <div className="relative px-6 md:px-10">
          <button
            onClick={() => scrollByCards("left")}
            className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => scrollByCards("right")}
            className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border shadow-sm"
          >
            <ChevronRight size={18} />
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
                className="snap-start bg-white flex flex-col cursor-pointer relative min-w-[160px] md:min-w-[220px] lg:min-w-[240px] hover:shadow-md transition"
              >
                <div className="relative w-full aspect-[9/16] bg-black">
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
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
                      className="p-2 bg-black/40 rounded-full"
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
                      className="p-2 bg-black/40 rounded-full"
                    >
                      <Share2 size={18} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* 🔗 PRODUCT NAVIGATION */}
                {reel.product && (
                  <div
                    onClick={(e) => navigateToProduct(e, reel.product)}
                    className="flex items-center gap-3 p-3 border-t bg-white"
                  >
                    <img
                      src={reel.product.image}
                      alt={reel.product.name}
                      className="w-12 h-14 md:w-14 md:h-16 object-contain bg-gray-100"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-[11px] md:text-sm font-medium line-clamp-1">
                        {reel.product.name}
                      </p>
                      <p className="text-[#800020] font-semibold text-xs md:text-sm">
                        ₹{reel.product.price}
                      </p>
                    </div>
                    <div className="text-[#800020] text-lg md:text-xl font-bold">
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
