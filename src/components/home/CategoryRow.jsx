"use client";

import Image from "next/image";

const categories = [
  {
    name: "Dresses",
    image: "/categories/dress.jpg",
  },
  {
    name: "Tops",
    image: "/categories/top.jpg",
  },
  {
    name: "Jeans",
    image: "/categories/jeans.jpg",
  },
  {
    name: "Accessories",
    image: "/categories/accessories.jpg",
  },
  {
    name: "Footwear",
    image: "/categories/shoes.jpg",
  },
  {
    name: "Bags",
    image: "/categories/bag.jpg",
  },
];

export default function CategoryRow() {
  return (
    <section className="w-full flex flex-col bg-white py-8">
      <h2 className="text-2xl font-semibold text-gray-900 px-8 mb-4">
        Shop by Category
      </h2>

      <div className="flex flex-row gap-6 px-8 overflow-x-auto no-scrollbar">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center cursor-pointer flex-shrink-0 hover:scale-105 transition-transform duration-300"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={cat.image}
                alt={cat.name}
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="mt-3 text-gray-700 font-medium text-base">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
