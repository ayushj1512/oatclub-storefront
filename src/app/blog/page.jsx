"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useBlogStore } from "@/store/blogStore";

const CATS = ["All", "Fashion", "Lifestyle", "Trends"];

/* ----------------------------------------- */
/* FEATURED BLOG COMPONENT (MOVED TO TOP)    */
/* ----------------------------------------- */
const Featured = ({ blog }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.7 }}
    className=" mx-auto mb-12"
  >
    <Link
      href={`/blog/${blog.slug}`}
      className="block rounded-2xl overflow-hidden relative group shadow-lg hover:shadow-2xl transition-all"
    >
      <div className="relative w-full h-[330px] md:h-[460px] rounded-2xl overflow-hidden">
        <Image
          src={blog.image}
          fill
          alt={blog.title}
          className="object-contain group-hover:scale-105 transition duration-700"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-7">
        <h2 className="text-white text-2xl md:text-4xl font-semibold leading-tight group-hover:underline">
          {blog.title}
        </h2>
      </div>
    </Link>
  </motion.div>
);

/* ----------------------------------------- */
/* CARD COMPONENT                            */
/* ----------------------------------------- */
const Card = ({ b, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay }}
    viewport={{ once: true }}
  >
    <Link
      href={`/blog/${b.slug}`}
      className="block bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden">
        <Image
          src={b.image}
          alt={b.title}
          fill
          className="object-contain transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-[#2b0004] text-[15px] leading-snug group-hover:text-[#800020]">
          {b.title}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{b.date}</p>

        <div className="flex gap-1 mt-3 flex-wrap">
          {b.tags?.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7e9ec] text-[#800020]"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  </motion.div>
);

/* ----------------------------------------- */
/* SORT BUTTON COMPONENT                     */
/* ----------------------------------------- */
const SortBtn = ({ txt, val, ico, sort, set }) => (
  <motion.button
    whileTap={{ scale: 0.88 }}
    onClick={() => set(val)}
    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 transition 
      ${
        sort === val
          ? "bg-[#800020] text-white shadow"
          : "bg-[#f6e8eb] text-[#800020] hover:bg-[#efd9dd]"
      }`}

  >
    {ico} {txt}
  </motion.button>
);

/* ----------------------------------------- */
/* MAIN PAGE COMPONENT                        */
/* ----------------------------------------- */
export default function BlogPage() {

  /* ---- FIX: Use stable Zustand selector ---- */
  const blogs = useBlogStore((s) => s.blogs);

  /* ---- Build preview data (stable, no hook shifts) ---- */
  const preview = blogs.map((b) => ({
    title: b.title,
    excerpt: b.excerpt,
    image: b.image,
    slug: b.slug,
    date: b.date,
    tags: b.tags,
    category: b.category,
  }));

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");
  const [tags, setTags] = useState([]);
  const [visible, setVisible] = useState(6);

  const allTags = [...new Set(preview.flatMap((b) => b.tags || []))];

  const filtered = preview
    .filter((b) => (cat === "All" ? true : b.category === cat))
    .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
    .filter((b) => tags.every((t) => b.tags.includes(t)))
    .sort((a, b) =>
      sort === "newest"
        ? new Date(b.date) - new Date(a.date)
        : sort === "oldest"
        ? new Date(a.date) - new Date(b.date)
        : sort === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    )
    .slice(0, visible);

  /* ---- Infinite Scroll ---- */
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200)
        setVisible((v) => v + 4);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="px-5 md:px-10 py-10 bg-white min-h-screen">

      {/* Featured Blog */}
      {preview.length > 0 && <Featured blog={preview[0]} />}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-10  mx-auto">
        {filtered.map((b, i) => (
          <Card key={b.slug} b={b} delay={i * 0.07} />
        ))}
      </div>

      {/* LOAD MORE */}
      {visible < preview.length && (
        <div className="text-center mt-10 text-gray-400 text-sm animate-pulse">
          Loading more…
        </div>
      )}
    </section>
  );
}
