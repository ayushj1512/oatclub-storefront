"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "recently_viewed_products";

export const useRecentlyViewedStore = create((set, get) => ({
  items: [],

  // ---------------------------------------------------
  // ✅ Initialize store from cookies (run on client)
  // ---------------------------------------------------
  initialize: () => {
    if (typeof window === "undefined") return;

    const stored = Cookies.get(COOKIE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set({ items: parsed });
      } catch (err) {
        console.error("Error parsing recently viewed cookies", err);
      }
    }
  },

  // ---------------------------------------------------
  // ✅ Add product (moves existing ones to the front)
  // ---------------------------------------------------
  addProduct: (product) => {
    if (!product || !product.id) return;

    const current = get().items;
    const exists = current.find((p) => p.id === product.id);
    let updated;

    if (exists) {
      // Move to front
      updated = [exists, ...current.filter((p) => p.id !== product.id)];
    } else {
      updated = [product, ...current];
    }

    // Keep last 10 only
    updated = updated.slice(0, 10);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ---------------------------------------------------
  // ✅ Remove a single product from recently viewed
  // ---------------------------------------------------
  removeProduct: (id) => {
    const current = get().items;
    const updated = current.filter((p) => p.id !== id);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ---------------------------------------------------
  // ✅ Clear all
  // ---------------------------------------------------
  clear: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },
}));
