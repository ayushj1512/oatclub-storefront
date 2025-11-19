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

  // Animation effect when cart updates
  useEffect(() => {
    if (!cartCount) return;
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [cartCount]);

  // Click outside to close
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToCart = () => {
    setOpen(false);
    router.push("/cart");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon Button */}
      <button
        onClick={goToCart}
        onMouseEnter={() => setOpen(true)}
        className="relative p-1"
      >
        <ShoppingBag
          className={`
            w-6 h-6 transition-all duration-300 
            ${animate ? "scale-125 text-[#800020]" : "text-gray-700"}
            hover:text-[#800020]
          `}
        />

        {/* Badge */}
        {cartCount > 0 && (
          <span
            className="
              absolute -top-1.5 -right-1.5 
              bg-[#800020] text-white 
              text-[10px] font-medium 
              rounded-full min-w-[18px] h-[18px] 
              flex items-center justify-center 
              shadow-md
            "
          >
            {cartCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="
            absolute right-0 mt-3 w-72 
            bg-white shadow-xl border border-gray-200 
            rounded-xl p-4 z-50 
            animate-[fadeIn_.25s_ease-out]
          "
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
                    className="w-12 h-12 rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
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
            className="
              w-full bg-[#800020] text-white 
              py-2 mt-4 rounded-lg text-sm 
              font-medium hover:opacity-95 
              active:scale-95 transition
            "
          >
            Go to Cart
          </button>
        </div>
      )}
    </div>
  );
}
