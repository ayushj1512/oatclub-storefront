"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
      <h1 className="text-6xl font-bold text-pink-600 mb-4">404</h1>
      <p className="text-gray-700 text-lg mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        href="/"
        className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition"
      >
        Back to Home
      </Link>
    </section>
  );
}
