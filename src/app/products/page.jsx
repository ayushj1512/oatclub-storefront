"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import ProductGrid from "@/components/common/ProductGrid";
import { useProductStore } from "@/store/productStore";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    visibleProducts,
    filteredProducts,
    fetchProducts,
    setSortOption,
    setSearchQuery,
    setCategory,
    sortOption,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    loadMore,
  } = useProductStore();

  const observerRef = useRef(null);

  // ✅ 1. Initialize filters from URL
  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const sort = searchParams.get("sort") || "default";
    const query = searchParams.get("q") || "";

    setCategory(category);
    setSortOption(sort);
    setSearchQuery(query);
  }, [searchParams, setCategory, setSortOption, setSearchQuery]);

  // ✅ 2. Fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ 3. Sync filters → URL
  const syncURL = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "default") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.replace(`?${params.toString()}`);
  };

  // ✅ 4. Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) loadMore();
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // ✅ 5. Handlers
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    syncURL({ q: val });
  };

  const handleCategory = (e) => {
    const val = e.target.value;
    setCategory(val);
    syncURL({ category: val });
  };

  const handleSort = (e) => {
    const val = e.target.value;
    setSortOption(val);
    syncURL({ sort: val });
  };

  // ✅ 6. UI
  return (
    <section className="flex flex-col items-center w-full bg-gray-50 min-h-screen py-10 px-4 md:px-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            All Products
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery || ""}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={handleCategory}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="all">All Categories</option>
              <option value="saree">Sarees</option>
              <option value="kurti">Kurtis</option>
              <option value="dress">Dresses</option>
              <option value="jacket">Jackets</option>
            </select>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={handleSort}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="default">Sort by</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-pink-600" />
            <p className="ml-3 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : visibleProducts.length > 0 ? (
          <>
            <ProductGrid
              products={visibleProducts}
              title="Explore Our Collection"
            />

            {/* Infinite Scroll Sentinel */}
            {visibleProducts.length < filteredProducts.length && (
              <div ref={observerRef} className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-pink-600" />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No products found. Try adjusting your filters.
          </p>
        )}
      </div>
    </section>
  );
}
