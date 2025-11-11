"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  // ✅ Mock cart items — replace later with backend data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Floral Summer Dress",
      price: 1299,
      quantity: 1,
      image: "/products/dress1.jpg",
    },
    {
      id: 2,
      name: "Classic Denim Jacket",
      price: 1899,
      quantity: 1,
      image: "/products/jacket.jpg",
    },
  ]);

  const updateQuantity = (id, type) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                type === "inc"
                  ? item.quantity + 1
                  : item.quantity > 1
                  ? item.quantity - 1
                  : 1,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <section className="w-full flex flex-col md:flex-row justify-between px-6 py-10 bg-gray-50 min-h-[80vh] gap-10">
      {/* CART ITEMS */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Your cart is empty.{" "}
            <Link href="/shop" className="text-pink-500 font-medium hover:underline">
              Continue Shopping →
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b pb-4"
              >
                {/* Product Image */}
                <div className="relative w-[120px] h-[140px] rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                    {item.name}
                  </h3>
                  <p className="text-pink-500 font-semibold mt-1">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-full px-3 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, "dec")}
                    className="p-1 text-gray-700 hover:text-pink-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, "inc")}
                    className="p-1 text-gray-700 hover:text-pink-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUMMARY SECTION */}
      <div className="w-full md:w-[35%] flex flex-col bg-white rounded-3xl shadow-sm p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="flex justify-between text-gray-700 mb-3">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-700 mb-3">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>

        <div className="border-t border-gray-200 my-3"></div>

        <div className="flex justify-between font-semibold text-gray-900 text-lg mb-6">
          <span>Total</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>

        <button
          disabled={cartItems.length === 0}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full transition disabled:opacity-50"
        >
          Proceed to Checkout
        </button>

        <Link
          href="/shop"
          className="text-sm text-center text-pink-500 font-medium mt-3 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>
    </section>
  );
}
