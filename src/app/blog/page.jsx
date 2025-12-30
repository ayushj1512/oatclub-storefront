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
/* ----------------------------------------- */
const Card = ({ blog, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    viewport={{ once: true }}
    className="w-full"
  >
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white
                 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300"
    >
      {/* ================= IMAGE ================= */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#f5f5f5]">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 50vw,
                 (max-width: 1536px) 33vw,
                 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3
          className="text-[15px] md:text-[16px] font-semibold leading-snug text-gray-900
                     line-clamp-2 transition-colors group-hover:text-black"
        >
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

        {/* ================= TAGS ================= */}
        {blog.tags?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-3">
            {blog.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-600"
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

  /* ---------------- Fetch Blogs ---------------- */
  useEffect(() => {
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 60 });
    }
  }, [blogs?.length, fetchBlogs]);

  /* ---------------- Sort Blogs ---------------- */
  const sortedBlogs = useMemo(() => {
    return [...blogs]
      .filter((b) => b.isPublished)
      .sort((a, b) => {
        const da = new Date(a.date || a.createdAt);
        const db = new Date(b.date || b.createdAt);
        return db - da;
      });
  }, [blogs]);

  /* ---------------- Infinite Scroll ---------------- */
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
    <section className="min-h-screen w-full bg-[#f5f5f5] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20">

      {/* ================= HEADER ================= */}
      <div className="mx-auto mb-20 max-w-3xl text-center">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-500">
          Miray Journal
        </p>

        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
          Stories, Style & Inspiration
        </h1>

        <p className="mt-4 text-sm md:text-base text-gray-600">
          Western fashion, Gen-Z aesthetics, and modern styling stories — curated for clarity, not clutter.
        </p>

        <div className="mx-auto mt-8 h-px w-24 bg-gray-300" />
      </div>

      {/* ================= STATES ================= */}
      {loading && blogs.length === 0 && (
        <div className="py-24 text-center text-sm text-gray-500">
          Loading articles…
        </div>
      )}

      {error && (
        <div className="py-24 text-center text-sm text-red-600">
          Unable to load articles. Please try again.
        </div>
      )}

      {/* ================= GRID ================= */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
        {sortedBlogs.slice(0, visible).map((blog, i) => (
          <Card key={blog.slug} blog={blog} delay={i * 0.03} />
        ))}
      </div>

      {/* ================= LOAD MORE ================= */}
      {visible < sortedBlogs.length && (
        <div className="mt-20 text-center text-xs uppercase tracking-widest text-gray-400 animate-pulse">
          Loading more articles
        </div>
      )}
    </section>
  );
}

