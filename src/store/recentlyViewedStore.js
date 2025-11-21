"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_KEY = "recently_viewed_products";

export const useRecentlyViewedStore = create((set, get) => ({

  items: [],

  /* ---------------------------------------------------
     ✅ Initialize from cookies (client ONLY)
  --------------------------------------------------- */
  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = Cookies.get(COOKIE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Filter out broken entries
        const cleaned = parsed.filter((p) => {
          const img =
            p?.images?.[0]?.src ||
            p?.image ||
            "/placeholder.png";
          return img && typeof img === "string" && img.length > 5;
        });

        set({ items: cleaned });
      }
    } catch (err) {
      console.error("Error parsing recently viewed cookies", err);
      set({ items: [] });
    }
  },

  /* ---------------------------------------------------
     ✅ Add a product safely
     - Ensures valid image
     - Ensures slug exists
     - Ensures categories exist
     - Prevent SSR hydration mismatches
  --------------------------------------------------- */
  addProduct: (product) => {
    if (!product || !product.id) return;

    // Ensure safe image
    const img =
      product?.images?.[0]?.src ||
      product?.image ||
      "/placeholder.png";

    if (!img || typeof img !== "string" || img.length < 6) return;

    const safeProduct = {
      id: product.id,
      name: product.name || "Product",
      price: product.price || 0,
      slug:
        product.slug ||
        product.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
        product.id,
      categories: product.categories || [],
      images: product.images || [{ src: img }],
      image: img, // always store safe image
    };

    const current = get().items;
    const exists = current.find((p) => p.id === safeProduct.id);

    let updated;

    if (exists) {
      // Move existing to front
      updated = [
        exists,
        ...current.filter((p) => p.id !== safeProduct.id),
      ];
    } else {
      // Add new at front
      updated = [safeProduct, ...current];
    }

    // Keep only latest 10
    updated = updated.slice(0, 10);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  /* ---------------------------------------------------
     ✅ Remove a product
  --------------------------------------------------- */
  removeProduct: (id) => {
    const updated = get().items.filter((p) => p.id !== id);

    set({ items: updated });
    Cookies.set(COOKIE_KEY, JSON.stringify(updated), { expires: 7 });
  },

  /* ---------------------------------------------------
     ✅ Clear all Recently Viewed
  --------------------------------------------------- */
  clear: () => {
    set({ items: [] });
    Cookies.remove(COOKIE_KEY);
  },

}));
