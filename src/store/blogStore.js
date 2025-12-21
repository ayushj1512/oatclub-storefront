"use client";

import { create } from "zustand";

/**
 * -------------------------------------------------------------
 * Blog Store — API driven (Aligned with backend)
 * Backend: ${NEXT_PUBLIC_BACKEND_URL}/api/blogs
 * -------------------------------------------------------------
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  console.error(
    "❌ NEXT_PUBLIC_BACKEND_URL is not defined. Check your .env file."
  );
}

export const useBlogStore = create((set, get) => ({
  // -------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------
  blogs: [],
  currentBlog: null,

  loading: false,
  error: null,

  // pagination/meta
  total: 0,
  page: 1,
  pages: 1,

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------

  /**
   * 🔹 Fetch blog list
   * GET /api/blogs?page=&limit=
   */
  fetchBlogs: async ({ page = 1, limit = 10 } = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(
        `${BACKEND_URL}/api/blogs?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch blogs (${res.status})`);
      }

      const data = await res.json();

      const normalizedBlogs = (data.items || []).map((b) => ({
        id: b._id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content || "",
        image: b.image,
        category: b.category,
        tags: b.tags || [],
        author: b.author,
        isPublished: b.isPublished,
        date: b.date ? String(b.date) : null, // hydration safe
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      set({
        blogs: normalizedBlogs,
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.message || "Something went wrong",
        loading: false,
      });
    }
  },

  /**
   * 🔹 Fetch single blog (by slug or id)
   * GET /api/blogs/:idOrSlug
   */
  fetchSingleBlog: async (idOrSlug) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(
        `${BACKEND_URL}/api/blogs/${idOrSlug}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          set({ currentBlog: null, loading: false });
          return null;
        }
        throw new Error(`Failed to fetch blog (${res.status})`);
      }

      const b = await res.json();

      const normalizedBlog = {
        id: b._id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content || "",
        image: b.image,
        category: b.category,
        tags: b.tags || [],
        author: b.author,
        isPublished: b.isPublished,
        date: b.date ? String(b.date) : null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };

      set({
        currentBlog: normalizedBlog,
        loading: false,
      });

      return normalizedBlog;
    } catch (err) {
      set({
        error: err.message || "Something went wrong",
        loading: false,
      });
      return null;
    }
  },

  /**
   * 🔹 Get blog from list (sync)
   */
  getBlogBySlug: (slug) =>
    get().blogs.find((blog) => blog.slug === slug),

  /**
   * 🔹 Get all blogs (stable reference)
   */
  getBlogs: () => get().blogs,

  /**
   * 🔹 Clear current blog (route change safety)
   */
  clearCurrentBlog: () => set({ currentBlog: null }),

  /**
   * 🔹 Optimistic add (admin / CMS)
   */
  addBlog: (blog) =>
    set((state) => ({
      blogs: [blog, ...state.blogs],
      total: state.total + 1,
    })),
}));
