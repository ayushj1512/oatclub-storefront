import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";

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
  shippingAddressId, // ✅ ID, not snapshot
  billingAddressId, // optional
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

    /* -------------------------------
       Normalize items
    -------------------------------- */
    const normalizedItems = items.map((it) => {
      const productId = it?.productId || it?.id;
      const quantity = Number(it?.quantity ?? it?.qty ?? 0);
      const variantId = it?.variantId || null;

      if (!productId) throw new Error("Each item must have productId");
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error("Invalid item quantity");
      }

      return {
        productId,
        quantity,
        ...(variantId ? { variantId } : {}),
      };
    });

    /* -------------------------------
       Compute cart value (for Meta)
    -------------------------------- */
    const safeItems = items || [];
    const contents = safeItems
      .map((it) => {
        const id = it?.productId || it?.id;
        const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;
        const price =
          Number(it?.price ?? it?.item_price ?? it?.salePrice ?? 0) || 0;

        if (!id) return null;

        return {
          id: String(id),
          quantity,
          item_price: price,
        };
      })
      .filter(Boolean);

    const itemsTotal = contents.reduce(
      (sum, c) =>
        sum +
        (Number(c.item_price) || 0) * (Number(c.quantity) || 1),
      0
    );

    const orderValue =
      Math.max(
        0,
        Number(itemsTotal || 0) +
          Number(shippingFee || 0) +
          Number(tax || 0) -
          Number(discount || 0)
      ) || 0;

    /* -------------------------------
       ✅ META: InitiateCheckout
    -------------------------------- */
    try {
      await trackMeta("InitiateCheckout", {
        currency,
        value: orderValue,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0),
        ...(coupon ? { coupon: String(coupon) } : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta InitiateCheckout failed", e);
    }

    /* -------------------------------
       ✅ META: AddPaymentInfo
    -------------------------------- */
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

    /* -------------------------------
       Payload (BACKEND CONTRACT)
    -------------------------------- */
    const payload = {
      customerId,
      shippingAddressId, // ✅ REQUIRED
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

    /* -------------------------------
       Create order (SERVER)
    -------------------------------- */
    const data = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    /* -------------------------------
       ✅ META: PURCHASE (COD ONLY)
       Razorpay purchase happens after verify in razorpayStore
    -------------------------------- */
    try {
      if (pm === "cod") {
        const orderId =
          data?.order?._id || data?.order?.orderNumber || undefined;

        const now = Date.now();
        const key = `purchase_cod_${orderId || customerId}_${orderValue}`;

        const { _lastPurchaseKey, _lastPurchaseAt } = get();
        const sameKey = _lastPurchaseKey === key;
        const tooSoon =
          _lastPurchaseAt && now - _lastPurchaseAt < 5000;

        if (!(sameKey && tooSoon)) {
          await trackMeta("Purchase", {
            currency,
            value: orderValue,
            content_type: "product",
            content_ids: contents.map((c) => c.id),
            contents,
            num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0),
            order_id: orderId,
            payment_method: "cod",
          });

          set({ _lastPurchaseKey: key, _lastPurchaseAt: now });
        }
      }
    } catch (e) {
      console.warn("🧾 Meta Purchase failed (COD)", e);
    }

    /* -------------------------------
       📊 ANALYTICS
    -------------------------------- */
    try {
      const analytics = useAnalyticsStore.getState();

      if (analytics.trackInitiateCheckout) {
        normalizedItems.forEach((item) => {
          analytics.trackInitiateCheckout(item.productId);
        });
      } else {
        normalizedItems.forEach((item) => {
          analytics.trackPurchase(item.productId);
        });
      }
    } catch (e) {
      console.warn("📊 Analytics checkout tracking failed", e);
    }

    set({ lastCreatedOrder: data.order, placing: false });
    return data.order;
  } catch (e) {
    set({ error: e.message, placing: false });
    throw e;
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
