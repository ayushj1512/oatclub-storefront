"use client";

import Image from "next/image";

const categories = [
  {
    name: "Jeans",
    image:
      "https://i.pinimg.com/736x/ac/a4/49/aca449ca9080137842c1c03cb94b0280.jpg",
  },
  {
    name: "Tops",
    image:
      "https://i.pinimg.com/736x/2c/63/cd/2c63cd73e582af47936a9f5fbca0bf4c.jpg",
  },
  {
    name: "Dresses",
    image:
      "https://i.pinimg.com/1200x/11/1e/12/111e12ede388fc4eae2dd965448ef216.jpg",
  },
  {
    name: "Accessories",
    image:
      "https://i.pinimg.com/1200x/71/98/26/71982618a6bd3be9ad0dbdd583f0caad.jpg",
  },
  {
    name: "Footwear",
    image:
      "https://i.pinimg.com/1200x/03/41/58/0341587b1bdf5b413694acdd49dbda7c.jpg",
  },
  {
    name: "Bags",
    image:
      "https://i.pinimg.com/1200x/40/ed/a2/40eda2616f4d279a5d91c4ea21716f55.jpg",
  },

  {
    name: "Hot Seller",
    video: "https://cdn-icons-mp4.flaticon.com/512/15595/15595824.mp4",
  },

  {
    name: "Star",
    video: "https://cdn-icons-mp4.flaticon.com/512/11629/11629816.mp4",
  },
];

export default function CategoryRow() {
  return (
    <section className="w-full flex flex-col bg-white py-8">
      <div className="flex flex-row gap-6 px-8 overflow-x-auto no-scrollbar">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center cursor-pointer flex-shrink-0 hover:scale-105 transition-transform duration-300"
          >
            {/* 👇 ICON SIZE UPDATED */}
            <div className="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={150}
                  height={150}
                  className="object-cover w-full h-full"
                />
              )}

              {cat.video && (
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

            <p className="mt-2 text-gray-700 font-medium text-sm md:text-base">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
  