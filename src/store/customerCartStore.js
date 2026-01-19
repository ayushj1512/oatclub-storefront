"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/authStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// Guest storage key
const GUEST_KEY = "guest_cart_adds_product_codes";
const CAP = 80;

const clean = (v) => String(v ?? "").trim();

const safeJsonParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const readGuest = () => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(GUEST_KEY);
  const arr = safeJsonParse(raw || "[]", []);
  return Array.isArray(arr) ? arr.map(clean).filter(Boolean) : [];
};

const writeGuest = (codes) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(codes));
  } catch {
    // no-op
  }
};

const clearGuest = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // no-op
  }
};

const dedupeRecentFirst = (arr) => arr.filter((v, i, a) => a.indexOf(v) === i).slice(0, CAP);

const getCustomerId = () => {
  const auth = useAuthStore.getState();
  return auth?.customer?._id || null;
};

export const useCustomerCartStore = create((set, get) => ({
  guestProductCodes: [],
  loading: false,
  error: null,
  _mergedOnceForCustomerId: null,

  /* ---------------- INIT ---------------- */
  initialize: () => {
    const guest = readGuest();
    set({ guestProductCodes: guest });
  },

  /* ----------------------------------------------------
     Guest: add/remove (always works)
  ----------------------------------------------------- */
  addGuestProductCode: (productCode) => {
    const code = clean(productCode);
    if (!code) return;

    const curr = readGuest();
    const next = dedupeRecentFirst([code, ...curr.filter((x) => x !== code)]);

    writeGuest(next);
    set({ guestProductCodes: next });
  },

  removeGuestProductCode: (productCode) => {
    const code = clean(productCode);
    if (!code) return;

    const curr = readGuest();
    const next = curr.filter((x) => x !== code);

    writeGuest(next);
    set({ guestProductCodes: next });
  },

  clearGuest: () => {
    clearGuest();
    set({ guestProductCodes: [] });
  },

  /* ----------------------------------------------------
     API helper
  ----------------------------------------------------- */
  _post: async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || `Request failed: ${res.status}`);
    }

    return data;
  },

  /* ----------------------------------------------------
     Add CartAdd (productCode)
     - Always store in guest for safety
     - If logged in -> also store in DB
  ----------------------------------------------------- */
  addCartAdd: async (productCode) => {
    const code = clean(productCode);
    if (!code) return null;

    // Always keep guest record
    get().addGuestProductCode(code);

    const customerId = getCustomerId();
    if (!customerId) return { guestOnly: true };

    try {
      set({ loading: true, error: null });

      const data = await get()._post(`${BACKEND}/api/customers/${customerId}/cart-adds/add`, { productCode: code });

      set({ loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to add cartAdd" });
      return null;
    }
  },

  /* ----------------------------------------------------
     Remove CartAdd (productCode)
     - Always remove from guest
     - If logged in -> remove from DB too
  ----------------------------------------------------- */
  removeCartAdd: async (productCode) => {
    const code = clean(productCode);
    if (!code) return null;

    // Always update guest
    get().removeGuestProductCode(code);

    const customerId = getCustomerId();
    if (!customerId) return { guestOnly: true };

    try {
      set({ loading: true, error: null });

      const data = await get()._post(`${BACKEND}/api/customers/${customerId}/cart-adds/remove`, { productCode: code });

      set({ loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to remove cartAdd" });
      return null;
    }
  },

  /* ----------------------------------------------------
     Merge guest cartAdds into logged-in customer
     Call this ONCE after login success.
  ----------------------------------------------------- */
  mergeGuestCartAdds: async () => {
    const customerId = getCustomerId();
    if (!customerId) return null;

    if (get()._mergedOnceForCustomerId === customerId) return null;

    const guestCodes = readGuest();
    if (!guestCodes.length) {
      set({ _mergedOnceForCustomerId: customerId });
      return null;
    }

    try {
      set({ loading: true, error: null });

      const data = await get()._post(`${BACKEND}/api/customers/${customerId}/cart-adds/merge`, { productCodes: guestCodes });

      clearGuest();
      set({ guestProductCodes: [], loading: false, _mergedOnceForCustomerId: customerId });

      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to merge cartAdds" });
      return null;
    }
  },
}));
