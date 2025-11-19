"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const KEY = "cart_products";

export const useCartStore = create((set, get) => ({
  items: [],

  // INIT
  initialize: () => {
    console.log("🟡 Cart Init");
    if (typeof window === "undefined") return;

    const stored = Cookies.get(KEY);
    if (!stored) return console.log("ℹ️ No cart cookie found");

    try {
      const data = JSON.parse(stored);
      if (Array.isArray(data)) {
        console.log("🟢 Loaded cart from cookie:", data);
        set({ items: data });
      }
    } catch (e) {
      console.error("❌ Cookie parse error:", e);
    }
  },

  // ADD
  addToCart: (product, qty = 1) => {
    console.log("➕ Add to Cart:", product, "Qty:", qty);
    if (!product?.id) return console.log("❌ No product ID");

    const curr = get().items;
    const exists = curr.find((p) => p.id === product.id);

    const updated = exists
      ? curr.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p))
      : [{ ...product, qty }, ...curr];

    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

    console.log("🛒 Updated Cart:", updated);
  },

  // REMOVE
  removeFromCart: (id) => {
    console.log("🗑 Remove Item:", id);
    const updated = get().items.filter((p) => p.id !== id);
    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });
    console.log("🛒 After Remove:", updated);
  },

  // UPDATE QTY
  updateQty: (id, qty) => {
    console.log("🔄 Update Qty:", id, "→", qty);
    if (qty < 1) qty = 1;

    const updated = get().items.map((p) =>
      p.id === id ? { ...p, qty } : p
    );

    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });
    console.log("🛒 After Qty Update:", updated);
  },

  // CLEAR
  clearCart: () => {
    console.log("🧹 Clear Cart");
    set({ items: [] });
    Cookies.remove(KEY);
  },

  totalCount: () => {
    const count = get().items.reduce((s, i) => s + i.qty, 0);
    console.log("📦 Total Count:", count);
    return count;
  },

  totalPrice: () => {
    const total = get().items.reduce((sum, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[₹,]/g, "")) || 0
          : parseFloat(item.price) || 0;

      return sum + price * item.qty;
    }, 0);

    console.log("💰 Total Price:", total);
    return total;
  },
}));
