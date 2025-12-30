"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";

export default function WishlistButton() {
  const store = useWishlistStore?.();
  const items = store?.items || [];

  const [animate, setAnimate] = useState(false);

  // Trigger animation when wishlist count changes
  useEffect(() => {
    if (!items || items.length === 0) return;

    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [items?.length]);

  return (
    <Link href="/wishlist" className="relative group">
      <div
        className={`
          relative transition-all duration-300
          ${animate ? "scale-[1.15] text-black" : "text-gray-700"}
          group-hover:text-black
        `}
      >
        {/* HEART ICON */}
        <Heart
          className={`w-6 h-6 transition-all duration-300 ${
            items.length > 0
              ? "fill-black text-black"
              : "text-gray-700"
          }`}
        />

        {/* subtle pulse ring */}
        {animate && (
          <span className="absolute inset-0 rounded-full ring-1 ring-black/30 animate-ping pointer-events-none"></span>
        )}
      </div>
    </Link>
  );
}
