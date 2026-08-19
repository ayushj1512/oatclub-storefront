import { create } from "zustand";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { getMetaCatalogId, trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm"; // ✅ ADD THIS
import { trackSnap } from "@/lib/snap/track.js";
import { trackGoogleAdsPurchase } from "@/lib/google/track";
import axios from "axios";
import { useMarketingCampaignStore } from "@/store/marketing-campaignStore";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
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
  } catch { }

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
  actionOrder: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,

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
    customer: customerData = {},

    shippingAddressId = null,
    billingAddressId = null,

    shippingAddressSnapshot = null,
    billingAddressSnapshot = null,

    items,
    subtotal = 0,
    payable = null,
    discount = 0,
    coupon = null,
    razorpayExtraDiscount = 0,
    shippingFee = 0,
    tax = 0,
    paymentMethod = "cod",

    useWallet = false,
    walletAmount = 0,

    source = "website",
    isGiftOrder = false,
    customerMessage = "",
    currency = "INR",
  }) => {
    set({ placing: true, error: null });

    try {
      if (!customerId) {
        throw new Error("customerId is required");
      }

      if (!shippingAddressId && !shippingAddressSnapshot) {
        throw new Error("Delivery address is required");
      }

      if (!items?.length) {
        throw new Error("Order items missing");
      }

      const pm = String(paymentMethod).toLowerCase();
      const customer = customerData || {};

      if (!["cod", "razorpay", "wallet"].includes(pm)) {
        throw new Error("Invalid payment method");
      }

      const metaAddress =
        shippingAddressSnapshot ||
        customer?.shippingAddressSnapshot ||
        customer?.shippingAddress ||
        {};

      const metaUserData = {
        external_id: customer?._id || customerId,

        email: customer?.email || metaAddress?.email || "",

        phone: customer?.phone || customer?.mobile || metaAddress?.phone || "",

        firstName:
          customer?.firstName || metaAddress?.fullName?.split?.(" ")?.[0] || "",

        lastName:
          customer?.lastName ||
          metaAddress?.fullName?.split?.(" ")?.slice?.(1)?.join?.(" ") ||
          "",

        city: customer?.city || metaAddress?.city || "",

        state: customer?.state || metaAddress?.state || "",

        country: customer?.country || metaAddress?.country || "in",

        zip:
          customer?.pincode ||
          customer?.zip ||
          metaAddress?.pincode ||
          metaAddress?.postalCode ||
          "",
      };

      const couponCode =
        coupon && typeof coupon === "object"
          ? String(coupon.code || "").trim()
          : coupon
            ? String(coupon).trim()
            : "";

      const normalizedItems = (items || []).map((it) => {
        const productId = it?.productId || it?.id;
        const quantity = Number(it?.quantity ?? it?.qty ?? 0);
        const variantId = it?.variantId || it?.variant?._id || null;

        const price =
          Number(
            it?.price ??
            it?.itemPrice ??
            it?.item_price ??
            it?.salePrice ??
            it?.productSnapshot?.price ??
            it?.productSnapshot?.salePrice ??
            0,
          ) || 0;

        const collections =
          it?.collections ||
          it?.productSnapshot?.collections ||
          it?.collection ||
          it?.productSnapshot?.collection ||
          [];

        const isPrimaryProduct =
          it?.isPrimaryProduct === true ||
          it?.productSnapshot?.isPrimaryProduct === true;

        if (!productId) {
          throw new Error("Each item must have productId");
        }

        if (!Number.isFinite(quantity) || quantity < 1) {
          throw new Error("Invalid item quantity");
        }

        const selectedSize =
          it?.selectedSize ||
          it?.size ||
          it?.variant?.attributes?.find?.(
            (attr) =>
              String(attr?.key || "")
                .trim()
                .toLowerCase() === "size",
          )?.value ||
          "";

        const productCode =
          it?.productCode || it?.productSnapshot?.productCode || "";

        const variantSku = it?.variantSku || it?.variant?.sku || it?.sku || "";

        const catalogId = getMetaCatalogId({
          variantSku,
          sku: variantSku,
          productCode,
          selectedSize,
          productId,
        });

        return {
          productId,
          quantity,
          ...(variantId ? { variantId } : {}),

          catalogId,
          variantSku,
          productCode,

          price,
          itemPrice: price,
          item_price: price,

          collections,
          isPrimaryProduct,

          selectedSize,
          selectedColor: it?.selectedColor || it?.color || "",

          productSnapshot: {
            ...(it?.productSnapshot || {}),

            title: it?.name || it?.title || it?.productSnapshot?.title || "",

            price,
            salePrice: price,
            productCode,
            collections,
            isPrimaryProduct,

            thumbnail:
              it?.image ||
              it?.thumbnail ||
              it?.productSnapshot?.thumbnail ||
              it?.productSnapshot?.image ||
              "",

            image:
              it?.image ||
              it?.thumbnail ||
              it?.productSnapshot?.thumbnail ||
              it?.productSnapshot?.image ||
              "",
          },
        };
      });

      const contents = normalizedItems
        .map((it) => {
          const catalogId = String(
            it?.catalogId ||
            getMetaCatalogId({
              variantSku: it?.variantSku,
              productCode:
                it?.productCode || it?.productSnapshot?.productCode,
              selectedSize: it?.selectedSize,
              productId: it?.productId,
            }) ||
            "",
          ).trim();

          if (!catalogId) return null;

          return {
            id: catalogId,
            variantId: it?.variantId ? String(it.variantId) : null,

            variant: [it?.selectedSize, it?.selectedColor]
              .filter(Boolean)
              .join(" / "),

            name: it?.productSnapshot?.title || "",
            quantity: Number(it?.quantity || 1),
            item_price: Number(it?.price || 0),
          };
        })
        .filter(Boolean);

      const itemsTotal = contents.reduce(
        (sum, item) =>
          sum + Number(item.item_price || 0) * Number(item.quantity || 1),
        0,
      );

      const extraDiscount =
        pm === "razorpay" ? Math.max(0, Number(razorpayExtraDiscount || 0)) : 0;

      const finalDiscount = Number(discount || 0) + extraDiscount;

      const orderValue =
        payable != null
          ? Number(payable || 0)
          : Math.max(
            0,
            itemsTotal +
            Number(shippingFee || 0) +
            Number(tax || 0) -
            finalDiscount,
          );

      const requestedWalletAmount =
        useWallet === true || Number(walletAmount || 0) > 0 || pm === "wallet"
          ? Math.max(0, Number(walletAmount || 0))
          : 0;

      const payableAfterWallet = Math.max(
        0,
        orderValue - requestedWalletAmount,
      );

      const metaContents = contents.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.item_price,
      }));

      const itemIds = contents.map((item) => String(item.id));

      const numItems = metaContents.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      );

      try {
        await trackMeta(
          "InitiateCheckout",
          {
            currency,
            value: payableAfterWallet,
            wallet_amount: requestedWalletAmount,
            content_type: "product",
            content_ids: itemIds,
            contents: metaContents,
            num_items: numItems,
            ...(couponCode ? { coupon: couponCode } : {}),
            ...(pm === "razorpay"
              ? {
                razorpay_extra_discount: extraDiscount,
              }
              : {}),
          },
          metaUserData,
        );
      } catch (error) {
        console.warn("Meta InitiateCheckout failed", error);
      }

      try {
        const metaPaymentEventId = await trackMeta(
          "AddPaymentInfo",
          {
            currency,
            value: orderValue,
            content_type: "product",
            content_ids: itemIds,
            contents: metaContents,
            payment_method: pm,
            ...(pm === "razorpay"
              ? {
                razorpay_extra_discount: extraDiscount,
              }
              : {}),
          },
          metaUserData,
        );

        try {
          await trackSnap(
            "ADD_BILLING",
            {
              currency,
              price: orderValue,
              item_ids: itemIds,
              payment_method: pm,
            },
            {},
            {
              event_id: metaPaymentEventId,
            },
          );
        } catch (error) {
          console.warn("Snap ADD_BILLING failed", error);
        }
      } catch (error) {
        console.warn("Meta AddPaymentInfo failed", error);
      }

      const attribution =
        useMarketingCampaignStore.getState().getOrderMarketingPayload?.() ||
        null;

      const payload = {
        customerId,

        ...(shippingAddressId
          ? {
            shippingAddressId,
          }
          : {
            shippingAddressSnapshot,
          }),

        ...(billingAddressId
          ? {
            billingAddressId,
          }
          : shippingAddressId
            ? {
              billingAddressId: shippingAddressId,
            }
            : {
              billingAddressSnapshot:
                billingAddressSnapshot || shippingAddressSnapshot,
            }),

        items: normalizedItems,

        coupon: couponCode
          ? {
            code: couponCode,
          }
          : null,

        shippingFee: Number(shippingFee || 0),
        tax: Number(tax || 0),
        currency,

        paymentMethod: pm,

        useWallet: requestedWalletAmount > 0 || pm === "wallet",

        walletAmount: requestedWalletAmount,

        source,
        attribution,
        isGiftOrder,
        customerMessage,
      };

      console.log("CREATE ORDER PAYLOAD:", payload);

      const data = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const order = data?.order;

      const backendValue =
        Number(
          order?.finalPayable ??
          order?.finalTotal ??
          order?.grandTotal ??
          order?.total ??
          order?.payableAmount ??
          order?.amount ??
          order?.totalAmount ??
          0,
        ) || 0;

      if (pm === "cod" || pm === "wallet") {
        const metaOrderId = String(order?._id || "").trim();

        if (!metaOrderId) {
          console.warn("Meta Purchase skipped: Mongo order _id missing", {
            orderNumber: order?.orderNumber,
            paymentMethod: pm,
          });
        } else {
          await get().trackPurchaseSuccess({
            orderId: metaOrderId,

            currency,
            value: backendValue || orderValue,
            contents,
            coupon: couponCode,
            paymentMethod: pm,

            customer: {
              ...customer,
              shippingAddressSnapshot:
                shippingAddressSnapshot || customer?.shippingAddressSnapshot,
            },
          });
        }
      }

      try {
        const analytics = useAnalyticsStore.getState();

        normalizedItems.forEach((item) => {
          analytics.trackInitiateCheckout?.(item.productId);
        });
      } catch (error) {
        console.warn("Analytics checkout tracking failed", error);
      }

      set({
        lastCreatedOrder: order,
        placing: false,
      });

      return order;
    } catch (error) {
      set({
        error: error.message,
        placing: false,
      });

      throw error;
    }
  },

  trackPurchaseSuccess: async ({
    orderId,
    transactionId = null,
    currency = "INR",
    value = 0,
    contents = [],
    coupon = null,
    paymentMethod = "cod",
    event_source_url,
    customer = {},
  } = {}) => {
    try {
      const safeValue = Number(value);

      const finalValue =
        Number.isFinite(safeValue) && safeValue > 0
          ? safeValue
          : 0;

      const safeOrderId = String(orderId || "").trim();

      const safeTransactionId = String(
        transactionId || safeOrderId,
      ).trim();

      if (!safeOrderId) return;

      const purchaseEventId = `purchase_${safeOrderId}`;
      const now = Date.now();

      const key = `${purchaseEventId}_${paymentMethod}`;

      const {
        _lastPurchaseKey,
        _lastPurchaseAt,
      } = get();

      const sameKey = _lastPurchaseKey === key;

      const tooSoon =
        _lastPurchaseAt &&
        now - _lastPurchaseAt < 8000;

      if (sameKey && tooSoon) return;

      set({
        _lastPurchaseKey: key,
        _lastPurchaseAt: now,
      });

      const couponCode = coupon
        ? String(coupon).trim()
        : null;

      const metaContents = (contents || [])
        .map((c) => {
          const id = String(c?.id || "");

          if (!id) return null;

          const quantity = Number(
            c?.quantity || 1,
          );

          const itemPrice = Number(
            c?.item_price || 0,
          );

          return {
            id,

            quantity:
              Number.isFinite(quantity) &&
                quantity > 0
                ? quantity
                : 1,

            ...(Number.isFinite(itemPrice) &&
              itemPrice > 0
              ? {
                item_price: itemPrice,
              }
              : {}),
          };
        })
        .filter(Boolean);

      const ga4Items = (contents || [])
        .map((c) => {
          const item_id = String(
            c?.id || "",
          );

          if (!item_id) return null;

          const quantity = Number(
            c?.quantity || 1,
          );

          const price = Number(
            c?.item_price || 0,
          );

          return {
            item_id,

            item_name: c?.name
              ? String(c.name)
              : undefined,

            item_variant: c?.variant
              ? String(c.variant)
              : undefined,

            variant_id: c?.variantId
              ? String(c.variantId)
              : undefined,

            quantity:
              Number.isFinite(quantity) &&
                quantity > 0
                ? quantity
                : 1,

            ...(Number.isFinite(price) &&
              price > 0
              ? {
                price,
              }
              : {}),
          };
        })
        .filter(Boolean);

      // ============================================
      // META + SNAP PURCHASE
      // ============================================

      try {
        const payload = {
          currency,
          value: finalValue,

          content_type: "product",

          content_ids:
            metaContents.map((c) => c.id),

          contents: metaContents,

          num_items:
            metaContents.reduce(
              (sum, c) =>
                sum + (c.quantity || 0),
              0,
            ),

          order_id: safeTransactionId,

          payment_method:
            paymentMethod,

          ...(couponCode
            ? {
              coupon: couponCode,
            }
            : {}),
        };

        const metaPurchaseEventId =
          await trackMeta(
            "Purchase",
            payload,
            {
              external_id:
                customer?._id ||
                safeOrderId,

              email:
                customer?.email ||
                customer
                  ?.shippingAddressSnapshot
                  ?.email,

              phone:
                customer?.phone ||
                customer?.mobile ||
                customer
                  ?.shippingAddressSnapshot
                  ?.phone,

              firstName:
                customer?.firstName ||
                customer?.shippingAddress
                  ?.firstName ||
                customer
                  ?.shippingAddressSnapshot
                  ?.fullName
                  ?.split?.(" ")?.[0],

              lastName:
                customer?.lastName ||
                customer?.shippingAddress
                  ?.lastName ||
                customer
                  ?.shippingAddressSnapshot
                  ?.fullName
                  ?.split?.(" ")
                  ?.slice?.(1)
                  ?.join?.(" "),

              city:
                customer?.city ||
                customer?.shippingAddress
                  ?.city ||
                customer
                  ?.shippingAddressSnapshot
                  ?.city,

              state:
                customer?.state ||
                customer?.shippingAddress
                  ?.state ||
                customer
                  ?.shippingAddressSnapshot
                  ?.state,

              country:
                customer?.country ||
                customer?.shippingAddress
                  ?.country ||
                customer
                  ?.shippingAddressSnapshot
                  ?.country ||
                "in",

              zip:
                customer?.pincode ||
                customer?.zip ||
                customer?.shippingAddress
                  ?.pincode ||
                customer
                  ?.shippingAddressSnapshot
                  ?.pincode,
            },
            {
              event_id:
                purchaseEventId,

              ...(event_source_url
                ? {
                  event_source_url,
                }
                : {}),
            },
          );

        try {
          await trackSnap(
            "PURCHASE",
            {
              currency,

              price:
                finalValue,

              transaction_id:
                safeTransactionId,

              item_ids:
                metaContents.map((c) =>
                  String(c.id),
                ),

              payment_method:
                paymentMethod,

              ...(couponCode
                ? {
                  coupon:
                    couponCode,
                }
                : {}),
            },
            {},
            {
              event_id:
                metaPurchaseEventId,
            },
          );
        } catch (e) {
          console.warn(
            "👻 Snap PURCHASE failed",
            e,
          );
        }
      } catch (e) {
        console.warn(
          "🧾 Meta Purchase failed",
          e,
        );
      }

      // ============================================
      // GOOGLE ADS PURCHASE
      // ============================================

      try {
        trackGoogleAdsPurchase({
          transactionId:
            safeTransactionId,

          value:
            finalValue,

          currency,
        });
      } catch (e) {
        console.warn(
          "Google Ads PURCHASE failed",
          e,
        );
      }

      // ============================================
      // INTERNAL ANALYTICS
      // ============================================

      try {
        const analytics =
          useAnalyticsStore.getState();

        metaContents.forEach((c) =>
          analytics.trackPurchase?.(
            c.id,
          ),
        );
      } catch (e) {
        console.warn(
          "📊 Internal purchase analytics failed",
          e,
        );
      }
    } catch (e) {
      console.warn(
        "Purchase tracking failed",
        e,
      );
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

  fetchOrderByNumber: async (orderNumber) => {
    set({ loading: true, error: null });

    try {
      const data = await api(`/api/orders/by-number/${orderNumber}`);
      set({ order: data, loading: false });
      return data;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  fetchOrderByActionToken: async (token) => {
    set({ actionLoading: true, actionError: null });

    try {
      const res = await axios.get(`${API}/api/orders/by-number/${token}`);

      set({
        actionOrder: res.data,
        actionLoading: false,
      });

      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Order not found";

      set({
        actionError: msg,
        actionLoading: false,
      });

      throw new Error(msg);
    }
  },

  confirmOrderByActionToken: async () => {
    const order = get().actionOrder;
    if (!order?._id) return;

    set({ actionLoading: true, actionError: null, actionSuccess: null });

    try {
      const res = await axios.post(`${API}/api/orders/${order._id}/confirm`, {
        confirmedBy: "customer", // ✅ ADD THIS
      });

      const updated = res.data?.order || res.data;

      set({
        actionOrder: updated,
        actionSuccess: "Order confirmed successfully",
        actionLoading: false,
      });

      return updated;
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to confirm order";

      set({
        actionError: msg,
        actionLoading: false,
      });

      throw new Error(msg);
    }
  },
  cancelOrderByActionToken: async (reason = "Cancelled by customer") => {
    const order = get().actionOrder;
    if (!order?._id) return;

    set({ actionLoading: true, actionError: null, actionSuccess: null });

    try {
      const res = await axios.post(`${API}/api/orders/${order._id}/cancel`, {
        reason,
        cancelledBy: "customer",
      });

      const updated = res.data?.order || res.data;

      set({
        actionOrder: updated,
        actionSuccess: "Order cancelled successfully",
        actionLoading: false,
      });

      return updated;
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to cancel order";

      set({
        actionError: msg,
        actionLoading: false,
      });

      throw new Error(msg);
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
      if (filters.fulfillmentStatus)
        qs.set("fulfillmentStatus", filters.fulfillmentStatus);

      const data = await api(
        `/api/orders${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
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
  updateOrderStatus: async (
    id,
    {
      fulfillmentStatus,
      paymentStatus,
      adminRemarks,
      customerMessage,
      reason,
      cancelledBy,
    } = {},
  ) => {
    set({ loading: true, error: null });

    try {
      if (!id) throw new Error("Order id is required");

      const payload = {
        ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(adminRemarks != null ? { adminRemarks } : {}),
        ...(customerMessage != null ? { customerMessage } : {}),
        ...(reason != null ? { reason } : {}),
        ...(cancelledBy != null ? { cancelledBy } : {}),
      };

      const data = await api(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updated = data.order;

      set((state) => ({
        order: state.order?._id === updated?._id ? updated : state.order,
        orders: (state.orders || []).map((o) =>
          o._id === updated?._id ? updated : o,
        ),
        loading: false,
      }));

      return updated;
    } catch (e) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  cancelOrder: async (id, reason = "") => {
    if (!id) throw new Error("Order id is required");

    return get().updateOrderStatus(id, {
      fulfillmentStatus: "cancelled",
      cancelledBy: "customer",
      reason: String(reason || "").trim(),
      customerMessage: String(reason || "").trim(),
    });
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
  clearActionOrder: () =>
    set({
      actionOrder: null,
      actionError: null,
      actionSuccess: null,
    }),
}));
