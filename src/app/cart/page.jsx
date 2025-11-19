"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const BURGUNDY = "#800020";

export default function CartPage() {
  const {
    items,
    updateQty,
    removeFromCart,
    initialize,
    totalPrice,
  } = useCartStore();

  // Initialize cart store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const subtotal = totalPrice();

  return (
    <section className="w-full min-h-[80vh] bg-gray-50 py-10 px-4">
      <div className="w-full flex flex-col md:flex-row gap-10">

        {/* LEFT — CART ITEMS */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg p-6 animate-fadeSlide">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cart</h2>

          {items.length === 0 ? (
            <p className="text-gray-600 text-center py-14 text-lg">
              Your cart is empty.{" "}
              <Link
                href="/shop"
                className="text-[#800020] font-medium hover:underline"
              >
                Continue shopping →
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-7 w-full">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b pb-5 w-full"
                >
                  {/* IMAGE */}
                  <div className="relative w-[120px] h-[140px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image
                      src={item.image || item.images?.[0]?.src}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 text-center sm:text-left px-1">
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg leading-tight">
                      {item.name}
                    </h3>

                    <p className="text-[#800020] font-semibold mt-1 text-lg">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-1.5 shadow-sm">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="p-1 text-gray-700 hover:text-[#800020] transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-7 text-center text-sm font-semibold text-gray-900">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="p-1 text-gray-700 hover:text-[#800020] transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="w-full md:w-[35%] bg-white rounded-3xl shadow-lg p-6 h-fit animate-fadeSlide delay-150">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>

          <div className="flex justify-between text-gray-700 mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-gray-700 mb-2">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex justify-between font-semibold text-gray-900 text-lg mb-6">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          {/* CHECKOUT BUTTON */}
          <button
            disabled={items.length === 0}
            className="w-full bg-[#800020] hover:bg-[#6a001a] text-white font-semibold py-3 rounded-full text-base shadow-md transition disabled:opacity-50"
          >
            Proceed to Checkout
          </button>

          <Link
            href="/shop"
            className="block text-center text-sm text-[#800020] font-medium mt-4 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
