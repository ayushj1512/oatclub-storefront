"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { useAuthStore } from "./authStore";

const COOKIE_KEY = "wishlist_cache";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useWishlistStore = create((set, get) => ({
  items: [],
  initialized: false,
  loading: false,

  /* ----------------------------------------------------
     ⭐ INIT — Load from backend or fallback to cookies
  ---------------------------------------------------- */
  initialize: async () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return;

    const { user } = useAuthStore.getState();
    if (user?.uid) {
      await get().fetchFromBackend(user.uid);
    } else {
      // fallback to cookie cache
      const stored = Cookies.get(COOKIE_KEY);
      if (stored) {
        try {
          set({ items: JSON.parse(stored) });
        } catch (e) {
          console.error("Wishlist cookie error:", e);
        }
      }
    }

    set({ initialized: true });
  },

  /* ----------------------------------------------------
     ⭐ FETCH FROM BACKEND
     GET /api/wishlist/firebase/:uid
  ---------------------------------------------------- */
  fetchFromBackend: async (firebaseUID) => {
    try {
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${firebaseUID}`);
      const data = await res.json();

      if (data.success && data.wishlist) {
        const mapped = data.wishlist.productIds.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.images?.[0]?.src || "",
          categories: p.categories || [],
          tags: p.tags || [],
        }));

        set({ items: mapped });
        Cookies.set(COOKIE_KEY, JSON.stringify(mapped), { expires: 7 });
      }

      set({ loading: false });
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      set({ loading: false });
    }
  },

  /* ----------------------------------------------------
     ⭐ ADD TO WISHLIST
     POST /api/wishlist/firebase/:uid/add
  ---------------------------------------------------- */
  addToWishlist: async (product) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return alert("Please login first");

    try {
      set({ loading: true });

      await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      // Refresh
      await get().fetchFromBackend(user.uid);

      set({ loading: false });
    } catch (err) {
      console.error("Add to wishlist error:", err);
      set({ loading: false });
    }
  },

  /* ----------------------------------------------------
     ⭐ REMOVE FROM WISHLIST
     POST /api/wishlist/firebase/:uid/remove
  ---------------------------------------------------- */
  removeFromWishlist: async (productId) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return alert("Please login first");

    try {
      set({ loading: true });

      await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      await get().fetchFromBackend(user.uid);

      set({ loading: false });
    } catch (err) {
      console.error("Remove wishlist error:", err);
      set({ loading: false });
    }
  },

  /* ----------------------------------------------------
     ⭐ CLEAR WISHLIST
  ---------------------------------------------------- */
  clearWishlist: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;

    try {
      set({ loading: true });

      await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}`, {
        method: "DELETE",
      });

      set({ items: [], loading: false });
      Cookies.remove(COOKIE_KEY);
    } catch (err) {
      console.error("Clear wishlist error:", err);
      set({ loading: false });
    }
  },

  /* ----------------------------------------------------
     ⭐ CHECK IF PRODUCT IS IN WISHLIST
  ---------------------------------------------------- */
  isInWishlist: (id) => {
    return get().items.some((item) => item.id === id);
  },
}));
