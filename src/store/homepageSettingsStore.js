import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_BASE = `${BASE_URL}/api/homepage-settings`;

/* ============================
   Helpers
============================ */
const normalizeCategoryRow = (row = []) =>
  [...row]
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((item, index) => {
      const navigationType = item?.navigationType || "category";

      return {
        ...item,
        name: item?.name || "",
        navigationType,
        slug:
          navigationType === "category" || navigationType === "collection"
            ? item?.slug || ""
            : "",
        customRoute: navigationType === "custom" ? item?.customRoute || "" : "",
        image: item?.image || "",
        video: item?.video || "",
        tag: item?.tag || "",
        isActive: item?.isActive !== false,
        sortOrder: index + 1,
      };
    });

export const useHomepageSettingsStore = create((set) => ({
  settings: null,

  heroBanners: [],
  categoryRow: [],

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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch settings");
      }

      set({
        settings: data,
        heroBanners: data.heroBanners || [],
        categoryRow: normalizeCategoryRow(data.categoryRow || []),
        loading: false,
      });

      return data;
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Something went wrong",
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
        categoryRow: payload.categoryRow
          ? normalizeCategoryRow(payload.categoryRow)
          : payload.categoryRow,
      };

      const res = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      set({
        settings: data,
        heroBanners: data.heroBanners || [],
        categoryRow: normalizeCategoryRow(data.categoryRow || []),
        saving: false,
        success: "Homepage settings updated ✅",
      });

      return data;
    } catch (err) {
      set({
        saving: false,
        error: err.message || "Something went wrong",
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

      const res = await fetch(`${API_BASE}/hero-banners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroBanners }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update hero banners");
      }

      set((state) => ({
        settings: {
          ...state.settings,
          heroBanners: data.heroBanners || [],
        },
        heroBanners: data.heroBanners || [],
        saving: false,
        success: "Hero banners updated ✅",
      }));

      return data;
    } catch (err) {
      set({
        saving: false,
        error: err.message || "Something went wrong",
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

      const normalized = normalizeCategoryRow(categoryRow);

      const res = await fetch(`${API_BASE}/category-row`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryRow: normalized }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update category row");
      }

      set((state) => ({
        settings: {
          ...state.settings,
          categoryRow: data.categoryRow || normalized,
        },
        categoryRow: normalizeCategoryRow(data.categoryRow || normalized),
        saving: false,
        success: "Category row updated ✅",
      }));

      return data;
    } catch (err) {
      set({
        saving: false,
        error: err.message || "Something went wrong",
      });
      return null;
    }
  },

  /* ============================
     Local Setters
  ============================ */
  setHeroBannersLocal: (heroBanners = []) => set({ heroBanners }),

  setCategoryRowLocal: (categoryRow = []) =>
    set({ categoryRow: normalizeCategoryRow(categoryRow) }),

  /* ============================
     Helpers
  ============================ */
  clearMessages: () => set({ error: null, success: null }),
}));