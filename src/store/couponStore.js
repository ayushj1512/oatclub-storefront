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
      message: null,

      // internal lock (prevents double apply)
      _applyPromise: null,

      // --------------------
      // GETTERS
      // --------------------
      isApplied: () => Boolean(get().coupon?.code),

           fetchSuggestedCoupons: async ({ customerId, cartTotal }) => {
        if (!API_BASE) {
          set({ suggestionError: "Backend not configured" });
          return;
        }

        if (!customerId || cartTotal == null) return;

        try {
          set({
            isLoadingSuggestions: true,
            suggestionError: null,
          });

          const res = await fetch(
            `${API_BASE}/api/coupons`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(data.message || "Failed to fetch suggestions");
          }

          set({
            suggestedCoupons: Array.isArray(data.coupons) ? data.coupons : [],
            isLoadingSuggestions: false,
            suggestionError: null,
          });
        } catch (err) {
          set({
            suggestedCoupons: [],
            isLoadingSuggestions: false,
            suggestionError: err.message || "Failed to fetch suggestions",
          });
        }
      },

      // --------------------
      // ACTIONS
      // --------------------

      /**
       * Apply coupon
       */
      applyCoupon: async ({ code, customerId, cartTotal }) => {
        if (!API_BASE) {
          set({ error: "Backend not configured" });
          throw new Error("Backend not configured");
        }

        if (!code || !customerId || cartTotal == null) {
          set({ error: "Invalid coupon data" });
          throw new Error("Invalid coupon data");
        }

        // ✅ prevent double apply spam
        if (get().isApplying && get()._applyPromise) {
          return get()._applyPromise;
        }

        const couponCode = String(code).trim().toUpperCase();
        const cid = String(customerId).trim();

        // ✅ optional: if same coupon already applied, do nothing
        if (get().coupon?.code === couponCode) {
          return { message: "Coupon already applied", discount: get().discount, finalTotal: get().finalTotal };
        }

        const p = (async () => {
          try {
            set({ isApplying: true, error: null, message: null });

            const res = await fetch(`${API_BASE}/api/coupons/apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: couponCode, customerId: cid, cartTotal }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              throw new Error(data.message || "Failed to apply coupon");
            }

            set({
              coupon: { code: couponCode, discount: data.discount, finalTotal: data.finalTotal },
              discount: data.discount,
              finalTotal: data.finalTotal,
              isApplying: false,
              error: null,
              message: data.message || "Coupon applied successfully",
            });

            return data;
          } catch (err) {
            set({
              coupon: null,
              discount: 0,
              finalTotal: null,
              isApplying: false,
              error: err.message || "Coupon failed",
              message: null,
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
          message: null,
          isApplying: false,
          _applyPromise: null,
        });
      },

      /**
       * Clear message/error only
       */
      clearCouponMessages: () => {
        set({ error: null, message: null });
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
          message: null,
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
