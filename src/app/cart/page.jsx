"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  // Mock items (replace with Zustand/API later)
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
                  : Math.max(1, item.quantity - 1),
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
    <section className="w-full min-h-[80vh] bg-gray-50 py-10 px-4">
      <div className="w-full flex flex-col md:flex-row gap-10">

        {/* LEFT — CART ITEMS */}
        <div className="flex-1 bg-white rounded-3xl shadow-md p-6 animate-fadeSlide">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your Cart
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Your cart is empty.{" "}
              <Link
                href="/shop"
                className="text-[#800020] font-medium hover:underline"
              >
                Continue Shopping →
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b pb-4 animate-itemFade"
                >
                  {/* IMAGE */}
                  <div className="relative w-[120px] h-[140px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg">
                      {item.name}
                    </h3>
                    <p className="text-[#800020] font-semibold mt-1 text-base">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, "dec")}
                      className="p-1 text-gray-700 hover:text-[#800020] transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-6 text-center text-sm font-medium text-gray-800">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, "inc")}
                      className="p-1 text-gray-700 hover:text-[#800020] transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* REMOVE */}
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

        {/* RIGHT — SUMMARY */}
        <div className="w-full md:w-[35%] bg-white rounded-3xl shadow-md p-6 h-fit animate-fadeSlide delay-150">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>

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
            className="w-full bg-[#800020] hover:bg-[#6a001a] text-white font-semibold py-3 rounded-full transition shadow-sm disabled:opacity-50"
          >
            Proceed to Checkout
          </button>

          <Link
            href="/shop"
            className="block text-center text-sm text-[#800020] font-medium mt-3 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeSlide {
          animation: fadeSlide 0.45s ease forwards;
        }
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-itemFade {
          animation: itemFade 0.45s ease forwards;
        }
        @keyframes itemFade {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
