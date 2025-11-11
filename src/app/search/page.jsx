"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // 🧠 If there's no term, clear results *without* synchronous setState
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!searchTerm) return setResults([]);

    // Mock data — replace later with your backend API
    const mockProducts = [
      { id: 1, name: "Floral Summer Dress", price: "₹1,299", image: "/products/dress1.jpg" },
      { id: 2, name: "Casual Denim Jacket", price: "₹1,899", image: "/products/jacket.jpg" },
      { id: 3, name: "Cotton Kurti Set", price: "₹1,499", image: "/products/kurti.jpg" },
    ];

    // Simulate filtering (simulate async fetch)
    const timeout = setTimeout(() => {
      const filtered = mockProducts.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    }, 150); // debounce for smoother UX

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSubmit = (e) => e.preventDefault();

  return (
    <section className="w-full flex flex-col px-6 py-10 bg-gray-50 min-h-[80vh]">
      {/* Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white rounded-full shadow-md p-3 w-full md:w-[70%] mx-auto mb-10"
      >
        <Search className="text-gray-500 w-5 h-5 ml-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-800 text-sm md:text-base"
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-5 py-2 rounded-full transition"
        >
          Search
        </button>
      </form>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap mb-6 px-2 md:px-8">
        <h2 className="text-lg font-semibold text-gray-800">
          {results.length > 0
            ? `Results for "${searchTerm}"`
            : query
            ? `No results for "${searchTerm}"`
            : "Search Products"}
        </h2>

        <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-pink-500 transition">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Results */}
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {results.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-md transition w-[160px] md:w-[220px] overflow-hidden"
          >
            <div className="relative w-full h-[200px]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="flex flex-col p-3">
              <h3 className="text-sm md:text-base font-medium text-gray-800 truncate">
                {item.name}
              </h3>
              <p className="text-pink-500 font-semibold text-sm md:text-base">
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* No results */}
      {searchTerm && results.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No products found for “{searchTerm}”.
        </p>
      )}
    </section>
  );
}
