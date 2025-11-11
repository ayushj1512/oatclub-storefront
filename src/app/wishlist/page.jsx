"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: "Elegant Chiffon Saree",
      price: 2499,
      image: "/products/saree.jpg",
    },
    {
      id: 2,
      name: "Denim Crop Jacket",
      price: 1899,
      image: "/products/jacket.jpg",
    },
    {
      id: 3,
      name: "Classic White Kurti Set",
      price: 1599,
      image: "/products/kurti.jpg",
    },
  ]);

  const removeFromWishlist = (id) =>
    setWishlist((prev) => prev.filter((item) => item.id !== id));

  const moveToCart = (id) => {
    // 💡 Later integrate backend: add to cart API then remove from wishlist
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    alert("Item moved to cart!");
  };

  return (
    <section className="w-full flex flex-col px-6 py-10 bg-gray-50 min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500" />
          Your Wishlist
        </h2>
        {wishlist.length > 0 && (
          <p className="text-sm text-gray-500">{wishlist.length} items saved</p>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Heart className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg mb-3">
            Your wishlist is empty.
          </p>
          <Link
            href="/shop"
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-3 rounded-full transition"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-md transition w-[160px] md:w-[220px] overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative w-full h-[220px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between p-3 h-full">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-pink-500 font-semibold text-sm md:text-base">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={() => moveToCart(item.id)}
                    className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-2 rounded-full transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-full transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
