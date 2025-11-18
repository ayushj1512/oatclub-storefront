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

    const timer = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(timer);
  }, [items?.length]);

  return (
    <Link href="/wishlist" className="relative group">
      <div
        className={`
          relative transition-all duration-300 
          ${animate ? "scale-[1.25] text-[#800020]" : "text-gray-700"}
          group-hover:text-[#800020]
        `}
      >
        {/* HEART ICON */}
        <Heart
          className={`w-6 h-6 transition-all duration-300 ${
            items.length > 0 ? "fill-[#800020] text-[#800020]" : ""
          }`}
        />

        {/* BURST SPARKLE RING */}
        {animate && (
          <span className="absolute inset-0 animate-burst pointer-events-none"></span>
        )}

        {/* Multiple Golden Sparkles */}
        {animate && (
          <>
            <span className="sparkle-gold top-0 left-1/2"></span>
            <span className="sparkle-gold top-3 right-0"></span>
            <span className="sparkle-gold bottom-1 left-2"></span>
            <span className="sparkle-gold bottom-2 right-1"></span>
          </>
        )}
      </div>

    </Link>
  );
}
