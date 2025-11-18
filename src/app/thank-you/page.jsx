"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function ThankYouPage() {
  const { cart, clearCart } = useCartStore();

  // ✅ Clear cart once order is confirmed
  useEffect(() => {
    if (cart.length > 0) {
      clearCart();
    }
  }, [cart, clearCart]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 bg-gray-50">
      {/* Success Icon */}
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
        Thank You for Your Purchase!
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Your order has been successfully placed. A confirmation email has been
        sent to your registered email address.
      </p>

      {/* Purchased Items */}
      {cart.length > 0 && (
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Your Order Summary
          </h2>

          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                </div>
                <p className="text-pink-500 font-semibold">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/collections"
          className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-3 rounded-full transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          href="/profile/orders"
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 font-medium px-6 py-3 rounded-full transition"
        >
          View Orders
        </Link>
      </div>
    </section>
  );
}
