"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "STYLE JOURNAL";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "STYLE JOURNAL";
  }
};

function BlogCard({ blog, index }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block min-w-[260px] snap-start bg-white md:min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Image
          src={blog.image || "/placeholder.png"}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 260px, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-black backdrop-blur">
          EDIT {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="border-b border-neutral-200 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
          {formatDate(blog.date)}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-black uppercase leading-tight text-black">
          {blog.title}
        </h3>
        {blog.excerpt ? (
          <p className="mt-2 line-clamp-2 text-xs font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
            {blog.excerpt}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black">
          READ EDIT
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function RelatedBlogs({ blogs = [], currentSlug }) {
  const relatedBlogs = blogs.filter((blog) => blog.slug !== currentSlug).slice(0, 6);
  if (!relatedBlogs.length) return null;

  return (
    <section className="mx-auto mt-10 max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/45">
            KEEP READING
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase leading-tight text-black md:text-3xl">
            RELATED EDITS
          </h2>
        </div>
        <p className="max-w-sm text-[11px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
          MORE STYLE NOTES, CLEAN IDEAS AND WARDROBE MOVES FROM THE JOURNAL.
        </p>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
        {relatedBlogs.map((blog, index) => (
          <BlogCard key={blog.slug} blog={blog} index={index} />
        ))}
      </div>
    </section>
  );
}
