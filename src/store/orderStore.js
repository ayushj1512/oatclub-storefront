import { create } from "zustand";

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
 * Order Store (Customer + Admin compatible)
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
  // Actions: Customer
  // ----------------------------

  /**
   * CREATE ORDER (Customer)
   * POST /api/orders
   */
  createOrder: async ({
    customerId,
    shippingAddressSnapshot,
    billingAddressSnapshot,
    items,
    subtotal,
    discount = 0,
    coupon = null,
    shippingFee = 0,
    tax = 0,
    totalAmount,
    finalPayable,
    paymentMethod = "cod",
    source = "website",
    isGiftOrder = false,
    customerMessage,
  }) => {
    set({ placing: true, error: null });

    try {
      // Minimal validation on frontend
      if (!customerId) throw new Error("customerId is required");
      if (!items?.length) throw new Error("Order items missing");

      // Enforce server-compatible shape
      const payload = {
        customerId,
        shippingAddressSnapshot,
        billingAddressSnapshot,
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          categoryId: it.categoryId,
          variant: it.variant,
          quantity: it.quantity,
          price: it.price,
          subtotal: it.subtotal,
          tags: it.tags || [],
        })),
        subtotal,
        discount,
        coupon,
        shippingFee,
        tax,
        totalAmount,
        finalPayable,
        paymentMethod,
        source,
        isGiftOrder,
        customerMessage,
      };

      const data = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // backend returns: { message, order }
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
      const data = await api(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });

      // backend returns: { message, order }
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
}));
