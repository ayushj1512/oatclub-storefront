"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

export default function BlogSection() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  // 🔥 Fetch blogs once (store-aligned)
  useEffect(() => {
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 10 });
    }
  }, [blogs?.length, fetchBlogs]);

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 pb-12">
  {/* HEADING */}
  <div className="px-6 mb-8 text-center">
    <h2 className="text-xl md:text-2xl font-semibold text-black tracking-[0.2em] uppercase">
      From Our Blog
    </h2>

    <p className="text-gray-500 text-xs mt-1">
      Western fashion insights · Gen-Z aesthetics · Trend stories
    </p>

    <div className="h-px w-14 bg-black/30 mx-auto mt-3" />
  </div>

  {/* ERROR STATE */}
  {error && (
    <p className="text-center text-sm text-red-600">
      Failed to load blogs.
    </p>
  )}

  {/* LOADING STATE (16:9 skeletons) */}
  {loading && !error && (
    <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[260px] sm:w-[320px] aspect-video bg-gray-100 rounded-xl animate-pulse"
        />
      ))}
    </div>
  )}

  {/* EMPTY STATE */}
  {!loading && !error && blogs.length === 0 && (
    <p className="text-center text-sm text-gray-500">
      No blog posts available right now.
    </p>
  )}

  {/* BLOG ROW */}
  {!loading && !error && blogs.length > 0 && (
    <div className="flex gap-4 px-6 pb-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
      {blogs.map((blog, index) => (
        <Link
          key={blog.slug}
          href={`/blog/${blog.slug}`}
          className="snap-start"
        >
          <motion.div
            initial={false}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="relative flex-shrink-0 w-[260px] sm:w-[320px] bg-white rounded-xl cursor-pointer border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            {/* NEW TAG */}
            {index < 2 && (
              <span className="absolute z-20 top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full tracking-wide">
                NEW
              </span>
            )}

            {/* IMAGE — 16:9 */}
            <div className="relative w-full aspect-video bg-gray-50 rounded-t-xl overflow-hidden flex items-center justify-center">
              <Image
                src={blog.image || "/placeholder.png"}
                alt={blog.title}
                fill
                sizes="(max-width: 640px) 260px, 320px"
                className="object-contain p-3"
                priority={index === 0}
              />
            </div>

            {/* CONTENT */}
            <div className="p-3 flex flex-col gap-1.5">
              <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-tight">
                {blog.title}
              </h3>

              <p className="text-gray-600 text-[11px] leading-snug line-clamp-3">
                {blog.excerpt}
              </p>

              <span className="text-black/70 text-xs font-medium mt-1">
                Read More →
              </span>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  )}
</section>

  );
}
