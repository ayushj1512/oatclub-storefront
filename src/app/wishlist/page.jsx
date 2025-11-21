"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Filter,
  Tag,
  X,
  ChevronDown,
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* 🔥 Toast Component */
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
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const wishlist = items || [];

  /* ---------------------------------------------------
     STATE
     --------------------------------------------------- */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  /* ---------------------------------------------------
     INFINITE SCROLL
     --------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        setVisibleCount((c) => c + 8);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------------------------------------------
     CATEGORY FILTERS
     --------------------------------------------------- */
  const categories = useMemo(() => {
    const set = new Set();
    wishlist.forEach((item) =>
      (item.categories || []).forEach((c) => c?.slug && set.add(c.slug))
    );
    return Array.from(set);
  }, [wishlist]);

  /* ---------------------------------------------------
     TAG FILTERS
     --------------------------------------------------- */
  const tags = useMemo(() => {
    const set = new Set();
    wishlist.forEach((item) =>
      (item.tags || []).forEach((t) => t?.slug && set.add(t.slug))
    );
    return Array.from(set);
  }, [wishlist]);

  /* ---------------------------------------------------
     SORTING
     --------------------------------------------------- */
  const sortedWishlist = useMemo(() => {
    let arr = [...wishlist];

    switch (sortBy) {
      case "low-high":
        arr.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "high-low":
        arr.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        arr.sort(
          (a, b) => new Date(b.date_created) - new Date(a.date_created)
        );
        break;
      case "discount":
        arr.sort(
          (a, b) =>
            (Number(b.regular_price) - Number(b.price)) -
            (Number(a.regular_price) - Number(a.price))
        );
        break;
      default:
        return arr;
    }
    return arr;
  }, [wishlist, sortBy]);

  /* ---------------------------------------------------
     MULTI FILTER LOGIC
     --------------------------------------------------- */
  const filteredWishlist = useMemo(() => {
    return sortedWishlist.filter((item) => {
      const catMatch =
        selectedCategories.length === 0 ||
        item.categories?.some((c) => selectedCategories.includes(c.slug));

      const tagMatch =
        selectedTags.length === 0 ||
        item.tags?.some((t) => selectedTags.includes(t.slug));

      return catMatch && tagMatch;
    });
  }, [sortedWishlist, selectedCategories, selectedTags]);

  /* ---------------------------------------------------
     MOVE TO CART + TOAST
     --------------------------------------------------- */
  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);

    setToast("Moved to Cart!");
    setTimeout(() => setToast(""), 1500);
  };

  /* ---------------------------------------------------
     ROUTE BUILDER
     --------------------------------------------------- */
  const getProductLink = (item) => {
    const category =
      item?.categories?.[0]?.slug ||
      item?.categories?.[0]?.name ||
      "products";

    const formatted = String(item?.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `/${category}/${formatted}/${item.id}`;
  };

  /* ---------------------------------------------------
     REMOVE CHIP
     --------------------------------------------------- */
  const removeCategoryChip = (slug) =>
    setSelectedCategories((prev) => prev.filter((c) => c !== slug));

  const removeTagChip = (slug) =>
    setSelectedTags((prev) => prev.filter((t) => t !== slug));

  /* ---------------------------------------------------
     LIMIT VISIBLE ITEMS (Infinite Scroll)
     --------------------------------------------------- */
  const visibleItems = filteredWishlist.slice(0, visibleCount);

  return (
    <section className="w-full px-6 py-10 bg-gray-50 min-h-[85vh]">

      {/* 🔥 Toast */}
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#800020]" />
          Your Wishlist
        </h2>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Clear All
          </button>
        )}
      </div>

      {/* SORTING */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 border bg-white rounded-full text-sm"
        >
          <option value="default">Recommended</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
          <option value="newest">Newest</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {/* CATEGORY FILTER */}
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Filter className="w-5 h-5 text-[#800020]" />
          {categories.map((slug) => (
            <button
              key={slug}
              onClick={() =>
                setSelectedCategories((prev) =>
                  prev.includes(slug)
                    ? prev.filter((c) => c !== slug)
                    : [...prev, slug]
                )
              }
              className={`px-3 py-1 text-sm rounded-full border ${
                selectedCategories.includes(slug)
                  ? "bg-[#800020] text-white border-[#800020]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* TAG FILTER */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Tag className="w-5 h-5 text-[#800020]" />
          {tags.map((slug) => (
            <button
              key={slug}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(slug)
                    ? prev.filter((t) => t !== slug)
                    : [...prev, slug]
                )
              }
              className={`px-3 py-1 text-sm rounded-full border ${
                selectedTags.includes(slug)
                  ? "bg-[#800020] text-white border-[#800020]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* FILTER CHIPS (Myntra-style) */}
      {(selectedCategories.length > 0 || selectedTags.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategories.map((slug) => (
            <div
              key={slug}
              className="flex items-center gap-2 bg-[#800020]/10 text-[#800020] px-3 py-1 rounded-full text-xs"
            >
              {slug.replace(/-/g, " ")}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => removeCategoryChip(slug)}
              />
            </div>
          ))}

          {selectedTags.map((slug) => (
            <div
              key={slug}
              className="flex items-center gap-2 bg-black/10 text-black px-3 py-1 rounded-full text-xs"
            >
              {slug.replace(/-/g, " ")}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() => removeTagChip(slug)}
              />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg mb-3">Your wishlist is empty.</p>
          <Link
            href="/collections"
            className="bg-[#800020] hover:bg-[#6a0018] text-white px-6 py-3 rounded-full"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          {/* PRODUCT GRID */}
          <motion.div
            layout
            className="flex flex-wrap gap-6 justify-center md:justify-start"
          >
            <AnimatePresence>
              {visibleItems.map((item) => {
                const productLink = getProductLink(item);
                const image =
                  item.image || item.images?.[0]?.src || "/placeholder.png";

                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="relative bg-white rounded-3xl shadow-sm hover:shadow-md w-[160px] md:w-[220px] overflow-hidden"
                  >
                    <Link href={productLink} className="absolute inset-0 z-0" />

                    {/* REMOVE */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 z-20 bg-white p-1.5 rounded-full shadow"
                    >
                      <Trash2 className="w-4 h-4 text-gray-700" />
                    </button>

                    {/* IMAGE */}
                    <div className="relative w-full h-[220px] z-10">
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="p-3 z-10 flex flex-col">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-[#800020] font-semibold text-sm mb-2">
                        ₹{item.price}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToCart(item);
                        }}
                        className="bg-[#800020] hover:bg-[#6a0018] text-white py-2 rounded-full text-sm"
                      >
                        <ShoppingCart className="inline w-4 h-4 mr-2" />
                        Move to Cart
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* LOADING MORE */}
          {visibleItems.length < filteredWishlist.length && (
            <p className="text-center text-sm text-gray-500 py-6">
              Loading more...
            </p>
          )}
        </>
      )}
    </section>
  );
}
