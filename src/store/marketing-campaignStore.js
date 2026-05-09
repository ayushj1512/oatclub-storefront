"use client";

import { create } from "zustand";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MARKETING_API = `${API_URL}/api/marketing-campaigns`;

const STORAGE_KEY = "miray_marketing_campaign_tracking";
const VISITOR_KEY = "miray_vid";
const SESSION_KEY = "miray_sid";
const DEBUG = true;

const isBrowser = typeof window !== "undefined";

const log = (...args) => {
  if (DEBUG) console.log("📣 [MarketingCampaign]", ...args);
};

const warn = (...args) => {
  if (DEBUG) console.warn("📣 [MarketingCampaign]", ...args);
};

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    warn("localStorage parse failed", error);
    return null;
  }
};

const uid = (prefix = "id") => {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${random}`;
};

const getOrCreateId = (key, prefix) => {
  if (!isBrowser) return "";

  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const next = uid(prefix);
  localStorage.setItem(key, next);
  return next;
};

const clean = (v) => String(v || "").trim();
const lower = (v) => clean(v).toLowerCase();

const detectSourceFromClickIds = (data = {}) => {
  if (data.gclid) return "google";
  if (data.fbclid) return "facebook";
  if (data.msclkid) return "microsoft";
  if (data.ttclid) return "tiktok";
  if (data.scClickId) return "snapchat";
  return "";
};

const getUrlParams = () => {
  if (!isBrowser) {
    log("getUrlParams skipped: not browser");
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const now = new Date().toISOString();

  const data = {
    source: lower(params.get("utm_source")),
    medium: lower(params.get("utm_medium")),
    campaign: clean(params.get("utm_campaign")),
    campaignSlug: clean(params.get("utm_campaign")),

    content: clean(params.get("utm_content")),
    term: clean(params.get("utm_term")),

    campaignId: clean(params.get("campaignId")),
    marketingLinkId: clean(params.get("mlid")),
    shortCode: clean(params.get("mcode")),

    fbclid: clean(params.get("fbclid")),
    gclid: clean(params.get("gclid")),
    msclkid: clean(params.get("msclkid")),
    ttclid: clean(params.get("ttclid")),
    scClickId: clean(params.get("sc_click_id") || params.get("scClickId")),

    referrer: clean(document.referrer),
    landingUrl: window.location.href,
    landingPath: window.location.pathname,

    visitorId: getOrCreateId(VISITOR_KEY, "vid"),
    sessionId: sessionStorage.getItem(SESSION_KEY) || "",
    capturedAt: now,
    lastUpdatedAt: now,
  };

  if (!data.sessionId) {
    data.sessionId = uid("sid");
    sessionStorage.setItem(SESSION_KEY, data.sessionId);
  }

  const inferredSource = detectSourceFromClickIds(data);

  if (!data.source && inferredSource) {
    data.source = inferredSource;
  }

  if (!data.medium && inferredSource) {
    data.medium = "paid";
  }

  const hasAnyTracking = Boolean(
    data.source ||
      data.medium ||
      data.campaign ||
      data.campaignId ||
      data.marketingLinkId ||
      data.shortCode ||
      data.fbclid ||
      data.gclid ||
      data.msclkid ||
      data.ttclid ||
      data.scClickId
  );

  log("URL params checked", {
    href: window.location.href,
    hasAnyTracking,
    data,
  });

  if (!hasAnyTracking) return null;

  return data;
};

const mergeTracking = (oldTracking, fresh) => {
  const now = new Date().toISOString();

  if (!oldTracking && !fresh) return null;
  if (!oldTracking) {
    return {
      ...fresh,
      firstTouch: {
        source: fresh.source || "direct",
        medium: fresh.medium || "direct",
        campaign: fresh.campaign || "",
        campaignSlug: fresh.campaignSlug || "",
        content: fresh.content || "",
        term: fresh.term || "",
        pageUrl: fresh.landingUrl || "",
        landingUrl: fresh.landingUrl || "",
        referrer: fresh.referrer || "",
        capturedAt: fresh.capturedAt || now,
      },
      lastTouch: {
        source: fresh.source || "direct",
        medium: fresh.medium || "direct",
        campaign: fresh.campaign || "",
        campaignSlug: fresh.campaignSlug || "",
        content: fresh.content || "",
        term: fresh.term || "",
        pageUrl: fresh.landingUrl || "",
        landingUrl: fresh.landingUrl || "",
        referrer: fresh.referrer || "",
        capturedAt: fresh.capturedAt || now,
      },
    };
  }

  if (!fresh) return oldTracking;

  return {
    ...oldTracking,
    ...fresh,

    // first touch never changes
    firstTouch: oldTracking.firstTouch || {
      source: oldTracking.source || fresh.source || "direct",
      medium: oldTracking.medium || fresh.medium || "direct",
      campaign: oldTracking.campaign || fresh.campaign || "",
      campaignSlug: oldTracking.campaignSlug || fresh.campaignSlug || "",
      content: oldTracking.content || fresh.content || "",
      term: oldTracking.term || fresh.term || "",
      pageUrl: oldTracking.landingUrl || fresh.landingUrl || "",
      landingUrl: oldTracking.landingUrl || fresh.landingUrl || "",
      referrer: oldTracking.referrer || fresh.referrer || "",
      capturedAt: oldTracking.capturedAt || fresh.capturedAt || now,
    },

    // last touch updates on every new tracked visit
    lastTouch: {
      source: fresh.source || oldTracking.source || "direct",
      medium: fresh.medium || oldTracking.medium || "direct",
      campaign: fresh.campaign || oldTracking.campaign || "",
      campaignSlug: fresh.campaignSlug || oldTracking.campaignSlug || "",
      content: fresh.content || oldTracking.content || "",
      term: fresh.term || oldTracking.term || "",
      pageUrl: fresh.landingUrl || oldTracking.landingUrl || "",
      landingUrl: fresh.landingUrl || oldTracking.landingUrl || "",
      referrer: fresh.referrer || oldTracking.referrer || "",
      capturedAt: fresh.capturedAt || now,
    },

    lastUpdatedAt: now,
  };
};

export const useMarketingCampaignStore = create((set, get) => ({
  tracking: null,
  isTracking: false,
  error: null,

  loadTracking: () => {
    if (!isBrowser) {
      log("loadTracking skipped: not browser");
      return null;
    }

    const saved = safeParse(localStorage.getItem(STORAGE_KEY));

    set({ tracking: saved });
    log("Loaded tracking from localStorage", saved);

    return saved;
  },

  captureFromUrl: () => {
    if (!isBrowser) {
      log("captureFromUrl skipped: not browser");
      return null;
    }

    log("captureFromUrl started", window.location.href);

    getOrCreateId(VISITOR_KEY, "vid");

    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, uid("sid"));
    }

    const fresh = getUrlParams();
    const saved = get().loadTracking();
    const merged = mergeTracking(saved, fresh);

    if (!merged) {
      log("No URL tracking found, saved tracking restored");
      return saved;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    set({
      tracking: merged,
      error: null,
    });

    log("Captured and saved universal attribution", merged);

    return merged;
  },

  getTracking: () => {
    const stateTracking = get().tracking;

    if (stateTracking) {
      return stateTracking;
    }

    return get().loadTracking();
  },

  hasTracking: () => {
    const tracking = get().getTracking();

    const result = Boolean(
      tracking?.source ||
        tracking?.medium ||
        tracking?.campaign ||
        tracking?.campaignId ||
        tracking?.campaignSlug ||
        tracking?.marketingLinkId ||
        tracking?.shortCode ||
        tracking?.fbclid ||
        tracking?.gclid ||
        tracking?.msclkid ||
        tracking?.ttclid ||
        tracking?.scClickId
    );

    log("hasTracking result", { result, tracking });
    return result;
  },

  trackJourneyEvent: async (event, payload = {}) => {
    try {
      if (!isBrowser) return null;
      if (!event) return null;

      const tracking = get().getTracking();

      if (!tracking) {
        warn("trackJourneyEvent skipped: no tracking found", { event, payload });
        return null;
      }

      const requestPayload = {
        campaignId: tracking.campaignId || tracking.campaignSlug,
        marketingLinkId: tracking.marketingLinkId,
        shortCode: tracking.shortCode,

        event,
        pageUrl: payload.pageUrl || window.location.href,

        productId: payload.productId,
        productName: payload.productName,

        cartValue: payload.cartValue,
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        revenue: payload.revenue,
      };

      log("Sending journey event", requestPayload);

      set({ isTracking: true, error: null });

      const { data } = await axios.post(
        `${MARKETING_API}/journey/track`,
        requestPayload
      );

      set({ isTracking: false });

      log("Journey event tracked successfully", { event, response: data });
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to track marketing campaign journey";

      set({ isTracking: false, error: message });

      warn("Journey event failed", {
        event,
        payload,
        status: error?.response?.status,
        response: error?.response?.data,
        message,
      });

      return null;
    }
  },

  trackCollectionView: async (payload = {}) =>
    get().trackJourneyEvent("collection_view", payload),

  trackProductView: async (payload = {}) =>
    get().trackJourneyEvent("product_view", payload),

  trackAddToCart: async (payload = {}) =>
    get().trackJourneyEvent("add_to_cart", payload),

  trackCheckoutStarted: async (payload = {}) =>
    get().trackJourneyEvent("checkout_started", payload),

  markConversion: async (payload = {}) => {
    try {
      if (!isBrowser) return null;

      const tracking = get().getTracking();

      if (!tracking) {
        warn("markConversion skipped: no tracking found", payload);
        return null;
      }

      const requestPayload = {
        campaignId: tracking.campaignId || tracking.campaignSlug,
        marketingLinkId: tracking.marketingLinkId,
        shortCode: tracking.shortCode,
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        revenue: payload.revenue,
      };

      log("Sending conversion", requestPayload);

      set({ isTracking: true, error: null });

      const { data } = await axios.post(
        `${MARKETING_API}/conversion/track`,
        requestPayload
      );

      set({ isTracking: false });

      log("Conversion tracked successfully", data);
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to track marketing campaign conversion";

      set({ isTracking: false, error: message });

      warn("Conversion failed", {
        payload,
        status: error?.response?.status,
        response: error?.response?.data,
        message,
      });

      return null;
    }
  },

  getAttributionPayload: () => {
    const tracking = get().getTracking();

    if (!tracking) {
      log("getAttributionPayload returned null: no tracking");
      return null;
    }

    const payload = {
      source: tracking.source || "direct",
      medium: tracking.medium || "direct",
      campaign: tracking.campaign || tracking.campaignSlug || "",

      campaignId: tracking.campaignId || null,
      campaignSlug: tracking.campaignSlug || tracking.campaign || "",

      content: tracking.content || "",
      term: tracking.term || "",

      marketingLinkId: tracking.marketingLinkId || "",
      shortCode: tracking.shortCode || "",

      fbclid: tracking.fbclid || "",
      gclid: tracking.gclid || "",
      msclkid: tracking.msclkid || "",
      ttclid: tracking.ttclid || "",
      scClickId: tracking.scClickId || "",

      visitorId: tracking.visitorId || getOrCreateId(VISITOR_KEY, "vid"),
      sessionId:
        tracking.sessionId ||
        sessionStorage.getItem(SESSION_KEY) ||
        uid("sid"),

      referrer: tracking.referrer || "",
      landingUrl: tracking.landingUrl || "",
      firstTouchUrl:
        tracking.firstTouch?.pageUrl ||
        tracking.firstTouch?.landingUrl ||
        tracking.landingUrl ||
        "",
      lastTouchUrl:
        tracking.lastTouch?.pageUrl ||
        tracking.lastTouch?.landingUrl ||
        tracking.landingUrl ||
        "",

      firstTouch: tracking.firstTouch || null,
      lastTouch: tracking.lastTouch || null,

      capturedAt: tracking.capturedAt || new Date().toISOString(),
      lastUpdatedAt: tracking.lastUpdatedAt || new Date().toISOString(),
    };

    log("getAttributionPayload", payload);
    return payload;
  },

  // ✅ Backward compatible for current order store
  getOrderMarketingPayload: () => get().getAttributionPayload(),

  clearTracking: () => {
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
      log("Tracking cleared from localStorage", STORAGE_KEY);
    }

    set({
      tracking: null,
      error: null,
    });

    log("Tracking cleared from Zustand state");
  },
}));