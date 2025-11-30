"use client";

import { use } from "react";
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

// Recommended Products (demo)
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

export default function BlogDetailPage(props) {
  const { slug } = use(props.params);

  const getBlogBySlug = useBlogStore((s) => s.getBlogBySlug);
  const previewBlogs = useBlogStore((s) => s.getBlogs());

  const blog = getBlogBySlug(slug);
  const relatedBlogs = previewBlogs.filter((b) => b.slug !== slug);

  if (!blog) {
    return (
      <div className="py-32 text-center text-gray-700 text-xl">
        Blog not found.
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-10 px-5 md:px-10 lg:px-24 max-w-[1100px] mx-auto">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6"
      >
        <Link
          href="/blog"
          className="text-[#800020] text-sm font-medium hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold text-[#2b0004] leading-tight">
          {blog.title}
        </h1>

        <p className="text-gray-600 text-base md:text-lg max-w-[700px]">
          {blog.excerpt}
        </p>

        {/* HERO IMAGE */}
        <div className="relative w-full max-w-[820px] mx-auto aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
          <Image src={blog.image} alt={blog.title} fill className="object-cover" />
        </div>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mt-4">
          {blog.tags?.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-[#f7e9ec] text-[#800020] px-3 py-1 rounded-full flex items-center gap-1"
            >
              <Tag size={12} /> #{tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* CONTENT */}
      <div className="mt-10 text-[#3d0f16] leading-relaxed whitespace-pre-line text-[16px] md:text-[17px] max-w-[820px] mx-auto">
        {blog.content || "Full content coming soon..."}
      </div>

      {/* SHARE */}
      <div className="mt-10 max-w-[820px] mx-auto">
        <h3 className="text-sm text-gray-600 mb-2 flex items-center gap-2">
          <Share2 size={16} /> Share this article
        </h3>

        <div className="flex gap-4">
          <Link href="#" className="text-[#3b5998] hover:scale-110 transition">
            <Facebook size={22} />
          </Link>
          <Link href="#" className="text-[#1DA1F2] hover:scale-110 transition">
            <Twitter size={22} />
          </Link>
          <Link href="#" className="text-green-600 hover:scale-110 transition">
            <MessageCircle size={22} />
          </Link>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS */}
      <div className="mt-16 max-w-[900px] mx-auto">
        <h2 className="text-2xl font-semibold text-[#2b0004]">Recommended Products</h2>
        <div className="h-[2px] bg-[#800020] w-20 rounded-full mt-2"></div>

        <div className="flex gap-5 mt-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {recommendedProducts.map((p) => (
            <Link
              key={p.id}
              href={p.link}
              className="snap-start flex-shrink-0 w-[160px] bg-white border rounded-xl shadow-sm hover:shadow-md transition-all p-3"
            >
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
                <Image src={p.image} alt={p.title} fill className="object-cover" />
              </div>

              <p className="text-sm font-medium mt-2 text-gray-800 line-clamp-2">
                {p.title}
              </p>

              <p className="text-[#800020] text-sm font-semibold">{p.price}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* RELATED BLOGS */}
      <div className="mt-20 max-w-[900px] mx-auto">
        <h2 className="text-2xl font-semibold text-[#2b0004]">Related Blogs</h2>
        <div className="h-[2px] bg-[#800020] w-20 rounded-full mt-2"></div>

        {/* MOBILE = HORIZONTAL SCROLL */}
        <div className="flex md:hidden gap-5 mt-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
          {relatedBlogs.map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="snap-start flex-shrink-0 w-[200px] bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full h-[140px]">
                <Image src={b.image} alt={b.title} fill className="object-cover" />
              </div>

              <div className="p-3">
                <p className="text-sm font-semibold text-[#2b0004] line-clamp-2">
                  {b.title}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {b.excerpt.slice(0, 80)}...
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {relatedBlogs.map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-full h-[150px]">
                <Image src={b.image} alt={b.title} fill className="object-cover" />
              </div>

              <div className="p-3">
                <p className="text-sm font-semibold text-[#2b0004]">{b.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {b.excerpt.slice(0, 65)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
