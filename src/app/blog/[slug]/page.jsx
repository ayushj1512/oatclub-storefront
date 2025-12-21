"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Share2,
  ArrowLeft,
  Tag,
  MessageCircle,
} from "lucide-react";

import { useBlogStore } from "@/store/blogStore";
import RecommendedProducts from "@/components/blog/RecommendedProducts";
import RelatedBlogs from "@/components/blog/RelatedBlogs";

/* Demo recommended products (static for now) */
const recommendedProducts = [
  {
    id: 1,
    title: "Premium Chiffon Kurti – Peach Glow",
    image:
      "https://i.pinimg.com/736x/c2/e3/63/c2e363620d7b634da8c7f2c1afa9f2e7.jpg",
    price: "₹1299",
    link: "/products/premium-kurti-peach",
  },
  {
    id: 2,
    title: "Elegant Organza Suit Set – Wine",
    image:
      "https://i.pinimg.com/736x/0e/1d/fa/0e1dfad5f78ec2c8b8cf3688fcf6a473.jpg",
    price: "₹1899",
    link: "/products/organza-wine-set",
  },
  {
    id: 3,
    title: "Designer Festive Saree – Gold Luxe",
    image:
      "https://i.pinimg.com/736x/f1/4e/39/f14e39539d110b3e693a468f40894d0c.jpg",
    price: "₹2499",
    link: "/products/gold-luxe-saree",
  },
];

export default function BlogDetailPage(props) {
  const { slug } = use(props.params);

  const {
    currentBlog,
    blogs,
    loading,
    error,
    fetchSingleBlog,
    fetchBlogs,
    clearCurrentBlog,
  } = useBlogStore();

  // 🔥 Fetch blog + ensure list exists (for related blogs)
  useEffect(() => {
    fetchSingleBlog(slug);

    // 👇 IMPORTANT: fetch list only if missing
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 12 });
    }

    return () => {
      clearCurrentBlog();
    };
  }, [slug, fetchSingleBlog, fetchBlogs, clearCurrentBlog]);

  /* ---------------- LOADING ---------------- */
  if (loading && !currentBlog) {
    return (
      <div className="py-32 text-center text-gray-600 text-lg">
        Loading blog...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error && !currentBlog) {
    return (
      <div className="py-32 text-center text-red-600 text-lg">
        Failed to load blog.
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!loading && !currentBlog) {
    return (
      <div className="py-32 text-center text-gray-700 text-xl">
        Blog not found.
      </div>
    );
  }

  const blog = currentBlog;

  return (
    <div className="w-full bg-white py-10 px-5 md:px-10 lg:px-24 max-w-[1100px] mx-auto">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6"
      >
        <Link
          href="/blog"
          className="text-[#800020] text-sm font-medium hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold text-[#2b0004] leading-tight">
          {blog.title}
        </h1>

        <p className="text-gray-600 text-base md:text-lg max-w-[700px]">
          {blog.excerpt}
        </p>

        {/* HERO IMAGE */}
        <div className="relative w-full max-w-[820px] mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* TAGS */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-[#f7e9ec] text-[#800020] px-3 py-1 rounded-full flex items-center gap-1"
              >
                <Tag size={12} /> #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* CONTENT */}
      <div className="mt-10 text-[#3d0f16] leading-relaxed whitespace-pre-line text-[16px] md:text-[17px] max-w-[820px] mx-auto">
        {blog.content || "Full content coming soon..."}
      </div>

      {/* SHARE */}
      <div className="mt-10 max-w-[820px] mx-auto">
        <h3 className="text-sm text-gray-600 mb-2 flex items-center gap-2">
          <Share2 size={16} /> Share this article
        </h3>

        <div className="flex gap-4">
          <Link href="#" className="text-[#3b5998] hover:scale-110 transition">
            <Facebook size={22} />
          </Link>
          <Link href="#" className="text-[#1DA1F2] hover:scale-110 transition">
            <Twitter size={22} />
          </Link>
          <Link href="#" className="text-green-600 hover:scale-110 transition">
            <MessageCircle size={22} />
          </Link>
        </div>
      </div>

      {/* 🛍 RECOMMENDED PRODUCTS */}
      <RecommendedProducts products={recommendedProducts} />

      {/* 📰 RELATED BLOGS — NOW WORKS */}
      <RelatedBlogs blogs={blogs} currentSlug={slug} />
    </div>
  );
}
