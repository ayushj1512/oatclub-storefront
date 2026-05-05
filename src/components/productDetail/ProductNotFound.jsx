"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, PackageX } from "lucide-react";

export default function ProductNotFound({
  title = "Sorry, this product is unavailable",
  subtitle = "It may have been removed or is no longer active.",
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <PackageX className="h-6 w-6 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold text-black">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mt-1.5 text-sm text-gray-500">
          {subtitle}
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:opacity-90 transition active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}