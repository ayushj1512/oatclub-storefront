"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";

const collectionsData = [
  {
    id: 1,
    name: "Festive Luxe",
    description: "Embrace elegance with our festive silk and zari collection.",
    image: "/collections/festive.jpg",
  },
  {
    id: 2,
    name: "Everyday Essentials",
    description: "Comfort meets style in our curated daily wear collection.",
    image: "/collections/everyday.jpg",
  },
  {
    id: 3,
    name: "Wedding Edit",
    description: "Traditional craftsmanship for your most special moments.",
    image: "/collections/wedding.jpg",
  },
  {
    id: 4,
    name: "Summer Bloom",
    description: "Light, breezy, and radiant — perfect for summer outings.",
    image: "/collections/summer.jpg",
  },
];

export default function CollectionsPage() {
  const [filter, setFilter] = useState("All");

  const filteredCollections =
    filter === "All"
      ? collectionsData
      : collectionsData.filter((c) => c.name.includes(filter));

  return (
    <section className="w-full bg-gray-50 min-h-screen flex flex-col">
      {/* 🏞 Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <Image
          src="/banners/collections-banner.jpg"
          alt="Collections Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3">
            Our Collections
          </h1>
          <p className="text-gray-200 text-sm md:text-base max-w-2xl">
            Discover timeless elegance in every piece — from festive ensembles
            to everyday luxury, crafted for the modern you.
          </p>
        </div>
      </div>

      {/* 🧭 Filter Bar */}
      <div className="w-full flex justify-between items-center bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-800">Explore</h2>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-xl text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option>All</option>
            <option>Festive Luxe</option>
            <option>Everyday Essentials</option>
            <option>Wedding Edit</option>
            <option>Summer Bloom</option>
          </select>
        </div>
      </div>

      {/* 🧵 Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6 md:p-10">
        {filteredCollections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="relative w-full h-64">
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex flex-col items-start">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {collection.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {collection.description}
              </p>
              <Link
                href={`/collections/${collection.id}`}
                className="text-pink-500 text-sm font-medium hover:underline"
              >
                View Collection →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
