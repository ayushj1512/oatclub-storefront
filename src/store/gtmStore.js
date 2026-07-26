"use client";

import { create } from "zustand";

import { useTrackingStore } from "@/store/trackingStore";

const useGtmStore = create(() => ({
  pushEvent: (event, data = {}) =>
    useTrackingStore
      .getState()
      .googlePushEvent(event, data),

  viewItem: (product = {}) =>
    useTrackingStore
      .getState()
      .googleViewItem(product),

  addToCart: (item = {}) =>
    useTrackingStore
      .getState()
      .googleAddToCart(item),

  removeFromCart: (item = {}) =>
    useTrackingStore
      .getState()
      .googleRemoveFromCart(item),

  viewCart: ({
    items = [],
    total = 0,
  } = {}) =>
    useTrackingStore
      .getState()
      .googleViewCart({
        items,
        total,
      }),

  beginCheckout: ({
    items = [],
    total = 0,
    coupon = "",
  } = {}) =>
    useTrackingStore
      .getState()
      .googleBeginCheckout({
        items,
        total,
        coupon,
      }),

  addShippingInfo: ({
    items = [],
    total = 0,
    coupon = "",
    shippingTier = "",
  } = {}) =>
    useTrackingStore
      .getState()
      .googleAddShippingInfo({
        items,
        total,
        coupon,
        shippingTier,
      }),

  addPaymentInfo: ({
    items = [],
    total = 0,
    coupon = "",
    paymentMethod = "",
  } = {}) =>
    useTrackingStore
      .getState()
      .googleAddPaymentInfo({
        items,
        total,
        coupon,
        paymentMethod,
      }),

  purchase: ({
    order = {},
    items = [],
  } = {}) =>
    useTrackingStore
      .getState()
      .googlePurchase({
        order,
        items,
      }),

  couponApplied: ({
    code = "",
    discount = 0,
  } = {}) =>
    useTrackingStore
      .getState()
      .googleCouponApplied({
        code,
        discount,
      }),
}));

export default useGtmStore;