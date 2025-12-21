"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
export const categories = [
  // 🔹 Core collections
  {
    name: "All Clothing",
    slug: "all-clothing",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904932/miray/categories/mfbj855yynshc5q4bnwj.jpg",
  },
  {
    name: "Jeans",
    slug: "bottom",
    image:
      "https://res.cloudinary.com/djtva6hec/image/upload/v1765904566/miray/categories/wfv7zp5vstpddcrro58s.jpg",
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

  // 🔹 Fashion types
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

  // 🔹 Bottom wear
  {
    name: "Skirts",
    slug: "skirt",
    image:
      "https://i.pinimg.com/1200x/11/1e/12/111e12ede388fc4eae2dd965448ef216.jpg",
  },
  {
    name: "Shorts",
    slug: "shorts",
    image:
      "https://i.pinimg.com/736x/ac/a4/49/aca449ca9080137842c1c03cb94b0280.jpg",
  },
  {
    name: "Leggings",
    slug: "leggings",
    image:
      "https://i.pinimg.com/736x/ac/a4/49/aca449ca9080137842c1c03cb94b0280.jpg",
  },

  // 🔹 Tops sub-types (kept minimal)
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

  // 🔥 SPECIAL / PROMOTIONAL (TAG-BASED → /tag/[tag])
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



export default function CategoryRow() {
  const router = useRouter();

  const handleNavigate = (cat) => {
    if (cat.slug) {
      router.push(`/category/${cat.slug}`);
      return;
    }
    if (cat.tag) {
      router.push(`/tag/${cat.tag}`);
      return;
    }
  };

  return (
    <section className="w-full bg-white py-4">
  {/* hide scrollbar cross-browser */}
  <style
    suppressHydrationWarning
    dangerouslySetInnerHTML={{
      __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`,
    }}
  />

  <div className="no-scrollbar flex items-start gap-3 px-4 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain">
    {categories.map((cat) => (
      <button
        key={cat.name}
        type="button"
        className="shrink-0 flex flex-col items-center justify-start select-none transition active:scale-[0.97]"
        onClick={() => handleNavigate(cat)}
        aria-label={cat.name}
      >
        <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-black/[0.04] md:w-[92px] md:h-[92px]">
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

        <p className="mt-1 text-center text-[12px] font-semibold leading-tight text-black/75 md:text-[13px]">
          {cat.name}
        </p>
      </button>
    ))}
  </div>
</section>

  );
}
