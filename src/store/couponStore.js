import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

/* ------------------------------------------------------------------
HELPERS
------------------------------------------------------------------- */

const normCode = (v) => String(v || "").trim().toUpperCase();
const norm = (v) => String(v || "").trim();
const normEmail = (v) => String(v || "").trim().toLowerCase();

const normPhone = (v) => {
  const digits = String(v || "").replace(/\D/g, "");
  return digits.length ? digits : "";
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail(v));

const isPhone = (v) => {
  const p = normPhone(v);
  return p.length >= 10 && p.length <= 15;
};

const customerKey = ({ email, phone, customerId }) => {
  if (email && isEmail(email)) return `email:${normEmail(email)}`;
  if (phone && isPhone(phone)) return `phone:${normPhone(phone)}`;

  const cid = norm(customerId);
  if (!cid || cid.toLowerCase() === "guest") return null;

  return `id:${cid}`;
};

const isPublicCoupon = (coupon) =>
  String(coupon?.visibility || "public").toLowerCase() !== "private";

const getItemQty = (item) => {
  const qty = Number(item?.quantity ?? item?.qty ?? 1);
  return qty > 0 ? qty : 1;
};

const getItemPrice = (item) => {
  const product = item?.product || item || {};

  return Number(
    item?.price ??
      item?.salePrice ??
      item?.finalPrice ??
      product?.price ??
      product?.salePrice ??
      product?.finalPrice ??
      0
  );
};

const getCartTotalFromItems = (cartItems = []) =>
  cartItems.reduce((sum, item) => sum + getItemPrice(item) * getItemQty(item), 0);

const normalizeCartItems = (cartItems = []) => {
  if (!Array.isArray(cartItems)) return [];

  return cartItems.map((item) => {
    const product = item?.product || item || {};

    return {
      ...item,
      product: {
        ...product,
        _id: product?._id || item?.productId || item?._id,
        productCode: product?.productCode || item?.productCode || "",
        title: product?.title || product?.name || item?.title || item?.name || "",
        price: getItemPrice(item),
        isPrimaryProduct:
          item?.isPrimaryProduct ??
          item?.isPrimary ??
          product?.isPrimaryProduct ??
          product?.isPrimary ??
          false,
        categories: product?.categories || item?.categories || [],
        collections: product?.collections || item?.collections || [],
        category: product?.category || item?.category || item?.categoryId,
        collection: product?.collection || item?.collection || item?.collectionId,
      },
      quantity: getItemQty(item),
      price: getItemPrice(item),
      productCode: item?.productCode || product?.productCode || "",
      title: item?.title || item?.name || product?.title || product?.name || "",
      categories: item?.categories || product?.categories || [],
      collections: item?.collections || product?.collections || [],
    };
  });
};

const buildCouponSummary = (data = {}, fallbackCode = "") => ({
  ...(data.coupon || {}),
  code: data?.coupon?.code || fallbackCode,
  discount: Number(data.discount || 0),
  finalTotal: Number(data.finalTotal || 0),
  eligibleTotal: Number(data.eligibleTotal || 0),
  cartTotal: Number(data.cartTotal || 0),
  discountBreakdown: Array.isArray(data.discountBreakdown)
    ? data.discountBreakdown
    : [],
});

/* ------------------------------------------------------------------
STORE
------------------------------------------------------------------- */

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupon: null,
      couponCustomerKey: null,

      discount: 0,
      finalTotal: null,
      eligibleTotal: 0,
      cartTotal: 0,
      discountBreakdown: [],

      isApplying: false,
      isAutoApplying: false,
      isRedeeming: false,

      error: null,
      message: null,

      suggestedCoupons: [],
      isLoadingSuggestions: false,
      suggestionError: null,

      autoAppliedCoupon: null,

      _applyPromise: null,
      _autoApplyPromise: null,

      /* ------------------------------------------------------------------
      GETTERS
      ------------------------------------------------------------------- */

      isApplied: () => Boolean(get().coupon?.code),

      hasDiscount: () => Number(get().discount || 0) > 0,

      getAppliedCode: () => get().coupon?.code || "",

      getPayableTotal: (fallbackTotal = 0) =>
        get().finalTotal != null ? Number(get().finalTotal) : Number(fallbackTotal || 0),

      /* ------------------------------------------------------------------
      INTERNAL SETTERS
      ------------------------------------------------------------------- */

      setAppliedCouponFromResponse: ({ data, code, cKey }) => {
        const summary = buildCouponSummary(data, code);

        set({
          coupon: summary,
          couponCustomerKey: cKey,
          discount: summary.discount,
          finalTotal: summary.finalTotal,
          eligibleTotal: summary.eligibleTotal,
          cartTotal: summary.cartTotal,
          discountBreakdown: summary.discountBreakdown,
          message: data?.message || "Coupon applied successfully",
          error: null,
        });

        return summary;
      },

      clearPersistedCoupon: async () => {
        try {
          await useCouponStore.persist.clearStorage();
        } catch (_) {}

        set({
          coupon: null,
          couponCustomerKey: null,
          discount: 0,
          finalTotal: null,
          eligibleTotal: 0,
          cartTotal: 0,
          discountBreakdown: [],
          autoAppliedCoupon: null,
          isApplying: false,
          isAutoApplying: false,
          isRedeeming: false,
          error: null,
          message: null,
          _applyPromise: null,
          _autoApplyPromise: null,
        });
      },

      /* ------------------------------------------------------------------
      SUGGESTED PUBLIC COUPONS
      ------------------------------------------------------------------- */

      fetchSuggestedCoupons: async ({ cartTotal, cartItems = [] } = {}) => {
        if (!API_BASE) {
          return set({ suggestionError: "Backend not configured" });
        }

        try {
          set({ isLoadingSuggestions: true, suggestionError: null });

          const actualCartTotal = Array.isArray(cartItems) && cartItems.length
            ? getCartTotalFromItems(normalizeCartItems(cartItems))
            : Number(cartTotal || 0);

          const res = await fetch(`${API_BASE}/api/coupons`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to fetch coupons");

          const now = new Date();
          const coupons = Array.isArray(data.data) ? data.data : [];

          const list = coupons
            .filter((coupon) => coupon?.isActive)
            .filter(isPublicCoupon)
            .map((coupon) => {
              const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
              const validTill = coupon.validTill ? new Date(coupon.validTill) : null;

              const okDate =
                (!validFrom || validFrom <= now) && (!validTill || validTill >= now);

              const okMin =
                !coupon.minPurchase ||
                actualCartTotal >= Number(coupon.minPurchase || 0);

              return {
                ...coupon,
                _eligibility: {
                  okDate,
                  okMin,
                  isEligible: okDate && okMin,
                  cartTotal: actualCartTotal,
                },
              };
            })
            .sort((a, b) => {
              if (b._eligibility.isEligible !== a._eligibility.isEligible) {
                return Number(b._eligibility.isEligible) - Number(a._eligibility.isEligible);
              }

              return Number(b.discountValue || 0) - Number(a.discountValue || 0);
            });

          set({
            suggestedCoupons: list,
            isLoadingSuggestions: false,
            suggestionError: null,
          });

          return list;
        } catch (e) {
          set({
            suggestedCoupons: [],
            isLoadingSuggestions: false,
            suggestionError: e?.message || "Failed to fetch coupons",
          });

          return [];
        }
      },

      /* ------------------------------------------------------------------
      APPLY MANUAL COUPON
      ------------------------------------------------------------------- */

      applyCoupon: async ({
        code,
        cartTotal,
        cartItems = [],
        email,
        phone,
        customerId,
      }) => {
        if (!API_BASE) throw new Error("Backend not configured");

        const cCode = normCode(code);
        const cKey = customerKey({ email, phone, customerId });
        const normalizedItems = normalizeCartItems(cartItems);

        const actualCartTotal = normalizedItems.length
          ? getCartTotalFromItems(normalizedItems)
          : Number(cartTotal || 0);

        if (!cCode || actualCartTotal <= 0) {
          throw new Error("Invalid coupon data");
        }

        if (!cKey) {
          throw new Error("Please enter email or phone number to apply coupon.");
        }

        if (get().isApplying && get()._applyPromise) {
          return get()._applyPromise;
        }

        if (get().coupon?.code === cCode && get().couponCustomerKey === cKey) {
          return {
            message: "Coupon already applied",
            coupon: get().coupon,
            discount: get().discount,
            finalTotal: get().finalTotal,
            eligibleTotal: get().eligibleTotal,
            discountBreakdown: get().discountBreakdown,
          };
        }

        const promise = (async () => {
          try {
            set({
              isApplying: true,
              error: null,
              message: null,
            });

            const res = await fetch(`${API_BASE}/api/coupons/apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                code: cCode,
                cartTotal: actualCartTotal,
                cartItems: normalizedItems,
                email: email ? normEmail(email) : null,
                phone: phone ? normPhone(phone) : null,
                customerId,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to apply coupon");

            get().setAppliedCouponFromResponse({
              data,
              code: cCode,
              cKey,
            });

            set({
              isApplying: false,
              autoAppliedCoupon: null,
            });

            return data;
          } catch (e) {
            set({
              coupon: null,
              couponCustomerKey: null,
              discount: 0,
              finalTotal: null,
              eligibleTotal: 0,
              cartTotal: 0,
              discountBreakdown: [],
              isApplying: false,
              error: e?.message || "Coupon failed",
              message: null,
            });

            throw e;
          } finally {
            set({ _applyPromise: null });
          }
        })();

        set({ _applyPromise: promise });
        return promise;
      },

      /* ------------------------------------------------------------------
      AUTO APPLY BEST COUPON
      ------------------------------------------------------------------- */

      autoApplyCoupon: async ({
        cartTotal,
        cartItems = [],
        email,
        phone,
        customerId,
      }) => {
        if (!API_BASE) throw new Error("Backend not configured");

        const cKey = customerKey({ email, phone, customerId });
        const normalizedItems = normalizeCartItems(cartItems);

        const actualCartTotal = normalizedItems.length
          ? getCartTotalFromItems(normalizedItems)
          : Number(cartTotal || 0);

        if (actualCartTotal <= 0) {
          return null;
        }

        if (!cKey) {
          set({
            autoAppliedCoupon: null,
            error: null,
          });
          return null;
        }

        if (get().isAutoApplying && get()._autoApplyPromise) {
          return get()._autoApplyPromise;
        }

        const promise = (async () => {
          try {
            set({
              isAutoApplying: true,
              error: null,
              message: null,
              autoAppliedCoupon: null,
            });

            const res = await fetch(`${API_BASE}/api/coupons/auto-apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                cartTotal: actualCartTotal,
                cartItems: normalizedItems,
                email: email ? normEmail(email) : null,
                phone: phone ? normPhone(phone) : null,
                customerId,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to auto apply coupon");

            if (!data.applied || !data?.coupon?.code || Number(data.discount || 0) <= 0) {
              set({
                autoAppliedCoupon: null,
                isAutoApplying: false,
              });

              return data;
            }

            const summary = get().setAppliedCouponFromResponse({
              data,
              code: data.coupon.code,
              cKey,
            });

            set({
              autoAppliedCoupon: summary,
              isAutoApplying: false,
            });

            return data;
          } catch (e) {
            set({
              autoAppliedCoupon: null,
              isAutoApplying: false,
              error: e?.message || "Auto apply failed",
            });

            return null;
          } finally {
            set({ _autoApplyPromise: null });
          }
        })();

        set({ _autoApplyPromise: promise });
        return promise;
      },

      /* ------------------------------------------------------------------
      REHYDRATE APPLIED COUPON
      ------------------------------------------------------------------- */

      rehydrateCoupon: async ({
        cartTotal,
        cartItems = [],
        email,
        phone,
        customerId,
      }) => {
        const code = get().coupon?.code;
        if (!code) return null;

        const cKey = customerKey({ email, phone, customerId });
        const normalizedItems = normalizeCartItems(cartItems);

        const actualCartTotal = normalizedItems.length
          ? getCartTotalFromItems(normalizedItems)
          : Number(cartTotal || 0);

        if (!cKey || actualCartTotal <= 0) {
          await get().clearPersistedCoupon();
          return null;
        }

        if (get().couponCustomerKey && get().couponCustomerKey !== cKey) {
          await get().clearPersistedCoupon();
          return null;
        }

        try {
          return await get().applyCoupon({
            code,
            cartTotal: actualCartTotal,
            cartItems: normalizedItems,
            email,
            phone,
            customerId,
          });
        } catch {
          await get().clearPersistedCoupon();
          return null;
        }
      },

      /* ------------------------------------------------------------------
      REDEEM COUPON AFTER SUCCESSFUL ORDER / PAYMENT
      ------------------------------------------------------------------- */

      redeemCoupon: async ({
        code,
        cartTotal,
        cartItems = [],
        email,
        phone,
        customerId,
      } = {}) => {
        if (!API_BASE) throw new Error("Backend not configured");

        const appliedCode = normCode(code || get().coupon?.code);
        if (!appliedCode) return null;

        const cKey = customerKey({ email, phone, customerId });
        if (!cKey) throw new Error("Customer details required to redeem coupon.");

        const normalizedItems = normalizeCartItems(cartItems);

        const actualCartTotal = normalizedItems.length
          ? getCartTotalFromItems(normalizedItems)
          : Number(cartTotal || get().cartTotal || 0);

        try {
          set({ isRedeeming: true, error: null });

          const res = await fetch(`${API_BASE}/api/coupons/redeem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              code: appliedCode,
              cartTotal: actualCartTotal,
              cartItems: normalizedItems,
              email: email ? normEmail(email) : null,
              phone: phone ? normPhone(phone) : null,
              customerId,
            }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to redeem coupon");

          set({
            isRedeeming: false,
            message: data.message || "Coupon redeemed successfully",
          });

          return data;
        } catch (e) {
          set({
            isRedeeming: false,
            error: e?.message || "Failed to redeem coupon",
          });

          throw e;
        }
      },

      /* ------------------------------------------------------------------
      LOCAL HELPERS
      ------------------------------------------------------------------- */

      removeCoupon: async () => get().clearPersistedCoupon(),

      clearCouponMessages: () =>
        set({
          error: null,
          message: null,
          suggestionError: null,
        }),

      clearSuggestions: () =>
        set({
          suggestedCoupons: [],
          suggestionError: null,
          isLoadingSuggestions: false,
        }),

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
      partialize: (state) => ({
        coupon: state.coupon?.code ? { code: state.coupon.code } : null,
        couponCustomerKey: state.couponCustomerKey || null,
      }),
    }
  )
);