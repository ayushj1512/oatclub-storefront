import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useCouponStore = create(
  persist(
    (set, get) => ({
      // --------------------
      // STATE
      // --------------------
      coupon: null,          // coupon object from backend
      discount: 0,
      finalTotal: null,
      isApplying: false,
      error: null,

      // --------------------
      // ACTIONS
      // --------------------

      /**
       * Apply coupon
       */
      applyCoupon: async ({ code, customerId, cartTotal }) => {
        if (!code || !customerId || cartTotal == null) {
          return set({ error: "Invalid coupon data" });
        }

        try {
          set({ isApplying: true, error: null });

          const res = await fetch(`${API_BASE}/api/coupons/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              customerId,
              cartTotal,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to apply coupon");
          }

          set({
            coupon: code.toUpperCase(),
            discount: data.discount,
            finalTotal: data.finalTotal,
            isApplying: false,
            error: null,
          });

          return data;
        } catch (err) {
          set({
            error: err.message,
            isApplying: false,
            coupon: null,
            discount: 0,
            finalTotal: null,
          });

          throw err;
        }
      },

      /**
       * Remove applied coupon
       */
      removeCoupon: () => {
        set({
          coupon: null,
          discount: 0,
          finalTotal: null,
          error: null,
        });
      },

      /**
       * Reset everything (on logout / order success)
       */
      resetCouponStore: () => {
        set({
          coupon: null,
          discount: 0,
          finalTotal: null,
          isApplying: false,
          error: null,
        });
      },
    }),
    {
      name: "coupon-store", // localStorage key
      partialize: (state) => ({
        coupon: state.coupon,
        discount: state.discount,
        finalTotal: state.finalTotal,
      }),
    }
  )
);
