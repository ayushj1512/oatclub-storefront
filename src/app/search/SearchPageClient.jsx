"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wcGet } from "@/lib/woocommerce";

import ProductGrid from "@/components/common/ProductGrid";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "low", label: "Price: Low → High" },
  { id: "high", label: "Price: High → Low" },
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
];

export default function SearchPageClient() {
  const router = useRouter();
  const params = useSearchParams();

  const query = params.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);

  const [results, setResults] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeSort, setActiveSort] = useState("newest");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ------------------------------------------
     SEARCH REQUEST
  ------------------------------------------- */
  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const products = await wcGet(
          `products?search=${encodeURIComponent(searchTerm)}`
        );

        setResults(products || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }

      setLoading(false);
      router.replace(`/search?q=${encodeURIComponent(searchTerm)}`);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  /* ------------------------------------------
     SORT RESULTS
  ------------------------------------------- */
  useEffect(() => {
    let arr = [...results];

    switch (activeSort) {
      case "low":
        arr.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "high":
        arr.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "az":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "za":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "newest":
      default:
        arr.sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );
    }

    setSorted(arr);
  }, [activeSort, results]);

  return (
    <section className="w-full min-h-screen bg-white px-4 py-6">
      {/* SEARCH BAR */}
      <form className="flex items-center bg-gray-100 border border-gray-300 px-4 py-2 rounded-md shadow-sm mb-4">
        <Search className="text-gray-700 w-5 h-5" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-3 bg-transparent outline-none text-sm text-black"
        />
      </form>

      {/* MOBILE SORT DROPDOWN */}
      <div className="md:hidden mb-4 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex justify-between items-center w-full px-4 py-2 border border-gray-300 bg-white text-sm shadow-sm"
        >
          <span>{SORT_OPTIONS.find((x) => x.id === activeSort)?.label}</span>
          <ChevronDown size={18} className="text-black" />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute z-20 left-0 right-0 border border-gray-300 bg-white mt-1 shadow-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActiveSort(opt.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm border-b border-gray-200 ${
                    activeSort === opt.id
                      ? "bg-[#800020]/10 text-[#800020] font-medium"
                      : "text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP SORT TAGS */}
      <div className="hidden md:flex items-center gap-2 mb-6">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSort(s.id)}
            className={`px-3 py-1.5 text-sm border rounded-full transition 
              ${
                activeSort === s.id
                  ? "bg-[#800020] text-white border-[#800020]"
                  : "bg-white border-gray-300 text-black hover:border-[#800020]"
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* RESULTS HEADER */}
      <h2 className="text-sm text-black mb-4 text-center">
        {loading
          ? "Searching..."
          : sorted.length
          ? `Found ${sorted.length} results`
          : searchTerm
          ? `No results for "${searchTerm}"`
          : "Search for products"}
      </h2>

      {/* PRODUCT GRID COMPONENT */}
      <ProductGrid products={sorted} loading={loading} />
    </section>
  );
}
