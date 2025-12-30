"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";

const DARK_RED = "#800020";

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
        className={`relative transition-all duration-300 ${
          animate ? "scale-[1.15]" : ""
        }`}
        style={{
          color: animate ? DARK_RED : "#4b5563", // gray-600
        }}
      >
        {/* HEART ICON */}
        <Heart
          className="w-6 h-6 transition-all duration-300"
          style={{
            color: items.length > 0 ? DARK_RED : "#4b5563",
            fill: items.length > 0 ? DARK_RED : "none",
          }}
        />

        {/* subtle pulse ring */}
        {animate && (
          <span
            className="absolute inset-0 rounded-full ring-1 animate-ping pointer-events-none"
            style={{ ringColor: DARK_RED }}
          />
        )}
      </div>
    </Link>
  );
}
