import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const normCode = (v) => String(v || "").trim().toUpperCase();
const norm = (v) => String(v || "").trim();
const normEmail = (v) => String(v || "").trim().toLowerCase();
const normPhone = (v) => String(v || "").replace(/[^\d+]/g, "").trim();

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail(v));
const isPhone = (v) => {
  const p = normPhone(v).replace(/^\+/, "");
  return p.length >= 10 && p.length <= 15;
};

// customerKey must match backend: email:xxx | phone:xxx | id:xxx
const customerKey = ({ email, phone, customerId }) => {
  if (email && isEmail(email)) return `email:${normEmail(email)}`;
  if (phone && isPhone(phone)) return `phone:${normPhone(phone)}`;
  const cid = norm(customerId);
  if (!cid || cid.toLowerCase() === "guest") return null;
  return `id:${cid}`;
};

const isPublicCoupon = (c) => String(c?.visibility || "public").toLowerCase() !== "private";

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupon: null,
      couponCustomerKey: null,
      discount: 0,
      finalTotal: null,
      isApplying: false,
      error: null,
      message: null,

      suggestedCoupons: [],
      isLoadingSuggestions: false,
      suggestionError: null,

      _applyPromise: null,

      isApplied: () => !!get().coupon?.code,

      clearPersistedCoupon: async () => {
        try {
          await useCouponStore.persist.clearStorage();
        } catch (_) {}
        set({
          coupon: null,
          couponCustomerKey: null,
          discount: 0,
          finalTotal: null,
          isApplying: false,
          error: null,
          message: null,
          _applyPromise: null,
        });
      },

      // ✅ ONLY PUBLIC COUPONS for suggestions
      fetchSuggestedCoupons: async ({ cartTotal }) => {
        if (!API_BASE) return set({ suggestionError: "Backend not configured" });

        try {
          set({ isLoadingSuggestions: true, suggestionError: null });

          const res = await fetch(`${API_BASE}/api/coupons`, {
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to fetch coupons");

          const now = new Date();
          const coupons = Array.isArray(data.data) ? data.data : [];

          const list = coupons
            .filter((c) => c?.isActive)
            .filter(isPublicCoupon) // ✅ private removed here
            .map((c) => {
              const vf = c.validFrom ? new Date(c.validFrom) : null;
              const vt = c.validTill ? new Date(c.validTill) : null;
              const okDate = (!vf || vf <= now) && (!vt || vt >= now);
              const okMin = !c.minPurchase || cartTotal == null || +cartTotal >= +c.minPurchase;
              return { ...c, _eligibility: { okDate, okMin, isEligible: okDate && okMin } };
            })
            .sort((a, b) => +b._eligibility.isEligible - +a._eligibility.isEligible);

          set({ suggestedCoupons: list, isLoadingSuggestions: false });
        } catch (e) {
          set({
            suggestedCoupons: [],
            isLoadingSuggestions: false,
            suggestionError: e?.message || "Failed to fetch coupons",
          });
        }
      },

      applyCoupon: async ({ code, cartTotal, email, phone, customerId }) => {
        if (!API_BASE) throw new Error("Backend not configured");

        const cCode = normCode(code);
        const cKey = customerKey({ email, phone, customerId });

        if (!cCode || cartTotal == null) throw new Error("Invalid coupon data");
        if (!cKey) throw new Error("Please enter email or phone number to apply coupon.");

        if (get().isApplying && get()._applyPromise) return get()._applyPromise;

        if (get().coupon?.code === cCode && get().couponCustomerKey === cKey) {
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
              body: JSON.stringify({ code: cCode, cartTotal, email, phone, customerId }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to apply coupon");

            set({
              coupon: { code: cCode },
              couponCustomerKey: cKey,
              discount: data.discount ?? 0,
              finalTotal: data.finalTotal ?? null,
              isApplying: false,
              message: data.message || "Coupon applied successfully",
              error: null,
            });

            return data;
          } catch (e) {
            set({
              coupon: null,
              couponCustomerKey: null,
              discount: 0,
              finalTotal: null,
              isApplying: false,
              error: e?.message || "Coupon failed",
              message: null,
            });
            throw e;
          } finally {
            set({ _applyPromise: null });
          }
        })();

        set({ _applyPromise: p });
        return p;
      },

      rehydrateCoupon: async ({ cartTotal, email, phone, customerId }) => {
        const c = get().coupon?.code;
        if (!c) return;

        const cKey = customerKey({ email, phone, customerId });
        if (!cKey || !(cartTotal > 0)) return get().clearPersistedCoupon();

        if (get().couponCustomerKey && get().couponCustomerKey !== cKey) {
          return get().clearPersistedCoupon();
        }

        try {
          await get().applyCoupon({ code: c, cartTotal, email, phone, customerId });
        } catch {
          await get().clearPersistedCoupon();
        }
      },

      removeCoupon: async () => get().clearPersistedCoupon(),

      clearCouponMessages: () => set({ error: null, message: null, suggestionError: null }),

      resetCouponStore: async () => {
        await get().clearPersistedCoupon();
        set({ suggestedCoupons: [], isLoadingSuggestions: false, suggestionError: null });
      },
    }),
    {
      name: "coupon-store",
      partialize: (s) => ({
        coupon: s.coupon ? { code: s.coupon.code } : null,
        couponCustomerKey: s.couponCustomerKey || null,
      }),
    }
  )
);
