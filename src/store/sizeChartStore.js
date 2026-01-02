import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useSizeChartStore = create((set, get) => ({
  sizeCharts: [],         // all charts list
  currentSizeChart: null, // selected chart
  loading: false,
  error: null,
  success: null,

  /* ============================
     Fetch All Size Charts
  ============================ */
  fetchSizeCharts: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BASE_URL}/api/size-charts`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch size charts");

      set({ sizeCharts: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ============================
     Fetch Size Chart by ID
  ============================ */
  fetchSizeChartById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BASE_URL}/api/size-charts/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch size chart");

      set({ currentSizeChart: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Create Size Chart
  ============================ */
  createSizeChart: async (payload) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/size-charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create size chart");

      set((state) => ({
        sizeCharts: [data, ...state.sizeCharts],
        loading: false,
        success: "Size chart created ✅",
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Update Size Chart
  ============================ */
  updateSizeChart: async (id, payload) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/size-charts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update size chart");

      set((state) => ({
        sizeCharts: state.sizeCharts.map((chart) =>
          chart._id === id ? data : chart
        ),
        currentSizeChart:
          state.currentSizeChart?._id === id ? data : state.currentSizeChart,
        loading: false,
        success: "Size chart updated ✅",
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Delete Size Chart
  ============================ */
  deleteSizeChart: async (id) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/size-charts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete size chart");

      set((state) => ({
        sizeCharts: state.sizeCharts.filter((chart) => chart._id !== id),
        currentSizeChart:
          state.currentSizeChart?._id === id ? null : state.currentSizeChart,
        loading: false,
        success: "Size chart deleted ✅",
      }));

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  /* ============================
     Helpers
  ============================ */
  setCurrentSizeChart: (chart) => set({ currentSizeChart: chart }),
  clearMessages: () => set({ error: null, success: null }),
}));
