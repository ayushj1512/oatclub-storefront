"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const blogs = [
  {
    title: "10 Fashion Trends Dominating 2025",
    excerpt:
      "Bold colors to vintage revivals — explore the biggest fashion directions shaping 2025.",
    image:
      "https://i.pinimg.com/736x/c4/87/81/c4878157046ba4aa935676ca67206b76.jpg",
    slug: "fashion-trends-2025",
  },
  {
    title: "Sustainable Fashion: The Future of Style",
    excerpt:
      "Eco-friendly materials and ethical production — see how sustainability defines the future.",
    image:
      "https://i.pinimg.com/736x/0f/e5/2b/0fe52b42e93d13e3f695005500c3bce7.jpg",
    slug: "sustainable-fashion",
  },
  {
    title: "How to Style for Every Occasion",
    excerpt:
      "From brunch to nights out — expert styling formulas for any event.",
    image:
      "https://i.pinimg.com/736x/26/4d/43/264d4319178c74be40b9ebe4ca56ee26.jpg",
    slug: "style-for-every-occasion",
  },
  {
    title: "The Art of Statement Pieces",
    excerpt:
      "Dramatic silhouettes, bold jewelry, and rich textures to elevate your look.",
    image:
      "https://i.pinimg.com/736x/5c/ef/00/5cef0094f87d3751151f0bb8164312ce.jpg",
    slug: "statement-pieces",
  },
  {
    title: "Premium Fabrics You Need in Your Wardrobe",
    excerpt:
      "Why chiffon, silk, organza, and luxe blends matter more than ever.",
    image:
      "https://i.pinimg.com/1200x/cd/20/9a/cd209a2560c684272a96290e9d60949c.jpg",
    slug: "premium-fabrics",
  },

  // New additions
  {
    title: "Mastering Ethnic Elegance in Modern Fashion",
    excerpt:
      "A fusion of traditional craftsmanship with contemporary design.",
    image:
      "https://i.pinimg.com/736x/e1/9a/b2/e19ab2a46085735c0e47bd379f39638d.jpg",
    slug: "ethnic-elegance-modern",
  },
  {
    title: "Color Palettes Every Wardrobe Needs in 2025",
    excerpt:
      "Soft nudes, earthy tones, and romantic pastels — the most wearable shades.",
    image:
      "https://i.pinimg.com/736x/ef/84/ae/ef84ae78b61123e607bfe159b7420f7a.jpg",
    slug: "color-palettes-2025",
  },
  {
    title: "The Rise of Minimalist Luxury",
    excerpt:
      "Clean lines, rich textures, and timeless quiet luxury.",
    image:
      "https://i.pinimg.com/736x/c7/6a/02/c76a02bc7ed2b7c648289c5671cd4504.jpg",
    slug: "minimalist-luxury",
  },
  {
    title: "Designer Outfit Inspirations for Festive Seasons",
    excerpt:
      "Celebratory drapes, jewel tones, and handcrafted details.",
    image:
      "https://i.pinimg.com/736x/1b/24/09/1b2409466d5ea9f76a80166d4c80b8f6.jpg",
    slug: "festive-outfit-ideas",
  },
  {
    title: "The Power of Layering in Women’s Fashion",
    excerpt:
      "Master layering with shrugs, jackets, and textures.",
    image:
      "https://i.pinimg.com/736x/e0/ca/a2/e0caa232ff936349c4bdf01f639a8eac.jpg",
    slug: "layering-techniques",
  },
];

export default function BlogSection() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-[#faf7f8] py-14">

      {/* Heading */}
      <div className="px-8 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111]">From Our Blog</h2>
        <p className="text-gray-500 text-sm mt-1">Fashion insights, trends & styling guides</p>
        <div className="h-[2px] w-16 bg-[#800020] mt-2 rounded-full"></div>
      </div>

      {/* Scroll Row */}
      <div className="flex flex-row gap-6 px-8 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {blogs.map((blog, index) => (
          <Link key={index} href={`/blog/${blog.slug}`} className="snap-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="flex-shrink-0 w-[230px] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative cursor-pointer"
            >
              {index < 2 && (
                <span className="absolute top-2 left-2 bg-[#800020] text-white text-[10px] px-2 py-1 rounded-full shadow z-10">
                  NEW
                </span>
              )}

              {/* Image */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-xl">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-contain bg-white transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all"></div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2.5">
                <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                  {blog.title}
                </h3>

                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>

                <span className="text-[#800020] text-sm font-medium mt-1 flex items-center gap-1">
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
