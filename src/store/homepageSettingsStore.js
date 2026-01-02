import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useHomepageSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  success: null,

  /* ============================
     Fetch Settings
  ============================ */
  fetchHomepageSettings: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BASE_URL}/api/homepage-settings`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch settings");

      set({ settings: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ============================
     Update Full Settings
  ============================ */
  updateHomepageSettings: async (payload) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/homepage-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update settings");

      set({
        settings: data,
        loading: false,
        success: "Homepage settings updated successfully ✅",
      });

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Update Hero Banners Only
  ============================ */
  updateHeroBanners: async (heroBanners) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/homepage-settings/hero-banners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroBanners }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update hero banners");

      set((state) => ({
        settings: { ...state.settings, heroBanners: data.heroBanners },
        loading: false,
        success: "Hero banners updated ✅",
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Update Category Row Only
  ============================ */
  updateCategoryRow: async (categoryRow) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/homepage-settings/category-row`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryRow }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category row");

      set((state) => ({
        settings: { ...state.settings, categoryRow: data.categoryRow },
        loading: false,
        success: "Category row updated ✅",
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Helpers
  ============================ */
  clearMessages: () => set({ error: null, success: null }),
}));
