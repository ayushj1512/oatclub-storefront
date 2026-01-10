import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useCouponStore = create(
  persist(
    (set, get) => ({
      // --------------------
      // STATE
      // --------------------
      coupon: null, // ✅ only { code } will persist
      discount: 0,
      finalTotal: null,
      isApplying: false,
      error: null,
      message: null,

      // ✅ Suggested Coupons
      suggestedCoupons: [],
      isLoadingSuggestions: false,
      suggestionError: null,

      // internal lock (prevents double apply)
      _applyPromise: null,

      // --------------------
      // GETTERS
      // --------------------
      isApplied: () => Boolean(get().coupon?.code),

      // --------------------
      // ✅ CLEAR PERSISTED + RESET (NEW)
      // --------------------
      clearPersistedCoupon: async () => {
        try {
          await useCouponStore.persist.clearStorage(); // ✅ clears localStorage
        } catch (_) {}

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

      // --------------------
      // FETCH SUGGESTED COUPONS
      // --------------------
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

          const res = await fetch(`${API_BASE}/api/coupons`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(data.message || "Failed to fetch suggestions");
          }

          const coupons = Array.isArray(data.data) ? data.data : [];
          const now = new Date();

          const filtered = coupons.filter((c) => {
            const isActive = c.isActive;
            const validFrom = new Date(c.validFrom);
            const validTill = new Date(c.validTill);

            const isInDateRange = validFrom <= now && validTill >= now;

            const meetsMinPurchase =
              !c.minPurchase || Number(cartTotal) >= Number(c.minPurchase);

            const alreadyUsed =
              Array.isArray(c.usedBy) && c.usedBy.includes(customerId);

            const limitPerCustomerOk =
              c.usageLimitPerCustomer === 1 ? !alreadyUsed : true;

            return (
              isActive &&
              isInDateRange &&
              meetsMinPurchase &&
              limitPerCustomerOk
            );
          });

          set({
            suggestedCoupons: filtered,
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
      // APPLY COUPON
      // --------------------
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

        // ✅ if same coupon already applied, do nothing
        if (get().coupon?.code === couponCode) {
          return {
            message: "Coupon already applied",
            discount: get().discount,
            finalTotal: get().finalTotal,
          };
        }

        const p = (async () => {
          try {
            set({ isApplying: true, error: null, message: null });

            const res = await fetch(`${API_BASE}/api/coupons/apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: couponCode,
                customerId: cid,
                cartTotal,
              }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              throw new Error(data.message || "Failed to apply coupon");
            }

            set({
              coupon: { code: couponCode }, // ✅ persist only this
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

      // --------------------
      // ✅ REAPPLY AFTER RELOAD (UPDATED)
      // --------------------
      rehydrateCoupon: async ({ customerId, cartTotal }) => {
        const code = get().coupon?.code;
        if (!code) return;

        // ✅ if cartTotal invalid -> remove + clear persist
        if (!cartTotal || cartTotal <= 0) {
          await get().clearPersistedCoupon();
          return;
        }

        try {
          await get().applyCoupon({ code, customerId, cartTotal });
        } catch (_) {
          // ✅ if invalid coupon after reload -> clear persisted
          await get().clearPersistedCoupon();
        }
      },

      // --------------------
      // REMOVE COUPON (UPDATED)
      // --------------------
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

      // --------------------
      // CLEAR MESSAGE/ERROR
      // --------------------
      clearCouponMessages: () => {
        set({ error: null, message: null });
      },

      // --------------------
      // RESET STORE (UPDATED)
      // --------------------
      resetCouponStore: async () => {
        await get().clearPersistedCoupon();

        set({
          suggestedCoupons: [],
          isLoadingSuggestions: false,
          suggestionError: null,
        });
      },
    }),
    {
      name: "coupon-store",

      // ✅ ONLY persist coupon code, nothing else
      partialize: (state) => ({
        coupon: state.coupon ? { code: state.coupon.code } : null,
      }),
    }
  )
);
