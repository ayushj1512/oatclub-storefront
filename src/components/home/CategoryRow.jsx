"use client";

import Image from "next/image";

const categories = [
  { name: "Jeans", image: "https://i.pinimg.com/736x/ac/a4/49/aca449ca9080137842c1c03cb94b0280.jpg" },
  { name: "Tops", image: "https://i.pinimg.com/736x/2c/63/cd/2c63cd73e582af47936a9f5fbca0bf4c.jpg" },
  { name: "Dresses", image: "https://i.pinimg.com/1200x/11/1e/12/111e12ede388fc4eae2dd965448ef216.jpg" },
  { name: "Accessories", image: "https://i.pinimg.com/1200x/71/98/26/71982618a6bd3be9ad0dbdd583f0caad.jpg" },
  { name: "Footwear", image: "https://i.pinimg.com/1200x/03/41/58/0341587b1bdf5b413694acdd49dbda7c.jpg" },
  { name: "Bags", image: "https://i.pinimg.com/1200x/40/ed/a2/40eda2616f4d279a5d91c4ea21716f55.jpg" },
  { name: "Hot Seller", video: "https://cdn-icons-mp4.flaticon.com/512/15595/15595824.mp4" },
  { name: "Star", video: "https://cdn-icons-mp4.flaticon.com/512/11629/11629816.mp4" },
];

export default function CategoryRow() {
  return (
    <section className="w-full bg-white py-3">
      {/* inline global CSS (NOT styled-jsx) */}
      <style
        // avoids any hydration warning if dev tools inject anything odd
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar{display:none}
            .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
          `,
        }}
      />

      <div className="no-scrollbar flex items-center gap-3 px-4 overflow-x-auto snap-x snap-mandatory">
        {categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className="snap-start shrink-0 flex flex-col items-center justify-center select-none active:scale-[0.98] transition"
            onClick={() => {}}
            aria-label={cat.name}
          >
            <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-full overflow-hidden bg-black/[0.04]">
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

            <p className="mt-1 text-[12px] md:text-[13px] font-semibold text-black/75 leading-tight">
              {cat.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
