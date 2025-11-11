"use client";

import Image from "next/image";

const occasions = [
  {
    title: "Party Wear",
    image: "/occasions/party.jpg",
  },
  {
    title: "Casual Outfits",
    image: "/occasions/casual.jpg",
  },
  {
    title: "Formal Look",
    image: "/occasions/formal.jpg",
  },
  {
    title: "Wedding Special",
    image: "/occasions/wedding.jpg",
  },
  {
    title: "Ethnic Vibes",
    image: "/occasions/ethnic.jpg",
  },
];

export default function StyleByOccasion() {
  return (
    <section className="w-full flex flex-col bg-gray-50 py-10">
      <h2 className="text-2xl font-semibold text-gray-900 px-8 mb-6">
        Style by Occasion
      </h2>

      <div className="flex flex-row gap-6 px-8 overflow-x-auto no-scrollbar">
        {occasions.map((item, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-[250px] h-[320px] md:w-[320px] md:h-[380px] rounded-3xl overflow-hidden cursor-pointer group hover:scale-[1.03] transition-transform duration-300"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-lg font-medium tracking-wide text-center">
                {item.title}
              </p>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold text-lg md:text-xl drop-shadow-lg group-hover:hidden">
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
