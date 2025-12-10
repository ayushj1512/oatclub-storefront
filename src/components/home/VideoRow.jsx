"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import ReelViewer from "./ReelViewer";

const reels = [
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/137cf091405223837c47fd9297cd5504.mp4",
    caption: "Unleashing western vibes with a soft glam ✨",
    hashtags: ["#MirayFashions", "#WesternVibes", "#OOTD"],
    product: { id: 101, name: "Western Denim Jacket", price: "1499", image: "/placeholder.png", slug: "western-denim-jacket" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/60c4f113d46da5d704fb36d7212ce5a3.mp4",
    caption: "Summer silhouettes done right ☀️",
    hashtags: ["#SummerWear", "#BohoStyle"],
    product: { id: 102, name: "Summer Floral Dress", price: "1299", image: "/placeholder.png", slug: "summer-floral-dress" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/4165e18da252f877d3fc38542ef8734d.mp4",
    caption: "Burgundy mood — soft glam + classy fits ❤️",
    hashtags: ["#BurgundyLove", "#MirayFashions"],
    product: { id: 103, name: "Burgundy Bodycon Dress", price: "1599", image: "/placeholder.png", slug: "burgundy-bodycon-dress" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/103d7a1184e604c1f2173abaadd7e2f4.mp4",
    caption: "Sleek western fusion outfit ✨",
    hashtags: ["#FusionWear", "#WesternEdit"],
    product: { id: 104, name: "Western Co-ord Set", price: "1799", image: "/placeholder.png", slug: "western-coord-set" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/88ea3bd7609ac14b35c0dd9d89a586a1.mp4",
    caption: "Elegant, effortless, everyday chic 🤍",
    hashtags: ["#EverydayChic", "#FashionDaily"],
    product: { id: 105, name: "White Minimal Dress", price: "1399", image: "/placeholder.png", slug: "white-minimal-dress" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/ebbdaaa759e439cca326d4096286575b.mp4",
    caption: "Soft glam outfit that never fails 💖",
    hashtags: ["#SoftGlam", "#GlowEdit"],
    product: { id: 106, name: "Soft Glam Top", price: "999", image: "/placeholder.png", slug: "soft-glam-top" },
  },
  {
    src: "https://mirayfashions.com/wp-content/uploads/2025/10/b354e2323463863d462b14f1f8d71bdc_t4.mp4",
    caption: "Aesthetic vibes all day ✨🎥",
    hashtags: ["#AestheticFit", "#OOTD"],
    product: { id: 107, name: "Aesthetic Streetwear Set", price: "1899", image: "/placeholder.png", slug: "aesthetic-streetwear-set" },
  },
];

export default function VideoRow() {
  const videoRefs = useRef([]);
  const scrollerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(null);
  const [likes, setLikes] = useState({});

  const toggleLike = (i) => setLikes((p) => ({ ...p, [i]: !p[i] }));

  const shareReel = async (r) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Check this out!", text: r.caption, url: r.src });
      } else {
        alert("Sharing not supported on this device.");
      }
    } catch {}
  };

  useEffect(() => {
    videoRefs.current.forEach((v) => v?.play().catch(() => {}));
  }, []);

  const openReel = (i) => setActiveIndex(i);
  const closeReel = () => setActiveIndex(null);

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    // scroll by ~2.5 cards (responsive-friendly)
    const firstCard = el.querySelector("[data-reel-card='true']");
    const cardW = firstCard?.getBoundingClientRect?.().width || 200;
    const gap = 20;
    const delta = dir === "left" ? -(cardW * 2.5 + gap * 2) : cardW * 2.5 + gap * 2;

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <>
      <section className="w-full flex flex-col bg-white py-10 md:py-14 overflow-hidden">
        <h2 className="text-xl md:text-3xl font-extrabold text-center text-black border-b-4 border-[#800020] pb-1 w-fit mx-auto mb-6 tracking-wide uppercase">
          Fashion In Motion
        </h2>

        {/* HORIZONTAL SCROLL ROW (MOBILE + DESKTOP) */}
        <div className="relative px-6 md:px-10">
          {/* desktop arrows */}
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            aria-label="Scroll left"
            className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <ChevronLeft className="text-black" size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollByCards("right")}
            aria-label="Scroll right"
            className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <ChevronRight className="text-black" size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
          >
            {reels.map((reel, i) => (
              <div
                key={i}
                data-reel-card="true"
                onClick={() => openReel(i)}
                className="snap-start bg-white border border-gray-200 flex flex-col cursor-pointer relative
                           min-w-[160px] md:min-w-[220px] lg:min-w-[240px]
                           hover:shadow-md transition"
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
                  <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex flex-col gap-2">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(i);
                      }}
                      className="p-1.5 md:p-2 bg-black/40 backdrop-blur-sm rounded-full hover:scale-110 transition"
                    >
                      <Heart
                        size={18}
                        className={likes[i] ? "text-red-500 fill-red-500" : "text-white"}
                      />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        shareReel(reel);
                      }}
                      className="p-1.5 md:p-2 bg-black/40 backdrop-blur-sm rounded-full hover:scale-110 transition"
                    >
                      <Share2 size={18} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 md:p-3 border-t border-gray-200 bg-white">
                  <img
                    src={reel.product.image}
                    alt={reel.product.name}
                    className="w-12 h-14 md:w-14 md:h-16 object-contain bg-gray-100"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-[11px] md:text-sm font-medium line-clamp-1">{reel.product.name}</p>
                    <p className="text-[#800020] font-semibold text-xs md:text-sm">₹{reel.product.price}</p>
                  </div>
                  <div className="text-[#800020] text-lg md:text-xl font-bold">→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeIndex !== null && (
        <ReelViewer reels={reels} currentIndex={activeIndex} setCurrentIndex={setActiveIndex} onClose={closeReel} />
      )}
    </>
  );
}
