"use client";

import { create } from "zustand";
import { trackMeta } from "@/lib/meta/track";


const viewedProducts = new Set();

const isBrowser = typeof window !== "undefined";

const ensureDataLayer = () => {
  if (!isBrowser) return;
  window.dataLayer = window.dataLayer || [];
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeItems = (items = []) =>
  items
    .map((it) => {
      const id = String(it?.productId || it?.id || it?.item_id || "").trim();
      if (!id) return null;

      return {
        id,
        name: it?.name || it?.title || it?.item_name || "",
        category: it?.category || it?.item_category || "",
        quantity: Math.max(1, toNum(it?.quantity || it?.qty || 1)),
        price: toNum(it?.price || it?.item_price || 0),
      };
    })
    .filter(Boolean);

export const useTrackingStore = create(() => ({
  init: () => {
  },

  pageView: (url) => {
  if (!isBrowser) return;

  const pagePath = url || window.location.pathname;

  ensureDataLayer();

  window.dataLayer.push({
    event: "page_view",
    page_path: pagePath,
  });
},

  viewProduct: async ({ productId, name, price, category, userData = {} }) => {
    if (!isBrowser || !productId) return;

    const pid = String(productId);
    if (viewedProducts.has(pid)) return;
    viewedProducts.add(pid);

    const value = toNum(price);

    console.log("👁️ ViewContent:", pid);

    await trackMeta(
      "ViewContent",
      {
        content_ids: [pid],
        content_name: name || "",
        content_type: "product",
        content_category: category || "",
        contents: [
          {
            id: pid,
            quantity: 1,
            item_price: value,
          },
        ],
        value,
        currency: "INR",
      },
      userData,
    );

    ensureDataLayer();
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        items: [
          {
            item_id: pid,
            item_name: name,
            item_category: category,
            price: value,
          },
        ],
      },
    });
  },

  addToCart: async ({
    productId,
    name,
    price,
    quantity = 1,
    category = "",
    userData = {},
  }) => {
    if (!isBrowser || !productId) return;

    const pid = String(productId);
    const qty = Math.max(1, toNum(quantity || 1));
    const unitPrice = toNum(price);
    const value = unitPrice * qty;

    console.log("🛒 AddToCart:", pid);

    await trackMeta(
      "AddToCart",
      {
        content_ids: [pid],
        content_type: "product",
        content_name: name || "",
        content_category: category || "",
        contents: [
          {
            id: pid,
            quantity: qty,
            item_price: unitPrice,
          },
        ],
        value,
        currency: "INR",
      },
      userData,
    );

    ensureDataLayer();
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        items: [
          {
            item_id: pid,
            item_name: name,
            item_category: category,
            price: unitPrice,
            quantity: qty,
          },
        ],
      },
    });
  },

  beginCheckout: async ({ value, items = [], userData = {} }) => {
    if (!isBrowser) return;

    const safeItems = normalizeItems(items);
    const safeValue =
      toNum(value) ||
      safeItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    console.log("🚚 InitiateCheckout:", safeValue);

    await trackMeta(
      "InitiateCheckout",
      {
        value: safeValue,
        currency: "INR",
        content_type: "product",
        content_ids: safeItems.map((it) => it.id),
        contents: safeItems.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          item_price: it.price,
        })),
        num_items: safeItems.reduce((sum, it) => sum + it.quantity, 0),
      },
      userData,
    );

    ensureDataLayer();
    window.dataLayer.push({
      event: "begin_checkout",
      value: safeValue,
      currency: "INR",
      ecommerce: {
        items: safeItems.map((it) => ({
          item_id: it.id,
          item_name: it.name,
          item_category: it.category,
          price: it.price,
          quantity: it.quantity,
        })),
      },
    });
  },

  purchase: async ({ orderId, value, items = [], userData = {} }) => {
    if (!isBrowser) return;

    const safeItems = normalizeItems(items);
    const safeValue =
      toNum(value) ||
      safeItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    console.log("💰 Purchase:", orderId, safeValue);

    const safeOrderId = String(orderId || "").trim();

    await trackMeta(
      "Purchase",
      {
        value: safeValue,
        currency: "INR",
        order_id: safeOrderId,
        content_type: "product",
        content_ids: safeItems.map((it) => it.id),
        contents: safeItems.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          item_price: it.price,
        })),
        num_items: safeItems.reduce((sum, it) => sum + it.quantity, 0),
      },
      {
        ...userData,
        external_id: userData.external_id || userData.externalId || safeOrderId,
      },
      {
        event_id: `purchase_${safeOrderId}`,
      },
    );

    ensureDataLayer();
    window.dataLayer.push({
      event: "purchase",
      transaction_id: safeOrderId,
      value: safeValue,
      currency: "INR",
      ecommerce: {
        transaction_id: safeOrderId,
        value: safeValue,
        currency: "INR",
        items: safeItems.map((it) => ({
          item_id: it.id,
          item_name: it.name,
          item_category: it.category,
          price: it.price,
          quantity: it.quantity,
        })),
      },
    });
  },

  resetSession: () => {
    viewedProducts.clear();
    console.log("♻️ Tracking session reset");
  },
}));
