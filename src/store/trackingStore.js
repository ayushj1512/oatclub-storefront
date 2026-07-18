"use client";

import { create } from "zustand";

import {
  getMetaCatalogId,
  getMetaProductGroupId,
  trackMeta,
} from "@/lib/meta/track";

const viewedProducts = new Set();

const isBrowser = typeof window !== "undefined";

const ensureDataLayer = () => {
  if (!isBrowser) return;

  window.dataLayer = window.dataLayer || [];
};

const toNum = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const getItemProductGroupId = (item = {}) =>
  getMetaProductGroupId({
    productGroupId:
      item?.productGroupId ||
      item?.groupId ||
      item?.parentProductId,

    productId:
      item?.productId ||
      item?.product?._id ||
      item?._id ||
      item?.id,
  });

const getItemCatalogId = (item = {}) =>
  getMetaCatalogId({
    catalogId:
      item?.catalogId ||
      item?.metaCatalogId,

    variantSku:
      item?.variantSku ||
      item?.variant?.sku,

    sku:
      item?.sku ||
      item?.selectedVariant?.sku,

    productCode:
      item?.productCode ||
      item?.code ||
      item?.product?.productCode ||
      item?.productDetails?.productCode,

    selectedSize:
      item?.selectedSize ||
      item?.selectedVariant?.size,

    size:
      item?.size ||
      item?.variant?.size ||
      item?.variant?.attributes?.find?.(
        (attribute) =>
          String(attribute?.key || "").trim().toLowerCase() === "size",
      )?.value,

    productId:
      item?.productId ||
      item?.product?._id ||
      item?._id,

    id: item?.id || item?.item_id,
  });

const normalizeItems = (items = []) =>
  items
    .map((item) => {
      const catalogId = getItemCatalogId(item);

      if (!catalogId) return null;

      const productGroupId = getItemProductGroupId(item);

      return {
        ...item,

        id: catalogId,
        catalogId,
        productGroupId,

        productCode:
          item?.productCode ||
          item?.code ||
          item?.product?.productCode ||
          "",

        size:
          item?.selectedSize ||
          item?.size ||
          item?.selectedVariant?.size ||
          "",

        name:
          item?.name ||
          item?.title ||
          item?.item_name ||
          item?.product?.title ||
          "",

        category:
          item?.category ||
          item?.item_category ||
          item?.product?.categories?.[0] ||
          "",

        quantity: Math.max(
          1,
          toNum(item?.quantity || item?.qty || 1),
        ),

        price: toNum(
          item?.price ||
          item?.item_price ||
          item?.salePrice ||
          0,
        ),
      };
    })
    .filter(Boolean);

export const useTrackingStore = create(() => ({
  init: () => {},

  pageView: (url) => {
    if (!isBrowser) return;

    const pagePath = url || window.location.pathname;

    ensureDataLayer();

    window.dataLayer.push({
      event: "page_view",
      page_path: pagePath,
    });
  },

  viewProduct: async ({
    productId,
    productGroupId,
    id,
    name,
    price,
    category,
    userData = {},
  }) => {
    if (!isBrowser) return;

    const groupId = getMetaProductGroupId({
      productGroupId,
      productId,
      id,
    });

    if (!groupId) return;
    if (viewedProducts.has(groupId)) return;

    viewedProducts.add(groupId);

    const value = toNum(price);

    console.log("👁️ ViewContent product group:", groupId);

    await trackMeta(
      "ViewContent",
      {
        content_ids: [groupId],
        content_name: name || "",
        content_type: "product_group",
        content_category: category || "",

        contents: [
          {
            id: groupId,
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
            item_id: groupId,
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
    productCode,
    code,
    size,
    selectedSize,
    sku,
    variantSku,
    catalogId,
    metaCatalogId,
    name,
    price,
    quantity = 1,
    category = "",
    userData = {},
  }) => {
    if (!isBrowser) return;

    const itemCatalogId = getMetaCatalogId({
      catalogId,
      metaCatalogId,
      sku,
      variantSku,
      productCode,
      code,
      size,
      selectedSize,
      productId,
    });

    if (!itemCatalogId) return;

    const qty = Math.max(1, toNum(quantity || 1));
    const unitPrice = toNum(price);
    const value = unitPrice * qty;

    console.log("🛒 AddToCart catalog ID:", itemCatalogId);

    await trackMeta(
      "AddToCart",
      {
        content_ids: [itemCatalogId],
        content_type: "product",
        content_name: name || "",
        content_category: category || "",

        contents: [
          {
            id: itemCatalogId,
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
            item_id: itemCatalogId,
            item_name: name,
            item_category: category,
            price: unitPrice,
            quantity: qty,
          },
        ],
      },
    });
  },

  beginCheckout: async ({
    value,
    items = [],
    userData = {},
  }) => {
    if (!isBrowser) return;

    const safeItems = normalizeItems(items);

    if (!safeItems.length) {
      console.warn(
        "Meta InitiateCheckout skipped: no valid catalog item IDs",
      );

      return;
    }

    const safeValue =
      toNum(value) ||
      safeItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

    console.log(
      "🚚 InitiateCheckout catalog IDs:",
      safeItems.map((item) => item.id),
    );

    await trackMeta(
      "InitiateCheckout",
      {
        value: safeValue,
        currency: "INR",
        content_type: "product",

        content_ids: safeItems.map((item) => item.id),

        contents: safeItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        })),

        num_items: safeItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      },
      userData,
    );

    ensureDataLayer();

    window.dataLayer.push({
      event: "begin_checkout",
      value: safeValue,
      currency: "INR",

      ecommerce: {
        items: safeItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  },

  purchase: async ({
    orderId,
    value,
    items = [],
    userData = {},
  }) => {
    if (!isBrowser) return;

    const safeItems = normalizeItems(items);

    if (!safeItems.length) {
      console.warn(
        "Meta Purchase skipped: no valid catalog item IDs",
      );

      return;
    }

    const safeValue =
      toNum(value) ||
      safeItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

    const safeOrderId = String(orderId || "").trim();

    console.log("💰 Purchase:", {
      orderId: safeOrderId,
      value: safeValue,
      catalogIds: safeItems.map((item) => item.id),
    });

    await trackMeta(
      "Purchase",
      {
        value: safeValue,
        currency: "INR",
        order_id: safeOrderId,
        content_type: "product",

        content_ids: safeItems.map((item) => item.id),

        contents: safeItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        })),

        num_items: safeItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      },
      {
        ...userData,

        external_id:
          userData.external_id ||
          userData.externalId ||
          safeOrderId,
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

        items: safeItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  },

  resetSession: () => {
    viewedProducts.clear();

    console.log("♻️ Tracking session reset");
  },
}));