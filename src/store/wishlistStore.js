"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { useAuthStore } from "./authStore";
import { notify } from "@/lib/notify";

const COOKIE_KEY = "wishlist_cache";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

const normalizeId = (p) => p?.id ?? p?._id;
const getDisplayName = (p) => p?.name || p?.title || "Item";

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

    // If logged in -> backend is source of truth
    if (user?.uid) {
      await get().fetchFromBackend(user.uid);
    } else {
      // fallback to cookie cache
      const stored = Cookies.get(COOKIE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) set({ items: parsed });
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
    if (!BACKEND) {
      console.error("Missing NEXT_PUBLIC_BACKEND_URL");
      return;
    }

    try {
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${firebaseUID}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Wishlist fetch failed:", data);
        notify.error(data?.message || "Failed to load wishlist");
        set({ loading: false });
        return;
      }

      if (data?.success && data?.wishlist) {
        // Your backend returns productIds populated with product objects
        const mapped = (data.wishlist.productIds || []).map((p) => ({
          id: p?._id,
          name: p?.name || p?.title || "",
          price: p?.price ?? 0,
          image: p?.images?.[0]?.src || p?.thumbnail || "",
          categories: p?.categories || [],
          tags: p?.tags || [],
        }));

        set({ items: mapped });
        Cookies.set(COOKIE_KEY, JSON.stringify(mapped), { expires: 7 });
      }

      set({ loading: false });
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      notify.error("Failed to load wishlist");
      set({ loading: false });
    }
  },

  /* ----------------------------------------------------
     ⭐ ADD TO WISHLIST
     POST /api/wishlist/firebase/:uid/add
  ---------------------------------------------------- */
  addToWishlist: async (product) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) {
      notify.info("Please login first");
      return;
    }

    const pid = normalizeId(product);
    if (!pid) return;

    // Prevent dup
    if (get().items.some((i) => String(i.id) === String(pid))) {
      notify.info("Already in wishlist");
      return;
    }

    // ✅ optimistic UI update
    const optimisticItem = {
      id: pid,
      name: product?.name || product?.title || "",
      price: product?.price ?? 0,
      image:
        product?.image ||
        product?.images?.[0]?.src ||
        product?.images?.[0] ||
        product?.thumbnail ||
        "",
      categories: product?.categories || [],
      tags: product?.tags || [],
    };

    const prev = get().items;
    const next = [optimisticItem, ...prev];

    set({ items: next, loading: true });
    Cookies.set(COOKIE_KEY, JSON.stringify(next), { expires: 7 });
    notify.wishlistAdded(optimisticItem);

    try {
      if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // rollback
        set({ items: prev, loading: false });
        Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
        notify.error(data?.message || "Failed to add to wishlist");
        return;
      }

      // Refresh from backend for truth
      await get().fetchFromBackend(user.uid);
      set({ loading: false });
    } catch (err) {
      console.error("Add to wishlist error:", err);
      // rollback
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      notify.error("Failed to add to wishlist");
    }
  },

  /* ----------------------------------------------------
     ⭐ REMOVE FROM WISHLIST
     POST /api/wishlist/firebase/:uid/remove
  ---------------------------------------------------- */
  removeFromWishlist: async (productId) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) {
      notify.info("Please login first");
      return;
    }

    const prev = get().items;
    const removedItem = prev.find((i) => String(i.id) === String(productId));
    const next = prev.filter((i) => String(i.id) !== String(productId));

    // ✅ optimistic remove
    set({ items: next, loading: true });
    Cookies.set(COOKIE_KEY, JSON.stringify(next), { expires: 7 });
    if (removedItem) notify.wishlistRemoved(removedItem);
    else notify.info(`Removed: ${getDisplayName({ id: productId })}`);

    try {
      if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // rollback
        set({ items: prev, loading: false });
        Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
        notify.error(data?.message || "Failed to remove from wishlist");
        return;
      }

      await get().fetchFromBackend(user.uid);
      set({ loading: false });
    } catch (err) {
      console.error("Remove wishlist error:", err);
      // rollback
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      notify.error("Failed to remove from wishlist");
    }
  },

  /* ----------------------------------------------------
     ⭐ CLEAR WISHLIST
  ---------------------------------------------------- */
  clearWishlist: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;

    const prev = get().items;

    // ✅ optimistic clear
    set({ items: [], loading: true });
    Cookies.remove(COOKIE_KEY);
    notify.wishlistCleared();

    try {
      if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // rollback
        set({ items: prev, loading: false });
        Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
        notify.error(data?.message || "Failed to clear wishlist");
        return;
      }

      set({ loading: false });
    } catch (err) {
      console.error("Clear wishlist error:", err);
      // rollback
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      notify.error("Failed to clear wishlist");
    }
  },

  /* ----------------------------------------------------
     ⭐ CHECK IF PRODUCT IS IN WISHLIST
  ---------------------------------------------------- */
  isInWishlist: (id) => {
    return (get().items || []).some((item) => String(item.id) === String(id));
  },
}));
