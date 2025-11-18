"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function TestWishlistPage() {
  const {
    items,
    initialize,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  } = useWishlistStore();

  // Load on mount
  useEffect(() => {
    initialize();
  }, []);

  const testProduct = {
    id: 1,
    name: "Beautiful Saree",
    price: 1999,
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Wishlist Test Page</h1>

      <div className="flex gap-4 mb-6">

        {/* ADD TO WISHLIST */}
        <button
          onClick={() => addToWishlist(testProduct)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Product
        </button>

        {/* REMOVE */}
        <button
          onClick={() => removeFromWishlist(testProduct.id)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Remove Product
        </button>

        {/* CHECK */}
        <button
          onClick={() =>
            alert(isInWishlist(testProduct.id)
              ? "Product IS in wishlist"
              : "Product is NOT in wishlist")
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Check If Exists
        </button>

        {/* CLEAR */}
        <button
          onClick={clearWishlist}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Clear Wishlist
        </button>

      </div>

      {/* SHOW WISHLIST CONTENT */}
      <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="font-semibold text-lg mb-3">Current Wishlist Items:</h2>

        {items.length === 0 ? (
          <p className="text-gray-500">No items in wishlist.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-2 bg-white rounded-md mb-2 shadow">
              <p><strong>{item.name}</strong></p>
              <p>₹{item.price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
