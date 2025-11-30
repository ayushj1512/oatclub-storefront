"use client";

import { create } from "zustand";

// -------------------------------------------------------------
// 1️⃣ STATIC BLOG ARRAY (NOT RECREATED AT RUNTIME — HYDRATION SAFE)
// -------------------------------------------------------------
export const BLOGS = Object.freeze([
  {
    slug: "genz-western-outfits-2025",
    title: "Gen-Z Western Outfits Taking Over 2025",
    excerpt: "Oversized silhouettes, Y2K throwbacks, cargo chic and elevated basics — explore the western wave redefining Gen-Z fashion in 2025.",
    date: "2025-11-10",
    category: "Fashion",
    tags: ["Western", "GenZ", "Streetwear", "2025Trends"],
    image: "https://i.pinimg.com/736x/de/4f/e9/de4fe9af230524f9cbe80f57cdf858e3.jpg",
    content: `
2025 is officially the year of unapologetic Gen-Z western fashion. 
The new wave blends street silhouettes with premium textures, giving outfits a sharp but effortless personality.

✨ **What’s Trending?**
• Oversized jackets with cinched bottoms  
• Y2K micro-layering  
• Cargo pants with fitted crop tops  
• Denim-on-denim revived  
• Matte faux-leather boots  

🎯 **Why Gen-Z Loves It**
It’s minimal, expressive, gender-fluid, and deeply aesthetic. The outfits work for college, brunch, travel, street shopping — literally everywhere.

🔥 **Style Formula**  
Bold pieces + clean layers + neutral western tones = 2025’s signature look.
    `,
  },

  {
    slug: "sustainable-western-fashion-essentials",
    title: "Sustainable Western Fashion Essentials for 2025",
    excerpt: "Vegan leather, earthy tones, recycled denim — discover what makes sustainable western fashion the future of conscious dressing.",
    date: "2025-10-30",
    category: "Lifestyle",
    tags: ["Sustainable", "EcoFashion", "WesternWear"],
    image: "https://i.pinimg.com/736x/fc/78/87/fc78870957cef65a83db4f75248d1d54.jpg",
    content: `
Sustainable western fashion is no longer a trend — it's the new luxury.

🌱 **Must-Have Pieces**
• Recycled denim jackets  
• Vegan leather skirts & boots  
• Hemp & organic-cotton tops  
• Earth-tone layering pieces  

🌍 **Why It Matters**
Eco-fashion is redefining premium design with conscious materials that still look bold, aesthetic, and timeless.
    `,
  },

  {
    slug: "winter-western-collection-guide-2025",
    title: "Winter Western Outfits You Need in 2025",
    excerpt: "Puffer jackets, ribbed dresses, structured boots & leather fits — these western winter essentials will dominate this season.",
    date: "2025-12-05",
    category: "Trends",
    tags: ["Winter", "CozyFits", "Western2025"],
    image: "https://i.pinimg.com/736x/25/fa/b8/25fab8471de268ff2f4a251610382e14.jpg",
    content: `
Winter 2025 is all about warm western layering.

🧥 **Top Winter Western Fits**
• Longline puffer jackets  
• Rib-knit bodycon dresses  
• Oversized trench coats  
• Leather boots & structured bags  

💡 **Color Themes**
Burgundy, oatmeal, midnight black, vintage brown — minimal yet powerful.
    `,
  },

  // ---------------------------------------
  // Short preview blogs
  // ---------------------------------------
  {
    slug: "genz-western-trends-2025",
    title: "10 Gen-Z Western Trends Dominating 2025",
    excerpt: "Cargo fits, micro layers & Pinterest-ready silhouettes — here are the top western trends.",
    date: "2025-10-10",
    category: "Fashion",
    tags: ["GenZ", "Trends", "WesternFashion"],
    image: "https://i.pinimg.com/736x/c4/87/81/c4878157046ba4aa935676ca67206b76.jpg",
    content: "",
  },

  {
    slug: "sustainable-western-fashion",
    title: "Sustainable Western Fashion Is the New Cool",
    excerpt: "Eco-friendly designs meet soft western aesthetics — stylish and mindful.",
    date: "2025-09-15",
    category: "Lifestyle",
    tags: ["EcoFriendly", "WesternWear"],
    image: "https://i.pinimg.com/736x/0f/e5/2b/0fe52b42e93d13e3f695005500c3bce7.jpg",
    content: "",
  },

  {
    slug: "western-style-for-every-occasion",
    title: "How to Dress Western for Any Occasion",
    excerpt: "Date night, brunch, office or a casual day — here's your western cheat-sheet.",
    date: "2025-06-20",
    category: "Guides",
    tags: ["OccasionWear", "WesternStyle"],
    image: "https://i.pinimg.com/736x/26/4d/43/264d4319178c74be40b9ebe4ca56ee26.jpg",
    content: "",
  },

  {
    slug: "western-statement-pieces",
    title: "The Art of Statement Western Pieces",
    excerpt: "Elevate any outfit using jackets, boots & silhouettes that define personality.",
    date: "2025-09-04",
    category: "Fashion",
    tags: ["StatementWear", "Western"],
    image: "https://i.pinimg.com/736x/5c/ef/00/5cef0094f87d3751151f0bb8164312ce.jpg",
    content: "",
  },

  {
    slug: "western-fabrics-2025",
    title: "Textures & Fabrics Trending in Western Fashion",
    excerpt: "Rib knits, satin, faux leather & soft denim — the fabrics shaping 2025.",
    date: "2025-07-25",
    category: "Trends",
    tags: ["Fabrics", "Textures"],
    image: "https://i.pinimg.com/1200x/cd/20/9a/cd209a2560c684272a96290e9d60949c.jpg",
    content: "",
  },

  {
    slug: "aesthetic-western-looks",
    title: "Aesthetic Western Looks for Gen-Z",
    excerpt: "Soft girl, Pinterest core, city girl western — pick your vibe.",
    date: "2025-08-01",
    category: "Fashion",
    tags: ["Aesthetic", "Western", "GenZ"],
    image: "https://i.pinimg.com/736x/e1/9a/b2/e19ab2a46085735c0e47bd379f39638d.jpg",
    content: "",
  },

  {
    slug: "western-color-palettes-2025",
    title: "Color Palettes Dominating Western Outfits in 2025",
    excerpt: "Pastels, earth neutrals, muted tones & deep burgundy — fashion’s favorite colors.",
    date: "2025-05-11",
    category: "Fashion",
    tags: ["Colors", "WesternFashion"],
    image: "https://i.pinimg.com/736x/ef/84/ae/ef84ae78b61123e607bfe159b7420f7a.jpg",
    content: "",
  },

  {
    slug: "minimalist-western-luxury",
    title: "Minimalist Western Luxury — Quiet But Powerful",
    excerpt: "Clean cuts, premium textures & neutral tones for a luxe look.",
    date: "2025-03-12",
    category: "Lifestyle",
    tags: ["Minimalism", "Luxury"],
    image: "https://i.pinimg.com/736x/c7/6a/02/c76a02bc7ed2b7c648289c5671cd4504.jpg",
    content: "",
  },

  {
    slug: "designer-inspired-western",
    title: "Designer-Inspired Western Outfits 2025",
    excerpt: "Runway-inspired silhouettes you can actually wear.",
    date: "2025-02-08",
    category: "Trends",
    tags: ["Designer", "Western"],
    image: "https://i.pinimg.com/736x/1b/24/09/1b2409466d5ea9f76a80166d4c80b8f6.jpg",
    content: "",
  },

  {
    slug: "western-layering-techniques",
    title: "Layering Western Outfits Like a Pro",
    excerpt: "Learn how to layer jackets, shrugs & textures for the perfect western look.",
    date: "2025-01-14",
    category: "Guides",
    tags: ["Layering", "WinterFits"],
    image: "https://i.pinimg.com/736x/e0/ca/a2/e0caa232ff936349c4bdf01f639a8eac.jpg",
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
