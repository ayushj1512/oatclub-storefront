"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { useAuthStore } from "./authStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const SESSION_KEY = "ab_cart_session_id";

/* -------------------------------------------------
   helpers
------------------------------------------------- */
const getSessionId = () => {
  let sid = Cookies.get(SESSION_KEY);
  if (!sid) {
    sid = `SID-${Math.random().toString(36).slice(2, 12)}`;
    Cookies.set(SESSION_KEY, sid, { expires: 7 });
  }
  return sid;
};

const safe = (v) => (v == null ? "" : String(v).trim());
const safeLower = (v) => safe(v).toLowerCase();

const lockedStatuses = ["abandoned", "recovered", "expired"];

// ✅ Toggle this to enable/disable logs quickly
const AB_DEBUG = true;

// ✅ Central logger (so you can easily turn off / format nicely)
const abLog = (...args) => AB_DEBUG && console.log("[AB_CART]", ...args);
const abWarn = (...args) => AB_DEBUG && console.warn("[AB_CART]", ...args);
const abErr = (...args) => AB_DEBUG && console.error("[AB_CART]", ...args);

/* -------------------------------------------------
   Abandoned Cart Store
------------------------------------------------- */
export const useAbandonedCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  /* ---------------------------------------------
     UPSERT CART SNAPSHOT
     (called on cart change / checkout page)
  --------------------------------------------- */
  upsertCart: async ({
    cartId,
    items = [],
    coupon = null,
    pricing = null,
    utm = null,
    context = null,
  }) => {
    abLog("upsertCart() called", { cartId, itemsCount: items?.length, coupon, pricing, utm, context });

    try {
      // ✅ Guard: don’t modify if already locked snapshot
      const existing = get().cart;
      const existingStatus = safeLower(existing?.status);

      abLog("upsertCart() existing cart/status", { existing, existingStatus });

      if (existing && lockedStatuses.includes(existingStatus)) {
        abWarn("upsertCart() skipped: snapshot locked", { existingStatus });
        return existing;
      }

      set({ loading: true, error: null });

      const auth = useAuthStore.getState();
      const customer = auth.customer;

      abLog("upsertCart() auth/customer", {
        isLoggedIn: auth?.isLoggedIn,
        customer: {
          firebaseUID: customer?.firebaseUID,
          email: customer?.email,
          phone: customer?.phone,
        },
      });

      const payload = {
        cartId: safe(cartId),
        sessionId: getSessionId(),

        customerFirebaseUID: safe(customer?.firebaseUID),
        customerEmail: safeLower(customer?.email),
        customerPhone: safe(customer?.phone),

        items,
        coupon,
        pricing,
        utm,
        context,
      };

      abLog("upsertCart() BACKEND + payload", { BACKEND, url: `${BACKEND}/api/abandoned-carts/upsert`, payload });

      const res = await fetch(`${BACKEND}/api/abandoned-carts/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      abLog("upsertCart() response meta", { ok: res.ok, status: res.status, statusText: res.statusText });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        abErr("upsertCart() response JSON parse failed", jsonErr);
        throw new Error("Invalid JSON response from server");
      }

      abLog("upsertCart() response data", data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to upsert abandoned cart");
      }

      set({ cart: data.cart, loading: false });
      abLog("upsertCart() ✅ success. store cart updated", data.cart);

      return data.cart;
    } catch (err) {
      abErr("upsertCart() ❌ error", err);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ---------------------------------------------
     MARK CART AS ABANDONED
     (page unload / inactivity)
  --------------------------------------------- */
  markAbandoned: async (id) => {
    abLog("markAbandoned() called", { id });

    try {
      const cart = get().cart;

      // ✅ fallback if id not passed
      const finalId = safe(id) || safe(cart?._id) || safe(cart?.cartId);

      abLog("markAbandoned() derived ids", { passedId: id, cart_id: cart?._id, cart_cartId: cart?.cartId, finalId });
      abLog("markAbandoned() current cart/status", { cart, status: safeLower(cart?.status) });

      if (!finalId) {
        abWarn("markAbandoned() skipped: no finalId available");
        return null;
      }

      // ✅ if already abandoned/recovered/expired, don’t call again
      const status = safeLower(cart?.status);
      if (lockedStatuses.includes(status)) {
        abWarn("markAbandoned() skipped: already locked", { status });
        return cart;
      }

      const url = `${BACKEND}/api/abandoned-carts/${finalId}/abandon`;
      abLog("markAbandoned() PATCH", { url });

      const res = await fetch(url, { method: "PATCH" });

      abLog("markAbandoned() response meta", { ok: res.ok, status: res.status, statusText: res.statusText });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        abErr("markAbandoned() response JSON parse failed", jsonErr);
        throw new Error("Invalid JSON response from server");
      }

      abLog("markAbandoned() response data", data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark abandoned");
      }

      set({ cart: data.cart });
      abLog("markAbandoned() ✅ success. store cart updated", data.cart);

      return data.cart;
    } catch (err) {
      abErr("markAbandoned() ❌ error", err);
      return null;
    }
  },

  /* ---------------------------------------------
     MARK CART AS RECOVERED
     (after successful order)
  --------------------------------------------- */
  markRecovered: async (id, orderId = null) => {
    abLog("markRecovered() called", { id, orderId });

    try {
      const cart = get().cart;
      const finalId = safe(id) || safe(cart?._id) || safe(cart?.cartId);

      abLog("markRecovered() derived ids", { passedId: id, cart_id: cart?._id, cart_cartId: cart?.cartId, finalId });
      abLog("markRecovered() current cart/status", { cart, status: safeLower(cart?.status) });

      if (!finalId) {
        abWarn("markRecovered() skipped: no finalId available");
        return null;
      }

      const url = `${BACKEND}/api/abandoned-carts/${finalId}/recover`;
      const body = { orderId };

      abLog("markRecovered() PATCH", { url, body });

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      abLog("markRecovered() response meta", { ok: res.ok, status: res.status, statusText: res.statusText });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        abErr("markRecovered() response JSON parse failed", jsonErr);
        throw new Error("Invalid JSON response from server");
      }

      abLog("markRecovered() response data", data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark recovered");
      }

      set({ cart: data.cart });
      abLog("markRecovered() ✅ success. store cart updated", data.cart);

      return data.cart;
    } catch (err) {
      abErr("markRecovered() ❌ error", err);
      return null;
    }
  },

  /* ---------------------------------------------
     MARK RETARGET ATTEMPT
     (email / WhatsApp / push)
  --------------------------------------------- */
  markRetargeted: async (id) => {
    abLog("markRetargeted() called", { id });

    try {
      const cart = get().cart;
      const finalId = safe(id) || safe(cart?._id) || safe(cart?.cartId);

      abLog("markRetargeted() derived ids", { passedId: id, cart_id: cart?._id, cart_cartId: cart?.cartId, finalId });
      abLog("markRetargeted() current cart/status", { cart, status: safeLower(cart?.status) });

      if (!finalId) {
        abWarn("markRetargeted() skipped: no finalId available");
        return null;
      }

      // ✅ corrected route: /retargeted (matches controller)
      const url = `${BACKEND}/api/abandoned-carts/${finalId}/retargeted`;
      abLog("markRetargeted() PATCH", { url });

      const res = await fetch(url, { method: "PATCH" });

      abLog("markRetargeted() response meta", { ok: res.ok, status: res.status, statusText: res.statusText });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        abErr("markRetargeted() response JSON parse failed", jsonErr);
        throw new Error("Invalid JSON response from server");
      }

      abLog("markRetargeted() response data", data);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark retargeted");
      }

      set({ cart: data.cart });
      abLog("markRetargeted() ✅ success. store cart updated", data.cart);

      return data.cart;
    } catch (err) {
      abErr("markRetargeted() ❌ error", err);
      return null;
    }
  },

  /* ---------------------------------------------
     RESET LOCAL STATE
  --------------------------------------------- */
  clear: () => {
    abLog("clear() called. resetting store state");
    set({ cart: null, error: null, loading: false });
  },
}));
