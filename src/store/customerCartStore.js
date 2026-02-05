// src/store/customerCartStore.js
"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/authStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ✅ Guest storage key (now stores items, not just codes)
const GUEST_KEY = "guest_cart_adds_items";
const CAP = 80;

const clean = (v) => String(v ?? "").trim();
const cleanLower = (v) => clean(v).toLowerCase();

const safeJsonParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const toIso = (d) => {
  try {
    const dt = d instanceof Date ? d : new Date(d);
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// ✅ cartAdd item shape
const normalizeItem = (it = {}) => {
  const productCode = clean(it.productCode);
  const variantId = it.variantId ? clean(it.variantId) : null;
  const size = clean(it.size);
  const lastAddedAt = toIso(it.lastAddedAt || new Date());

  if (!productCode) return null;

  return {
    productCode,
    variantId: variantId || null,
    size: size || "",
    lastAddedAt,
  };
};

// ✅ unique key: productCode + variantId OR size (fallback)
const keyOf = (it) => {
  const code = clean(it?.productCode);
  const vId = clean(it?.variantId);
  const size = clean(it?.size);
  return `${code}::${vId || "-"}::${size || "-"}`;
};

const readGuest = () => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(GUEST_KEY);
  const arr = safeJsonParse(raw || "[]", []);
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeItem).filter(Boolean);
};

const writeGuest = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
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

// ✅ recent-first unique + cap
const dedupeRecentFirst = (items) => {
  const map = new Map();
  for (const it of items) {
    const n = normalizeItem(it);
    if (!n) continue;

    const k = keyOf(n);
    const prev = map.get(k);

    // keep latest lastAddedAt
    if (!prev || new Date(n.lastAddedAt) > new Date(prev.lastAddedAt)) map.set(k, n);
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.lastAddedAt) - new Date(a.lastAddedAt))
    .slice(0, CAP);
};

const getCustomerId = () => {
  const auth = useAuthStore.getState();
  return auth?.customer?._id || null;
};

export const useCustomerCartStore = create((set, get) => ({
  guestItems: [],
  loading: false,
  error: null,
  _mergedOnceForCustomerId: null,

  /* ---------------- INIT ---------------- */
  initialize: () => {
    const guest = readGuest();
    set({ guestItems: guest });
  },

  /* ----------------------------------------------------
     Guest: add/remove (always works)
  ----------------------------------------------------- */
  addGuestItem: ({ productCode, variantId = null, size = "" }) => {
    const item = normalizeItem({
      productCode,
      variantId,
      size,
      lastAddedAt: new Date(),
    });
    if (!item) return;

    const curr = readGuest();
    const next = dedupeRecentFirst([item, ...curr.filter((x) => keyOf(x) !== keyOf(item))]);

    writeGuest(next);
    set({ guestItems: next });
  },

  removeGuestItem: ({ productCode, variantId = null, size = "" }) => {
    const code = clean(productCode);
    const vId = variantId ? clean(variantId) : null;
    const sz = clean(size);

    if (!code) return;

    const curr = readGuest();
    const next = curr.filter((x) => {
      if (clean(x?.productCode) !== code) return true;

      // if variantId provided -> match variantId
      if (vId) return clean(x?.variantId) !== vId;

      // else if size provided -> match size
      if (sz) return clean(x?.size) !== sz;

      // else remove all for productCode
      return false;
    });

    writeGuest(next);
    set({ guestItems: next });
  },

  clearGuest: () => {
    clearGuest();
    set({ guestItems: [] });
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
    if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
    return data;
  },

  /* ----------------------------------------------------
     Add CartAdd (productCode + variant)
     - Always store in guest for safety
     - If logged in -> also store in DB
  ----------------------------------------------------- */
  addCartAdd: async ({ productCode, variantId = null, size = "" }) => {
    const code = clean(productCode);
    const vId = variantId ? clean(variantId) : null;
    const sz = clean(size);

    if (!code) return null;

    // ✅ Always keep guest record
    get().addGuestItem({ productCode: code, variantId: vId, size: sz });

    const customerId = getCustomerId();
    if (!customerId) return { guestOnly: true };

    try {
      set({ loading: true, error: null });

      const data = await get()._post(
        `${BACKEND}/api/customers/${customerId}/cart-adds/add`,
        { productCode: code, variantId: vId, size: sz }
      );

      set({ loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to add cartAdd" });
      return null;
    }
  },

  /* ----------------------------------------------------
     Remove CartAdd (productCode + variant)
     - Always remove from guest
     - If logged in -> remove from DB too
  ----------------------------------------------------- */
  removeCartAdd: async ({ productCode, variantId = null, size = "" }) => {
    const code = clean(productCode);
    const vId = variantId ? clean(variantId) : null;
    const sz = clean(size);

    if (!code) return null;

    // ✅ Always update guest
    get().removeGuestItem({ productCode: code, variantId: vId, size: sz });

    const customerId = getCustomerId();
    if (!customerId) return { guestOnly: true };

    try {
      set({ loading: true, error: null });

      const data = await get()._post(
        `${BACKEND}/api/customers/${customerId}/cart-adds/remove`,
        { productCode: code, variantId: vId, size: sz }
      );

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

    const guestItems = readGuest();
    if (!guestItems.length) {
      set({ _mergedOnceForCustomerId: customerId });
      return null;
    }

    try {
      set({ loading: true, error: null });

      // ✅ new merge payload: { items: [...] }
      const data = await get()._post(
        `${BACKEND}/api/customers/${customerId}/cart-adds/merge`,
        { items: guestItems }
      );

      clearGuest();
      set({
        guestItems: [],
        loading: false,
        _mergedOnceForCustomerId: customerId,
      });

      return data;
    } catch (e) {
      set({ loading: false, error: e?.message || "Failed to merge cartAdds" });
      return null;
    }
  },
}));
