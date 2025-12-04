"use client";

import Image from "next/image";

const occasions = [
  { title: "Party Wear", image: "https://i.pinimg.com/1200x/11/1e/12/111e12ede388fc4eae2dd965448ef216.jpg" },
  { title: "Casual Outfits", image: "https://i.pinimg.com/736x/7d/e2/a8/7de2a805d1465fb122ec158a8cbfa60b.jpg" },
  { title: "Formal Look", image: "https://i.pinimg.com/736x/c7/e6/fb/c7e6fb53816c230ee6661458da473575.jpg" },
  { title: "Wedding Special", image: "https://i.pinimg.com/736x/c9/53/0f/c9530f3deec1dcc7065a24bf8df185ef.jpg" },
  { title: "Ethnic Vibes", image: "https://i.pinimg.com/736x/70/9f/49/709f49e7717d8d8b770edf1fdffb0218.jpg" },
];

export default function StyleByOccasion() {
  return (
    <section className="w-full flex flex-col bg-gray-50 py-7 md:py-9">
      <h2 className="text-lg md:text-2xl font-extrabold text-center text-black border-b-4 border-[#800020] pb-1 w-fit mx-auto mb-5 tracking-wide uppercase">STYLE BY OCCASION</h2>

      <div className="flex flex-row gap-3 md:gap-4 px-4 md:px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {occasions.map((item, i) => (
          <div key={i} className="relative flex-shrink-0 snap-center w-[140px] h-[190px] md:w-[260px] md:h-[320px] rounded-2xl overflow-hidden cursor-pointer group bg-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <Image src={item.image} alt={item.title} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.06] group-hover:opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <p className="absolute bottom-2.5 left-0 right-0 text-center text-white font-semibold text-[12px] md:text-base tracking-wide drop-shadow-lg">{item.title}</p>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition-colors duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}
