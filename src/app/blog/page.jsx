"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { useBlogStore } from "@/store/blogStore";

const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("EN-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

function BlogCard({ blog, featured = false }) {
  const date = formatDate(blog.date || blog.createdAt);

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className={`group block bg-white ${featured ? "lg:grid lg:grid-cols-[1.2fr_0.8fr]" : ""}`}
    >
      <div className={`relative overflow-hidden bg-neutral-100 ${featured ? "aspect-[16/11] lg:aspect-auto" : "aspect-[4/5]"}`}>
        <Image
          src={blog.image || "/placeholder.png"}
          alt={blog.title}
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 768px) 100vw, 33vw"}
          priority={featured}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className={`border-b border-neutral-200 ${featured ? "p-5 md:p-8 lg:border-y lg:border-r lg:border-neutral-200" : "py-4"}`}>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
          <span>OATCLUB JOURNAL</span>
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          ) : null}
        </div>

        <h2 className={`${featured ? "mt-5 text-2xl md:text-4xl" : "mt-3 text-lg"} line-clamp-3 font-black uppercase leading-tight text-black`}>
          {blog.title}
        </h2>

        {blog.excerpt ? (
          <p className="mt-3 line-clamp-3 text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/50">
            {blog.excerpt}
          </p>
        ) : null}

        {blog.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {blog.tags.slice(0, featured ? 4 : 2).map((tag) => (
              <span key={tag} className="bg-neutral-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-black/55">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-black">
          READ EDIT
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
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
        .filter((blog) => blog.isPublished)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)),
    [blogs]
  );

  const [featured, ...rest] = sortedBlogs;

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setVisible((count) => Math.min(count + 8, rest.length));
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [rest.length]);

  return (
    <main className="min-h-screen bg-[#fafafa] px-3 py-8 text-black sm:px-5 md:px-8 md:py-12">
      <header className="mx-auto max-w-7xl border-b border-neutral-200 pb-7">
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/45">
          OATCLUB JOURNAL
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-3xl text-3xl font-black uppercase leading-tight text-black md:text-5xl">
            STYLE STORIES FOR THE MODERN WARDROBE
          </h1>
          <p className="max-w-sm text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/50">
            CURATED NOTES ON TRENDS, STYLING, OCCASIONS AND PIECES WORTH SAVING.
          </p>
        </div>
      </header>

      {loading && !blogs.length ? (
        <div className="py-24 text-center text-xs font-black uppercase tracking-[0.25em] text-black/45">
          LOADING JOURNAL
        </div>
      ) : null}

      {error ? (
        <div className="py-24 text-center text-sm font-black uppercase tracking-[0.2em] text-black/50">
          UNABLE TO LOAD JOURNAL
        </div>
      ) : null}

      {featured ? (
        <section className="mx-auto mt-8 max-w-7xl">
          <BlogCard blog={featured} featured />
        </section>
      ) : null}

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
            LATEST EDITS
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
            {sortedBlogs.length} ARTICLES
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, visible).map((blog) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
      </section>

      {visible < rest.length ? (
        <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.28em] text-black/45">
          LOADING MORE EDITS
        </div>
      ) : null}
    </main>
  );
}
