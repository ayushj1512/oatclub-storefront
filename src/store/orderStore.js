import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm"; // ✅ ADD THIS

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Helper: API call with JSON + nice error messages
 */
async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

/**
 * COD-first Order Store
 * ✅ IMPORTANT: Your backend createOrder expects:
 *    { customerId, shippingAddressSnapshot, billingAddressSnapshot, items: [{productId, quantity, variantId?}], ... }
 * ❌ It does NOT accept frontend-calculated totals/items snapshot fields.
 * So we only send the minimal compatible payload and let backend compute snapshot + totals.
 */
export const useOrderStore = create((set, get) => ({
  // ----------------------------
  // State
  // ----------------------------
  placing: false,
  loading: false,
  error: null,
_lastPurchaseKey: null,
_lastPurchaseAt: 0,

  lastCreatedOrder: null,
  order: null,
  orders: [],
  analytics: null,

  // ----------------------------
  // Actions: Customer (COD)
  // ----------------------------

  /**
   * CREATE ORDER (Customer)
   * POST /api/orders
   *
   * Expected items input shapes supported:
   * - [{ productId, quantity, variantId? }]
   * - or cart-like: [{ id, qty, variantId? }]
   */

  /**
 * CREATE ORDER (COD / RAZORPAY)
 * POST /api/orders
 */
createOrder: async ({
  customerId,
  shippingAddressId,
  billingAddressId,
  items,
  discount = 0,
  coupon = null,
  shippingFee = 0,
  tax = 0,
  paymentMethod = "cod",
  source = "website",
  isGiftOrder = false,
  customerMessage = "",
  currency = "INR",
}) => {
  set({ placing: true, error: null });

  try {
    if (!customerId) throw new Error("customerId is required");
    if (!shippingAddressId) throw new Error("shippingAddressId is required");
    if (!items?.length) throw new Error("Order items missing");

    const pm = String(paymentMethod).toLowerCase();
    if (!["cod", "razorpay"].includes(pm)) {
      throw new Error("Invalid payment method");
    }

    /* ✅ coupon safe normalize */
    const couponCode =
      coupon && typeof coupon === "object"
        ? String(coupon.code || "").trim()
        : coupon
        ? String(coupon).trim()
        : null;

    /* ✅ normalize items for backend */
    const normalizedItems = items.map((it) => {
      const productId = it?.productId || it?.id;
      const quantity = Number(it?.quantity ?? it?.qty ?? 0);
      const variantId = it?.variantId || null;

      if (!productId) throw new Error("Each item must have productId");
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error("Invalid item quantity");
      }

      return { productId, quantity, ...(variantId ? { variantId } : {}) };
    });

    /* ✅ build contents for tracking (GA4/Meta) */
    const contents = (items || [])
      .map((it) => {
        const productId = it?.productId || it?.id;
        if (!productId) return null;

        const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;
        const price =
          Number(it?.price ?? it?.item_price ?? it?.salePrice ?? 0) || 0;

        const variantId = it?.variantId || it?.variant?._id || null;
        const variantText = [it?.selectedSize, it?.selectedColor]
          .filter(Boolean)
          .join(" / ");

        return {
          id: String(productId),
          variantId: variantId ? String(variantId) : null,
          variant: variantText || undefined,
          quantity,
          item_price: price,
        };
      })
      .filter(Boolean);

    const itemsTotal = contents.reduce((s, c) => s + c.item_price * c.quantity, 0);

    /* ✅ Razorpay extra 5% off (applied on itemsTotal/subtotal) */
    const razorpayExtraDiscount =
      pm === "razorpay" ? Math.round(itemsTotal * 0.05) : 0;

    /* ✅ Total discount to send to backend */
    const finalDiscount = Number(discount || 0) + razorpayExtraDiscount;

    /* ✅ Compute frontend estimate (used only for checkout events) */
    const orderValue = Math.max(
      0,
      itemsTotal +
        Number(shippingFee || 0) +
        Number(tax || 0) -
        Number(finalDiscount || 0)
    );

    /* ✅ Meta needs only id/qty/price (best practice) */
    const metaContents = contents.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      item_price: c.item_price,
    }));

    /* ✅✅ FIX: Meta InitiateCheckout + AddPaymentInfo should NOT use backendValue */
    try {
      await trackMeta("InitiateCheckout", {
        currency,
        value: orderValue, // ✅ use frontend estimate
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents: metaContents,
        num_items: metaContents.reduce((s, c) => s + c.quantity, 0),
        ...(couponCode ? { coupon: couponCode } : {}),
        ...(pm === "razorpay"
          ? { razorpay_extra_discount: razorpayExtraDiscount } // optional debug
          : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta InitiateCheckout failed", e);
    }

    try {
      await trackMeta("AddPaymentInfo", {
        currency,
        value: orderValue, // ✅ use frontend estimate
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents: metaContents,
        payment_method: pm,
        ...(pm === "razorpay"
          ? { razorpay_extra_discount: razorpayExtraDiscount } // optional debug
          : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta AddPaymentInfo failed", e);
    }

    /* ✅ create order on backend */
    const payload = {
      customerId,
      shippingAddressId,
      billingAddressId: billingAddressId || shippingAddressId,
      items: normalizedItems,

      // ✅ IMPORTANT: send combined discount (coupon discount + razorpay extra)
      discount: finalDiscount,

      // ✅ keep coupon object clean (don't send frontend finalTotal ideally)
      coupon:
        coupon && typeof coupon === "object"
          ? { code: String(coupon.code || "").trim() }
          : couponCode
          ? { code: couponCode }
          : null,

      shippingFee,
      tax,
      currency,
      paymentMethod: pm,
      source,
      isGiftOrder,
      customerMessage,

      // ✅ optional: let backend know why discount increased (helps audit)
      razorpayExtraDiscount: pm === "razorpay" ? razorpayExtraDiscount : 0,
      razorpayExtraDiscountPct: pm === "razorpay" ? 5 : 0,
    };

    const data = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const order = data?.order;

    // ✅ Prefer backend computed totals (fix value=0)
    const backendValue =
      Number(
        order?.finalTotal ??
          order?.grandTotal ??
          order?.total ??
          order?.payableAmount ??
          order?.amount ??
          order?.totalAmount ??
          0
      ) || 0;

    /* ✅ COD ONLY: Purchase tracking (keeping your current behavior) */
    if (pm === "cod") {
      await get().trackPurchaseSuccess({
        orderId: order?._id || order?.orderNumber || customerId,
        currency,
        value: backendValue || orderValue,
        contents, // ✅ keep full contents for GA4
        coupon: couponCode,
        paymentMethod: pm,
      });
    }

    /* ✅ Internal analytics checkout */
    try {
      const analytics = useAnalyticsStore.getState();
      normalizedItems.forEach((it) =>
        analytics.trackInitiateCheckout?.(it.productId)
      );
    } catch (e) {
      console.warn("📊 Analytics checkout tracking failed", e);
    }

    set({ lastCreatedOrder: order, placing: false });
    return order;
  } catch (e) {
    set({ error: e.message, placing: false });
    throw e;
  }
},



trackPurchaseSuccess: async ({
  orderId,
  currency = "INR",
  value = 0,
  contents = [],
  coupon = null,
  paymentMethod = "cod",
  event_source_url, // ✅ optional: pass thankyou url if you want
} = {}) => {
  try {
    // ✅ sanitize value
    const safeValue = Number(value);
    const finalValue = Number.isFinite(safeValue) && safeValue > 0 ? safeValue : 0;

    const now = Date.now();
    // ✅ Dedup key should NOT depend on value (value can change / be 0)
    const key = `purchase_${paymentMethod}_${String(orderId)}`;

    const { _lastPurchaseKey, _lastPurchaseAt } = get();
    const sameKey = _lastPurchaseKey === key;
    const tooSoon = _lastPurchaseAt && now - _lastPurchaseAt < 8000; // slightly higher window
    if (sameKey && tooSoon) return;

    set({ _lastPurchaseKey: key, _lastPurchaseAt: now });

    // ✅ Ensure coupon is string only
    const couponCode = coupon ? String(coupon).trim() : null;

    // ✅ Meta contents strict format + remove zero item_price if missing
    const metaContents = (contents || [])
      .map((c) => {
        const id = String(c?.id || "");
        if (!id) return null;

        const quantity = Number(c?.quantity || 1);
        const itemPrice = Number(c?.item_price || 0);

        return {
          id,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          // only include item_price if valid >0 (Meta accepts it, but 0 pollutes signal)
          ...(Number.isFinite(itemPrice) && itemPrice > 0 ? { item_price: itemPrice } : {}),
        };
      })
      .filter(Boolean);

    // ✅ GA4 items format
    const ga4Items = (contents || [])
      .map((c) => {
        const item_id = String(c?.id || "");
        if (!item_id) return null;

        const quantity = Number(c?.quantity || 1);
        const price = Number(c?.item_price || 0);

        return {
          item_id,
          item_name: c?.name ? String(c.name) : undefined,
          item_variant: c?.variant ? String(c.variant) : undefined,
          variant_id: c?.variantId ? String(c.variantId) : undefined,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          // GA4 expects number; if unknown keep undefined instead of 0
          ...(Number.isFinite(price) && price > 0 ? { price } : {}),
        };
      })
      .filter(Boolean);

    /* ✅✅✅ GA4 PURCHASE EVENT */
    try {
      pushEcomEvent("purchase", {
        transaction_id: String(orderId),
        currency,
        value: finalValue, // ✅
        payment_type: paymentMethod,
        coupon: couponCode || undefined,
        items: ga4Items,
      });
    } catch (e) {
      console.warn("📈 GA4 Purchase failed", e);
    }

    /* ✅ META PURCHASE */
    try {
      // ✅ If you have no contents pricing, still send Purchase with value
      const payload = {
        currency,
        value: finalValue, // ✅
        content_type: "product",
        content_ids: metaContents.map((c) => c.id),
        contents: metaContents,
        num_items: metaContents.reduce((s, c) => s + (c.quantity || 0), 0),
        order_id: String(orderId),
        payment_method: paymentMethod,
        ...(couponCode ? { coupon: couponCode } : {}),
      };

      // ✅ If you want the purchase to be attributed to success URL (optional)
      // trackMeta supports opts param in your implementation
      await trackMeta("Purchase", payload, {}, event_source_url ? { event_source_url } : {});
    } catch (e) {
      console.warn("🧾 Meta Purchase failed", e);
    }

    /* ✅ INTERNAL ANALYTICS PURCHASE */
    try {
      const analytics = useAnalyticsStore.getState();
      metaContents.forEach((c) => analytics.trackPurchase?.(c.id));
    } catch (e) {
      console.warn("📊 Internal purchase analytics failed", e);
    }
  } catch (e) {
    console.warn("Purchase tracking failed", e);
  }
},

  /**
   * GET ORDERS BY CUSTOMER
   * GET /api/orders/customer/:customerId
   */
  fetchMyOrders: async (customerId) => {
    set({ loading: true, error: null });
    try {
      if (!customerId) throw new Error("customerId is required");
      const data = await api(`/api/orders/customer/${customerId}`);
      set({ orders: data, loading: false });
      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * GET ORDER BY ID
   * GET /api/orders/:id
   */
  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      if (!id) throw new Error("Order id is required");
      const data = await api(`/api/orders/${id}`);
      set({ order: data, loading: false });
      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  // ----------------------------
  // Actions: Admin
  // ----------------------------

  /**
   * GET ALL ORDERS (Admin)
   * GET /api/orders?customerId=&paymentStatus=&fulfillmentStatus=
   */
  fetchAllOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const qs = new URLSearchParams();
      if (filters.customerId) qs.set("customerId", filters.customerId);
      if (filters.paymentStatus) qs.set("paymentStatus", filters.paymentStatus);
      if (filters.fulfillmentStatus) qs.set("fulfillmentStatus", filters.fulfillmentStatus);

      const data = await api(`/api/orders${qs.toString() ? `?${qs.toString()}` : ""}`);
      set({ orders: data, loading: false });
      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * UPDATE FULL ORDER (Admin)
   * PUT /api/orders/:id
   */
  updateOrder: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      if (!id) throw new Error("Order id is required");
      const data = await api(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });

      const updated = data.order;
      set((state) => ({
        order: state.order?._id === updated._id ? updated : state.order,
        orders: state.orders.map((o) => (o._id === updated._id ? updated : o)),
        loading: false,
      }));

      return updated;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * UPDATE ORDER STATUS (Admin)
   * PATCH /api/orders/:id/status
   */
  updateOrderStatus: async (id, { fulfillmentStatus, paymentStatus }) => {
    set({ loading: true, error: null });
    try {
      if (!id) throw new Error("Order id is required");
      const data = await api(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ fulfillmentStatus, paymentStatus }),
      });

      const updated = data.order;
      set((state) => ({
        order: state.order?._id === updated._id ? updated : state.order,
        orders: state.orders.map((o) => (o._id === updated._id ? updated : o)),
        loading: false,
      }));

      return updated;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * UPDATE TRACKING (Admin)
   * PATCH /api/orders/:id/tracking
   */
  updateTracking: async (id, trackingPatch) => {
    set({ loading: true, error: null });
    try {
      if (!id) throw new Error("Order id is required");
      const data = await api(`/api/orders/${id}/tracking`, {
        method: "PATCH",
        body: JSON.stringify(trackingPatch),
      });

      const updated = data.order;
      set((state) => ({
        order: state.order?._id === updated._id ? updated : state.order,
        orders: state.orders.map((o) => (o._id === updated._id ? updated : o)),
        loading: false,
      }));

      return updated;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * DELETE ORDER (Admin)
   * DELETE /api/orders/:id
   */
  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      if (!id) throw new Error("Order id is required");
      const data = await api(`/api/orders/${id}`, { method: "DELETE" });

      set((state) => ({
        orders: state.orders.filter((o) => o._id !== id),
        order: state.order?._id === id ? null : state.order,
        loading: false,
      }));

      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  /**
   * ORDER ANALYTICS (Admin)
   * GET /api/orders/analytics/summary
   */
  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api(`/api/orders/analytics/summary`);
      set({ analytics: data, loading: false });
      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  // ----------------------------
  // Helpers
  // ----------------------------
  clearError: () => set({ error: null }),
  clearOrder: () => set({ order: null }),
  clearOrders: () => set({ orders: [] }),
  clearLastCreatedOrder: () => set({ lastCreatedOrder: null }),
}));
