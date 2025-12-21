"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";

/* 🔹 format date safely */
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

export default function RelatedBlogs({ blogs = [], currentSlug }) {
  const relatedBlogs = blogs
    .filter((b) => b.slug !== currentSlug)
    .slice(0, 6); // 🔥 limit for UX

  if (relatedBlogs.length === 0) return null;

  return (
    <section className="mt-20 max-w-[900px] mx-auto">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#2b0004]">
          Related Blogs
        </h2>
        <div className="h-[2px] bg-[#800020] w-20 rounded-full mt-2" />
      </div>

      {/* 📱 MOBILE — HORIZONTAL */}
      <div className="flex md:hidden gap-5 mt-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {relatedBlogs.map((blog) => {
          const prettyDate = formatDate(blog.date);

          return (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group snap-start flex-shrink-0 w-[260px] rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]"
            >
              {/* IMAGE — FULLY VISIBLE */}
              <div className="relative w-full aspect-video bg-[#faf7f8] flex items-center justify-center">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                />
{/* 
                {blog.category && (
                  <span className="absolute top-2 left-2 bg-white/90 text-[#800020] text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {blog.category}
                  </span>
                )} */}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <p className="text-sm font-semibold text-[#2b0004] leading-snug line-clamp-2">
                  {blog.title}
                </p>

                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {blog.excerpt}
                </p>

                {prettyDate && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-3">
                    <Calendar size={12} />
                    <span>{prettyDate}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 🖥 DESKTOP — GRID */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {relatedBlogs.map((blog) => {
          const prettyDate = formatDate(blog.date);

          return (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
            >
              {/* IMAGE — FULLY VISIBLE */}
              <div className="relative w-full aspect-video bg-[#faf7f8] flex items-center justify-center">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {blog.category && (
                  <span className="absolute top-3 left-3 bg-white/90 text-[#800020] text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {blog.category}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <p className="text-sm font-semibold text-[#2b0004] leading-snug line-clamp-2">
                  {blog.title}
                </p>

                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {blog.excerpt}
                </p>

                {prettyDate && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-3">
                    <Calendar size={12} />
                    <span>{prettyDate}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
