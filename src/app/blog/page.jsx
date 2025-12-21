"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

/* ----------------------------------------- */
/* HELPERS                                   */
/* ----------------------------------------- */
const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

/* ----------------------------------------- */
/* BLOG CARD                                 */
/* ----------------------------------------- */
const Card = ({ blog, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    viewport={{ once: true }}
    className="w-full"
  >
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-video bg-[#faf7f8] overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 (max-width: 1536px) 33vw,
                 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-semibold text-[#2b0004] text-[15px] md:text-[16px] leading-snug line-clamp-2 group-hover:text-[#800020]">
          {blog.title}
        </h3>

        {blog.date && (
          <p className="text-xs text-gray-500">
            {formatDate(blog.date)}
          </p>
        )}

        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
          {blog.excerpt}
        </p>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-3">
            {blog.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7e9ec] text-[#800020]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  </motion.div>
);

/* ----------------------------------------- */
/* MAIN BLOG PAGE                            */
/* ----------------------------------------- */
export default function BlogPage() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  const [visible, setVisible] = useState(12);

  /* 🔥 Fetch blogs once */
  useEffect(() => {
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 60 });
    }
  }, [blogs?.length, fetchBlogs]);

  /* ---- Sorted blogs (newest first) ---- */
  const sortedBlogs = useMemo(() => {
    return [...blogs]
      .filter((b) => b.isPublished)
      .sort((a, b) => {
        const da = new Date(a.date || a.createdAt);
        const db = new Date(b.date || b.createdAt);
        return db - da;
      });
  }, [blogs]);

  /* ---- Infinite Scroll ---- */
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisible((v) => v + 8);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-16 bg-white min-h-screen">
      {/* PAGE HEADING */}
      <div className="w-full text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-[#2b0004] tracking-tight">
          The Miray Journal
        </h1>

        <p className="text-gray-600 mt-3 text-sm md:text-base max-w-[720px] mx-auto">
          Western fashion, Gen-Z aesthetics & modern styling stories curated for you.
        </p>

        <div className="h-[2px] w-20 bg-[#800020] mx-auto mt-6 rounded-full" />
      </div>

      {/* LOADING */}
      {loading && blogs.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          Loading blogs…
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-center py-24 text-red-600">
          Failed to load blogs.
        </div>
      )}

      {/* BLOG GRID — FULL WIDTH */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
        {sortedBlogs.slice(0, visible).map((blog, i) => (
          <Card key={blog.slug} blog={blog} delay={i * 0.04} />
        ))}
      </div>

      {/* LOAD MORE */}
      {visible < sortedBlogs.length && (
        <div className="text-center mt-16 text-gray-400 text-sm animate-pulse">
          Loading more…
        </div>
      )}
    </section>
  );
}
