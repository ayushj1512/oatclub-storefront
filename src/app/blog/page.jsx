"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowDownWideNarrow, ArrowUpWideNarrow, SortAsc, SortDesc } from "lucide-react";

const CATS = ["All", "Fashion", "Guides", "Trends"];

export default function BlogPage() {
  const blogs = MOCK(); // Replace with API later

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");
  const [tags, setTags] = useState([]);
  const [visible, setVisible] = useState(6);

  const allTags = [...new Set(blogs.flatMap(b => b.tags))];

  const filtered = blogs
    .filter(b => (cat === "All" ? true : b.category === cat))
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()))
    .filter(b => tags.every(t => b.tags.includes(t)))
    .sort((a, b) =>
      sort === "newest" ? new Date(b.date) - new Date(a.date) :
      sort === "oldest" ? new Date(a.date) - new Date(b.date) :
      sort === "asc" ? a.title.localeCompare(b.title) :
      b.title.localeCompare(a.title)
    )
    .slice(0, visible);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200)
        setVisible(v => v + 4);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="px-5 md:px-10 py-10 bg-white">
      <SEO />

      {/* TITLE */}
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-semibold text-center text-[#2b0004] mb-8">
        Fashion Insights & Style Guides
      </motion.h1>

      {/* SEARCH */}
      <div className="relative max-w-xl mx-auto mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          placeholder="Search blogs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-[#800020]"
        />
      </div>

      {/* CATEGORY BAR */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-1.5 text-sm rounded-full border whitespace-nowrap ${
              cat === c ? "bg-[#800020] text-white" : "text-[#800020] border-[#d7b2b9]"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {allTags.map(t => (
          <button key={t} onClick={() => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
            className={`px-3 py-1 text-xs rounded-full border ${
              tags.includes(t) ? "bg-[#800020] text-white" : "text-[#800020] border-[#dab8bf]"
            }`}>
            #{t}
          </button>
        ))}
      </div>

      {/* SORT */}
      <div className="flex justify-center mb-8 gap-2 text-[#800020]">
        <SortBtn txt="Newest" val="newest" ico={<ArrowDownWideNarrow size={14} />} sort={sort} set={setSort} />
        <SortBtn txt="Oldest" val="oldest" ico={<ArrowUpWideNarrow size={14} />} sort={sort} set={setSort} />
        <SortBtn txt="A–Z" val="asc" ico={<SortAsc size={14} />} sort={sort} set={setSort} />
        <SortBtn txt="Z–A" val="desc" ico={<SortDesc size={14} />} sort={sort} set={setSort} />
      </div>

      {/* FEATURED */}
      <Featured blog={blogs[0]} />

      {/* MASONRY */}
      <div className="flex gap-4 mt-8">
        <div className="flex flex-col gap-4 w-1/2">{filtered.filter((_, i) => i % 2 === 0).map(b => <Card key={b.slug} b={b} />)}</div>
        <div className="flex flex-col gap-4 w-1/2">{filtered.filter((_, i) => i % 2 !== 0).map(b => <Card key={b.slug} b={b} />)}</div>
      </div>
    </section>
  );
}

/* --- COMPONENTS --- */

const Card = ({ b }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
    <Link href={`/blog/${b.slug}`} className="block bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <img src={b.image} className="w-full" />
      <div className="p-4">
        <h2 className="font-semibold text-[#2b0004] group-hover:text-[#800020]">{b.title}</h2>
        <p className="text-xs text-gray-500">{b.date}</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          {b.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7e9ec] text-[#800020]">#{t}</span>)}
        </div>
      </div>
    </Link>
  </motion.div>
);

const Featured = ({ blog }) => (
  <Link href={`/blog/${blog.slug}`} className="block mb-10 rounded-2xl overflow-hidden relative group">
    <img src={blog.image} className="w-full rounded-2xl" />
    <div className="absolute inset-0 bg-black/30 flex items-end p-6">
      <h2 className="text-white text-xl font-semibold group-hover:underline">{blog.title}</h2>
    </div>
  </Link>
);

const SortBtn = ({ txt, val, ico, sort, set }) => (
  <button onClick={() => set(val)}
    className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 
    ${sort === val ? "bg-[#800020] text-white" : "bg-[#f6e8eb]"}`}>
    {ico} {txt}
  </button>
);

/* --- MOCK (Replace with API later) --- */

function MOCK() {
  return [
    {
      slug: "festive-trends-2025",
      title: "Festive Trends 2025",
      date: "2025-11-10",
      category: "Fashion",
      tags: ["Festive", "Trends", "Ethnic"],
      image: "https://i.pinimg.com/736x/c2/e3/63/c2e363620d7b634da8c7f2c1afa9f2e7.jpg",
    },
    {
      slug: "sustainable-style",
      title: "Sustainable Style Tips",
      date: "2025-10-30",
      category: "Guides",
      tags: ["Eco", "Lifestyle", "Sustainable"],
      image: "https://i.pinimg.com/736x/f1/4e/39/f14e39539d110b3e693a468f40894d0c.jpg",
    },
    {
      slug: "winter-collection-2025",
      title: "Winter Collection Essentials",
      date: "2025-12-05",
      category: "Trends",
      tags: ["Winter", "Luxury", "Modern"],
      image: "https://i.pinimg.com/736x/0e/1d/fa/0e1dfad5f78ec2c8b8cf3688fcf6a473.jpg",
    },
  ];
}

/* --- SEO --- */

function SEO() {
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Miray Fashion Blog",
        description: "Latest fashion insights, trends & guides.",
        url: "https://mirayfashions.com/blog",
      })}
    </script>
  );
}
