import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_BASE = `${BASE_URL}/api/homepage-settings`;

/* ============================
   Helpers
============================ */
const safeText = (value = "") => String(value || "").trim();

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0));

const normalizeHeroBanners = (banners = []) =>
  sortByOrder(banners)
    .filter((item) => item?.isActive !== false)
    .map((item, index) => {
      const desktopImage = safeText(item?.desktopImage || item?.image);
      const mobileImage = safeText(
        item?.mobileImage || item?.desktopImage || item?.image
      );

      return {
        ...item,
        desktopImage,
        mobileImage,
        image: desktopImage,
        title: safeText(item?.title),
        link: safeText(item?.link),
        isActive: item?.isActive !== false,
        sortOrder: index + 1,
      };
    });

const normalizeCategoryRow = (row = []) =>
  sortByOrder(row).map((item, index) => {
    const navigationType = item?.navigationType || "category";

    return {
      ...item,
      name: safeText(item?.name),
      navigationType,
      slug:
        navigationType === "category" || navigationType === "collection"
          ? safeText(item?.slug)
          : "",
      customRoute:
        navigationType === "custom" ? safeText(item?.customRoute) : "",
      image: safeText(item?.image),
      video: safeText(item?.video),
      tag: safeText(item?.tag),
      isActive: item?.isActive !== false,
      sortOrder: index + 1,
    };
  });

const normalizeCategoryBanners = (banners = []) =>
  sortByOrder(banners)
    .filter((item) => item?.isActive !== false)
    .map((item, index) => {
      const categorySlug = safeText(item?.categorySlug);

      return {
        ...item,
        categoryName: safeText(item?.categoryName),
        categorySlug,
        title: safeText(item?.title) || safeText(item?.categoryName),
        subtitle: safeText(item?.subtitle),
        image: safeText(item?.image),
        mobileImage: safeText(item?.mobileImage),
        link:
          safeText(item?.link) ||
          (categorySlug ? `/category/${categorySlug}` : ""),
        isActive: item?.isActive !== false,
        sortOrder: index + 1,
      };
    });

const normalizeSettings = (data = {}) => {
  const heroBanners = normalizeHeroBanners(data?.heroBanners || []);
  const categoryRow = normalizeCategoryRow(data?.categoryRow || []);
  const categoryBanners = normalizeCategoryBanners(data?.categoryBanners || []);

  return {
    ...data,
    heroBanners,
    categoryRow,
    categoryBanners,
  };
};

const parseResponse = async (res, fallbackMessage = "Something went wrong") => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

export const useHomepageSettingsStore = create((set) => ({
  settings: null,

  heroBanners: [],
  categoryRow: [],
  categoryBanners: [],

  loading: false,
  saving: false,
  error: null,
  success: null,

  /* ============================
     Fetch Homepage Settings
  ============================ */
  fetchHomepageSettings: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(API_BASE, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await parseResponse(res, "Failed to fetch settings");
      const normalized = normalizeSettings(data);

      set({
        settings: normalized,
        heroBanners: normalized.heroBanners,
        categoryRow: normalized.categoryRow,
        categoryBanners: normalized.categoryBanners,
        loading: false,
      });

      return normalized;
    } catch (err) {
      set({
        loading: false,
        error: err?.message || "Something went wrong",
      });
      return null;
    }
  },

  /* ============================
     Update Full Homepage Settings
  ============================ */
  updateHomepageSettings: async (payload = {}) => {
    try {
      set({ saving: true, error: null, success: null });

      const finalPayload = {
        ...payload,
      };

      if (Array.isArray(payload.heroBanners)) {
        finalPayload.heroBanners = normalizeHeroBanners(payload.heroBanners);
      }

      if (Array.isArray(payload.categoryRow)) {
        finalPayload.categoryRow = normalizeCategoryRow(payload.categoryRow);
      }

      if (Array.isArray(payload.categoryBanners)) {
        finalPayload.categoryBanners = normalizeCategoryBanners(
          payload.categoryBanners
        );
      }

      const res = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const data = await parseResponse(res, "Failed to update settings");
      const normalized = normalizeSettings(data);

      set({
        settings: normalized,
        heroBanners: normalized.heroBanners,
        categoryRow: normalized.categoryRow,
        categoryBanners: normalized.categoryBanners,
        saving: false,
        success: "Homepage settings updated ✅",
      });

      return normalized;
    } catch (err) {
      set({
        saving: false,
        error: err?.message || "Something went wrong",
      });
      return null;
    }
  },

  /* ============================
     Update Hero Banners
  ============================ */
  updateHeroBanners: async (heroBanners = []) => {
    try {
      set({ saving: true, error: null, success: null });

      const normalizedPayload = normalizeHeroBanners(heroBanners);

      const res = await fetch(`${API_BASE}/hero-banners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroBanners: normalizedPayload }),
      });

      const data = await parseResponse(res, "Failed to update hero banners");
      const normalized = normalizeSettings(data);

      set({
        settings: normalized,
        heroBanners: normalized.heroBanners,
        categoryRow: normalized.categoryRow,
        categoryBanners: normalized.categoryBanners,
        saving: false,
        success: "Hero banners updated ✅",
      });

      return normalized;
    } catch (err) {
      set({
        saving: false,
        error: err?.message || "Something went wrong",
      });
      return null;
    }
  },

  /* ============================
     Update Category Row
  ============================ */
  updateCategoryRow: async (categoryRow = []) => {
    try {
      set({ saving: true, error: null, success: null });

      const normalizedRow = normalizeCategoryRow(categoryRow);

      const res = await fetch(`${API_BASE}/category-row`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryRow: normalizedRow }),
      });

      const data = await parseResponse(res, "Failed to update category row");
      const normalized = normalizeSettings(data);

      set({
        settings: normalized,
        heroBanners: normalized.heroBanners,
        categoryRow: normalized.categoryRow,
        categoryBanners: normalized.categoryBanners,
        saving: false,
        success: "Category row updated ✅",
      });

      return normalized;
    } catch (err) {
      set({
        saving: false,
        error: err?.message || "Something went wrong",
      });
      return null;
    }
  },

  /* ============================
     Local Setters
  ============================ */
  setHeroBannersLocal: (heroBanners = []) => {
    const normalized = normalizeHeroBanners(heroBanners);

    set((state) => ({
      heroBanners: normalized,
      settings: state.settings
        ? {
            ...state.settings,
            heroBanners: normalized,
          }
        : state.settings,
    }));
  },

  setCategoryRowLocal: (categoryRow = []) => {
    const normalized = normalizeCategoryRow(categoryRow);

    set((state) => ({
      categoryRow: normalized,
      settings: state.settings
        ? {
            ...state.settings,
            categoryRow: normalized,
          }
        : state.settings,
    }));
  },

  setCategoryBannersLocal: (categoryBanners = []) => {
    const normalized = normalizeCategoryBanners(categoryBanners);

    set((state) => ({
      categoryBanners: normalized,
      settings: state.settings
        ? {
            ...state.settings,
            categoryBanners: normalized,
          }
        : state.settings,
    }));
  },

  /* ============================
     Helpers
  ============================ */
  clearMessages: () => set({ error: null, success: null }),
}));