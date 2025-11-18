"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "wishlist_products";

export const useWishlistStore = create((set, get) => ({
  items: [],            // Always safe
  initialized: false,   // Prevents multiple initial loads

  // ✅ Initialize store safely (load from cookies)
  initialize: () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return; // Prevent reloading

    const stored = Cookies.get(COOKIE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ items: parsed });
        }
      } catch (error) {
        console.error("❌ Wishlist cookie parse error:", error);
      }
    }

    set({ initialized: true });
  },

  // ✅ Add item
  addToWishlist: (product) => {
    if (!product || !product.id) return;

    const { items } = get();
    const exists = items.some((p) => p.id === product.id);
    if (exists) return;

    const updated = [product, ...items];
    set({ items: updated });

    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Remove item
  removeFromWishlist: (id) => {
    const { items } = get();
    const updated = items.filter((p) => p.id !== id);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Clear all
  clearWishlist: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },

  // ✅ Check if item exists
  isInWishlist: (id) => {
    const { items } = get();
    return items.some((p) => p.id === id);
  },
}));
