"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const wishlist = items || []; // prevent undefined issues

  return (
    <section className="w-full flex flex-col px-6 py-10 bg-gray-50 min-h-[80vh]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#800020]" />
          Your Wishlist
        </h2>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {wishlist.length} item{wishlist.length > 1 ? "s" : ""}
            </p>

            <button
              onClick={clearWishlist}
              className="text-sm text-gray-500 hover:text-red-600 transition"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Heart className="w-12 h-12 text-gray-300 mb-3" />
          
          <p className="text-gray-500 text-lg mb-3">
            Your wishlist is empty.
          </p>

          <Link
            href="/collections"
            className="bg-[#800020] hover:bg-[#6a0018] text-white font-medium px-6 py-3 rounded-full transition"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        
        /* PRODUCT GRID */
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-md transition w-[160px] md:w-[220px] overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative w-full h-[220px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* PRODUCT INFO */}
              <div className="flex flex-col justify-between p-3 h-full">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>

                  <p className="text-[#800020] font-semibold text-sm md:text-base">
                    ₹{item.price?.toLocaleString?.() ?? item.price}
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={() => moveToCart(item)}
                    className="flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#6a0018] text-white text-sm font-medium py-2 rounded-full transition"
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
