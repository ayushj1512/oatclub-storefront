"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

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

function Card({ blog, index }) {
  const date = formatDate(blog.date || blog.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.18) }}
      viewport={{ once: true }}
    >
      <Link
        href={`/blog/${blog.slug}`}
        className="group block h-full border border-black bg-white"
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-black bg-white">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />

          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-black text-white">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-black/20 pb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
              Oatclub
            </p>

            {date && (
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-black/50">
                <Calendar size={11} />
                {date}
              </p>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-black uppercase leading-tight tracking-tight text-black">
            {blog.title}
          </h3>

          {blog.excerpt && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/60">
              {blog.excerpt}
            </p>
          )}

          {blog.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {blog.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="border border-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-black">
            Read Story
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPage() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);

  const [visible, setVisible] = useState(12);

  useEffect(() => {
    if (!blogs?.length) fetchBlogs({ page: 1, limit: 60 });
  }, [blogs?.length, fetchBlogs]);

  const sortedBlogs = useMemo(
    () =>
      [...(blogs || [])]
        .filter((b) => b.isPublished)
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        ),
    [blogs]
  );

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setVisible((v) => Math.min(v + 8, sortedBlogs.length));
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [sortedBlogs.length]);

  return (
    <section className="min-h-screen bg-white px-3 py-5 text-black sm:px-5 md:px-8">
      <header className="mx-auto mb-6 max-w-7xl border-y-2 border-black py-4 text-center">
        <p className="font-serif text-4xl font-black uppercase leading-none tracking-tight md:text-7xl">
          THE OATCLUB TIMES
        </p>

        <div className="mt-3 border-t border-black pt-3">
          <p className="text-[10px] font-black uppercase tracking-[0.28em]">
            Fashion • Trends • Oatclub Edit
          </p>

          <p className="mt-2 font-serif text-sm italic tracking-wide text-black/70">
            "Own All Trends"
          </p>
        </div>
      </header>

      <div className="mx-auto mb-5 flex max-w-7xl items-center justify-between border-b border-black pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/60">
          Latest Style Stories
        </p>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/60">
          {sortedBlogs.length} Articles
        </p>
      </div>

      {loading && blogs.length === 0 && (
        <div className="py-20 text-center text-xs font-black uppercase tracking-[0.25em] text-black/50">
          Loading articles…
        </div>
      )}

      {error && (
        <div className="py-20 text-center text-sm text-black">
          Unable to load articles.
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedBlogs.slice(0, visible).map((blog, i) => (
          <Card key={blog.slug} blog={blog} index={i} />
        ))}
      </div>

      {visible < sortedBlogs.length && (
        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.28em] text-black/50">
          Loading more stories…
        </div>
      )}
    </section>
  );
}