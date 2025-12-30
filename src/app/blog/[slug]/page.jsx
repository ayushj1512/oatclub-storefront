"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

/* Demo recommended products (static for now) */
const recommendedProducts = [
  {
    id: 1,
    title: "Premium Chiffon Kurti – Peach Glow",
    image:
      "https://i.pinimg.com/736x/c2/e3/63/c2e363620d7b634da8c7f2c1afa9f2e7.jpg",
    price: "₹1299",
    link: "/products/premium-kurti-peach",
  },
  {
    id: 2,
    title: "Elegant Organza Suit Set – Wine",
    image:
      "https://i.pinimg.com/736x/0e/1d/fa/0e1dfad5f78ec2c8b8cf3688fcf6a473.jpg",
    price: "₹1899",
    link: "/products/organza-wine-set",
  },
  {
    id: 3,
    title: "Designer Festive Saree – Gold Luxe",
    image:
      "https://i.pinimg.com/736x/f1/4e/39/f14e39539d110b3e693a468f40894d0c.jpg",
    price: "₹2499",
    link: "/products/gold-luxe-saree",
  },
];

/* -------------------------------------------------------
   BLOG CONTENT SANITIZER
------------------------------------------------------- */
function extractCleanBlogContent(raw = "") {
  if (!raw || typeof raw !== "string") return "";

  // Prefer content after "Content (Markdown)"
  const marker = "Content (Markdown)";
  let content = raw.includes(marker)
    ? raw.split(marker)[1]
    : raw;

  return content
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* Optional: split into paragraphs */
function splitParagraphs(content) {
  return content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

const shareUrl =
  typeof window !== "undefined"
    ? window.location.href
    : "";



export default function BlogDetailPage(props) {
  const { slug } = use(props.params);

  const {
    currentBlog,
    blogs,
    loading,
    error,
    fetchSingleBlog,
    fetchBlogs,
    clearCurrentBlog,
  } = useBlogStore();

  
  // 🔥 Fetch blog + ensure list exists (for related blogs)
  useEffect(() => {
    fetchSingleBlog(slug);

    // 👇 IMPORTANT: fetch list only if missing
    if (!blogs || blogs.length === 0) {
      fetchBlogs({ page: 1, limit: 12 });
    }

    return () => {
      clearCurrentBlog();
    };
  }, [slug, fetchSingleBlog, fetchBlogs, clearCurrentBlog]);

  

  /* ---------------- LOADING ---------------- */
  if (loading && !currentBlog) {
    return (
      <div className="py-32 text-center text-gray-600 text-lg">
        Loading blog...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error && !currentBlog) {
    return (
      <div className="py-32 text-center text-red-600 text-lg">
        Failed to load blog.
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!loading && !currentBlog) {
    return (
      <div className="py-32 text-center text-gray-700 text-xl">
        Blog not found.
      </div>
    );
  }

  const blog = currentBlog;

  const cleanContent = extractCleanBlogContent(blog.content);
const paragraphs = splitParagraphs(cleanContent);

const shareText = blog?.title || "Check out this article";

const handleNativeShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: shareUrl,
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  }
};


  return (
  <div className="mx-auto w-full max-w-[1100px] bg-white px-5 py-14 md:px-10 lg:px-24">

  {/* ================= HEADER ================= */}
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className="flex flex-col gap-6"
  >
    {/* Back */}
    <Link
      href="/blog"
      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition"
    >
      <ArrowLeft size={14} /> Back to Journal
    </Link>

    {/* Title */}
    <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-gray-900">
      {blog.title}
    </h1>

    {/* Excerpt */}
    <p className="max-w-[720px] text-base md:text-lg leading-relaxed text-gray-600">
      {blog.excerpt}
    </p>

    {/* Hero Image */}
    <div className="relative mx-auto mt-4 w-full max-w-[900px] aspect-video overflow-hidden rounded-3xl bg-[#f5f5f5]">
      <Image
        src={blog.image}
        alt={blog.title}
        fill
        priority
        className="object-contain p-4"
      />
    </div>

    {/* Tags */}
    {blog.tags?.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {blog.tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
          >
            <Tag size={12} /> {tag}
          </span>
        ))}
      </div>
    )}
  </motion.div>

  {/* ================= CONTENT ================= */}
  <div className="mx-auto mt-16 max-w-[820px] space-y-7 text-[16px] md:text-[17px] leading-[1.85] text-gray-800">
    {paragraphs.length > 0 ? (
      paragraphs.map((p, i) => <p key={i}>{p}</p>)
    ) : (
      <p className="italic text-gray-500">
        Full content coming soon…
      </p>
    )}
  </div>

  {/* ================= SHARE ================= */}
  <div className="mx-auto mt-16 max-w-[820px] border-t border-gray-200 pt-8">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600">
      <Share2 size={16} /> Share this article
    </h3>

    <div className="flex flex-wrap gap-4">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${shareText} — ${shareUrl}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={18} />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        aria-label="Share on Facebook"
      >
        <Facebook size={18} />
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </a>

      {/* Native Share */}
      {"navigator" in globalThis && (
        <button
          onClick={handleNativeShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          aria-label="More share options"
        >
          <Share2 size={18} />
        </button>
      )}
    </div>
  </div>

  {/* ================= RECOMMENDED PRODUCTS ================= */}
  <div className="mt-20">
    <RecommendedProducts products={recommendedProducts} />
  </div>

  {/* ================= RELATED BLOGS ================= */}
  <div className="mt-20">
    <RelatedBlogs blogs={blogs} currentSlug={slug} />
  </div>
</div>

);

}
