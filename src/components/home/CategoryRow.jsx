"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* =======================
   CATEGORY DATA
======================= */

export const categories = [
  {
    name: "All Clothing",
    slug: "all-clothing",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904932/miray/categories/mfbj855yynshc5q4bnwj.jpg",
  },
  {
    name: "Tops",
    slug: "top",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904932/miray/categories/mfbj855yynshc5q4bnwj.jpg",
  },
  {
    name: "Dresses",
    slug: "dress",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904504/miray/categories/grfdbjd6myw2ipv61trd.jpg",
  },
  {
    name: "Co-Ord Sets",
    slug: "co-ord-set",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904812/miray/categories/u89htqcj5bvbd6hjsgei.jpg",
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904780/miray/categories/jvzlbnpsw4zvep28323s.jpg",
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765905378/miray/categories/benjxokq8rnatzgmqzbg.png",
  },
  {
    name: "Winter Drops",
    slug: "winter-drops",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765905378/miray/categories/benjxokq8rnatzgmqzbg.png",
  },
  {
    name: "Skirts",
    slug: "skirt",
    image:
      "https://i.pinimg.com/1200x/11/1e/12/111e12ede388fc4eae2dd965448ef216.jpg",
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904846/miray/categories/ny48zly18zfdqwshtw8p.jpg",
  },
  {
    name: "Shirts",
    slug: "shirt",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904846/miray/categories/ny48zly18zfdqwshtw8p.jpg",
  },
  {
    name: "Hot Seller",
    tag: "best-sellers",
    video:
      "https://cdn-icons-mp4.flaticon.com/512/15595/15595824.mp4",
  },
  {
    name: "New Arrivals",
    tag: "new-arrivals",
    video:
      "https://cdn-icons-mp4.flaticon.com/512/11629/11629816.mp4",
  },
];

/* =======================
   SHIMMER UI
======================= */

function CategoryRowShimmer({ count = 8 }) {
  return (
    <div className="no-scrollbar flex items-start gap-3 px-4 overflow-x-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 flex flex-col items-center">
          <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          </div>
          <div className="mt-2 h-3 w-12 rounded bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */

export default function CategoryRow() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔥 Fake short loading for premium feel
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleNavigate = (cat) => {
    if (cat.slug) router.push(`/category/${cat.slug}`);
    if (cat.tag) router.push(`/tag/${cat.tag}`);
  };

  return (
    <section className="w-full bg-white py-4">
      {/* hide scrollbar cross-browser */}
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar{display:none}
            .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
          `,
        }}
      />

      {loading ? (
        <CategoryRowShimmer />
      ) : (
        <div className="no-scrollbar flex items-start gap-3 px-4 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleNavigate(cat)}
              aria-label={cat.name}
              className="shrink-0 flex flex-col items-center select-none transition active:scale-[0.97]"
            >
              <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-full overflow-hidden bg-black/5">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={cat.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <p className="mt-1 text-center text-[12px] md:text-[13px] font-semibold leading-tight text-black/75">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
