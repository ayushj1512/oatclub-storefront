"use client";

import { use as usePromise, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Facebook, MessageCircle, Share2, Tag, Twitter } from "lucide-react";
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
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(Boolean(navigator.share));
  }, []);

  useEffect(() => {
    fetchSingleBlog(slug);
    if (!blogs?.length) fetchBlogs({ page: 1, limit: 12 });
    return () => clearCurrentBlog();
  }, [slug, fetchSingleBlog, fetchBlogs, clearCurrentBlog, blogs?.length]);

  const productIds = useMemo(
    () =>
      currentBlog?.products?.length
        ? Array.from(new Set(currentBlog.products.map(getPid).filter(Boolean)))
        : [],
    [currentBlog]
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
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-black uppercase tracking-[0.2em] text-black">
        FAILED TO LOAD JOURNAL
      </div>
    );
  }

  if (!loading && !currentBlog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-black uppercase tracking-[0.2em] text-black">
        JOURNAL NOT FOUND
      </div>
    );
  }

  const blog = currentBlog;
  const paragraphs = splitParagraphs(extractCleanBlogContent(blog.content));
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText = blog?.title || "OATCLUB JOURNAL";

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: blog.title, text: blog.excerpt, url: shareUrl });
    } catch {}
  };

  return (
    <main className="bg-[#fafafa] text-black">
      <article className="mx-auto max-w-7xl px-3 py-6 md:px-8 md:py-10">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 border border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
        >
          <ArrowLeft size={13} />
          BACK TO JOURNAL
        </Link>

        <header className="grid gap-6 border-b border-neutral-200 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/45">
              OATCLUB JOURNAL
            </p>
            <h1 className="mt-4 text-3xl font-black uppercase leading-tight text-black md:text-5xl">
              {blog.title}
            </h1>
            {blog.excerpt ? (
              <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/50">
                {blog.excerpt}
              </p>
            ) : null}
          </div>

          {blog.image ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 lg:aspect-[16/11]">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </header>

        {blog.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-black/60"
              >
                <Tag size={11} /> {tag}
              </span>
            ))}
          </div>
        ) : null}

        <section className="mx-auto mt-8 grid max-w-6xl gap-8 border-b border-neutral-200 pb-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border-t border-black pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/45">
                EDITORIAL
              </p>
              <p className="mt-3 text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/55">
                CURATED BY OATCLUB FOR YOUR NEXT WARDROBE MOVE.
              </p>
            </div>
          </aside>

          <div className="space-y-5 bg-white px-4 py-5 md:px-8 md:py-8">
            {paragraphs.length ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm font-bold uppercase leading-8 tracking-[0.04em] text-black/70 md:text-[15px]"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-black/45">
                FULL CONTENT COMING SOON.
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-6xl">
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em]">
            <Share2 size={15} />
            SHARE EDIT
          </h3>

          <div className="flex gap-2">
            {[
              {
                icon: MessageCircle,
                href: `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${shareUrl}`)}`,
              },
              {
                icon: Facebook,
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
              },
              {
                icon: Twitter,
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
              },
            ].map(({ icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center border border-black bg-white transition hover:bg-black hover:text-white"
                aria-label="SHARE"
              >
                <Icon size={16} />
              </a>
            ))}

            {canNativeShare ? (
              <button
                onClick={handleNativeShare}
                className="grid h-10 w-10 place-items-center border border-black bg-white transition hover:bg-black hover:text-white"
                aria-label="NATIVE SHARE"
              >
                <Share2 size={16} />
              </button>
            ) : null}
          </div>
        </section>
      </article>

      <section className="mx-auto mt-8 max-w-7xl px-3 md:px-8">
        <RecommendedProducts productIds={productIds} tags={blog.tags} category={blog.category} limit={10} />
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-3 pb-10 md:px-8">
        <RelatedBlogs blogs={blogs} currentSlug={slug} />
      </section>
    </main>
  );
}
