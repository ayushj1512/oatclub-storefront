import { create } from "zustand";

const isBrowser = typeof window !== "undefined";

const pushToDataLayer = (payload = {}) => {
  if (!isBrowser) return false;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV === "development") {
    console.log("GTM Event:", payload);
  }

  return true;
};

const normalizeItem = (item = {}) => ({
  item_id: item.productCode || item.sku || item._id || item.productId || "",
  item_name: item.name || item.title || item.productName || "",
  price: Number(item.price || item.salePrice || item.finalPrice || 0),
  quantity: Number(item.quantity || 1),
  item_category: item.categoryName || item.category || "",
  item_variant: item.size || item.variant || "",
});

const useGtmStore = create(() => ({
  pushEvent: (event, data = {}) => {
    return pushToDataLayer({
      event,
      ...data,
    });
  },

  viewItem: (product) => {
    return pushToDataLayer({
      event: "view_item",
      ecommerce: {
        currency: "INR",
        value: Number(product?.price || product?.salePrice || 0),
        items: [normalizeItem(product)],
      },
    });
  },

  addToCart: (item) => {
    return pushToDataLayer({
      event: "add_to_cart",
      ecommerce: {
        currency: "INR",
        value: Number(item?.price || item?.salePrice || 0) * Number(item?.quantity || 1),
        items: [normalizeItem(item)],
      },
    });
  },

  removeFromCart: (item) => {
    return pushToDataLayer({
      event: "remove_from_cart",
      ecommerce: {
        currency: "INR",
        value: Number(item?.price || item?.salePrice || 0) * Number(item?.quantity || 1),
        items: [normalizeItem(item)],
      },
    });
  },

  viewCart: ({ items = [], total = 0 } = {}) => {
    return pushToDataLayer({
      event: "view_cart",
      ecommerce: {
        currency: "INR",
        value: Number(total || 0),
        items: items.map(normalizeItem),
      },
    });
  },

  beginCheckout: ({ items = [], total = 0, coupon = "" } = {}) => {
    return pushToDataLayer({
      event: "begin_checkout",
      ecommerce: {
        currency: "INR",
        value: Number(total || 0),
        coupon,
        items: items.map(normalizeItem),
      },
    });
  },

  addPaymentInfo: ({ items = [], total = 0, paymentMethod = "" } = {}) => {
    return pushToDataLayer({
      event: "add_payment_info",
      ecommerce: {
        currency: "INR",
        value: Number(total || 0),
        payment_type: paymentMethod,
        items: items.map(normalizeItem),
      },
    });
  },

  purchase: ({ order = {}, items = [] } = {}) => {
    return pushToDataLayer({
      event: "purchase",
      ecommerce: {
        transaction_id: order.orderNumber || order._id,
        currency: "INR",
        value: Number(order.totalAmount || order.grandTotal || 0),
        tax: Number(order.taxAmount || 0),
        shipping: Number(order.shippingAmount || 0),
        coupon: order.couponCode || "",
        payment_type: order.paymentMethod || "",
        items: (items.length ? items : order.items || order.orderItems || []).map(normalizeItem),
      },
    });
  },

  couponApplied: ({ code = "", discount = 0 } = {}) => {
    return pushToDataLayer({
      event: "coupon_applied",
      coupon_code: code,
      discount: Number(discount || 0),
    });
  },
}));

export default useGtmStore;