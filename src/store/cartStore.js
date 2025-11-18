"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "cart_products";

export const useCartStore = create((set, get) => ({
  items: [],

  // ✅ Load cart from cookies
  initialize: () => {
    if (typeof window === "undefined") return;
    const stored = Cookies.get(COOKIE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set({ items: parsed });
      } catch (err) {
        console.error("Error parsing cart cookie:", err);
      }
    }
  },

  // ✅ Add product to cart
  addToCart: (product, qty = 1) => {
    if (!product || !product.id) return;

    const current = get().items;
    const exists = current.find((p) => p.id === product.id);

    let updated;

    if (exists) {
      updated = current.map((p) =>
        p.id === product.id ? { ...p, qty: p.qty + qty } : p
      );
    } else {
      updated = [{ ...product, qty }, ...current];
    }

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Remove product from cart
  removeFromCart: (id) => {
    const updated = get().items.filter((p) => p.id !== id);
    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Update quantity (min 1)
  updateQty: (id, qty) => {
    if (qty < 1) qty = 1;
    const updated = get().items.map((p) =>
      p.id === id ? { ...p, qty } : p
    );
    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  // ✅ Clear entire cart
  clearCart: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },

  // ✅ Compute total items count
  totalCount: () => {
    return get().items.reduce((acc, item) => acc + item.qty, 0);
  },

  // ✅ Compute total price
  totalPrice: () => {
    return get().items.reduce((acc, item) => {
      const priceNum = parseFloat(item.price?.replace(/[₹,]/g, "")) || 0;
      return acc + priceNum * item.qty;
    }, 0);
  },
}));
