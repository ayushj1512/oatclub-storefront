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

const getCartQty = (cartItems = [], countMode = "total_quantity") => {
  if (!Array.isArray(cartItems) || !cartItems.length) return 0;
  if (countMode === "unique_items") return cartItems.length;

  return cartItems.reduce((sum, item) => sum + getItemQty(item), 0);
};

const normalizeQuantityRule = (rule = {}) => ({
  enabled: Boolean(rule?.enabled),
  minItems: Math.max(0, Number(rule?.minItems || 0)),
  countMode: ["total_quantity", "unique_items"].includes(rule?.countMode)
    ? rule.countMode
    : "total_quantity",
});

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

const buildCouponSummary = (data = {}, fallbackCode = "") => {
  const coupon = data?.coupon || {};
  const quantityRule = normalizeQuantityRule(coupon.quantityRule);

  return {
    ...coupon,
    code: coupon.code || fallbackCode,
    quantityRule,
    discount: Number(data.discount || 0),
    finalTotal: Number(data.finalTotal || 0),
    eligibleTotal: Number(data.eligibleTotal || 0),
    cartTotal: Number(data.cartTotal || 0),
    cartQuantity: Number(data.cartQuantity || 0),
    discountBreakdown: Array.isArray(data.discountBreakdown)
      ? data.discountBreakdown
      : [],
  };
};

const getBestQuantityTier = (coupons = []) =>
  coupons
    .filter((c) => c?.quantityRule?.enabled)
    .sort(
      (a, b) =>
        Number(b.quantityRule?.minItems || 0) -
        Number(a.quantityRule?.minItems || 0)
    )[0] || null;

const getNextQuantityTier = ({ coupons = [], cartItems = [] }) => {
  const tiers = coupons
    .filter((c) => c?.quantityRule?.enabled)
    .map((c) => ({
      ...c,
      quantityRule: normalizeQuantityRule(c.quantityRule),
    }))
    .sort(
      (a, b) =>
        Number(a.quantityRule.minItems || 0) -
        Number(b.quantityRule.minItems || 0)
    );

  for (const coupon of tiers) {
    const qty = getCartQty(cartItems, coupon.quantityRule.countMode);
    const need = Number(coupon.quantityRule.minItems || 0) - qty;

    if (need > 0) {
      return {
        coupon,
        requiredQty: coupon.quantityRule.minItems,
        currentQty: qty,
        remainingQty: need,
        message: `Add ${need} more item${need > 1 ? "s" : ""} to unlock ${
          coupon.discountType === "flat"
            ? `₹${coupon.discountValue} off`
            : `${coupon.discountValue}% off`
        }`,
      };
    }
  }

  return null;
};

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
      cartQuantity: 0,
      discountBreakdown: [],

      isApplying: false,
      isAutoApplying: false,
      isRedeeming: false,

      error: null,
      message: null,

      suggestedCoupons: [],
      earnedCoupons: [],
      isLoadingSuggestions: false,
      suggestionError: null,

      autoAppliedCoupon: null,
      nextCouponTier: null,

      _applyPromise: null,
      _autoApplyPromise: null,

      /* ------------------------------------------------------------------
      GETTERS
      ------------------------------------------------------------------- */

      isApplied: () => Boolean(get().coupon?.code),

      hasDiscount: () => Number(get().discount || 0) > 0,

      getAppliedCode: () => get().coupon?.code || "",

      getPayableTotal: (fallbackTotal = 0) =>
        get().finalTotal != null
          ? Number(get().finalTotal)
          : Number(fallbackTotal || 0),

      getSavingsLabel: () =>
        get().discount > 0 ? `You saved ₹${Math.round(get().discount)}` : "",

      getAutoAppliedLabel: () =>
        get().autoAppliedCoupon?.code
          ? `${get().autoAppliedCoupon.code} auto applied`
          : "",

      getNextTierMessage: () => get().nextCouponTier?.message || "",

      getCouponProgress: (cartItems = []) => {
        const tier = get().nextCouponTier;
        if (!tier) return null;

        const total = Number(tier.requiredQty || 0);
        const current = getCartQty(normalizeCartItems(cartItems));
        const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

        return {
          ...tier,
          currentQty: current,
          percent,
        };
      },

      getMyCoupons: () => {
        const earned = Array.isArray(get().earnedCoupons) ? get().earnedCoupons : [];
        const suggested = Array.isArray(get().suggestedCoupons) ? get().suggestedCoupons : [];
        const map = new Map();

        [...earned, ...suggested].forEach((coupon) => {
          const code = normCode(coupon?.code);
          if (!code) return;
          map.set(code, { ...coupon, code });
        });

        return Array.from(map.values());
      },

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
          cartQuantity: summary.cartQuantity,
          discountBreakdown: summary.discountBreakdown,
          message: data?.message || "Coupon applied successfully",
          error: null,
        });

        return summary;
      },

      addEarnedCoupon: (coupon = {}) => {
        const code = normCode(coupon.code);
        if (!code) return null;

        const item = {
          code,
          title: coupon.title || "OATCLUB reward",
          description: coupon.description || "Unlocked from your OATCLUB activity.",
          discountType: coupon.discountType || "percent",
          discountValue: Number(coupon.discountValue || 0),
          source: coupon.source || "reward",
          unlockedAt: coupon.unlockedAt || new Date().toISOString(),
          isActive: coupon.isActive !== false,
          visibility: coupon.visibility || "private",
        };

        set((state) => {
          const prev = Array.isArray(state.earnedCoupons) ? state.earnedCoupons : [];
          const next = [item, ...prev.filter((c) => normCode(c?.code) !== code)];
          return { earnedCoupons: next.slice(0, 30) };
        });

        return item;
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
          cartQuantity: 0,
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

          const normalizedItems = normalizeCartItems(cartItems);
          const actualCartTotal = normalizedItems.length
            ? getCartTotalFromItems(normalizedItems)
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
              const quantityRule = normalizeQuantityRule(coupon.quantityRule);

              const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
              const validTill = coupon.validTill ? new Date(coupon.validTill) : null;

              const okDate =
                (!validFrom || validFrom <= now) && (!validTill || validTill >= now);

              const okMin =
                !coupon.minPurchase ||
                actualCartTotal >= Number(coupon.minPurchase || 0);

              const cartQty = getCartQty(normalizedItems, quantityRule.countMode);
              const okQty =
                !quantityRule.enabled ||
                cartQty >= Number(quantityRule.minItems || 0);

              return {
                ...coupon,
                quantityRule,
                _eligibility: {
                  okDate,
                  okMin,
                  okQty,
                  isEligible: okDate && okMin && okQty,
                  cartTotal: actualCartTotal,
                  cartQty,
                  requiredQty: quantityRule.minItems,
                  remainingQty: Math.max(0, quantityRule.minItems - cartQty),
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
            nextCouponTier: getNextQuantityTier({
              coupons: list,
              cartItems: normalizedItems,
            }),
            isLoadingSuggestions: false,
            suggestionError: null,
          });

          return list;
        } catch (e) {
          set({
            suggestedCoupons: [],
            nextCouponTier: null,
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
              cartQuantity: 0,
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

        set({
          cartTotal: actualCartTotal,
          cartQuantity: getCartQty(normalizedItems),
        });

        if (actualCartTotal <= 0) return null;

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
                coupon: null,
                discount: 0,
                finalTotal: null,
                eligibleTotal: 0,
                discountBreakdown: [],
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
      REHYDRATE / CART CHANGE VALIDATION
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

      syncCouponWithCart: async ({
        cartTotal,
        cartItems = [],
        email,
        phone,
        customerId,
      }) => {
        const hasManualCoupon = Boolean(get().coupon?.code && !get().autoAppliedCoupon);
        const normalizedItems = normalizeCartItems(cartItems);

        await get().fetchSuggestedCoupons({
          cartTotal,
          cartItems: normalizedItems,
        });

        if (hasManualCoupon) {
          return get().rehydrateCoupon({
            cartTotal,
            cartItems: normalizedItems,
            email,
            phone,
            customerId,
          });
        }

        return get().autoApplyCoupon({
          cartTotal,
          cartItems: normalizedItems,
          email,
          phone,
          customerId,
        });
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
          nextCouponTier: null,
          suggestionError: null,
          isLoadingSuggestions: false,
        }),

      resetCouponStore: async () => {
        await get().clearPersistedCoupon();

        set({
          suggestedCoupons: [],
          nextCouponTier: null,
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
        earnedCoupons: Array.isArray(state.earnedCoupons) ? state.earnedCoupons : [],
      }),
    }
  )
);
