import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useReelStore = create((set, get) => ({
  reels: [],
  currentReel: null,

  // pagination
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false,

  loading: false,
  error: null,
  success: null,

  /* ============================
     Fetch Reels (List with Filters)
     GET /api/reels
     params: { page, limit, sort, activeNow, isActive, placement, q, append }
  ============================ */
  fetchReels: async (params = {}) => {
    try {
      set({ loading: true, error: null, success: null });

      const query = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sort: params.sort || "priority",
        ...(params.activeNow !== undefined ? { activeNow: params.activeNow } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
        ...(params.placement ? { placement: params.placement } : {}),
        ...(params.q ? { q: params.q } : {}),
      }).toString();

      const res = await fetch(`${BASE_URL}/api/reels?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch reels");

      set((state) => ({
        reels: params.append ? [...state.reels, ...(data.reels || [])] : data.reels || [],
        page: data.page,
        limit: data.limit,
        total: data.total,
        hasMore: data.hasMore,
        loading: false,
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Fetch One Reel (by id or slug)
     GET /api/reels/:idOrSlug
  ============================ */
  fetchReel: async (idOrSlug) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/reels/${idOrSlug}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch reel");

      set({ currentReel: data.reel, loading: false });
      return data.reel;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Create Reel
     POST /api/reels
  ============================ */
  createReel: async (payload) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/reels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create reel");

      set((state) => ({
        reels: [data.reel, ...state.reels],
        loading: false,
        success: "Reel created ✅",
      }));

      return data.reel;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Update Reel
     PATCH /api/reels/:id
  ============================ */
  updateReel: async (id, payload) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/reels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update reel");

      set((state) => ({
        reels: state.reels.map((r) => (r._id === id ? data.reel : r)),
        currentReel: state.currentReel?._id === id ? data.reel : state.currentReel,
        loading: false,
        success: "Reel updated ✅",
      }));

      return data.reel;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Toggle Active
     PATCH /api/reels/:id/toggle
  ============================ */
  toggleReelActive: async (id, isActive = undefined) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/reels/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isActive === undefined ? {} : { isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle reel");

      set((state) => ({
        reels: state.reels.map((r) => (r._id === id ? data.reel : r)),
        currentReel: state.currentReel?._id === id ? data.reel : state.currentReel,
        loading: false,
        success: "Reel status updated ✅",
      }));

      return data.reel;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* ============================
     Delete Reel
     DELETE /api/reels/:id
  ============================ */
  deleteReel: async (id) => {
    try {
      set({ loading: true, error: null, success: null });

      const res = await fetch(`${BASE_URL}/api/reels/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete reel");

      set((state) => ({
        reels: state.reels.filter((r) => r._id !== id),
        currentReel: state.currentReel?._id === id ? null : state.currentReel,
        loading: false,
        success: "Reel deleted ✅",
      }));

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  /* ============================
     Track Reel Event (Analytics)
     POST /api/reels/:id/events
     type: "view"|"tap"|"like"|"wishlist"|"share"
  ============================ */
  trackReelEvent: async (id, type, unique = false) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reels/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, unique }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to track event");

      if (data.reel) {
        set((state) => ({
          reels: state.reels.map((r) => (r._id === id ? data.reel : r)),
          currentReel: state.currentReel?._id === id ? data.reel : state.currentReel,
        }));
      }

      return true;
    } catch (err) {
      console.error("trackReelEvent error:", err.message);
      return false;
    }
  },

  /* ============================
     Helpers
  ============================ */
  setCurrentReel: (reel) => set({ currentReel: reel }),
  clearMessages: () => set({ error: null, success: null }),
}));
