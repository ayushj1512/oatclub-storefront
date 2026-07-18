"use client";

import { create } from "zustand";

import {
  clearMetaUserData,
  getMetaCatalogId,
  getMetaProductGroupId,
  getMetaUserData,
  setMetaUserData,
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

const resolveUserData = (userData = {}) =>
  getMetaUserData(userData);

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
          String(attribute?.key || "")
            .trim()
            .toLowerCase() === "size"
      )?.value,

    productId:
      item?.productId ||
      item?.product?._id ||
      item?._id,

    id:
      item?.id ||
      item?.item_id,
  });

const normalizeItems = (items = []) =>
  items
    .map((item) => {
      const catalogId = getItemCatalogId(item);

      if (!catalogId) return null;

      return {
        ...item,

        id: catalogId,
        catalogId,

        productGroupId:
          getItemProductGroupId(item),

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
          toNum(
            item?.quantity ||
              item?.qty ||
              1
          )
        ),

        price: toNum(
          item?.price ||
            item?.item_price ||
            item?.salePrice ||
            0
        ),
      };
    })
    .filter(Boolean);

export const useTrackingStore = create(
  (set, get) => ({
    userData: {},

    init: (customer = {}) => {
      if (!isBrowser) return;

      const userData = setMetaUserData(customer);

      set({ userData });
    },

    setCustomer: (customer = {}) => {
      const userData = setMetaUserData({
        email:
          customer?.email ||
          customer?.customerEmail,

        phone:
          customer?.phone ||
          customer?.phoneNumber ||
          customer?.customerPhone,

        external_id:
          customer?._id ||
          customer?.id ||
          customer?.uid ||
          customer?.customerId,

        first_name:
          customer?.firstName ||
          customer?.first_name ||
          customer?.name?.split?.(" ")?.[0],

        last_name:
          customer?.lastName ||
          customer?.last_name ||
          customer?.name
            ?.split?.(" ")
            ?.slice?.(1)
            ?.join?.(" "),

        city:
          customer?.city ||
          customer?.address?.city ||
          customer?.defaultAddress?.city,

        state:
          customer?.state ||
          customer?.address?.state ||
          customer?.defaultAddress?.state,

        zip_code:
          customer?.pincode ||
          customer?.zipCode ||
          customer?.postalCode ||
          customer?.address?.pincode ||
          customer?.defaultAddress?.pincode,

        country:
          customer?.country ||
          customer?.countryCode ||
          "in",
      });

      set({ userData });

      return userData;
    },

    clearCustomer: () => {
      clearMetaUserData();

      set({ userData: {} });
    },

    pageView: (url) => {
      if (!isBrowser) return;

      const pagePath =
        url || window.location.pathname;

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
        resolveUserData({
          ...get().userData,
          ...userData,
        })
      );

      ensureDataLayer();

      window.dataLayer.push({
        event: "view_item",

        ecommerce: {
          currency: "INR",
          value,

          items: [
            {
              item_id: groupId,
              item_name: name || "",
              item_category: category || "",
              price: value,
              quantity: 1,
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

      const itemCatalogId =
        getMetaCatalogId({
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

      const qty = Math.max(
        1,
        toNum(quantity || 1)
      );

      const unitPrice = toNum(price);
      const value = unitPrice * qty;

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
        resolveUserData({
          ...get().userData,
          ...userData,
        })
      );

      ensureDataLayer();

      window.dataLayer.push({
        event: "add_to_cart",

        ecommerce: {
          currency: "INR",
          value,

          items: [
            {
              item_id: itemCatalogId,
              item_name: name || "",
              item_category: category || "",
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
      email,
      phone,
      customerId,
      firstName,
      lastName,
      address = {},
      userData = {},
    }) => {
      if (!isBrowser) return;

      const safeItems = normalizeItems(items);

      if (!safeItems.length) {
        console.warn(
          "Meta InitiateCheckout skipped: no valid catalog item IDs"
        );

        return;
      }

      const checkoutUserData =
        setMetaUserData({
          ...get().userData,
          ...userData,

          email:
            email ||
            userData?.email,

          phone:
            phone ||
            userData?.phone,

          external_id:
            customerId ||
            userData?.external_id ||
            userData?.externalId,

          first_name:
            firstName ||
            userData?.first_name ||
            userData?.firstName,

          last_name:
            lastName ||
            userData?.last_name ||
            userData?.lastName,

          city:
            address?.city ||
            userData?.city,

          state:
            address?.state ||
            userData?.state,

          zip_code:
            address?.pincode ||
            address?.zipCode ||
            address?.postalCode ||
            userData?.zip_code,

          country:
            address?.country ||
            address?.countryCode ||
            userData?.country ||
            "in",
        });

      set({
        userData: checkoutUserData,
      });

      const safeValue =
        toNum(value) ||
        safeItems.reduce(
          (sum, item) =>
            sum +
            item.price * item.quantity,
          0
        );

      await trackMeta(
        "InitiateCheckout",
        {
          value: safeValue,
          currency: "INR",
          content_type: "product",

          content_ids: safeItems.map(
            (item) => item.id
          ),

          contents: safeItems.map(
            (item) => ({
              id: item.id,
              quantity: item.quantity,
              item_price: item.price,
            })
          ),

          num_items: safeItems.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          ),
        },
        checkoutUserData
      );

      ensureDataLayer();

      window.dataLayer.push({
        event: "begin_checkout",

        ecommerce: {
          value: safeValue,
          currency: "INR",

          items: safeItems.map(
            (item) => ({
              item_id: item.id,
              item_name: item.name,
              item_category: item.category,
              price: item.price,
              quantity: item.quantity,
            })
          ),
        },
      });
    },

    addPaymentInfo: async ({
      value,
      items = [],
      paymentType = "",
      userData = {},
    }) => {
      if (!isBrowser) return;

      const safeItems = normalizeItems(items);

      if (!safeItems.length) return;

      const safeValue =
        toNum(value) ||
        safeItems.reduce(
          (sum, item) =>
            sum +
            item.price * item.quantity,
          0
        );

      await trackMeta(
        "AddPaymentInfo",
        {
          value: safeValue,
          currency: "INR",
          payment_type: paymentType,
          content_type: "product",

          content_ids: safeItems.map(
            (item) => item.id
          ),

          contents: safeItems.map(
            (item) => ({
              id: item.id,
              quantity: item.quantity,
              item_price: item.price,
            })
          ),
        },
        resolveUserData({
          ...get().userData,
          ...userData,
        })
      );
    },

    purchase: async ({
      orderId,
      value,
      items = [],
      email,
      phone,
      customerId,
      firstName,
      lastName,
      address = {},
      userData = {},
    }) => {
      if (!isBrowser) return;

      const safeItems = normalizeItems(items);

      if (!safeItems.length) {
        console.warn(
          "Meta Purchase skipped: no valid catalog item IDs"
        );

        return;
      }

      const safeOrderId = String(
        orderId || ""
      ).trim();

      if (!safeOrderId) {
        console.warn(
          "Meta Purchase skipped: missing order ID"
        );

        return;
      }

      const purchaseUserData =
        setMetaUserData({
          ...get().userData,
          ...userData,

          email:
            email ||
            userData?.email,

          phone:
            phone ||
            userData?.phone,

          external_id:
            customerId ||
            userData?.external_id ||
            userData?.externalId ||
            safeOrderId,

          first_name:
            firstName ||
            userData?.first_name ||
            userData?.firstName,

          last_name:
            lastName ||
            userData?.last_name ||
            userData?.lastName,

          city:
            address?.city ||
            userData?.city,

          state:
            address?.state ||
            userData?.state,

          zip_code:
            address?.pincode ||
            address?.zipCode ||
            address?.postalCode ||
            userData?.zip_code,

          country:
            address?.country ||
            address?.countryCode ||
            userData?.country ||
            "in",
        });

      set({
        userData: purchaseUserData,
      });

      const safeValue =
        toNum(value) ||
        safeItems.reduce(
          (sum, item) =>
            sum +
            item.price * item.quantity,
          0
        );

      await trackMeta(
        "Purchase",
        {
          value: safeValue,
          currency: "INR",
          order_id: safeOrderId,
          content_type: "product",

          content_ids: safeItems.map(
            (item) => item.id
          ),

          contents: safeItems.map(
            (item) => ({
              id: item.id,
              quantity: item.quantity,
              item_price: item.price,
            })
          ),

          num_items: safeItems.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          ),
        },
        purchaseUserData,
        {
          event_id: `purchase_${safeOrderId}`,
        }
      );

      ensureDataLayer();

      window.dataLayer.push({
        event: "purchase",

        ecommerce: {
          transaction_id: safeOrderId,
          value: safeValue,
          currency: "INR",

          items: safeItems.map(
            (item) => ({
              item_id: item.id,
              item_name: item.name,
              item_category: item.category,
              price: item.price,
              quantity: item.quantity,
            })
          ),
        },
      });
    },

    resetSession: () => {
      viewedProducts.clear();
    },
  })
);