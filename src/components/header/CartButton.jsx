"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartButton() {
  const { items } = useCartStore?.() || { items: [] };
  const cartCount = items?.length || 0;

  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const dropdownRef = useRef(null);
  const router = useRouter();

  // Trigger animation on cart updates
  useEffect(() => {
    if (!items || cartCount === 0) return;
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 650);
    return () => clearTimeout(timer);
  }, [cartCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate to cart on click
  const goToCart = () => {
    setOpen(false);
    router.push("/cart");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ICON */}
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={goToCart}
        className="relative group"
      >
        <div
          className={`transition-all duration-300 ${
            animate ? "scale-[1.25] text-[#800020]" : "text-gray-700"
          } group-hover:text-[#800020]`}
        >
          <ShoppingBag
            className={`w-5 h-5 transition-all duration-300 ${
              cartCount > 0 ? "fill-[#800020] text-[#800020]" : ""
            }`}
          />
          {animate && (
            <span className="absolute inset-0 animate-cart-burst pointer-events-none"></span>
          )}
        </div>

        {/* BADGE */}
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#800020] text-white text-xs rounded-full px-1.5 py-[1px] shadow-md">
            {cartCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-3 w-72 bg-white shadow-xl border border-gray-200 rounded-xl p-4 animate-dropdown z-50"
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Cart Items
          </h3>

          {items.length === 0 ? (
            <p className="text-gray-500 text-sm py-2">Your cart is empty.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-2"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.qty} × {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={goToCart}
            className="w-full bg-[#800020] text-white py-2 mt-4 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Go to Cart
          </button>
        </div>
      )}

   
    </div>
  );
}
