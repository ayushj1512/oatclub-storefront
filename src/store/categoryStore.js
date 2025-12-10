import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL; // http://localhost:5000

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text || "Invalid JSON response" };
  }
}

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * Category Store (Zustand)
 * - uses your backend routes: /api/categories
 * - supports search, active, featured, parent filters
 * - keeps a cached list + selected category
 */
export const useCategoryStore = create((set, get) => ({
  // -------------------------
  // State
  // -------------------------
  categories: [],
  selectedCategory: null,

  // helpful flags
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  error: null,

  // optional: remember last query used for fetching list
  lastQuery: {
    search: "",
    active: undefined,
    featured: undefined,
    parent: undefined, // "null" | parentId
  },

  // -------------------------
  // Helpers
  // -------------------------
  clearError: () => set({ error: null }),

  // If you want a nested tree for UI (parent -> children)
  getCategoryTree: () => {
    const list = get().categories || [];
    const map = new Map();
    const roots = [];

    list.forEach((c) => map.set(c._id, { ...c, children: [] }));

    map.forEach((node) => {
      const parentId =
        node.parent && typeof node.parent === "object"
          ? node.parent._id
          : node.parent;

      if (!parentId) roots.push(node);
      else {
        const p = map.get(parentId);
        if (p) p.children.push(node);
        else roots.push(node); // fallback if parent missing
      }
    });

    // sort by sortOrder then name (like backend)
    const sortFn = (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      String(a.name).localeCompare(String(b.name));

    const deepSort = (arr) => {
      arr.sort(sortFn);
      arr.forEach((x) => x.children && deepSort(x.children));
    };
    deepSort(roots);

    return roots;
  },

  // -------------------------
  // API Actions
  // -------------------------

  /**
   * Fetch all categories
   * @param {Object} query - { search, active, featured, parent }
   * parent can be:
   *  - "null" to get only root categories
   *  - a parentId to get children
   *  - undefined to get all
   */
  fetchCategories: async (query = {}) => {
    set({ loading: true, error: null });

    try {
      const finalQuery = { ...get().lastQuery, ...query };
      const url = `${API_BASE}/api/categories${buildQuery(finalQuery)}`;

      const res = await fetch(url, { method: "GET" });
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch categories");
      }

      set({
        categories: Array.isArray(data) ? data : [],
        lastQuery: finalQuery,
        loading: false,
      });
      return data;
    } catch (e) {
      set({ loading: false, error: e.message || "Something went wrong" });
      return null;
    }
  },

  /**
   * Fetch single category by id
   */
  fetchCategoryById: async (id) => {
    if (!id) return null;
    set({ loading: true, error: null });

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "GET",
      });
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch category");
      }

      set({ selectedCategory: data, loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: e.message || "Something went wrong" });
      return null;
    }
  },

  /**
   * Create category
   * @param {Object} payload - matches your controller fields
   * NOTE: parent can be "" or undefined; backend already handles -> null, but we normalize too.
   */
  createCategory: async (payload) => {
    set({ creating: true, error: null });

    try {
      const body = { ...payload };
      if (body.parent === "" || body.parent === undefined) body.parent = null;

      const res = await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create category");
      }

      // your API returns { message, category }
      const created = data?.category;

      // Update local list optimistically
      if (created?._id) {
        const next = [...get().categories, created];
        set({ categories: next, creating: false });
      } else {
        set({ creating: false });
        // refresh if response shape differs
        await get().fetchCategories(get().lastQuery);
      }

      return data;
    } catch (e) {
      set({ creating: false, error: e.message || "Something went wrong" });
      return null;
    }
  },

  /**
   * Update category
   */
  updateCategory: async (id, updates) => {
    if (!id) return null;
    set({ updating: true, error: null });

    try {
      const body = { ...updates };
      if (body.parent === "" || body.parent === undefined) body.parent = null;

      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update category");
      }

      const updated = data?.category;

      // Update local cache
      if (updated?._id) {
        const next = get().categories.map((c) =>
          c._id === updated._id ? updated : c
        );

        set({
          categories: next,
          selectedCategory:
            get().selectedCategory?._id === updated._id
              ? updated
              : get().selectedCategory,
          updating: false,
        });
      } else {
        set({ updating: false });
        await get().fetchCategories(get().lastQuery);
      }

      return data;
    } catch (e) {
      set({ updating: false, error: e.message || "Something went wrong" });
      return null;
    }
  },

  /**
   * Delete category
   */
  deleteCategory: async (id) => {
    if (!id) return null;
    set({ deleting: true, error: null });

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete category");
      }

      // Remove locally
      const next = get().categories.filter((c) => c._id !== id);

      set({
        categories: next,
        selectedCategory:
          get().selectedCategory?._id === id ? null : get().selectedCategory,
        deleting: false,
      });

      return data;
    } catch (e) {
      set({ deleting: false, error: e.message || "Something went wrong" });
      return null;
    }
  },
}));