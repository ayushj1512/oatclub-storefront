"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useBlogStore } from "@/store/blogStore";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
    </div>
  );
}

function BlogCard({ blog, index }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block w-[220px] shrink-0 md:w-[380px]">
      <article className="grid h-full grid-cols-[86px_minmax(0,1fr)] gap-3 bg-white md:block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 md:aspect-[4/5]">
          <Image
            src={blog.image || "/placeholder.png"}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 86px, 380px"
            priority={index === 0}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-black md:left-3 md:top-3 md:text-[9px] md:tracking-[0.18em]">
            EDIT {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="border-b border-neutral-200 py-1 md:py-4">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-black/45 md:text-[10px] md:tracking-[0.24em]">
            OATCLUB JOURNAL
          </p>
          <h3 className="mt-1 line-clamp-2 text-[12px] font-black uppercase leading-tight text-black md:mt-2 md:text-lg">
            {blog.title}
          </h3>
          {blog.excerpt ? (
            <p className="mt-1 line-clamp-2 text-[9px] font-bold uppercase leading-4 tracking-[0.06em] text-black/50 md:mt-2 md:text-xs md:leading-5 md:tracking-[0.08em]">
              {blog.excerpt}
            </p>
          ) : null}
          <span className="mt-2 inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-black md:mt-4 md:gap-2 md:text-[10px] md:tracking-[0.2em]">
            READ EDIT
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
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
      left: dir === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };

  const showArrows = loading || blogs?.length > 2;

  return (
    <section className="w-full bg-[#fafafa] px-3 py-7 text-black md:px-8 md:py-14">
      <div className="w-full">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-neutral-200 pb-4 md:mb-7 md:flex-row md:pb-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-black/45 md:text-[10px] md:tracking-[0.34em]">
              OATCLUB JOURNAL
            </p>
            <h2 className="mt-1 text-xl font-black uppercase leading-tight text-black md:mt-2 md:text-4xl">
              STYLE NOTES
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-2 border border-black px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition hover:bg-black hover:text-white md:px-4 md:text-[10px] md:tracking-[0.2em]"
          >
            VIEW ALL
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error ? (
          <p className="py-8 text-center text-xs font-black uppercase tracking-[0.2em] text-black/50">
            UNABLE TO LOAD JOURNAL
          </p>
        ) : null}

        <div className="relative">
          {showArrows ? (
            <>
              <button
                onClick={() => scrollRow("left")}
                className="absolute left-0 top-[42%] z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:grid"
                aria-label="SCROLL LEFT"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollRow("right")}
                className="absolute right-0 top-[42%] z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white md:grid"
                aria-label="SCROLL RIGHT"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}

          <div ref={rowRef} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2 md:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="w-[220px] shrink-0 md:w-[380px]">
                    <Shimmer className="h-[108px] md:aspect-[4/5] md:h-auto" />
                    <div className="space-y-2 py-2 md:py-4">
                      <Shimmer className="h-3 w-1/3" />
                      <Shimmer className="h-5 w-4/5" />
                      <Shimmer className="h-3 w-full" />
                    </div>
                  </div>
                ))
              : blogs?.map((blog, index) => <BlogCard key={blog.slug} blog={blog} index={index} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
