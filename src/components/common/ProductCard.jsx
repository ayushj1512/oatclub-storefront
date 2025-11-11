"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault(); // Prevent navigating to product when clicking wishlist
    setWishlisted(!wishlisted);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden w-[160px] sm:w-[200px] md:w-[240px]"
    >
      {/* Product Image */}
      <div className="relative w-full h-[220px] bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 hover:scale-105"
        />

        {/* Wishlist Icon */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm hover:bg-pink-50 transition"
        >
          <Heart
            className={`w-5 h-5 ${
              wishlisted ? "fill-pink-500 text-pink-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col p-3 md:p-4">
        <h3 className="text-sm md:text-base font-medium text-gray-900 truncate">
          {product.name}
        </h3>

        <p className="text-pink-500 font-semibold text-sm md:text-base mt-1">
          {product.price}
        </p>

        {product.originalPrice && (
          <p className="text-gray-400 text-xs line-through">
            {product.originalPrice}
          </p>
        )}

        {/* Optional Tag */}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
            {product.tag}
          </span>
        )}
      </div>
    </Link>
  );
}
