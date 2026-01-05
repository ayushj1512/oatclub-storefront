"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Filter, Tag, X, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";

function Toast({ message }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-xl z-[999]"
    >
      {message}
    </motion.div>
  );
}

export default function WishlistPage() {
  const { items, loading, initialize, removeFromWishlist, clearWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setMounted(true);
    initialize?.();
  }, [initialize]);

  useEffect(() => {
    if (!mounted) return;
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        setVisibleCount((c) => c + 8);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  const wishlist = mounted ? items || [] : [];

  const categories = useMemo(() => {
    const set = new Set();
    wishlist.forEach((i) =>
      (i.categories || []).forEach((c) => c?.slug && set.add(c.slug))
    );
    return Array.from(set);
  }, [wishlist]);

  const tags = useMemo(() => {
    const set = new Set();
    wishlist.forEach((i) =>
      (i.tags || []).forEach((t) => t?.slug && set.add(t.slug))
    );
    return Array.from(set);
  }, [wishlist]);

  const sorted = useMemo(() => {
    const arr = [...wishlist];
    if (sortBy === "low-high")
      arr.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "high-low")
      arr.sort((a, b) => Number(b.price) - Number(a.price));
    return arr;
  }, [wishlist, sortBy]);

  const filtered = useMemo(() => {
    return sorted.filter((item) => {
      const catMatch =
        !selectedCategories.length ||
        item.categories?.some((c) => selectedCategories.includes(c.slug));
      const tagMatch =
        !selectedTags.length ||
        item.tags?.some((t) => selectedTags.includes(t.slug));
      return catMatch && tagMatch;
    });
  }, [sorted, selectedCategories, selectedTags]);

  const visibleItems = filtered.slice(0, visibleCount);

  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    setToast("Moved to Cart!");
    setTimeout(() => setToast(""), 1500);
  };

  const isBusy = loading;

  if (!mounted)
    return (
      <section className="w-full px-6 py-10 bg-gray-50 min-h-[85vh]" />
    );

  return (
    <section className="w-full px-6 py-10 bg-gray-50 min-h-[85vh]">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <Heart className="w-6 h-6 text-black" />
          Your Wishlist
        </h2>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Clear All
          </button>
        )}
      </div>

      {isBusy && (
        <p className="text-sm text-gray-500 mb-6">Loading wishlist...</p>
      )}

      {/* SORT */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 bg-white rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="default">Recommended</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
        </select>
      </div>

      {/* FILTERS */}
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Filter className="w-5 h-5 text-black" />
          {categories.map((slug) => (
            <button
              key={slug}
              onClick={() =>
                setSelectedCategories((p) =>
                  p.includes(slug) ? p.filter((c) => c !== slug) : [...p, slug]
                )
              }
              className={`px-3 py-1 text-sm rounded-full border transition ${
                selectedCategories.includes(slug)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Tag className="w-5 h-5 text-black" />
          {tags.map((slug) => (
            <button
              key={slug}
              onClick={() =>
                setSelectedTags((p) =>
                  p.includes(slug) ? p.filter((t) => t !== slug) : [...p, slug]
                )
              }
              className={`px-3 py-1 text-sm rounded-full border transition ${
                selectedTags.includes(slug)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {(selectedCategories.length > 0 || selectedTags.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[...selectedCategories, ...selectedTags].map((slug) => (
            <div
              key={slug}
              className="flex items-center gap-2 bg-black/10 text-black px-3 py-1 rounded-full text-xs"
            >
              {slug.replace(/-/g, " ")}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCategories((p) => p.filter((c) => c !== slug));
                  setSelectedTags((p) => p.filter((t) => t !== slug));
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!isBusy && wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty.</p>
          <Link
            href="/collections"
            className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-black/90 transition"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {visibleItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden"
                >
                  <ProductCard product={item} />

                  <div className="p-3 pt-0 flex gap-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex-1 bg-black text-white py-2 rounded-full text-sm hover:bg-black/90 transition"
                    >
                      <ShoppingCart className="inline w-4 h-4 mr-2" />
                      Move to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <Trash2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visibleItems.length < filtered.length && (
            <p className="text-center text-sm text-gray-500 py-6">
              Loading more...
            </p>
          )}
        </>
      )}
    </section>
  );
}
