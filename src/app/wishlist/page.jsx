"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Filter, Tag, X, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
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

const getPid = (x) =>
  String(x?._id || x?.id || x?.productId || x || "").trim();

export default function WishlistPage() {
  const { items, loading, fetchFromBackend, removeFromWishlist, clearWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const { fetchProductDetails } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const [fullProducts, setFullProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisibleCount(12);
  }, []);

  // ✅ Fetch wishlist IDs fresh
  useEffect(() => {
    if (!mounted) return;
    if (!user?.uid) return;
    fetchFromBackend(user.uid, { force: true });
  }, [mounted, user?.uid, fetchFromBackend]);

  // ✅ Fetch full product details
  useEffect(() => {
    if (!mounted) return;

    if (!items?.length) {
      setFullProducts([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setProdLoading(true);

        const ids = (items || []).map(getPid).filter(Boolean);
        const uniqueIds = Array.from(new Set(ids));

        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              return await fetchProductDetails(id);
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;
        setFullProducts(results.filter(Boolean));
      } finally {
        if (!cancelled) setProdLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, items, fetchProductDetails]);

  // ✅ Infinite scroll
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

  const wishlist = mounted ? fullProducts || [] : [];

  const categories = useMemo(() => {
    const set = new Set();
    wishlist.forEach((i) =>
      (i.categories || i.raw?.categories || []).forEach((c) => {
        const slug = c?.slug || c;
        if (slug) set.add(String(slug));
      })
    );
    return Array.from(set);
  }, [wishlist]);

  const tags = useMemo(() => {
    const set = new Set();
    wishlist.forEach((i) =>
      (i.tags || i.raw?.tags || []).forEach((t) => {
        const slug = t?.slug || t;
        if (slug) set.add(String(slug));
      })
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
        (item.raw?.categories || item.categories || []).some((c) =>
          selectedCategories.includes(c?.slug || c)
        );

      const tagMatch =
        !selectedTags.length ||
        (item.raw?.tags || item.tags || []).some((t) =>
          selectedTags.includes(t?.slug || t)
        );

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

  const idsCount = items?.length || 0;
  const loadedCount = wishlist.length;
  const showingCount = visibleItems.length;
  const isBusy = loading || prodLoading;

  if (!mounted)
    return (
      <section className="w-full px-6 py-10 bg-gray-50 min-h-[85vh]" />
    );

  return (
    <section className="w-full px-5 sm:px-6 lg:px-10 py-10 bg-gray-50 min-h-[85vh]">
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <Heart className="w-6 h-6 text-black" />
            Your Wishlist
          </h2>

          {/* ✅ COUNTS BAR */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
              IDs: <b>{idsCount}</b>
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
              Loaded: <b>{loadedCount}</b>
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
              Showing: <b>{showingCount}</b>
            </span>
          </div>
        </div>

        {idsCount > 0 && (
          <button
            onClick={clearWishlist}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:bg-black hover:text-white transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* LOADING */}
      {isBusy && (
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          Loading wishlist...
        </div>
      )}

      {/* SORT */}
      {loadedCount > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 bg-white rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="default">Recommended</option>
            <option value="low-high">Price: Low → High</option>
            <option value="high-low">Price: High → Low</option>
          </select>
        </div>
      )}

      {/* EMPTY */}
      {!isBusy && loadedCount === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-5">
            Your wishlist is empty.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-black text-white px-7 py-3 rounded-full hover:bg-black/90 transition"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          {/* GRID */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
          >
            <AnimatePresence>
              {visibleItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* ✅ hide wishlist icon */}
                  <ProductCard product={item} hideWishlistIcon />

                  {/* ACTIONS */}
                  <div className="p-3 pt-2 flex gap-2 items-center">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex-1 bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-black/90 transition"
                    >
                      <ShoppingCart className="inline w-4 h-4 mr-2" />
                      Move
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 hover:border-black hover:bg-gray-50 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-gray-700 group-hover:text-black transition" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* LOAD MORE */}
          {visibleItems.length < filtered.length && (
            <p className="text-center text-sm text-gray-500 py-8">
              Loading more...
            </p>
          )}
        </>
      )}
    </section>
  );
}
