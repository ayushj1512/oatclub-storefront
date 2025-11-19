"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { wcGet } from "@/lib/woocommerce";

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [sortedResults, setSortedResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeSort, setActiveSort] = useState("newest");

  // 🔥 WooCommerce Search
  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);

      try {
        const products = await wcGet(
          `products?search=${encodeURIComponent(searchTerm)}`
        );
        setResults(products || []);
      } catch (err) {
        console.error("❌ Search Error:", err);
        setResults([]);
      }

      setLoading(false);
      router.replace(`/search?q=${encodeURIComponent(searchTerm)}`);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, router]);

  // 🔄 Sorting Handler
  useEffect(() => {
    let sorted = [...results];

    switch (activeSort) {
      case "low":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "high":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;

      default:
      case "newest":
        sorted.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        break;
    }

    setSortedResults(sorted);
  }, [activeSort, results]);

  const handleSubmit = (e) => e.preventDefault();

  return (
    <section className="w-full flex flex-col px-6 py-10 bg-gray-50 min-h-[80vh]">

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white rounded-full shadow-md p-2.5 pl-5 w-full md:w-[65%] mx-auto mb-6 border border-gray-200"
      >
        <Search className="text-gray-500 w-5 h-5" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-800 text-sm md:text-base"
        />

        <button
          type="submit"
          className="bg-[#800020] hover:bg-[#6a001a] text-white text-sm font-medium px-6 py-2 rounded-full transition"
        >
          Search
        </button>
      </form>

      {/* Sorting Tags */}
      <div className="flex gap-3 flex-wrap mb-8 mx-auto w-full md:w-[70%] justify-center">
        {[
          { id: "newest", label: "Newest" },
          { id: "low", label: "Price: Low → High" },
          { id: "high", label: "Price: High → Low" },
          { id: "az", label: "A → Z" },
          { id: "za", label: "Z → A" },
        ].map((sort) => (
          <button
            key={sort.id}
            onClick={() => setActiveSort(sort.id)}
            className={`px-4 py-1.5 text-sm rounded-full border transition ${
              activeSort === sort.id
                ? "bg-[#800020] text-white border-[#800020]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#800020]"
            }`}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {/* Products Header */}
      <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        {loading
          ? "Searching..."
          : sortedResults.length > 0
          ? `Showing results for "${searchTerm}"`
          : searchTerm
          ? `No results found for "${searchTerm}"`
          : "Search Products"}
      </h2>

      {/* Products Grid with Animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-2 md:px-8">
        <AnimatePresence>
          {!loading &&
            sortedResults.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  href={`/${item.categories?.[0]?.slug || "product"}/${item.slug}/${item.id}`}
                  className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="relative w-full h-[180px] md:h-[230px] rounded-t-2xl overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={item.images?.[0]?.src || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex flex-col p-3">
                    <h3 className="text-sm md:text-base font-medium text-gray-800 leading-tight">
                      {item.name}
                    </h3>

                    <p className="text-[#800020] font-semibold text-sm md:text-base mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {!loading && searchTerm && sortedResults.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-sm md:text-base">
          No products found for “{searchTerm}”.
        </p>
      )}
    </section>
  );
}
