"use client";

import { useParams } from "next/navigation";

export default function SingleBlogPage() {
  const { slug } = useParams();

  return (
    <section className="px-8 py-16 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4 capitalize">
        {slug.replaceAll("-", " ")}
      </h1>
      <p className="text-gray-600 leading-relaxed">
        This is where your blog content will go. Write engaging, story-driven
        articles about fashion, trends, and Miray’s values.
      </p>
    </section>
  );
}
