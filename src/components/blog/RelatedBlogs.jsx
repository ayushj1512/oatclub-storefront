"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const formatDate = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

function BlogCard({ blog, index }) {
  const prettyDate = formatDate(blog.date);

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block min-w-[260px] border border-black bg-white snap-start md:min-w-0"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-black bg-white">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-black/20 pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/50">
            Oatclub Times
          </p>

          {prettyDate && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-black/50">
              <Calendar size={11} />
              {prettyDate}
            </span>
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

        <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-black">
          Read Story
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function RelatedBlogs({ blogs = [], currentSlug }) {
  const relatedBlogs = blogs.filter((b) => b.slug !== currentSlug).slice(0, 6);
  if (!relatedBlogs.length) return null;

  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="mb-4 border-y-2 border-black py-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/50">
          More From
        </p>

        <h2 className="mt-1 font-serif text-3xl font-black uppercase leading-none tracking-tight text-black md:text-5xl">
          THE OATCLUB TIMES
        </h2>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-black/60">
          OWN ALL TRENDS
        </p>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible">
        {relatedBlogs.map((blog, index) => (
          <BlogCard key={blog.slug} blog={blog} index={index} />
        ))}
      </div>
    </section>
  );
}