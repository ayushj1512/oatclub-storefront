// store/useMediaStore.js
"use client";

import { create } from "zustand";
import toast from "react-hot-toast";

const API =
  (process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "").trim();

const str = (v) => (v == null ? "" : String(v));
const toInt = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getUrl = (m) => str(m?.url || m?.secure_url || m?.src);
const getId = (m) => str(m?._id || m?.id);

const dedupeById = (prev = [], next = []) => {
  const map = new Map();
  for (const x of prev) {
    const id = getId(x);
    if (id) map.set(id, x);
  }
  for (const x of next) {
    const id = getId(x);
    if (id) map.set(id, x);
  }
  return Array.from(map.values());
};

export const useMediaStore = create((set, get) => ({
  /* ---------------- state ---------------- */
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 48,

  q: "",
  type: "", // image | video | raw | "" (all)
  folder: "",

  loading: false,
  loadingMore: false,
  uploading: false,
  deleting: false,
  error: "",

  // selection helper (useful for review images)
  selected: [], // [{ _id, url, publicId, ... }]

  /* ---------------- filters ---------------- */
  setQuery: (q) => set({ q: str(q), page: 1 }),
  setType: (type) => set({ type: str(type), page: 1 }),
  setFolder: (folder) => set({ folder: str(folder) }),

  resetFilters: () => set({ q: "", type: "", folder: "", page: 1 }),

  /* ---------------- selection helpers ---------------- */
  clearSelected: () => set({ selected: [] }),

  toggleSelect: (m, { max = 25 } = {}) => {
    const id = getId(m);
    const url = getUrl(m);
    if (!id || !url) return;

    set((s) => {
      const exists = s.selected.some((x) => getId(x) === id);
      if (exists) return { selected: s.selected.filter((x) => getId(x) !== id) };
      if (s.selected.length >= max) {
        toast.error(`Max ${max} items allowed`);
        return {};
      }
      return { selected: [...s.selected, m] };
    });
  },

  removeSelected: (id) =>
    set((s) => ({ selected: s.selected.filter((x) => getId(x) !== str(id)) })),

  getSelectedUrls: () => get().selected.map(getUrl).filter(Boolean),

  /* ---------------- api: fetch ---------------- */
  fetchMedia: async ({ page = 1, limit, append = false } = {}) => {
    const key = append ? "loadingMore" : "loading";
    set({ [key]: true, error: "" });

    try {
      const st = get();
      const finalLimit = toInt(limit ?? st.limit, 48);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(finalLimit),
      });

      if (st.q) params.set("q", st.q);
      if (st.type) params.set("type", st.type);

      const res = await fetch(`${API}/api/media?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load media");

      const nextItems = Array.isArray(data?.items) ? data.items : [];
      set((s) => ({
        items: append ? dedupeById(s.items, nextItems) : nextItems,
        total: toInt(data?.total, 0),
        page: toInt(data?.page, page),
        pages: Math.max(1, toInt(data?.pages, 1)),
        limit: finalLimit,
      }));
    } catch (err) {
      console.error(err);
      set({ error: String(err?.message || err) });
      if (!append) set({ items: [], total: 0, page: 1, pages: 1 });
      toast.error("Failed to load media");
    } finally {
      set({ [key]: false });
    }
  },

  loadMore: async ({ limit } = {}) => {
    const st = get();
    if (st.loading || st.loadingMore) return;
    if (st.page >= st.pages) return;

    await get().fetchMedia({ page: st.page + 1, limit: limit ?? st.limit, append: true });
  },

  /* ---------------- api: upload ---------------- */
  uploadMedia: async ({ files, folder } = {}) => {
    if (!files || files.length === 0) return null;

    set({ uploading: true, error: "" });
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));

      // folder priority: arg > store.folder > default
      const finalFolder = str(folder || get().folder || "miray/media");
      if (finalFolder) form.append("folder", finalFolder);

      const res = await fetch(`${API}/api/media/upload`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      toast.success("Media uploaded");
      // refresh first page so new uploads appear instantly
      await get().fetchMedia({ page: 1, limit: get().limit, append: false });

      return data;
    } catch (err) {
      console.error(err);
      set({ error: String(err?.message || err) });
      toast.error(err?.message || "Upload failed");
      return null;
    } finally {
      set({ uploading: false });
    }
  },

  /* ---------------- api: delete ---------------- */
  deleteMedia: async (id, { confirm = true } = {}) => {
    const mediaId = str(id);
    if (!mediaId) return null;
    if (confirm && !window.confirm("Delete this media?")) return null;

    set({ deleting: true, error: "" });
    try {
      const res = await fetch(`${API}/api/media/${mediaId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      toast.success("Media deleted");

      // remove from local cache + selection
      set((s) => ({
        items: s.items.filter((x) => getId(x) !== mediaId),
        selected: s.selected.filter((x) => getId(x) !== mediaId),
        total: Math.max(0, s.total - 1),
      }));

      // if list got empty on current page, refetch page safely
      const st = get();
      if (st.items.length === 0 && st.page > 1) {
        await get().fetchMedia({ page: st.page - 1, limit: st.limit, append: false });
      }

      return data;
    } catch (err) {
      console.error(err);
      set({ error: String(err?.message || err) });
      toast.error(err?.message || "Delete failed");
      return null;
    } finally {
      set({ deleting: false });
    }
  },
}));
