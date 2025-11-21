"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

export default function BlogSection() {
const blogs = useBlogStore((s) => s.blogs); // FULL blogs

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-16">

      {/* Heading */}
      <div className="px-8 mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111]">
          From Our Blog
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Western fashion insights, Gen-Z aesthetics & trend breakdowns
        </p>
        <div className="h-[2px] w-16 bg-[#800020] mt-2 rounded-full" />
      </div>

      {/* Horizontal Scroll */}
      <div className="flex flex-row gap-6 px-8 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">

        {blogs.map((blog, index) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="snap-start"
          >
            <motion.div
              initial={false} // 🚀 hydration-safe
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="
                flex-shrink-0 w-[240px] bg-white rounded-2xl 
                border border-gray-200 shadow-sm 
                hover:shadow-xl transition-all duration-300 cursor-pointer relative
              "
            >
              {/* NEW badge */}
              {index < 2 && (
                <span className="absolute top-2 left-2 bg-[#800020] text-white text-[10px] px-2 py-1 rounded-full shadow">
                  NEW
                </span>
              )}

              {/* Image */}
              <div className="relative w-full h-[260px] rounded-t-2xl overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  loading="lazy"
                  fill
                  className="object-contain transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>

                <span className="text-[#800020] text-xs font-medium mt-1 flex items-center gap-1">
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
