import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useCouponStore = create(
  persist(
    (set, get) => ({
      // --------------------
      // STATE
      // --------------------
      coupon: null, // { code, discount, finalTotal }
      discount: 0,
      finalTotal: null,
      isApplying: false,
      error: null,

      // internal lock (prevents double apply)
      _applyPromise: null,

      // --------------------
      // ACTIONS
      // --------------------

      /**
       * Apply coupon
       */
      applyCoupon: async ({ code, customerId, cartTotal }) => {
        if (!API_BASE) {
          return set({ error: "Backend not configured" });
        }

        if (!code || !customerId || cartTotal == null) {
          return set({ error: "Invalid coupon data" });
        }

        // ✅ prevent double apply spam
        if (get().isApplying && get()._applyPromise) {
          return get()._applyPromise;
        }

        const couponCode = String(code).trim().toUpperCase();

        const p = (async () => {
          try {
            set({ isApplying: true, error: null });

            const res = await fetch(`${API_BASE}/api/coupons/apply`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: couponCode,
                customerId,
                cartTotal,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.message || "Failed to apply coupon");
            }

            set({
              coupon: {
                code: couponCode,
                discount: data.discount,
                finalTotal: data.finalTotal,
              },
              discount: data.discount,
              finalTotal: data.finalTotal,
              isApplying: false,
              error: null,
            });

            return data;
          } catch (err) {
            set({
              coupon: null,
              discount: 0,
              finalTotal: null,
              isApplying: false,
              error: err.message || "Coupon failed",
            });

            throw err;
          } finally {
            set({ _applyPromise: null });
          }
        })();

        set({ _applyPromise: p });
        return p;
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
       * Reset everything (logout / order success)
       */
      resetCouponStore: () => {
        set({
          coupon: null,
          discount: 0,
          finalTotal: null,
          isApplying: false,
          error: null,
          _applyPromise: null,
        });
      },
    }),
    {
      name: "coupon-store",
      partialize: (state) => ({
        coupon: state.coupon,
        discount: state.discount,
        finalTotal: state.finalTotal,
      }),
    }
  )
);
