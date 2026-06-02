"use client";

import { use as usePromise, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Share2,
  ArrowLeft,
  Tag,
  MessageCircle,
} from "lucide-react";

import { useBlogStore } from "@/store/blogStore";
import RecommendedProducts from "@/components/blog/RecommendedProducts";
import RelatedBlogs from "@/components/blog/RelatedBlogs";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

function extractCleanBlogContent(raw = "") {
  if (!raw || typeof raw !== "string") return "";
  const marker = "Content (Markdown)";
  const content = raw.includes(marker) ? raw.split(marker)[1] : raw;
  return content.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

const splitParagraphs = (content) =>
  content.split("\n\n").map((p) => p.trim()).filter(Boolean);

const getPid = (p) => {
  const id = p?._id || p?.id || p?.productId?._id || p?.productId?.id || p?.productId || p;
  return typeof id === "object" ? "" : String(id || "").trim();
};

export default function BlogDetailPage({ params }) {
  const { slug } = usePromise(params);
  const {
    currentBlog,
    blogs,
    loading,
    error,
    fetchSingleBlog,
    fetchBlogs,
    clearCurrentBlog,
  } = useBlogStore();

  const shareUrl = useMemo(
    () => (typeof window === "undefined" ? "" : window.location.href),
    []
  );

  useEffect(() => {
    fetchSingleBlog(slug);
    if (!blogs?.length) fetchBlogs({ page: 1, limit: 12 });
    return () => clearCurrentBlog();
  }, [slug, fetchSingleBlog, fetchBlogs, clearCurrentBlog]);

  const productIds = useMemo(
    () =>
      currentBlog?.products?.length
        ? Array.from(new Set(currentBlog.products.map(getPid).filter(Boolean)))
        : [],
    [currentBlog?.products]
  );

  if (loading && !currentBlog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <UniversalLuxuryLoader />
      </div>
    );
  }

  if (error && !currentBlog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        Failed to load blog.
      </div>
    );
  }

  if (!loading && !currentBlog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        Blog not found.
      </div>
    );
  }

  const blog = currentBlog;
  const paragraphs = splitParagraphs(extractCleanBlogContent(blog.content));
  const shareText = blog?.title || "Check out this article";

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: blog.title, text: blog.excerpt, url: shareUrl });
    } catch { }
  };

  return (
    <main className="bg-white text-black">
      <article className="mx-auto max-w-6xl px-4 py-4 md:px-8 md:py-6">
        <Link
          href="/blog"
          className="mb-4 inline-flex items-center gap-2 border border-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:bg-black hover:text-white"
        >
          <ArrowLeft size={13} />
          Back
        </Link>

        <div className="border-y-2 border-black py-3 text-center">
          <p className="font-serif text-3xl font-black uppercase leading-none tracking-tight md:text-6xl">
            THE OATCLUB TIMES
          </p>
          <div className="mt-2 border-t border-black pt-2">


            <p className=" text-xs font-semibold uppercase tracking-[0.45em] text-black/60">
              OWN ALL TRENDS
            </p>
          </div>
        </div>

        <header className="border-b-2 border-black py-5 text-center">
          <h1 className="mx-auto max-w-4xl font-serif text-3xl font-black uppercase leading-[0.98] tracking-tight md:text-6xl">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-black/70">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
            <span>Style Report</span>
            <span>•</span>
            <span>{blog.category || "Fashion"}</span>
          </div>
        </header>

        {blog.image && (
          <div className="mt-5 grid gap-3 border-b-2 border-black pb-5 md:grid-cols-[1.6fr_0.4fr]">
            <div className="relative aspect-[16/9] overflow-hidden bg-black/5">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            <aside className="border border-black p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em]">
                Front Page
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase leading-none">
                Own All Trends
              </h2>
              <p className="mt-3 text-xs leading-5 text-black/60">
                Fresh from the Oatclub editorial desk.
              </p>
            </aside>
          </div>
        )}

        {blog.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {blog.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 border border-black px-2.5 py-1 text-[10px] font-bold uppercase"
              >
                <Tag size={11} /> {tag}
              </span>
            ))}
          </div>
        )}

        <section className="mx-auto mt-6 max-w-5xl columns-1 gap-8 border-b-2 border-black pb-7 md:columns-2">
          {paragraphs.length ? (
            paragraphs.map((p, i) => (
              <p
                key={i}
                className={`mb-4 break-inside-avoid text-[14px] leading-7 text-black/80 ${i === 0
                    ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-black"
                    : ""
                  }`}
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-sm italic text-black/50">Full content coming soon…</p>
          )}
        </section>

        <section className="mx-auto mt-6 max-w-5xl">
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]">
            <Share2 size={15} />
            Share
          </h3>

          <div className="flex gap-2">
            {[
              {
                icon: MessageCircle,
                href: `https://wa.me/?text=${encodeURIComponent(`${shareText} — ${shareUrl}`)}`,
              },
              {
                icon: Facebook,
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
              },
              {
                icon: Twitter,
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
              },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center border border-black hover:bg-black hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}

            {"navigator" in globalThis && (
              <button
                onClick={handleNativeShare}
                className="grid h-9 w-9 place-items-center border border-black hover:bg-black hover:text-white"
              >
                <Share2 size={16} />
              </button>
            )}
          </div>
        </section>
      </article>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <RecommendedProducts productIds={productIds} tags={blog.tags} category={blog.category} limit={10} />
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 pb-10 md:px-8">
        <RelatedBlogs blogs={blogs} currentSlug={slug} />
      </section>
    </main>
  );
}