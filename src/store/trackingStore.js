"use client";

import { create } from "zustand";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/* -------------------------------------------------------
   INTERNAL STATE (not persisted)
------------------------------------------------------- */
let metaInitialized = false;
let gtmInitialized = false;

// prevent duplicate product views per session
const viewedProducts = new Set();

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
const isBrowser = typeof window !== "undefined";

const ensureDataLayer = () => {
  if (!isBrowser) return;
  window.dataLayer = window.dataLayer || [];
};

/* -------------------------------------------------------
   TRACKING STORE
------------------------------------------------------- */
export const useTrackingStore = create(() => ({
  /* ---------------------------------------------------
     INIT (call ONCE in root layout)
  --------------------------------------------------- */
  init: () => {
    if (!isBrowser) return;

    /* ---------- META PIXEL ---------- */
    if (META_PIXEL_ID && !metaInitialized) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      window.fbq("init", META_PIXEL_ID);
      console.log("🟦 Meta Pixel initialized:", META_PIXEL_ID);

      metaInitialized = true;
    }

    /* ---------- GTM ---------- */
    if (GTM_ID && !gtmInitialized) {
      ensureDataLayer();

      window.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });

      const gtmScript = document.createElement("script");
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(gtmScript);

      console.log("🟩 GTM initialized:", GTM_ID);

      gtmInitialized = true;
    }
  },

  /* ---------------------------------------------------
     PAGE VIEW (call on route change)
  --------------------------------------------------- */
  pageView: (url) => {
    if (!isBrowser) return;

    console.log("📄 PageView:", url);

    // Meta
    if (window.fbq) {
      window.fbq("track", "PageView");
    }

    // GTM
    ensureDataLayer();
    window.dataLayer.push({
      event: "page_view",
      page_path: url,
    });
  },

  /* ---------------------------------------------------
     PRODUCT VIEW (Product Card click)
  --------------------------------------------------- */
  viewProduct: ({ productId, name, price, category }) => {
    if (!isBrowser || !productId) return;

    const pid = String(productId);
    if (viewedProducts.has(pid)) return;
    viewedProducts.add(pid);

    console.log("👁️ ViewContent:", pid);

    // Meta
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [pid],
        content_name: name,
        content_type: "product",
        value: Number(price || 0),
        currency: "INR",
      });
    }

    // GTM
    ensureDataLayer();
    window.dataLayer.push({
      event: "view_item",
      ecommerce: {
        items: [
          {
            item_id: pid,
            item_name: name,
            item_category: category,
            price: Number(price || 0),
          },
        ],
      },
    });
  },

  /* ---------------------------------------------------
     ADD TO CART
  --------------------------------------------------- */
  addToCart: ({ productId, name, price, quantity = 1 }) => {
    if (!isBrowser || !productId) return;

    console.log("🛒 AddToCart:", productId);

    // Meta
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [String(productId)],
        content_type: "product",
        value: Number(price || 0) * quantity,
        currency: "INR",
      });
    }

    // GTM
    ensureDataLayer();
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        items: [
          {
            item_id: String(productId),
            item_name: name,
            price: Number(price || 0),
            quantity,
          },
        ],
      },
    });
  },

  /* ---------------------------------------------------
     CHECKOUT START
  --------------------------------------------------- */
  beginCheckout: ({ value }) => {
    if (!isBrowser) return;

    console.log("🚚 InitiateCheckout:", value);

    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: Number(value || 0),
        currency: "INR",
      });
    }

    ensureDataLayer();
    window.dataLayer.push({
      event: "begin_checkout",
      value: Number(value || 0),
      currency: "INR",
    });
  },

  /* ---------------------------------------------------
     PURCHASE (Order Success)
  --------------------------------------------------- */
  purchase: ({ orderId, value }) => {
    if (!isBrowser) return;

    console.log("💰 Purchase:", orderId, value);

    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: Number(value || 0),
        currency: "INR",
      });
    }

    ensureDataLayer();
    window.dataLayer.push({
      event: "purchase",
      transaction_id: orderId,
      value: Number(value || 0),
      currency: "INR",
    });
  },

  /* ---------------------------------------------------
     RESET (optional)
  --------------------------------------------------- */
  resetSession: () => {
    viewedProducts.clear();
    console.log("♻️ Tracking session reset");
  },
}));
