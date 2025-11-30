"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "recently_viewed_products";
const MAX_ITEMS = 50; // 🔥 Increased limit

export const useRecentlyViewedStore = create((set, get) => ({

  items: [],

  /* -----------------------------------------------
     LOAD FROM COOKIE (Safe)
  ------------------------------------------------ */
  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = Cookies.get(COOKIE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);

      // Validate images safely
      const cleaned = parsed.filter((p) => {
        const img =
          p?.images?.[0]?.src ||
          p?.image ||
          "";
        return typeof img === "string" && img.length > 5;
      });

      set({ items: cleaned });
    } catch {
      set({ items: [] });
    }
  },

  /* -----------------------------------------------
     ADD PRODUCT (Full Product Object Stored)
     - Safe against infinite loops
     - Merges missing data
  ------------------------------------------------ */
  addProduct: (product) => {
    if (!product?.id) return;

    const items = get().items;

    // Prevent re-run updating infinite loop
    if (items[0]?.id === product.id) return;

    const img =
      product?.images?.[0]?.src ||
      product?.image ||
      "/placeholder.png";

    // Ensure image is valid
    if (!img || typeof img !== "string" || img.length < 6) return;

    // Store FULL object — but ensure required fields exist
    const safeProduct = {
      ...product, // ← full product stored
      id: product.id,
      name: product.name || "Product",
      price: product.price || 0,
      slug:
        product.slug ||
        product.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
        String(product.id),
      categories: product.categories || [],
      images: product.images?.length
        ? product.images
        : [{ src: img }],
      image: img,
    };

    // Remove duplicate entries
    const filtered = items.filter((p) => p.id !== product.id);

    // Add product to top
    const updated = [safeProduct, ...filtered].slice(0, MAX_ITEMS);

    set({ items: updated });

    Cookies.set(COOKIE_KEY, JSON.stringify(updated), {
      expires: 7,
      sameSite: "Lax",
    });
  },

  /* -----------------------------------------------
     REMOVE
  ------------------------------------------------ */
  removeProduct: (id) => {
    const updated = get().items.filter((p) => p.id !== id);
    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  /* -----------------------------------------------
     CLEAR ALL
  ------------------------------------------------ */
  clear: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },

}));
