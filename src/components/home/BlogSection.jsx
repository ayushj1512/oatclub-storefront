"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

/* 🔥 Shimmer block (JS only) */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function BlogSection() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  const scrollRef = useRef(null);

  // 🔥 Fetch blogs once
  useEffect(() => {
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 10 });
    }
  }, [blogs?.length, fetchBlogs]);

  // ✅ horizontal scroll helper
  const scrollRow = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const showArrows = (blogs?.length || 0) > 2 || loading;

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 pb-12">
      {/* HEADING */}
      <div className="px-6 mb-8 text-center">
        {loading ? (
          <>
            <div className="flex justify-center mb-2">
              <Shimmer className="h-6 w-44 rounded" />
            </div>
            <div className="flex justify-center">
              <Shimmer className="h-3 w-72 rounded" />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-black tracking-[0.2em] uppercase">
              From Our Blog
            </h2>

            <p className="text-gray-500 text-xs mt-1">
              Western fashion insights · Gen-Z aesthetics · Trend stories
            </p>

            <div className="h-px w-14 bg-black/30 mx-auto mt-3" />
          </>
        )}
      </div>

      {/* ERROR */}
      {error && <p className="text-center text-sm text-red-600">Failed to load blogs.</p>}

      {/* ✅ SLIDER WRAPPER */}
      <div className="relative">
        {/* ✅ LEFT ARROW */}
        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll left"
          >
            ←
          </button>
        )}

        {/* ✅ RIGHT ARROW */}
        {showArrows && (
          <button
            type="button"
            onClick={() => scrollRow("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/95 shadow-sm border border-black/10 flex items-center justify-center text-xl text-black/70 hover:text-black hover:bg-white active:scale-95 transition"
            aria-label="Scroll right"
          >
            →
          </button>
        )}

        {/* ✅ GRADIENT EDGES (UX cue) */}
        {showArrows && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent z-10" />
          </>
        )}

        {/* 🔥 SHIMMER LOADING */}
        {loading && !error && (
          <div ref={scrollRef} className="flex gap-4 px-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="snap-start flex-shrink-0 w-[260px] sm:w-[320px] border border-gray-200/70 rounded-2xl bg-white overflow-hidden">
                <Shimmer className="w-full aspect-video" />
                <div className="p-3 space-y-2">
                  <Shimmer className="h-4 w-4/5 rounded" />
                  <Shimmer className="h-4 w-3/5 rounded" />
                  <Shimmer className="h-3 w-full rounded" />
                  <Shimmer className="h-3 w-5/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && blogs.length === 0 && (
          <p className="text-center text-sm text-gray-500">No blog posts available right now.</p>
        )}

        {/* BLOG ROW */}
        {!loading && !error && blogs.length > 0 && (
          <div ref={scrollRef} className="flex gap-4 px-6 pb-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            {blogs.map((blog, index) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} className="snap-start">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ scale: 1.04 }}
                  className="relative flex-shrink-0 w-[260px] sm:w-[320px] bg-white rounded-2xl cursor-pointer border border-gray-200/70 hover:shadow-lg transition-shadow"
                >
                  {/* NEW TAG */}
                  {index < 2 && (
                    <span className="absolute z-20 top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full tracking-wide">
                      NEW
                    </span>
                  )}

                  {/* IMAGE */}
                  <div className="relative w-full aspect-video bg-gray-50 rounded-t-2xl overflow-hidden flex items-center justify-center">
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
                    <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-tight">{blog.title}</h3>
                    <p className="text-gray-600 text-[11px] leading-snug line-clamp-3">{blog.excerpt}</p>
                    <span className="text-black/70 text-xs font-medium mt-1">Read More →</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
