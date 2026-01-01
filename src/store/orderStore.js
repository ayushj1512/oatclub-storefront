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
    if (!["cod", "razorpay"].includes(pm)) throw new Error("Invalid payment method");

    /* ✅ normalize items for backend */
    const normalizedItems = items.map((it) => {
      const productId = it?.productId || it?.id;
      const quantity = Number(it?.quantity ?? it?.qty ?? 0);
      const variantId = it?.variantId || null;
      if (!productId) throw new Error("Each item must have productId");
      if (!Number.isFinite(quantity) || quantity < 1) throw new Error("Invalid item quantity");
      return { productId, quantity, ...(variantId ? { variantId } : {}) };
    });

    /* ✅ build contents for tracking */
    const contents = (items || [])
      .map((it) => {
        const id = it?.productId || it?.id;
        if (!id) return null;
        return {
          id: String(id),
          quantity: Number(it?.quantity ?? it?.qty ?? 1) || 1,
          item_price: Number(it?.price ?? it?.item_price ?? it?.salePrice ?? 0) || 0,
        };
      })
      .filter(Boolean);

    const itemsTotal = contents.reduce((s, c) => s + c.item_price * c.quantity, 0);
    const orderValue = Math.max(0, itemsTotal + Number(shippingFee || 0) + Number(tax || 0) - Number(discount || 0));

    /* ✅ Meta: InitiateCheckout + AddPaymentInfo (safe to fire here) */
    try {
      await trackMeta("InitiateCheckout", {
        currency,
        value: orderValue,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + c.quantity, 0),
        ...(coupon ? { coupon: String(coupon) } : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta InitiateCheckout failed", e);
    }

    try {
      await trackMeta("AddPaymentInfo", {
        currency,
        value: orderValue,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        payment_method: pm,
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
      discount,
      coupon,
      shippingFee,
      tax,
      currency,
      paymentMethod: pm,
      source,
      isGiftOrder,
      customerMessage,
    };

    const data = await api("/api/orders", { method: "POST", body: JSON.stringify(payload) });
    const order = data?.order;

    /* ✅ COD ONLY: Purchase tracking here */
    if (pm === "cod") {
      await get().trackPurchaseSuccess({
        orderId: order?._id || order?.orderNumber || customerId,
        currency,
        value: orderValue,
        contents,
        coupon,
        paymentMethod: "cod",
      });
    }

    /* ✅ Internal analytics: checkout events only (not purchase for razorpay) */
    try {
      const analytics = useAnalyticsStore.getState();
      normalizedItems.forEach((it) => analytics.trackInitiateCheckout?.(it.productId));
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
} = {}) => {
  try {
    const now = Date.now();
    const key = `purchase_${paymentMethod}_${orderId}_${value}`;

    const { _lastPurchaseKey, _lastPurchaseAt } = get();
    const sameKey = _lastPurchaseKey === key;
    const tooSoon = _lastPurchaseAt && now - _lastPurchaseAt < 5000;
    if (sameKey && tooSoon) return;

    set({ _lastPurchaseKey: key, _lastPurchaseAt: now });

    /* ✅✅✅ GA4 PURCHASE EVENT (FIX) */
    try {
      pushEcomEvent("purchase", {
        transaction_id: String(orderId),
        currency,
        value: Number(value || 0),
        payment_type: paymentMethod,
        coupon: coupon ? String(coupon) : undefined,
        items: (contents || []).map((c) => ({
          item_id: String(c.id),
          quantity: Number(c.quantity || 1),
          price: Number(c.item_price || 0),
        })),
      });
    } catch (e) {
      console.warn("📈 GA4 Purchase failed", e);
    }

    /* ✅ META Purchase */
    try {
      await trackMeta("Purchase", {
        currency,
        value: Number(value || 0),
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0),
        order_id: orderId,
        payment_method: paymentMethod,
        ...(coupon ? { coupon: String(coupon) } : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta Purchase failed", e);
    }

    /* ✅ INTERNAL ANALYTICS Purchase */
    try {
      const analytics = useAnalyticsStore.getState();
      contents.forEach((c) => {
        analytics.trackPurchase?.(c.id);
      });
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
