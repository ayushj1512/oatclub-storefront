"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const blogs = [
  {
    title: "10 Fashion Trends Dominating 2025",
    excerpt:
      "From bold colors to vintage revivals — explore what’s trending in the fashion world this year.",
    image: "/blogs/trends.jpg",
    slug: "/blog/fashion-trends-2025",
  },
  {
    title: "Sustainable Fashion: The Future of Style",
    excerpt:
      "Discover how eco-conscious fashion is shaping the next generation of design and shopping.",
    image: "/blogs/sustainable.jpg",
    slug: "/blog/sustainable-fashion",
  },
  {
    title: "How to Style for Every Occasion",
    excerpt:
      "Our stylists share timeless outfit formulas to keep you effortlessly chic all year long.",
    image: "/blogs/style-guide.jpg",
    slug: "/blog/style-for-every-occasion",
  },
];

export default function BlogSection() {
  return (
    <section className="w-full flex flex-col bg-gray-50 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 px-8 mb-6">
        From Our Blog
      </h2>

      <div className="flex flex-row gap-8 px-8 overflow-x-auto md:overflow-visible no-scrollbar">
        {blogs.map((blog, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[320px] md:w-1/3 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative w-full h-[220px]">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover object-center"
              />
            </div>

            <div className="flex flex-col p-5 gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {blog.excerpt}
              </p>
              <Link
                href={blog.slug}
                className="mt-2 inline-block text-pink-500 font-medium hover:underline"
              >
                Read More →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
