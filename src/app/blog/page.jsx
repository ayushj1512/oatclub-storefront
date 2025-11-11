"use client";

import Link from "next/link";

export default function BlogPage() {
  const mockBlogs = [
    { slug: "festive-trends-2025", title: "Festive Trends 2025", date: "Nov 10, 2025" },
    { slug: "sustainable-style", title: "Sustainable Style Tips", date: "Oct 30, 2025" },
  ];

  return (
    <section className="px-8 py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8 text-center">Latest Blogs</h1>
      <div className="flex flex-col gap-6">
        {mockBlogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="border rounded-2xl p-5 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1">{blog.title}</h2>
            <p className="text-sm text-gray-500">{blog.date}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
