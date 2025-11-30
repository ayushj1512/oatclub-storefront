"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

export default function BlogSection() {
  const blogs = useBlogStore((s) => s.blogs);

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-12">

      {/* HEADING */}
      <div className="px-6 mb-8 text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111] tracking-wide uppercase">
          From Our Blog
        </h2>

        <p className="text-gray-500 text-xs mt-1">
          Western fashion insights · Gen-Z aesthetics · Trend stories
        </p>

        <div className="h-[2px] w-16 bg-[#800020] mx-auto mt-2 rounded-full" />
      </div>

      {/* HORIZONTAL BLOG ROW */}
      <div className="flex gap-4 px-6 pb-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">

        {blogs.map((blog, index) => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="snap-start">
            <motion.div
              initial={false}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="relative flex-shrink-0 w-[180px] sm:w-[220px] bg-white border border-gray-200 rounded-xl cursor-pointer
                         hover:shadow-lg transition-shadow duration-300"
            >
              {/* NEW TAG — FIXED POSITION + ABOVE CARD */}
              {index < 2 && (
                <span className="absolute z-20 top-2 left-2 bg-[#800020] text-white text-[10px] px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}

              {/* IMAGE – FIXED ASPECT RATIO */}
              <div className="relative w-full aspect-[3/4] bg-white rounded-t-xl overflow-hidden flex items-center justify-center">
                <Image
                  src={blog.image || "/placeholder.png"}
                  alt={blog.title}
                  fill
                  loading="lazy"
                  className="object-contain p-2"
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

                <span className="text-[#800020] text-xs font-medium mt-1">
                  Read More →
                </span>
              </div>

            </motion.div>
          </Link>
        ))}

      </div>
    </section>
  );
}
