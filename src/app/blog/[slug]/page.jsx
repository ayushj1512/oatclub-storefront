"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Facebook, Twitter, Share2, ArrowLeft, Tag, MessageCircle } from "lucide-react";

// BLOG DATA
const blogs = [
  {
    title: "10 Fashion Trends Dominating 2025",
    excerpt:
      "Bold colors to vintage revivals — explore the biggest fashion directions shaping 2025.",
    image:
      "https://i.pinimg.com/736x/c4/87/81/c4878157046ba4aa935676ca67206b76.jpg",
    slug: "fashion-trends-2025",
    content: `
      2025 is redefining fashion with bold silhouettes, soft luxury notes,
      and reinvented classics.

      Key movements shaping the year include oversized tailoring, 
      luxe fabrics, handcrafted elements, and Indo-western fusion.
    `,
    hashtags: ["#Fashion2025", "#Trends", "#ModernWear", "#StyleGuide"],
  },
  {
    title: "Sustainable Fashion: The Future of Style",
    excerpt:
      "Eco-friendly materials and ethical production — see how sustainability defines the future.",
    image:
      "https://i.pinimg.com/736x/0f/e5/2b/0fe52b42e93d13e3f695005500c3bce7.jpg",
    slug: "sustainable-fashion",
    content: `
      Sustainability is more than a trend — it is the new global direction.
      From recycled fabrics to slow fashion, the movement encourages  
      mindful and responsible buying habits.
    `,
    hashtags: ["#SustainableFashion", "#EcoFriendly", "#ConsciousWear"],
  },
];

// PRODUCT SLIDER DATA
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

export default function BlogPage() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop();

  const blog = blogs.find((b) => b.slug === slug);
  const relatedBlogs = blogs.filter((b) => b.slug !== slug);

  if (!blog) {
    return (
      <div className="py-32 text-center text-gray-700 text-xl">
        Blog not found.
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-10 px-6 md:px-12">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-1 gap-10 w-full"
      >

        {/* LEFT COLUMN — TEXT SECTION */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#2b0004] leading-tight">
            {blog.title}
          </h1>

          <p className="text-gray-700 text-sm md:text-base mt-2 mb-4">
            {blog.excerpt}
          </p>

          <div className="h-[3px] w-20 bg-[#800020] rounded-full mb-6"></div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.hashtags?.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-[#f7e9ec] text-[#800020] px-3 py-1 rounded-full flex items-center gap-1"
              >
                <Tag size={12} /> {tag}
              </span>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="mt-4">
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
              <Link href="#" className="text-green-500 hover:scale-110 transition">
                <MessageCircle size={22} />
              </Link>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — IMAGE + CONTENT */}
        <div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="mt-6 text-[#3d0f16] leading-relaxed whitespace-pre-line text-[15px]">
            {blog.content}
          </div>
        </div>
      </motion.div>

      {/* PRODUCT SLIDER */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-[#2b0004]">Recommended Products</h2>
        <div className="h-[2px] bg-[#800020] w-16 rounded-full mt-2"></div>

        <div className="flex gap-5 mt-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {recommendedProducts.map((p) => (
            <Link
              key={p.id}
              href={p.link}
              className="snap-start flex-shrink-0 w-[170px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-2"
            >
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
                <Image src={p.image} alt={p.title} fill className="object-cover" />
              </div>

              <p className="text-sm font-medium mt-2 text-gray-800">{p.title}</p>
              <p className="text-[#800020] text-sm font-semibold">{p.price}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* RELATED BLOGS */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-[#2b0004]">Related Blogs</h2>
        <div className="h-[2px] bg-[#800020] w-16 rounded-full mt-2"></div>

        <div className="flex gap-5 mt-6 overflow-x-auto no-scrollbar pb-4 snap-x">
          {relatedBlogs.map((b, i) => (
            <Link
              key={i}
              href={`/blog/${b.slug}`}
              className="snap-start w-[260px] flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full h-[160px]">
                <Image src={b.image} alt={b.title} fill className="object-cover" />
              </div>

              <div className="p-3">
                <p className="text-sm font-semibold text-[#2b0004]">{b.title}</p>
                <p className="text-xs text-gray-600 mt-1">{b.excerpt.slice(0, 60)}...</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Back */}
      <div className="text-center mt-14">
        <Link
          href="/blog"
          className="text-[#800020] text-sm font-medium hover:underline flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    </div>
  );
}
