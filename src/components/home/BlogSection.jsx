"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogStore } from "@/store/blogStore";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/10 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
    </div>
  );
}

export default function BlogSection() {
  const blogs = useBlogStore((s) => s.blogs);
  const loading = useBlogStore((s) => s.loading);
  const error = useBlogStore((s) => s.error);
  const fetchBlogs = useBlogStore((s) => s.fetchBlogs);
  const rowRef = useRef(null);

  useEffect(() => {
    if (!blogs?.length) fetchBlogs({ page: 1, limit: 10 });
  }, [blogs?.length, fetchBlogs]);

  const scrollRow = (dir) => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const showArrows = loading || blogs?.length > 2;

  return (
    <section className="w-full bg-white py-6 text-black md:py-10">
      <style
        dangerouslySetInnerHTML={{
          __html:
            ".no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}",
        }}
      />

      <div className="mb-4 px-3 md:px-6">
        <div className="border-y-2 border-black py-3 text-center">
          <p className="font-serif text-3xl font-black uppercase leading-none tracking-tight md:text-6xl">
            THE OATCLUB TIMES
          </p>

          <div className="mt-2 border-t border-black pt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] md:text-[10px]">
              Fashion • Trends • Oatclub Edit
            </p>

            <p className="mt-1 font-serif text-xs italic tracking-wide text-black/70 md:text-sm">
              "Own All Trends"
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-b border-black pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">
            Latest Stories
          </p>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em]"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-3 text-center text-sm text-black">
          Failed to load blogs.
        </p>
      )}

      <div className="relative">
        {showArrows && (
          <>
            <button
              onClick={() => scrollRow("left")}
              className="absolute left-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-black bg-white hover:bg-black hover:text-white md:flex"
              aria-label="Scroll left"
            >
              ←
            </button>

            <button
              onClick={() => scrollRow("right")}
              className="absolute right-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-black bg-white hover:bg-black hover:text-white md:flex"
              aria-label="Scroll right"
            >
              →
            </button>
          </>
        )}

        <div
          ref={rowRef}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-3 pb-2 md:px-6"
        >
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[245px] shrink-0 border border-black bg-white md:w-[330px]"
              >
                <Shimmer className="aspect-[4/3] w-full" />
                <div className="space-y-2 p-3">
                  <Shimmer className="h-4 w-4/5" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              </div>
            ))}

          {!loading && !error && !blogs?.length && (
            <p className="w-full text-center text-sm text-black/50">
              No blog posts available right now.
            </p>
          )}

          {!loading &&
            !error &&
            blogs?.map((blog, index) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group w-[245px] shrink-0 md:w-[330px]"
              >
                <motion.article
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="border border-black bg-white transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-black bg-white">
                    <Image
                      src={blog.image || "/placeholder.png"}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 245px, 330px"
                      priority={index === 0}
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />

                    <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[9px] font-black uppercase text-white">
                      {index < 2 ? "New" : "Edit"}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="mb-2 flex items-center justify-between border-b border-black/20 pb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">
                        Oatclub
                      </span>

                      <span className="text-[9px] font-black uppercase tracking-wide text-black/50">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-tight text-black md:text-base">
                      {blog.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/60">
                      {blog.excerpt}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide">
                      Read Story
                      <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}