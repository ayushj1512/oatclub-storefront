"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "wishlist_products";

export const useWishlistStore = create((set, get) => ({
  items: [],            // every item now stores categories & tags too
  initialized: false,   // load once only

  // ✅ Initialize (load from cookies safely)
  initialize: () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return;

    const stored = Cookies.get(COOKIE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // ensure each item has categories array
        const sanitized = Array.isArray(parsed)
          ? parsed.map((p) => ({
              ...p,
              categories: p.categories || [],
              tags: p.tags || [],
            }))
          : [];

        set({ items: sanitized });
      } catch (error) {
        console.error("❌ Wishlist cookie parse error:", error);
      }
    }

    set({ initialized: true });
  },

  // ✅ Add item (store categories + tags explicitly)
  addToWishlist: (product) => {
    if (!product || !product.id) return;

    const { items } = get();
    const exists = items.some((p) => p.id === product.id);
    if (exists) return;

    const newItem = {
      ...product,
      categories: product.categories || [],
      tags: product.tags || [],
    };

    const updated = [newItem, ...items];
    set({ items: updated });

    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Remove
  removeFromWishlist: (id) => {
    const { items } = get();
    const updated = items.filter((p) => p.id !== id);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Clear
  clearWishlist: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },

  // ✅ Exists?
  isInWishlist: (id) => {
    const { items } = get();
    return items.some((p) => p.id === id);
  },
}));
