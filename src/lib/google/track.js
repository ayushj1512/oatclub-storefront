"use client";

/* =========================================================
    GENERAL HELPERS
  ========================================================= */

const isBrowser = () => typeof window !== "undefined";

const compactObject = (object = {}) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const normalizeGoogleNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeText = (value) => String(value ?? "").trim();

/* =========================================================
    DATA LAYER
  ========================================================= */

export const ensureGoogleDataLayer = () => {
  if (!isBrowser()) return null;

  window.dataLayer = window.dataLayer || [];

  return window.dataLayer;
};

export const clearGoogleEcommerce = () => {
  const dataLayer = ensureGoogleDataLayer();

  if (!dataLayer) return;

  dataLayer.push({
    ecommerce: null,
  });
};

/* =========================================================
    ITEM NORMALIZATION
  ========================================================= */

export const getGoogleItemId = (item = {}) => {
  return normalizeText(
    item?.item_id ||
      item?.googleItemId ||
      item?.catalogId ||
      item?.variantSku ||
      item?.variant?.sku ||
      item?.selectedVariant?.sku ||
      item?.sku ||
      item?.productCode ||
      item?.code ||
      item?.productId ||
      item?.product?._id ||
      item?._id ||
      item?.id,
  );
};

export const normalizeGoogleItem = (item = {}, defaults = {}) => {
  const itemId = getGoogleItemId(item);

  if (!itemId) return null;

  const quantity = Math.max(
    1,
    normalizeGoogleNumber(
      item?.quantity || item?.qty || defaults?.quantity || 1,
    ),
  );

  const price = normalizeGoogleNumber(
    item?.price ?? item?.item_price ?? item?.salePrice ?? defaults?.price ?? 0,
  );

  return compactObject({
    item_id: itemId,

    item_name: normalizeText(
      item?.item_name ||
        item?.name ||
        item?.title ||
        item?.product?.title ||
        defaults?.item_name,
    ),

    affiliation: normalizeText(
      item?.affiliation || defaults?.affiliation || "OATCLUB",
    ),

    coupon: normalizeText(item?.coupon || defaults?.coupon),

    discount: normalizeGoogleNumber(item?.discount ?? defaults?.discount),

    index:
      item?.index !== undefined
        ? normalizeGoogleNumber(item.index)
        : defaults?.index,

    item_brand: normalizeText(
      item?.item_brand || item?.brand || defaults?.item_brand || "OATCLUB",
    ),

    item_category: normalizeText(
      item?.item_category ||
        item?.category ||
        item?.product?.categories?.[0] ||
        defaults?.item_category,
    ),

    item_category2: normalizeText(
      item?.item_category2 ||
        item?.subcategory ||
        item?.product?.categories?.[1] ||
        defaults?.item_category2,
    ),

    item_list_id: normalizeText(
      item?.item_list_id || item?.listId || defaults?.item_list_id,
    ),

    item_list_name: normalizeText(
      item?.item_list_name || item?.listName || defaults?.item_list_name,
    ),

    item_variant: normalizeText(
      item?.item_variant ||
        item?.variantName ||
        item?.selectedSize ||
        item?.size ||
        item?.selectedVariant?.size ||
        item?.variant?.size ||
        defaults?.item_variant,
    ),

    price,
    quantity,
  });
};

export const normalizeGoogleItems = (items = [], defaults = {}) =>
  items
    .map((item, index) =>
      normalizeGoogleItem(item, {
        ...defaults,
        index: item?.index !== undefined ? item.index : index,
      }),
    )
    .filter(Boolean);

/* =========================================================
    VALUE HELPERS
  ========================================================= */

export const getGoogleItemsValue = (items = []) =>
  items.reduce(
    (total, item) =>
      total +
      normalizeGoogleNumber(item?.price) *
        Math.max(1, normalizeGoogleNumber(item?.quantity || 1)),
    0,
  );

/* =========================================================
    GOOGLE EVENT TRACKER
  ========================================================= */

export const trackGoogle = (eventName, parameters = {}, options = {}) => {
  if (!eventName || !isBrowser()) {
    return {
      success: false,
      eventName: eventName || null,
    };
  }

  const dataLayer = ensureGoogleDataLayer();

  if (!dataLayer) {
    return {
      success: false,
      eventName,
    };
  }

  if (options.clearEcommerce !== false) {
    clearGoogleEcommerce();
  }

  const eventPayload = compactObject({
    event: eventName,
    ...parameters,
  });

  dataLayer.push(eventPayload);

  if (process.env.NODE_ENV === "development" || options.debug) {
    console.log("✅ Google event pushed:", eventPayload);
  }

  return {
    success: true,
    eventName,
    payload: eventPayload,
  };
};

/* =========================================================
    PAGE EVENTS
  ========================================================= */

export const trackGooglePageView = ({
  pagePath,
  pageLocation,
  pageTitle,
} = {}) => {
  if (!isBrowser()) return;

  return trackGoogle(
    "page_view",
    compactObject({
      page_path:
        pagePath || `${window.location.pathname}${window.location.search}`,

      page_location: pageLocation || window.location.href,

      page_title: pageTitle || document.title,
    }),
    {
      clearEcommerce: false,
    },
  );
};

/* =========================================================
    ECOMMERCE EVENTS
  ========================================================= */

export const trackGoogleViewItem = ({
  value,
  currency = "INR",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("view_item", {
    ecommerce: {
      currency,
      value: safeValue,
      items: safeItems,
    },
  });
};

export const trackGoogleAddToCart = ({
  value,
  currency = "INR",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("add_to_cart", {
    ecommerce: {
      currency,
      value: safeValue,
      items: safeItems,
    },
  });
};

export const trackGoogleRemoveFromCart = ({
  value,
  currency = "INR",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("remove_from_cart", {
    ecommerce: {
      currency,
      value: safeValue,
      items: safeItems,
    },
  });
};

export const trackGoogleViewCart = ({
  value,
  currency = "INR",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("view_cart", {
    ecommerce: {
      currency,
      value: safeValue,
      items: safeItems,
    },
  });
};

export const trackGoogleBeginCheckout = ({
  value,
  currency = "INR",
  coupon = "",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("begin_checkout", {
    ecommerce: compactObject({
      currency,
      value: safeValue,
      coupon,
      items: safeItems,
    }),
  });
};

export const trackGoogleAddShippingInfo = ({
  value,
  currency = "INR",
  coupon = "",
  shippingTier = "",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("add_shipping_info", {
    ecommerce: compactObject({
      currency,
      value: safeValue,
      coupon,
      shipping_tier: shippingTier,
      items: safeItems,
    }),
  });
};

export const trackGoogleAddPaymentInfo = ({
  value,
  currency = "INR",
  coupon = "",
  paymentType = "",
  items = [],
} = {}) => {
  const safeItems = normalizeGoogleItems(items);

  if (!safeItems.length) return;

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("add_payment_info", {
    ecommerce: compactObject({
      currency,
      value: safeValue,
      coupon,
      payment_type: paymentType,
      items: safeItems,
    }),
  });
};

export const trackGooglePurchase = ({
  transactionId,
  value,
  currency = "INR",
  tax = 0,
  shipping = 0,
  coupon = "",
  paymentType = "",
  items = [],
  customerType,
} = {}) => {
  const safeTransactionId = normalizeText(transactionId);

  const safeItems = normalizeGoogleItems(items);

  if (!safeTransactionId || !safeItems.length) {
    console.warn("Google purchase skipped: transaction ID or items missing");

    return;
  }

  const safeValue =
    normalizeGoogleNumber(value) || getGoogleItemsValue(safeItems);

  return trackGoogle("purchase", {
    ecommerce: compactObject({
      transaction_id: safeTransactionId,
      currency,
      value: safeValue,
      tax: normalizeGoogleNumber(tax),
      shipping: normalizeGoogleNumber(shipping),
      coupon,
      payment_type: normalizeText(paymentType),
      customer_type: customerType,
      items: safeItems,
    }),
  });
};

export const trackGoogleRefund = ({
  transactionId,
  value,
  currency = "INR",
  tax,
  shipping,
  coupon = "",
  items = [],
} = {}) => {
  const safeTransactionId = normalizeText(transactionId);

  if (!safeTransactionId) return;

  const safeItems = normalizeGoogleItems(items);

  return trackGoogle("refund", {
    ecommerce: compactObject({
      transaction_id: safeTransactionId,
      currency,
      value: value !== undefined ? normalizeGoogleNumber(value) : undefined,
      tax: tax !== undefined ? normalizeGoogleNumber(tax) : undefined,
      shipping:
        shipping !== undefined ? normalizeGoogleNumber(shipping) : undefined,
      coupon,
      items: safeItems.length ? safeItems : undefined,
    }),
  });
};
