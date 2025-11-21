"use client";

import { create } from "zustand";

// -------------------------------------------------------------
// 1️⃣ STATIC BLOG ARRAY (NOT RECREATED AT RUNTIME — HYDRATION SAFE)
// -------------------------------------------------------------
export const BLOGS = Object.freeze([
  {
    slug: "genz-western-outfits-2025",
    title: "Gen-Z Western Outfits Taking Over 2025",
    excerpt:
      "Oversized fits, Y2K revivals & cargo chic — explore the Gen-Z western wave ruling 2025.",
    date: "2025-11-10",
    category: "Fashion",
    tags: ["Western", "Streetwear", "GenZ", "Trends2025"],
    image:
      "https://i.pinimg.com/736x/de/4f/e9/de4fe9af230524f9cbe80f57cdf858e3.jpg",
    content: `FULL LONG CONTENT HERE...`,
  },

  {
    slug: "sustainable-western-fashion-essentials",
    title: "Sustainable Western Fashion Essentials for 2025",
    excerpt:
      "Recycled denim, vegan leather, earthy tones — the sustainable western guide.",
    date: "2025-10-30",
    category: "Lifestyle",
    tags: ["Sustainable", "WesternWear", "EcoFriendly", "Minimal"],
    image:
      "https://i.pinimg.com/736x/fc/78/87/fc78870957cef65a83db4f75248d1d54.jpg",
    content: `FULL LONG CONTENT HERE...`,
  },

  {
    slug: "winter-western-collection-guide-2025",
    title: "Winter Western Outfits You Need in 2025",
    excerpt:
      "Puffers, ribbed dresses & leather fits — the hottest winter western looks.",
    date: "2025-12-05",
    category: "Trends",
    tags: ["Winter", "WesternWear", "CozyFits", "StreetStyle"],
    image:
      "https://i.pinimg.com/736x/25/fa/b8/25fab8471de268ff2f4a251610382e14.jpg",
    content: `FULL LONG CONTENT HERE...`,
  },

  // -------------------------------------------------------------
  // Additional preview blogs (content optional)
  // -------------------------------------------------------------
  {
    slug: "genz-western-trends-2025",
    title: "10 Gen-Z Western Trends Dominating 2025",
    excerpt: "Cargo fits, micro-layers & street silhouettes — see what's trending.",
    date: "2025-10-10",
    category: "Fashion",
    tags: ["GenZ", "Trends", "WesternFashion"],
    image:
      "https://i.pinimg.com/736x/c4/87/81/c4878157046ba4aa935676ca67206b76.jpg",
    content: "",
  },

  {
    slug: "sustainable-western-fashion",
    title: "Sustainable Western Fashion Is the New Cool",
    excerpt: "Mindful dressing meets aesthetic western fashion.",
    date: "2025-09-15",
    category: "Lifestyle",
    tags: ["EcoFriendly", "WesternWear", "Sustainable"],
    image:
      "https://i.pinimg.com/736x/0f/e5/2b/0fe52b42e93d13e3f695005500c3bce7.jpg",
    content: "",
  },

  {
    slug: "western-style-for-every-occasion",
    title: "How to Dress for Any Event (Western Edition)",
    excerpt: "Date nights, brunch fits, office chic — western style decoded.",
    date: "2025-06-20",
    category: "Guides",
    tags: ["OccasionWear", "WesternStyle", "GenZ"],
    image:
      "https://i.pinimg.com/736x/26/4d/43/264d4319178c74be40b9ebe4ca56ee26.jpg",
    content: "",
  },

  {
    slug: "western-statement-pieces",
    title: "The Art of Statement Western Pieces",
    excerpt: "Jackets, boots & silhouettes that transform any outfit.",
    date: "2025-09-04",
    category: "Fashion",
    tags: ["StatementWear", "Western", "Streetwear"],
    image:
      "https://i.pinimg.com/736x/5c/ef/00/5cef0094f87d3751151f0bb8164312ce.jpg",
    content: "",
  },

  {
    slug: "western-fabrics-2025",
    title: "Textures & Fabrics Trending in Western Fashion",
    excerpt: "Satin, rib knits, faux leather — the top textures of 2025.",
    date: "2025-07-25",
    category: "Trends",
    tags: ["Fabrics", "Textures", "Western2025"],
    image:
      "https://i.pinimg.com/1200x/cd/20/9a/cd209a2560c684272a96290e9d60949c.jpg",
    content: "",
  },

  {
    slug: "aesthetic-western-looks",
    title: "Aesthetic Western Looks for Gen-Z",
    excerpt: "Soft-girl, Pinterest-core, city-girl — choose your western vibe.",
    date: "2025-08-01",
    category: "Fashion",
    tags: ["Aesthetic", "WesternWear", "GenZStyle"],
    image:
      "https://i.pinimg.com/736x/e1/9a/b2/e19ab2a46085735c0e47bd379f39638d.jpg",
    content: "",
  },

  {
    slug: "western-color-palettes-2025",
    title: "Color Palettes Dominating Western Outfits in 2025",
    excerpt: "Pastels, earth tones & deep neutrals shaping the year.",
    date: "2025-05-11",
    category: "Fashion",
    tags: ["Colors", "WesternFashion", "Trends2025"],
    image:
      "https://i.pinimg.com/736x/ef/84/ae/ef84ae78b61123e607bfe159b7420f7a.jpg",
    content: "",
  },

  {
    slug: "minimalist-western-luxury",
    title: "Minimalist Western Luxury — Quiet But Powerful",
    excerpt: "Clean looks with a premium vibe.",
    date: "2025-03-12",
    category: "Lifestyle",
    tags: ["Minimalism", "Luxury", "Western"],
    image:
      "https://i.pinimg.com/736x/c7/6a/02/c76a02bc7ed2b7c648289c5671cd4504.jpg",
    content: "",
  },

  {
    slug: "designer-inspired-western",
    title: "Designer-Inspired Western Outfits 2025",
    excerpt: "Runway silhouettes made wearable.",
    date: "2025-02-08",
    category: "Trends",
    tags: ["Designer", "WesternFashion"],
    image:
      "https://i.pinimg.com/736x/1b/24/09/1b2409466d5ea9f76a80166d4c80b8f6.jpg",
    content: "",
  },

  {
    slug: "western-layering-techniques",
    title: "Layering Western Outfits Like a Pro",
    excerpt: "Jackets, shrugs & textures for Pinterest-ready looks.",
    date: "2025-01-14",
    category: "Guides",
    tags: ["Layering", "WinterFits", "Western"],
    image:
      "https://i.pinimg.com/736x/e0/ca/a2/e0caa232ff936349c4bdf01f639a8eac.jpg",
    content: "",
  },
]);

// -------------------------------------------------------------
// 2️⃣ ZUSTAND STORE (HYDRATION SAFE)
// -------------------------------------------------------------
export const useBlogStore = create((set, get) => ({
  blogs: BLOGS, // static, stable, no re-renders

  // PREVIEW LIST (memoized, stable)
  getBlogs: () => get().blogs, // 🔥 return original, not a new mapped array

  // FULL BLOG
  getBlogBySlug: (slug) => get().blogs.find((b) => b.slug === slug),

  // Add blog
  addBlog: (blog) =>
    set((state) => ({
      blogs: [...state.blogs, blog],
    })),
}));
