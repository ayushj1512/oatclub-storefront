"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { useAuthStore } from "./authStore"; // adjust path if needed

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

const safe = (v) => (v == null ? "" : String(v));

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
    try {
      set({ loading: true, error: null });

      const auth = useAuthStore.getState();
      const customer = auth.customer;

      const payload = {
        cartId: safe(cartId),
        sessionId: getSessionId(),

        customerFirebaseUID: customer?.firebaseUID || "",
        customerEmail: customer?.email || "",
        customerPhone: customer?.phone || "",

        items,
        coupon,
        pricing,
        utm,
        context,
      };

      const res = await fetch(`${BACKEND}/api/abandoned-carts/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to upsert abandoned cart");
      }

      set({ cart: data.cart, loading: false });
      return data.cart;
    } catch (err) {
      console.error("❌ upsertCart:", err);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ---------------------------------------------
     MARK CART AS ABANDONED
     (30 min inactivity / page unload)
  --------------------------------------------- */
  markAbandoned: async (id) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/abandoned-carts/${id}/abandon`,
        { method: "PATCH" }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark abandoned");
      }

      set({ cart: data.cart });
      return data.cart;
    } catch (err) {
      console.error("❌ markAbandoned:", err);
      return null;
    }
  },

  /* ---------------------------------------------
     MARK CART AS RECOVERED
     (after successful order)
  --------------------------------------------- */
  markRecovered: async (id, orderId = null) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/abandoned-carts/${id}/recover`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark recovered");
      }

      set({ cart: data.cart });
      return data.cart;
    } catch (err) {
      console.error("❌ markRecovered:", err);
      return null;
    }
  },

  /* ---------------------------------------------
     MARK RETARGET ATTEMPT
     (email / WhatsApp / push)
  --------------------------------------------- */
  markRetargeted: async (id) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/abandoned-carts/${id}/retarget`,
        { method: "PATCH" }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark retargeted");
      }

      set({ cart: data.cart });
      return data.cart;
    } catch (err) {
      console.error("❌ markRetargeted:", err);
      return null;
    }
  },

  /* ---------------------------------------------
     RESET LOCAL STATE
  --------------------------------------------- */
  clear: () => {
    set({ cart: null, error: null, loading: false });
  },
}));
