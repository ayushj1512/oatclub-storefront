"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!searchTerm) return setResults([]);

    const mockProducts = [
      { id: 1, name: "Floral Summer Dress", price: "₹1,299", image: "/products/dress1.jpg" },
      { id: 2, name: "Casual Denim Jacket", price: "₹1,899", image: "/products/jacket.jpg" },
      { id: 3, name: "Cotton Kurti Set", price: "₹1,499", image: "/products/kurti.jpg" },
    ];

    const timeout = setTimeout(() => {
      const filtered = mockProducts.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSubmit = (e) => e.preventDefault();

  return (
    <section className="w-full flex flex-col px-6 py-10 bg-gray-50 min-h-[80vh]">

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white rounded-full shadow-md p-2.5 pl-5 w-full md:w-[65%] mx-auto mb-10 border border-gray-200"
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

      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap mb-6 px-2 md:px-8">
        <h2 className="text-lg font-semibold text-gray-800">
          {results.length > 0
            ? `Showing results for "${searchTerm}"`
            : query
            ? `No results found for "${searchTerm}"`
            : "Search Products"}
        </h2>

        <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-[#800020] transition">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Product Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-2 md:px-8">
        {results.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <div className="relative w-full h-[180px] md:h-[230px] rounded-t-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col p-3">
              <h3 className="text-sm md:text-base font-medium text-gray-800 leading-tight">
                {item.name}
              </h3>
              <p className="text-[#800020] font-semibold text-sm md:text-base mt-1">
                {item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {searchTerm && results.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-sm md:text-base">
          No products found for “{searchTerm}”.
        </p>
      )}
    </section>
  );
}
