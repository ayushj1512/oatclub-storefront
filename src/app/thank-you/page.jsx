"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";

export default function ThankYouPage() {
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

      {/* Dummy Order Box */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Order Summary
        </h2>

        <p className="text-gray-500 text-sm">
          Order details will appear here once integrated with backend.
        </p>
      </div>

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
