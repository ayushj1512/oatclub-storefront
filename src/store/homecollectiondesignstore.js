"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ---------------- ENV / API ---------------- */
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim().replace(/\/+$/, "");
const API_HOME = BASE ? `${BASE}/api/home-collections` : "/api/home-collections";
const API_PRODUCTS = BASE ? `${BASE}/api/products` : "/api/products";

/* ---------------- helpers ---------------- */
const str = (v) => (v == null ? "" : String(v)).trim();
const lower = (v) => str(v).toLowerCase();

export const toImgSrc = (imageUrl) => {
  const u = str(imageUrl);
  if (!u) return "/placeholder.png";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (!BASE) return u;
  return `${BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: text || "Invalid JSON" };
  }
};

const apiFetch = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  const data = await safeJson(res);

  if (!res.ok || data?.ok === false) {
    const err = new Error(data?.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data;
};

const normalizeSlug = (s) =>
  lower(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ---------------- STORE ---------------- */

export const useHomeCollectionDesignStore = create(
  persist(
    (set, get) => ({
      /* ---------- global ---------- */
      isLoading: false,
      error: "",
      setLoading: (v) => set({ isLoading: !!v }),
      setError: (msg) => set({ error: str(msg) }),
      clearError: () => set({ error: "" }),

      /* ---------- collections ---------- */
      activeHomeCollections: [],
      selectedHomeCollection: null,

      /* ===== PUBLIC ===== */

      fetchActiveHomeCollections: async () => {
        set({ isLoading: true, error: "" });
        try {
          const data = await apiFetch(`${API_HOME}/public`);
          set({ activeHomeCollections: data.items || [] });
          return data.items || [];
        } catch (e) {
          set({ error: e.message });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      fetchHomeCollectionBySlug: async (slug) => {
        const s = normalizeSlug(slug);
        set({ isLoading: true, error: "" });
        try {
          const data = await apiFetch(`${API_HOME}/public/slug/${s}`);
          set({ selectedHomeCollection: data.item });
          return data.item;
        } catch (e) {
          set({ error: e.message, selectedHomeCollection: null });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /* ---------- cart ---------- */
      cartItems: [],
      cartCount: 0,
      cartSubtotal: 0,

      addToCart: (item, qty = 1) => {
        const id = str(item?.id || item?._id);
        if (!id) return;

        const existing = get().cartItems.find((x) => x.id === id);

        let updated;

        if (existing) {
          updated = get().cartItems.map((x) =>
            x.id === id ? { ...x, qty: x.qty + qty } : x
          );
        } else {
          updated = [
            ...get().cartItems,
            {
              id,
              name: str(item?.name),
              price: Number(item?.price || 0),
              imageUrl: str(item?.imageUrl),
              qty,
            },
          ];
        }

        const subtotal = updated.reduce(
          (sum, x) => sum + x.price * x.qty,
          0
        );

        const count = updated.reduce((sum, x) => sum + x.qty, 0);

        set({
          cartItems: updated,
          cartSubtotal: subtotal,
          cartCount: count,
        });
      },

      removeFromCart: (id) => {
        const updated = get().cartItems.filter((x) => x.id !== id);

        const subtotal = updated.reduce(
          (sum, x) => sum + x.price * x.qty,
          0
        );

        const count = updated.reduce((sum, x) => sum + x.qty, 0);

        set({
          cartItems: updated,
          cartSubtotal: subtotal,
          cartCount: count,
        });
      },

      clearCart: () =>
        set({
          cartItems: [],
          cartSubtotal: 0,
          cartCount: 0,
        }),
    }),
    {
      name: "homecollectiondesignstore", // ✅ storage key changed
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartCount: state.cartCount,
        cartSubtotal: state.cartSubtotal,
      }),
    }
  )
);
